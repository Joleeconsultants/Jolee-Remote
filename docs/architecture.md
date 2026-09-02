# Hop diagrams

See the root README for the full agent-builder guide. The hop is:

```mermaid
flowchart LR
  Browser[Browser] --> Worker[Worker]
  Worker --> DO[Session Durable Object]
  Agent[Outbound agent] --> DO
```

The browser goes through the Worker into the session Durable Object. The agent outbound-connects to that same Durable Object. The DO never dials out.

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

`/` is the product UI: modified Selkies dashboard chrome (MPL-2.0) over the hop. There is no custom join page.

`/viewer.html` is not a viewer product. It is the hop core / canvas hole (MIT): PartySocket + envelope + paint + input + postMessage. The Worker and session Durable Object stay the MIT session-pairing pipe. Jolee Remote does not run Selkies. See chrome.md.

```mermaid
flowchart TB
  subgraph chrome [Browser]
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
