const express = require('express');
const router = express.Router();
const QuizSession = require('../models/QuizSession');
const Quiz = require('../models/Quiz');

// Helper to generate a random 6-character code
function generateCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// POST /api/quiz-sessions - Create a new session (Teacher)
router.post('/', async (req, res) => {
    try {
        const { quizId, teacherId } = req.body;

        const quiz = await Quiz.findById(quizId);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        let code;
        let isUnique = false;

        while (!isUnique) {
            code = generateCode();
            const existing = await QuizSession.findOne({ code, isActive: true });
            if (!existing) isUnique = true;
        }

        const session = new QuizSession({
            code,
            quiz: quizId,
            teacher: teacherId,
            participants: []
        });

        await session.save();
        res.status(201).json(session);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/quiz-sessions/join - Join a session (Student)
router.post('/join', async (req, res) => {
    try {
        const { code, name, userId } = req.body;

        const session = await QuizSession.findOne({ code, isActive: true });
        if (!session) return res.status(404).json({ message: 'Session not found or inactive' });

        const existingParticipant = session.participants.find(p =>
            (userId && p.user && p.user.toString() === userId) ||
            (p.name === name)
        );

        if (existingParticipant) {
            return res.json({ message: 'Already joined', session });
        }

        session.participants.push({
            user: userId || null,
            name: name
        });

        await session.save();
        res.json({ message: 'Joined successfully', session });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/quiz-sessions/:code - Get session info (Teacher/Student)
router.get('/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const session = await QuizSession.findOne({ code }).populate('quiz').populate('participants.user', 'username email');

        if (!session) return res.status(404).json({ message: 'Session not found' });

        res.json(session);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
