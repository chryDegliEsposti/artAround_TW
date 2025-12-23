const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
    itemType: {
        type: String,
        enum: ['artwork', 'artist', 'style', 'movement', 'historical_event', 'other'],
        required: true,
        default: 'artwork'
    },

    artworkId: {
        type: String,
        required: () => {this.itemType === 'artwork'},
        index: true //per ottimizzazioni db
        // Esempio: "Q126599960" (per il quadro di Bedoli)
    },

    title: { type: String, required: true },

    recognitionImage: {
        type: String, //url dell'immagine...
    },

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

    description: { type: String, required: true },

    author: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },

    syle: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },

    museum: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Museum', 
        required : true 
    },

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
        required: () => {this.itemType === 'artwork'},
    },
}, { timestamps: true });

module.exports = mongoose.model('Item', ItemSchema);