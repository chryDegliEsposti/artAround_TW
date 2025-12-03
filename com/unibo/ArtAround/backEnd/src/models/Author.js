const mongoose = require('mongoose');

const AuthorSchema = new mongoose.Schema({
    birthDate: { type: Date },
    deathDate: { type: Date },
    birthPlace: { type: String },
    descriptionShort: { type: String },
    descriptionLong: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Author', AuthorSchema);
