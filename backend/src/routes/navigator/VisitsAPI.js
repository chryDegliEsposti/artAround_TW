const express = require('express');
const router = express.Router();
const Visit = require('../../models/Visit');

router.get('/get/upcomingVisits', async (req, res) => {
    try {
        const visits = await Visit.find().populate('museum').limit(5);
        if(!visits || visits.length === 0) {
            return res.json([{ id: 101, museum: 'City Art Museum', date: '2026-04-15', time: '10:00', type: 'Guided Tour', image: 'https://images.unsplash.com/photo-1518998053401-a41490201d4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60' }]);
        }
        res.json(visits.map(v => ({
            id: v._id,
            museum: v.museum?.name || "Museum View",
            date: "Next Weekend",
            time: "10:00 AM",
            type: v.title || "Tour",
            image: "https://images.unsplash.com/photo-1518998053401-a41490201d4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"
        })));
    } catch(e) {
        res.status(500).json({ message: e.message });
    }
});

router.get('/get/pastVisits', async (req, res) => {
    try {
        const visits = await Visit.find().populate('museum').skip(5).limit(5);
        if(!visits || visits.length === 0) {
            return res.json([{ id: 201, museum: 'Natural History Museum', date: '2025-11-20', time: '14:30', type: 'Self Audio Tour', image: 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60' }]);
        }
        res.json(visits.map(v => ({
            id: v._id,
            museum: v.museum?.name || "Past Museum",
            date: "Last Year",
            time: "14:30",
            type: v.title || "Self Tour",
            image: "https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"
        })));
    } catch(e) {
        res.status(500).json({ message: e.message });
    }
});

module.exports = router;