const { db } = require('./firebase');
const { FieldValue } = require('firebase-admin/firestore');

const addDevice = async (req, res, dbm) => {
  try {
    // Retrieve the current device ID from the `Counter` document in MongoDB
    const result = await dbm.collection('Devices').findOne({ name: "Counter" });
    const id = result.id;
    const collectionName = `Device ${id}`;

    // Create a time-series collection in MongoDB for the new device
    await dbm.createCollection(collectionName, {
      timeseries: { timeField: 'timestamp', granularity: 'seconds' },
      expireAfterSeconds: 2600000,
    });
    console.log(`Collection created: ${collectionName}`);

    // Increment the device ID in the `Counter` document
    await dbm.collection('Devices').updateOne(
      { name: "Counter" },
      { $inc: { id: 1 } }
    );

    // Insert the new device details into the `Devices` collection in MongoDB
    await dbm.collection('Devices').insertOne({
      id: id,
      name: collectionName,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
    });

    // Update Firebase `Users` collection to add the new device ID for the admin user
    const adminDoc = db.collection('Users').doc('xMdAm9AbGrcBQxfKsei3dKJiBZE3');
    await adminDoc.update({
      devices: FieldValue.arrayUnion(id) // Append the device ID to the array without duplicates
    });

    res.status(201).json({ message: 'Device added successfully', collectionName });
  } catch (error) {
    console.error("Error creating collection or updating Firebase", error);
    res.status(500).json({ message: "Error adding device" });
  }
};

module.exports = addDevice;
