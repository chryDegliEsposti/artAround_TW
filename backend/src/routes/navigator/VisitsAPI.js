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
        const visits = await Visit.find({ 
            $or: [
                { _id: { $in: user.purchasedVisits || [] } },
                { author: user._id }
            ],
            status: 'published' 
        })
            .populate('museum')
            .populate('items');

        res.json(visits.map(v => ({
            id: v._id,
            visitId: v._id,
            title: v.title,
            museum: v.museum?.name || "Pinacoteca Nazionale di Bologna",
            date: "Disponibile",
            time: `${v.duration || 45} minuti`,
            duration: v.duration || 45,
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
 * Route for starting a tour: free tours are accessible to everyone, paid tours require purchase.
 */
router.get('/tourData/:visitId', async (req, res) => {
    try {
        const visitId = req.params.visitId;

        // Resolve user if token is present
        let user = null;
        let token = null;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies && req.cookies.jwt) {
            token = req.cookies.jwt;
        }

        if (token) {
            try {
                const jwt = require('jsonwebtoken');
                const User = require('../../models/User');
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'artaround_jwt_secret_dev_key_2026');
                user = await User.findById(decoded.userId);
            } catch (err) {
                // Token invalid or expired, continue as guest
            }
        }

        let visit = null;
        if (visitId.match(/^[0-9a-fA-F]{24}$/)) {
            visit = await Visit.findById(visitId)
                .populate('museum')
                .populate('items')
                .populate('steps.itemId')
                .populate('quiz');
        }

        if (!visit) {
            visit = await Visit.findOne({ status: 'published' })
                .populate('museum')
                .populate('items')
                .populate('steps.itemId')
                .populate('quiz');
        }

        if (!visit) {
            return res.status(404).json({ success: false, error: 'Visita non trovata nel database.' });
        }

        // Accounting / Authorization:
        // Free visits are ALWAYS accessible to everyone.
        const isFree = !visit.price || Number(visit.price) === 0;
        const isPurchased = user && (user.purchasedVisits || []).some(p => p.toString() === visit._id.toString());
        const isAuthor = user && visit.author && visit.author.toString() === user._id.toString();

        if (!isFree && !isPurchased && !isAuthor) {
            return res.status(403).json({ 
                success: false, 
                error: `La visita "${visit.title}" è a pagamento (€${Number(visit.price).toFixed(2)}). Procedi con l'acquisto per iniziare il tour.`,
                requiresPurchase: true,
                visitId: visit._id,
                visit: {
                    id: visit._id,
                    _id: visit._id,
                    title: visit.title,
                    description: visit.description,
                    price: visit.price,
                    duration: visit.duration,
                    museum: visit.museum?.name || "Museo"
                }
            });
        }

        // Resolve museum geometry
        let museum = visit.museum;
        const Museum = require('../../models/Museum');
        if (!museum && visit.museumId) {
            museum = await Museum.findOne({ museumId: visit.museumId.toUpperCase() });
        }

        // Controllo se il museo esiste
        if (!museum) {
            return res.status(404).json({
                success: false,
                hasNoMap: true,
                error: `Il museo associato a questa visita (${visit.museumId || 'Non specificato'}) non esiste nel database.`
            });
        }

        // Controllo se la planimetria/mappa del museo esiste ed è stata disegnata
        const hasLines = Array.isArray(museum.lines) && museum.lines.length > 0;
        const hasPois = Array.isArray(museum.pois) && museum.pois.length > 0;
        const hasAreas = Array.isArray(museum.areas) && museum.areas.length > 0;

        if (!hasLines && !hasPois && !hasAreas) {
            return res.status(400).json({
                success: false,
                hasNoMap: true,
                museumId: museum.museumId,
                museumName: museum.name,
                error: `La planimetria per il museo "${museum.name}" non è ancora stata creata. Impossibile avviare il tour indoor prima di aver disegnato la mappa nell'Editor.`
            });
        }

        res.json({
            success: true,
            visit: visit,
            museum: museum
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
