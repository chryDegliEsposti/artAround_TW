const express = require('express');
const router = express.Router();
const Item = require('../models/Item');

// GET /api/items - Get all items (optional filtering by museumId)
router.get('/', async (req, res) => {
    try {
        const { museumId } = req.query;
        let query = {};

        if (museumId) {
            query.museums = museumId;
        }

        const items = await Item.find(query);
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/items/:id - Get specific item
router.get('/:id', async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });
        res.json(item);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// PUT /api/items/:id - Update specific item
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const updatedItem = await Item.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedItem) return res.status(404).json({ message: 'Item not found' });

        res.json(updatedItem);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
