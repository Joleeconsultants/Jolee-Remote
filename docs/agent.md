# Consumer plug-in checklist

You already have an agent (outbound WebSocket client, capture, input) and a page that can open a viewer. This hop mints a short-lived session, pairs exactly one browser socket with exactly one agent socket, and forwards opaque `frame` / `input` bytes. Do not reverse-engineer `src/` for the join contract: mint, paths, envelope, and rejects are below. Helpers live in `src/joins.ts`.

Auth, device directory, capture format, applying input, and the portal stay with the consumer.

## Mint

`POST /sessions` with optional JSON `{ "ttlSeconds": 900 }` (clamped 1..3600, default 900).

Returns `sessionId`, `browserToken`, `agentToken`, `expiresAt`, `ttlSeconds`, and `joins` (relative browser and agent paths).

## Join

Browser WebSocket (any WS client, or PartySocket):

- `/sessions/:id/browser?token=` (`browserJoinPath`)
- PartySocket: `/parties/session/:id?role=browser&token=` (`partyBrowserPath`)

Agent WebSocket (any WS client; do not require PartySocket):

- `/sessions/:id/agent?token=` (`agentJoinPath`)
- `Authorization: Bearer <agentToken>` is also accepted

The agent is the WebSocket **client**. The session Durable Object is the WebSocket **server** and may hibernate. The DO never dials out.

`src/joins.ts` builds these paths (and the viewer query) so mint `joins` and consumers stay in sync.

## Pairing

Wait for a **text** JSON control message with `type: "status"` and `state: "paired"` before sending frames. Binary envelopes sent before both peers are in are dropped.

Shape:

`{"type":"status","sessionId":"...","state":"waiting|paired|expired","expiresAt":0,"browserConnected":true,"agentConnected":true}`

## Envelope

Every binary WebSocket message:

| Offset | Size | Field |
| --- | --- | --- |
| 0 | 1 | version (`0x01`) |
| 1 | 1 | kind: `0x01` frame (agent → browser), `0x02` input (browser → agent) |
| 2.. | n | opaque payload |

Malformed envelopes are dropped. Frames only from the agent connection to the browser connection. Input only from the browser connection to the agent connection. `encodeEnvelope` / `decodeEnvelope` are already in `src/envelope.ts`. The hop does not interpret pixels or OS events.

## Viewer

- `/?session=&token=&hop=` — `token` is `browserToken`. `hop` is the Worker host (default this origin). Built by `viewerQuery` / `viewerPath`.
- `/viewer.html` is the canvas hole (PartySocket + envelope + paint + input). Not a product UI.
- A host app can postMessage `connect` / `disconnect` (plus `requestFullscreen`, `setScaleLocally`, `showVirtualKeyboard`, `clipboardUpdateFromUI`) to the hop-core iframe. Contract: [chrome.md](chrome.md).

## Rejects and teardown

- `403` bad token
- `404` unknown session
- `409` second peer (second browser or second agent)
- `410` expired

TTL alarm or either peer dropping ends the session. Later joins are rejected.

## What stays with the consumer

- Auth beyond mint-time join tokens
- Devices / identity
- Capture format and encoding
- Applying input on the device
- Portal / product chrome around the canvas hole

This repo is the hop, not a remote-desktop product.
