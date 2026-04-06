import mongoose from 'mongoose';
import 'dotenv/config';

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
});

const User = mongoose.model('User', userSchema);

async function checkDB() {
    try {
        const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/skillpath-ai';
        console.log('Connecting to:', MONGO_URI);
        await mongoose.connect(MONGO_URI);
        console.log('Connected.');

        const users = await User.find({});
        console.log('Total users:', users.length);
        users.forEach(u => {
            console.log(`- ID: ${u._id}, Name: "${u.name}", Email: "${u.email}"`);
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkDB();
