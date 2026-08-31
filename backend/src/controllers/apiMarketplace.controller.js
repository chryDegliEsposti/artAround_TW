const Item = require('../models/Item');
const Visit = require('../models/Visit');
const User = require('../models/User');
const Museum = require('../models/Museum');
const Notification = require('../models/Notification');
const Quiz = require('../models/Quiz');
const mongoose = require('mongoose');

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

        // 2. Compute dynamic facilities from planimetria
        const pois = (mapData && Array.isArray(mapData.pois)) ? mapData.pois : [];
        const areas = (mapData && Array.isArray(mapData.areas)) ? mapData.areas : [];
        const accessibility = museum.accessibility && Array.isArray(museum.accessibility) ? museum.accessibility : ["Accessibile in sedia a rotelle", "Ascensori", "Servizi igienici"];
        
        const facilitiesList = [];
        const seenFacilities = new Set();
        pois.forEach(p => {
            if (p.type === 'restaurant' && !seenFacilities.has('restaurant')) {
                seenFacilities.add('restaurant');
                facilitiesList.push({ name: p.name || 'Caffetteria & Ristoro', type: 'restaurant', icon: 'restaurant', desc: p.desc || 'Area ristoro e bevande' });
            } else if (p.type === 'restroom' && !seenFacilities.has('restroom')) {
                seenFacilities.add('restroom');
                facilitiesList.push({ name: p.name || 'Servizi Igienici (WC)', type: 'restroom', icon: 'wc', desc: p.desc || 'Servizi igienici accessibili' });
            } else if (p.type === 'exit' && !seenFacilities.has('exit')) {
                seenFacilities.add('exit');
                facilitiesList.push({ name: p.name || 'Uscita di Emergenza', type: 'emergency', icon: 'emergency', desc: p.desc || 'Vie di fuga segnalate' });
            } else if ((p.type === 'stairs' || p.subType === 'elevator') && !seenFacilities.has('elevator')) {
                seenFacilities.add('elevator');
                facilitiesList.push({ name: p.name || 'Ascensori & Piani', type: 'accessible', icon: 'accessible', desc: p.desc || 'Accesso agevolato tra i piani' });
            }
        });
        areas.forEach(a => {
            if (a.type === 'restaurant' && !seenFacilities.has('restaurant')) {
                seenFacilities.add('restaurant');
                facilitiesList.push({ name: a.name || 'Area Ristoro & Bistrot', type: 'restaurant', icon: 'restaurant', desc: 'Area relax e consumazioni' });
            } else if (a.type === 'restroom' && !seenFacilities.has('restroom')) {
                seenFacilities.add('restroom');
                facilitiesList.push({ name: a.name || 'Servizi Igienici (WC)', type: 'restroom', icon: 'wc', desc: 'Toilette presenti nella struttura' });
            }
        });
        if (accessibility.length > 0 && !seenFacilities.has('accessible')) {
            facilitiesList.push({ name: 'Accessibilità Garantita', type: 'accessible', icon: 'accessible', desc: accessibility.slice(0, 3).join(' • ') });
        }

        // 3. Create Museum with Map Data and Facilities
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
            areas: areas,
            pois: pois,
            facilities: facilitiesList
        });

        // 4. Create museum's items and assign previewItems
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
            const createdItems = await Item.insertMany(itemsWithMuseumId);
            
            // Collect items marked for preview
            let previewIds = createdItems
                .filter((_, idx) => items[idx]?.showInPreview !== false)
                .map(it => it._id);

            if (previewIds.length === 0) {
                previewIds = createdItems.slice(0, 5).map(it => it._id);
            }

            newMuseum.previewItems = previewIds;
            await newMuseum.save();
        }

        // 5. Add museum to user's managedMuseums & museumId
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

        if (!q || q.trim().length === 0) {
            const allMuseums = await Museum.find().select('name museumId city address image').lean();
            return res.status(200).json({
                status: 'success',
                results: allMuseums.length,
                data: allMuseums
            });
        }

        const queryFilter = {};
        const searchField = field === 'museumId' || field === 'customCode' ? 'museumId' : 'name';
        queryFilter[searchField] = { 
            $regex: q.trim(), 
            $options: 'i' 
        };

        const museums = await Museum.find(queryFilter)
            .select('name museumId city address image')
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

        // Regola: gli utenti non creatori possono acquistare tutte le opere.
        // I creatori possono acquistare SOLO le opere di altri creatori (non le proprie né quelle dei propri musei).
        if (user.role === 'creator') {
            const isItemCreator = item.creator && item.creator.toLowerCase() === (user.username || '').toLowerCase();
            
            let museumDoc = null;
            if (item.museum) museumDoc = await Museum.findById(item.museum);
            if (!museumDoc && item.museumId) museumDoc = await Museum.findOne({ museumId: item.museumId.toUpperCase() });

            const isMuseumOwner = museumDoc && museumDoc.creator?.toString() === user._id.toString();
            const isMuseumCollaborator = museumDoc && (museumDoc.collaborators || []).some(c => c.toString() === user._id.toString());
            const isUserManaged = (user.managedMuseums || []).some(m => museumDoc && m.toString() === museumDoc._id.toString());

            if (isItemCreator || isMuseumOwner || isMuseumCollaborator || isUserManaged) {
                return res.status(403).json({
                    status: 'error',
                    success: false,
                    message: 'In qualità di creatore, puoi acquistare solo le opere create da altri autori o appartenenti ad altri musei.'
                });
            }
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

// ----------------------------------- ITEM DETAILS & UPDATE ----------------------------------
const getItemById = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id).populate('museum');
        if (!item) {
            return res.status(404).json({ status: 'error', message: 'Item non trovato' });
        }
        res.json({ status: 'success', data: item });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

const updateItem = async (req, res) => {
    try {
        const itemId = req.params.id;
        const userId = req.userId;
        const user = req.user || await User.findById(userId);

        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({ status: 'error', message: 'Item non trovato.' });
        }

        // Verifica che l'utente gestisca il museo dell'item o sia il creatore dell'item
        let museumDoc = null;
        if (item.museum) {
            museumDoc = await Museum.findById(item.museum);
        }
        if (!museumDoc && item.museumId) {
            museumDoc = await Museum.findOne({ museumId: item.museumId.toUpperCase() });
        }

        const isMuseumCreator = museumDoc && museumDoc.creator?.toString() === userId.toString();
        const isMuseumCollaborator = museumDoc && (museumDoc.collaborators || []).some(c => c.toString() === userId.toString());
        const isUserManaged = (user?.managedMuseums || []).some(m => museumDoc && m.toString() === museumDoc._id.toString());
        const isItemCreator = item.creator === user.username;

        if (!isMuseumCreator && !isMuseumCollaborator && !isUserManaged && !isItemCreator) {
            return res.status(403).json({
                status: 'error',
                message: 'Accesso negato: puoi modificare solo gli item appartenenti a un museo che gestisci.'
            });
        }

        const { 
            title, 
            description, 
            author, 
            style, 
            length, 
            languageLevel, 
            license, 
            price, 
            recognitionImage,
            image,
            itemType
        } = req.body;

        if (title !== undefined) item.title = title;
        if (description !== undefined) item.description = description;
        if (author !== undefined) item.author = author;
        if (style !== undefined) item.style = style;
        if (length !== undefined) item.length = length;
        if (languageLevel !== undefined) item.languageLevel = languageLevel;
        if (license !== undefined) item.license = license;
        if (price !== undefined) item.price = Number(price);
        if (recognitionImage !== undefined || image !== undefined) item.recognitionImage = recognitionImage || image;
        if (itemType !== undefined) item.itemType = itemType;

        await item.save();

        res.json({
            status: 'success',
            message: 'Item modificato con successo.',
            data: { item }
        });
    } catch (err) {
        console.error("Update item error:", err);
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// ----------------------------------- MUSEUM JSON EXPORT ----------------------------------
const exportMuseumJSON = async (req, res) => {
    try {
        const museumIdOrCode = req.params.id;
        const userId = req.userId;

        let museum = null;
        if (museumIdOrCode.match(/^[0-9a-fA-F]{24}$/)) {
            museum = await Museum.findById(museumIdOrCode);
        }
        if (!museum) {
            museum = await Museum.findOne({ museumId: museumIdOrCode.toUpperCase() });
        }

        if (!museum) {
            return res.status(404).json({ status: 'error', message: 'Museo non trovato.' });
        }

        // Verifica permessi
        const isCreator = museum.creator?.toString() === userId.toString();
        const isCollaborator = (museum.collaborators || []).some(c => c.toString() === userId.toString());
        const user = await User.findById(userId);
        const isManaged = (user?.managedMuseums || []).some(m => m.toString() === museum._id.toString());

        if (!isCreator && !isCollaborator && !isManaged) {
            return res.status(403).json({ status: 'error', message: 'Non hai i permessi per esportare questo museo.' });
        }

        // Recupera tutti gli item associati al museo
        const items = await Item.find({ 
            $or: [
                { museum: museum._id },
                { museumId: museum.museumId }
            ] 
        }).lean();

        const exportData = {
            museum: {
                id: museum._id,
                name: museum.name,
                museumId: museum.museumId,
                description: museum.description,
                city: museum.city,
                address: museum.address,
                latitude: museum.latitude,
                longitude: museum.longitude,
                museumCenter: museum.museumCenter,
                image: museum.image,
                layers: museum.layers,
                lines: museum.lines,
                areas: museum.areas,
                pois: museum.pois
            },
            items: items.map(it => ({
                id: it._id,
                itemType: it.itemType,
                artworkId: it.artworkId,
                title: it.title,
                description: it.description,
                author: it.author,
                style: it.style,
                length: it.length,
                languageLevel: it.languageLevel,
                license: it.license,
                price: it.price,
                recognitionImage: it.recognitionImage,
                poiId: it.poiId,
                isAIGenerated: it.isAIGenerated
            })),
            exportedAt: new Date().toISOString()
        };

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${museum.museumId}_export.json"`);
        return res.json(exportData);
    } catch (err) {
        console.error("Export museum error:", err);
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// ----------------------------------- QUIZ HANDLERS ----------------------------------
const getQuizzesByMuseum = async (req, res) => {
    try {
        const museumParam = req.params.museumId;
        if (!museumParam) {
            return res.status(400).json({ status: 'error', message: 'ID museo richiesto' });
        }

        let museumDoc = null;
        if (mongoose.Types.ObjectId.isValid(museumParam)) {
            museumDoc = await Museum.findById(museumParam);
        }
        if (!museumDoc) {
            museumDoc = await Museum.findOne({ museumId: museumParam.toUpperCase() });
        }

        let query = {};
        if (museumDoc) {
            query = {
                $or: [
                    { museum: museumDoc._id },
                    { museumId: museumDoc.museumId },
                    { museumId: museumParam.toUpperCase() }
                ]
            };
        } else {
            query = { museumId: museumParam.toUpperCase() };
        }

        const quizzes = await Quiz.find(query).populate('museum').populate('teacher', 'username email').sort({ createdAt: -1 });
        return res.status(200).json({ status: 'success', data: quizzes });
    } catch (err) {
        console.error("Error fetching quizzes by museum:", err);
        return res.status(500).json({ status: 'error', message: err.message });
    }
};

const getMyQuizzes = async (req, res) => {
    try {
        const userId = req.userId;
        const quizzes = await Quiz.find({ teacher: userId }).populate('museum').sort({ createdAt: -1 });
        return res.status(200).json({ status: 'success', data: quizzes });
    } catch (err) {
        console.error("Error fetching my quizzes:", err);
        return res.status(500).json({ status: 'error', message: err.message });
    }
};

const createQuiz = async (req, res) => {
    try {
        const { title, description, museumId, visitId, questions, timeLimitMinutes } = req.body;
        const userId = req.userId;
        const user = req.user;

        if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ status: 'error', message: 'Titolo e almeno una domanda sono obbligatori.' });
        }

        let museumDoc = null;
        if (museumId) {
            if (mongoose.Types.ObjectId.isValid(museumId)) {
                museumDoc = await Museum.findById(museumId);
            }
            if (!museumDoc) {
                museumDoc = await Museum.findOne({ museumId: museumId.toUpperCase() });
            }
        }

        // Format questions ensuring correctAnswerIndex and correctIndex are set
        const formattedQuestions = questions.map(q => {
            const cIndex = (q.correctAnswerIndex !== undefined) ? Number(q.correctAnswerIndex) : Number(q.correctIndex || 0);
            return {
                question: q.question,
                options: q.options,
                correctIndex: cIndex,
                correctAnswerIndex: cIndex,
                explanation: q.explanation || '',
                points: Number(q.points || 1)
            };
        });

        const newQuiz = await Quiz.create({
            title,
            description,
            museum: museumDoc ? museumDoc._id : undefined,
            museumId: museumDoc ? museumDoc.museumId : (museumId ? museumId.toUpperCase() : undefined),
            visit: visitId || undefined,
            questions: formattedQuestions,
            timeLimitMinutes: Number(timeLimitMinutes || 10),
            teacher: userId,
            teacherName: user ? (user.username || user.email) : 'Docente'
        });

        return res.status(201).json({
            status: 'success',
            message: 'Quiz creato con successo!',
            data: newQuiz
        });
    } catch (err) {
        console.error("Error creating quiz:", err);
        return res.status(500).json({ status: 'error', message: err.message });
    }
};

const deleteQuiz = async (req, res) => {
    try {
        const quizId = req.params.id;
        const userId = req.userId;
        const user = req.user;

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ status: 'error', message: 'Quiz non trovato.' });
        }

        if (user.role !== 'creator' && quiz.teacher && quiz.teacher.toString() !== userId.toString()) {
            return res.status(403).json({ status: 'error', message: 'Non hai i permessi per eliminare questo quiz.' });
        }

        await Quiz.findByIdAndDelete(quizId);
        return res.status(200).json({ status: 'success', message: 'Quiz eliminato con successo.' });
    } catch (err) {
        console.error("Error deleting quiz:", err);
        return res.status(500).json({ status: 'error', message: err.message });
    }
};

module.exports = {
    createItems,
    searchItemsForVisit,
    createVisit,
    getVisitsForBrowsing,
    getItemsForBrowsing,
    getItemById,
    updateItem,
    exportMuseumJSON,
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
    getQuizzesByMuseum,
    getMyQuizzes,
    createQuiz,
    deleteQuiz
};