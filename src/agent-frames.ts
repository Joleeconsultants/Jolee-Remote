/**
 * Build agent → browser JSON frame payloads (envelope kind 0x01).
 * Keep `t` field names aligned with parsers in json-frame.ts / the viewer.
 */

import { MAX_ENVELOPE_BYTES } from "./envelope";

const utf8 = new TextEncoder();

/** Encode an arbitrary JSON object as UTF-8 bytes for a frame payload. */
export function encodeJsonFrame(obj: Record<string, unknown>): Uint8Array {
  return utf8.encode(JSON.stringify(obj));
}

export function encodeClipboardTextFrame(text: string): Uint8Array {
  return encodeJsonFrame({ t: "clipboard", text });
}

export function encodeClipboardImageFrame(
  mime: string,
  dataBase64: string,
): Uint8Array {
  return encodeJsonFrame({ t: "clipboard", mime, data: dataBase64 });
}

export type CursorFrameOpts = {
  visible?: boolean;
  hx?: number;
  hy?: number;
  mime?: string;
  data?: string;
};

export function encodeCursorFrame(opts: CursorFrameOpts = {}): Uint8Array {
  const out: Record<string, unknown> = { t: "cursor" };
  if (opts.visible !== undefined) out.visible = opts.visible;
  if (opts.hx !== undefined) out.hx = opts.hx;
  if (opts.hy !== undefined) out.hy = opts.hy;
  if (opts.mime !== undefined) out.mime = opts.mime;
  if (opts.data !== undefined) out.data = opts.data;
  return encodeJsonFrame(out);
}

export function encodeFileFrame(
  name: string,
  mime: string,
  dataBase64: string,
): Uint8Array {
  return encodeJsonFrame({ t: "file", name, mime, data: dataBase64 });
}

export function encodeStatsFrame(
  stats: Record<string, unknown>,
): Uint8Array {
  return encodeJsonFrame({ t: "stats", ...stats });
}

export type PrintFrameOpts = {
  job?: string;
  mime?: string;
  name?: string;
  /**
   * Max raw (pre-base64) slice size. Default: computed from
   * MAX_ENVELOPE_BYTES minus envelope header + JSON overhead, floored to
   * 3-byte base64 groups. Also capped at PRINT_SAFE_RAW_SLICE (~600 KiB).
   */
  maxRawBytes?: number;
};

const ENVELOPE_HEADER_BYTES = 2;
/** Conservative default raw slice when not overridden (~600 KiB). */
export const PRINT_SAFE_RAW_SLICE = 600 * 1024;

function bytesToBase64(bytes: Uint8Array): string {
  // Prefer Node Buffer when present (tests); else chunked btoa (Workers).
  const g = globalThis as {
    Buffer?: {
      from(data: Uint8Array): { toString(enc: string): string };
    };
    btoa?: (data: string) => string;
  };
  if (g.Buffer) return g.Buffer.from(bytes).toString("base64");
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  if (!g.btoa) {
    throw new Error("no base64 encoder available");
  }
  return g.btoa(binary);
}

/**
 * Max raw bytes that fit in one print envelope for the given metadata.
 * Accounts for 2-byte envelope header + JSON + base64 expansion.
 */
export function maxPrintRawSlice(opts: {
  job: string;
  mime: string;
  name: string;
  partDigits?: number;
  partsDigits?: number;
}): number {
  const partDigits = opts.partDigits ?? 6;
  const partsDigits = opts.partsDigits ?? 6;
  const skeleton = JSON.stringify({
    t: "print",
    job: opts.job,
    part: Number("9".repeat(partDigits)),
    parts: Number("9".repeat(partsDigits)),
    mime: opts.mime,
    name: opts.name,
    data: "",
  });
  const overhead = utf8.encode(skeleton).byteLength + ENVELOPE_HEADER_BYTES;
  const maxBase64 = MAX_ENVELOPE_BYTES - overhead;
  if (maxBase64 < 4) return 0;
  return Math.floor(maxBase64 / 4) * 3;
}

/**
 * Chunk PDF (or other) bytes into one or more `{t:"print",…}` UTF-8 JSON
 * payloads sized to fit under MAX_ENVELOPE_BYTES when enveloped.
 */
export function encodePrintFrames(
  pdfBytes: Uint8Array,
  opts: PrintFrameOpts = {},
): Uint8Array[] {
  const job = opts.job ?? "single";
  const mime = opts.mime ?? "application/pdf";
  const name = opts.name ?? "print.pdf";
  const computed = maxPrintRawSlice({ job, mime, name });
  const slice =
    opts.maxRawBytes ??
    Math.min(
      PRINT_SAFE_RAW_SLICE,
      computed > 0 ? computed : PRINT_SAFE_RAW_SLICE,
    );
  const rawChunk = Math.max(3, Math.floor(slice / 3) * 3);

  if (pdfBytes.byteLength === 0) {
    return [
      encodeJsonFrame({
        t: "print",
        job,
        part: 0,
        parts: 1,
        mime,
        name,
        data: "",
      }),
    ];
  }

  const parts = Math.ceil(pdfBytes.byteLength / rawChunk);
  const frames: Uint8Array[] = [];
  for (let part = 0; part < parts; part++) {
    const start = part * rawChunk;
    const end = Math.min(pdfBytes.byteLength, start + rawChunk);
    const sliceBytes = pdfBytes.subarray(start, end);
    frames.push(
      encodeJsonFrame({
        t: "print",
        job,
        part,
        parts,
        mime,
        name,
        data: bytesToBase64(sliceBytes),
      }),
    );
  }
  return frames;
}
