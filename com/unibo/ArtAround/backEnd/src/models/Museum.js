const mongoose = require('mongoose');

const MuseumSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    address: { type: String },
    webSite: { type: String },
    mapLink: { type: String },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number] }
    }
}, { timestamps: true });

MuseumSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Museum', MuseumSchema);
