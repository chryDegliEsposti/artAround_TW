const mongoose = require('mongoose');

const GuidedVisitSessionSchema = new mongoose.Schema({
    guidedVisit: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Visit',
        required: true
    },

    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    classrooms: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classroom',
        required: true
    }],

    participants: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        joinedAt: {
            type: Date,
            default: Date.now
        }
    }],

    sessionCode: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },

    status: {
        type: String,
        enum: ['scheduled', 'active', 'completed'],
        default: 'scheduled'
    },

    currentStep: {
        type: Number,
        default: 0
    },

    startedAt: Date,
    endedAt: Date
}, {
    timestamps: true
});


module.exports = mongoose.model(
    'GuidedVisitSession',
    GuidedVisitSessionSchema
);