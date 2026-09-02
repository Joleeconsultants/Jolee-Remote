/**
 * Join URL builders for hop consumers.
 *
 * Product browser join is Selkies chrome: `viewerPath` → `/?session=&token=&hop=`.
 * That is POST /sessions `joins.browser`. `/viewer.html` is the canvas hole the
 * chrome iframes — not a second product join.
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

/** Query string for Selkies chrome `/?session=&token=&hop=` (token is browserToken). */
export function viewerQuery(
  sessionId: string,
  token: string,
  hop?: string,
): string {
  const params = new URLSearchParams();
  params.set("session", sessionId);
  params.set("token", token);
  if (hop) params.set("hop", hop);
  return params.toString();
}

/** Product browser join URL: opens Selkies chrome over the canvas hole. */
export function viewerPath(
  sessionId: string,
  token: string,
  hop?: string,
): string {
  return "/?" + viewerQuery(sessionId, token, hop);
}
