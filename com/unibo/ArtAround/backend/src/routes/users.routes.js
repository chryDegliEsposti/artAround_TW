const usersRouter = require("express").Router(); 
 
usersRouter.get('/profile', (req, res) => {
    // Logica per ottenere il profilo utente
    res.send({msg: 'User profile route'});
});

//TODO: in base a profilo utente (es. admin, visitor) aggiunta rotte per creazione visite

usersRouter.put('/profile', (req, res) => {
    // Logica per aggiornare il profilo utente
    res.send({msg: 'Update user profile route'});
});

usersRouter.get('/favorites', (req, res) => {
    // Logica per ottenere i preferiti dell'utente
    res.send({msg: 'User favorites route'});
});

usersRouter.post('/favorites', (req, res) => {
    // Logica per aggiungere un preferito
    res.send({msg: 'Add to favorites route'});
});

usersRouter.delete('/favorites/:id', (req, res) => {
    // Logica per rimuovere un preferito
    res.send({msg: 'Remove from favorites route'});
});

module.exports = usersRouter;