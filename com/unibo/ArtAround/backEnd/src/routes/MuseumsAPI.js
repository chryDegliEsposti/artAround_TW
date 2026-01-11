const express = require('express');
const router = express.Router();

const museums = require('../models/Museum');

// GET /api/museums/address - Cerca musei per indirizzo/città/zona
router.get('/address', async (req, res) => {
    try {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({ message: 'Query parameter "q" is required' });
        }

        const foundMuseums = await museums.find({
            address: { $regex: q, $options: 'i' }
        });

        res.json(foundMuseums);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/museums/nearby - Ottieni musei vicini
router.get('/nearby', async (req, res) => {
    try {
        const { lat, lon, maxDistance = 5000 } = req.query;

        if (!lat || !lon) {
            return res.status(400).json({ message: 'Latitude and longitude are required' });
        }

        const nearbyMuseums = await museums.find({
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lon), parseFloat(lat)]
                    },
                    $maxDistance: parseInt(maxDistance)
                }
            }
        });

        res.json(nearbyMuseums);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/museums - Ottieni tutte i Musei
router.get('/', async (req, res) => {
    try {
        const searchText = req.query.q || '';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 30;
        const skip = (page - 1) * limit;

        const query = {
            title: { $regex: searchText, $options: 'i' }
        };

        const totalMuseums = await museums.countDocuments(query);
        const totalPages = Math.ceil(totalMuseums / limit);

        const foundMuseums = await museums.find(query)
            .skip(skip)
            .limit(limit);

        res.json({
            museums: foundMuseums,
            currentPage: page,
            totalPages: totalPages,
            totalMuseums: totalMuseums
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


const Item = require('../models/Item');

// POST /api/museums - inserisci un museo
router.post('/', async (req, res) => {
    try {
        const { items, ...museumData } = req.body;

        const museum = new museums(museumData);
        if (museumData.lat && museumData.lon) {
            museum.location = {
                type: 'Point',
                coordinates: [parseFloat(museumData.lon), parseFloat(museumData.lat)]
            };
        }
        const savedMuseum = await museum.save();

        // crea links tra il museo e gli oggetti
        if (items && Array.isArray(items) && items.length > 0) {
            const Author = require('../models/Author');

            const itemPromises = items.map(async (itemData) => {
                let authorId = null;

                // gestisce l'autore
                if (itemData.authorName) {
                    let author = await Author.findOne({ name: itemData.authorName });
                    if (!author) {
                        // Create new Author if not exists
                        // TODO: Use AI to fill birthDate, etc if needed
                        author = new Author({ name: itemData.authorName });
                        await author.save();
                    }
                    authorId = author._id;
                }

                // gestira AI
                let descriptions = {};
                if (itemData.generateAI) {
                    const levels = ['easy', 'medium', 'hard'];
                    const lengths = ['short', 'medium', 'long'];

                    for (const len of lengths) {
                        for (const lvl of levels) {
                            const key = `description_${len}_${lvl}`;
                            descriptions[key] = `[AI] ${len} ${lvl} description for ${itemData.title} by ${itemData.authorName}`;
                        }
                    }
                }

                const newItem = new Item({
                    ...itemData,
                    ...descriptions,
                    author: authorId,
                    museums: [savedMuseum._id] // Link item to this museum
                });
                return newItem.save();
            });

            await Promise.all(itemPromises);
        }

        res.status(201).json(savedMuseum);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// GET /api/museums/:id - Ottieni un museo specifico per ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const museum = await museums.findById(id);

        if (!museum) {
            return res.status(404).json({ message: 'Museum not found' });
        }
        res.json(museum);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/museums/:id/map - Salva dati mappa (Muri/Stanze) e Oggetti
router.put('/:id/map', async (req, res) => {
    try {
        const { id } = req.params;
        const { mapData, items } = req.body;

        const museum = await museums.findById(id);
        if (!museum) return res.status(404).json({ message: 'Museum not found' });

        // 1. Update Museum with structural map data (walls, rooms, doors)
        if (mapData) {
            museum.mapData = mapData;
            await museum.save();
        }

        // 2. Process Items (Artworks)
        // These are creating new Items or updating existing ones? 
        // For simplicity, we create new ones or update if we had an ID (but editor creates new usually).
        // Strategy: We can delete old items for this museum that were "drafts" or just add new ones.
        // User said: "mandare i dati al db... differenziando... dagli item... riporta alla pagina... per compilare descrizioni"
        // So we create barebone items here.

        const savedItems = [];
        if (items && Array.isArray(items)) {
            const Item = require('../models/Item');

            // Optional: clear previous items? Or just append?
            // Usually editors "overwrite" the state. 
            // Warning: this might delete items with full descriptions if we are not careful.
            // But for now, let's assume this is the "initial creation" or "layout update".
            // Let's just create/upsert based on something? No unique ID from editor yet.
            // Let's create new items.

            // First, remove items associated with this museum that don't have descriptions yet (drafts)?
            // Or just keep adding. Let's add.

            for (const itemData of items) {
                const newItem = new Item({
                    title: itemData.name || "Nuova Opera",
                    location: {
                        type: 'Point',
                        coordinates: [itemData.coordinates.lon, itemData.coordinates.lat]
                    },
                    floor: itemData.layer,
                    locationCode: itemData.room || "Museo", // Storing room name here for now
                    museums: [museum._id],
                    // Description placeholders will be filled in next step
                });
                await newItem.save();
                savedItems.push(newItem);
            }
        }

        res.json({ message: 'Map saved successfully', museum, itemsCount: savedItems.length });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/museums/:id - Aggiorna un museo esistente
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { items, ...museumData } = req.body;

        if (museumData.lat && museumData.lon) {
            museumData.location = {
                type: 'Point',
                coordinates: [parseFloat(museumData.lon), parseFloat(museumData.lat)]
            };
        }

        const updatedMuseum = await museums.findByIdAndUpdate(id, museumData, { new: true });

        if (!updatedMuseum) {
            return res.status(404).json({ message: 'Museum not found' });
        }

        if (items && Array.isArray(items) && items.length > 0) {
            const Item = require('../models/Item');
            const Author = require('../models/Author');

            const itemPromises = items.map(async (itemData) => {
                let authorId = null;

                if (itemData.authorName) {
                    let author = await Author.findOne({ name: itemData.authorName });
                    if (!author) {
                        author = new Author({ name: itemData.authorName });
                        await author.save();
                    }
                    authorId = author._id;
                }

                let descriptions = {};
                if (itemData.generateAI) {
                    const levels = ['easy', 'medium', 'hard'];
                    const lengths = ['short', 'medium', 'long'];
                    for (const len of lengths) {
                        for (const lvl of levels) {
                            const key = `description_${len}_${lvl}`;
                            descriptions[key] = `[AI] ${len} ${lvl} description for ${itemData.title} by ${itemData.authorName}`;
                        }
                    }
                }

                const newItem = new Item({
                    ...itemData,
                    ...descriptions,
                    author: authorId,
                    museums: [updatedMuseum._id]
                });
                return newItem.save();
            });

            await Promise.all(itemPromises);
        }

        res.json(updatedMuseum);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
