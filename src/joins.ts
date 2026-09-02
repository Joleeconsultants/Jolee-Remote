/**
 * Join URL builders for hop consumers (outbound agent, viewer, portal).
 * Relative paths match POST /sessions `joins` and the Worker routes.
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

/** Query string for `/?session=&token=&hop=` (token is browserToken). */
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

export function viewerPath(
  sessionId: string,
  token: string,
  hop?: string,
): string {
  return "/?" + viewerQuery(sessionId, token, hop);
}
