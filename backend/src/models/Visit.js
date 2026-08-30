const mongoose = require('mongoose');

const VisitSchema = new mongoose.Schema({
    museum: { type: mongoose.Schema.Types.ObjectId, ref: 'Museum' },
    museumId: { type: String, default: "PIN-BO" },
    title: { type: String, required: true },
    description: { type: String },
    price: { type: Number, default: 0 },
    duration: { type: Number, default: 60 }, // minuti stimati
    image: { type: String },
    
    // Target e Livello di conoscenza
    knowledgeLevel: {
        type: String,
        enum: ['infantile', 'elementare', 'medio', 'specialistico'],
        default: 'medio'
    },
    targetAudience: {
        type: String,
        default: 'Tutti'
    },
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'published'
    },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // Campi per la Sincronizzazione Guida / Docente (Estensione 18-27)
    isSync: { type: Boolean, default: false },
    mnemonicName: { type: String }, // es. "Fenice rossa" per ingresso studenti
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },

    // Sequenza ordinata di Step (Item + Indicazioni Logistiche separate)
    steps: [{
        order: { type: Number, required: true },
        stepType: { 
            type: String, 
            enum: ['item', 'logistica'], 
            required: true 
        },
        itemId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Item'
        },
        logisticsText: { 
            type: String 
        },
        targetPoiId: { type: Number },
        roomName: { type: String },
        estimatedSeconds: { type: Number, default: 30 }
    }],

    // Array di item per retrocompatibilità e query veloci
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }]

}, { timestamps: true });

module.exports = mongoose.models.Visit || mongoose.model('Visit', VisitSchema);

