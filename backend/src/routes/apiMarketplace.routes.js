const apiMarketplaceRouter = require('express').Router();
const apiMarketplaceController = require("../controllers/apiMarketplace.controller");
const authorization = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/auth.middleware");

// --- ITEMS SECTION ---
apiMarketplaceRouter.post("/create/items", authorization, requireRole(['creator']), apiMarketplaceController.createItems);

// --- VISITS SECTION---
apiMarketplaceRouter.post("/create/visits", authorization, requireRole(['creator']), apiMarketplaceController.createVisit);
apiMarketplaceRouter.get('/create/searchItems', authorization, apiMarketplaceController.searchItemsForVisit);

// --- MUSEUMS SECTION---
apiMarketplaceRouter.get("/museums/checkCode", authorization, apiMarketplaceController.checkMuseumCode);
apiMarketplaceRouter.post("/museums/create", authorization, requireRole(['creator']), apiMarketplaceController.createMuseum);
apiMarketplaceRouter.get("/museums/search", authorization, apiMarketplaceController.searchMuseum);
apiMarketplaceRouter.post("/museums/join/:museumId", authorization, apiMarketplaceController.joinReqMuseum);
apiMarketplaceRouter.get("/museums/getManaged", authorization, apiMarketplaceController.getManagedMuseums);
apiMarketplaceRouter.post("/museums/handleJoinRequest", authorization, requireRole(['creator']), apiMarketplaceController.handleJoinReq);

// --- USER NOTIFICATION SECTION---
apiMarketplaceRouter.get("/notifications", authorization, apiMarketplaceController.getNotifications);
apiMarketplaceRouter.patch("/notifications/markAsRead/:id", authorization, apiMarketplaceController.markNotificationsAsRead);

// --- BROWSING SECTION---
apiMarketplaceRouter.get("/browse/visits", authorization, apiMarketplaceController.getVisitsForBrowsing);
apiMarketplaceRouter.get("/browse/items", authorization, apiMarketplaceController.getItemsForBrowsing);

// --- PURCHASES SECTION ---
apiMarketplaceRouter.post("/purchase/visit", authorization, apiMarketplaceController.purchaseVisit);
apiMarketplaceRouter.post("/purchase/item", authorization, apiMarketplaceController.purchaseItem);

// --- FAVORITES TOGGLE SECTION ---
apiMarketplaceRouter.post("/favorites/toggle", authorization, apiMarketplaceController.toggleFavorite);

module.exports = apiMarketplaceRouter;