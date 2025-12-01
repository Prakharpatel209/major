# Environment Configuration

Create a `.env` file in the Backend directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/rental-marketplace

# JWT Secret (change this to a strong random string in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Cloudinary Configuration (optional, for image uploads to cloud)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Notes

- **PORT**: The port on which the server will run (default: 5000)
- **NODE_ENV**: Set to "production" for production deployment
- **MONGODB_URI**: MongoDB connection string. For local development, use `mongodb://localhost:27017/rental-marketplace`. For production, use MongoDB Atlas or another cloud MongoDB service.
- **JWT_SECRET**: A secret key used to sign JWT tokens. Generate a strong random string for production.
- **Cloudinary**: Optional. If you want to upload images to Cloudinary instead of local storage, provide these credentials.

## Generating JWT Secret

You can generate a secure JWT secret using:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

