import { describe, expect, it } from "vitest";
import {
  KIND_AUDIO,
  KIND_FRAME,
  KIND_INPUT,
  MAX_ENVELOPE_BYTES,
  decodeEnvelope,
  encodeEnvelope,
} from "../src/envelope";

describe("envelope", () => {
  it("encodes and decodes frame, input, and audio", () => {
    const frame = encodeEnvelope("frame", new Uint8Array([1, 2]));
    expect(frame[1]).toBe(KIND_FRAME);
    expect(decodeEnvelope(frame)?.kind).toBe("frame");
    expect(Array.from(decodeEnvelope(frame)?.payload ?? [])).toEqual([1, 2]);

    const input = encodeEnvelope("input", '{"t":"pointer"}');
    expect(input[1]).toBe(KIND_INPUT);
    expect(decodeEnvelope(input)?.kind).toBe("input");

    const audio = encodeEnvelope("audio", new Uint8Array([9, 8, 7]));
    expect(audio[1]).toBe(KIND_AUDIO);
    expect(audio[1]).toBe(0x03);
    const decoded = decodeEnvelope(audio);
    expect(decoded?.kind).toBe("audio");
    expect(Array.from(decoded?.payload ?? [])).toEqual([9, 8, 7]);
  });

  it("drops unknown kinds and short buffers", () => {
    expect(decodeEnvelope(new Uint8Array([1]))).toBeNull();
    expect(decodeEnvelope(new Uint8Array([1, 0x99, 1]))).toBeNull();
    expect(decodeEnvelope(new Uint8Array([2, 0x01]))).toBeNull();
  });

  it("keeps the 1 MiB hop cap", () => {
    expect(MAX_ENVELOPE_BYTES).toBe(1024 * 1024);
  });
});
