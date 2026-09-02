# Selkies dashboard patches

Quilt-style series applied by `scripts/sync-selkies-dashboard.sh` after copying upstream `addons/selkies-dashboard`.

The series rewires Selkies chrome onto the hop canvas. Add chrome back as the hop grows. Do not show Apps/Sharing/Files/Stats/Webcam/Audio until that hop exists. Hide gaming (gamepads, gaming mode, trackpad, extra player seats).

## Hide unused UI

Prefer overlay `chrome/selkies-dashboard/src/jolee-settings.js` for hide-flags (`locked: true` / `ui_sidebar_show_*: false`) so Sidebar diffs stay small.

**Visible** (hop exists)

- Screen: scale locally, anti-aliasing, CSS cursors
- PC Clipboard (open by default), including Image Support / upload (`enable_binary_clipboard` unlocked)
- Fullscreen and theme
- Mobile/touch keyboard FAB (original Selkies; not in the sidebar)

Image clipboard is a hop path: input JSON `{t:"clipboard", mime, data}` (base64) browser→agent; optional JSON clipboard frame agent→browser. Do not claim the hop has a Selkies pixelflux encoder.

**Hidden until that hop exists**

- Apps, sharing, files, stats, webcam, audio, encoder/video settings, shortcuts
- HiDPI (`use_css_scaling`), force aligned resolution, UI scaling / OS DPI, manual and preset resolution

**Hidden (gaming)**

- Gamepads, gaming mode, trackpad, extra player seats (player2/3/4, dual_mode)

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
