const express = require('express');
const router = express.Router();
const connectToDatabase = require('./connect');

const mockUpcomingVisits = [
    { id: 101, museum: 'City Art Museum', date: '2026-04-15', time: '10:00', type: 'Guided Tour', image: 'https://images.unsplash.com/photo-1518998053401-a41490201d4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60' }
];

const mockPastVisits = [
    { id: 201, museum: 'Natural History Museum', date: '2025-11-20', time: '14:30', type: 'Self Audio Tour', image: 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60' },
    { id: 202, museum: 'Science Center', date: '2025-08-05', time: '09:00', type: 'Interactive Plan', image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60' }
];

router.get('/get/mockUpcomingVisits/:id', async (req, res) => {
    if (req.params.id == 1) {
        res.json(mockUpcomingVisits);
    } else {
        res.status(404).json({ message: "No upcoming visits found" });
    }
});

router.get('/get/mockPastVisits/:id', async (req, res) => {
    if (req.params.id == 1) {
        res.json(mockPastVisits);
    } else {
        res.status(404).json({ message: "No past visits found" });
    }
});

module.exports = router;