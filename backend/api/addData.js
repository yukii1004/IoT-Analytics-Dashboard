// The main function to handle adding data
const addData = async (req, res, db) => {
  try {
    const data = req.body;
    const { id: deviceId, ...sensorData } = data;

    // Prepare the data with a timestamp
    const dataWithTimestamp = {
      timestamp: new Date(),
      ...sensorData,
    };

    // Access the collection by the device ID and insert the data
    const collection = db.collection(`Device ${deviceId}`);
    await collection.insertOne(dataWithTimestamp);
    res.status(200).send("Data received and stored");
  } catch (error) {
    console.error("Error storing data:", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = addData;
