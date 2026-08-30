const marketplaceRouter = require('express').Router();
const marketplaceController = require("../controllers/marketplace.controller");
const authorization = require("../middlewares/auth.middleware");


//public routes (at /marketplace)
marketplaceRouter.get("/", marketplaceController.getIndex)  
marketplaceRouter.get("/registration", marketplaceController.getSignup)  
marketplaceRouter.get("/login", marketplaceController.getLogin)  


//protected routes
marketplaceRouter.get("/homepage", authorization, marketplaceController.getHomepage) //from login/signup
marketplaceRouter.get("/homepage/createItems", authorization, marketplaceController.getCreateItems) //from homepage
marketplaceRouter.get("/homepage/createVisits", authorization, marketplaceController.getCreateVisits) //from homepage

marketplaceRouter.get("/homepage/newMuseum", authorization, marketplaceController.getNewMuseum) //from homepage
marketplaceRouter.get("/homepage/joinMuseum", authorization, marketplaceController.getJoinMuseum) //from homepage
marketplaceRouter.get("/homepage/myMuseums", authorization, marketplaceController.getMyMuseums) //from homepage

marketplaceRouter.get("/browseMarket", authorization, marketplaceController.getBrowseMarket) //from homepage

//from TEACHER homepage MAYBE anche da homepage creator e visitors???
marketplaceRouter.get("/homepage/myLibrary", authorization, marketplaceController.getMyLibrary) 
marketplaceRouter.get("/homepage/createTeacherVisits", authorization, marketplaceController.getCreateTeacherVisits) //from homepage
marketplaceRouter.get("/homepage/myContent", authorization, marketplaceController.getMyContent) //from myLibrary or homepage

marketplaceRouter.get("/homepage/createClass", authorization, marketplaceController.getCreateClass) //from myContent or homepage
marketplaceRouter.get("/homepage/manageClasses", authorization, marketplaceController.getManageClasses) //from myContent or homepage

marketplaceRouter.get("/homepage/joinClassroom", authorization, marketplaceController.getJoinClassroom);
marketplaceRouter.get("/homepage/myClasses", authorization, marketplaceController.getMyClasses);



module.exports = marketplaceRouter;