const marketplaceRouter = require('express').Router();
const markteplaceController = require("../controllers/marketplace.controller");
const authorization = require("../middlewares/auth.middleware");


//public routes (partono da base /marketplace)
marketplaceRouter.get("/", markteplaceController.getIndex)  
marketplaceRouter.get("/registration", markteplaceController.getSignup)  
marketplaceRouter.get("/login", markteplaceController.getLogin)  
//TODO: 
    //da login e registration .html problema che porta a root, e non a api/v1/marketplace

marketplaceRouter.get("/registration", markteplaceController.getSignup)
marketplaceRouter.get("/login", markteplaceController.getLogin)

//protected routes
marketplaceRouter.get("/homepage", authorization, markteplaceController.getHomepage) //qua arrivo da login/signup


module.exports = marketplaceRouter;