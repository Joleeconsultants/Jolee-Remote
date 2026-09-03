This product extracts Selkies visual and functional experience onto the Jolee hop. Leftover panels still wait for a hop.

# Selkies dashboard patches

## Goal

This product extracts Selkies visual and functional experience onto the Jolee hop. Leftover panels still wait for a hop.

Add a real hop path, then show the ORIGINAL Selkies dashboard control. Use original UI with only small mods (postToCore, overlay hide-flags in jolee-settings.js, PC Clipboard label, clipboard open by default). Do not invent a new UI. Do not write large Sidebar rewrites. Gaming stays out unless asked. Slow-add: a panel appears only after its hop exists.

Leftover list = recommended features not yet hopped, not a junk drawer. CSS cursors is original dashboard UI; the remote cursor overlay is hop core.

Quilt-style series applied by `scripts/sync-selkies-dashboard.sh` after copying upstream `addons/selkies-dashboard`.

The series rewires Selkies chrome onto the hop canvas. Add chrome back as the hop grows. Prefer overlay `chrome/selkies-dashboard/src/jolee-settings.js` for hide-flags so Sidebar diffs stay small.

## Visible now (hop exists)

- Screen (scale, AA, CSS cursors toggle, remote cursor overlay, HiDPI, force aligned, UI scaling, resolution)
- PC Clipboard (open by default), text + image (`enable_binary_clipboard` unlocked)
- Audio playback (envelope kind `0x03` agent → browser)
- Microphone capture (`{t:"mic", mime, data}` browser → agent)
- Files (`{t:"file", name, mime, data}` in either direction)
- Webcam JPEG stills (`{t:"webcam", mime, data}` browser → agent)
- Sidebar stats (measured hop FPS/bandwidth plus optional agent stats JSON)
- Shortcuts and agent-owned encoder / quality settings
- Fullscreen and theme
- Mobile/touch keyboard FAB (original Selkies; not in the sidebar)

Image clipboard stays on input JSON / JSON frame. Cursor shape is the same JSON-frame pattern (`{t:"cursor",...}`), not a new envelope kind. Audio is envelope kind `0x03` because it is a byte stream like frames. Do not claim the hop has a Selkies pixelflux encoder. CSS cursors toggle is original UI; overlay follows the local pointer in the hop core.

## Leftover (recommended features not yet hopped)

- Apps
- Sharing
- Gaming (out unless asked)

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
| `0010-shortcuts-command.patch` | make Shortcuts send Ctrl+Alt+Del; remove out-of-scope gaming rows |

See also `docs/chrome.md`.
