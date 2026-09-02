/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Dashboard entry: overlay chrome on the hop core iframe. Does not load
 * selkies-core or any Selkies streaming client.
 * @module
 */
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { postJoleeServerSettings } from "./jolee-settings.js";
import "./index.css";

const dashboardRootElement = document.createElement("div");
dashboardRootElement.id = "dashboard-root";
dashboardRootElement.classList.add("allow-native-input");
document.body.appendChild(dashboardRootElement);

const appMountPoint = document.getElementById("root");
if (appMountPoint) {
  ReactDOM.createRoot(appMountPoint).render(
    <React.StrictMode>
      <App dashboardRoot={dashboardRootElement} />
    </React.StrictMode>,
  );
  requestAnimationFrame(function () { postJoleeServerSettings(); setTimeout(postJoleeServerSettings, 0); setTimeout(postJoleeServerSettings, 50); });
} else {
  console.error("Dashboard mount point #root not found.");
}
