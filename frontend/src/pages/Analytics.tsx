import { useState, useEffect } from "react";
import { auth } from "./firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {  Line,  LineChart,  XAxis,  YAxis,  CartesianGrid,  Legend,} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface Device {
  id: string;
  name: string;
  data: {
    temperature: number;
    humidity: number;
    pressure: number;
    gas: number;
    timestamp: string;
  }[];
}

const createChartData = (label: string, data: { value: number; timestamp: string }[], color: string) => ({
  label,
  data: data.map((entry) => ({
    ...entry,
    [label.split(" ")[0].toLowerCase()]: entry.value,
  })),
  color,
});

const average = (values: number[]) => {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};


export default function Analytics() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not logged in");
      }

      const response = await fetch(`/api/fetchData`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "user-id": user.uid,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch devices and data");
      }

      const data: Device[] = await response.json();
      setDevices(data);

      if (data.length > 0) {
        setSelectedDeviceId((prevSelected) => prevSelected || data[0].id);
      }
    } catch (error) {
      console.error("Error fetching devices and data:", error);
      setError("Failed to fetch data. Please check your backend and try again later."); 
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleDeviceChange = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
  };

  const selectedDevice = devices.find((device) => device.id === selectedDeviceId);

  const chartData = {
    temperature: createChartData(
      "Temperature (°C)",
      selectedDevice?.data.map((entry) => ({ value: entry.temperature, timestamp: entry.timestamp })) ?? [],
      "hsl(0, 100%, 50%)"
    ),
    humidity: createChartData(
      "Humidity (%)",
      selectedDevice?.data.map((entry) => ({ value: entry.humidity, timestamp: entry.timestamp })) ?? [],
      "hsl(200, 100%, 50%)"
    ),
    pressure: createChartData(
      "Pressure (hPa)",
      selectedDevice?.data.map((entry) => ({ value: entry.pressure, timestamp: entry.timestamp })) ?? [],
      "hsl(120, 100%, 25%)"
    ),
    gas: createChartData(
      "Gas (ppm)",
      selectedDevice?.data.map((entry) => ({ value: entry.gas, timestamp: entry.timestamp })) ?? [],
      "hsl(60, 100%, 25%)"
    ),
  };

  if (isLoading) {
    return <div className="p-4 text-white">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="p-4 flex h-[calc(100vh-120px)] w-full gap-4">
      <Card className="dark w-[15%] flex-shrink-0 outline outline-1 outline-[#807668]">
        <CardHeader>
          <CardTitle>Devices</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-auto bg-[#27272A] rounded-lg p-2">
            {devices.map((device) => (
              <Button
                key={device.id}
                className={`w-full mb-2 shadow-transparent rounded-lg bg-transparent ${
                  selectedDeviceId === device.id
                    ? "bg-black text-white hover:bg-black"
                    : "bg-transparent text-gray-500 hover:bg-gray-900 hover:text-gray-500"
                } focus:bg-black focus:text-white`}
                onClick={() => handleDeviceChange(device.id)}
              >
                {device.name}
              </Button>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="dark flex-grow p-1 overflow-hidden outline outline-1 outline-[#807668]">
        <CardHeader className="pb-4">
          <CardTitle>Analytics</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="temperature" className="p-4">
            <TabsList className="justify-center gap-2">
              {Object.keys(chartData).map((key) => (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="hover:bg-gray-900 text-gray-500 hover:text-gray-500"
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(chartData).map(([key, { label, data, color }]) => (
              <TabsContent value={key} key={key} className="h-[500px]">
                <ChartContainer
                  config={{
                    [key]: {
                      label,
                      color,
                    },
                  }}
                  className="h-full w-full"
                >
                    <LineChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="timestamp"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line type="monotone" dataKey={key} stroke={`var(--color-${key})`} name={label} />
                    </LineChart>
                </ChartContainer>
                <div className="mt-4 text-2xl font-bold text-center">
                  Average: {average(data.map((point) => point.value)).toFixed(2)}{" "}
                  {label.split("(")[1].split(")")[0]}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}