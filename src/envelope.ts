export const ENVELOPE_VERSION = 1;
export const KIND_FRAME = 0x01;
export const KIND_INPUT = 0x02;

/**
 * Hop cap for a single binary envelope (JPEG/WebP stills at low fps).
 * Cloudflare Durable Objects accept received WebSocket messages up to 32 MiB
 * (https://developers.cloudflare.com/durable-objects/platform/limits/).
 * This hop drops anything larger than 1 MiB.
 */
export const MAX_ENVELOPE_BYTES = 1024 * 1024;

export type EnvelopeKind = "frame" | "input";

export type Envelope = {
  version: number;
  kind: EnvelopeKind;
  payload: Uint8Array;
};

export function encodeEnvelope(
  kind: EnvelopeKind,
  payload: Uint8Array | string,
): Uint8Array {
  const body =
    typeof payload === "string" ? new TextEncoder().encode(payload) : payload;
  const out = new Uint8Array(2 + body.byteLength);
  out[0] = ENVELOPE_VERSION;
  out[1] = kind === "frame" ? KIND_FRAME : KIND_INPUT;
  out.set(body, 2);
  return out;
}

export function decodeEnvelope(
  data: ArrayBuffer | ArrayBufferView,
): Envelope | null {
  const bytes =
    data instanceof ArrayBuffer
      ? new Uint8Array(data)
      : new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  if (bytes.byteLength < 2) return null;
  if (bytes[0] !== ENVELOPE_VERSION) return null;
  const kindByte = bytes[1];
  if (kindByte !== KIND_FRAME && kindByte !== KIND_INPUT) return null;
  return {
    version: bytes[0],
    kind: kindByte === KIND_FRAME ? "frame" : "input",
    payload: bytes.subarray(2),
  };
}

export function envelopeByteLength(
  data: ArrayBuffer | ArrayBufferView,
): number {
  return ArrayBuffer.isView(data) ? data.byteLength : data.byteLength;
}
