import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Award, BookOpen, Settings, Zap, Star } from 'lucide-react';
import axios from 'axios';
import Layout from '../components/Layout';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ name: '', email: '' });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                const { data } = await axios.get(`${API_BASE}/users/profile`, {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                });

                // Merge API data with localStorage as fallback for name/email
                setUser({
                    ...data.user,
                    name: data.user.name || userInfo.name,
                    email: data.user.email || userInfo.email
                });
                setStats(data.stats);
                setEditData({
                    name: data.user.name || userInfo.name,
                    email: data.user.email || userInfo.email
                });
            } catch (err) {
                console.error('Error fetching profile:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const { data } = await axios.put(`${API_BASE}/users/profile`, editData, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setUser(prev => ({ ...prev, name: data.name, email: data.email }));

            // Update local storage too
            const newUserInfo = { ...userInfo, name: data.name, email: data.email };
            localStorage.setItem('userInfo', JSON.stringify(newUserInfo));

            setIsEditing(false);
        } catch (err) {
            console.error('Error updating profile:', err);
        }
    };

    if (loading) return <Layout><div className="h-full flex items-center justify-center text-gray-400">Loading profile...</div></Layout>;

    return (
        <Layout>
            <div className="max-w-4xl mx-auto py-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-10 mb-8 border-white/5 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] -z-10"></div>

                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 p-1 relative shadow-2xl shadow-blue-500/20">
                            <div className="w-full h-full bg-[#0B0F1A] rounded-[22px] flex items-center justify-center">
                                <User className="text-white w-16 h-16" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 border-4 border-[#0B0F1A] rounded-full"></div>
                        </div>

                        <div className="text-center md:text-left flex-1">
                            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
                                <h1 className="text-4xl font-bold">{user?.name}</h1>
                                <span className="px-3 py-1 bg-cyan-400/10 text-cyan-400 rounded-full text-xs font-bold border border-cyan-400/20 w-fit mx-auto md:mx-0">PRO LEARNER</span>
                            </div>
                            <p className="text-gray-400 flex items-center justify-center md:justify-start gap-2 mb-6">
                                <Mail className="w-4 h-4" /> {user?.email}
                            </p>

                            <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="btn-primary py-2 px-6 text-sm flex items-center gap-2"
                                >
                                    <Settings className="w-4 h-4" /> Edit Profile
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Edit Modal */}
                {isEditing && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0B0F1A]/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="glass-card p-8 w-full max-w-md border-white/10"
                        >
                            <h2 className="text-2xl mb-6 font-bold text-center">Update Profile</h2>
                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase mb-2 block">Full Name</label>
                                    <input
                                        type="text"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-accent1 outline-none"
                                        value={editData.name}
                                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase mb-2 block">Email Address</label>
                                    <input
                                        type="email"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-blue-500 outline-none"
                                        value={editData.email}
                                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                    />
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="flex-1 px-6 py-3 rounded-xl border border-white/10 text-secondary hover:bg-white/5 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 btn-primary py-3"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-card p-6 border-white/5 text-center group hover:border-blue-500/20 transition-all"
                    >
                        <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <Award className="w-6 h-6" />
                        </div>
                        <p className="text-gray-400 text-sm mb-1 uppercase tracking-widest font-bold">XP Points</p>
                        <h3 className="text-3xl font-bold">{stats?.xp || 0}</h3>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass-card p-6 border-white/5 text-center group hover:border-purple-500/20 transition-all"
                    >
                        <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <p className="text-gray-400 text-sm mb-1 uppercase tracking-widest font-bold">Courses</p>
                        <h3 className="text-3xl font-bold">{stats?.totalCourses || 0}</h3>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="glass-card p-6 border-white/5 text-center group hover:border-cyan-400/20 transition-all"
                    >
                        <div className="w-12 h-12 bg-cyan-400/10 rounded-xl flex items-center justify-center text-cyan-400 mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <Zap className="w-6 h-6" />
                        </div>
                        <p className="text-gray-400 text-sm mb-1 uppercase tracking-widest font-bold">Streak</p>
                        <h3 className="text-3xl font-bold">{stats?.streak || 0} 🔥</h3>
                    </motion.div>
                </div>

                {/* Badges Section */}
                <div className="mt-12">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <Award className="text-yellow-400 w-6 h-6" /> Achievements & Badges
                    </h2>
                    
                    {user?.badges && user.badges.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {user.badges.map((badge, idx) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="glass-card p-6 border-white/5 flex flex-col items-center text-center group hover:border-yellow-500/30 transition-all relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full blur-xl group-hover:bg-yellow-500/10 transition-all"></div>
                                    <div className="w-16 h-16 bg-gradient-to-tr from-yellow-500/20 to-orange-500/20 rounded-full flex items-center justify-center mb-4 border border-yellow-500/20 group-hover:scale-110 transition-transform shadow-lg shadow-yellow-500/10">
                                        <Award className="w-8 h-8 text-yellow-400" />
                                    </div>
                                    <h3 className="font-bold text-lg mb-1">{badge.name}</h3>
                                    <p className="text-xs text-gray-400">Earned: {new Date(badge.earnedAt).toLocaleDateString()}</p>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="glass-card p-12 border-dashed border-white/10 text-center text-gray-400 rounded-3xl">
                            <Star className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p>Complete learning paths to earn mastery badges!</p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Profile;
