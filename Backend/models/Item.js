import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['Tools', 'Sports', 'Electronics', 'Vehicles', 'Furniture', 'Misc'],
    required: true,
  },
  pricePerDay: {
    type: Number,
    required: true,
    min: 0,
  },
  deposit: {
    type: Number,
    default: 0,
    min: 0,
  },
  images: [{
    type: String,
  }],
  location: {
    city: String,
    state: String,
    zipCode: String,
    address: String,
    latitude: Number,
    longitude: Number,
  },
  pickupInstructions: {
    type: String,
  },
  condition: {
    type: String,
    enum: ['Like New', 'Good', 'Fair'],
    default: 'Good',
  },
  quantityAvailable: {
    type: Number,
    default: 1,
    min: 1,
  },
  tags: [{
    type: String,
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // Optional to allow public item creation without auth
    required: false,
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update rating when reviews change
itemSchema.methods.updateRating = async function () {
  try {
    // Use mongoose.model to avoid circular dependency
    const Review = mongoose.model('Review');
    const reviews = await Review.find({ item: this._id, type: 'item' });
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      this.rating.average = Math.round((totalRating / reviews.length) * 10) / 10; // Round to 1 decimal
      this.rating.count = reviews.length;
    } else {
      this.rating.average = 0;
      this.rating.count = 0;
    }
    await this.save();
  } catch (error) {
    console.error('Error updating item rating:', error);
    throw error;
  }
};

export default mongoose.model('Item', itemSchema);

