const path = require("path")


const FRONTEND_ROOT = path.resolve(__dirname, "../../../frontend");
const MARKETPLACE_PAGES = path.join(FRONTEND_ROOT, "marketplace/pages");

function servePage(pageName) {
    return (req, res) => {
        console.log("Sending page: ", path.join(MARKETPLACE_PAGES, `${pageName}.html`), req.cookies)
        res.sendFile(path.join(MARKETPLACE_PAGES, `${pageName}.html`));
    };
}

const getIndex = servePage("index")
const getSignup = servePage("registration")
const getLogin = servePage("login")
const getHomepage = servePage("homepage")

const getCreateItems = servePage("createItems")
const getCreateVisits = servePage("createVisits") 

const getBrowseMarket = servePage("browseMarket")

const getNewMuseum = servePage("newMuseum")
const getJoinMuseum = servePage("joinMuseum")
const getMyMuseums = servePage("myMuseums")

const getMyLibrary = servePage("myLibrary")
const getCreateTeacherVisits = servePage("createTeacherVisits")
const getMyContent = servePage("myContent")
const getCreateClass = servePage("createClass");
const getManageClasses = servePage("manageClasses");

const getJoinClassroom = servePage("joinClassroom");
const getMyClasses = servePage("myClasses");

const getGuidedVisitAvailability = servePage("guidedVisitAvailability");


module.exports = {
    getIndex,
    getSignup,
    getLogin,
    getHomepage,
    getCreateItems,
    getCreateVisits,
    getBrowseMarket,
    getNewMuseum,
    getJoinMuseum,
    getMyMuseums,
    getMyLibrary,
    getCreateTeacherVisits,
    getMyContent,
    getCreateClass,
    getManageClasses,
    getJoinClassroom,
    getMyClasses,
    getGuidedVisitAvailability,

};