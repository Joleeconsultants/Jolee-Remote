# Session-scoped print redirect (parked)

**Status:** not implemented. A possible later hop + consumer feature.

## Problem

Print happens on the remote OS inside the session. Dashboard chrome alone cannot open the viewer's local print dialog. A permanent product printer that always sits in the OS printer list is the wrong shape for short-lived hops.

## Desired shape

Same idea as Remote Desktop session printers:

1. While the hop is **paired**, the consumer agent adds a **session-only** virtual printer (or enables redirect).
2. The user prints from an app on the remote OS to that printer.
3. The agent captures the job as PDF (or XPS converted to PDF) and sends it over the hop toward the browser.
4. The viewer opens a local print preview / browser print dialog (Google Docs–like feel in the browser).
5. On disconnect, TTL, or teardown, the agent **removes** the printer so it is gone when nobody is in session.

No always-on printer in the Start menu between sessions.

## Hop vs consumer

| Layer | Owns |
| --- | --- |
| Consumer agent | Add/remove the session printer, spool capture, PDF encode, honor pair/teardown |
| Hop | Forward opaque bytes (same mint/pair/TTL story); does not install drivers |
| Viewer / chrome | Optional: receive PDF and open browser print preview. Selkies chrome is not a printer driver |

This repo stays pairing + opaque `frame` / `input` / `audio`. The sample agent stays a pipe proof; do not grow it into a desktop print stack.

## Sketch contract (not shipping)

If this lands later, prefer reusing the JSON-frame / file pattern already used for clipboard and downloads rather than a new envelope kind, unless size forces something else:

- Agent → browser: UTF-8 JSON on a `frame` payload, or a file-like shape such as `{ "t": "print", "mime": "application/pdf", "name": "…", "data": "<base64>" }`
- Viewer: decode PDF, open a blob URL, trigger the browser print UI (or a small preview sheet)

Today envelopes larger than **1 MiB** are dropped (`MAX_ENVELOPE_BYTES`). Real print jobs often exceed that; any implementation must decide chunking, a side download, or a raised cap before claiming print works. Treat the shape above as a sketch only.

## Out of scope (for now)

- Implementing drivers, port monitors, or installer packaging in this repo
- A permanent printer that survives outside a paired session
- Apps, Sharing, or Gaming chrome
- Claiming the hop understands spool formats beyond opaque bytes

## Related

- Plug-in and envelope: [agent.md](agent.md)
- Chrome leftover list: [chrome.md](chrome.md)
