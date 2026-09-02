import { routePartykitRequest } from "partyserver";
import { Session, type Env } from "./session";
import { randomToken } from "./tokens";
import {
  DEFAULT_TTL_SECONDS,
  MAX_TTL_SECONDS,
  MIN_TTL_SECONDS,
  type MintResponse,
} from "./types";
import { agentJoinPath, viewerPath } from "./joins";
import { authorizeMint } from "./mint-auth";

export { Session };
export {
  agentJoinPath,
  browserJoinPath,
  partyBrowserPath,
  viewerPath,
  viewerQuery,
  viewerHash,
} from "./joins";

const CORS: Record<string, string> = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "content-type, authorization, x-mint-secret",
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }

    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/sessions") {
      return withCors(await mint(request, env));
    }

    const statusMatch = url.pathname.match(/^\/sessions\/([^/]+)$/);
    if (request.method === "GET" && statusMatch) {
      return withCors(await sessionStatus(statusMatch[1], env));
    }

    const joinMatch = url.pathname.match(/^\/sessions\/([^/]+)\/(browser|agent)$/);
    if (joinMatch) {
      const sessionId = joinMatch[1];
      const role = joinMatch[2];
      if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket") {
        return json({ error: "expected websocket upgrade" }, 426);
      }
      const stub = env.Session.getByName(sessionId);
      return stub.fetch(withQuery(request, { role }));
    }

    const party = await routePartykitRequest(request, env);
    if (party) return party;

    if (env.ASSETS) return env.ASSETS.fetch(request);
    return new Response("Not found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;

async function mint(request: Request, env: Env): Promise<Response> {
  if (!authorizeMint(request, env.MINT_SECRET)) {
    return json({ error: "mint secret required" }, 401);
  }

  let ttlSeconds = DEFAULT_TTL_SECONDS;
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      const body = (await request.json()) as { ttlSeconds?: unknown };
      if (typeof body.ttlSeconds === "number") ttlSeconds = body.ttlSeconds;
    } catch {
      return json({ error: "invalid json" }, 400);
    }
  }
  ttlSeconds = Math.min(
    MAX_TTL_SECONDS,
    Math.max(MIN_TTL_SECONDS, Math.floor(ttlSeconds)),
  );

  const sessionId = crypto.randomUUID();
  const browserToken = randomToken();
  const agentToken = randomToken();
  const hop = new URL(request.url).host;
  const stub = env.Session.getByName(sessionId);
  try {
    const minted = await stub.mint({
      sessionId,
      browserToken,
      agentToken,
      ttlSeconds,
    });
    const body: MintResponse = {
      sessionId: minted.sessionId,
      browserToken,
      agentToken,
      expiresAt: minted.expiresAt,
      ttlSeconds: minted.ttlSeconds,
      joins: {
        browser: viewerPath(minted.sessionId, browserToken, hop),
        agent: agentJoinPath(minted.sessionId, agentToken),
      },
    };
    return json(body, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : "mint failed";
    return json({ error: message }, 409);
  }
}

async function sessionStatus(sessionId: string, env: Env): Promise<Response> {
  const stub = env.Session.getByName(sessionId);
  const data = await stub.status();
  if (!data) return json({ error: "session not found" }, 404);
  return json(data);
}

function withQuery(request: Request, query: Record<string, string>): Request {
  const url = new URL(request.url);
  for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v);
  return new Request(url, request);
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function withCors(response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [k, v] of Object.entries(CORS)) headers.set(k, v);
  return new Response(response.body, { status: response.status, headers });
}
