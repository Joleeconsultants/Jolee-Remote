Jolee Remote dashboard chrome
=============================

Modified copy of addons/selkies-dashboard from https://github.com/selkies-project/selkies.
Licensed under the Mozilla Public License 2.0. See LICENSE in this directory.

Original work: Copyright Selkies contributors.
Modifications: Copyright 2026 Jolee Consultants.

Rewired to drive the Jolee Remote hop core (public/viewer.html canvas hole) via
iframe.contentWindow.postMessage. Does not include selkies-web-core,
Selkies Python capture, pixelflux, or the Selkies WebSocket protocol.
Jolee Remote does not run Selkies.

src/jolee-shims/, src/jolee-bridge.js, and src/jolee-settings.js are original
Jolee additions (not a copy of selkies-web-core), licensed MPL-2.0 with this
dashboard.

The hop (src/, examples/, test/, wrangler, public/viewer.html, public/index.html)
remains MIT. See the repository root LICENSE.

Hide unused chrome in src/jolee-settings.js (this overlay), not with large
Sidebar patches. The quilt in chrome/patches/selkies-dashboard/ rewires
postMessage onto the hop and hides controls the hop cannot drive. See
chrome/patches/selkies-dashboard/README.md.
