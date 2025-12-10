const express = require('express');
const router = express.Router();

const visit = require('../models/Visit');

// API/GET/
router.get('/', async (req, res) => {
    const { Query, limit } = req.query;
    try {
        const foundVisits = await visit.find({
            title: { $regex: Query, $options: 'i' }
        }).limit(limit);
        res.json(foundVisits);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/visits - Crea una nuova visita
router.post('/', async (req, res) => {
    try {
        const visitData = req.body;

        const newVisit = new visit(visitData);
        const savedVisit = await newVisit.save();

        res.status(201).json(savedVisit);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;