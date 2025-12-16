const express = require('express');
const router = express.Router();
const Author = require('../models/Author');

// GET /api/authors - Search authors by name
router.get('/', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ message: 'Query parameter "q" is required' });
        }

        const authors = await Author.find({
            name: { $regex: q, $options: 'i' }
        }).limit(10);

        res.json(authors);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
