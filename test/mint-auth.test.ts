import { describe, expect, it } from "vitest";
import {
  authorizeMint,
  configuredMintSecret,
  mintSecretFromRequest,
} from "../src/mint-auth";

describe("mint secret", () => {
  it("treats unset and blank as open mint", () => {
    expect(configuredMintSecret(undefined)).toBeNull();
    expect(configuredMintSecret("")).toBeNull();
    expect(configuredMintSecret("  ")).toBeNull();
    const req = new Request("https://example.com/sessions", { method: "POST" });
    expect(authorizeMint(req, undefined)).toBe(true);
    expect(authorizeMint(req, "")).toBe(true);
  });

  it("reads Bearer and X-Mint-Secret", () => {
    const bearer = new Request("https://example.com/sessions", {
      method: "POST",
      headers: { Authorization: "Bearer s3cret" },
    });
    expect(mintSecretFromRequest(bearer)).toBe("s3cret");
    const header = new Request("https://example.com/sessions", {
      method: "POST",
      headers: { "X-Mint-Secret": "s3cret" },
    });
    expect(mintSecretFromRequest(header)).toBe("s3cret");
  });

  it("requires a matching secret when configured", () => {
    const none = new Request("https://example.com/sessions", { method: "POST" });
    expect(authorizeMint(none, "s3cret")).toBe(false);
    const wrong = new Request("https://example.com/sessions", {
      method: "POST",
      headers: { Authorization: "Bearer nope" },
    });
    expect(authorizeMint(wrong, "s3cret")).toBe(false);
    const ok = new Request("https://example.com/sessions", {
      method: "POST",
      headers: { Authorization: "Bearer s3cret" },
    });
    expect(authorizeMint(ok, "s3cret")).toBe(true);
    const x = new Request("https://example.com/sessions", {
      method: "POST",
      headers: { "X-Mint-Secret": "s3cret" },
    });
    expect(authorizeMint(x, "s3cret")).toBe(true);
  });
});
