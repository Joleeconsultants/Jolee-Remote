interface Env {
  Session: DurableObjectNamespace<import("./src/session").Session>;
  ASSETS?: Fetcher;
}

declare namespace Cloudflare {
  interface Env {
    Session: DurableObjectNamespace<import("./src/session").Session>;
    ASSETS?: Fetcher;
  }
}
