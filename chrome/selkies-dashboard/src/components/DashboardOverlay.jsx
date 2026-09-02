/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Portal that places hop controls and the sidebar over the core iframe.
 * @module
 */
import ReactDOM from "react-dom";
import HopControls from "./HopControls";
import Sidebar from "./Sidebar";
import "../styles/Overlay.css";

function DashboardOverlay({ container }) {
  if (!container) {
    return null;
  }

  return ReactDOM.createPortal(
    <div className="dashboard-overlay-container">
      <HopControls />
      <Sidebar />
    </div>,
    container
  );
}

export default DashboardOverlay;
