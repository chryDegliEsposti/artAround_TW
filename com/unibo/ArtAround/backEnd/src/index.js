const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Carica variabili d'ambiente
dotenv.config();

// Connetti al DB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Per leggere JSON nei body delle richieste

// Placeholder per le rotte (le creeremo dopo)
// app.use('/api/users', require('./routes/userRoutes'));
// app.use('/api/visits', require('./routes/visitRoutes'));

app.get('/', (req, res) => {
    res.send('ArtAround API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});