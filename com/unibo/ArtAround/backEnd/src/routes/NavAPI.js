const express = require('express');
const router = express.Router();
const Visit = require('../models/Visit');

// Start a visit navigation
// GET /api/nav/start/:visitId
router.get('/start/:visitId', async (req, res) => {
    try {
        const visit = await Visit.findById(req.params.visitId).populate('items');
        if (!visit) return res.status(404).json({ message: 'Visit not found' });

        if (visit.items.length === 0) {
            return res.status(400).json({ message: 'Visit has no items' });
        }

        // Return the first item and total count
        res.json({
            currentItem: visit.items[0],
            currentIndex: 0,
            totalItems: visit.items.length,
            hasNext: visit.items.length > 1,
            hasPrev: false
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get next item
// GET /api/nav/next/:visitId/:currentItemId
router.get('/next/:visitId/:currentItemId', async (req, res) => {
    try {
        const visit = await Visit.findById(req.params.visitId).populate('items');
        if (!visit) return res.status(404).json({ message: 'Visit not found' });

        const currentIndex = visit.items.findIndex(item => item._id.toString() === req.params.currentItemId);
        
        if (currentIndex === -1) {
            return res.status(404).json({ message: 'Current item not found in visit' });
        }

        const nextIndex = currentIndex + 1;
        if (nextIndex >= visit.items.length) {
            return res.json({ 
                message: 'End of visit reached',
                completed: true,
                currentItem: visit.items[currentIndex],
                currentIndex: currentIndex,
                totalItems: visit.items.length
            });
        }

        res.json({
            currentItem: visit.items[nextIndex],
            currentIndex: nextIndex,
            totalItems: visit.items.length,
            hasNext: nextIndex < visit.items.length - 1,
            hasPrev: true
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get previous item
// GET /api/nav/prev/:visitId/:currentItemId
router.get('/prev/:visitId/:currentItemId', async (req, res) => {
    try {
        const visit = await Visit.findById(req.params.visitId).populate('items');
        if (!visit) return res.status(404).json({ message: 'Visit not found' });

        const currentIndex = visit.items.findIndex(item => item._id.toString() === req.params.currentItemId);
        
        if (currentIndex === -1) {
            return res.status(404).json({ message: 'Current item not found in visit' });
        }

        const prevIndex = currentIndex - 1;
        if (prevIndex < 0) {
            return res.status(400).json({ message: 'Start of visit reached' });
        }

        res.json({
            currentItem: visit.items[prevIndex],
            currentIndex: prevIndex,
            totalItems: visit.items.length,
            hasNext: true,
            hasPrev: prevIndex > 0
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;