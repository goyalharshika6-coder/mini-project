import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
        expiresIn: '30d',
    });
};

export const register = async (req, res) => {
    const { name, email, password } = req.body;
    console.log('Registration attempt for:', email);
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            console.log('User already exists:', email);
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({ name, email, password });
        console.log('User created successfully:', user._id);
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && (await user.comparePassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMe = async (req, res) => {
    try {
        if (!req.user) return res.status(404).json({ message: 'User not found' });
        res.json(req.user);
    } catch (error) {
        console.error("getMe Error:", error);
        res.status(500).json({ message: error.message });
    }
};
export const googleLogin = async (req, res) => {
    const { tokenId } = req.body;
    console.log('Google Login Attempt. Token received:', !!tokenId);
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    try {
        const ticket = await client.verifyIdToken({
            idToken: tokenId,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const { name, email } = ticket.getPayload();
        console.log('Google Token Verified. Email:', email);

        let user = await User.findOne({ email });

        if (!user) {
            console.log('Registering new Google user:', email);
            user = await User.create({
                name,
                email,
                password: Math.random().toString(36).slice(-10),
            });
        }

        const token = generateToken(user._id);
        console.log('Login successful for:', email);

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: token,
        });
    } catch (error) {
        console.error('Google Login Error Details:', error);
        res.status(401).json({
            message: 'Google authentication failed',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};
