export const ENVELOPE_VERSION = 1;
export const KIND_FRAME = 0x01;
export const KIND_INPUT = 0x02;
export const KIND_AUDIO = 0x03;

/**
 * Hop cap for a single binary envelope (JPEG/WebP stills at low fps).
 * Cloudflare Durable Objects accept received WebSocket messages up to 32 MiB
 * (https://developers.cloudflare.com/durable-objects/platform/limits/).
 * This hop drops anything larger than 1 MiB.
 */
export const MAX_ENVELOPE_BYTES = 1024 * 1024;

export type EnvelopeKind = "frame" | "input" | "audio";

export type Envelope = {
  version: number;
  kind: EnvelopeKind;
  payload: Uint8Array;
};

const KIND_TO_BYTE: Record<EnvelopeKind, number> = {
  frame: KIND_FRAME,
  input: KIND_INPUT,
  audio: KIND_AUDIO,
};

function kindFromByte(kindByte: number): EnvelopeKind | null {
  if (kindByte === KIND_FRAME) return "frame";
  if (kindByte === KIND_INPUT) return "input";
  if (kindByte === KIND_AUDIO) return "audio";
  return null;
}

export function encodeEnvelope(
  kind: EnvelopeKind,
  payload: Uint8Array | string,
): Uint8Array {
  const body =
    typeof payload === "string" ? new TextEncoder().encode(payload) : payload;
  const out = new Uint8Array(2 + body.byteLength);
  out[0] = ENVELOPE_VERSION;
  out[1] = KIND_TO_BYTE[kind];
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
  const kind = kindFromByte(bytes[1]);
  if (!kind) return null;
  return {
    version: bytes[0],
    kind,
    payload: bytes.subarray(2),
  };
}

export function envelopeByteLength(
  data: ArrayBuffer | ArrayBufferView,
): number {
  return ArrayBuffer.isView(data) ? data.byteLength : data.byteLength;
}
