const { admin, db } = require('./firebase');

const createUser = async (req, res) => {
  const { username, password, devices } = req.body;
  const email = `${username}@greenpmu.com`;

  // Validate request body
  if (!username || !password || !devices) {
    return res.status(400).json({ success: false, error: "Missing required fields" });
  }

  try {
    const userRecord = await admin.auth().createUser({ email, password });

    // Add user data to Firestore
    await db.collection('Users').doc(userRecord.uid).set({
      email: userRecord.email,
      username: username,
      devices: devices,
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully!',
      userId: userRecord.uid,
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    const errorMessage = error.code === 'auth/email-already-exists'
      ? 'An account with this email already exists.'
      : 'An error occurred during registration. Please try again later.';
    
    res.status(error.code === 'auth/email-already-exists' ? 409 : 500).json({
      success: false,
      error: errorMessage,
    });
  }
};

module.exports = createUser;