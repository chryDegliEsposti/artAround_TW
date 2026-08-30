const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
    // Informazioni principali sull'item
    itemType: {
        type: String,
        enum: ['artwork', 'artist', 'style', 'movement', 'historical_event', 'other'],
        required: true,
        default: 'artwork'
    },
    artworkId: {
        type: String,
        index: true // Q-number Wikidata per l'opera (es: "Q126599960")
    },
    authorId: {
        type: String // Q-number Wikidata per l'autore (es: "Q1527051")
    },
    styleId: {
        type: String // Q-number Wikidata per lo stile/movimento (es: "Q131808")
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    author: { type: String }, // Nome visualizzato dell'artista (es. "Girolamo Mazzola Bedoli")
    creator: { type: String }, // Autore del contenuto/guida (username o 'AI')
    style: { type: String }, // Nome visualizzato dello stile (es. "Manierismo")
    recognitionImage: {
        type: String // URL immagine di riconoscimento
    },

    // Parametri per filtro audience / personalizzazione
    length: {
        type: String,
        enum: ['3s', '15s', '40s', '1min', '4min'], 
        required: true,
        default: '15s'
    },
    languageLevel: {
        type: String,
        enum: ['infantile', 'elementare', 'medio', 'specialistico'],
        required: true,
        default: 'medio'
    },

    // Museo di appartenenza
    museumId: { 
        type: String, 
        required: true 
    },
    museum: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Museum'
    },
    poiId: {
        type: Number // ID numerico del POI sulla mappa indoor
    },

    // Parametri Marketplace & Licenza
    license: { 
        type: String, 
        enum: [
            'CC0',           // Public domain
            'CC-BY',         // Uso libero con attribuzione
            'CC-BY-SA',      // Uso libero con stessa licenza
            'CC-BY-NC',      // Non commerciale
            'CC-BY-ND',      // No modifiche
            'CC-BY-NC-SA',   // Non commerciale + stessa licenza
            'CC-BY-NC-ND',   // Non commerciale + no modifiche
            'Proprietary',   // Tutti i diritti riservati
            'Custom'         // Licenza personalizzata
        ],
        default: 'CC-BY-SA'
    },
    price: {
        type: Number,
        default: 0,
        min: 0
    },

    // Metadati Generative AI (per tracciare item generati al volo da LLM)
    isAIGenerated: {
        type: Boolean,
        default: false
    },
    aiPromptContext: {
        type: String
    }

}, { timestamps: true });

module.exports = mongoose.models.Item || mongoose.model('Item', ItemSchema);