import { describe, expect, it } from "vitest";
import {
  encodeClipboardImageFrame,
  encodeClipboardTextFrame,
  encodeCursorFrame,
  encodeFileFrame,
  encodeJsonFrame,
  encodePrintFrames,
  encodeStatsFrame,
  PRINT_SAFE_RAW_SLICE,
} from "../src/agent-frames";
import {
  clipboardTextFromFrame,
  cursorFromFrame,
  fileFromFrame,
  printFromFrame,
  statsFromFrame,
} from "../src/json-frame";
import { encodeEnvelope, MAX_ENVELOPE_BYTES } from "../src/envelope";

function utf8Decode(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

function base64ToBytes(b64: string): Uint8Array {
  const Buf = (globalThis as { Buffer?: typeof Buffer }).Buffer;
  if (Buf) return new Uint8Array(Buf.from(b64, "base64"));
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

describe("agent frame builders", () => {
  it("round-trips clipboard text and image with json-frame parsers", () => {
    const text = encodeClipboardTextFrame("hello");
    expect(clipboardTextFromFrame(text)).toEqual({
      kind: "text",
      text: "hello",
    });
    const image = encodeClipboardImageFrame("image/png", "QQ==");
    expect(clipboardTextFromFrame(image)).toEqual({
      kind: "image",
      mime: "image/png",
      data: "QQ==",
    });
  });

  it("round-trips cursor, file, and stats", () => {
    const cursor = encodeCursorFrame({
      visible: true,
      hx: 2,
      hy: 3,
      mime: "image/png",
      data: "QQ==",
    });
    expect(cursorFromFrame(cursor)).toEqual({
      visible: true,
      hx: 2,
      hy: 3,
      mime: "image/png",
      data: "QQ==",
    });
    expect(cursorFromFrame(encodeCursorFrame({ visible: false }))).toEqual({
      visible: false,
      hx: 0,
      hy: 0,
      mime: "",
      data: "",
    });

    const file = encodeFileFrame("a.txt", "text/plain", "aGk=");
    expect(fileFromFrame(file)).toEqual({
      name: "a.txt",
      mime: "text/plain",
      data: "aGk=",
    });

    const stats = encodeStatsFrame({ fps: 30, system_stats: { cpu_percent: 1 } });
    expect(statsFromFrame(stats)).toMatchObject({
      t: "stats",
      fps: 30,
      system_stats: { cpu_percent: 1 },
    });
  });

  it("encodeJsonFrame uses t field", () => {
    const bytes = encodeJsonFrame({ t: "cursor", visible: false });
    expect(JSON.parse(utf8Decode(bytes))).toEqual({
      t: "cursor",
      visible: false,
    });
  });

  it("chunks print frames under MAX_ENVELOPE_BYTES and reassembles", () => {
    const raw = new Uint8Array(50);
    for (let i = 0; i < raw.length; i++) raw[i] = i & 0xff;

    const frames = encodePrintFrames(raw, {
      job: "job-1",
      name: "doc.pdf",
      mime: "application/pdf",
      maxRawBytes: 21,
    });
    expect(frames.length).toBeGreaterThan(1);

    const parts: { part: number; parts: number; data: string }[] = [];
    for (const frame of frames) {
      const env = encodeEnvelope("frame", frame);
      expect(env.byteLength).toBeLessThanOrEqual(MAX_ENVELOPE_BYTES);
      const parsed = printFromFrame(frame);
      expect(parsed).not.toBeNull();
      expect(parsed!.job).toBe("job-1");
      expect(parsed!.name).toBe("doc.pdf");
      expect(parsed!.mime).toBe("application/pdf");
      parts.push({
        part: parsed!.part,
        parts: parsed!.parts,
        data: parsed!.data,
      });
    }

    expect(parts[0].parts).toBe(frames.length);
    parts.sort((a, b) => a.part - b.part);
    const merged = new Uint8Array(
      parts.reduce((n, p) => n + base64ToBytes(p.data).byteLength, 0),
    );
    let offset = 0;
    for (const p of parts) {
      const chunk = base64ToBytes(p.data);
      merged.set(chunk, offset);
      offset += chunk.byteLength;
    }
    expect(Array.from(merged)).toEqual(Array.from(raw));
  });

  it("single-shot print for small payloads", () => {
    const raw = new Uint8Array([1, 2, 3]);
    const frames = encodePrintFrames(raw, { job: "tiny" });
    expect(frames).toHaveLength(1);
    const parsed = printFromFrame(frames[0]);
    expect(parsed).toMatchObject({
      job: "tiny",
      part: 0,
      parts: 1,
      mime: "application/pdf",
      name: "print.pdf",
    });
    expect(Array.from(base64ToBytes(parsed!.data))).toEqual([1, 2, 3]);
  });

  it("keeps default print slice under safe / envelope budgets", () => {
    expect(PRINT_SAFE_RAW_SLICE).toBe(600 * 1024);
    const big = new Uint8Array(PRINT_SAFE_RAW_SLICE + 100);
    const frames = encodePrintFrames(big, { job: "big" });
    expect(frames.length).toBeGreaterThanOrEqual(2);
    for (const frame of frames) {
      expect(encodeEnvelope("frame", frame).byteLength).toBeLessThanOrEqual(
        MAX_ENVELOPE_BYTES,
      );
    }
  });
});
