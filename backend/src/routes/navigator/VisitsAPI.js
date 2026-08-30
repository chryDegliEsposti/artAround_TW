const express = require('express');
const router = express.Router();
const Visit = require('../../models/Visit');
const Quiz = require('../../models/Quiz');

/**
 * GET /api/v1/navigator/visits/quiz
 * Get the latest active quiz
 */
router.get('/quiz', async (req, res) => {
    try {
        const quiz = await Quiz.findOne().populate('visit');
        if (!quiz) return res.status(404).json({ error: 'Nessun quiz trovato' });
        res.json(quiz);
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});

/**
 * GET /api/v1/navigator/visits/quiz/:visitId
 * Get the quiz for a specific visit
 */
router.get('/quiz/:visitId', async (req, res) => {
    try {
        const quiz = await Quiz.findOne({ visit: req.params.visitId }).populate('visit');
        if (!quiz) {
            // fallback: return default quiz
            const defaultQuiz = await Quiz.findOne().populate('visit');
            if (defaultQuiz) return res.json(defaultQuiz);
            return res.status(404).json({ error: 'Quiz non trovato per questa visita' });
        }
        res.json(quiz);
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});

/**
 * GET /api/v1/navigator/visits/get/upcomingVisits
 */
router.get('/get/upcomingVisits', async (req, res) => {
    try {
        const visits = await Visit.find({ status: 'published' })
            .populate('museum')
            .populate('items')
            .limit(5);

        if (!visits || visits.length === 0) {
            return res.json([{
                id: 'default-1',
                museum: 'Pinacoteca Nazionale di Bologna',
                date: 'Oggi',
                time: '10:00',
                type: 'I Grandi Capolavori',
                image: 'https://images.unsplash.com/photo-1544211152-bd450893375c?auto=format&fit=crop&q=80&w=500'
            }]);
        }

        res.json(visits.map(v => ({
            id: v._id,
            visitId: v._id,
            title: v.title,
            museum: v.museum?.name || "Pinacoteca Nazionale di Bologna",
            date: "Prossimo Weekend",
            time: "10:00",
            duration: v.duration || 60,
            type: v.title || "Tour Guidato",
            image: v.image || "https://images.unsplash.com/photo-1544211152-bd450893375c?auto=format&fit=crop&q=80&w=500",
            knowledgeLevel: v.knowledgeLevel,
            isSync: v.isSync,
            mnemonicName: v.mnemonicName
        })));
    } catch(e) {
        console.error("Error in upcomingVisits:", e);
        res.status(500).json({ message: e.message });
    }
});

/**
 * GET /api/v1/navigator/visits/get/pastVisits
 */
router.get('/get/pastVisits', async (req, res) => {
    try {
        const visits = await Visit.find({ status: 'published' })
            .populate('museum')
            .skip(2)
            .limit(5);

        res.json(visits.map(v => ({
            id: v._id,
            visitId: v._id,
            title: v.title,
            museum: v.museum?.name || "Pinacoteca Nazionale di Bologna",
            date: "Completata",
            time: "15:30",
            type: v.title || "Tour",
            image: v.image || "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=500"
        })));
    } catch(e) {
        res.status(500).json({ message: e.message });
    }
});

/**
 * GET /api/v1/navigator/visits/get/:id
 * Detailed visit info with populated steps, items, and quiz
 */
router.get('/get/:id', async (req, res) => {
    try {
        const visit = await Visit.findById(req.params.id)
            .populate('museum')
            .populate('items')
            .populate('steps.itemId')
            .populate('quiz');

        if (!visit) {
            return res.status(404).json({ error: 'Visit not found' });
        }

        res.json(visit);
    } catch (e) {
        console.error("Error fetching visit details:", e);
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;