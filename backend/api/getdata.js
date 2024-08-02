const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const {admin, db} = require("./firebase"); // Make sure this is properly initialized
const app = express();

app.use(bodyParser.json());
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
};

app.use(cors(corsOptions));

app.post("/api/fetchData", async (req, res) => {
  try {
    const data = req.body;
    const { id: deviceId, ...sensorData } = data;
    
    // Use the provided timestamp or the current time
    const currentTimestamp = new Date();
    const timestampString = currentTimestamp.toISOString();

    const dataWithTimestamp = {
      ...sensorData,
      timestamp: currentTimestamp,
    };

    await db
      .collection("Devices")
      .doc(`Device ${deviceId}`)
      .collection("Data")
      .doc(timestampString)
      .set(dataWithTimestamp);

    res.status(200).send("Data received and stored");
  } catch (error) {
    console.error("Error storing data:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Export a function for Vercel
module.exports = app;
