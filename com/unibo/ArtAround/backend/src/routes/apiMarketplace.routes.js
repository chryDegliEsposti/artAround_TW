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


// --- BROWSING SECTION---
apiMarketplaceRouter.get("/browse/visits", apiMarketplaceController.getVisitsForBrowsing) //fetch from browseMarket(frontend)
apiMarketplaceRouter.get("/browse/items", apiMarketplaceController.getItemsForBrowsing) //fetch from browseMarket(frontend)




module.exports = apiMarketplaceRouter;