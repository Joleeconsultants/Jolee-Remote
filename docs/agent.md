# Plug in your app

Your app mints a hop session, stores the ids, hands the outbound agent a join URL + token, and opens **Selkies chrome** as the session UI. This hop pairs exactly one browser socket with exactly one agent socket and forwards opaque `frame` / `input` bytes. No RFB. N browsers is a later consumer need, not this version.

Helpers for join URLs live in `src/joins.ts` (`viewerPath` is the product browser join). 

## Mint

The session HTML lives at `remote` on your domain (`https://remote.example.com`). Pass `hop` only when the Worker is on another host.

Your app: `POST /sessions` on the hop Worker with optional JSON `{ "ttlSeconds": 900 }` (clamped 1..3600, default 900).

**Production requires a mint secret.** Set Worker env `MINT_SECRET` and send it as:

- `Authorization: Bearer <MINT_SECRET>`, or
- `X-Mint-Secret: <MINT_SECRET>`

Missing or wrong secret → `401`. Local `wrangler dev` with `MINT_SECRET` unset keeps open mint so you can iterate without a secret; production must set one (`wrangler secret put MINT_SECRET`).

Store `sessionId`. Response also has `browserToken`, `agentToken`, `expiresAt`, `ttlSeconds`, and `joins`:

- `joins.browser` — path on the hop Worker, token in the fragment (omit hop when HTML and Worker share an origin)
- `joins.agent` — agent WebSocket path with query-token fallback

## Open the session (browser)

The one browser join URL is:

```
https://remote.example.com/?session=<id>#token=<browserToken>
```

That opens **Selkies chrome** (the product session UI). `hop` is the Worker host (`location.host` form). Omit it when the HTML and Worker share an origin. Built by `viewerPath` / `viewerQuery`.

`/viewer.html` is the canvas hole the chrome iframes. PartySocket `/parties/session/:id?role=browser&token=` is how that hole connects, not a second product join.

## Agent join

Hand the agent `sessionId` plus the agent URL and token. Any WebSocket client (do not require PartySocket):

```
wss://<worker-host>/sessions/<id>/agent?token=<agentToken>
```

Token paths (query is fallback):

1. First text message after upgrade: `{"type":"join","token":"<agentToken>"}` on `wss://<worker-host>/sessions/<id>/agent`
2. `Authorization: Bearer <agentToken>` on the WebSocket upgrade
3. Query string `?token=` (fallback; still what `joins.agent` returns)

The agent is the WebSocket **client**. The session Durable Object is the WebSocket **server** and may hibernate. The DO never dials out.

## Pairing

Wait for a **text** JSON control message with `type: "status"` and `state: "paired"` before sending frames. Binary envelopes sent before both peers are in are dropped. 1:1 pairing only.

Shape:

`{"type":"status","sessionId":"...","state":"waiting|paired|expired","expiresAt":0,"browserConnected":true,"agentConnected":true}`

## Envelope

Every binary WebSocket message:

| Offset | Size | Field |
| --- | --- | --- |
| 0 | 1 | version (`0x01`) |
| 1 | 1 | kind: `0x01` frame (agent → browser, JPEG/WebP stills), `0x02` input (browser → agent, JSON opaque) |
| 2.. | n | opaque payload |

No RFB. The hop does not interpret pixels or OS events. Malformed envelopes are dropped. Frames only from the agent connection to the browser connection. Input only from the browser connection to the agent connection. `encodeEnvelope` / `decodeEnvelope` are in `src/envelope.ts`.

### Max binary message size

Cloudflare Durable Objects accept received WebSocket messages up to **32 MiB** ([platform limits](https://developers.cloudflare.com/durable-objects/platform/limits/)). This hop drops envelopes larger than **1 MiB** (`MAX_ENVELOPE_BYTES = 1048576`) so JPEG/WebP stills at low fps stay inside a conservative cap. Oversize frames are not forwarded; the session stays up.

## Rejects and teardown

- `401` mint secret missing/wrong (when `MINT_SECRET` is configured)
- `403` bad join token (upgrade with query or `Authorization`)
- `404` unknown session
- `409` second peer (second browser or second agent)
- `410` expired

First-message join failures close the socket (`4003` invalid token, `4009` role already connected) instead of an HTTP status.

TTL alarm or either **joined** peer dropping ends the session. Later joins are rejected. A socket that never sent a join token does not tear the session down.

## What stays with the consumer

- Anything beyond the mint secret and join tokens (users, tenants, Access)
- Devices / identity / fleet agent
- Capture encoding (JPEG/WebP stills recommended)
- Applying opaque input JSON on the device
- Session UI is this repo's `/` (Selkies chrome)
