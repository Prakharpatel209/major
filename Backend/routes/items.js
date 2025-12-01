import express from 'express';
import { body, validationResult, query } from 'express-validator';
import Item from '../models/Item.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { upload } from '../utils/upload.js';

const router = express.Router();

// In development, allow creating items without auth to ease testing
const allowPublicCreate =
  process.env.ALLOW_PUBLIC_ITEM_CREATE === 'true' || process.env.NODE_ENV === 'development';

// Get all items with filters
router.get(
  '/',
  [
    query('category').optional().isIn(['Tools', 'Sports', 'Electronics', 'Vehicles', 'Furniture', 'Misc']),
    query('search').optional().isString(),
    query('minPrice').optional().isNumeric(),
    query('maxPrice').optional().isNumeric(),
    query('location').optional().isString(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        category,
        search,
        minPrice,
        maxPrice,
        location,
        page = 1,
        limit = 20,
      } = req.query;

      const query = { isAvailable: true };

      if (category) {
        query.category = category;
      }

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } },
        ];
      }

      if (minPrice || maxPrice) {
        query.pricePerDay = {};
        if (minPrice) query.pricePerDay.$gte = parseFloat(minPrice);
        if (maxPrice) query.pricePerDay.$lte = parseFloat(maxPrice);
      }

      if (location) {
        query.$or = [
          ...(query.$or || []),
          { 'location.city': { $regex: location, $options: 'i' } },
          { 'location.zipCode': location },
        ];
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const items = await Item.find(query)
        .populate('owner', 'name avatar email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Item.countDocuments(query);

      res.json({
        items,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Get single item
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('owner', 'name avatar email phone location');
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create item (seller/admin only)
router.post(
  '/',
  // Allow public creation (no auth) to unblock listing in development/for demos
  upload.array('images', 10),
  [
    body('title').notEmpty().trim(),
    body('description').notEmpty().trim(),
    body('category').isIn(['Tools', 'Sports', 'Electronics', 'Vehicles', 'Furniture', 'Misc']),
    body('pricePerDay').isFloat({ min: 0 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        title,
        description,
        category,
        pricePerDay,
        deposit,
        location,
        pickupInstructions,
        condition,
        quantityAvailable,
        tags,
      } = req.body;

      const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

      const item = new Item({
        title,
        description,
        category,
        pricePerDay: parseFloat(pricePerDay),
        deposit: deposit ? parseFloat(deposit) : 0,
        images,
        location: location ? JSON.parse(location) : {},
        pickupInstructions,
        condition: condition || 'Good',
        quantityAvailable: quantityAvailable ? parseInt(quantityAvailable) : 1,
        tags: tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [],
        // Owner is optional when unauthenticated creation is allowed
        owner: req.user?._id,
      });

      await item.save();
      await item.populate('owner', 'name avatar email');

      res.status(201).json(item);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Update item (owner/admin only)
router.put(
  '/:id',
  authenticate,
  upload.array('images', 10),
  async (req, res) => {
    try {
      const item = await Item.findById(req.params.id);

      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }

      // Check if user is owner or admin
      if (item.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
      }

      const updateFields = [
        'title',
        'description',
        'category',
        'pricePerDay',
        'deposit',
        'location',
        'pickupInstructions',
        'condition',
        'quantityAvailable',
        'tags',
        'isAvailable',
      ];

      updateFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          if (field === 'location' || field === 'tags') {
            item[field] = typeof req.body[field] === 'string' ? JSON.parse(req.body[field]) : req.body[field];
          } else if (field === 'pricePerDay' || field === 'deposit') {
            item[field] = parseFloat(req.body[field]);
          } else if (field === 'quantityAvailable') {
            item[field] = parseInt(req.body[field]);
          } else {
            item[field] = req.body[field];
          }
        }
      });

      if (req.files && req.files.length > 0) {
        const newImages = req.files.map(file => `/uploads/${file.filename}`);
        item.images = [...item.images, ...newImages];
      }

      item.updatedAt = Date.now();
      await item.save();
      await item.populate('owner', 'name avatar email');

      res.json(item);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Delete item (owner/admin only)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if user is owner or admin
    if (item.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await item.deleteOne();

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's items
router.get('/user/my-items', authenticate, authorize('seller', 'admin'), async (req, res) => {
  try {
    const items = await Item.find({ owner: req.user._id })
      .populate('owner', 'name avatar email')
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

