import express from 'express';
import { body, validationResult } from 'express-validator';
import Booking from '../models/Booking.js';
import Item from '../models/Item.js';
import Payment from '../models/Payment.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all bookings for current user
router.get('/', authenticate, async (req, res) => {
  try {
    const { type, status } = req.query;
    const query = {};

    if (type === 'renter') {
      query.renter = req.user._id;
    } else if (type === 'owner') {
      query.owner = req.user._id;
    } else {
      // Get all bookings where user is either renter or owner
      query.$or = [
        { renter: req.user._id },
        { owner: req.user._id },
      ];
    }

    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('item', 'title images pricePerDay category')
      .populate('renter', 'name email phone avatar')
      .populate('owner', 'name email phone avatar')
      .populate('payment')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single booking
router.get('/:id', authenticate, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('item', 'title images pricePerDay category location pickupInstructions')
      .populate('renter', 'name email phone avatar location')
      .populate('owner', 'name email phone avatar location')
      .populate('payment');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is renter, owner, or admin
    const renterId = booking.renter._id ? booking.renter._id.toString() : booking.renter.toString();
    const ownerId = booking.owner._id ? booking.owner._id.toString() : booking.owner.toString();
    
    if (
      renterId !== req.user._id.toString() &&
      ownerId !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create booking
router.post(
  '/',
  authenticate,
  [
    body('itemId').notEmpty(),
    body('startDate').isISO8601(),
    body('endDate').isISO8601(),
    body('contactEmail').isEmail(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { itemId, startDate, endDate, contactEmail, contactPhone, insuranceCost = 15 } = req.body;

      const item = await Item.findById(itemId);
      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }

      if (!item.isAvailable) {
        return res.status(400).json({ message: 'Item is not available' });
      }

      // Check if item owner is trying to book their own item
      if (item.owner.toString() === req.user._id.toString()) {
        return res.status(400).json({ message: 'Cannot book your own item' });
      }

      // Calculate days
      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

      if (days < 1) {
        return res.status(400).json({ message: 'Invalid date range' });
      }

      // Check for overlapping bookings
      const overlappingBookings = await Booking.find({
        item: itemId,
        status: { $in: ['pending', 'confirmed', 'active'] },
        $or: [
          {
            startDate: { $lte: end },
            endDate: { $gte: start },
          },
        ],
      });

      if (overlappingBookings.length > 0) {
        return res.status(400).json({ message: 'Item is already booked for these dates' });
      }

      // Calculate costs
      const subtotal = item.pricePerDay * days;
      const serviceFee = 24;
      const taxes = Math.round(subtotal * 0.08);
      const deposit = item.deposit || Math.round(item.pricePerDay * days);
      const totalAmount = subtotal + insuranceCost + serviceFee + taxes;

      const booking = new Booking({
        item: itemId,
        renter: req.user._id,
        owner: item.owner,
        startDate: start,
        endDate: end,
        days,
        pricePerDay: item.pricePerDay,
        subtotal,
        insuranceCost,
        serviceFee,
        taxes,
        deposit,
        totalAmount,
        contactEmail,
        contactPhone,
        status: 'pending',
      });

      await booking.save();
      await booking.populate('item', 'title images pricePerDay category');
      await booking.populate('renter', 'name email phone avatar');
      await booking.populate('owner', 'name email phone avatar');

      res.status(201).json(booking);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Update booking status
router.patch(
  '/:id/status',
  authenticate,
  [body('status').isIn(['pending', 'confirmed', 'active', 'completed', 'cancelled'])],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const booking = await Booking.findById(req.params.id);

      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      // Check authorization
      const isOwner = booking.owner.toString() === req.user._id.toString();
      const isRenter = booking.renter.toString() === req.user._id.toString();
      const isAdmin = req.user.role === 'admin';

      if (!isOwner && !isRenter && !isAdmin) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      const { status } = req.body;

      // Status transition validation
      if (status === 'confirmed' && !isOwner && !isAdmin) {
        return res.status(403).json({ message: 'Only owner can confirm booking' });
      }

      if (status === 'cancelled' && booking.status === 'completed') {
        return res.status(400).json({ message: 'Cannot cancel completed booking' });
      }

      booking.status = status;
      booking.updatedAt = Date.now();
      await booking.save();

      await booking.populate('item', 'title images pricePerDay category');
      await booking.populate('renter', 'name email phone avatar');
      await booking.populate('owner', 'name email phone avatar');
      await booking.populate('payment');

      res.json(booking);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Cancel booking
router.post('/:id/cancel', authenticate, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check authorization
    const isOwner = booking.owner.toString() === req.user._id.toString();
    const isRenter = booking.renter.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isRenter && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel completed booking' });
    }

    booking.status = 'cancelled';
    booking.updatedAt = Date.now();
    await booking.save();

    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

