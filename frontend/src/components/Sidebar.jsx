// Sidebar.js
import React from "react";
import "./Sidebar.css";

const Sidebar = ({ text, devices, selectedDeviceId, handleDeviceChange }) => {
  return (
    <div className="sidebar">
      <h2>{text}</h2>
      <div className="device-list">
        {devices.sort((a, b) => a.id - b.id).map((device) => (
          <button
            key={device.id}
            className={`device-item ${
              device.id === selectedDeviceId ? "active" : ""
            }`}
            data-id={device.id}
            onClick={handleDeviceChange}
          >
            <span>{device.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
