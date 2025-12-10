const mongoose = require('mongoose');

const QuizSessionSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    participants: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
        name: { type: String, required: true }, 
        score: { type: Number, default: 0 },
        joinedAt: { type: Date, default: Date.now }
    }],
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date, default: () => Date.now() + 24 * 60 * 60 * 1000 } 
}, { timestamps: true });

module.exports = mongoose.model('QuizSession', QuizSessionSchema);
