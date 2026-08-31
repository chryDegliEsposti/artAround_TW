const authRouter = require('express').Router(); 
const authController = require('../controllers/auth.controller');
const authorization = require('../middlewares/auth.middleware');

authRouter.post('/signup', authController.signup); //each route is managed by a controller
authRouter.post('/login', authController.login);
authRouter.get('/logout', authController.logout);
authRouter.get('/me', authorization, authController.getMe);

module.exports = authRouter;