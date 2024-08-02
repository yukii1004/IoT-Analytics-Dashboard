import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { db } from "./firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import "./Analytics.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

if (window.location.pathname === "/analytics" && window.location.hash === "") {
  window.location.replace("/analytics#temperature");
}

const Analytics = () => {
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);

  const fetchDevices = async () => {
    try {
      const devicesSnapshot = await getDocs(collection(db, "Devices"));
      const devicesData = await Promise.all(
        devicesSnapshot.docs.map(async (deviceDoc) => {
          const deviceDataCollection = collection(db, `Devices/${deviceDoc.id}/Data`);
          const dataQuery = query(deviceDataCollection, orderBy("timestamp", "desc"), limit(50));
          const dataSnapshot = await getDocs(dataQuery);
          const data = dataSnapshot.docs.reverse().map(doc => doc.data());

          return {
            id: deviceDoc.id,
            name: deviceDoc.data().name || `Device ${deviceDoc.id}`,
            data: {
              temperature: data.map(d => d.temperature),
              humidity: data.map(d => d.humidity),
              pressure: data.map(d => d.pressure),
              gas: data.map(d => d.gas),
              timestamp: data.map(d => new Date(d.timestamp?.seconds * 1000).toLocaleTimeString() || 'Unknown'),
            },
          };
        })
      );

      // Exclude devices named "Device Counter"
      const filteredDevicesData = devicesData.filter(device => device.name !== "Device Counter");
      setDevices(filteredDevicesData);

      // If no device is selected, set the first device as the selected one
      if (filteredDevicesData.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(filteredDevicesData[0].id);
      }
    } catch (error) {
      console.error("Error fetching devices:", error);
    }
  };

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 5000);
    return () => clearInterval(interval);
  }, [selectedDeviceId]); // Dependencies: only re-run if selectedDeviceId changes

  const handleDeviceChange = (event) => {
    setSelectedDeviceId(event.currentTarget.getAttribute("data-id"));
  };

  const selectedDevice = devices.find((dev) => dev.id === selectedDeviceId);

  const createChartData = (label, data, color) => ({
    labels: selectedDevice?.data.timestamp || Array.from({ length: data.length }, (_, i) => `Time ${i + 1}`),
    datasets: [
      {
        label: label,
        data: data,
        borderColor: color,
        fill: false,
      },
    ],
  });

  const average = (arr) => arr.reduce((acc, val) => acc + val, 0) / arr.length || 0;

  const temperatureData = createChartData(
    "Temperature (°C)",
    selectedDevice?.data.temperature || [],
    "rgba(75,192,192,1)"
  );
  const humidityData = createChartData(
    "Humidity (%)",
    selectedDevice?.data.humidity || [],
    "rgba(153,102,255,1)"
  );
  const pressureData = createChartData(
    "Pressure (hPa)",
    selectedDevice?.data.pressure || [],
    "rgba(255,159,64,1)"
  );
  const gasData = createChartData(
    "Gas (ppm)",
    selectedDevice?.data.gas || [],
    "rgba(255,99,132,1)"
  );

  useEffect(() => {
    const element = document.querySelector(window.location.hash);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedDeviceId]);

  return (
    <div className="analytics-container">
      <div className="analytics-sidebar">
        <h2>Analytics</h2>
        <div className="analytics-device-list">
          {devices.map((device) => (
            <button
              key={device.id}
              className={`device-item ${device.id === selectedDeviceId ? "active" : ""}`}
              data-id={device.id}
              onClick={handleDeviceChange}
            >
              <span>{device.name}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="analytics-graphs">
        <div id="temperature" className="chart-container">
          <div className="chart-stats">
            <h2>Temperature</h2>
            <div className="analytics-temperature-png">
              <img src="/Temperature.png" alt="Temperature" />
              <div className="analytics-temp-percent">
                {average(selectedDevice?.data.temperature || [])}°C
              </div>
              <div
                className="analytics-temp-bar"
                style={{
                  width: (average(selectedDevice?.data.temperature || []) * 0.74) + "%",
                }}
              ></div>
            </div>
          </div>
          <div className="chart-graph">
            <Line data={temperatureData} />
          </div>
        </div>
        <div id="humidity" className="chart-container">
          <div className="chart-stats">
            <h2>Humidity</h2>
            <div className="analytics-humidity-png">
              <img src="/Humidity.png" alt="Humidity" />
              <div className="analytics-humidity-percent">
                {average(selectedDevice?.data.humidity || [])}%
              </div>
              <div
                className="analytics-humidity-needle"
                style={{
                  transform:
                    "rotate(" + ((average(selectedDevice?.data.humidity || []) * 1.8) - 90) + "deg)",
                }}
              ></div>
              <div className="analytics-humidity-needle-bottom"></div>
            </div>
          </div>
          <div className="chart-graph">
            <Line data={humidityData} />
          </div>
        </div>
        <div id="gas" className="chart-container">
          <div className="chart-stats">
            <h2>Gas</h2>
            <div className="analytics-gas-png">
              <img src="/Gas.png" alt="Gas" />
              <div className="analytics-gas-percent">
                {average(selectedDevice?.data.gas || [])} ppm
              </div>
              <div
                className="analytics-gas-needle"
                style={{
                  transform:
                    "rotate(" + ((average(selectedDevice?.data.gas || []) * 1.8) - 90) + "deg)",
                }}
              ></div>
              <div className="analytics-gas-needle-bottom"></div>
            </div>
          </div>
          <div className="chart-graph">
            <Line data={gasData} />
          </div>
        </div>
        <div id="pressure" className="chart-container">
          <div className="chart-stats">
            <h2>Pressure</h2>
            <div className="analytics-pressure-box">
              <div className="analytics-pressure-percent">
                {average(selectedDevice?.data.pressure || [])} hPa
              </div>
              <div className="analytics-pressure-bar"></div>
              <div
                className="analytics-pressure-pointer"
                style={{
                  left: Math.min((average(selectedDevice?.data.pressure || []) * 0.835), 100) + "%",
                }}
              ></div>
            </div>
          </div>
          <div className="chart-graph">
            <Line data={pressureData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
