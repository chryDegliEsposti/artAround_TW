const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    visit: { type: mongoose.Schema.Types.ObjectId, ref: 'Visit' },
    questions: [{
        question: { type: String, required: true },
        options: [{ type: String, required: true }],
        correctIndex: { type: Number },
        correctAnswerIndex: { type: Number },
        explanation: { type: String },
        points: { type: Number, default: 1 }
    }],
    timeLimitMinutes: { type: Number, default: 10 },
    museum: { type: mongoose.Schema.Types.ObjectId, ref: 'Museum' },
    museumId: { type: String },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    teacherName: { type: String }
}, { timestamps: true });

module.exports = mongoose.models.Quiz || mongoose.model('Quiz', QuizSchema);

