const authRouter = require('express').Router(); 
const authController = require('../controllers/auth.controller');

authRouter.post('/signup', authController.signup); //each route is managed by a controller

authRouter.post('/login', authController.login);



module.exports = authRouter;