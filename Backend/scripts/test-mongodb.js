import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const mongoUri = process.env.MONGODB_URI;

console.log('Testing MongoDB connection...');
console.log('Connection string:', mongoUri ? mongoUri.replace(/:[^:@]+@/, ':****@') : 'Not set');
console.log('');

if (!mongoUri) {
  console.error('✗ MONGODB_URI is not set in .env file');
  process.exit(1);
}

mongoose
  .connect(mongoUri, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log('✓ Successfully connected to MongoDB!');
    console.log('✓ Database:', mongoose.connection.name);
    console.log('✓ Host:', mongoose.connection.host);
    mongoose.connection.close();
    process.exit(0);
  })
  .catch((error) => {
    console.error('✗ MongoDB connection failed!');
    console.error('');
    console.error('Error details:');
    console.error('  Message:', error.message);
    console.error('  Code:', error.code);
    console.error('');
    console.error('Possible causes:');
    console.error('  1. MongoDB Atlas cluster is paused or deleted');
    console.error('  2. Incorrect connection string');
    console.error('  3. Network/DNS issues');
    console.error('  4. IP address not whitelisted');
    console.error('  5. Wrong username or password');
    console.error('');
    console.error('Solutions:');
    console.error('  1. Check MongoDB Atlas dashboard - is cluster running?');
    console.error('  2. Verify connection string in .env file');
    console.error('  3. Try using local MongoDB: mongodb://localhost:27017/rental-marketplace');
    console.error('  4. Check MONGODB_SETUP.md for detailed instructions');
    process.exit(1);
  });

