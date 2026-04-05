const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true },
    username: { type: String, required: true },
    password: { type: String, required: true }, 

    payment_card_number: { type: String },
    payment_card_cvv: { type: String },
    payment_card_exp: { type: Date },
    
    role: {
        type: String,
        enum: ['creator', 'teacher', 'visitor'],
        default: 'visitor'
    },
    
    //museumId: { type: String }, //TODO: solo per creator, al momento stringa semplice (es. "MUSEO123"), ma potrebbe diventare ref a collezione Musei se necessario
    managedMuseums: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Museum' }], //solo per creator, lista musei creati

    purchasedVisits: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Visit' }],
    purchasedItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }],


}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);