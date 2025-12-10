const mongoose = require('mongoose');

const ItemLinksSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'Author' },
    
    museums: [{
        museum: { type: mongoose.Schema.Types.ObjectId, ref: 'Museum' },
        room: { type: String }
    }]
}, { timestamps: true });

module.exports = mongoose.model('ItemLinks', ItemLinksSchema);
