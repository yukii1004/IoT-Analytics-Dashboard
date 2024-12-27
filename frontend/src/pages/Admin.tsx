import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { auth } from "./firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Device {
  id: string 
  name: string
  latitude: number
  longitude: number
}

export default function Admin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [devices, setDevices] = useState<Device[]>([])
  const [deviceName, setDeviceName] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [error, setError] = useState<string | null>(null);
  const [checkedDevices, setCheckedDevices] = useState<string[]>([])

  useEffect(() => {
    const fetchDevices = async () => {
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
          latitude: device.latitude,
          longitude: device.longitude,
        }));
        setDevices(formattedDevices);
      } catch (error) {
        console.error("Error fetching devices:", error);
        setError("Failed to fetch Devices. Please add a new device or check your backend and try again later.");
      }
    };
  
    fetchDevices();
  }, []);
  
  
  const handleCheckboxChange = (deviceId: string) => {
    setCheckedDevices(prevCheckedDevices =>
      prevCheckedDevices.includes(deviceId)
        ? prevCheckedDevices.filter(id => id !== deviceId)
        : [...prevCheckedDevices, deviceId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!username || !password) {
        toast.warning("All fields are required.")
        return
      }
      if (checkedDevices.length === 0) {
        toast.warning("Select at least one device")
        return
      }
      const response = await axios.post(`/auth/createUser`, {
        username: username,
        password: password,
        devices: checkedDevices,
      })
      toast.success(response.data.message, { position: "top-center" })
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.data.error === "An account with this email already exists.") {
          toast.error("An account with this email already exists.")
        } else {
          toast.warning(error.response.data.message || error.message)
        }
      } else {
        toast.error("An unexpected error occurred.")
      }
    }
  }

  const addDevice = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!deviceName || !latitude || !longitude) {
        toast.warning("All fields are required.")
        return
      }
      await axios.post(`/api/addDevice`, {
        name: deviceName,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      })
      toast.success("Device added successfully!", { position: "top-center" })
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.warning(error.response.data.message || error.message)
      } else {
        toast.error("An unexpected error occurred.")
      }
    }
  }

  return (
    <div className="flex h-[calc(100vh-7.5rem)]">
      <div className="flex flex-col w-1/2 bg-[#27272A] p-4 items-center justify-center gap-6 rounded-3xl m-6">
        <Card className='dark md:col-span-1 w-[90%] h-[40%] outline outline-1 outline-[#807668] overflow-auto'>
          <CardHeader>
            <CardTitle>Set Permissions</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-auto w-full pr-4">
              {devices.length!==0 ? devices.sort((a, b) => parseInt(a.id) - parseInt(b.id)).map(device => (
                <div key={device.id} className="flex items-center space-x-2 mb-2">
                  <Checkbox
                    id={`device-${device.id}`}
                    checked={checkedDevices.includes(device.id)}
                    onCheckedChange={() => handleCheckboxChange(device.id)}
                  />
                  <Label htmlFor={`device-${device.id}`} className='text-base'>{device.id}. {device.name}</Label>
                </div>
              )) : <div className="text-red-500">{error}</div> }
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className='dark md:col-span-1 w-[90%] h-[45%] outline outline-1 outline-[#807668] overflow-auto '>
          <CardHeader>
            <CardTitle>Create User</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              <Button type="submit" className="w-full bg-slate-900 outline text-gray-500 hover:bg-black">Create User</Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-col w-1/2 bg-[#27272A] p-4 items-center justify-center rounded-3xl m-6">
        <Card className='dark md:col-span-1 w-[90%] h-fit outline outline-1 outline-[#807668] overflow-auto'>
          <CardHeader>
            <CardTitle>Add Device</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={addDevice} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deviceName">Device Name</Label>
                <Input
                  id="deviceName"
                  type="text"
                  placeholder="Device Name"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="text"
                  placeholder="Latitude"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="text"
                  placeholder="Longitude"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full bg-slate-900 outline text-gray-500 hover:bg-black">Add Device</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}