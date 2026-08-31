const marketplaceRouter = require('express').Router();
const marketplaceController = require("../controllers/marketplace.controller");
const authorization = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/auth.middleware");

// Public routes (at /marketplace)
marketplaceRouter.get("/", marketplaceController.getIndex);
marketplaceRouter.get("/index", marketplaceController.getIndex);
marketplaceRouter.get("/registration", marketplaceController.getSignup);
marketplaceRouter.get("/login", marketplaceController.getLogin);
marketplaceRouter.get("/qr-codes", marketplaceController.getQrCodes);
marketplaceRouter.get("/homepage/qr-codes", marketplaceController.getQrCodes);

// Protected general routes (all logged-in users)
marketplaceRouter.get("/homepage", authorization, marketplaceController.getHomepage);
marketplaceRouter.get("/browseMarket", authorization, marketplaceController.getBrowseMarket);
marketplaceRouter.get("/homepage/browseMarket", authorization, marketplaceController.getBrowseMarket);

// Protected creator routes (accessible under /marketplace/ and /marketplace/homepage/)
marketplaceRouter.get("/newMuseum", authorization, requireRole(['creator']), marketplaceController.getNewMuseum);
marketplaceRouter.get("/homepage/newMuseum", authorization, requireRole(['creator']), marketplaceController.getNewMuseum);

marketplaceRouter.get("/createVisits", authorization, requireRole(['creator']), marketplaceController.getCreateVisits);
marketplaceRouter.get("/homepage/createVisits", authorization, requireRole(['creator']), marketplaceController.getCreateVisits);

marketplaceRouter.get("/createItems", authorization, requireRole(['creator']), marketplaceController.getCreateItems);
marketplaceRouter.get("/homepage/createItems", authorization, requireRole(['creator']), marketplaceController.getCreateItems);

marketplaceRouter.get("/myMuseums", authorization, requireRole(['creator']), marketplaceController.getMyMuseums);
marketplaceRouter.get("/homepage/myMuseums", authorization, requireRole(['creator']), marketplaceController.getMyMuseums);

marketplaceRouter.get("/joinMuseum", authorization, requireRole(['creator']), marketplaceController.getJoinMuseum);
marketplaceRouter.get("/homepage/joinMuseum", authorization, requireRole(['creator']), marketplaceController.getJoinMuseum);

// Checkout route (simulated payment)
marketplaceRouter.get("/checkout", authorization, marketplaceController.getCheckout);
marketplaceRouter.get("/homepage/checkout", authorization, marketplaceController.getCheckout);

// Map editor route
marketplaceRouter.get("/editor", authorization, requireRole(['creator']), marketplaceController.getEditor);
marketplaceRouter.get("/homepage/editor", authorization, requireRole(['creator']), marketplaceController.getEditor);

module.exports = marketplaceRouter;