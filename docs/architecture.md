# Hop diagrams

See the root README for the full agent-builder guide. The hop is:

```mermaid
flowchart LR
  Browser[Browser viewer] --> Worker[Worker]
  Worker --> DO[Session Durable Object]
  Agent[Outbound agent] --> DO
```

Browser viewer goes through the Worker into the session Durable Object. The agent outbound-connects to that same Durable Object. The DO never dials out.

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

# Chrome vs hop

The hop in this document is MIT. Dashboard chrome is a modified Selkies example dashboard (MPL-2.0) that overlays the hop core iframe and talks to it with postMessage. Jolee Remote does not run Selkies. Details: chrome.md.
