import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, BookOpen, ChevronRight, Zap, Play, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';

const CourseView = () => {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                const { data } = await axios.get(`${API_BASE}/courses/${courseId}`, {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                });
                setCourse(data);
            } catch (err) {
                console.error('Error fetching course:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [courseId]);

    const handleStatusUpdate = async (moduleIndex, newStatus) => {
        try {
            const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const { data } = await axios.put(`${API_BASE}/courses/update-module`, {
                courseId,
                moduleIndex,
                status: newStatus
            }, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setCourse(data);
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    if (loading) return (
        <Layout>
            <div className="h-full flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                <p className="text-gray-400">Loading your course content...</p>
            </div>
        </Layout>
    );

    if (!course) return <Layout><div className="p-10 text-center">Course not found.</div></Layout>;

    const totalHours = course.duration * course.dailyTime;
    
    // Calculate global grade
    const completedQuizzes = course.chapterQuizzes?.filter(q => q.completed) || [];
    const averageScore = completedQuizzes.length > 0
        ? Math.round(completedQuizzes.reduce((sum, q) => sum + q.score, 0) / completedQuizzes.length)
        : null;

    let gradeString = "Not Rated";
    let gradeColor = "text-gray-400";
    if (averageScore !== null) {
        if (averageScore >= 90) { gradeString = "A+"; gradeColor = "text-green-400"; }
        else if (averageScore >= 80) { gradeString = "A"; gradeColor = "text-green-500"; }
        else if (averageScore >= 70) { gradeString = "B"; gradeColor = "text-yellow-400"; }
        else if (averageScore >= 60) { gradeString = "C"; gradeColor = "text-yellow-600"; }
        else { gradeString = "Incomplete"; gradeColor = "text-red-500"; }
    }

    return (
        <Layout>
            <div className="max-w-4xl mx-auto py-6 md:py-10 px-4 sm:px-0">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 md:mb-8 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                </button>

                <div className="flex flex-col md:flex-row justify-between items-start gap-6 md:gap-0 mb-8 md:mb-12">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <span className="text-blue-400 font-bold tracking-widest uppercase text-xs mb-2 block">Ongoing Course</span>
                        <h1 className="text-3xl md:text-4xl mb-4 font-bold">{course.courseName}</h1>
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                            <div className="flex items-center gap-2 text-gray-400 bg-white/5 px-4 py-2 rounded-full border border-white/5 w-fit">
                                <BookOpen className="w-4 h-4 text-purple-400" /> {course.structure.length} Chapters
                            </div>
                            <div className="flex items-center gap-2 text-gray-400 bg-white/5 px-4 py-2 rounded-full border border-white/5 w-fit">
                                <Clock className="w-4 h-4 text-purple-400" /> {totalHours} Total Hours
                            </div>
                            <div className="flex items-center gap-2 text-gray-400 bg-white/5 px-4 py-2 rounded-full border border-white/5 w-fit">
                                <span className="text-xs uppercase font-bold tracking-widest text-gray-500">Excellence Mark:</span> 
                                <span className={`font-bold text-lg ${gradeColor}`}>{gradeString} {averageScore ? `(${averageScore}%)` : ''}</span>
                            </div>
                        </div>
                    </motion.div>

                    <div className="text-left md:text-right bg-white/5 md:bg-transparent p-4 md:p-0 rounded-xl w-full md:w-auto">
                        <div className="text-gray-400 text-sm mb-1 md:mb-2">Completion</div>
                        <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                            {course.structure?.length > 0
                                ? Math.round((course.structure.filter(m => m.status === 'completed').length / course.structure.length) * 100)
                                : 0}%
                        </div>
                    </div>
                </div>

                <div className="space-y-12">
                    {course.structure && course.structure.length > 0 ? (
                        // Group modules by stage
                        Object.entries(
                            course.structure.reduce((acc, module, index) => {
                                const stageName = module.stage || 'Course Curriculum';
                                if (!acc[stageName]) acc[stageName] = [];
                                acc[stageName].push({ ...module, originalIndex: index });
                                return acc;
                            }, {})
                        ).map(([stageName, modules], stageIdx) => (
                            <div key={stageIdx} className="space-y-6">
                                {/* Stage Header */}
                                <div className="flex items-center gap-4">
                                    <div className="h-px bg-white/10 flex-1"></div>
                                    <h2 className="text-xl md:text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                                        {stageName}
                                    </h2>
                                    <div className="h-px bg-white/10 flex-1"></div>
                                </div>

                                {/* Modules in Stage */}
                                {modules.map((module) => (
                                    <motion.div
                                        key={module.originalIndex}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: module.originalIndex * 0.1 }}
                                className={`glass-card p-8 group relative overflow-hidden transition-all ${module.status === 'completed' ? 'opacity-60 grayscale-[0.5]' : ''}`}
                            >
                                <div className={`absolute top-0 left-0 w-1 h-full transition-transform origin-top ${module.status === 'completed' ? 'bg-green-500 scale-y-100' : 'bg-blue-500 transform scale-y-0 group-hover:scale-y-100'}`}></div>
                                <div className="flex flex-col sm:flex-row gap-6">
                                    <div className="flex flex-row sm:flex-col items-center gap-4 sm:gap-2 justify-between sm:justify-start">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-purple-400 font-bold text-sm px-3 py-1 rounded-full border ${module.status === 'completed' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-purple-500/10 border-purple-500/20'}`}>{(module.chapter || module.dayRange || '').replace('Day', 'Chapter')}</span>
                                            {module.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-500 hidden sm:block" />}
                                        </div>
                                         {/* Mobile Status Tag */}
                                         <div className="sm:hidden">
                                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-tight ${module.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                                                module.status === 'in-progress' ? 'bg-purple-500/20 text-purple-400 animate-pulse' : 'bg-white/5'
                                                }`}>{module.status || 'pending'}</span>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl md:text-2xl mb-2 font-medium group-hover:text-blue-400 transition-colors">{module.topic}</h3>
                                        <p className="text-gray-400 text-sm md:text-base mb-4 leading-relaxed">{module.description}</p>
                                        
                                        {/* Subtopics */}
                                        {module.subtopics && module.subtopics.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {module.subtopics.map((sub, idx) => (
                                                    <span key={idx} className="bg-white/5 border border-white/5 text-gray-300 px-2.5 py-1 rounded-md text-xs">
                                                        {sub}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md"><Clock className="w-4 h-4" /> {module.estimatedTime}</span>
                                            <span className={`hidden sm:inline-flex px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-tight ${module.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                                                module.status === 'in-progress' ? 'bg-purple-500/20 text-purple-400 animate-pulse' : 'bg-white/5'
                                                }`}>{module.status || 'pending'}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-row sm:flex-col gap-3 self-end sm:self-center w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t border-white/5 sm:border-t-0">
                                        {module.status !== 'completed' && (
                                            <>
                                                <button
                                                    onClick={() => navigate(`/course/${courseId}/module/${module.originalIndex}`)}
                                                    className={`flex-1 sm:w-12 sm:h-12 py-3 sm:py-0 rounded-xl sm:rounded-full flex items-center justify-center gap-2 transition-all ${module.status === 'in-progress' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500 hover:text-white'}`}
                                                    title="Start Module Lesson"
                                                >
                                                    <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current" /> <span className="sm:hidden font-bold">Play Lesson</span>
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(module.originalIndex, 'completed')}
                                                    className="w-12 h-auto sm:w-12 sm:h-12 shrink-0 rounded-xl sm:rounded-full bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500 hover:text-white transition-all flex items-center justify-center"
                                                    title="Mark as Completed"
                                                >
                                                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                                                </button>
                                            </>
                                        )}
                                        {module.status === 'completed' && (
                                            <button
                                                onClick={() => handleStatusUpdate(module.originalIndex, 'in-progress')}
                                                className="text-xs text-gray-400 hover:text-white underline w-full text-center sm:text-left py-2 sm:py-0"
                                            >
                                                Undo Completion
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                                ))}
                                
                                {/* Stage/Chapter Excellence Quiz Button */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="flex justify-center mt-8 pt-4 border-t border-white/5"
                                >
                                    <button
                                        onClick={() => navigate(`/course/${courseId}/quiz/${encodeURIComponent(stageName)}`)}
                                        className="btn-primary py-3 px-8 text-sm flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-lg shadow-purple-500/20"
                                    >
                                        <Zap className="w-4 h-4 fill-current text-yellow-400" />
                                        Take Chapter Excellence Quiz
                                    </button>
                                </motion.div>

                            </div>
                        ))
                    ) : (
                        <div className="glass-card p-12 text-center border-blue-500/20">
                            <Zap className="w-12 h-12 text-purple-400 mx-auto mb-4 animate-pulse" />
                            <h3 className="text-xl mb-2 font-bold">Roadmap not yet generated</h3>
                            <button
                                onClick={() => navigate(`/generate-course/${courseId}`)}
                                className="btn-primary mt-4 px-8"
                            >
                                Generate Full Roadmap
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default CourseView;
