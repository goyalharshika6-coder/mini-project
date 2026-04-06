import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, AlertTriangle, CheckCircle, ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';

const SkillGapAnalysis = () => {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAnalysis = async () => {
            try {
                const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                const { data } = await axios.get(`${API_BASE}/courses/${courseId}`, {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                });
                setCourse(data);
            } catch (err) {
                console.error('Error fetching analysis:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalysis();
    }, [courseId]);

    const handleGenerateCourse = () => {
        navigate(`/generate-course/${courseId}`);
    };

    if (loading) return <Layout><div className="h-full flex items-center justify-center text-gray-400">Analyzing skill gaps...</div></Layout>;

    const results = course.diagnosticResults;

    return (
        <Layout>
            <div className="max-w-5xl mx-auto py-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-12 glass p-10 flex items-center justify-between overflow-hidden relative"
                >
                    <div className="relative z-10">
                        <span className="text-purple-400 font-bold tracking-widest uppercase text-sm">Analysis Complete</span>
                        <h1 className="text-5xl mt-2 mb-4 font-bold">You are a <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">{results.skillLevel}</span></h1>
                        <p className="text-xl text-gray-400 max-w-md">We've identified {results.missingSkills.length} key areas to focus on to reach your goal: <span className="text-white italic">{course.targetGoal}</span></p>
                    </div>
                    <div className="relative z-10 text-center">
                        <div className="w-32 h-32 rounded-full border-4 border-blue-500 flex items-center justify-center mb-2 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                            <span className="text-4xl font-bold">{results.score}%</span>
                        </div>
                        <p className="text-gray-400 font-medium">Diagnostic Score</p>
                    </div>
                    <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-blue-500/10 rounded-full blur-[128px] -z-0"></div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {/* Missing Skills */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-card p-8 border-blue-500/20"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold">Missing Skills (Priority)</h2>
                        </div>
                        <div className="space-y-4">
                            {results.missingSkills.map((skill, i) => (
                                <div key={i} className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/5 group hover:border-blue-500/30 transition-all">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 group-hover:scale-150 transition-transform"></div>
                                    <span className="text-lg text-white/90">{skill}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Known Skills */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-card p-8 border-gray-500/20"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-gray-500/20 rounded-lg text-gray-400">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold">Already Mastered</h2>
                        </div>
                        <div className="space-y-4">
                            {results.knownSkills.map((skill, i) => (
                                <div key={i} className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/5 opacity-70">
                                    <CheckCircle className="w-5 h-5 text-gray-400" />
                                    <span className="text-lg">{skill}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center bg-blue-500/5 p-12 rounded-3xl border border-blue-500/20 relative overflow-hidden"
                >
                    <Sparkles className="absolute top-10 left-10 text-blue-500/20 w-12 h-12" />
                    <Sparkles className="absolute bottom-10 right-10 text-blue-500/20 w-12 h-12" />

                    <h2 className="text-3xl mb-6 font-bold">Ready for your personalized path?</h2>
                    <p className="text-gray-400 mb-10 text-lg max-w-2xl mx-auto">
                        We'll optimize your {course.duration}-day schedule to focus precisely on these gaps, skipping what you already know to save you time.
                    </p>

                    <button
                        onClick={handleGenerateCourse}
                        className="btn-primary py-5 px-12 text-xl flex items-center justify-center gap-4 mx-auto"
                    >
                        Generate Personalized Course <ArrowRight className="w-6 h-6" />
                    </button>
                </motion.div>
            </div>
        </Layout>
    );
};

export default SkillGapAnalysis;
