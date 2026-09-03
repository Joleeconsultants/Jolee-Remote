import { describe, expect, it } from "vitest";
import {
  clipboardTextFromFrame,
  cursorFromFrame,
  fileFromFrame,
  parseJsonFrameObject,
  statsFromFrame,
} from "../src/json-frame";

function utf8(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

describe("json frames (clipboard + cursor)", () => {
  it("parses clipboard text and image the same way as the viewer", () => {
    expect(clipboardTextFromFrame(utf8('{"t":"clipboard","text":"hi"}'))).toEqual({
      kind: "text",
      text: "hi",
    });
    expect(
      clipboardTextFromFrame(
        utf8('{"type":"clipboard","mime":"image/png","data":"QQ=="}'),
      ),
    ).toEqual({ kind: "image", mime: "image/png", data: "QQ==" });
    expect(clipboardTextFromFrame(utf8("\n  {\"t\":\"clipboard\",\"text\":\"x\"}"))).toEqual({
      kind: "text",
      text: "x",
    });
  });

  it("parses cursor JSON frames without a new envelope kind", () => {
    expect(
      cursorFromFrame(
        utf8('{"t":"cursor","visible":true,"hx":2,"hy":3,"mime":"image/png","data":"QQ=="}'),
      ),
    ).toEqual({
      visible: true,
      hx: 2,
      hy: 3,
      mime: "image/png",
      data: "QQ==",
    });
    expect(cursorFromFrame(utf8('{"t":"cursor","visible":false}'))).toEqual({
      visible: false,
      hx: 0,
      hy: 0,
      mime: "",
      data: "",
    });
    expect(cursorFromFrame(utf8('{"type":"cursor"}'))).toEqual({
      visible: true,
      hx: 0,
      hy: 0,
      mime: "",
      data: "",
    });
  });

  it("ignores pixels and other JSON", () => {
    expect(parseJsonFrameObject(new Uint8Array([0x89, 0x50, 0x4e, 0x47]))).toBeNull();
    expect(cursorFromFrame(utf8('{"t":"clipboard","text":"no"}'))).toBeNull();
    expect(clipboardTextFromFrame(utf8('{"t":"cursor","visible":true}'))).toBeNull();
    expect(cursorFromFrame(utf8("placeholder-frame-1"))).toBeNull();
  });

  it("parses file downloads and optional agent stats", () => {
    expect(fileFromFrame(utf8('{"t":"file","name":"report.txt","mime":"text/plain","data":"aGk="}'))).toEqual({
      name: "report.txt",
      mime: "text/plain",
      data: "aGk=",
    });
    expect(statsFromFrame(utf8('{"t":"stats","fps":30,"system":{"cpu_percent":12}}'))).toEqual({
      t: "stats",
      fps: 30,
      system: { cpu_percent: 12 },
    });
  });
});
