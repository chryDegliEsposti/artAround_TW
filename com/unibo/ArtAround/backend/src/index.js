const express = require("express");  
const path = require('path');   
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })
const authRouter = require("./routes/auth.routes"); 
const usersRouter = require("./routes/users.routes");   
const visitsRouter = require("./routes/visits.routes"); 
const mongoose = require('mongoose');
const errorsMiddleware = require('./middlewares/errors.middleware');
const cookieParser = require('cookie-parser');

//DB connection
const dbConnection = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log(`Connected to MongoDB in ${process.env.NODE_ENV} mode.`);
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
};

//------------- START SERVER -----------------
const app = express();

//app configurations 
app.use(express.json()); //per leggere req body in formato json
app.use(express.urlencoded({ extended: false })); //easier gestione form html 
app.use(cookieParser()); 

const PORT = process.env.PORT || 3000;
app.use("/api/v1/auth", authRouter); 
app.use("/api/v1/users", usersRouter); 
app.use("/api/v1/visits", visitsRouter);

app.use(errorsMiddleware);

/*
// Dati mock (poi sostituisci con database)
const visits = [
    { id: 1, title: 'Tour Museo', image: 'museo.jpg', status: 'published' },
    { id: 2, title: 'Mostra Arte', image: 'arte.jpg', status: 'draft' }
];
*/

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/marketplace/pages/index.html'));
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);

    dbConnection();
});


