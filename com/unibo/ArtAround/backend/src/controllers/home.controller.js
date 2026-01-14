const getHomepage = async (req, res, next) => {
    //TODO: cambiare indirizzi, organizza bene!
    try {
        res.sendFile("/home/ababil/Desktop/artAround_TW/com/unibo/ArtAround/frontend/marketplace/pages/homepage.html");
        //res.send("okok")
    } catch (error) {
        console.error('Errore nel caricamento homepage:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Errore interno del server' 
        });
    }
}

module.exports = {
    getHomepage,

};