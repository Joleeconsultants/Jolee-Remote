# Architecture

Reusable Cloudflare Durable Objects session-pairing framework: mint, pair browser + outbound agent WebSocket, hibernation, TTL, teardown.

Session-pairing hop on Cloudflare Workers and Durable Objects. See the root README for integration. Diagrams below:

```mermaid
flowchart LR
  Browser[Selkies chrome] --> Worker[Worker]
  Worker --> DO[Session Durable Object]
  Agent[Outbound agent] --> DO
```

The browser joins through the Worker into the session Durable Object. The agent outbound-connects to that same Durable Object. The DO never dials out.

```mermaid
sequenceDiagram
  participant App
  participant Worker
  participant Session
  participant Browser
  participant Agent
  App->>Worker: POST /sessions
  Worker->>Session: mint
  Browser->>Session: WS join
  Agent->>Session: outbound WS join
  Agent->>Session: envelope frame
  Session->>Browser: envelope frame
  Browser->>Session: envelope input
  Session->>Agent: envelope input
  Note over Session: TTL or peer drop teardown
```

## Chrome vs hop

`/` is Selkies chrome (modified dashboard, MPL-2.0), the product session UI.

`/viewer.html` is the canvas hole (MIT): PartySocket + envelope + paint + input + postMessage. The Worker and session Durable Object are the MIT pairing pipe. This repo ships modified Selkies dashboard chrome, not the Selkies streaming stack. See [chrome.md](chrome.md).

```mermaid
flowchart TB
  subgraph chrome [Selkies chrome]
    Shell[index.html shell]
    Overlay[Dashboard chrome MPL-2.0]
    Core[viewer.html hop core MIT]
    Shell --> Overlay
    Shell --> Core
    Overlay -->|postMessage| Core
  end
  Core --> Worker[Worker MIT]
  Worker --> DO[Session Durable Object MIT]
  Agent[Outbound agent] --> DO
```
