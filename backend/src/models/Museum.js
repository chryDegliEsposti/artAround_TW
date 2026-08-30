const mongoose = require('mongoose');

const MuseumSchema = new mongoose.Schema({
    name: { type: String, required: true },
    museumId: { type: String, required: true, unique: true }, // es. "PIN-BO"
    description: { type: String },
    address: { type: String },
    city: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    image: { type: String },
    hours: { type: String, default: "09:00 - 19:00" },
    price: { type: String, default: "10.00€" },
    accessibility: { 
        type: [String], 
        default: ["Accessibile in sedia a rotelle", "Ascensori a tutti i piani", "Servizi igienici accessibili", "Guida audio per non vedenti"] 
    },
    categories: { type: [String], default: ["Arte Antica", "Rinascimento", "Pittura Emiliana"] },
    wikidataId: { type: String }, // es. "Q1056588" per Pinacoteca Nazionale di Bologna
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    
    pendingRequests: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        requestedAt: { type: Date, default: Date.now }
    }],
    collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // Geometria e Mappa Indoor 2D (utilizzata da Navigator & Editor)
    museumCenter: { 
        type: [Number], 
        default: [44.4975, 11.3533] // Pinacoteca Nazionale di Bologna lat, lng
    },
    layers: [{
        id: { type: Number, required: true },
        name: { type: String, required: true }
    }],
    lines: [{
        id: { type: Number },
        type: { type: String, enum: ['ext-wall', 'int-wall', 'door', 'divider'], default: 'ext-wall' },
        points: [{
            lat: Number,
            lng: Number,
            x: Number,
            y: Number
        }],
        layerId: { type: Number, default: 1 }
    }],
    areas: [{
        id: { type: Number },
        type: { type: String }, // 'restaurant', 'restroom', 'room', 'exhibition_hall', 'shop'
        subType: { type: String },
        name: { type: String },
        points: [{
            lat: Number,
            lng: Number,
            x: Number,
            y: Number
        }],
        layerId: { type: Number, default: 1 }
    }],
    pois: [{
        id: { type: Number },
        type: { type: String }, // 'exhibit', 'restroom', 'restaurant', 'exit', 'stairs', 'elevator', 'info', 'shop'
        subType: { type: String },
        name: { type: String },
        desc: { type: String },
        position: {
            lat: Number,
            lng: Number,
            x: Number,
            y: Number
        },
        layerId: { type: Number, default: 1 },
        artworkId: { type: String }, // Wikidata Q-ID (es. Q126599960)
        itemRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' }
    }]
}, { timestamps: true });

// Prevenzione errori sovrascrittura modello in Mongoose
module.exports = mongoose.models.Museum || mongoose.model('Museum', MuseumSchema);

