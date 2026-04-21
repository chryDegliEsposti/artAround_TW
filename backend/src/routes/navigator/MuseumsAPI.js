const express = require('express');
const router = express.Router();
const Museum = require('../../models/Museum');

const fallbackdata = {
    id: 1,
    name: "Metropolitan Museum of Art",
    description: "The Metropolitan Museum of Art of New York City, colloquially 'the Met', is the largest art museum in the United States. Its permanent collection contains over two million works, divided among 17 curatorial departments.",
    image: "https://images.unsplash.com/photo-1518998053401-a41490201d4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    price: "25.00€",
    accessibility: [
        "Wheelchair Accessible",
        "Elevators to all floors",
        "Tactile maps available",
        "Sign language tours",
        "Service animals allowed"
    ],
    hours: "09:00 - 21:00",
    address: "1000 5th Ave, New York, NY 10028"
};

/**
 * to get museums given some parameters
 * @param {string} name - name of the museum
 * @param {string} nearby - nearby museums
 */
router.get('/get', async (req, res) => {
    try {
        let query = {};
        if (req.query.name) {
            query.name = { $regex: req.query.name, $options: 'i' };
        }

        let result = await Museum.find(query);

        // Map to what MapView expects
        const mappedResult = result.map(m => ({
            id: m._id,
            name: m.name,
            lat: m.latitude || 45.4642,
            lng: m.longitude || 9.1900,
            rating: 4.8,
            img: "https://images.unsplash.com/photo-1544211152-bd450893375c"
        }));

        if (mappedResult && mappedResult.length > 0) {
            res.json(mappedResult);
        } else {
            res.status(404).send("No museums found");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

/**
 * to get museums nearby a given location
 * @param {number} lat - latitude
 * @param {number} lon - longitude
 * @param {number} maxDistance - max distance in meters
 */
router.get('/nearby', async (req, res) => {
    try {
        const { lat, lon, maxDistance = 5000 } = req.query;

        if (!lat || !lon) {
            return res.status(400).json({ message: 'Latitude and longitude are required' });
        }

        const nearbyMuseums = await Museum.find({
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

router.get('/get/:id', async (req, res) => {
    try {
        const museum = await Museum.findById(req.params.id);
        if (!museum) {
            return res.json(fallbackdata);
        }
        res.json({
            id: museum._id,
            name: museum.name,
            description: museum.description || fallbackdata.description,
            image: fallbackdata.image,
            price: fallbackdata.price,
            accessibility: fallbackdata.accessibility,
            hours: fallbackdata.hours,
            address: museum.address || fallbackdata.address
        });
    } catch (e) {
        res.json(fallbackdata);
    }
});

router.get('/item/:id', async (req, res) => {
    try {
        const Item = require('../../models/Item');
        const item = await Item.findById(req.params.id);
        if (item) {
            res.json({ description: item.description });
        } else {
            res.json({ description: "No specific description found for this masterpiece." });
        }
    } catch(e) {
        res.json({ description: "Could not retrieve the description at this time." });
    }
});

router.get('/museumData', async (req, res) => {
    // Expected by NavigatorApp to fallback or use directly
    res.json({ error: 'Use mock fallback for map grid' });
});

router.get('/exploreData', async (req, res) => {
    res.json({});
});

router.get('/navigator/get/visit/:id', async (req, res) => {
    try {
        const result = await Museum.findById(req.params.id);
        if (result) {
            res.json(result);
        } else {
            res.status(404).send("No museum found");
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = router;
