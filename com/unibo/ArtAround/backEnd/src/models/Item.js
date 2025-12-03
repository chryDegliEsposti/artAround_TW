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

    author: { type: mongoose.Schema.Types.ObjectId, ref: 'Author' },
    museums: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Museum' }],

}, { timestamps: true });

module.exports = mongoose.model('Item', ItemSchema);