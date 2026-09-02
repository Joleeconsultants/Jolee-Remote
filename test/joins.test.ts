import { describe, expect, it } from "vitest";
import {
  agentJoinPath,
  browserJoinPath,
  partyBrowserPath,
  viewerHash,
  viewerPath,
  viewerQuery,
} from "../src/joins";

describe("join URL builders", () => {
  it("builds browser and agent session join paths", () => {
    expect(browserJoinPath("sid", "btok")).toBe(
      "/sessions/sid/browser?token=btok",
    );
    expect(agentJoinPath("sid", "atok")).toBe("/sessions/sid/agent?token=atok");
  });

  it("builds the PartySocket browser path", () => {
    expect(partyBrowserPath("sid", "btok")).toBe(
      "/parties/session/sid?role=browser&token=btok",
    );
  });

  it("puts the browser token in the fragment, not search", () => {
    expect(viewerQuery("sid")).toBe("session=sid");
    expect(viewerHash("btok")).toBe("token=btok");
    expect(viewerPath("sid", "btok")).toBe("/?session=sid#token=btok");
    expect(viewerQuery("sid", "hop.example")).toBe(
      "session=sid&hop=hop.example",
    );
    expect(viewerPath("sid", "btok", "hop.example")).toBe(
      "/?session=sid&hop=hop.example#token=btok",
    );
    expect(viewerPath("sid", "btok", "hop.example")).not.toMatch(/[?&]token=/);
  });

  it("encodes tokens in query strings and viewer hash", () => {
    expect(browserJoinPath("sid", "a+b/c")).toBe(
      "/sessions/sid/browser?token=a%2Bb%2Fc",
    );
    expect(agentJoinPath("sid", "a+b/c")).toBe(
      "/sessions/sid/agent?token=a%2Bb%2Fc",
    );
    expect(partyBrowserPath("sid", "a+b/c")).toBe(
      "/parties/session/sid?role=browser&token=a%2Bb%2Fc",
    );
    expect(viewerHash("a+b/c")).toBe("token=a%2Bb%2Fc");
    expect(viewerPath("sid", "a+b/c", "hop.example")).toBe(
      "/?session=sid&hop=hop.example#token=a%2Bb%2Fc",
    );
  });
});
