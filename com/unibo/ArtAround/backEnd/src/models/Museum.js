const mongoose = require('mongoose');

const MuseumSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    address: { type: String },
    webSite: { type: String },
    mapLink: { type: String },
    imageLink: { type: String },
    wikidataId: { type: String },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number] }
    }
}, { timestamps: true });

MuseumSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Museum', MuseumSchema);
// TODO: https://www.wikidata.org/wiki/Special:EntityData/WIKIDATAID.json implement get description from wikidata
