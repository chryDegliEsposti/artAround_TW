const Item = require('../models/Item');
const Visit = require('../models/Visit');
const User = require('../models/User'); //per aggiornare i dati di acquisto dell'utente (purchasedVisits/purchasedItems)
const Museum = require('../models/Museum'); //per check codice museo in createMuseum
const Notification = require('../models/Notification'); //per creare notifiche in handleJoinReq


// ----------------------------------- ITEMS HANDLERS ----------------------------------
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
            license: itemType === 'artwork' ? license : 'CC0', // Default se non è artwork
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

// ----------------------------------- VISITS HANDLERS ----------------------------------
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

// ----------------------------------- MUSEUM OPERATIONS HANDLERS ----------------------------------
const checkMuseumCode = async (req, res) => {
    try {
        const { code } = req.query;
        const existingMuseum = await Museum.findOne({ museumId: code.toUpperCase() });
        let exists;
        if(existingMuseum) {
            exists = true;
        }else {
            exists = false;
        }

        res.status(200).json({
            status: 'success',
            data: {
                exists: exists 
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

        const { museum, items } = req.body;
        const userId = req.userId; 
        
        //--- Sequential operations BLOCK for museum creation 
        // 1. Check museumId uniqueness 
        const existingMuseum = await Museum.findOne({ museumId: museum.code.toUpperCase() });
        if (existingMuseum) {
            return res.status(400).json({ status: 'error', message: 'Il codice museo è già in uso.' });
        }
        // 2. Create Museum
        const newMuseum = await Museum.create({
            name: museum.name,
            museumId: museum.code.toUpperCase(),
            description: museum.description,
            creator: userId,
            city: museum.city,
            address: museum.address,
            longitude: museum.longitude,
            latitude: museum.latitude,
        });
        // 3. Create museum's items (if any)  
        if (items && items.length > 0) {
            const itemsWithMuseumId = items.map(item => ({
                ...item,
                museumId: newMuseum.museumId, 
                creator: userId
            }));
            await Item.insertMany(itemsWithMuseumId);
        }
        // 4. Add museum to user's managedMuseums 
        await User.findByIdAndUpdate(userId, {
            $push: { managedMuseums: newMuseum._id }
        });

        res.status(201).json({
            status: 'success',
            message: 'Museo creato con successo',
            data: {
                museum: newMuseum, 
                itemsCount: items.length
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
        // 1. Recuperiamo i parametri dalla query string
        // q: la stringa cercata (es: "Uffizi")
        // field: il campo su cui cercare (es: "name" o "customCode")
        const { q, field } = req.query;

        // 2. Protezione: se la query è troppo corta, restituiamo un array vuoto
        if (!q || q.length < 3) {
            return res.status(200).json({
                status: 'success',
                data: []
            });
        }

        // 3. Costruzione della Query Dinamica
        // Usiamo le parentesi quadre [field] per usare il valore della variabile come chiave
        const queryFilter = {};
        // $regex: cerca la stringa all'interno del campo
        // $options: 'i' rende la ricerca Case-Insensitive (ignora maiuscole/minuscole)
        queryFilter[field] = { 
            $regex: q, 
            $options: 'i' 
        };
        console.log('Filtro di ricerca museo costruito:', queryFilter);
        // 4. Esecuzione della ricerca
        // .limit(10): non vogliamo sovraccaricare il frontend con troppi risultati
        // .select(...): prendiamo solo i campi necessari per la lista UI
        const museums = await Museum.find(queryFilter)
            .select('name customCode city address')
            .limit(10)
            .lean(); // .lean() rende la query più veloce trasformandola in oggetti JS semplici

        // 5. Risposta al frontend
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
        const { museumId } = req.params; // ID del museo a cui si vuole richiedere l'accesso
        const userId = req.userId; 

        console.log(`User: ${userId} request to join museum: ${museumId}`);

        // Verifica che il museo esista
        const museum = await Museum.findById(museumId);
        if (!museum) {
            return res.status(404).json({ status: 'error', message: 'Museo non trovato' });
        }

        // Verifica se l'utente ha già richiesto di unirsi o è già collaboratore
        if (museum.pendingRequests.includes(userId) || museum.collaborators.includes(userId)) { //TO-ADD:  || museum.creator.toString() === userId
            return res.status(400).json({ status: 'error', message: 'Hai già accesso a questo museo o fatto richiesta di unirti' });
        }

        // Aggiungi l'utente alla lista dei collaboratori (in attesa di approvazione del creatore)
        museum.pendingRequests.push({
            userId: userId,
            requestedAt: new Date()
        });
        await museum.save();

        res.status(200).json({
            status: 'success',
            message: 'Richiesta di collaborazione inviata con successo. Il creatore del museo riceverà una notifica per approvare la tua richiesta.',
            data: {
                museumId: museum._id,
                museumName: museum.name
            }
        });

    } catch (err) {
        console.error('Errore durante la richiesta di collaborazione al museo:', err);
        res.status(500).json({
            status: 'error',
            message: 'Errore interno del server durante la richiesta di collaborazione.'
        });
    }
};

/*const getPendingRequests = async (req, res) => {
    try {
        const userId = req.userId;
        // Trova i musei di cui l'utente è creatore
        const museums = await Museum.find({ creator: userId }); 
        const pendingRequests = museums.map(museum => ({
            museumId: museum._id,
            museumName: museum.name,
            requests: museum.pendingRequests 
        }));
        console.log('Richieste di collaborazione pendenti per i musei creati dall\'utente:', pendingRequests);
        res.status(200).json({
            status: 'success',
            data: pendingRequests
        });

    } catch (err) {
        console.error('Errore durante il recupero delle richieste di collaborazione:', err);
        res.status(500).json({
            status: 'error',
            message: 'Errore interno del server durante il recupero delle richieste di collaborazione.'
        });
    }
};*/

const getManagedMuseums = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Cerchiamo i musei dove l'utente è creator O collaboratore
        // Usiamo i nomi dei campi esatti che hai nel DB (se è 'creator', usa 'creator')
        const museums = await Museum.find({
            $or: [
                { creator: userId }, 
                { collaborators: userId }
            ]
        })
        .populate({
            path: 'pendingRequests.userId',
            select: 'username email', // Recupera solo questi dati dell'utente
            model: 'User' 
        })
        .lean(); //mongoose docs -> js objs

        console.log(`[Dashboard] Invio musei gestiti dall'utente ${userId}`);

        res.json({ 
            status: 'success', 
            data: museums 
        });

    } catch (err) {
        res.status(500).json({ message: "Errore server" });
    }
}

const handleJoinReq = async (req, res) => {
    try {
        const userId = req.user.id; 
        const { museumId, requestId, action } = req.body;

        // Checks
        //-existence
        const museum = await Museum.findById(museumId);
        if (!museum) {
            return res.status(404).json({ status: 'error', message: 'Museo non trovato' });
        }
        //-authorized
        if (museum.creator.toString() !== userId) {
            return res.status(403).json({ status: 'error', message: 'Non sei autorizzato a gestire le richieste di questo museo' });
        }       
        //-request existence
        const requestIndex = museum.pendingRequests.findIndex(
            (req) => req._id.toString() === requestId
        );
        if (requestIndex === -1) {
            return res.status(404).json({ message: "Richiesta non trovata o già stata gestita" });
        }

        // Management
        const requesterId = museum.pendingRequests[requestIndex].userId; //info for notification
        const museumName = museum.name;

        if(action === 'accept') {
            //1.Add user to collaborators
            if (!museum.collaborators.includes(userId)) {
                museum.collaborators.push(userId);
            }
            //2.Remove from pending
            museum.pendingRequests.splice(requestIndex, 1);
            await museum.save();
            //3.Add museum to user's managedMuseums
            await User.findByIdAndUpdate(userId, {
                $push: { managedMuseums: museumId }
            });
            //4.Create notification for requester
            await Notification.create({
                recipient: requesterId,
                message: `La tua richiesta per collaborare al museo "${museumName}" è stata accettata!`,
                type: 'join_accepted',
                museumName: museumName
            });
            res.json({ status: 'success', message: 'Richiesta accettata, utente aggiunto come collaboratore' });

        }else if (action === 'reject') {
            //1.Remove from pending
            museum.pendingRequests.splice(requestIndex, 1);
            await museum.save();
            //2.Create notification for requester
            await Notification.create({
                recipient: requesterId,
                message: `La tua richiesta per il museo "${museumName}" è stata declinata.`,
                type: 'join_rejected',
                museumName: museumName
            });
            res.json({ status: 'success', message: 'Richiesta rifiutata' });
        }
            
    }catch (err) {
        console.error('Errore durante la gestione della richiesta di collaborazione:', err);
        res.status(500).json({
            status: 'error',
            message: 'Errore interno del server durante la gestione della richiesta di collaborazione.'
        });
    }
};

// ----------------------------------- USER NOTIFICATION HANDLERS ------------------------------
const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const notifications = await Notification.find({ recipient: req.user.id })
        .sort('-createdAt') //most recent first
        .limit(20); 
        res.json({ status: 'success', data: notifications });
    } catch (err) {
        console.error('Errore durante il recupero delle notifiche:', err);
    }
};

const markNotificationsAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user.id },
            { read: true }
        );
        res.json({ status: 'success' });
    } catch (err) {
        console.error('Errore durante la marcatura della notifica come letta:', err);
        res.status(500).json({ status: 'error', message: 'Errore interno del server' });    
    }
};

// ----------------------------------- BROWSING DATA HANDLERS ----------------------------------
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
        /* TODO: implementare differenziazione tra visite pubbliche e private (visibili solo al creatore) in base a query param 'status' (es. ?status=published o ?status=draft)
            1.aggiungi campo 'status' al modello Visit (enum: ['draft', 'published'], default: 'draft')
            2.modifica createVisit per accettare 'status' da frontend (default a 'draft' se non fornito)
            3.modifica questa funzione per filtrare le visite in base al 'status' richiesto (es. Visit.find({ status: req.query.status || 'published' }))
        
        const status = req.query.status || 'published'; // Default to 'published' if not provided
        const visits = await Visit.find({ status }).populate('museum').populate('items');
        */
        
        const items = await Item.find() 
        /*.populate('author', 'username') //get creator username to show in browse market cards(username specific field needed)
        .populate('museumId')*/
        
        let purchasedItems = [];
        if (req.user && req.user.id) {
            const user = await User.findById(req.user.id);
            if (req.user && req.user.id) {
                // Estraiamo solo gli ID come stringhe per il frontend
                purchasedItems = user.purchasedItems.map(id => id.toString());
                console.log('Items posseduti dall\'utente:', purchasedItems);
            }
        }

        res.status(200).json({
            status: 'success',
            data: {
                items: items,
                purchasedItems: purchasedItems
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
        const userId = req.userId; // ID dell'utente loggato, ottenuto dal middleware authorization        

        // Verifica che la visita esista
        const visit = await Visit.findById(visitId);
        if (!visit) {
            return res.status(404).json({ status: 'error', message: 'Visita non trovata' });
        }   
        
        // Verifica se l'utente ha già acquistato questa visita
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
        console.log("Acquisto item - request body:", req.body);
        const itemId = req.body.itemId;   
        const userId = req.userId;      

        // Verifica che l'item esiste
        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({ status: 'error', message: 'Item non trovato' });
        }   
        
        // Verifica se l'utente ha già acquistato questo item 
        const user = await User.findById(userId) 
        const alreadyPurchased = user.purchasedItems.some(i => i.toString() === itemId);
        if (alreadyPurchased) {
            return res.status(400).json({ 
                success: false, 
                message: 'Hai già acquistato questo contenuto' 
            });
        }

        user.purchasedItems.push(itemId);
        await user.save();

        //retrieve items posseduti, per mostrare in frontend (es. disabilitare pulsante acquisto se già acquistata)
        let purchasedItems = [];
        if (userId) {
            //const user = await User.findById(userId);
            //purchasedItems = user.purchasedVisits.map(i => i.itemId.toString());
            purchasedItems = user.purchasedItems.map(i => {console.log(i); i.toString()});
        }
        return res.status(200).json({
            status: 'success',
            message: 'Visita acquistata con successo',
            data: {
                item: item,
                purchasedItems: purchasedItems 
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
    checkMuseumCode,
    createMuseum,
    searchMuseum,
    joinReqMuseum,
    getManagedMuseums,
    handleJoinReq,
    getNotifications,
    markNotificationsAsRead,
}