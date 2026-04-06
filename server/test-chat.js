import axios from 'axios';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const testChat = async () => {
    // Generate a token for a test user or use a dummy ID
    const token = jwt.sign({ id: '6b2d12345678901234567890' }, process.env.JWT_SECRET || 'supersecret123');

    try {
        console.log("Simulating AI Mentor request...");
        const response = await axios.post('http://localhost:5000/api/courses/ask-mentor',
            { question: "Hello", context: "Testing" },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("Response:", response.data);
    } catch (error) {
        console.error("Chat Error:", error.response?.status, error.response?.data || error.message);
    }
};

testChat();
