const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    visit: { type: mongoose.Schema.Types.ObjectId, ref: 'Visit' },
    questions: [{
        question: { type: String, required: true },
        options: [{ type: String, required: true }],
        correctIndex: { type: Number, required: true },
        explanation: { type: String },
        points: { type: Number, default: 1 }
    }],
    museum: { type: mongoose.Schema.Types.ObjectId, ref: 'Museum' },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.models.Quiz || mongoose.model('Quiz', QuizSchema);

