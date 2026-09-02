#!/usr/bin/env node
/**
 * Tiny sample agent: outbound WebSocket client to a session Durable Object.
 * Proves the pipe and the cursor overlay visual. Not a remote-desktop product
 * and not a real device agent. The consumer applies pointer/key/wheel to the
 * OS (Windows SendInput is out of this repo); this sample only logs them.
 *
 * Usage: node examples/agent.mjs <sessionId> <agentToken> [wsBase]
 * wsBase is the hop Worker origin (not the HTML host). Defaults to ws://127.0.0.1:8787
 * Example: node examples/agent.mjs <sessionId> <agentToken> wss://hop.example.com
 */

const sessionId = process.argv[2];
const token = process.argv[3];
const base = process.argv[4] || "ws://127.0.0.1:8787";

if (!sessionId || !token) {
  console.error("usage: node examples/agent.mjs <sessionId> <agentToken> [wss://hop.example.com]");
  process.exit(1);
}

// Same path as agentJoinPath in src/joins.ts (not imported: this file is a standalone mjs).
const url = base.replace(/\/$/, "") + "/sessions/" + sessionId + "/agent?token=" + encodeURIComponent(token);

// 1x1 PNG so the viewer can paint with createImageBitmap/drawImage.
const PNG = Uint8Array.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
  0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
  0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xde, 0x00, 0x00, 0x00,
  0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0xd7, 0x63, 0xf8, 0xcf, 0xc0, 0x00,
  0x00, 0x00, 0x03, 0x00, 0x01, 0x00, 0x05, 0xfe, 0x02, 0xfe, 0x00, 0x00,
  0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
]);

// Tiny generated arrow PNG (not a Selkies asset). Viewer swaps the overlay to this bitmap.
const CURSOR_PNG_B64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAwAAAAUCAYAAAC58NwRAAAAXElEQVR4nJ3RMQ4AIAgDQP//aYyDBqHQahM2LqCM8RFzpYGVF2Q7KjIfBVkMQwkwBEGHSlChFiBEQUQScIj+Uqz70tXe6dG7Aa2QQCwGyrt0a0GgTjlrqRMOQs0TH2JvnzL98JcAAAAASUVORK5CYII=";

function envelope(kind, payload) {
  const out = new Uint8Array(2 + payload.length);
  out[0] = 1;
  out[1] = kind;
  out.set(payload, 2);
  return out;
}

const ws = new WebSocket(url);
let n = 0;
let timer;
let sentCursor = false;

function sendCursorShape() {
  if (sentCursor || ws.readyState !== 1) return;
  sentCursor = true;
  const payload = new TextEncoder().encode(
    JSON.stringify({
      t: "cursor",
      visible: true,
      hx: 1,
      hy: 1,
      mime: "image/png",
      data: CURSOR_PNG_B64,
    }),
  );
  ws.send(envelope(0x01, payload));
}

ws.addEventListener("open", () => {
  console.log("agent connected", url);
  timer = setInterval(() => {
    // Sample only sends kind 0x01 frames. Kind 0x03 audio is a real hop; this agent does not send it.
    sendCursorShape();
    const payload = n % 2 === 0 ? PNG : new TextEncoder().encode("placeholder-frame-" + n);
    ws.send(envelope(0x01, payload));
    n += 1;
  }, 1000);
});

ws.addEventListener("message", (event) => {
  if (typeof event.data === "string") {
    console.log("control", event.data);
    try {
      const msg = JSON.parse(event.data);
      if (msg.type === "status" && msg.state === "paired") sendCursorShape();
    } catch {
      // ignore non-JSON control
    }
    return;
  }
  Promise.resolve(event.data).then(async (data) => {
    const buf = data instanceof ArrayBuffer ? new Uint8Array(data) : new Uint8Array(await data.arrayBuffer?.() ?? data);
    const kind = buf[1];
    const payload = buf.subarray(2);
    const text = new TextDecoder().decode(payload);
    console.log("input kind=" + kind + " bytes=" + payload.length + " " + text);
  });
});

ws.addEventListener("close", (event) => {
  clearInterval(timer);
  console.log("closed", event.code, event.reason);
});

ws.addEventListener("error", () => {
  console.error("websocket error");
});
