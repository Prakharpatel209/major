import express from 'express';
import { body, validationResult } from 'express-validator';
import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import Item from '../models/Item.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get reviews for an item
router.get('/item/:itemId', async (req, res) => {
  try {
    const reviews = await Review.find({ item: req.params.itemId, type: 'item' })
      .populate('reviewer', 'name avatar')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get reviews for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'name avatar')
      .populate('item', 'title images')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create review
router.post(
  '/',
  authenticate,
  [
    body('bookingId').notEmpty(),
    body('rating').isInt({ min: 1, max: 5 }),
    body('type').isIn(['item', 'renter', 'owner']),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { bookingId, rating, comment, type } = req.body;

      const booking = await Booking.findById(bookingId)
        .populate('item')
        .populate('renter')
        .populate('owner');

      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      // Check if booking is completed
      if (booking.status !== 'completed') {
        return res.status(400).json({ message: 'Can only review completed bookings' });
      }

      // Determine reviewer and reviewee based on type
      let reviewer, reviewee, item;
      
      // Get IDs from populated or unpopulated fields
      const ownerId = booking.owner._id ? booking.owner._id : booking.owner;
      const renterId = booking.renter._id ? booking.renter._id : booking.renter;
      const itemId = booking.item._id ? booking.item._id : booking.item;
      
      if (type === 'item') {
        reviewer = req.user._id;
        reviewee = ownerId;
        item = itemId;
      } else if (type === 'renter') {
        // Owner reviewing renter
        if (ownerId.toString() !== req.user._id.toString()) {
          return res.status(403).json({ message: 'Only owner can review renter' });
        }
        reviewer = req.user._id;
        reviewee = renterId;
        item = itemId;
      } else if (type === 'owner') {
        // Renter reviewing owner
        if (renterId.toString() !== req.user._id.toString()) {
          return res.status(403).json({ message: 'Only renter can review owner' });
        }
        reviewer = req.user._id;
        reviewee = ownerId;
        item = itemId;
      }

      // Check if review already exists
      const existingReview = await Review.findOne({
        booking: bookingId,
        reviewer: reviewer,
        type: type,
      });

      if (existingReview) {
        return res.status(400).json({ message: 'Review already exists for this booking' });
      }

      const review = new Review({
        item,
        booking: bookingId,
        reviewer,
        reviewee,
        rating: parseInt(rating),
        comment: comment || '',
        type,
      });

      await review.save();

      // Update item rating if type is 'item'
      if (type === 'item') {
        const itemDoc = await Item.findById(item);
        if (itemDoc) {
          await itemDoc.updateRating();
        }
      }

      await review.populate('reviewer', 'name avatar');
      await review.populate('reviewee', 'name avatar');
      await review.populate('item', 'title images');

      res.status(201).json(review);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Update review
router.put(
  '/:id',
  authenticate,
  [
    body('rating').optional().isInt({ min: 1, max: 5 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const review = await Review.findById(req.params.id);

      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }

      // Check if user is the reviewer
      if (review.reviewer.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      if (req.body.rating) {
        review.rating = parseInt(req.body.rating);
      }
      if (req.body.comment !== undefined) {
        review.comment = req.body.comment;
      }

      review.updatedAt = Date.now();
      await review.save();

      // Update item rating if type is 'item'
      if (review.type === 'item') {
        const itemDoc = await Item.findById(review.item);
        if (itemDoc) {
          await itemDoc.updateRating();
        }
      }

      await review.populate('reviewer', 'name avatar');
      await review.populate('reviewee', 'name avatar');
      await review.populate('item', 'title images');

      res.json(review);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Delete review
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user is the reviewer or admin
    if (review.reviewer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const itemId = review.item;
    const type = review.type;

    await review.deleteOne();

    // Update item rating if type is 'item'
    if (type === 'item') {
      const itemDoc = await Item.findById(itemId);
      if (itemDoc) {
        await itemDoc.updateRating();
      }
    }

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

