const express = require('express');
const router = express.Router();
const Museum = require('../models/Museum');

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

        // Handle nearby query if provided in coordinates
        if (req.query.lng && req.query.lat) {
            query.location = {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(req.query.lng), parseFloat(req.query.lat)]
                    },
                    $maxDistance: 5000 // default 5km
                }
            };
        }

        const result = await Museum.find(query);
        console.log(result);
        if (result && result.length > 0) {
            res.json(result);
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
    //console.log(JSON.stringify(fallbackdata))
    res.json(fallbackdata);
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
