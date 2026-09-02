/**
 * Join URL builders for hop consumers.
 *
 * Browser HTML join is Selkies chrome: `viewerPath` ->
 * `/?session=<id>&hop=<worker-host>#token=<browserToken>`.
 * That is POST /sessions `joins.browser` (a path on the hop Worker).
 * Token lives in the fragment so referrers and Worker logs do not keep it;
 * `?token=` remains a fallback the page still reads.
 * `/viewer.html` is the canvas hole the chrome iframes.
 *
 * `browserJoinPath` / `agentJoinPath` are WebSocket routes (query token fallback).
 * PartySocket `partyBrowserPath` is how the canvas hole connects, not a product URL.
 */

export function browserJoinPath(sessionId: string, token: string): string {
  return "/sessions/" + sessionId + "/browser?token=" + encodeURIComponent(token);
}

export function agentJoinPath(sessionId: string, token: string): string {
  return "/sessions/" + sessionId + "/agent?token=" + encodeURIComponent(token);
}

/** PartySocket path the canvas-hole viewer uses for the browser role. */
export function partyBrowserPath(sessionId: string, token: string): string {
  return (
    "/parties/session/" +
    sessionId +
    "?role=browser&token=" +
    encodeURIComponent(token)
  );
}

/** Search string for Selkies chrome: `session` + optional Worker `hop`. Token is not in search. */
export function viewerQuery(sessionId: string, hop?: string): string {
  const params = new URLSearchParams();
  params.set("session", sessionId);
  if (hop) params.set("hop", hop);
  return params.toString();
}

/** Fragment for the browser token (`#token=`). Query `?token=` is fallback only. */
export function viewerHash(token: string): string {
  return "token=" + encodeURIComponent(token);
}

/** Browser join path on the hop Worker: Selkies chrome with token in the fragment. */
export function viewerPath(
  sessionId: string,
  token: string,
  hop?: string,
): string {
  return "/?" + viewerQuery(sessionId, hop) + "#" + viewerHash(token);
}
