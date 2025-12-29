const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description_short_easy: { type: String },
    description_short_medium: { type: String },
    description_short_hard: { type: String },
    description_medium_easy: { type: String },
    description_medium_medium: { type: String },
    description_medium_hard: { type: String },
    description_long_easy: { type: String },
    description_long_medium: { type: String },
    description_long_hard: { type: String },

    locationCode: { type: String, required: true }, // Il tuo codice "stanza-piano" 2-2-3 : piano, stanza, numero item

    // CAMPO FONDAMENTALE PER IL 33 PT
    location: {
        type: { type: String, default: 'Point' },
        coordinates: {
            type: [Number],
            required: true,
            index: '2dsphere' // Questo indice abilita la magia del GPS
        }
    },

    // Il GPS non sa a che piano sei, quindi aggiungilo a parte
    floor: { type: Number, default: 0 },

    author: { type: mongoose.Schema.Types.ObjectId, ref: 'Author' },
    museums: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Museum' }],

}, { timestamps: true });

module.exports = mongoose.model('Item', ItemSchema);