import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, BookOpen, ChevronRight, Zap, Play, CheckCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';

const CourseGeneration = () => {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStructure = async () => {
            try {
                const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                const { data } = await axios.post(`${API_BASE}/courses/${courseId}/generate-structure`, {}, {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                });
                setCourse(data);
            } catch (err) {
                console.error('Error generating structure:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStructure();
    }, [courseId]);

    const handleEnroll = async () => {
        setEnrolling(true);
        try {
            const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            await axios.post(`${API_BASE}/courses/${courseId}/enroll`, {}, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            navigate('/dashboard');
        } catch (err) {
            console.error('Error enrolling:', err);
        } finally {
            setEnrolling(false);
        }
    };

    if (loading) return (
        <Layout>
            <div className="h-full flex flex-col items-center justify-center">
                <Zap className="w-12 h-12 text-purple-400 animate-bounce mb-4" />
                <p className="text-gray-400">AI is building your optimized roadmap...</p>
            </div>
        </Layout>
    );

    if (!course) return (
        <Layout>
            <div className="h-full flex flex-col items-center justify-center p-10 text-center">
                <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl max-w-md">
                    <h2 className="text-2xl text-red-500 mb-4 font-bold">Generation Failed</h2>
                    <p className="text-gray-400 mb-8">We encountered an error while building your course roadmap. Please try again or check your connection.</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="btn-primary px-8 py-3"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        </Layout>
    );

    const totalHours = course.duration * course.dailyTime;

    return (
        <Layout>
            <div className="max-w-4xl mx-auto py-10">
                <div className="flex justify-between items-start mb-12">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <h1 className="text-4xl mb-4 font-bold tracking-tight">Your Personalized Path for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">{course.courseName}</span></h1>
                        <div className="flex gap-6">
                            <div className="flex items-center gap-2 text-gray-400 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                                <BookOpen className="w-4 h-4 text-purple-400" /> {course.structure.length} Chapters
                            </div>
                            <div className="flex items-center gap-2 text-gray-400 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                                <Clock className="w-4 h-4 text-purple-400" /> {totalHours} Total Hours
                            </div>
                        </div>
                    </motion.div>

                    <button
                        onClick={handleEnroll}
                        disabled={enrolling}
                        className="btn-primary py-4 px-8 flex items-center gap-3 text-lg"
                    >
                        {enrolling ? 'Enrolling...' : 'Enroll Now'} <Play className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-6">
                    {course.structure.map((module, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="glass-card p-8 group relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 transform scale-y-0 group-hover:scale-y-100 transition-transform origin-top"></div>
                            <div className="flex gap-6">
                                <div className="shrink-0">
                                    <span className="text-purple-400 font-bold text-sm bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">{(module.chapter || module.dayRange || '').replace('Day', 'Chapter')}</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl mb-2 font-medium group-hover:text-blue-400 transition-colors">{module.topic}</h3>
                                    <p className="text-gray-400 mb-4 leading-relaxed">{module.description}</p>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {module.estimatedTime}</span>
                                        <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4" /> 5 Lessons</span>
                                    </div>
                                </div>
                                <ChevronRight className="text-white/10 group-hover:text-blue-400 w-10 h-10 transition-colors" />
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-12 p-8 glass border-purple-500/20 bg-purple-500/5 rounded-3xl text-center">
                    <h4 className="text-purple-400 text-lg mb-2 font-bold">Smart Time Optimization Active</h4>
                    <p className="text-gray-400 max-w-2xl mx-auto">Our AI has skipped introductory topics you already know, focusing your {totalHours} hours directly on high-impact learning to get you to <span className="text-white font-bold">{course.targetGoal}</span> faster.</p>
                </div>
            </div>
        </Layout>
    );
};

export default CourseGeneration;
