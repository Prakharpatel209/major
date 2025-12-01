# Quick Fix: MongoDB Connection Issue

## Problem
Your MongoDB Atlas cluster (`cluster0.ppgytiu.mongodb.net`) cannot be reached. The DNS lookup is failing, which means the cluster is either:
- **Paused** (most common)
- **Deleted**
- **Unreachable** due to network issues

## Quick Solution: Use Local MongoDB (Recommended for Development)

### Option 1: Use Local MongoDB (Easiest)

1. **Install MongoDB locally** (if not already installed):
   - Download from: https://www.mongodb.com/try/download/community
   - Or use Docker: `docker run -d -p 27017:27017 --name mongodb mongo:latest`

2. **Update your `.env` file**:
   ```env
   MONGODB_URI=mongodb://localhost:27017/rental-marketplace
   ```

3. **Restart your server**:
   ```bash
   npm run dev
   ```

### Option 2: Fix MongoDB Atlas Connection

#### Step 1: Check if Cluster is Paused
1. Go to https://cloud.mongodb.com
2. Log in to your account
3. Check if your cluster shows "Paused" - if so, click "Resume"

#### Step 2: Get a New Connection String
1. In MongoDB Atlas, click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Update your `.env` file with the new connection string
5. **Make sure to add the database name**: `/rental-marketplace` before the `?`

#### Step 3: Whitelist Your IP
1. Go to "Network Access" in MongoDB Atlas
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
4. Or add your current IP address

#### Step 4: Verify Database User
1. Go to "Database Access"
2. Ensure your user exists and password is correct
3. User should have "Read and write to any database" permission

#### Step 5: Test Connection
```bash
npm run test-mongodb
```

## Test Your Connection

Run this command to test your MongoDB connection:
```bash
npm run test-mongodb
```

## Current Status

Your connection string format looks correct, but the cluster hostname cannot be resolved. This typically means:
- The cluster is **paused** (most likely)
- The cluster was **deleted**
- There's a **network/DNS issue**

## Recommended Action

**For development**: Use local MongoDB (Option 1 above) - it's faster and doesn't require internet.

**For production**: Fix your MongoDB Atlas cluster (Option 2 above).

## Need More Help?

See `MONGODB_SETUP.md` for detailed instructions.

