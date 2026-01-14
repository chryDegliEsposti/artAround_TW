const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true },
    username: { type: String, required: true },
    password: { type: String, required: true }, // TODO:Ricorda di hashare la password!

    payment_card_number: { type: String },
    payment_card_cvv: { type: String },
    payment_card_exp: { type: Date },
    
    role: {
        type: String,
        enum: ['admin', 'teacher', 'visitor'],
        default: 'visitor'
    },
    
    purchasedVisits: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Visit' }]

}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);