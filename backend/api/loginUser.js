const { admin, db } = require("./firebase");

// Auth middleware to verify Firebase ID tokens
const authenticate = async (req, res, next) => {
  const idToken = req.headers.authorization;
  if (!idToken) return res.status(401).send("Unauthorized: No token provided");

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).send("Unauthorized: Invalid token");
  }
};

// Handler for logging in the user
const loginUser = async (req, res) => {
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
};

module.exports = { authenticate, loginUser };
