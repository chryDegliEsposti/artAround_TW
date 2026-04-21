const homeRouter = require('express').Router(); 
const homeController = require('../controllers/home.controller');
const authorizationMiddleware = require("../middlewares/auth.middleware");


//TODO: ADD auth middleware

homeRouter.get('/', authorizationMiddleware, homeController.getHomepage); 
//tutti gli endpoints relativi a homepage qui...(FORSE Cose in users andranno qua in realtà)

module.exports = homeRouter;