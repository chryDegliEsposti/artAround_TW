const usersRouter = require("express").Router(); 
const authorization = require("../middlewares/auth.middleware");
const userController = require("../controllers/user.controller");


usersRouter.get('/profile/:id', authorization, userController.getUserProfile);
usersRouter.put('/profile/:id', authorization, userController.updateUserProfile);

//TODO: in base a profilo utente (es. admin, visitor) aggiunta rotte per creazione visite

// DA SISTEMARE CON DB E CONTROLLER...
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