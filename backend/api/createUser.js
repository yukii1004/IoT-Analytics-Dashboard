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

const {admin} = require('./firebase')


// Endpoint to create new user
app.post('/auth/register', async (req, res) => {
    const { username, password, devices } = req.body;
  
    if (!username || !password || !devices) {
      return res.status(400).json({ error: 'All fields are required' });
    }
  
    try {
      const email = `${username}@greenpmu.com`;
      const userRecord = await admin.auth().createUser({
        email: email,
        password: password,
      });
  
      await admin.firestore().collection('Users').doc(userRecord.uid).set({
        email: userRecord.email,
        username: username,
        devices: devices,
      });
  
      res.status(200).json({ message: 'User created successfully!' });
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        res.status(400).json({ error: 'An account with this email already exists.' });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });

module.exports = app;