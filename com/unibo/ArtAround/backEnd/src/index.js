const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());


mongoose.connect('mongodb://localhost:27017/artaround')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));


const museumsRoute = require('./routes/MuseumsAPI');
const itemsRoute = require('./routes/ItemsAPI');
const visitsRoute = require('./routes/VisitsAPI');
const aiRoute = require('./routes/AI_API');

const quizSessionRoutes = require('./routes/QuizSessionsAPI');


app.use('/api/museums', museumsRoute);
app.use('/api/items', itemsRoute);
app.use('/api/visits', visitsRoute);
app.use('/api/ai', aiRoute);
app.use('/api/quiz-sessions', quizSessionRoutes);
app.use('/api/authors', require('./routes/AuthorsAPI'));


app.get('/', (req, res) => {
    res.send('ArtAround API is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
