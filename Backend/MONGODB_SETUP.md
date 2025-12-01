# MongoDB Connection Setup Guide

## Issue: MongoDB Connection Failing

If you're seeing errors like:
```
querySrv ENOTFOUND _mongodb._tcp.cluster0.ppgytiu.mongodb.net
```

This means the MongoDB Atlas cluster cannot be reached. Here's how to fix it:

## Option 1: Fix MongoDB Atlas Connection (Recommended for Production)

### Step 1: Verify Your MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Log in to your account
3. Check if your cluster is **running** (not paused)
4. If paused, click "Resume" to start it

### Step 2: Get the Correct Connection String

1. In MongoDB Atlas, click **"Connect"** on your cluster
2. Choose **"Connect your application"**
3. Select **Node.js** as the driver
4. Copy the connection string (it should look like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 3: Update Your .env File

1. Open `Backend/.env`
2. Replace the `MONGODB_URI` with your connection string
3. **Important**: Add your database name after the `/`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/rental-marketplace?retryWrites=true&w=majority
   ```
   Note the `/rental-marketplace` before the `?`

### Step 4: Whitelist Your IP Address

1. In MongoDB Atlas, go to **Network Access**
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for development) or add your specific IP
4. Click **"Confirm"**

### Step 5: Verify Database User

1. In MongoDB Atlas, go to **Database Access**
2. Ensure your database user exists and has the correct password
3. The user should have at least **"Read and write to any database"** permission

### Step 6: Test the Connection

Restart your server:
```bash
npm run dev
```

## Option 2: Use Local MongoDB (Recommended for Development)

If you want to use a local MongoDB instance for development:

### Step 1: Install MongoDB Locally

**Windows:**
1. Download MongoDB from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Install MongoDB Community Server
3. MongoDB will start automatically as a Windows service

**Or use Docker:**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Step 2: Update .env File

Change your `.env` file to use local MongoDB:
```env
MONGODB_URI=mongodb://localhost:27017/rental-marketplace
```

### Step 3: Restart Server

```bash
npm run dev
```

## Option 3: Use MongoDB Atlas Free Tier (Alternative)

If your current cluster is deleted or paused:

1. Create a new free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Follow the setup steps above
3. Update your `.env` file with the new connection string

## Common Issues and Solutions

### Issue: "ENOTFOUND" Error
- **Cause**: Cluster hostname doesn't exist or DNS can't resolve it
- **Solution**: Verify cluster is running and connection string is correct

### Issue: "Authentication failed"
- **Cause**: Wrong username or password
- **Solution**: Check database user credentials in MongoDB Atlas

### Issue: "IP not whitelisted"
- **Cause**: Your IP address is not in the whitelist
- **Solution**: Add your IP to MongoDB Atlas Network Access

### Issue: "Connection timeout"
- **Cause**: Firewall or network blocking connection
- **Solution**: Check firewall settings, try different network, or use local MongoDB

## Testing Your Connection

You can test your MongoDB connection using this script:

```bash
node -e "
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✓ MongoDB connection successful!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('✗ MongoDB connection failed:', error.message);
    process.exit(1);
  });
"
```

## Current Connection String Format

Your current `.env` should have:
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/rental-marketplace?retryWrites=true&w=majority
```

**Important points:**
- Replace `username` and `password` with your actual credentials
- Replace `cluster0.xxxxx.mongodb.net` with your actual cluster hostname
- Include `/rental-marketplace` before the `?` (this is your database name)
- Keep the query parameters (`?retryWrites=true&w=majority`)

## Need Help?

If you're still having issues:
1. Check MongoDB Atlas status page
2. Verify your cluster is not paused
3. Try using local MongoDB for development
4. Check your internet connection and firewall settings

