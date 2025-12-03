const mongoose = require('mongoose');
const VisitSchema = new mongoose.Schema({
    museum: { type: mongoose.Schema.Types.ObjectId, ref: 'Museum', required: true },
    price: { type: Number, required: true },
    duration: { type: Number },
    title: { type: String, required: true },
    description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Visit', VisitSchema);
