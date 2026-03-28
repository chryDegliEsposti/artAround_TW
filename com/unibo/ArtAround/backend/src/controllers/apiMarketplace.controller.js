const Item = require('../models/Item');
const Visit = require('../models/Visit');
const User = require('../models/User'); //per aggiornare i dati di acquisto dell'utente (purchasedVisits/purchasedItems)

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

const getVisitsForBrowsing = async (req, res) => {
    try {
        /* TODO: implementare differenziazione tra visite pubbliche e private (visibili solo al creatore) in base a query param 'status' (es. ?status=published o ?status=draft)
            1.aggiungi campo 'status' al modello Visit (enum: ['draft', 'published'], default: 'draft')
            2.modifica createVisit per accettare 'status' da frontend (default a 'draft' se non fornito)
            3.modifica questa funzione per filtrare le visite in base al 'status' richiesto (es. Visit.find({ status: req.query.status || 'published' }))
        
        const status = req.query.status || 'published'; // Default to 'published' if not provided
        const visits = await Visit.find({ status }).populate('museum').populate('items');
        */
        
        const visits = await Visit.find() 
        .populate('author', 'username') //get creator username to show in browse market cards(username specific field needed)
        .populate('museum')
        
        let purchasedVisits = [];
        if (req.user && req.user.id) {
            const user = await User.findById(req.user.id);
            if (user) {
                // Estraiamo solo gli ID come stringhe per il frontend
                purchasedVisits = user.purchasedVisits.map(id => id.toString());
            }
        }

        res.status(200).json({
            status: 'success',
            data: {
                visits: visits,
                purchasedVisits: purchasedVisits
            }
        });

    } catch (err) {
        console.error("Errore nella ricerca delle Visite:", err);
        res.status(500).json({
            status: 'error',
            message: err.message || 'Errore durante la ricerca delle visite'
        });
    }
};

const getItemsForBrowsing = async (req, res) => {
    try {
        const items = await Item.find() //TODO: filter only published items (es. Item.find({ status: 'published' }))
        .populate('creator', 'username'); //get creator effective username to show in browse market cards(username specific field needed, needed bcs model is creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' })
        
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
            message: err.message || 'Errore durante la ricerca degli items'
        });
    }
};   
 
const purchaseVisit = async (req, res) => {
    try {
        console.log("Acquisto visita - request body:", req.body);
        const visitId = req.body.visitId;   
        const userId = req.userId; // ID dell'utente loggato, ottenuto dal middleware 'authorization        

        // Verifica che la visita esista
        const visit = await Visit.findById(visitId);
        if (!visit) {
            return res.status(404).json({ status: 'error', message: 'Visita non trovata' });
        }   
        
        // Verifica se l'utente ha già acquistato questa visita o i suoi item (per evitare acquisti doppi)
        const user = await User.findById(userId) 
        const alreadyPurchased = user.purchasedVisits.some(p => p.toString() === visitId);
        if (alreadyPurchased) {
            return res.status(400).json({ 
                success: false, 
                message: 'Hai già acquistato questo contenuto' 
            });
        }

        user.purchasedVisits.push(visitId);
        await user.save();

        //retrieve visits possedute, per mostrare in frontend (es. disabilitare pulsante acquisto se già acquistata)
        let purchasedVisits = [];
        if (userId) {
            //const user = await User.findById(userId);
            //purchasedVisits = user.purchasedVisits.map(p => p.visitId.toString());
            purchasedVisits = user.purchasedVisits.map(p => {console.log(p); p.toString()});
        }

        return res.status(200).json({
            status: 'success',
            message: 'Visita acquistata con successo',
            data: {
                visit: visit,
                purchasedVisits: purchasedVisits 
            }
        }); 

    } catch (err) {
        console.error("Errore durante l'acquisto della visita:", err);
        res.status(500).json({
            status: 'error',
            message: err.message || 'Errore durante l\'acquisto della visita'
        });
    }
};

const purchaseItem = async (req, res) => {
    try {
        const itemId = req.body.itemId;
        const userId = req.userId; // ID dell'utente loggato, ottenuto dal middleware 'authorization        

        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({ status: 'error', message: 'Item non trovato' });
        }   
        return res.status(200).json({
            status: 'success',
            message: 'Item acquistato con successo',
            data: {
                item
            }
        });

    } catch (err) {
        console.error("Errore durante l'acquisto dell'item:", err);
        res.status(500).json({
            status: 'error',
            message: err.message || 'Errore durante l\'acquisto dell\'item'
        });
    }
};  



module.exports = {
    createItems,
    searchItemsForVisit,
    createVisit,
    getVisitsForBrowsing,
    getItemsForBrowsing,
    purchaseVisit,
    purchaseItem,
}