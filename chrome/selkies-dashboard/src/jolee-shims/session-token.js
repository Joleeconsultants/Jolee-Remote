/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Original Jolee session-token helpers for dashboard compiles. Not selkies-web-core.
 * The hop uses query-param join tokens, not Selkies /api/ bearer cookies.
 * @module
 */

function pageToken() {
  if (typeof window === "undefined" || !window.location) return "";
  try {
    return new URLSearchParams(window.location.search).get("token") || "";
  } catch {
    return "";
  }
}

export function sessionAuthHeaders(headers) {
  const base = Object.assign({}, headers || {});
  const token = pageToken();
  if (token && !("Authorization" in base)) {
    base.Authorization = `Bearer ${token}`;
  }
  return base;
}

export function withSessionToken(url) {
  const token = pageToken();
  if (!token) return url;
  try {
    const resolved = new URL(url, window.location.href);
    resolved.searchParams.set("token", token);
    return resolved.href;
  } catch {
    return url;
  }
}
