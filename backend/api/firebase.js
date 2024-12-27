const admin = require("firebase-admin");
require("dotenv").config();

const serviceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, "base64").toString("utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://iot-dashboard-d70c0.firebaseio.com",
});

const db = admin.firestore();

module.exports = { admin, db };