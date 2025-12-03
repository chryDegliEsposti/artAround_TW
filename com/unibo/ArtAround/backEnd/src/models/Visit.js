const mongoose = require('mongoose');

const VisitSchema = new mongoose.Schema({

}, { timestamps: true });

module.exports = mongoose.model('Visit', VisitSchema);

