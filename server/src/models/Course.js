import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    courseName: {
        type: String,
        required: true
    },
    targetGoal: {
        type: String,
        required: true
    },
    duration: {
        type: Number, // in days
        required: true
    },
    dailyTime: {
        type: Number, // in hours
        required: true
    },
    diagnosticTest: [{
        question: String,
        options: [String],
        answer: String,
        difficulty: String,
        skill: String
    }],
    diagnosticResults: {
        score: Number,
        skillLevel: String, // Beginner, Intermediate, Advanced
        missingSkills: [String],
        knownSkills: [String]
    },
    structure: [{
        stage: String, // e.g., "Level 1: Fundamentals"
        chapter: String,
        dayRange: String,
        topic: String,
        subtopics: [String], // Array of sub-skills covered
        description: String,
        estimatedTime: String,
        status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
        content: {
            markdown: String,
            youtubeId: String
        }
    }],
    chapterQuizzes: [{
        stage: String,
        score: Number,
        youtubeId: String,
        completed: { type: Boolean, default: false }
    }],
    isEnrolled: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export default mongoose.model('Course', courseSchema);
