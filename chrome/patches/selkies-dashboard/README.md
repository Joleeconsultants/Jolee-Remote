# Selkies dashboard patches

Quilt-style series applied by `scripts/sync-selkies-dashboard.sh` after copying upstream `addons/selkies-dashboard`.

The series rewires Selkies chrome onto the hop canvas. Slow-add: only show chrome when that hop exists. Prefer overlay `chrome/selkies-dashboard/src/jolee-settings.js` for hide-flags so Sidebar diffs stay small. Do not invent a new UI.

## Visible now (hop exists)

- Screen: scale locally, anti-aliasing, CSS cursors, HiDPI, force aligned, UI scaling, resolution (presets / manual / Set / Reset)
- PC Clipboard (open by default), text + image (`enable_binary_clipboard` unlocked)
- Audio playback (envelope kind `0x03` agent → browser)
- Fullscreen and theme
- Mobile/touch keyboard FAB (original Selkies; not in the sidebar)

Image clipboard stays on input JSON / JSON-frame. Audio is envelope kind `0x03` because it is a byte stream like frames, not JSON. Do not claim the hop has a Selkies pixelflux encoder.

## What's left (hidden until that hop exists)

Leftover list of recommended chrome not yet hopped:

- Microphone
- Files
- Apps
- Sharing
- Webcam
- Stats
- Shortcuts
- Encoder / video settings (no pixelflux)

Gaming stays out (gamepads, gaming mode, trackpad, extra player seats).

See also the leftover list in [docs/chrome.md](../../../docs/chrome.md#whats-left) and [docs/agent.md](../../../docs/agent.md).

## Overlay vs patches

- Overlay files listed in `chrome/selkies-dashboard/OVERLAY` are never overwritten by sync (`jolee-settings.js`, `jolee-bridge.js`, `jolee-shims/`, …). Put hop-only hide-flags and postMessage glue there.
- Patches in this directory are rewires of vendored Selkies files (`Sidebar.jsx`, translations, …). Keep them small.

## Series

| patch | why |
| --- | --- |
| `0001-sidebar-jolee-rewire.patch` | postToCore instead of same-window selkies-core; hop comments |
| `0002-player-gamepad-jolee-rewire.patch` | gamepad player shims (gamepads stay hidden) |
| `0003-dashboard-overlay-hop-controls.patch` | overlay hop controls |
| `0005-main-jsx-hop-entry.patch` | hop entry; no selkies-core |
| `0006-gitignore-keep-package-lock.patch` | keep package-lock |
| `0008-hide-sharing-until-enabled.patch` | seed hop settings; sharing/gamepads only if explicitly enabled |
| `0009-clipboard-open-pc-label.patch` | clipboard open by default; “PC Clipboard” copy |

See also `docs/chrome.md`.
