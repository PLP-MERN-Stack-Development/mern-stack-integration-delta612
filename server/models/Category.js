// Category.js - Mongoose model for post categories

const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a category name'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

CategorySchema.pre('save', function (next) {
  if (!this.isModified('name')) return next();
  // Minimal slug normalization: lowercase, remove non-word characters, trim and replace spaces with hyphens
  this.slug = this.name
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .trim()
    .replace(/ +/g, '-');
  next();
});

module.exports = mongoose.model('Category', CategorySchema);
