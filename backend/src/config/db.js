const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/placement_management', {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`✔ Primary Mongo Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`⚠️ Primary MongoDB unavailable: ${error.message}`);
    console.log('Starting Embedded In-Memory MongoDB Engine...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`✔ Embedded In-Memory MongoDB Engine Connected: ${conn.connection.host}`);
      return true;
    } catch (err) {
      console.error(`❌ Mongo Connection Error: ${err.message}`);
      return false;
    }
  }
};

module.exports = connectDB;

