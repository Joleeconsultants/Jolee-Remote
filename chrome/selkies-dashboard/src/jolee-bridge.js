/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Posts dashboard commands to the Jolee Remote hop core iframe instead of
 * same-window selkies-core. Original Jolee glue; not copied from Selkies.
 * @param {object} message
 * @param {string} [targetOrigin]
 */
export function postToCore(message, targetOrigin = window.location.origin) {
  const iframe = document.getElementById("jolee-core");
  if (iframe && iframe.contentWindow) {
    iframe.contentWindow.postMessage(message, targetOrigin);
    return;
  }
  window.postMessage(message, targetOrigin);
}
