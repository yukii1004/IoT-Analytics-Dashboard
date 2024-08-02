import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { auth, db } from './firebase';
import { getDoc, getDocs, setDoc, doc, GeoPoint, collection, updateDoc, arrayUnion } from 'firebase/firestore';
import './Admin.css';

function Admin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [devices, setDevices] = useState([]);
  const [deviceId, setDeviceId] = useState(null);
  const [deviceName, setDeviceName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [checkedDevices, setCheckedDevices] = useState([]);
  const [deviceToggleStatus, setDeviceToggleStatus] = useState({});

  useEffect(() => {
    // gets all devices
    const fetchDevices = async () => {
      const querySnapshot = await getDocs(collection(db, 'Devices'));
      const formattedDevices = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: data.id,
          name: data.name,
          latitude: data.coordinates?.latitude,
          longitude: data.coordinates?.longitude,
        };
      });
      setDevices(formattedDevices.slice(1));
    };

    // gets the latest device id for creation
    const fetchDeviceId = async () => {
      const docRef = doc(db, "Devices", "Counter");
      const docSnap = await getDoc(docRef);
      setDeviceId(docSnap.data());
    };
    fetchDevices();
    fetchDeviceId();
  }, []);
  
  // tracks permission set
  const handleCheckboxChange = (deviceId) => {
    setCheckedDevices(prevCheckedDevices =>
      prevCheckedDevices.includes(deviceId)
        ? prevCheckedDevices.filter(id => id !== deviceId)
        : [...prevCheckedDevices, deviceId]
    );
  };

  // tracks toggle status of devices
  const handleDeviceToggle = (deviceId) => {
    setDeviceToggleStatus(prevStatus => ({
      ...prevStatus,
      [deviceId]: !prevStatus[deviceId]
    }));
  };

  // creates user on the backend according to set permissions
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!username || !password) {
        toast.warning("All fields are required.");
        return;
      }
      // check if checkedDevices is empty
      else if (checkedDevices.length === 0) {
        toast.warning("Select Atleast One Device");
        return;
      }
      const response = await axios.post('https://iot-analytics-dashboard.vercel.app/auth/register', {
        username: username,
        password: password,
        devices: checkedDevices,
      });
      toast.success(response.data.message, { position: "top-center" });
    } catch (error) {
      if (error.response && error.response.data.error === "An account with this email already exists.") {
        toast.error("An account with this email already exists.");
      } else {
        toast.warning(error.message);
      }
    }
  };

  // adds new device and updates admin access to devices
  const addDevice = async (e) => {
    e.preventDefault();
    try {
      if (!deviceName || !latitude || !longitude) {
        toast.warning("All fields are required.");
        return;
      }
      await setDoc(doc(db, "Devices", deviceName), {
        id: deviceId.id,
        name: deviceName,
        active: true,
        coordinates: new GeoPoint(parseFloat(latitude), parseFloat(longitude)),
      });
      toast.success("Device added successfully!", { position: "top-center" });

      await setDoc(doc(db, "Devices", "Counter"), {
        id: deviceId.id + 1,
      });

      await updateDoc(doc(db, "Users", "xMdAm9AbGrcBQxfKsei3dKJiBZE3"), {
        devices: arrayUnion(deviceId.id)
      });

      setDeviceId(prevDeviceId => ({ id: prevDeviceId.id + 1 }));
    } catch (error) {
      toast.warning(error.message);
    }
  };

  devices.sort((a, b) => a.id - b.id);

  return (
    <div className='admin-container'>
      <div className="set-permissions">
        <h2>Set Permissions</h2>
        <div className="list-container">
          {devices.map(device => (
            <div key={device.id} className="admin-devices">
              <div><span>{device.id}.  </span>
                <span>{device.name}</span></div>
              <input
                type="checkbox"
                checked={checkedDevices.includes(device.id)}
                onChange={() => handleCheckboxChange(device.id)}
              />
            </div>))}
        </div>
      </div>
      <div className="create-user">
        <form className="form" onSubmit={handleSubmit}>
          <h2>Create User</h2>
          <div className='input-fields'>
            <input
              type="text"
              id="username"
              placeholder="Username"
              autoComplete='on'
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              id="password"
              placeholder='Password'
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button>Let's Go!</button>
        </form>
      </div>
      <div className='add-device'>
        <h2>Add Device</h2>
        <form onSubmit={addDevice}>
          <div className="input-fields">
            <input
              type="text"
              id="deviceName"
              placeholder="Device Name"
              onChange={(e) => setDeviceName(e.target.value)}
            />
            <input
              type="text"
              id="latitude"
              placeholder='Latitude'
              onChange={(e) => setLatitude(e.target.value)}
            />
            <input
              type="text"
              id="longitude"
              placeholder='Longitude'
              onChange={(e) => setLongitude(e.target.value)}
            />
            <button>Let's Go!</button>
          </div>
        </form>
      </div>
      <div className="toggle-device">
        <h2>Toggle Devices</h2>
        <div className="list-container">
          {devices.map(device => (
            <div key={device.id} className="admin-devices">
              <div><span>{device.id}.  </span>
                <span>{device.name}</span></div>
              <input
                type="checkbox"
                checked={deviceToggleStatus[device.id] || false}
                onChange={() => handleDeviceToggle(device.id)}
              />
            </div>))}
        </div>
      </div>
    </div>
  );
}

export default Admin;
