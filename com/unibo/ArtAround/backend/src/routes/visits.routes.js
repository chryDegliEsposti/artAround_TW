const visitsRouter = require('express').Router();

visitsRouter.get('/', (req, res) => {
    // Logica per ottenere tutte le visite
    res.send({msg: 'Get all visits route'});
});

// TODO: Aggiungere check di autorizzazione per rotte "delitcate" (creazione, aggiornamento, eliminazione)
// TODO: Implementare funzione per bozze visite in creazione

visitsRouter.post('/', (req, res) => {
    // Logica per creare una nuova visita
    res.send({msg: 'Create new visit route'});
});

visitsRouter.get('/:id', (req, res) => {
    // Logica per ottenere i dettagli di una visita specifica
    res.send({msg: `Get visit with id ${req.params.id} route`});
});

visitsRouter.put('/:id', (req, res) => {
    // Logica per aggiornare una visita specifica
    res.send({msg: `Update visit with id ${req.params.id} route`});
});

visitsRouter.delete('/:id', (req, res) => {
    // Logica per eliminare una visita specifica
    res.send({msg: `Delete visit with id ${req.params.id} route`});
});

visitsRouter.get('/user/:id', (req, res) => {
    // Logica per ottenere le visite di uno specifico utente
    res.send({msg: `Get visits of user with id ${req.params.id} route`});
});

module.exports = visitsRouter;  