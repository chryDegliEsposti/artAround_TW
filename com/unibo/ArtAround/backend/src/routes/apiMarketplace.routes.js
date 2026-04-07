const apiMarketplaceRouter = require('express').Router();
const apiMarketplaceController = require("../controllers/apiMarketplace.controller");
const authorization = require("../middlewares/auth.middleware");


//apiMarketplaceRouter.use(authorization); 

// --- ITEMS SECTION ---
apiMarketplaceRouter.post("/create/items", authorization, apiMarketplaceController.createItems) //fetch createItems from frontend
//apiMarketplaceRouter.get("/get-authors", authorization, apiMarketplaceController.searchAuthorForItem) //fetch from createItems(frontend)

// --- VISITS SECTION---
apiMarketplaceRouter.post("/create/visits", authorization, apiMarketplaceController.createVisit)
apiMarketplaceRouter.get('/create/searchItems', authorization, apiMarketplaceController.searchItemsForVisit); //to search items for visit creation 

// --- MUSEUMS SECTION---
/*apiMarketplaceRouter.post("/join/museum", authorization, apiMarketplaceController.joinMuseum) //fetch from joinMuseum(frontend)
//apiMarketplaceRouter.get("/myMuseums", authorization, apiMarketplaceController.getMyMuseums) //fetch from homepage(frontend) to show user's museums in dropdown menu
*/
apiMarketplaceRouter.get("/museums/checkCode", authorization, apiMarketplaceController.checkMuseumCode) //fetch from createMuseum(frontend)
apiMarketplaceRouter.post("/museums/create", authorization, apiMarketplaceController.createMuseum) //fetch from createMuseum(frontend)
apiMarketplaceRouter.get("/museums/search", authorization, apiMarketplaceController.searchMuseum) //fetch from joinMuseum(frontend)


// --- BROWSING SECTION---
apiMarketplaceRouter.get("/browse/visits", authorization, apiMarketplaceController.getVisitsForBrowsing) //fetch from browseMarket(frontend)
apiMarketplaceRouter.get("/browse/items", authorization, apiMarketplaceController.getItemsForBrowsing) //fetch from browseMarket(frontend)


// --- PURCHASES SECTION ---
apiMarketplaceRouter.post("/purchase/visit", authorization, apiMarketplaceController.purchaseVisit) //fetch from browseMarket(frontend)
apiMarketplaceRouter.post("/purchase/item", authorization, apiMarketplaceController.purchaseItem) //fetch from browseMarket(frontend)



module.exports = apiMarketplaceRouter;