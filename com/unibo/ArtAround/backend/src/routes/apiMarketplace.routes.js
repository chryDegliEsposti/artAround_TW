const apiMarketplaceRouter = require('express').Router();
const apiMarketplaceController = require("../controllers/apiMarketplace.controller");
const authorization = require("../middlewares/auth.middleware");


//apiMarketplaceRouter.use(authorization); 

// --- ITEMS SECTION ---
apiMarketplaceRouter.post("/items", authorization, apiMarketplaceController.createItems) //fetch createItems from frontend
//apiMarketplaceRouter.get("/get-authors", authorization, apiMarketplaceController.searchAuthorForItem) //fetch from createItems(frontend)


// --- VISITS SECTION---
//apiMarketplaceRouter.post("/visit", authorization, apiMarketplaceController.createVisit)
apiMarketplaceRouter.get('/searchItems', apiMarketplaceController.searchItemsForVisit); //to search items for visit creation 



module.exports = apiMarketplaceRouter;