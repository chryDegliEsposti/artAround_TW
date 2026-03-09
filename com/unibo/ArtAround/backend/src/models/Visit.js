const mongoose = require('mongoose');

const VisitSchema = new mongoose.Schema({
    //museum: { type: mongoose.Schema.Types.ObjectId, ref: 'Museum', required: true },
    museum: { type: String, required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    duration: { type: Number },
    description: { type: String },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    /*steps: [{
        order: { type: Number, required: true },
        tipo: { 
            type: String, 
            enum: ['item', 'logistica'], 
            required: true 
        },
        
        itemId: { //option 1
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Item',
            required: function() { return this.tipo === 'item'; }
        },

        testoLogistica: { //option 2
            type: String,
            required: function() { return this.tipo === 'logistica'; }
        },

        luogoRiferimento: { type: String }, //potrebbe essere un roomId o una zona del museo
    }]*/

    items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }], //array di item (solo quelli di tipo 'artwork' per ora, ma in futuro anche 'experience')

}, { timestamps: true });

module.exports = mongoose.model('Visit', VisitSchema);
