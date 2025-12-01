# Rental Marketplace Backend API

Backend API for the rental marketplace application built with Node.js, Express, and MongoDB.

## Features

- User authentication and authorization (JWT)
- User roles: Renter, Seller, Admin
- Item management (CRUD operations)
- Booking system
- Payment processing
- Reviews and ratings
- Image uploads
- Search and filtering

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Multer** - File uploads
- **bcryptjs** - Password hashing
- **express-validator** - Request validation

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory and add your environment variables:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/rental-marketplace
JWT_SECRET=your-super-secret-jwt-key
```

3. Create the `uploads` directory for file uploads:
```bash
mkdir uploads
```

4. Make sure MongoDB is running on your system.

5. Start the server:
```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)
- `PUT /api/auth/me` - Update user profile (requires auth)

### Items
- `GET /api/items` - Get all items (with filters: category, search, minPrice, maxPrice, location, page, limit)
- `GET /api/items/:id` - Get single item
- `POST /api/items` - Create item (requires auth, seller/admin only)
- `PUT /api/items/:id` - Update item (requires auth, owner/admin only)
- `DELETE /api/items/:id` - Delete item (requires auth, owner/admin only)
- `GET /api/items/user/my-items` - Get user's items (requires auth, seller/admin only)

### Bookings
- `GET /api/bookings` - Get all bookings for current user (requires auth, query params: type, status)
- `GET /api/bookings/:id` - Get single booking (requires auth)
- `POST /api/bookings` - Create booking (requires auth)
- `PATCH /api/bookings/:id/status` - Update booking status (requires auth)
- `POST /api/bookings/:id/cancel` - Cancel booking (requires auth)

### Payments
- `POST /api/payments` - Create payment (requires auth)
- `GET /api/payments/:id` - Get payment by ID (requires auth)
- `GET /api/payments/user/my-payments` - Get user's payments (requires auth)
- `PATCH /api/payments/:id/status` - Update payment status (requires auth, admin only)

### Reviews
- `GET /api/reviews/item/:itemId` - Get reviews for an item
- `GET /api/reviews/user/:userId` - Get reviews for a user
- `POST /api/reviews` - Create review (requires auth)
- `PUT /api/reviews/:id` - Update review (requires auth)
- `DELETE /api/reviews/:id` - Delete review (requires auth)

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-token>
```

## Request/Response Examples

### Register User
```json
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "role": "renter",
  "name": "John Doe"
}
```

### Create Item
```json
POST /api/items
Headers: Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "title": "Sony A7 III Camera",
  "description": "Professional camera in excellent condition",
  "category": "Electronics",
  "pricePerDay": 42,
  "deposit": 200,
  "location": "{\"city\": \"San Francisco\", \"state\": \"CA\", \"zipCode\": \"94102\"}",
  "condition": "Like New",
  "tags": "[\"camera\", \"photography\", \"professional\"]",
  "images": [file1, file2, ...]
}
```

### Create Booking
```json
POST /api/bookings
Headers: Authorization: Bearer <token>
{
  "itemId": "item-id-here",
  "startDate": "2024-01-15T00:00:00Z",
  "endDate": "2024-01-18T00:00:00Z",
  "contactEmail": "renter@example.com",
  "contactPhone": "+1234567890",
  "insuranceCost": 15
}
```

## Database Models

### User
- email, password, phone, role, name, avatar, location, isVerified

### Item
- title, description, category, pricePerDay, deposit, images, location, condition, quantityAvailable, tags, owner, rating, isAvailable

### Booking
- item, renter, owner, startDate, endDate, days, pricePerDay, subtotal, insuranceCost, serviceFee, taxes, deposit, totalAmount, status, payment

### Payment
- booking, user, amount, paymentMethod, paymentDetails, status, transactionId

### Review
- item, booking, reviewer, reviewee, rating, comment, type

## Error Handling

The API returns standard HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

Error response format:
```json
{
  "message": "Error message",
  "errors": ["Validation errors"]
}
```

## Development

- The server runs on port 5000 by default
- MongoDB connection string can be configured in `.env`
- File uploads are stored in the `uploads/` directory
- JWT tokens expire after 30 days

## Production Considerations

- Change JWT_SECRET to a strong random string
- Use a production MongoDB database (MongoDB Atlas)
- Set up proper file storage (AWS S3, Cloudinary, etc.)
- Enable HTTPS
- Set up proper CORS configuration
- Add rate limiting
- Implement proper logging
- Set up monitoring and error tracking
- Use environment-specific configurations

## License

ISC

