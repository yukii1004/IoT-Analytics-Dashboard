import React, { useState, useEffect } from "react";
import { auth } from "./firebase";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Import marker images explicitly
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Configure the default icon
const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Set the default icon globally
L.Marker.prototype.options.icon = DefaultIcon;

interface Device {
  id: string;
  name: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

const MapUpdater: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
};

export default function Locator() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const user = auth.currentUser;
        if (!user) {
          throw new Error("User not logged in");
        }
        const response = await fetch(`/api/fetchDevices`, {
          headers: { "user-id": user.uid },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch devices: ${response.statusText}`);
        }

        const data = await response.json();
        const formattedDevices = data.map((device: any) => ({
          id: device.id.toString(),
          name: device.name,
          coordinates: {
            latitude: device.latitude,
            longitude: device.longitude,
          },
        }));

        setDevices(formattedDevices);
        if (formattedDevices.length > 0 && selectedDeviceId === null) {
          setSelectedDeviceId(formattedDevices[0].id);
        }
      } catch (error) {
        console.error("Error fetching devices:", error);
        setError("Failed to fetch data. Please check your backend and try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDeviceId]);

  const handleDeviceChange = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
  };

  const selectedDevice = devices.find((dev) => dev.id === selectedDeviceId);

  if (loading) return <div className="p-4 text-white">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4 flex h-[calc(100vh-120px)] w-full gap-4">
      <Card className="dark md:col-span-1 w-[15%] h-[calc(100vh-150px)] outline outline-1 outline-[#807668]">
        <CardHeader>
          <CardTitle>Device Locator</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-auto bg-[#27272A] rounded-lg p-2">
            {devices.length === 0 ? (
              <div className="text-center text-gray-500">No devices found.</div>
            ) : (
              devices.map((device) => (
                <Button
                  key={device.id}
                  className={`w-full mb-2 shadow-transparent rounded-lg ${
                    selectedDeviceId === device.id
                      ? "bg-black text-white hover:bg-black"
                      : "bg-transparent text-gray-500 hover:bg-gray-900 hover:text-gray-500"
                  }`}
                  onClick={() => handleDeviceChange(device.id)}
                >
                  {device.name}
                </Button>
              ))
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="dark md:col-span-3 w-full h-[calc(100vh-150px)] outline outline-1 outline-[#807668] relative">
        <CardHeader>
          <CardTitle>Map View</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDevice ? (
            <div className="h-[calc(100vh-250px)] relative">
              <MapContainer
                center={[selectedDevice.coordinates.latitude, selectedDevice.coordinates.longitude]}
                zoom={13}
                className="h-full"
                style={{ zIndex: 0 }}
              >
                <MapUpdater
                  center={[
                    selectedDevice.coordinates.latitude,
                    selectedDevice.coordinates.longitude,
                  ]}
                />
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker
                  position={[
                    selectedDevice.coordinates.latitude,
                    selectedDevice.coordinates.longitude,
                  ]}
                >
                  <Popup>
                    {selectedDevice.name} <br />
                    Lat: {selectedDevice.coordinates.latitude}, Lon: {selectedDevice.coordinates.longitude}
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          ) : (
            <div className="text-center text-gray-500">No device selected.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
