/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Overlay hide-flags for the vendored sidebar. Add chrome back as the hop
 * grows; do not show Apps/Sharing/Files/Stats/Webcam until that hop exists.
 * Hide gaming (gamepads, gaming mode, trackpad, extra players).
 * Audio playback (kind 0x03) and screen size / DPI / HiDPI are unlocked.
 * Microphone stays locked (later hop). Encoder/video settings stay hidden
 * (no pixelflux). Image clipboard is a hop path: enable_binary_clipboard
 * is unlocked. Prefer this overlay for flags so Sidebar patches stay small.
 * Locked settings make isRenderable return false (or hide the manual
 * resolution block via serverSettings.manual_resolution.locked).
 */
function flag(value) {
  return { value };
}

export const JOLEE_SERVER_SETTINGS = {
  ui_title: flag("Jolee Remote"),
  ui_show_logo: flag(false),
  ui_sidebar_show_video_settings: flag(false),
  ui_sidebar_show_screen_settings: flag(true),
  ui_sidebar_show_audio_settings: flag(true),
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
  enable_binary_clipboard: { value: true },
  enable_rate_control: flag(false),
  audio_enabled: { value: true },
  microphone_enabled: { value: false, locked: true },
  webcam_enabled: { value: false, locked: true },
  gamepad_enabled: { value: false, locked: true },
  use_css_scaling: { value: true },
  force_aligned_resolution: { value: false },
  scaling_dpi: {
    value: "96",
    allowed: ["96", "120", "144", "168", "192", "216", "240", "264", "288"],
  },
  manual_resolution: { value: false },
  file_transfers: { value: "" },
};

export function postJoleeServerSettings() {
  window.postMessage(
    { type: "serverSettings", payload: JOLEE_SERVER_SETTINGS },
    window.location.origin,
  );
}
