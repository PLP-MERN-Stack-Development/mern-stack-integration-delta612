// routes/categories.js - CRUD for categories

const express = require('express');
const { body, validationResult } = require('express-validator');
const Category = require('../models/Category');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /api/categories - list all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort('name');
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/categories - create category (protected)
router.post(
  '/',
  authenticate,
  [body('name').notEmpty().withMessage('Name is required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { name, description } = req.body;
      let existing = await Category.findOne({ name });
      if (existing) return res.status(400).json({ message: 'Category already exists' });

      const category = new Category({ name, description });
      await category.save();
      res.status(201).json(category);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;
