/**
 * Viewer JSON-frame payloads on envelope kind 0x01 (same pattern as clipboard).
 * The hop forwards these opaquely; it does not parse them. Keep the copies in
 * public/viewer.html in sync. Do not add envelope kind 0x04 for cursor.
 */

function skipSpace(payload: Uint8Array): number {
  let i = 0;
  while (
    i < payload.length &&
    (payload[i] === 0x20 ||
      payload[i] === 0x09 ||
      payload[i] === 0x0a ||
      payload[i] === 0x0d)
  ) {
    i++;
  }
  return i;
}

export function parseJsonFrameObject(
  payload: Uint8Array,
): Record<string, unknown> | null {
  try {
    const i = skipSpace(payload);
    if (i >= payload.length || payload[i] !== 0x7b) return null;
    const obj = JSON.parse(new TextDecoder().decode(payload)) as unknown;
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) return null;
    return obj as Record<string, unknown>;
  } catch {
    return null;
  }
}

export type ClipboardFrame =
  | { kind: "text"; text: string }
  | { kind: "image"; mime: string; data: string };

export function clipboardTextFromFrame(
  payload: Uint8Array,
): ClipboardFrame | null {
  const obj = parseJsonFrameObject(payload);
  if (!obj) return null;
  if (!(obj.t === "clipboard" || obj.type === "clipboard")) return null;
  if (
    typeof obj.mime === "string" &&
    obj.mime.indexOf("image/") === 0 &&
    typeof obj.data === "string"
  ) {
    return { kind: "image", mime: obj.mime, data: obj.data };
  }
  if (typeof obj.text === "string") return { kind: "text", text: obj.text };
  return null;
}

export type CursorFrame = {
  visible: boolean;
  hx: number;
  hy: number;
  mime: string;
  data: string;
};

export function cursorFromFrame(payload: Uint8Array): CursorFrame | null {
  const obj = parseJsonFrameObject(payload);
  if (!obj) return null;
  if (!(obj.t === "cursor" || obj.type === "cursor")) return null;
  const hx = typeof obj.hx === "number" && Number.isFinite(obj.hx) ? obj.hx : 0;
  const hy = typeof obj.hy === "number" && Number.isFinite(obj.hy) ? obj.hy : 0;
  const mime = typeof obj.mime === "string" ? obj.mime : "";
  const data = typeof obj.data === "string" ? obj.data : "";
  return { visible: obj.visible !== false, hx, hy, mime, data };
}

export type FileFrame = { name: string; mime: string; data: string };

export function fileFromFrame(payload: Uint8Array): FileFrame | null {
  const obj = parseJsonFrameObject(payload);
  if (!obj || !(obj.t === "file" || obj.type === "file")) return null;
  if (typeof obj.name !== "string" || typeof obj.data !== "string") return null;
  return {
    name: obj.name,
    mime: typeof obj.mime === "string" ? obj.mime : "application/octet-stream",
    data: obj.data,
  };
}

export function statsFromFrame(
  payload: Uint8Array,
): Record<string, unknown> | null {
  const obj = parseJsonFrameObject(payload);
  if (!obj || !(obj.t === "stats" || obj.type === "stats")) return null;
  return obj;
}
