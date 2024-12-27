import { useState, useEffect } from "react";
import { auth } from "@/pages/firebase";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface DeviceData {
  temperature: number;
  humidity: number;
  pressure: number;
  gas: number;
  timestamp: string;
}

interface Device {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

const MapUpdater: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
};

const average = (data: DeviceData[], key: keyof DeviceData) => {
  if (!Array.isArray(data) || data.length === 0) return 0;
  return (
    data.reduce((sum, item) => sum + (Number(item[key]) || 0), 0) / data.length
  );
};

export default function Dashboard() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [devicesData, setDevicesData] = useState<Record<string, DeviceData[]>>(
    {}
  );
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not logged in");
      const response = await fetch(`/api/fetchData`, {
        headers: {
          "Content-Type": "application/json",
          "user-id": user.uid,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch data");
      const rawData = await response.json();
      const data = rawData.reduce(
        (
          acc: Record<string, DeviceData[]>,
          device: { id: string; data: DeviceData[] }
        ) => {
          acc[device.id] = device.data || [];
          return acc;
        },
        {}
      );
      setDevicesData(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchDevices = async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not logged in");
      const response = await fetch(
        `/api/fetchDevices`,
        {
          headers: { "user-id": user.uid },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch devices");
      const data: Device[] = await response.json();
      setDevices(data);
      if (data.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching devices:", error);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      await fetchDevices();
      await fetchData();
    };

    fetchAllData();
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, [selectedDeviceId]);

  const handleLocate = (device: Device) => {
    setSelectedDeviceId(device.id);
  };

  const selectedDevice = devices.find((dev) => dev.id === selectedDeviceId);
  const selectedDeviceData = selectedDeviceId
    ? devicesData[selectedDeviceId] || []
    : [];

  const temp = average(selectedDeviceData, "temperature");
  const humidity = average(selectedDeviceData, "humidity");
  const gas = average(selectedDeviceData, "gas");
  const pressure = average(selectedDeviceData, "pressure");

  return (
    <div className="flex flex-col space-y-4 p-4">
      <div className="flex gap-4">
        <div className="w-1/2 h-[100]">
          <div className="grid grid-cols-2 gap-4 h-full">
            {/* Sensor Data Cards */}
            <Card className="dark outline outline-1 outline-[#807668] flex flex-col justify-between p-4">
              <CardHeader>
                <CardTitle>Temperature</CardTitle>
              </CardHeader>
              <hr />
              <CardContent className="flex flex-col items-center justify-center flex-grow">
                <img
                  src="/Temperature.png"
                  alt="Temperature"
                  className="w-full h-24 mb-3 mt-2"
                />
                <div className="text-3xl font-bold mt-6">{temp.toFixed(1)}°C</div>
              </CardContent>
            </Card>

            <Card className="dark outline outline-1 outline-[#807668] flex flex-col justify-between p-4">
              <CardHeader>
                <CardTitle>Pressure</CardTitle>
              </CardHeader>
              <hr />
              <CardContent className="flex flex-col items-center justify-center flex-grow w-full gap-4">
                <div className="w-full h-6 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full mt-3 mb-6"></div>
                <div className="text-3xl font-bold mt-6">
                  {pressure.toFixed(2)} hPa
                </div>
              </CardContent>
            </Card>

            <Card className="dark outline outline-1 outline-[#807668] flex flex-col justify-between p-4">
              <CardHeader>
                <CardTitle>Humidity</CardTitle>
              </CardHeader>
              <hr />
              <CardContent className="flex items-center justify-center flex-grow p-0">
                <div className="w-1/2">
                  <img
                    src="/Humidity.png"
                    alt="Humidity"
                    className="w-full h-auto mr-10"
                  />
                </div>
                <div className="w-1/2 flex justify-center text-3xl font-bold">{humidity.toFixed(1)}%</div>
              </CardContent>
            </Card>

            <Card className="dark outline outline-1 outline-[#807668] flex flex-col justify-between p-4">
              <CardHeader>
                <CardTitle>Gas</CardTitle>
              </CardHeader>
              <hr />
              <CardContent className="flex items-center justify-center flex-grow p-0">
                <div className="w-1/2">
                  <img
                    src="/Gas.png"
                    alt="Gas"
                    className="w-full h-auto mr-10"
                  />
                </div>
                <div className="w-1/2 flex justify-center text-3xl font-bold">{gas.toFixed(0)}ppm</div>
              </CardContent>
            </Card>

            
          </div>
        </div>

        <div className="w-1/2">
          {/* Devices List */}
          <Card className=" dark outline outline-1 outline-[#807668]">
            <CardHeader>
              <CardTitle>Devices</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device</TableHead>
                    <TableHead>Latitude</TableHead>
                    <TableHead>Longitude</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devices.map((device) => (
                    <TableRow key={device.id}>
                      <TableCell>{device.name}</TableCell>
                      <TableCell>{device.latitude}</TableCell>
                      <TableCell>{device.longitude}</TableCell>
                      <TableCell>
                        {devicesData[device.id] &&
                        devicesData[device.id].length > 0
                          ? (() => {
                              const latestData = devicesData[device.id][0]; // Assuming data is sorted by timestamp
                              const latestTimestamp = new Date(
                                `1970-01-01T${latestData.timestamp}`
                              );
                              const currentTime = new Date();
                              const diffMinutes =
                                (currentTime.getTime() -
                                  latestTimestamp.getTime()) /
                                (1000 * 60);
                              return diffMinutes <= 15 ? "Active" : "Inactive";
                            })()
                          : "No Data"}
                      </TableCell>
                      <TableCell>
                        <Button onClick={() => handleLocate(device)}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Map */}
          <Card className=" dark mt-4 outline outline-1 outline-[#807668]">
            <CardHeader>
              <CardTitle>Device Location</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDevice &&
              selectedDevice.latitude &&
              selectedDevice.longitude ? (
                <div className="h-80">
                  <MapContainer
                    center={[selectedDevice.latitude, selectedDevice.longitude]}
                    zoom={13}
                    className="h-full"
                  >
                    <MapUpdater
                      center={[
                        selectedDevice.latitude,
                        selectedDevice.longitude,
                      ]}
                    />
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker
                      position={[
                        selectedDevice.latitude,
                        selectedDevice.longitude,
                      ]}
                    >
                      <Popup>
                        {selectedDevice.name} <br />
                        Lat: {selectedDevice.latitude}, Lon:{" "}
                        {selectedDevice.longitude}
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
              ) : (
                <div className="h-96 flex items-center justify-center">
                  <p>No location data available for the selected device.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Device Data */}
      <Card className=" dark outline outline-1 outline-[#807668]">
        <CardHeader>
          <CardTitle>Device Data</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDeviceData.length > 0 ? (
            <div className="h-96 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Temperature</TableHead>
                    <TableHead>Humidity</TableHead>
                    <TableHead>Pressure</TableHead>
                    <TableHead>Gas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedDeviceData.map((data, index) => (
                    <TableRow key={index}>
                      <TableCell>{data.timestamp}</TableCell>
                      <TableCell>{data.temperature.toFixed(1)}°C</TableCell>
                      <TableCell>{data.humidity.toFixed(1)}%</TableCell>
                      <TableCell>{data.pressure.toFixed(2)}hPa</TableCell>
                      <TableCell>{data.gas.toFixed(0)}ppm</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="h-96 flex items-center justify-center">
              <p>No data available for the selected device.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
