const mongoose = require('mongoose');

const VisitDoneSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    visit: { type: mongoose.Schema.Types.ObjectId, ref: 'Visit', required: true },
    day: { type: Date, required: true }
}, { timestamps: true });

module.exports = mongoose.model('VisitDone', VisitDoneSchema);
