const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connesso: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Errore: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;