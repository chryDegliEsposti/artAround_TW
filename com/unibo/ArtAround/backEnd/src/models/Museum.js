const mongoose = require('mongoose');

const MuseumSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    address: { type: String },
    webSite: { type: String },
    mapLink: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Museum', MuseumSchema);
