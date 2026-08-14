const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/placement_management', {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`✔ Mongo Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`⚠️ Primary MongoDB Connection Warning: ${error.message}`);
    console.log('Falling back to local MongoDB retry mode...');
    try {
      // Attempt connection with fallback options
      const conn = await mongoose.connect('mongodb://localhost:27017/placement_management');
      console.log(`✔ Mongo Connected: ${conn.connection.host}`);
      return true;
    } catch (err) {
      console.error(`❌ Mongo Connection Error: ${err.message}`);
      console.log('Backend will operate in database standby mode until MongoDB is reachable.');
      return false;
    }
  }
};

module.exports = connectDB;
