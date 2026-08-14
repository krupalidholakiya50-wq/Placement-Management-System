const app = require('./app');
const connectDB = require('./config/db');
const seedData = require('./config/seeder');

const PORT = process.env.PORT || 5000;

// Start Server & Connect Database
const startServer = async () => {
  console.log('Starting Placement Management Backend Server...');
  const connected = await connectDB();
  
  if (connected) {
    await seedData();
  }

  app.listen(PORT, () => {
    console.log(`✔ Backend Running on port ${PORT}`);
    console.log(`🚀 API Base URL: http://localhost:${PORT}/api`);
  });
};

startServer();
