const express = require('express');
const router = express.Router();
const Museum = require('../../models/Museum');
const Item = require('../../models/Item');

/**
 * GET /api/v1/navigator/museums/get
 * Returns all museums or filtered by name query
 */
router.get('/get', async (req, res) => {
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
 * GET /api/v1/navigator/museums/museumData
 * Returns 2D floor plan map geometry, layers, areas, lines, and POIs for NavigatorApp
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

        if (museum && museum.layers && museum.layers.length > 0 && museum.pois && museum.pois.length > 0) {
            return res.json({
                id: museum._id,
                name: museum.name,
                museumCenter: museum.museumCenter || [44.4975, 11.3533],
                layers: museum.layers,
                lines: museum.lines,
                areas: museum.areas,
                pois: museum.pois
            });
        }

        // If not populated yet, return error to trigger client fallback
        res.status(404).json({ error: 'No museum map geometry found in database' });
    } catch (err) {
        console.error("Error fetching museumData:", err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/v1/navigator/museums/exploreData
 * Returns curated masterpieces, exhibitions and facilities for ExploreMuseum view
 */
router.get('/exploreData', async (req, res) => {
    try {
        let museum = null;
        if (req.query.id && req.query.id.match(/^[0-9a-fA-F]{24}$/)) {
            museum = await Museum.findById(req.query.id);
        } else {
            museum = await Museum.findOne();
        }

        let itemQuery = { length: '15s', languageLevel: 'medio' };
        if (museum) {
            itemQuery.museum = museum._id;
        }
        
        const items = await Item.find(itemQuery).limit(10);

        const masterpieces = items.map(item => ({
            id: item._id,
            title: item.title,
            artist: item.author,
            style: item.style,
            image: item.recognitionImage || "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=400",
            artworkId: item.artworkId,
            desc: item.description
        }));

        res.json({
            museumName: museum?.name || "Pinacoteca Nazionale di Bologna",
            masterpieces,
            exhibitions: [
                {
                    title: "I Carracci e la Rinascita del Seicento",
                    period: "Fino al 30 Novembre",
                    image: "https://images.unsplash.com/photo-1544211152-bd450893375c?auto=format&fit=crop&q=80&w=600"
                },
                {
                    title: "Il Gotico a Bologna: da Vitale a Simone dei Crocifissi",
                    period: "Mostra Permanente",
                    image: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&q=80&w=600"
                }
            ],
            facilities: [
                { name: "Caffetteria & Bistrot", icon: "restaurant", desc: "Piano Terra, Ala Est" },
                { name: "Bookshop Ufficiale", icon: "shopping_bag", desc: "Atrio d'Ingresso" },
                { name: "Guardaroba Gratuito", icon: "checkroom", desc: "Piano Terra" }
            ]
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

