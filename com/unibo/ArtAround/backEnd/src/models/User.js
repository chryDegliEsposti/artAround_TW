const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // TODO:Ricorda di hashare la password!
    username: { type: String, required: true },
    role: {
        type: String,
        enum: ['visitor', 'content_creator', 'teacher', 'admin'],
        default: 'visitor'
    },
    // Per estensione docente (18-27) e storico visite
    purchasedVisits: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Visit' }]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);