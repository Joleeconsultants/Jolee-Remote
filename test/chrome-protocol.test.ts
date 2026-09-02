import { describe, expect, it } from "vitest";
import {
  classifyDashboardMessage,
  statusMessage,
} from "../src/chrome-protocol";

describe("dashboard postMessage protocol", () => {
  it("maps connect/disconnect and chrome actions", () => {
    expect(classifyDashboardMessage({ type: "connect", session: "s", token: "t" })).toBe("connect");
    expect(classifyDashboardMessage({ type: "disconnect" })).toBe("disconnect");
    expect(classifyDashboardMessage({ type: "requestFullscreen" })).toBe("requestFullscreen");
    expect(classifyDashboardMessage({ type: "setScaleLocally", value: true })).toBe("setScaleLocally");
    expect(classifyDashboardMessage({ type: "showVirtualKeyboard" })).toBe("showVirtualKeyboard");
    expect(classifyDashboardMessage({ type: "clipboardUpdateFromUI", text: "hi" })).toBe("clipboardUpdateFromUI");
    expect(classifyDashboardMessage({ type: "setAntiAliasing", value: false })).toBe("setAntiAliasing");
    expect(classifyDashboardMessage({ type: "setUseBrowserCursors", value: true })).toBe("setUseBrowserCursors");
  });

  it("no-ops Selkies-only pipeline toggles", () => {
    expect(classifyDashboardMessage({ type: "pipelineControl", pipeline: "video", enabled: false })).toBe("noop");
    expect(classifyDashboardMessage({ type: "settings", settings: { framerate: 60 } })).toBe("noop");
    expect(classifyDashboardMessage({ type: "command", value: "ls" })).toBe("noop");
    expect(classifyDashboardMessage({ type: "setManualResolution", width: 1920, height: 1080 })).toBe("noop");
    expect(classifyDashboardMessage({ type: "resetResolutionToWindow" })).toBe("noop");
  });

  it("ignores malformed payloads", () => {
    expect(classifyDashboardMessage(null)).toBe("ignore");
    expect(classifyDashboardMessage("connect")).toBe("ignore");
    expect(classifyDashboardMessage({ type: 1 })).toBe("ignore");
  });

  it("posts hop status names the viewer uses", () => {
    expect(statusMessage("waiting")).toEqual({ type: "status", state: "waiting" });
    expect(statusMessage("paired")).toEqual({ type: "status", state: "paired" });
    expect(statusMessage("expired")).toEqual({ type: "status", state: "expired" });
    expect(statusMessage("disconnected")).toEqual({ type: "status", state: "disconnected" });
  });
});
