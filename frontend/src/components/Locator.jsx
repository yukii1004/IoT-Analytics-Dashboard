// Locator.js
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import "leaflet/dist/leaflet.css";
import Sidebar from './Sidebar';
import { auth, db } from './firebase'; // Ensure you import firebase configurations
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import './Locator.css';

const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
};

const Locator = () => {
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [currUser, setCurrUser] = useState();

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
    if (currUser) {
      fetchDevices();
    }
  }, [currUser]);

  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.deviceId) {
      setSelectedDeviceId(location.state.deviceId);
    }
  }, [location.state]);

  const handleDeviceChange = (event) => {
    setSelectedDeviceId(parseInt(event.currentTarget.getAttribute("data-id"), 10));
  };

  const selectedDevice = devices.find(dev => dev.id === selectedDeviceId);

  return (
    <div className="locator-container">
      <Sidebar 
        text="Device Locator" 
        devices={devices} 
        selectedDeviceId={selectedDeviceId} 
        handleDeviceChange={handleDeviceChange} 
      />
      <div className="locator">
        {selectedDevice && (
          <MapContainer center={[selectedDevice.lat, selectedDevice.lon]} zoom={13} className="leaflet-container">
            <MapUpdater center={[selectedDevice.lat, selectedDevice.lon]} />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={[selectedDevice.lat, selectedDevice.lon]}>
              <Popup>
                {selectedDevice.name} <br /> Lat: {selectedDevice.lat}, Lon: {selectedDevice.lon}
              </Popup>
            </Marker>
          </MapContainer>
        )}
      </div>
    </div>
  );
};

export default Locator;
