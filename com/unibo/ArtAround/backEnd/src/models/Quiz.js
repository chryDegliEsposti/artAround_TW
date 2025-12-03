const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    questions: [{
        question: { type: String, required: true },
        answers: [{
            answer: { type: String, required: true },
            isCorrect: { type: Boolean, required: true }
        }]
    }],
    museums: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Museum' }],
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]

}, { timestamps: true });

module.exports = mongoose.model('Quiz', QuizSchema);
