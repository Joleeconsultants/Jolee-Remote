/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Fake serverSettings payload posted to the vendored sidebar so Selkies-only
 * panels (apps, files, sharing, encoder, dual-mode) stay hidden. The hop has
 * no pixelflux/proot pipeline.
 */
function flag(value) {
  return { value };
}

export const JOLEE_SERVER_SETTINGS = {
  ui_title: flag("Jolee Remote"),
  ui_show_logo: flag(false),
  ui_sidebar_show_video_settings: flag(false),
  ui_sidebar_show_screen_settings: flag(true),
  ui_sidebar_show_audio_settings: flag(false),
  ui_sidebar_show_stats: flag(false),
  ui_sidebar_show_clipboard: flag(true),
  ui_sidebar_show_files: flag(false),
  ui_sidebar_show_apps: flag(false),
  ui_sidebar_show_sharing: flag(false),
  ui_sidebar_show_gamepads: flag(false),
  ui_sidebar_show_shortcuts: flag(false),
  ui_sidebar_show_fullscreen: flag(true),
  ui_sidebar_show_gaming_mode: flag(false),
  ui_sidebar_show_trackpad: flag(false),
  ui_sidebar_show_keyboard_button: flag(true),
  ui_sidebar_show_soft_buttons: flag(false),
  ui_show_core_buttons: flag(false),
  ui_sidebar_show_webcam: flag(false),
  clipboard_enabled: flag(true),
  enable_sharing: flag(false),
  enable_shared: flag(false),
  enable_player2: flag(false),
  enable_player3: flag(false),
  enable_player4: flag(false),
  enable_dual_mode: flag(false),
  enable_binary_clipboard: flag(false),
  enable_rate_control: flag(false),
  audio_enabled: { value: false, locked: true },
  microphone_enabled: { value: false, locked: true },
  webcam_enabled: { value: false, locked: true },
  gamepad_enabled: { value: false, locked: true },
  file_transfers: { value: "" },
};

export function postJoleeServerSettings() {
  window.postMessage(
    { type: "serverSettings", payload: JOLEE_SERVER_SETTINGS },
    window.location.origin,
  );
}
