const Item = require('../models/Item');
const Visit = require('../models/Visit');

const createItems = async (req, res) => {
    try {
        // Estraiamo i dati inviati dal frontend (Alpine.js formData)
        const { 
            itemType, 
            subjectId, 
            title, 
            description, 
            length, 
            languageLevel, 
            museum, 
            license, 
            price 
        } = req.body;

        // Creazione dell'oggetto nel DB
        // Il campo 'creator' viene popolato automaticamente dall'ID dell'utente loggato
        const newItem = await Item.create({
            itemType,
            artworkId: itemType === 'artwork' ? subjectId : undefined, // Solo per artworks, altrimenti undefined
            title,
            description,
            length,
            languageLevel,
            museum,
            license: itemType === 'artwork' ? license : 'CC BY', // Default se non è artwork
            price: itemType === 'artwork' ? price : 0,           // Default se non è artwork
            creator: req.userId // Popolato dal middleware 'authorization', rappresenta l'ID dell'utente che sta creando l'item 
        });
        
        // Risposta al frontend
        res.status(201).json({
            status: 'success',
            message: 'Item creato con successo nel Marketplace',
            data: {
                item: newItem
            }
        });

    } catch (err) {
        console.error("Errore nel salvataggio dell'Item:", err);
        
        // Gestione errori di validazione di Mongoose
        res.status(400).json({
            status: 'error',
            message: err.message || 'Errore durante il salvataggio dei dati'
        });
    }
};

// Funzione di ricerca soggetti (quella che abbiamo discusso per Wikidata)
/*exports.getAuthors = async (req, res) => {
    try {
        const query = req.query.q;
        const authors = await Item.find({
            itemType: { $in: ['artist', 'style', 'movement'] },
            title: { $regex: query, $options: 'i' }
        }).limit(5);

        res.status(200).json({
            status: 'success',
            authors: authors.map(a => ({
                id: a.subjectId || a._id,
                name: a.title
            }))
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};
*/

const searchItemsForVisit = async (req, res) => {
    try {
        const museumId = req.query.museumId;
        const items = await Item.find({ museum: museumId });

        res.status(200).json({
            status: 'success',
            data: {
                items
            }
        });
    } catch (err) {
        console.error("Errore nella ricerca degli Items:", err);
        res.status(500).json({
            status: 'error',
            message: err.message || 'Errore durante la ricerca degli Items'
        });
    }
}

const createVisit = async (req, res) => {
    try {
        // Extract frontend data (Alpine.js formData) to create
        let price = 0;
        const { title, description, museumId, items, createdBy } = req.body;
        
        // Creazione dell'oggetto Visit nel DB
        const newVisit = await Visit.create({
            museum: museumId,
            title,
            price, //TODO prendi da frontend o calcola in base agli item selezionati
            description,
            items, // Array di itemId selezionati per la visita
            author: createdBy 
        });
        
        console.log('Nuova visita creata con successo:', newVisit);

        res.status(201).json({
            status: 'success',
            message: 'Visita creata con successo',
            data: {
                visit: newVisit
            }
        });

    } catch (err) {
        console.error("Errore nel salvataggio della Visita:", err);
        
        // Gestione errori di validazione di Mongoose
        res.status(400).json({
            status: 'error',
            message: err.message || 'Errore durante il salvataggio della visita'
        });
    }
};

module.exports = {
    createItems,
    searchItemsForVisit,
    createVisit,
}