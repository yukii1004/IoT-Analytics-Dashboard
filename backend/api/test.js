const { Timestamp } = require('mongodb');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const { admin, db } = require('./firebase');
const { FieldValue } = require('firebase-admin/firestore');

// Connection URI from environment variables
const uri = process.env.MONGO_URI;

const client = new MongoClient(uri);
async function testDatabase() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error(error);
  }
}


async function addData1() {
  /* database.collection('Device 1').insertOne({
    timestamp: new Date(),
    temperature: 20,
    }) */
   
   /* database = client.db('dashboard');
   const result = await database.collection('Devices').findOne({name: "Counter"});
   const id = result.id;
   console.log(id) */
  try {
    const adminDoc = db.collection('Users').doc('xMdAm9AbGrcBQxfKsei3dKJiBZE3');
    /* const devices = adminDoc.data().devices; */
    await adminDoc.update({
      devices: FieldValue.arrayUnion(3)
    });
    /* console.log(devices) */
    client.close()
    }catch(error){
      console.error(error)
    }
  }
  
  
  testDatabase().catch(console.error);
  addData1()