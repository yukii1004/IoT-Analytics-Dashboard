const { db } = require('./firebase');

const fetchData = async (req, res, dbm) => {
  try {
    const userId = req.get("user-id");

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Fetch allowed devices
    const userDoc = await db.collection("Users").doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    const allowedDeviceIds = userDoc.data().devices || [];
    if (allowedDeviceIds.length === 0) {
      return res.status(200).json([]);
    }

    // Fetch device details and their recent data in parallel
    const collection = dbm.collection("Devices");

    const devices = await collection.find({ id: { $in: allowedDeviceIds } }).toArray();

    const deviceDataPromises = devices.map(async (device) => {
      const deviceCollection = dbm.collection(`Device ${device.id}`);
      const recentData = await deviceCollection
        .find({})
        .sort({ timestamp: -1 })
        .limit(50)
        .toArray();

      return {
        id: device.id.toString(),
        name: device.name,
        data: recentData.map((d) => ({
          temperature: d.temperature,
          humidity: d.humidity,
          pressure: d.pressure,
          gas: d.gas,
          timestamp: new Date(d.timestamp).toLocaleString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
        })),
      };
    });

    const enrichedDevices = await Promise.all(deviceDataPromises);

    res.status(200).json(enrichedDevices);
  } catch (error) {
    console.error("Error fetching devices and data", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = fetchData;
