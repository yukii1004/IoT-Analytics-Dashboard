import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { auth, db } from "./firebase.jsx";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import "leaflet/dist/leaflet.css";
import "./Dashboard.css";

//map component
const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
};

function Dashboard() {
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [currUser, setCurrUser] = useState();
  // fetches current user and their device permissions
  const fetchUserData = async () => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "Users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setCurrUser(userData.username);
            setDevices(userData.devices);
          } else {
            console.log("No such user!");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    });
  };
  // creates an array of devices according to user permissions
  const fetchDevices = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Devices"));
      const formattedDevices = querySnapshot.docs
        .map((doc) => {
          const data = doc.data();
          if (devices.includes(data.id)) {
            const lat = data.coordinates?.latitude;
            const lon = data.coordinates?.longitude;
            if (typeof lat === "number" && typeof lon === "number") {
              return {
                id: data.id,
                name: data.name,
                lat,
                lon,
                active: data.active, // Added active field
              };
            }
          }
          return null;
        })
        .filter((device) => device !== null);
      setDevices(formattedDevices);
      if (formattedDevices.length > 0) {
        setSelectedDeviceId(formattedDevices[0].id);
      }
    } catch (error) {
      console.error("Error fetching devices:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);
  useEffect(() => {
    fetchDevices();
  }, [currUser]);
  // changes the current device
  const handleLocate = (device) => {
    setSelectedDeviceId(device.id);
  };

  const selectedDevice = devices.find((dev) => dev.id === selectedDeviceId);
  devices.sort((a, b) => a.id - b.id);
  // code for the temperature representations
  const [temp, setTemp] = useState(0);
  useEffect(() => {
    // code to find dynamic temperature
    setTemp(60);
  }, [temp]);

  // code for the humidity representations
  const [humidity, setHumidity] = useState(0);
  useEffect(() => {
    // code to find dynamic humidity
    setHumidity(60);
  }, [humidity]);
  const cssHumidity = humidity * 1.8 - 90;

  // code for the gas representations
  const [gas, setGas] = useState(0);
  useEffect(() => {
    // code to find dynamic gas
    setGas(60);
  }, [gas]);
  const cssGas = gas * 1.8 - 90;
  // code for the pressure representations
  const [pressure, setPressure] = useState(0);
  useEffect(() => {
    // code to find dynamic pressure
    setPressure(60);
  }, [pressure]);  

  return (
    <div className="dash-partition-lr">
      <div className="dash-analytics">
        <div className="dash-analytics-container">
          <div className="dash-representation">
            <a href="/analytics#temperature">
              <img src="/expand.png" className="expand" />
            </a>
            <h2>Temperature</h2>
            <div className="temperature-png">
              <img src="/Temperature.png"></img>
              <div className="temp-percent">{temp}°C</div>
              <div
                className="temp-bar"
                style={{ width: temp * 0.74 + "%" }}
              ></div>
            </div>
          </div>
          <div className="dash-representation">
            <a href="/analytics#humidity">
              <img src="/expand.png" className="expand" />
            </a>
            <h2>Humidity</h2>
            <div className="humidity-png">
              <img src="/Humidity.png"></img>
              <div className="humidity-percent">{humidity}%</div>
              <div
                className="humidity-needle "
                style={{ transform: "rotate(" + cssHumidity + "deg)" }}
              ></div>
              <div className="humidity-needle-bottom"></div>
            </div>
          </div>
        </div>
        <div className="dash-analytics-container">
          <div className="dash-representation">
            <a href="/analytics#gas">
              <img src="/expand.png" className="expand" />
            </a>
            <h2>Gas</h2>
            <div className="gas-png">
              <img src="/Gas.png"></img>
              <div className="gas-percent">{gas}%</div>
              <div
                className="gas-needle "
                style={{ transform: "rotate(" + cssGas + "deg)" }}
              ></div>
              <div className="gas-needle-bottom"></div>
            </div>
          </div>
          <div className="dash-representation">
            <a href="/analytics#pressure">
              <img src="/expand.png" className="expand" />
            </a>
            <h2>Pressure</h2>
            <div className="pressure-box">
              <div className="pressure-percent">{pressure}%</div>
              <div className="pressure-bar"></div>
              <div
                className="pressure-pointer"
                style={{ left: pressure * 0.925 + "%" }}
              ></div>
            </div>
          </div>
        </div>
        
      </div>
      <div className="dash-partition-ud">
        <div className="dashboard">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Device</th>
                  <th>Latitude</th>
                  <th>Longitude</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {devices.map((device, index) => (
                  <tr key={device.id || index}>
                    <td>{device.name}</td>
                    <td>{device.lat}</td>
                    <td>{device.lon}</td>
                    <td>{device.active ? "Active" : "Inactive"}</td>
                    <td>
                      <button onClick={() => handleLocate(device)}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="dash-locator">
          {selectedDevice && (
            <MapContainer
              center={[selectedDevice.lat, selectedDevice.lon]}
              zoom={13}
              className="dash-leaflet-container"
            >
              <MapUpdater center={[selectedDevice.lat, selectedDevice.lon]} />
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                lang="eng"
              />
              <Marker position={[selectedDevice.lat, selectedDevice.lon]}>
                <Popup>
                  {selectedDevice.name} <br /> Lat: {selectedDevice.lat}, Lon:{" "}
                  {selectedDevice.lon}
                </Popup>
              </Marker>
            </MapContainer>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
