/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Session join bar: posts connect/disconnect to the hop core iframe.
 * Original Jolee addition to the vendored dashboard.
 * @module
 */
import { useCallback, useEffect, useState } from "react";
import { postToCore } from "../jolee-bridge.js";

function params() {
  return new URLSearchParams(window.location.search);
}

function HopControls() {
  const initial = params();
  const [session, setSession] = useState(initial.get("session") || "");
  const [token, setToken] = useState(initial.get("token") || "");
  const [hop, setHop] = useState(initial.get("hop") || "");
  const [status, setStatus] = useState("disconnected");

  const persistQuery = useCallback((nextSession, nextToken, nextHop) => {
    const url = new URL(window.location.href);
    if (nextSession) url.searchParams.set("session", nextSession);
    else url.searchParams.delete("session");
    if (nextToken) url.searchParams.set("token", nextToken);
    else url.searchParams.delete("token");
    if (nextHop) url.searchParams.set("hop", nextHop);
    else url.searchParams.delete("hop");
    history.replaceState(null, "", url);
  }, []);

  const connect = useCallback(() => {
    const s = session.trim();
    const t = token.trim();
    const h = hop.trim();
    persistQuery(s, t, h);
    postToCore({ type: "connect", session: s, token: t, hop: h });
  }, [session, token, hop, persistQuery]);

  const disconnect = useCallback(() => {
    postToCore({ type: "disconnect" });
  }, []);

  useEffect(() => {
    const onMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      const iframe = document.getElementById("jolee-core");
      if (iframe && event.source !== iframe.contentWindow && event.source !== window) return;
      const msg = event.data;
      if (msg && msg.type === "status" && typeof msg.state === "string") {
        setStatus(msg.state);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    const iframe = document.getElementById("jolee-core");
    if (!iframe) return undefined;
    const onLoad = () => {
      if (session.trim() && token.trim()) connect();
    };
    try {
      if (iframe.src && iframe.contentDocument && iframe.contentDocument.readyState === "complete") onLoad();
    } catch (e) {}
    iframe.addEventListener("load", onLoad);
    return () => iframe.removeEventListener("load", onLoad);
  }, []);

  return (
    <div className="jolee-hop-bar" role="region" aria-label="Session hop">
      <label>
        Session
        <input value={session} autoComplete="off" onChange={(e) => setSession(e.target.value)} />
      </label>
      <label>
        Browser token
        <input value={token} autoComplete="off" onChange={(e) => setToken(e.target.value)} />
      </label>
      <label>
        Hop host
        <input value={hop} placeholder="this origin" autoComplete="off" onChange={(e) => setHop(e.target.value)} />
      </label>
      <button type="button" onClick={connect}>Connect</button>
      <button type="button" onClick={disconnect}>Disconnect</button>
      <span className="jolee-hop-status" data-state={status}>{status}</span>
    </div>
  );
}

export default HopControls;
