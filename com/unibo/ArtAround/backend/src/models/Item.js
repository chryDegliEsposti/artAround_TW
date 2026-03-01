const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
    //INFORMATION about the item
    itemType: {
        type: String,
        enum: ['artwork', 'artist', 'style', 'movement', 'historical_event', 'other'],
        required: true,
        default: 'artwork'
    },
    artworkId: {
        type: String,
        required: function() { return this.itemType === 'artwork'; },
        index: true //db optimization for search by artworkId
        // Esempio: "Q126599960" (per il quadro di Bedoli)
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    style: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
    recognitionImage: {
        type: String, //url dell'immagine...
    },

    //to FILTER by audience level
    length: {
        type: String,
        enum: ['3s', '15s', '1min', '4min'], 
        required: true
    },
    languageLevel: {
        type: String,
        enum: ['infantile', 'elementare', 'medio', 'specialistico'],
        required: true
    },

    //WHERE the item can be found (for artworks, the museum it belongs to; for artists, the museum where most of their works are displayed, etc.)
    museum: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Museum', 
        required : true 
    },

    //For the artworks MARKETPLACE
    license: { 
        type: String, 
        enum: [
            'CC0',           // Public domain
            'CC BY',         // Uso libero con attribuzione
            'CC BY-SA',      // Uso libero con stessa licenza
            'CC BY-NC',      // Non commerciale
            'CC BY-ND',      // No modifiche
            'CC BY-NC-SA',   // Non commerciale + stessa licenza
            'CC BY-NC-ND',   // Non commerciale + no modifiche
            'Proprietary',   // Tutti i diritti riservati
            'Custom'         // Licenza personalizzata
        ],
        required: function() { return this.itemType === 'artwork'; },
    },
    price: {
        type: Number,
        required: function() { return this.itemType === 'artwork'; },
        min: 0
    }

}, { timestamps: true });

module.exports = mongoose.model('Item', ItemSchema);