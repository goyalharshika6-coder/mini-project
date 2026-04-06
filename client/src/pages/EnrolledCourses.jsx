import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, BookX, ArrowRight, Play, Loader2, Target, Calendar } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const EnrolledCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dropping, setDropping] = useState(null);
    const [dropSuccess, setDropSuccess] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEnrolledCourses = async () => {
            try {
                const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                if (!userInfo || !userInfo.token) {
                    navigate('/login');
                    return;
                }

                const { data } = await axios.get(`${API_BASE}/courses/my-courses`, {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                });
                
                // Sort by most recently created
                setCourses(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
            } catch (error) {
                console.error('Error fetching enrolled courses:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEnrolledCourses();
    }, [navigate]);

    const handleDropCourse = async (courseId) => {
        if (!window.confirm("Are you sure you want to drop this course? All progress will be lost and this cannot be undone.")) {
            return;
        }

        try {
            setDropping(courseId);
            const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));

            await axios.delete(`${API_BASE}/courses/${courseId}/drop`, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });

            setCourses(courses.filter(course => course._id !== courseId));
            setDropSuccess("Course successfully dropped.");
            
            setTimeout(() => setDropSuccess(''), 3000);
        } catch (error) {
            console.error('Error dropping course:', error);
            alert('Failed to drop course. Please try again.');
        } finally {
            setDropping(null);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="h-full flex items-center justify-center text-gray-400">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-6xl mx-auto py-6 md:py-10 px-4 sm:px-0 relative">
                
                <AnimatePresence>
                    {dropSuccess && (
                        <motion.div 
                            initial={{ opacity: 0, y: -20, x: '-50%' }}
                            animate={{ opacity: 1, y: 0, x: '-50%' }}
                            exit={{ opacity: 0, y: -20, x: '-50%' }}
                            className="absolute top-0 left-1/2 -translate-x-1/2 z-50 bg-green-500/10 border border-green-500/30 text-green-400 px-6 py-3 rounded-full flex items-center gap-2 shadow-[0_0_20px_rgba(34,197,94,0.1)]"
                        >
                            <BookX className="w-5 h-5" />
                            <span className="font-medium text-sm">{dropSuccess}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mb-10">
                    <h1 className="text-3xl md:text-4xl mb-2 font-bold tracking-tight flex items-center gap-3">
                        <BookOpen className="text-blue-400 w-8 h-8" />
                        My Enrolled <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Courses</span>
                    </h1>
                    <p className="text-gray-400 text-sm md:text-base">Manage your active learning paths and track your progress.</p>
                </div>

                {courses.length === 0 ? (
                    <div className="text-center py-20 glass flex flex-col items-center justify-center rounded-2xl border-white/5">
                        <BookOpen className="w-16 h-16 text-gray-600 mb-4" />
                        <h3 className="text-2xl font-bold mb-2 text-white">No Active Courses</h3>
                        <p className="text-gray-400 mb-6 max-w-md">You haven't enrolled in any custom AI-generated courses yet. Ready to learn something new?</p>
                        <button onClick={() => navigate('/new-course')} className="btn-primary flex items-center gap-2 px-8 py-3">
                            Generate a Course <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                        {courses.map((course) => {
                            const completedModules = course.structure.filter(m => m.status === 'completed').length;
                            const totalModules = course.structure.length;
                            const progressPercentage = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

                            return (
                                <motion.div
                                    key={course._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="glass-card p-6 flex flex-col h-full border-white/10 hover:border-blue-500/30 transition-colors group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[50px] group-hover:bg-blue-500/10 transition-all pointer-events-none" />
                                    
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-4">
                                            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 leading-tight">
                                                {course.courseName}
                                            </h2>
                                            <div className="bg-white/5 px-3 py-1 rounded-full text-xs font-medium text-gray-400 whitespace-nowrap border border-white/10">
                                                {course.duration} Days
                                            </div>
                                        </div>

                                        <p className="text-gray-400 text-sm line-clamp-2 mb-6 flex items-center gap-2">
                                            <Target className="w-4 h-4 text-blue-400 shrink-0" />
                                            Target Goal: {course.targetGoal}
                                        </p>

                                        {/* Progress Bar */}
                                        <div className="mb-8">
                                            <div className="flex justify-between mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                <span>Course Progress</span>
                                                <span className={progressPercentage === 100 ? 'text-green-400 font-bold' : 'text-blue-400 font-bold'}>
                                                    {progressPercentage}%
                                                </span>
                                            </div>
                                            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-1000 ${progressPercentage === 100 ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-blue-500 to-purple-500'}`}
                                                    style={{ width: `${progressPercentage}%` }}
                                                />
                                            </div>
                                            <div className="mt-2 text-xs text-center text-gray-500">
                                                {completedModules} of {totalModules} modules completed
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer Actions */}
                                    <div className="flex gap-3 pt-4 border-t border-white/5 mt-auto">
                                        <button 
                                            onClick={() => navigate(`/course/${course._id}`)}
                                            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-500/20"
                                        >
                                            <Play className="w-4 h-4 fill-white" /> Resume
                                        </button>
                                        
                                        <button 
                                            onClick={() => handleDropCourse(course._id)}
                                            disabled={dropping === course._id}
                                            className="px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-semibold rounded-xl border border-red-500/20 transition-all flex items-center justify-center disabled:opacity-50"
                                            title="Drop Course"
                                        >
                                            {dropping === course._id ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <BookX className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default EnrolledCourses;
