import express from 'express';
import { body, validationResult } from 'express-validator';
import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Create payment
router.post(
  '/',
  authenticate,
  [
    body('bookingId').notEmpty(),
    body('paymentMethod').isIn(['card', 'paypal', 'upi', 'bank']),
    body('amount').isFloat({ min: 0 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { bookingId, paymentMethod, amount, paymentDetails } = req.body;

      const booking = await Booking.findById(bookingId);

      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      // Check if user is the renter
      if (booking.renter.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      // Check if payment already exists
      if (booking.payment) {
        return res.status(400).json({ message: 'Payment already exists for this booking' });
      }

      // Create payment record
      const payment = new Payment({
        booking: bookingId,
        user: req.user._id,
        amount: parseFloat(amount),
        paymentMethod,
        paymentDetails: paymentDetails || {},
        status: 'completed', // In production, this would be handled by payment gateway
        transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
      });

      await payment.save();

      // Update booking with payment reference and status
      booking.payment = payment._id;
      booking.status = 'confirmed';
      await booking.save();

      await payment.populate('booking', 'item renter owner startDate endDate totalAmount');
      await payment.populate('user', 'name email');

      res.status(201).json(payment);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Get payment by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('booking', 'item renter owner startDate endDate totalAmount')
      .populate('user', 'name email');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check authorization
    const bookingId = payment.booking._id ? payment.booking._id : payment.booking;
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    if (
      booking.renter.toString() !== req.user._id.toString() &&
      booking.owner.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's payments
router.get('/user/my-payments', authenticate, async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate('booking', 'item renter owner startDate endDate totalAmount status')
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update payment status (admin only)
router.patch(
  '/:id/status',
  authenticate,
  [
    body('status').isIn(['pending', 'completed', 'failed', 'refunded']),
  ],
  async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const payment = await Payment.findById(req.params.id);

      if (!payment) {
        return res.status(404).json({ message: 'Payment not found' });
      }

      payment.status = req.body.status;
      payment.updatedAt = Date.now();
      await payment.save();

      await payment.populate('booking', 'item renter owner startDate endDate totalAmount');
      await payment.populate('user', 'name email');

      res.json(payment);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

export default router;

