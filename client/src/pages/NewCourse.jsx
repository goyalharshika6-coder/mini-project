import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Target, Clock, Calendar, BookOpen, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';

const NewCourse = () => {
    const [formData, setFormData] = useState({
        courseName: '',
        targetGoal: '',
        duration: '',
        dailyTime: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const userInfoStr = localStorage.getItem('userInfo');
            if (!userInfoStr) {
                navigate('/login');
                return;
            }
            const userInfo = JSON.parse(userInfoStr);
            const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
            const { data } = await axios.post(`${API_BASE}/courses/generate-test`, formData, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            navigate(`/test/${data._id}`);
        } catch (err) {
            console.error('Error starting test:', err);
            setError(err.response?.data?.message || 'Failed to start diagnostic test. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-4xl mx-auto py-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <h1 className="text-5xl mb-4 font-bold tracking-tight">What do you want to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Master?</span></h1>
                    <p className="text-xl text-gray-400">Tell us your goal, and our AI will build a custom path for you.</p>
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-2">
                            <label className="text-gray-400 flex items-center gap-2 mb-2 font-medium">
                                <BookOpen className="w-4 h-4 text-blue-400" /> Course Name
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Modern Web Development"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-lg focus:outline-none focus:border-accent1 transition-colors"
                                value={formData.courseName}
                                onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                                required
                            />
                        </motion.div>

                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-2">
                            <label className="text-gray-400 flex items-center gap-2 mb-2 font-medium">
                                <Target className="w-4 h-4 text-blue-400" /> Target Goal
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Get a Full Stack Developer job"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-lg focus:outline-none focus:border-accent1 transition-colors"
                                value={formData.targetGoal}
                                onChange={(e) => setFormData({ ...formData, targetGoal: e.target.value })}
                                required
                            />
                        </motion.div>

                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="space-y-2">
                            <label className="text-gray-400 flex items-center gap-2 mb-2 font-medium">
                                <Calendar className="w-4 h-4 text-blue-400" /> Planned Timeline (Days)
                            </label>
                            <input
                                type="number"
                                placeholder="e.g. 30"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-lg focus:outline-none focus:border-accent1 transition-colors"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                required
                            />
                        </motion.div>

                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="space-y-2">
                            <label className="text-gray-400 flex items-center gap-2 mb-2 font-medium">
                                <Clock className="w-4 h-4 text-blue-400" /> Daily Learning Time (Hours)
                            </label>
                            <select
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-lg focus:outline-none focus:border-accent1 transition-colors appearance-none"
                                value={formData.dailyTime}
                                onChange={(e) => setFormData({ ...formData, dailyTime: e.target.value })}
                                required
                            >
                                <option value="" className="bg-primary">Select time</option>
                                <option value="1" className="bg-primary">1-2 hours</option>
                                <option value="3" className="bg-primary">3-4 hours</option>
                                <option value="5" className="bg-primary">5+ hours</option>
                            </select>
                        </motion.div>
                    </div>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-xl text-center">
                            {error}
                        </div>
                    )}

                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary py-5 text-xl flex items-center justify-center gap-3 mt-10 disabled:opacity-50"
                    >
                        {loading ? 'Analyzing your goals...' : 'Start Personal Diagnostic'}
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                    </motion.button>
                </form>

                <div className="mt-20 grid grid-cols-3 gap-8">
                    {[
                        { title: 'AI Driven', desc: 'Personalized to your pace' },
                        { title: 'Smart optimization', desc: 'Focus on what matters' },
                        { title: 'Goal Oriented', desc: 'Built for outcomes' }
                    ].map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 + (i * 0.1) }}
                            className="p-6 glass-card text-center"
                        >
                            <h3 className="text-purple-400 font-bold text-lg mb-1">{feature.title}</h3>
                            <p className="text-sm text-gray-400">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </Layout>
    );
};

export default NewCourse;
