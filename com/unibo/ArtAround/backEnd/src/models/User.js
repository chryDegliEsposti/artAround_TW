const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // TODO:Ricorda di hashare la password!
    username: { type: String, required: true },
    payment_card_number: { type: String },
    payment_card_cvv: { type: String },
    payment_card_exp: { type: Date },
    role: {
        type: String,
        enum: ['visitor', 'content_creator', 'teacher', 'admin'],
        default: 'visitor'
    },
    purchasedVisits: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Visit' }]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);