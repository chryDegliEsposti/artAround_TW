const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());


const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/artaround';

mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB via Mongoose'))
    .catch(err => console.error('MongoDB connection error:', err));


const museumsRoute = require('./routes/MuseumsAPI');
//const itemsRoute = require('./routes/ItemsAPI');
const visitsRoute = require('./routes/VisitsAPI');
//const navRoute = require('./routes/NavAPI');

app.use('/api/museums', museumsRoute);
//app.use('/api/items', itemsRoute);
app.use('/api/visits', visitsRoute);
//app.use('/api/nav', navRoute);


app.get('/', (req, res) => {
    res.send('ArtAround API is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});