const express = require('express');
const router = express.Router();
const Visit = require('../../models/Visit');
const authorization = require('../../middlewares/auth.middleware');

/**
 * GET /api/v1/navigator/visits/get/upcomingVisits
 */
router.get('/get/upcomingVisits', authorization, async (req, res) => {
    try {
        const user = req.user;
        const visits = await Visit.find({ _id: { $in: user.purchasedVisits }, status: 'published' })
            .populate('museum')
            .populate('items');

        res.json(visits.map(v => ({
            id: v._id,
            visitId: v._id,
            title: v.title,
            museum: v.museum?.name || "Museo non trovato",
            date: "Prossimamente", // You can calculate actual dates based on schedule if needed
            time: "Orario flessibile",
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
router.get('/get/pastVisits', authorization, async (req, res) => {
    try {
        // Return empty array for now or past dates if you have completion status
        res.json([]);
    } catch(e) {
        res.status(500).json({ message: e.message });
    }
});

/**
 * GET /api/v1/navigator/visits/tourData/:visitId
 * Protected route for starting a tour.
 */
router.get('/tourData/:visitId', authorization, async (req, res) => {
    try {
        const visitId = req.params.visitId;
        const user = req.user;

        // Accounting / Authorization
        const alreadyPurchased = user.purchasedVisits.some(p => p.toString() === visitId);
        if (!alreadyPurchased) {
            return res.status(403).json({ success: false, error: 'Accesso negato. Devi acquistare la visita prima di accedere al tour.' });
        }

        const visit = await Visit.findById(visitId)
            .populate('museum')
            .populate('items')
            .populate('steps.itemId')
            .populate('quiz');

        if (!visit) {
            return res.status(404).json({ success: false, error: 'Visita non trovata' });
        }

        if (!visit.museum) {
            return res.status(404).json({ success: false, error: 'Questa visita non ha un museo associato.' });
        }

        res.json({
            success: true,
            visit: visit,
            museum: visit.museum
        });
    } catch (e) {
        console.error("Error in tourData:", e);
        res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * GET /api/v1/navigator/visits/get/:id
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
