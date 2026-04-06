import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
    company: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['Full-time', 'Part-time', 'Internship', 'Freelance', 'Contract']
    },
    location: {
        type: String,
        required: true
    },
    salary: {
        type: String,
        required: true
    },
    reqs: [{
        type: String
    }],
    isHot: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export default mongoose.model('Job', jobSchema);
