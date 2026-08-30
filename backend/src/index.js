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
const http = require('http');
const { Server } = require('socket.io');
const { initSyncTourSockets } = require('./sockets/syncTour.socket');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Initialize WebSocket synchronized tours
initSyncTourSockets(io);

//app configurations 
app.use(express.json()); //per leggere req body in formato json(in auto)
app.use(express.urlencoded({ extended: false })); //easier gestione form html 
app.use(cookieParser());
app.use(cors()); //allow incoming requests  
app.use(errorsMiddleware);

const PORT = process.env.PORT || 3000;

// serve frontend as static files
const frontendRoot = path.resolve(__dirname, "../../client_marketplace");
app.use(express.static(frontendRoot));

// Serve navigator React build static files
const navigatorRoot = path.resolve(__dirname, "../../client_navigator/dist");
app.use('/navigator', express.static(navigatorRoot));
app.get('/navigator/*', (req, res) => {
    res.sendFile(path.join(navigatorRoot, 'index.html'));
});

console.log('Serving marketplace from:', frontendRoot);
console.log('Serving navigator from:', navigatorRoot);

// Root landing redirect to marketplace
app.get('/', (req, res) => {
    res.redirect('/marketplace');
});
app.get('/qr-codes', (req, res) => {
    res.redirect('/marketplace/qr-codes');
});

// ======= VIEW ONLY =======
app.use("/marketplace", marketplaceRouter);


// ======= API ======= funzioni centralizzate per Marketplace e Navigator con API
app.use("/api/v1/auth", authRouter); //richieste fetch da registration/login
app.use("/api/v1/marketplace", apiMarketplaceRouter) //richieste fetch da createItems/createVisits

// ======= Navigator APIs =======
app.use("/api/v1/navigator/museums", navMuseumsRoute);
app.use("/api/v1/navigator/visits", navVisitsRoute);
app.use("/api/v1/navigator/ai", navAiRoute);


server.listen(PORT, async () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`WebSocket server initialized on port ${PORT}`);

    await dbConnection();
});



