#!/usr/bin/env node
/**
 * Temporary live smoke agent for hop UI (frames, cursor, audio, print, clipboard).
 * Usage: node examples/smoke-ui.mjs <sessionId> <agentToken> [wsBase]
 */
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
if (typeof globalThis.WebSocket === "undefined") {
  const { WebSocket: Ws } = require("ws");
  globalThis.WebSocket = Ws;
}

const sessionId = process.argv[2];
const token = process.argv[3];
const base = process.argv[4] || "ws://127.0.0.1:8788";

if (!sessionId || !token) {
  console.error("usage: node examples/smoke-ui.mjs <sessionId> <agentToken> [ws://127.0.0.1:8788]");
  process.exit(1);
}

const url =
  base.replace(/\/$/, "") +
  "/sessions/" +
  sessionId +
  "/agent?token=" +
  encodeURIComponent(token);

// 1x1 PNG
const PNG = Uint8Array.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
  0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
  0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xde, 0x00, 0x00, 0x00,
  0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0xd7, 0x63, 0xf8, 0xcf, 0xc0, 0x00,
  0x00, 0x00, 0x03, 0x00, 0x01, 0x00, 0x05, 0xfe, 0x02, 0xfe, 0x00, 0x00,
  0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
]);

const CURSOR_PNG_B64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAwAAAAUCAYAAAC58NwRAAAAXElEQVR4nJ3RMQ4AIAgDQP//aYyDBqHQahM2LqCM8RFzpYGVF2Q7KjIfBVkMQwkwBEGHSlChFiBEQUQScIj+Uqz70tXe6dG7Aa2QQCwGyrt0a0GgTjlrqRMOQs0TH2JvnzL98JcAAAAASUVORK5CYII=";

// Minimal valid WAV: 8-bit mono 8000Hz, ~0.1s silence + soft tone header
function tinyWav() {
  const sampleRate = 8000;
  const samples = 800; // 0.1s
  const dataSize = samples;
  const buf = new ArrayBuffer(44 + dataSize);
  const v = new DataView(buf);
  const u8 = new Uint8Array(buf);
  const w = (o, s) => {
    for (let i = 0; i < s.length; i++) u8[o + i] = s.charCodeAt(i);
  };
  w(0, "RIFF");
  v.setUint32(4, 36 + dataSize, true);
  w(8, "WAVE");
  w(12, "fmt ");
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true); // PCM
  v.setUint16(22, 1, true); // mono
  v.setUint32(24, sampleRate, true);
  v.setUint32(28, sampleRate, true);
  v.setUint16(32, 1, true);
  v.setUint16(34, 8, true);
  w(36, "data");
  v.setUint32(40, dataSize, true);
  for (let i = 0; i < samples; i++) {
    // soft 440Hz-ish square-ish for audibility if unmuted
    const t = i / sampleRate;
    u8[44 + i] = 128 + Math.floor(40 * Math.sin(2 * Math.PI * 440 * t));
  }
  return u8;
}

// Tiny valid PDF
const PDF = new TextEncoder().encode(
  "%PDF-1.1\n" +
    "1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj\n" +
    "2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj\n" +
    "3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] /Contents 4 0 R /Resources<< /Font<< /F1 5 0 R >> >> >>endobj\n" +
    "4 0 obj<< /Length 44 >>stream\n" +
    "BT /F1 24 Tf 40 100 Td (smoke) Tj ET\n" +
    "endstream\nendobj\n" +
    "5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj\n" +
    "xref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000266 00000 n \n0000000361 00000 n \n" +
    "trailer<< /Size 6 /Root 1 0 R >>\nstartxref\n439\n%%EOF\n",
);

function b64(bytes) {
  return Buffer.from(bytes).toString("base64");
}

function envelope(kind, payload) {
  const out = new Uint8Array(2 + payload.length);
  out[0] = 1;
  out[1] = kind;
  out.set(payload, 2);
  return out;
}

function jsonFrame(obj) {
  return envelope(0x01, new TextEncoder().encode(JSON.stringify(obj)));
}

const ws = new WebSocket(url);
let n = 0;
let timer;
let burstSent = false;

function sendBurst() {
  if (burstSent || ws.readyState !== 1) return;
  burstSent = true;
  console.log("smoke: sending PNG + cursor + audio + print + clipboard");

  ws.send(envelope(0x01, PNG));

  ws.send(
    jsonFrame({
      t: "cursor",
      visible: true,
      hx: 1,
      hy: 1,
      mime: "image/png",
      data: CURSOR_PNG_B64,
    }),
  );

  ws.send(envelope(0x03, tinyWav()));

  ws.send(
    jsonFrame({
      t: "print",
      mime: "application/pdf",
      name: "smoke.pdf",
      data: b64(PDF),
    }),
  );

  ws.send(jsonFrame({ t: "clipboard", text: "smoke-clipboard-text" }));

  ws.send(
    jsonFrame({
      t: "stats",
      cpu: 1.2,
      fps: 3,
      note: "smoke-stats",
    }),
  );
}

ws.addEventListener("open", () => {
  console.log("smoke agent connected", url);
  // Send burst immediately; also on paired status
  sendBurst();
  timer = setInterval(() => {
    sendBurst();
    ws.send(envelope(0x01, PNG));
    n += 1;
    if (n % 5 === 0) console.log("smoke: keepalive frames", n);
  }, 2000);
});

ws.addEventListener("message", (event) => {
  if (typeof event.data === "string") {
    console.log("control", event.data);
    try {
      const msg = JSON.parse(event.data);
      if (msg.type === "status" && msg.state === "paired") sendBurst();
    } catch {
      /* ignore */
    }
    return;
  }
  Promise.resolve(event.data).then(async (data) => {
    const buf =
      data instanceof ArrayBuffer
        ? new Uint8Array(data)
        : new Uint8Array(await data.arrayBuffer?.() ?? data);
    const kind = buf[1];
    const payload = buf.subarray(2);
    const text = new TextDecoder().decode(payload);
    console.log("input kind=" + kind + " bytes=" + payload.length + " " + text.slice(0, 200));
  });
});

ws.addEventListener("close", (event) => {
  clearInterval(timer);
  console.log("closed", event.code, event.reason);
});

ws.addEventListener("error", () => {
  console.error("websocket error");
});
