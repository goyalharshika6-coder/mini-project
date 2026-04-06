import axios from 'axios';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const testEndpoint = async () => {
    const token = jwt.sign({ id: '6b2d12345678901234567890' }, process.env.JWT_SECRET || 'supersecret123');

    try {
        console.log("Testing ask-mentor endpoint...");
        const response = await axios.post('http://localhost:5000/api/courses/ask-mentor',
            { question: "Hello", context: "Testing" },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("Success:", response.data);
    } catch (error) {
        console.error("Endpoint Error:", error.response?.status, error.response?.data || error.message);
    }
};

testEndpoint();
