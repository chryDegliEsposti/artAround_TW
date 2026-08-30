const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/artaround';

async function viewDb() {
  console.log(`Connecting to MongoDB at: ${MONGO_URI}...`);
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected successfully!\n');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    if (collections.length === 0) {
      console.log('No collections found in the database.');
      await mongoose.disconnect();
      return;
    }

    console.log('=== Database Collections ===');
    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`- ${col.name}: ${count} documents`);
    }
    console.log('============================\n');

    // Show some samples of each collection
    for (const col of collections) {
      console.log(`\n--- Sample from [${col.name}] ---`);
      const docs = await db.collection(col.name).find({}).limit(2).toArray();
      if (docs.length === 0) {
        console.log('  (empty)');
      } else {
        console.log(JSON.stringify(docs, null, 2));
      }
    }

  } catch (error) {
    console.error('Error reading database:', error);
  } finally {
    await mongoose.disconnect();
  }
}

viewDb();
