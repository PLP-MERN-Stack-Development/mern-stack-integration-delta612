// routes/posts.js - CRUD for posts

const express = require('express');
const { body, validationResult } = require('express-validator');
const Post = require('../models/Post');
const Category = require('../models/Category');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Helper: find by id or slug
async function findPostByIdOrSlug(idOrSlug) {
  if (!idOrSlug) return null;
  if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
    const p = await Post.findById(idOrSlug).populate('author', 'name').populate('category', 'name');
    if (p) return p;
  }
  const p = await Post.findOne({ slug: idOrSlug }).populate('author', 'name').populate('category', 'name');
  return p;
}

// GET /api/posts - list posts (pagination + optional category)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const category = req.query.category;
    const filter = {};
    if (category) {
      const cat = await Category.findOne({ slug: category }) || await Category.findById(category).catch(() => null);
      if (cat) filter.category = cat._id;
    }

    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('author', 'name')
      .populate('category', 'name');

    const total = await Post.countDocuments(filter);
    res.json({ posts, page, limit, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/posts/:id - get single post by id or slug
router.get('/:id', async (req, res) => {
  try {
    const post = await findPostByIdOrSlug(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    // increment view count (fire and forget)
    post.incrementViewCount().catch(() => {});
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/posts - create post (protected)
router.post(
  '/',
  authenticate,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required'),
    body('category').notEmpty().withMessage('Category is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { title, content, excerpt, featuredImage, tags, category, isPublished } = req.body;
      // Resolve category
      let cat = await Category.findById(category).catch(() => null);
      if (!cat) cat = await Category.findOne({ slug: category }).catch(() => null);
      if (!cat) return res.status(400).json({ message: 'Invalid category' });

      const post = new Post({
        title,
        content,
        excerpt,
        featuredImage,
        tags,
        category: cat._id,
        author: req.user._id,
        isPublished: !!isPublished,
      });
      await post.save();
      res.status(201).json(post);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// PUT /api/posts/:id - update post (protected, author only or admin)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const post = await findPostByIdOrSlug(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    // authorize
    if (String(post.author) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatable = ['title', 'content', 'excerpt', 'featuredImage', 'tags', 'isPublished'];
    updatable.forEach((f) => {
      if (f in req.body) post[f] = req.body[f];
    });

    if (req.body.category) {
      let cat = await Category.findById(req.body.category).catch(() => null);
      if (!cat) cat = await Category.findOne({ slug: req.body.category }).catch(() => null);
      if (cat) post.category = cat._id;
    }

    await post.save();
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/posts/:id - delete post (protected)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const post = await findPostByIdOrSlug(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (String(post.author) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await post.remove();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/posts/:id/comments - add comment (protected)
router.post('/:id/comments', authenticate, [body('content').notEmpty()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const post = await findPostByIdOrSlug(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    await post.addComment(req.user._id, req.body.content);
    res.status(201).json({ message: 'Comment added' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/posts/search?q=term - simple search
router.get('/search', async (req, res) => {
  try {
    const q = req.query.q || '';
    const posts = await Post.find({ $text: { $search: q } }).limit(20).populate('author', 'name');
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
