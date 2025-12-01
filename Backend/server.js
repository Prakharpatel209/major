import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Import routes
import authRoutes from './routes/auth.js';
import itemRoutes from './routes/items.js';
import bookingRoutes from './routes/bookings.js';
import paymentRoutes from './routes/payments.js';
import reviewRoutes from './routes/reviews.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory');
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/rental-marketplace';

let reconnectAttempts = 0;
const maxReconnectAttempts = 3;
let isConnecting = false;

const connectDB = async () => {
  // Prevent multiple simultaneous connection attempts
  if (isConnecting) {
    return;
  }

  // Don't reconnect if we've exceeded max attempts
  if (reconnectAttempts >= maxReconnectAttempts && mongoose.connection.readyState === 0) {
    console.log('⚠ MongoDB connection failed after multiple attempts. Server will run without database.');
    console.log('⚠ To retry, restart the server or check your MongoDB connection string.');
    return;
  }

  isConnecting = true;
  
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      socketTimeoutMS: 45000,
    });
    console.log('✓ Connected to MongoDB');
    reconnectAttempts = 0; // Reset on successful connection
    isConnecting = false;
  } catch (error) {
    reconnectAttempts++;
    isConnecting = false;
    
    if (reconnectAttempts === 1) {
      // Only show detailed error on first attempt
      console.error('✗ MongoDB connection error:', error.message);
      console.log('');
      console.log('Troubleshooting steps:');
      console.log('1. Check if MongoDB Atlas cluster is running (not paused)');
      console.log('2. Verify your connection string in .env file');
      console.log('3. Check network connectivity and firewall settings');
      console.log('4. Ensure your IP address is whitelisted in MongoDB Atlas');
      console.log('5. For local development, use: mongodb://localhost:27017/rental-marketplace');
      console.log('');
    } else if (reconnectAttempts <= maxReconnectAttempts) {
      console.log(`⚠ MongoDB connection attempt ${reconnectAttempts}/${maxReconnectAttempts} failed. Retrying...`);
    }
    
    // Don't exit the process - allow server to start for testing
    if (process.env.NODE_ENV === 'production' && reconnectAttempts >= maxReconnectAttempts) {
      console.error('✗ Failed to connect to MongoDB in production. Exiting...');
      process.exit(1);
    }
  }
};

// Handle MongoDB connection events
mongoose.connection.on('disconnected', () => {
  if (reconnectAttempts < maxReconnectAttempts) {
    console.log('MongoDB disconnected. Will attempt to reconnect...');
    setTimeout(() => {
      if (reconnectAttempts < maxReconnectAttempts) {
        connectDB();
      }
    }, 10000); // Wait 10 seconds before reconnecting
  }
});

mongoose.connection.on('error', (err) => {
  if (reconnectAttempts === 1) {
    // Only log error on first attempt to avoid spam
    console.error('MongoDB connection error:', err.message);
  }
});

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {},
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;

