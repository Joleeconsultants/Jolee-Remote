interface Env {
  Session: DurableObjectNamespace<import("./src/session").Session>;
  ASSETS?: Fetcher;
  MINT_SECRET?: string;
}

declare namespace Cloudflare {
  interface Env {
    Session: DurableObjectNamespace<import("./src/session").Session>;
    ASSETS?: Fetcher;
    MINT_SECRET?: string;
  }
}
