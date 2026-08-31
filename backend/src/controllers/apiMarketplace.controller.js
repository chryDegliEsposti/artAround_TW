const Item = require('../models/Item');
const Visit = require('../models/Visit');
const User = require('../models/User');
const Museum = require('../models/Museum');
const Notification = require('../models/Notification');

// ----------------------------------- ITEMS HANDLERS ----------------------------------
const createItems = async (req, res) => {
    try {
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

        const userId = req.userId;
        const username = req.user?.username || 'Autore';

        // Resolve museum reference
        let museumDoc = null;
        if (museum) {
            if (typeof museum === 'string' && museum.match(/^[0-9a-fA-F]{24}$/)) {
                museumDoc = await Museum.findById(museum);
            }
            if (!museumDoc) {
                museumDoc = await Museum.findOne({ museumId: String(museum).toUpperCase() });
            }
        }

        const museumIdCode = museumDoc ? museumDoc.museumId : (req.user?.museumId || 'PIN-BO');
        const museumObjId = museumDoc ? museumDoc._id : undefined;

        const newItem = await Item.create({
            itemType: itemType || 'artwork',
            artworkId: itemType === 'artwork' ? subjectId : undefined,
            title: title || 'Nuovo Item',
            description: description || '',
            author: username,
            creator: username,
            length: length || '15s',
            languageLevel: languageLevel || 'medio',
            museumId: museumIdCode,
            museum: museumObjId,
            license: itemType === 'artwork' ? (license || 'CC-BY-SA') : 'CC0',
            price: itemType === 'artwork' ? Number(price || 0) : 0,
            isAIGenerated: req.body.isAIGenerated || false
        });
        
        res.status(201).json({
            status: 'success',
            message: 'Item creato con successo nel Marketplace',
            data: {
                item: newItem
            }
        });

    } catch (err) {
        console.error("Errore nel salvataggio dell'Item:", err);
        res.status(400).json({
            status: 'error',
            message: err.message || 'Errore durante il salvataggio dei dati'
        });
    }
};

// ----------------------------------- VISITS HANDLERS ----------------------------------
const searchItemsForVisit = async (req, res) => {
    try {
        const museumParam = req.query.museumId;
        let query = {};

        if (museumParam) {
            if (museumParam.match(/^[0-9a-fA-F]{24}$/)) {
                query.$or = [
                    { museum: museumParam },
                    { museumId: museumParam.toUpperCase() }
                ];
            } else {
                query.museumId = museumParam.toUpperCase();
            }
        }

        let items = await Item.find(query);

        // Fallback: If no items found for this specific code, return general items for selection
        if (items.length === 0) {
            items = await Item.find().limit(20);
        }

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
};

const createVisit = async (req, res) => {
    try {
        const { 
            title, 
            description, 
            museumId, 
            items, 
            price = 0, 
            duration = 60, 
            knowledgeLevel = 'medio', 
            targetAudience = 'Tutti', 
            isSync = false, 
            mnemonicName 
        } = req.body;
        
        const userId = req.userId;

        // Resolve museum
        let museumDoc = null;
        if (museumId) {
            if (typeof museumId === 'string' && museumId.match(/^[0-9a-fA-F]{24}$/)) {
                museumDoc = await Museum.findById(museumId);
            }
            if (!museumDoc) {
                museumDoc = await Museum.findOne({ museumId: String(museumId).toUpperCase() });
            }
        }
        if (!museumDoc) {
            museumDoc = await Museum.findOne();
        }

        // Build structured steps
        const validItemIds = Array.isArray(items) ? items : [];
        const steps = validItemIds.map((itemId, idx) => ({
            order: idx + 1,
            stepType: 'item',
            itemId: itemId,
            roomName: `Sala ${idx + 1}`,
            estimatedSeconds: 60
        }));

        const newVisit = await Visit.create({
            museum: museumDoc ? museumDoc._id : undefined,
            museumId: museumDoc ? museumDoc.museumId : 'PIN-BO',
            title: title || 'Nuovo Percorso Visita',
            description: description || '',
            price: Number(price) || 0,
            duration: Number(duration) || 60,
            knowledgeLevel: knowledgeLevel || 'medio',
            targetAudience: targetAudience || 'Tutti',
            status: 'published',
            author: userId,
            isSync: Boolean(isSync),
            mnemonicName: mnemonicName || undefined,
            items: validItemIds,
            steps: steps,
            image: req.body.image || (museumDoc?.image || "https://images.unsplash.com/photo-1544211152-bd450893375c?auto=format&fit=crop&q=80&w=600")
        });
        
        console.log('Nuova visita creata con successo:', newVisit._id);

        res.status(201).json({
            status: 'success',
            message: 'Visita creata con successo',
            data: {
                visit: newVisit
            }
        });

    } catch (err) {
        console.error("Errore nel salvataggio della Visita:", err);
        res.status(400).json({
            status: 'error',
            message: err.message || 'Errore durante il salvataggio della visita'
        });
    }
};

// ----------------------------------- MUSEUM OPERATIONS HANDLERS ----------------------------------
const checkMuseumCode = async (req, res) => {
    try {
        const { code } = req.query;
        if (!code) {
            return res.status(200).json({ status: 'success', data: { exists: false } });
        }
        const existingMuseum = await Museum.findOne({ museumId: code.toUpperCase() });
        res.status(200).json({
            status: 'success',
            data: {
                exists: Boolean(existingMuseum)
            }
        });

    } catch (err) {
        console.error("Errore durante la verifica del codice museo:", err);
        res.status(500).json({
            status: 'error',
            message: err.message || 'Errore durante la verifica del codice museo'
        });
    }
};

const createMuseum = async (req, res) => {
    try {
        console.log("Creazione museo - request body:", req.body);
        const { museum, items, mapData } = req.body;
        const userId = req.userId; 
        
        if (!museum || !museum.code || !museum.name) {
            return res.status(400).json({ status: 'error', message: 'Codice e Nome del museo sono obbligatori.' });
        }

        // 1. Check museumId uniqueness 
        const existingMuseum = await Museum.findOne({ museumId: museum.code.toUpperCase() });
        if (existingMuseum) {
            return res.status(400).json({ status: 'error', message: 'Il codice museo è già in uso.' });
        }

        const lat = Number(museum.latitude) || 44.4975;
        const lng = Number(museum.longitude) || 11.3533;
        const centerCoord = (mapData && Array.isArray(mapData.museumCenter)) ? mapData.museumCenter : [lat, lng];

        // 2. Create Museum with Map Data
        const newMuseum = await Museum.create({
            name: museum.name,
            museumId: museum.code.toUpperCase(),
            description: museum.description || '',
            creator: userId,
            city: museum.city || 'Bologna',
            address: museum.address || '',
            latitude: lat,
            longitude: lng,
            image: museum.image || "https://images.unsplash.com/photo-1544211152-bd450893375c?auto=format&fit=crop&q=80&w=1200",
            museumCenter: centerCoord,
            layers: (mapData && Array.isArray(mapData.layers) && mapData.layers.length > 0) ? mapData.layers : [{ id: 1, name: 'Layer 1' }],
            lines: (mapData && Array.isArray(mapData.lines)) ? mapData.lines : [],
            areas: (mapData && Array.isArray(mapData.areas)) ? mapData.areas : [],
            pois: (mapData && Array.isArray(mapData.pois)) ? mapData.pois : []
        });

        // 3. Create museum's items (if any)  
        if (items && Array.isArray(items) && items.length > 0) {
            const itemsWithMuseumId = items.map(item => ({
                title: item.title || item.subjectId || 'Opera d\'Arte',
                description: item.description || item.title || 'Descrizione opera d\'arte.',
                itemType: item.itemType || 'artwork',
                artworkId: item.artworkId || item.subjectId || undefined,
                author: item.author || 'Artista',
                authorId: item.authorId || undefined,
                style: item.style || undefined,
                styleId: item.styleId || undefined,
                length: item.length || '15s',
                languageLevel: item.languageLevel || 'medio',
                license: item.license || 'CC-BY-SA',
                price: Number(item.price || 0),
                museumId: newMuseum.museumId,
                museum: newMuseum._id,
                creator: req.user?.username || 'Autore',
                recognitionImage: item.image || item.recognitionImage || ''
            }));
            await Item.insertMany(itemsWithMuseumId);
        }

        // 4. Add museum to user's managedMuseums & museumId
        await User.findByIdAndUpdate(userId, {
            $addToSet: { managedMuseums: newMuseum._id },
            $set: { museumId: newMuseum.museumId }
        });

        res.status(201).json({
            status: 'success',
            message: 'Museo creato con successo',
            data: {
                museum: newMuseum, 
                itemsCount: items ? items.length : 0
            }
        });

    } catch (err) {
        console.error("Errore nel salvataggio del Museo:", err);
        res.status(400).json({
            status: 'error',
            message: err.message || 'Errore durante il salvataggio del museo'
        });
    }
};

const searchMuseum = async (req, res) => {
    try {
        const { q, field = 'name' } = req.query;

        if (!q || q.length < 2) {
            const allMuseums = await Museum.find().select('name museumId city address image').limit(10).lean();
            return res.status(200).json({
                status: 'success',
                data: allMuseums
            });
        }

        const queryFilter = {};
        const searchField = field === 'museumId' || field === 'customCode' ? 'museumId' : 'name';
        queryFilter[searchField] = { 
            $regex: q, 
            $options: 'i' 
        };

        const museums = await Museum.find(queryFilter)
            .select('name museumId city address image')
            .limit(10)
            .lean();

        res.status(200).json({
            status: 'success',
            results: museums.length,
            data: museums
        });

    } catch (err) {
        console.error('Errore durante la ricerca museo:', err);
        res.status(500).json({
            status: 'error',
            message: 'Errore interno del server durante la ricerca.'
        });
    }
};

const joinReqMuseum = async (req, res) => {
    try {
        const { museumId } = req.params;
        const userId = req.userId; 

        let museum = null;
        if (museumId.match(/^[0-9a-fA-F]{24}$/)) {
            museum = await Museum.findById(museumId);
        }
        if (!museum) {
            museum = await Museum.findOne({ museumId: museumId.toUpperCase() });
        }

        if (!museum) {
            return res.status(404).json({ status: 'error', message: 'Museo non trovato' });
        }

        if (museum.creator && museum.creator.toString() === userId.toString()) {
            return res.status(400).json({ status: 'error', message: 'Sei già il proprietario di questo museo' });
        }

        if (museum.collaborators.some(c => c.toString() === userId.toString())) {
            return res.status(400).json({ status: 'error', message: 'Sei già collaboratore di questo museo' });
        }

        const alreadyPending = museum.pendingRequests.some(r => r.userId && r.userId.toString() === userId.toString());
        if (alreadyPending) {
            return res.status(400).json({ status: 'error', message: 'Hai già inviato una richiesta di collaborazione per questo museo' });
        }

        museum.pendingRequests.push({
            userId: userId,
            requestedAt: new Date()
        });
        await museum.save();

        res.status(200).json({
            status: 'success',
            message: 'Richiesta di collaborazione inviata con successo.',
            data: {
                museumId: museum._id,
                museumName: museum.name
            }
        });

    } catch (err) {
        console.error('Errore durante la richiesta di collaborazione:', err);
        res.status(500).json({
            status: 'error',
            message: 'Errore interno del server durante la richiesta di collaborazione.'
        });
    }
};

const getManagedMuseums = async (req, res) => {
    try {
        const userId = req.user.id || req.userId;
        
        const museums = await Museum.find({
            $or: [
                { creator: userId }, 
                { collaborators: userId }
            ]
        })
        .populate({
            path: 'pendingRequests.userId',
            select: 'username email'
        })
        .lean();

        res.json({ 
            status: 'success', 
            data: museums 
        });

    } catch (err) {
        console.error("Errore getManagedMuseums:", err);
        res.status(500).json({ message: "Errore server" });
    }
};

const handleJoinReq = async (req, res) => {
    try {
        const userId = req.user.id || req.userId; 
        const { museumId, requestId, action } = req.body;

        const museum = await Museum.findById(museumId);
        if (!museum) {
            return res.status(404).json({ status: 'error', message: 'Museo non trovato' });
        }

        if (museum.creator.toString() !== userId.toString()) {
            return res.status(403).json({ status: 'error', message: 'Non sei autorizzato a gestire le richieste di questo museo' });
        }       

        const requestIndex = museum.pendingRequests.findIndex(
            (r) => r._id.toString() === requestId
        );
        if (requestIndex === -1) {
            return res.status(404).json({ message: "Richiesta non trovata o già gestita" });
        }

        const requesterId = museum.pendingRequests[requestIndex].userId;
        const museumName = museum.name;

        if (action === 'accept') {
            if (!museum.collaborators.includes(requesterId)) {
                museum.collaborators.push(requesterId);
            }
            museum.pendingRequests.splice(requestIndex, 1);
            await museum.save();

            await User.findByIdAndUpdate(requesterId, {
                $addToSet: { managedMuseums: museumId }
            });

            await Notification.create({
                recipient: requesterId,
                message: `La tua richiesta per collaborare al museo "${museumName}" è stata accettata!`,
                type: 'join_accepted',
                museumName: museumName
            });

            res.json({ status: 'success', message: 'Richiesta accettata, utente aggiunto come collaboratore' });

        } else if (action === 'reject') {
            museum.pendingRequests.splice(requestIndex, 1);
            await museum.save();

            await Notification.create({
                recipient: requesterId,
                message: `La tua richiesta per il museo "${museumName}" è stata declinata.`,
                type: 'join_rejected',
                museumName: museumName
            });

            res.json({ status: 'success', message: 'Richiesta rifiutata' });
        }
            
    } catch (err) {
        console.error('Errore gestione richiesta:', err);
        res.status(500).json({
            status: 'error',
            message: 'Errore durante la gestione della richiesta.'
        });
    }
};

// ----------------------------------- USER NOTIFICATION HANDLERS ------------------------------
const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id || req.userId;
        const notifications = await Notification.find({ recipient: userId })
            .sort('-createdAt')
            .limit(20); 
        res.json({ status: 'success', data: notifications });
    } catch (err) {
        console.error('Errore recupero notifiche:', err);
        res.status(500).json({ status: 'error', message: 'Errore recupero notifiche' });
    }
};

const markNotificationsAsRead = async (req, res) => {
    try {
        const userId = req.user.id || req.userId;
        await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: userId },
            { read: true }
        );
        res.json({ status: 'success' });
    } catch (err) {
        console.error('Errore mark read:', err);
        res.status(500).json({ status: 'error', message: 'Errore interno del server' });    
    }
};

// ----------------------------------- BROWSING DATA HANDLERS ----------------------------------
const getVisitsForBrowsing = async (req, res) => {
    try {
        const visits = await Visit.find({ status: 'published' })
            .populate('author', 'username email')
            .populate('museum')
            .populate('items')
            .lean();
        
        let purchasedVisits = [];
        let favoriteVisits = [];

        const userId = req.user ? (req.user.id || req.userId) : null;
        if (userId) {
            const user = await User.findById(userId);
            if (user) {
                purchasedVisits = (user.purchasedVisits || []).map(id => id.toString());
                favoriteVisits = (user.favoriteVisits || []).map(id => id.toString());
            }
        }

        res.status(200).json({
            status: 'success',
            data: {
                visits: visits,
                purchasedVisits: purchasedVisits,
                favoriteVisits: favoriteVisits
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
        const items = await Item.find().populate('museum').lean();
        
        let purchasedItems = [];
        let favoriteItems = [];

        const userId = req.user ? (req.user.id || req.userId) : null;
        if (userId) {
            const user = await User.findById(userId);
            if (user) {
                purchasedItems = (user.purchasedItems || []).map(id => id.toString());
                favoriteItems = (user.favoriteItems || []).map(id => id.toString());
            }
        }

        res.status(200).json({
            status: 'success',
            data: {
                items: items,
                purchasedItems: purchasedItems,
                favoriteItems: favoriteItems
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

// ----------------------------------- PURCHASING HANDLERS ----------------------------------
const purchaseVisit = async (req, res) => {
    try {
        console.log("Acquisto visita - request body:", req.body);
        const visitId = req.body.visitId;   
        const userId = req.userId;

        if (!visitId) {
            return res.status(400).json({ status: 'error', message: 'ID visita obbligatorio' });
        }

        const visit = await Visit.findById(visitId);
        if (!visit) {
            return res.status(404).json({ status: 'error', message: 'Visita non trovata' });
        }   
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 'error', message: 'Utente non trovato' });
        }

        const alreadyPurchased = (user.purchasedVisits || []).some(p => p.toString() === visitId.toString());
        if (alreadyPurchased) {
            return res.status(400).json({ 
                success: false, 
                message: 'Hai già acquistato questo contenuto' 
            });
        }

        user.purchasedVisits.push(visit._id);
        await user.save();

        const updatedPurchased = user.purchasedVisits.map(p => p.toString());

        return res.status(200).json({
            status: 'success',
            message: 'Visita acquistata con successo',
            data: {
                visit: visit,
                purchasedVisits: updatedPurchased 
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
        console.log("Acquisto item - request body:", req.body);
        const itemId = req.body.itemId;   
        const userId = req.userId;      

        if (!itemId) {
            return res.status(400).json({ status: 'error', message: 'ID item obbligatorio' });
        }

        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({ status: 'error', message: 'Item non trovato' });
        }   
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 'error', message: 'Utente non trovato' });
        }

        const alreadyPurchased = (user.purchasedItems || []).some(i => i.toString() === itemId.toString());
        if (alreadyPurchased) {
            return res.status(400).json({ 
                success: false, 
                message: 'Hai già acquistato questo contenuto' 
            });
        }

        user.purchasedItems.push(item._id);
        await user.save();

        const updatedPurchased = user.purchasedItems.map(i => i.toString());

        return res.status(200).json({
            status: 'success',
            message: 'Item acquistato con successo',
            data: {
                item: item,
                purchasedItems: updatedPurchased 
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

// ----------------------------------- FAVORITE CONTENT TOGGLE HANDLERS ----------------------------------
const toggleFavorite = async (req, res) => {
    try {
        const userId = req.user.id || req.userId;
        const { targetId, targetType } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 'error', message: 'Utente non trovato' });
        }

        let favoritesArray;
        if (targetType === 'visit') {
            favoritesArray = user.favoriteVisits;
        } else if (targetType === 'item') {
            favoritesArray = user.favoriteItems;
        } else {
            return res.status(400).json({ status: 'error', message: 'Tipo di contenuto non valido' });
        }

        const index = favoritesArray.findIndex(id => id.toString() === targetId);
        if (index === -1) {
            favoritesArray.push(targetId);
        } else {
            favoritesArray.splice(index, 1);
        }

        await user.save();

        res.json({ status: 'success', message: 'Preferito aggiornato con successo' });

    } catch (err) {
        console.error('Errore durante il toggle dei preferiti:', err);
        res.status(500).json({ status: 'error', message: 'Errore interno del server' });
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
    checkMuseumCode,
    createMuseum,
    searchMuseum,
    joinReqMuseum,
    getManagedMuseums,
    handleJoinReq,
    getNotifications,
    markNotificationsAsRead,
    toggleFavorite,
};