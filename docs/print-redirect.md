# Session-scoped print redirect (parked)

**Status:** not implemented. A possible later hop + consumer feature.

## Problem

Print happens on the remote OS inside the session. Dashboard chrome alone cannot open the viewer's local print dialog. A permanent product printer that always sits in the OS printer list is the wrong shape for short-lived hops.

## Desired shape (IronRDP / RDPDR-style)

Likely implementation should follow the open-source [IronRDP](https://github.com/Devolutions/IronRDP) RDPDR printer path (`ironrdp-rdpdr`, `Rdpdr::with_printer` / `with_printer_driver`), not invent a always-installed MSI printer.

How that model works:

1. While the session is active (IronRDP advertises the printer after the server's user-logged-on signal), announce a **virtual printer** on the device-redirection channel.
2. Default server-side driver name is PostScript (`MS Publisher Imagesetter`, same default FreeRDP uses for CUPS PostScript redirect). `with_printer_driver` exists when the host needs a different installed driver; that choice controls the byte format the OS writes.
3. Print IRPs are **Create → Write (many) → Close**. The backend accumulates raw job bytes on Write and finalizes on Close. The client stays format-agnostic until it converts (often PostScript → PDF) for the user.
4. Present the finished job in the **browser** print preview / print dialog (Google Docs–like), not by leaving a permanent queue on the remote PC.
5. When the hop tears down, the virtual printer goes with the session (RDP session-printer UX). No always-on printer between sessions.

This hop is **not** an RDP stack and should not speak RDPDR on the wire. Steal the *shape* (session-scoped virtual printer + stream-until-close + convert + local print UI). The consumer agent owns how the OS sees that printer; the hop only needs a way to carry the finished document to the viewer.

## Hop vs consumer

| Layer | Owns |
| --- | --- |
| Consumer agent | Session-scoped virtual printer (RDPDR-like or native equivalent), Create/Write/Close buffering, PostScript→PDF (or other) conversion, add on pair / remove on teardown |
| Hop | Forward opaque bytes (same mint/pair/TTL story); does not implement RDPDR or install drivers |
| Viewer / chrome | Receive the finished PDF (or printable blob) and open browser print preview. Selkies chrome is not a printer driver |

This repo stays pairing + opaque `frame` / `input` / `audio`. The sample agent stays a pipe proof; do not grow it into a desktop print or RDPDR stack.

## Sketch hop contract (not shipping)

After Close, the agent has one document. Prefer reusing the JSON-frame / file pattern already used for clipboard and downloads rather than a new envelope kind, unless size forces something else:

- Agent → browser: e.g. `{ "t": "print", "mime": "application/pdf", "name": "…", "data": "<base64>" }` on a `frame` payload (or chunked equivalent)
- Viewer: decode PDF, open a blob URL, trigger the browser print UI (or a small preview sheet)

Today envelopes larger than **1 MiB** are dropped (`MAX_ENVELOPE_BYTES`). Real print jobs often exceed that; any implementation must decide chunking, a side download, or a raised cap before claiming print works. Treat the shape above as a sketch only.

Reference (read, do not vendor into this repo unless you deliberately take a dependency later):

- [IronRDP](https://github.com/Devolutions/IronRDP) / crate `ironrdp-rdpdr`
- `Rdpdr::with_printer(device_id, print_name)` and `RdpdrBackend::handle_printer_io_request`
- Spec backdrop: [MS-RDPEFS](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-rdpefs/34d9de58-b2b5-40b6-b970-f82d4603bdb5) device redirection (printers are one device class)

## Out of scope (for now)

- Shipping RDPDR, IronRDP, or an RDP client in this repo
- Implementing drivers, port monitors, or installer packaging here
- A permanent printer that survives outside a paired session
- Apps, Sharing, or Gaming chrome
- Claiming the hop understands spool or PostScript beyond opaque bytes

## Related

- Plug-in and envelope: [agent.md](agent.md)
- Chrome leftover list: [chrome.md](chrome.md)
