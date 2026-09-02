import { describe, expect, it } from "vitest";
import {
  agentJoinPath,
  browserJoinPath,
  partyBrowserPath,
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

  it("builds viewer query and path; hop is optional", () => {
    expect(viewerQuery("sid", "btok")).toBe("session=sid&token=btok");
    expect(viewerPath("sid", "btok")).toBe("/?session=sid&token=btok");
    expect(viewerQuery("sid", "btok", "hop.example")).toBe(
      "session=sid&token=btok&hop=hop.example",
    );
    expect(viewerPath("sid", "btok", "hop.example")).toBe(
      "/?session=sid&token=btok&hop=hop.example",
    );
  });

  it("encodes tokens in query strings", () => {
    expect(browserJoinPath("sid", "a+b/c")).toBe(
      "/sessions/sid/browser?token=a%2Bb%2Fc",
    );
    expect(agentJoinPath("sid", "a+b/c")).toBe(
      "/sessions/sid/agent?token=a%2Bb%2Fc",
    );
    expect(partyBrowserPath("sid", "a+b/c")).toBe(
      "/parties/session/sid?role=browser&token=a%2Bb%2Fc",
    );
    expect(viewerQuery("sid", "a+b/c")).toBe("session=sid&token=a%2Bb%2Fc");
  });
});
