/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Original no-op app-panel helpers. The hop has no proot/apps pipeline.
 * Not copied from selkies-web-core.
 * @module
 */

export const APP_COMMAND_STATE_EVENT = "appCommandState";
export const INSTALLED_APPS_ROLLBACK_EVENT = "installedAppsRollback";
export const INSTALLED_APPS_SERVER_EVENT = "installedAppsFromServer";

export function pendingAppAction() {
  return null;
}

export function postAppCommand() {
  // Selkies-only: remote app install/launch. The hop does not run a command shell.
}

export function applyServerInstalledApps() {
  return false;
}

export function readInstalledApps() {
  return [];
}

export function writeInstalledApps() {}

export function resolveFailedAppCommand() {
  return true;
}
