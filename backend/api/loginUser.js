const express = require("express");
const bodyParser = require("body-parser");

const cors = require("cors");
const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

const app = express();
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.json());

const { admin, db } = require("./firebase");

// Auth middleware to verify Firebase ID tokens
const authenticate = async (req, res, next) => {
  const idToken = req.headers.authorization;
  if (!idToken) {
    return res.status(401).send("Unauthorized: No token provided");
  }
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).send("Unauthorized: Invalid token");
  }
};

// Endpoint to fetch user data
app.get("/auth/login", authenticate, async (req, res) => {
  try {
    const userId = req.user.uid;
    const userDoc = await db.collection("Users").doc(userId).get();
    if (userDoc.exists) {
      res.json(userDoc.data());
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

module.exports = app;