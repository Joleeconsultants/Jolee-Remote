# Session-scoped print redirect

**Status:** **viewer side shipped** in this repo (`public/viewer.html` + `printFromFrame` in `src/json-frame.ts`). The **session-only virtual printer** (appear on pair, remove on teardown) remains **consumer agent** work — same shape as RDP session printers. This hop does not install drivers, speak RDPDR, or vendor IronRDP.

## Problem

Print happens on the remote OS inside the session. Dashboard chrome alone cannot open the viewer's local print dialog. A permanent product printer that always sits in the OS printer list is the wrong shape for short-lived hops.

## Desired shape (IronRDP / RDPDR-style — agent owns this)

Likely agent implementation should follow the open-source [IronRDP](https://github.com/Devolutions/IronRDP) RDPDR printer path (`ironrdp-rdpdr`, `Rdpdr::with_printer` / `with_printer_driver`), not invent an always-installed MSI printer.

How that model works:

1. While the session is active (IronRDP advertises the printer after the server's user-logged-on signal), announce a **virtual printer** on the device-redirection channel.
2. Default server-side driver name is PostScript (`MS Publisher Imagesetter`, same default FreeRDP uses for CUPS PostScript redirect). `with_printer_driver` exists when the host needs a different installed driver; that choice controls the byte format the OS writes.
3. Print IRPs are **Create → Write (many) → Close**. The backend accumulates raw job bytes on Write and finalizes on Close.
4. **Convert PostScript → PDF** (Imagesetter / FreeRDP shape) before sending to the hop. Prefer `application/pdf`.
5. Present the finished job in the **browser** print preview / print dialog (Google Docs–like) via a print JSON frame — not by leaving a permanent queue on the remote PC.
6. When the hop tears down, the virtual printer goes with the session (RDP session-printer UX). No always-on printer between sessions.

This hop is **not** an RDP stack and should not speak RDPDR on the wire. Steal the *shape* (session-scoped virtual printer + stream-until-close + convert + local print UI). The consumer agent owns how the OS sees that printer; the hop only carries the finished document to the viewer.

## Hop vs consumer

| Layer | Owns |
| --- | --- |
| Consumer agent | **Session-only** virtual printer (RDPDR-like or native equivalent): add on pair / remove on teardown, Create/Write/Close buffering, PostScript→PDF (or other) conversion |
| Hop | Forward opaque envelopes (same mint/pair/TTL story); does not parse print JSON, implement RDPDR, or install drivers |
| Viewer / chrome | Receive `{t:"print",…}` frames, reassemble chunks, open the **browser** print dialog / preview (`iframe` + `contentWindow.print()`). Selkies chrome is not a printer driver |

## Shipped viewer contract

After Close + convert, the agent sends one document on a kind `0x01` frame as UTF-8 JSON (same pattern as clipboard / file). Keep `public/viewer.html` in sync with `src/json-frame.ts` (`PrintFrame` / `printFromFrame`).

### Single-shot

```json
{ "t": "print", "mime": "application/pdf", "name": "document.pdf", "data": "<base64>" }
```

Omit `part` / `parts`, or set `parts` to `1`. Defaults: `name` → `print.pdf`, `mime` → `application/pdf`, `job` → `single`, `part` → `0`, `parts` → `1`.

### Chunking (1 MiB envelope)

Envelopes larger than **1 MiB** are dropped (`MAX_ENVELOPE_BYTES`). For larger PDFs, split the **raw bytes** into slices, base64-encode each slice, and send:

```json
{ "t": "print", "job": "<id>", "part": 0, "parts": 3, "mime": "application/pdf", "name": "document.pdf", "data": "<base64 of byte slice>" }
```

- `job` groups chunks; `part` is 0-based; `part >= parts` is rejected.
- Viewer decodes each `data` to bytes, concatenates in `part` order, then prints.
- Incomplete jobs are cleared on disconnect.

### Viewer behavior

1. Prefer PDF (`application/pdf`). Images (`image/*`) also open print preview.
2. Non-PDF / non-image mime falls back to the same download path as `{t:"file",…}`.
3. Printable jobs: base64→`Blob`→hidden iframe→`contentWindow.print()` (browser print dialog / preview, Google Docs–like). On failure: try `window.open` then `print()`, else download.
4. Optional chrome hint (no blob URL cross-frame): `parent.postMessage({ type: "printJob", name, mime }, origin)` — fine if the parent ignores it.

**Silent printing is out of scope for the web viewer.** Browsers require the system print dialog; there is no silent OS spool from this iframe path. Silent / direct OS spool belongs to a **desktop client** only, not the hop viewer.

## Out of scope (this repo)

- Shipping RDPDR, IronRDP, or an RDP client
- Implementing drivers, port monitors, or installer packaging
- A permanent printer that survives outside a paired session
- Silent print / OS spool from the browser viewer
- Canvas screenshot “print”
- Apps, Sharing, or Gaming chrome
- Claiming the hop understands spool or PostScript beyond opaque bytes

## Related

- Plug-in and envelope: [agent.md](agent.md)
- Chrome leftover list: [chrome.md](chrome.md)
