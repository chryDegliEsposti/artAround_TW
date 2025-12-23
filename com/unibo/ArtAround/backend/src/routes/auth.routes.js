const authRouter = require('express').Router(); 

authRouter.post('/signup', (req, res) => {
    // Logica di registrazione
    res.send({msg: 'Signup route'});
});

authRouter.post('/login', (req, res) => {
    // Logica di login
    res.send({msg:'Login route'});
});


authRouter.post('/logout', (req, res) => {
    // Logica di logout
    res.send({msg:'Logout route'});
});

module.exports = authRouter;