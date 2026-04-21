const express = require("express");
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })
const mongoose = require('mongoose');
const errorsMiddleware = require('./middlewares/errors.middleware');
const authRouter = require("./routes/auth.routes");
//const usersRouter = require("./routes/users.routes");   
//const visitsRouter = require("./routes/visits.routes"); 
//const homeRouter = require("./routes/home.routes");
const marketplaceRouter = require("./routes/marketplace.routes");
const apiMarketplaceRouter = require("./routes/apiMarketplace.routes");

// Navigator API Router Imports
const navMuseumsRoute = require('./routes/navigator/MuseumsAPI');
const navVisitsRoute = require('./routes/navigator/VisitsAPI');
const navAiRoute = require('./routes/navigator/AIAPI');

//DB connection
const dbConnection = async () => {
    try {
        console.log(`Connecting to MongoDB at: ${process.env.MONGO_URI}`);
        await mongoose.connect(process.env.MONGO_URI)
        console.log(`Connected to MongoDB in ${process.env.NODE_ENV} mode.`);
    } catch (error) {
        console.error("MongoDB connection error:", error);
        // process.exit(1); // Removed to allow server to stay alive for UI testing
    }
};

//------------- START SERVER -----------------
const app = express();

//app configurations 
app.use(express.json()); //per leggere req body in formato json(in auto)
app.use(express.urlencoded({ extended: false })); //easier gestione form html 
app.use(cookieParser());
app.use(cors()); //allow incoming requests  
app.use(errorsMiddleware);

const PORT = process.env.PORT || 3000;

// serve frontend as static files(to make it served by the API) 
// NOTA: da qui serviti Marketplace e Navigator
const frontendRoot = path.resolve(__dirname, "../../client_marketplace");
app.use(express.static(frontendRoot));

// Eventually add navigator static folder if needed
// const navigatorRoot = path.resolve(__dirname, "../../client_navigator/dist");
// app.use('/navigator', express.static(navigatorRoot));
console.log('Serving static from', frontendRoot);

// ======= VIEW ONLY =======
app.use("/marketplace", marketplaceRouter)
//app.use("/navigator", navigatorRouter) ... LATER CON MERGE WORK MATTE

// ======= API ======= funzioni centralizzate per Marketplace e Navigator con API
app.use("/api/v1/auth", authRouter); //richieste fetch da registration/login
app.use("/api/v1/marketplace", apiMarketplaceRouter) //richieste fetch da createItems/createVisits

// ======= Navigator APIs =======
app.use("/api/v1/navigator/museums", navMuseumsRoute);
app.use("/api/v1/navigator/visits", navVisitsRoute);
app.use("/api/v1/navigator/ai", navAiRoute);


//TODO ROUTE: aggiunge as I go a macchia d'olio...
//app.use("/api/v1/users", usersRouter); 
//app.use("/api/v1/visits", visitsRouter); 
//app.use("/api/v1/navigator", visitsRouter);

/*
// Dati mock (poi sostituisci con database)
const visits = [
    { id: 1, title: 'Tour Museo', image: 'museo.jpg', status: 'published' },
    { id: 2, title: 'Mostra Arte', image: 'arte.jpg', status: 'draft' }
];
*/

/*app.get("/", (req, res) => {
    res.sendFile('marketplace/pages/index.html', { root: frontendRoot });
});
*/

app.listen(PORT, async () => {
    console.log(`Server is running on http://localhost:${PORT}`);

    await dbConnection();
});


