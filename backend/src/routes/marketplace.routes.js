const marketplaceRouter = require('express').Router();
const marketplaceController = require("../controllers/marketplace.controller");
const authorization = require("../middlewares/auth.middleware");


//public routes (at /marketplace)
marketplaceRouter.get("/", marketplaceController.getIndex)  
marketplaceRouter.get("/registration", marketplaceController.getSignup)  
marketplaceRouter.get("/login", marketplaceController.getLogin)  
marketplaceRouter.get("/qr-codes", marketplaceController.getQrCodes)
marketplaceRouter.get("/homepage/qr-codes", marketplaceController.getQrCodes)

//protected routes
marketplaceRouter.get("/homepage", authorization, marketplaceController.getHomepage) //from login/signup
marketplaceRouter.get("/homepage/createItems", authorization, marketplaceController.getCreateItems) //from homepage
marketplaceRouter.get("/homepage/createVisits", authorization, marketplaceController.getCreateVisits) //from homepage

marketplaceRouter.get("/homepage/newMuseum", authorization, marketplaceController.getNewMuseum) //from homepage
marketplaceRouter.get("/homepage/joinMuseum", authorization, marketplaceController.getJoinMuseum) //from homepage
marketplaceRouter.get("/homepage/myMuseums", authorization, marketplaceController.getMyMuseums) //from homepage

marketplaceRouter.get("/browseMarket", authorization, marketplaceController.getBrowseMarket) //from homepage

module.exports = marketplaceRouter;