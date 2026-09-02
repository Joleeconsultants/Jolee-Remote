/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Posts dashboard commands to the Jolee Remote hop core iframe instead of
 * same-window selkies-core. Original Jolee glue; not copied from Selkies.
 * requestFullscreen runs on the parent iframe in the same tick as the click
 * so user activation is not lost; other messages post into the iframe.
 * @param {object} message
 * @param {string} [targetOrigin]
 */
export function postToCore(message, targetOrigin = window.location.origin) {
  const iframe = document.getElementById("jolee-core");
  if (message && message.type === "requestFullscreen" && iframe) {
    const req = iframe.requestFullscreen || iframe.webkitRequestFullscreen;
    if (req) {
      Promise.resolve(req.call(iframe)).catch(() => {
        if (iframe.contentWindow) {
          iframe.contentWindow.postMessage(message, targetOrigin);
        }
      });
      return;
    }
  }
  if (iframe && iframe.contentWindow) {
    iframe.contentWindow.postMessage(message, targetOrigin);
    return;
  }
  window.postMessage(message, targetOrigin);
}
