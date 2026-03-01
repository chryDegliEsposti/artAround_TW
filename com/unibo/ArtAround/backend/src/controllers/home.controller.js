const getHomepage = async (req, res, next) => {
    //TODO: cambiare indirizzi, organizza bene!
    try {
        res.sendFile("/home/ababil/Desktop/artAround_TW/com/unibo/ArtAround/frontend/marketplace/pages/homepage.html");
        //res.send("okok")
    } catch (error) {
        console.error('Error loading home page:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
}

/*const getCreateItems = async (req, res, next) => {
    try {
        res.sendFile("/home/ababil/Desktop/artAround_TW/com/unibo/ArtAround/frontend/marketplace/pages/create-items.html");
    } catch (error) {
        console.error('Error loading create-items page:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
}*/

module.exports = {
    getHomepage,
    
};