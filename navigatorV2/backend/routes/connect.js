const { MongoClient } = require('mongodb');
require('dotenv').config();

const url = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/artaround';
const dbName = "artround";

let client;
let db;

/**
 * Connects to MongoDB and returns the database object.
 * Implements a singleton pattern to reuse the connection across different routes.
 */
async function connectToDatabase() {
    if (db) return db;

    try {
        client = await MongoClient.connect(url);
        db = client.db(dbName);
        console.log('Successfully connected to MongoDB');
        return db;
    } catch (err) {
        console.error('Failed to connect to MongoDB:', err);
        throw err;
    }
}

module.exports = connectToDatabase;
