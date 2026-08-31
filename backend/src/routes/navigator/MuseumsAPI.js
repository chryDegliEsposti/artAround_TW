const express = require('express');
const router = express.Router();
const Museum = require('../../models/Museum');
const Item = require('../../models/Item');
const Visit = require('../../models/Visit');
const authorization = require('../../middlewares/auth.middleware');

/**
 * Dynamic Facilities extractor based on museum planimetria (POIs and Areas)
 */
function getDynamicFacilities(museum) {
    if (!museum) return [];
    
    const facilities = [];
    const seenNames = new Set();
    const seenTypes = new Set();

    const addFacility = (fac) => {
        if (!fac || !fac.name) return;
        const normalizedName = fac.name.trim().toLowerCase();
        const normalizedType = (fac.type || '').trim().toLowerCase();

        // Prevent duplication if name or canonical service type already seen
        if (seenNames.has(normalizedName)) return;
        if (normalizedType && normalizedType !== 'other' && seenTypes.has(normalizedType)) return;

        seenNames.add(normalizedName);
        if (normalizedType && normalizedType !== 'other') {
            seenTypes.add(normalizedType);
        }

        facilities.push({
            name: fac.name.trim(),
            icon: fac.icon || 'info',
            desc: fac.desc || 'Servizio presente nella struttura',
            type: normalizedType || 'other'
        });
    };

    const pois = museum.pois || [];
    const areas = museum.areas || [];
    const accessibility = museum.accessibility || [];

    // 1. POIs
    pois.forEach(p => {
        const type = (p.type || '').toLowerCase();
        const subType = (p.subType || '').toLowerCase();
        const name = p.name || '';
        const desc = p.desc || '';

        if (type === 'restaurant' || type === 'cafe' || subType === 'bar' || name.toLowerCase().includes('caff') || name.toLowerCase().includes('bar') || name.toLowerCase().includes('ristor')) {
            addFacility({
                name: name || 'Caffetteria & Ristoro',
                icon: 'restaurant',
                desc: desc || 'Punto ristoro, bar e bevande',
                type: 'restaurant'
            });
        } else if (type === 'restroom' || subType === 'wc' || name.toLowerCase().includes('toilette') || name.toLowerCase().includes('bagni') || name.toLowerCase().includes('wc')) {
            addFacility({
                name: name || 'Servizi Igienici (WC)',
                icon: 'wc',
                desc: desc || 'Servizi igienici accessibili',
                type: 'restroom'
            });
        } else if (type === 'shop' || subType === 'shop' || name.toLowerCase().includes('bookshop') || name.toLowerCase().includes('souvenir')) {
            addFacility({
                name: name || 'Bookshop & Guida',
                icon: 'shopping_bag',
                desc: desc || 'Cataloghi, libri d\'arte e merchandising',
                type: 'shop'
            });
        } else if (type === 'stairs' || subType === 'elevator' || name.toLowerCase().includes('ascensore')) {
            addFacility({
                name: name || 'Ascensori e Accessibilità',
                icon: 'accessible',
                desc: desc || 'Collegamento tra tutti i livelli',
                type: 'accessible'
            });
        } else if (type === 'entrance' || type === 'info' || name.toLowerCase().includes('biglietteria') || name.toLowerCase().includes('accoglienza') || name.toLowerCase().includes('info')) {
            addFacility({
                name: name || 'Biglietteria & Info Point',
                icon: 'info',
                desc: desc || 'Atrio d\'ingresso e accoglienza',
                type: 'info'
            });
        } else if (type === 'exit' || subType === 'emergency' || name.toLowerCase().includes('uscita')) {
            addFacility({
                name: name || 'Uscite di Emergenza',
                icon: 'emergency',
                desc: desc || 'Vie di fuga e sicurezza',
                type: 'emergency'
            });
        }
    });

    // 2. Areas
    areas.forEach(a => {
        const type = (a.type || '').toLowerCase();
        const subType = (a.subType || '').toLowerCase();
        const name = a.name || '';

        if (type === 'restaurant' || subType === 'bar' || subType === 'restaurant-bar') {
            addFacility({
                name: name || 'Area Ristoro & Bistrot',
                icon: 'restaurant',
                desc: 'Area relax e consumazioni',
                type: 'restaurant'
            });
        } else if (type === 'restroom') {
            addFacility({
                name: name || 'Servizi Igienici (WC)',
                icon: 'wc',
                desc: 'Toilette presenti nella struttura',
                type: 'restroom'
            });
        }
    });

    // 3. Accessibility tags
    if (accessibility && accessibility.length > 0) {
        addFacility({
            name: 'Accessibilità Garantita',
            icon: 'accessible',
            desc: accessibility.slice(0, 3).join(' • '),
            type: 'accessible'
        });
    }

    return facilities;
}

/**
 * GET /api/v1/navigator/museums/myManaged
 * Returns museums created or managed by the logged-in creator
 */
router.get('/myManaged', authorization, async (req, res) => {
    try {
        const userId = req.user._id || req.user.id || req.userId;
        const isCreator = req.user.role === 'creator';

        const museums = await Museum.find({
            $or: [
                { creator: userId },
                { collaborators: userId }
            ]
        }).sort({ name: 1 });

        const mappedMuseums = museums.map(m => ({
            id: m._id,
            _id: m._id,
            museumId: m.museumId,
            name: m.name,
            lat: m.latitude != null ? m.latitude : (m.museumCenter ? m.museumCenter[0] : 44.4975),
            lng: m.longitude != null ? m.longitude : (m.museumCenter ? m.museumCenter[1] : 11.3533),
            description: m.description,
            address: m.address,
            city: m.city
        }));

        res.json({
            success: true,
            isCreator,
            role: req.user.role,
            count: mappedMuseums.length,
            museums: mappedMuseums
        });
    } catch (err) {
        console.error("Error fetching creator managed museums:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * GET /api/v1/navigator/museums or /api/v1/navigator/museums/get
 * Returns all museums or filtered by name query
 */
router.get(['/', '/get'], async (req, res) => {
    try {
        let query = {};
        if (req.query.name) {
            query.name = { $regex: req.query.name, $options: 'i' };
        }

        let result = await Museum.find(query);

        const mappedResult = result.map(m => ({
            id: m._id,
            _id: m._id,
            museumId: m.museumId,
            name: m.name,
            lat: m.latitude != null ? m.latitude : (m.museumCenter ? m.museumCenter[0] : 44.4975),
            lng: m.longitude != null ? m.longitude : (m.museumCenter ? m.museumCenter[1] : 11.3533),
            rating: 4.9,
            img: m.image || "https://images.unsplash.com/photo-1544211152-bd450893375c?auto=format&fit=crop&q=80&w=1200",
            description: m.description,
            address: m.address,
            city: m.city
        }));

        res.json(mappedResult);
    } catch (err) {
        console.error("Error fetching museums:", err);
        res.status(500).json({ error: err.message });
    }
});


/**
 * GET /api/v1/navigator/museums/get/:id
 * Detailed info for a specific museum
 */
router.get('/get/:id', async (req, res) => {
    try {
        let museum = null;
        if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            museum = await Museum.findById(req.params.id);
        } else {
            museum = await Museum.findOne({ museumId: req.params.id.toUpperCase() });
        }

        if (!museum) {
            museum = await Museum.findOne();
        }

        if (!museum) {
            return res.status(404).json({ error: 'Museum not found' });
        }

        res.json({
            id: museum._id,
            museumId: museum.museumId,
            name: museum.name,
            description: museum.description,
            image: museum.image || "https://images.unsplash.com/photo-1544211152-bd450893375c?auto=format&fit=crop&q=80&w=1200",
            price: museum.price || "10.00€",
            accessibility: museum.accessibility && museum.accessibility.length > 0 ? museum.accessibility : ["Accessibile disabili", "Ascensori", "Servizi igienici"],
            hours: museum.hours || "09:00 - 19:00",
            address: museum.address || "Via delle Belle Arti 56, Bologna",
            categories: museum.categories || ["Arte Antica", "Rinascimento", "Barocco"]
        });
    } catch (e) {
        console.error("Error fetching museum details:", e);
        res.status(500).json({ error: e.message });
    }
});

/**
 * GET /api/v1/navigator/museums/items
 * GET /api/v1/navigator/museums/:museumId/items
 * Returns all distinct Items/artworks created in DB for a specific museum
 */
router.get(['/items', '/:museumId/items'], async (req, res) => {
    try {
        const museumId = req.params.museumId || req.query.museumId || req.query.id;
        let query = {};
        if (museumId && museumId !== '__new__') {
            if (typeof museumId === 'string' && museumId.match(/^[0-9a-fA-F]{24}$/)) {
                query.$or = [{ museum: museumId }, { museumId: museumId }];
            } else {
                query.$or = [{ museumId: String(museumId).toUpperCase() }, { museumId: museumId }];
            }
        }

        const items = await Item.find(query).sort({ title: 1 });

        // Deduplicate items by title so we don't list multiple language variations of the exact same artwork
        const uniqueItems = [];
        const seenTitles = new Set();

        for (const item of items) {
            const key = (item.title || '').trim().toLowerCase();
            if (!seenTitles.has(key)) {
                seenTitles.add(key);
                uniqueItems.push({
                    _id: item._id,
                    title: item.title,
                    author: item.author || '',
                    museumId: item.museumId,
                    poiId: item.poiId,
                    artworkId: item.artworkId,
                    recognitionImage: item.recognitionImage
                });
            }
        }

        res.json(uniqueItems);
    } catch (err) {
        console.error("Error fetching museum items:", err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/v1/navigator/museums/museumData
 * Returns 2D floor plan map geometry, layers, areas, lines, and POIs for NavigatorApp & Editor
 */
router.get('/museumData', async (req, res) => {
    try {
        let museum = null;
        if (req.query.id && req.query.id.match(/^[0-9a-fA-F]{24}$/)) {
            museum = await Museum.findById(req.query.id);
        } else if (req.query.museumId) {
            museum = await Museum.findOne({ museumId: req.query.museumId.toUpperCase() });
        } else {
            // Default to first museum in DB (Pinacoteca Nazionale di Bologna)
            museum = await Museum.findOne();
        }

        if (museum) {
            return res.json({
                id: museum._id,
                museumId: museum.museumId,
                name: museum.name,
                museumCenter: museum.museumCenter && museum.museumCenter.length === 2 ? museum.museumCenter : [museum.latitude || 44.4975, museum.longitude || 11.3533],
                layers: museum.layers && museum.layers.length > 0 ? museum.layers : [{ id: 1, name: 'Layer 1' }],
                lines: museum.lines || [],
                areas: museum.areas || [],
                pois: museum.pois || []
            });
        }

        // If no museum exists in DB at all
        res.status(404).json({ error: 'No museum found in database' });
    } catch (err) {
        console.error("Error fetching museumData:", err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * PUT /api/v1/navigator/museums/map/:id
 * Saves updated map geometry (layers, lines, areas, pois, museumCenter) to MongoDB
 */
router.put(['/map/:id', '/map'], async (req, res) => {
    try {
        const idParam = req.params.id || req.body.id || req.body.museumId;
        const { layers, lines, areas, pois, museumCenter } = req.body;

        let museum = null;
        if (idParam && typeof idParam === 'string' && idParam.match(/^[0-9a-fA-F]{24}$/)) {
            museum = await Museum.findById(idParam);
        } else if (idParam) {
            museum = await Museum.findOne({ museumId: String(idParam).toUpperCase() });
        }

        if (!museum) {
            museum = await Museum.findOne();
        }

        if (!museum) {
            return res.status(404).json({ success: false, error: 'Museum not found in database' });
        }

        if (layers && Array.isArray(layers)) museum.layers = layers;
        if (lines && Array.isArray(lines)) museum.lines = lines;
        if (areas && Array.isArray(areas)) museum.areas = areas;
        if (pois && Array.isArray(pois)) museum.pois = pois;
        if (museumCenter && Array.isArray(museumCenter) && museumCenter.length === 2) {
            museum.museumCenter = museumCenter;
            museum.latitude = museumCenter[0];
            museum.longitude = museumCenter[1];
        }

        // Dynamically compute and store facilities from map geometry
        museum.facilities = getDynamicFacilities(museum);

        await museum.save();
        console.log(`[Editor] Mappa e facilities aggiornate con successo per museo: ${museum.name} (${museum.museumId})`);

        res.json({
            success: true,
            message: `Mappa di "${museum.name}" salvata con successo nel database!`,
            museum: {
                id: museum._id,
                museumId: museum.museumId,
                name: museum.name,
                museumCenter: museum.museumCenter,
                layersCount: museum.layers.length,
                linesCount: museum.lines.length,
                areasCount: museum.areas.length,
                poisCount: museum.pois.length,
                facilitiesCount: museum.facilities.length
            }
        });
    } catch (err) {
        console.error("Error updating museum map:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * GET /api/v1/navigator/museums/exploreData
 * Returns creator preview items, marketplace visit paths, and dynamic facilities for ExploreMuseum view
 */
router.get('/exploreData', async (req, res) => {
    try {
        let museum = null;
        if (req.query.id && req.query.id.match(/^[0-9a-fA-F]{24}$/)) {
            museum = await Museum.findById(req.query.id);
        } else if (req.query.id || req.query.museumId) {
            const code = (req.query.id || req.query.museumId).toUpperCase();
            museum = await Museum.findOne({ museumId: code });
        }
        
        if (!museum) {
            museum = await Museum.findOne();
        }

        // 1. Fetch previewItems chosen by the Creator (or fallback to museum's distinct items)
        let items = [];
        if (museum && museum.previewItems && museum.previewItems.length > 0) {
            items = await Item.find({ _id: { $in: museum.previewItems } });
        }
        
        if (!items || items.length === 0) {
            let itemQuery = {};
            if (museum) {
                itemQuery.$or = [{ museum: museum._id }, { museumId: museum.museumId }];
            }
            items = await Item.find(itemQuery).limit(10);
        }

        // Deduplicate preview items by title
        const uniqueItems = [];
        const seenTitles = new Set();
        items.forEach(item => {
            const key = (item.title || '').trim().toLowerCase();
            if (!seenTitles.has(key)) {
                seenTitles.add(key);
                uniqueItems.push({
                    id: item._id,
                    title: item.title,
                    artist: item.author || 'Artista',
                    style: item.style || '',
                    image: item.recognitionImage || "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=600",
                    artworkId: item.artworkId,
                    desc: item.description
                });
            }
        });

        // 2. Fetch Guided Visits available for this museum
        let exhibitions = [];
        if (museum) {
            const visits = await Visit.find({
                $or: [{ museum: museum._id }, { museumId: museum.museumId }]
            }).limit(4);

            if (visits && visits.length > 0) {
                exhibitions = visits.map(v => ({
                    id: v._id,
                    title: v.title,
                    period: v.duration ? `Durata: ~${v.duration} min` : 'Percorso Guidato',
                    price: v.price > 0 ? `€${v.price.toFixed(2)}` : 'Gratuito',
                    image: v.image || museum.image || "https://images.unsplash.com/photo-1544211152-bd450893375c?auto=format&fit=crop&q=80&w=600",
                    description: v.description || 'Percorso guidato completo all\'interno della struttura museale.'
                }));
            }
        }

        if (exhibitions.length === 0) {
            exhibitions = [
                {
                    title: `Percorso Visita: ${museum?.name || 'Visita Museo'}`,
                    period: "Visita Completa",
                    price: "Disponibile nel Marketplace",
                    image: museum?.image || "https://images.unsplash.com/photo-1544211152-bd450893375c?auto=format&fit=crop&q=80&w=600",
                    description: "Acquista i percorsi con mappe e spiegazioni vocali direttamente nel Marketplace."
                }
            ];
        }

        // 3. Compute dynamic facilities from planimetria without hardcoding
        const facilities = getDynamicFacilities(museum);

        res.json({
            museumId: museum?.museumId || "PIN-BO",
            museumName: museum?.name || "Pinacoteca Nazionale di Bologna",
            museumDescription: museum?.description || "",
            image: museum?.image || "https://images.unsplash.com/photo-1544211152-bd450893375c?auto=format&fit=crop&q=80&w=1200",
            address: museum?.address || "",
            city: museum?.city || "Bologna",
            masterpieces: uniqueItems,
            exhibitions,
            facilities
        });
    } catch (err) {
        console.error("Error fetching exploreData:", err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/v1/navigator/museums/item/:id
 * Returns description, metadata and image for a specific item/artwork
 */
router.get('/item/:id', async (req, res) => {
    try {
        const idParam = req.params.id;
        let item = null;

        // 1. Try finding by MongoDB ObjectId
        if (idParam.match(/^[0-9a-fA-F]{24}$/)) {
            item = await Item.findById(idParam);
        }

        // 2. If not found, try by artworkId (Wikidata Q-ID es. Q126599960)
        if (!item) {
            item = await Item.findOne({ artworkId: idParam });
        }

        // 3. If not found, try by numeric POI ID
        if (!item && !isNaN(Number(idParam))) {
            item = await Item.findOne({ poiId: Number(idParam) });
        }

        if (item) {
            return res.json({
                id: item._id,
                title: item.title,
                name: item.title,
                artist: item.author,
                style: item.style,
                artworkId: item.artworkId,
                authorId: item.authorId,
                styleId: item.styleId,
                description: item.description,
                desc: item.description,
                image: item.recognitionImage,
                length: item.length,
                languageLevel: item.languageLevel,
                license: item.license
            });
        }

        res.json({ 
            description: "Nessuna descrizione trovata per questa opera.",
            title: "Opera d'Arte",
            artist: "Artista Sconosciuto"
        });
    } catch (e) {
        console.error("Error in /item/:id:", e);
        res.status(500).json({ description: "Errore durante il recupero della descrizione." });
    }
});

module.exports = router;

