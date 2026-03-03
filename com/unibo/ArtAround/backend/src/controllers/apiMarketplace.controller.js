const Item = require('../models/Item');

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
            creator: "123" //req.user.id 
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

module.exports = {
    createItems,
}