# Dashboard chrome

`/` is the product session UI: modified Selkies dashboard chrome (MPL-2.0) over the hop.

`/viewer.html` is the canvas hole: PartySocket, byte envelope, canvas paint, pointer/key input, and postMessage. No header, no Connect button, no status pill.

This repo ships modified Selkies dashboard chrome, not the Selkies streaming stack (no selkies-web-core).

Dashboard chrome is MPL-2.0 (see `chrome/selkies-dashboard/LICENSE`). The hop (`src/`, `public/viewer.html`, Worker, Durable Object) is MIT.

## Join

The one browser join URL opens Selkies chrome:

```
https://remote.example.com/?session=<id>#token=<browserToken>
```

If the Worker is a different host:

```
https://remote.example.com/?session=<id>&hop=<worker-host>#token=<browserToken>
```

| param | meaning |
| --- | --- |
| `session` | session id from `POST /sessions` |
| `token` | browser join token (prefer `#token=` fragment; `?token=` is fallback) |
| `hop` | Worker host; default this origin. The HTML page is what we recommend on `remote` (`remote.example.com`) |

`joins.browser` from mint is a path on the hop Worker (`viewerPath`): `/?session=<id>&hop=<worker-host>#token=<browserToken>`. If HTML is on `https://remote.example.com` and the Worker is elsewhere, prefix that origin and keep `hop`. `public/index.html` copies search params except `token` onto the iframe query, and puts the token on the iframe hash (hash first, then query fallback). The hop core auto-connects. A host app can also postMessage `connect` / `disconnect` to the iframe.

## postMessage contract

Same-origin `window` messages from the parent shell to `iframe#jolee-core`.

Handled by the hop core:

| type | payload | core action |
| --- | --- | --- |
| `connect` | `{session, token, hop}` | PartySocket join as browser |
| `disconnect` | | close socket |
| `requestFullscreen` | | canvas.requestFullscreen() |
| `setScaleLocally` | `{value: boolean}` | CSS object-fit contain vs stretch/fill |
| `showVirtualKeyboard` | | focus canvas (and optional hidden input) |
| `clipboardUpdateFromUI` | `{text}` | input envelope `{t:clipboard, text}` if connected; no-op otherwise |

Core to parent (only when window.parent is not window):

| type | payload |
| --- | --- |
| `status` | `{state: waiting | paired | expired | disconnected}` |

Other Selkies pipeline toggles (pipelineControl, settings, gamepadControl, setManualResolution, resetResolutionToWindow, setUseCssScaling, setAntiAliasing, audioDeviceSelected, requestGamingMode, command, getStats, sidebarVisibilityChanged, TOUCH_GAMEPAD_SETUP, TOUCH_GAMEPAD_VISIBILITY, touchinput:trackpad, touchinput:touch, setSynth, clipboardImageUpdate, setUseBrowserCursors, mode) are ignored with a one-line comment. They do not crash the core.

```mermaid
flowchart LR
  Dashboard[Dashboard chrome] -->|postMessage| Core[iframe hop core]
  Core -->|PartySocket| Worker[Worker]
  Worker --> DO[Session Durable Object]
  Agent[Outbound agent] -->|WebSocket client| DO
```

## Keeping chrome in sync

This repo ships modified Selkies dashboard chrome, not the Selkies streaming stack (no selkies-web-core).

Do not bump packages past what the source uses: dashboard npm follows the pinned Selkies package.json; wrangler, workers-types, partyserver, and partysocket follow those sources, not latest-on-npm.

Dependabot covers npm weekly (Monday) at `/` and `/chrome/selkies-dashboard`, plus GitHub Actions at `/`. The dashboard is pinned in `chrome/selkies-dashboard/UPSTREAM`; overlay files in `OVERLAY` are kept; Jolee rewires are `chrome/patches/selkies-dashboard/` plus `scripts/sync-selkies-dashboard.sh` (`latest` or a SHA). A weekday Action opens an issue titled "Selkies dashboard upstream moved" when the pin is behind.

