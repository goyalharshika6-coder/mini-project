import User from '../models/User.js';
import Course from '../models/Course.js';

export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            console.error(`User not found for ID: ${req.user._id}`);
            return res.status(404).json({ message: 'User not found' });
        }

        // --- STREAK LOGIC ---
        const now = new Date();
        const lastLoginDate = new Date(user.lastLogin || user.createdAt || Date.now());
        
        // Normalize strict dates to discard hours/minutes calculation weirdness
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const lastLoginDay = new Date(lastLoginDate.getFullYear(), lastLoginDate.getMonth(), lastLoginDate.getDate());
        
        const diffTime = today - lastLoginDay;
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)); 

        let streakUpdated = false;
        
        if (diffDays === 1) {
            // Logged in exactly yesterday: maintain and +1 streak
            user.streak = (user.streak || 0) + 1;
            user.lastLogin = now;
            streakUpdated = true;
        } else if (diffDays > 1) {
            // Missed a day: reset streak
            user.streak = 1;
            user.lastLogin = now;
            streakUpdated = true;
        } else if (user.streak === 0 || !user.lastLogin) {
            // Never tracked a streak before, initialize it to 1
            user.streak = 1;
            user.lastLogin = now;
            streakUpdated = true;
        }

        if (streakUpdated) {
            await user.save();
        }
        // --- END STREAK LOGIC ---

        console.log(`Fetching stats for user: ${req.user._id}`);
        const courses = await Course.find({ userId: req.user._id, isEnrolled: true });
        console.log(`Found ${courses.length} enrolled courses for stat calculation`);

        // Calculate real stats
        const totalCourses = courses.length;
        const completedCourses = courses.filter(c =>
            c.structure.every(m => m.status === 'completed')
        ).length;

        // Sum learning hours (estimated)
        let totalHours = 0;
        courses.forEach(c => {
            c.structure.forEach(m => {
                if (m.status === 'completed') {
                    const hours = parseInt(m.estimatedTime) || 0;
                    totalHours += hours;
                }
            });
        });

        res.json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                xp: user.xp,
                streak: user.streak,
                badges: user.badges || []
            },
            stats: {
                totalCourses,
                completedCourses,
                totalHours,
                xp: user.xp || 0,
                streak: user.streak || 0
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = name || user.name;
            user.email = email || user.email;
            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                token: req.token // reused from middleware if possible or just handle in frontend
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
