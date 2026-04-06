import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            console.log("Verifying token...");
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
            console.log("Token decoded, UID:", decoded.id);
            req.user = await User.findById(decoded.id).select('-password');
            if (!req.user) {
                console.warn("User not found in DB for ID:", decoded.id);
                return res.status(401).json({ message: 'User not found' });
            }
            console.log("User authorized:", req.user.email, "Name:", req.user.name);
            return next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};
