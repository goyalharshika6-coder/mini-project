import mongoose from 'mongoose';
import 'dotenv/config';

const courseSchema = new mongoose.Schema({
    courseName: String,
    diagnosticResults: Object,
    userId: mongoose.Schema.Types.ObjectId,
}, { strict: false });

const Course = mongoose.model('Course', courseSchema);

async function checkLatestCourse() {
    try {
        const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/skillpath-ai';
        await mongoose.connect(MONGO_URI);

        const course = await Course.findOne().sort({ createdAt: -1 });
        if (!course) {
            console.log('No courses found.');
        } else {
            console.log('--- Latest Course ---');
            console.log('ID:', course._id);
            console.log('Name:', course.courseName);
            console.log('Diagnostic Results:', JSON.stringify(course.diagnosticResults, null, 2));
            console.log('Duration:', course.duration);
            console.log('Daily Time:', course.dailyTime);
            console.log('Structure:', course.structure ? 'Exists' : 'Missing');
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkLatestCourse();
