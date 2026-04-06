const mongoose = require('mongoose');

const MuseumSchema = new mongoose.Schema({
    name: { type: String, required: true },
    museumId: { type: String, required: true, unique: true },
    
    description: { type: String },
    address: { type: String },
    city: { type: String },
    longitude: { type: Number },
    latitude: { type: Number },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], //list partecipanti museo (oltre al creator)

    //mapLink: { type: String }
    //imageLink: { type: String }

}, { timestamps: true });

module.exports = mongoose.model('Museum', MuseumSchema);
