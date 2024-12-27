const { db } = require('./firebase');

const fetchDevices = async (req, res, dbm) => {
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

    // Query MongoDB for the allowed devices
    const collection = dbm.collection("Devices");
    const devices = await collection
      .find({ id: { $in: allowedDeviceIds } }) // Match based on the `id` field
      .project({ id: 1, name: 1, latitude: 1, longitude: 1, _id: 0 }) // Include only required fields
      .toArray();

    // Return devices in the requested format
    res.status(200).json(devices);

  } catch (error) {
    console.error("Error fetching devices", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = fetchDevices;
