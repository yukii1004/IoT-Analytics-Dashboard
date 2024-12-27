const express = require("express");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const cors = require("cors");
const { MongoClient } = require('mongodb');
require('dotenv').config();

// Route handlers
const createUser = require("./createUser");
const addDevice = require('./addDevice');
const addData = require('./addData');
const fetchDatabase = require('./fetchData');
const { authenticate, loginUser } = require("./loginUser");
const fetchDevices = require("./fetchDevices");

// CORS options
const corsOptions = {
  origin: process.env.CORS_ORIGIN, 
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "user-id"],
};

// Initialize Express app
const app = express();
app.use(cors(corsOptions));
app.use(express.json());
app.use(compression());
app.use(morgan('combined'));

// MongoDB connection
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

async function startServer() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    const db = client.db('dashboard');

    // Initialize routes and apply per-route rate limiting
    const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
    app.use("/auth/loginUser", authenticate, loginUser);
    app.use("/auth/createUser", limiter, (req, res) => createUser(req, res));
    app.use("/api/addDevice", limiter, (req, res) => addDevice(req, res, db));
    app.use("/api/addData", limiter, (req, res) => addData(req, res, db));
    app.use("/api/fetchData", limiter, (req, res) => fetchDatabase(req, res, db));
    app.use("/api/fetchDevices", limiter, (req, res) => fetchDevices(req, res, db));

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).send("Something broke!"); 
    });

    // Start the server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    process.exit(1);
  }
}

startServer();