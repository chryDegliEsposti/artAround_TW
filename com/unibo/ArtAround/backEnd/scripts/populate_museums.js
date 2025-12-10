const mongoose = require('mongoose');
const Museum = require('../src/models/Museum');
require('dotenv').config({ path: '../.env' });


const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

const QUERY = `
[out:json][timeout:90];
(
  node["tourism"="museum"](36.6,6.6,47.1,18.5);
  way["tourism"="museum"](36.6,6.6,47.1,18.5);
  relation["tourism"="museum"](36.6,6.6,47.1,18.5);
);
out center;
`;

async function fetchMuseums() {
    console.log('Fetching data from Overpass API...');
    try {
        const response = await fetch(OVERPASS_URL, {
            method: 'POST',
            body: 'data=' + encodeURIComponent(QUERY),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (!response.ok) {
            throw new Error(`Overpass API Error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`Fetched ${data.elements.length} elements.`);
        return data.elements;
    } catch (error) {
        console.error('Error fetching from Overpass:', error);
        return [];
    }
}

async function populate() {
    try {
        await mongoose.connect('mongodb://localhost:27017/artaround');
        console.log('Connected to MongoDB');

        const elements = await fetchMuseums();
        let insertedCount = 0;
        let updatedCount = 0;

        for (const el of elements) {
            if (!el.tags || !el.tags.name) continue;

            const title = el.tags.name;
            const description = el.tags.description || el.tags['description:it'] || el.tags['description:en'] || 'Descrizione non disponibile.';


            let addressParts = [];
            if (el.tags['addr:street']) addressParts.push(el.tags['addr:street']);
            if (el.tags['addr:housenumber']) addressParts.push(el.tags['addr:housenumber']);
            if (el.tags['addr:postcode']) addressParts.push(el.tags['addr:postcode']);
            if (el.tags['addr:city']) addressParts.push(el.tags['addr:city']);
            const address = addressParts.join(', ') || 'Indirizzo non disponibile';

            const webSite = el.tags.website || el.tags['contact:website'] || el.tags.url || '';
            const mapLink = `https://www.openstreetmap.org/${el.type}/${el.id}`;


            const lat = el.lat || el.center?.lat;
            const lon = el.lon || el.center?.lon;

            if (!lat || !lon) continue;

            const museumData = {
                title,
                description,
                address,
                lat,
                lon,
                webSite,
                mapLink,
                location: {
                    type: 'Point',
                    coordinates: [lon, lat]
                }
            };


            const result = await Museum.updateOne(
                { title: title },
                { $set: museumData },
                { upsert: true }
            );

            if (result.upsertedCount > 0) insertedCount++;
            else updatedCount++;

            if ((insertedCount + updatedCount) % 100 === 0) {
                process.stdout.write(`Processed ${insertedCount + updatedCount} museums...\r`);
            }
        }

        console.log(`\nPopulation complete.`);
        console.log(`Inserted: ${insertedCount}`);
        console.log(`Updated: ${updatedCount}`);

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

populate();
