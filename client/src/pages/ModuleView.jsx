import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, CheckCircle, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Layout from '../components/Layout';

const ModuleView = () => {
    const { courseId, moduleIndex } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [moduleData, setModuleData] = useState(null);
    const [courseName, setCourseName] = useState('');

    useEffect(() => {
        const fetchModuleContent = async () => {
            try {
                const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

                // Get course metadata for headers
                const courseRes = await axios.get(`${API_BASE}/courses/${courseId}`, config);
                const course = courseRes.data;
                setCourseName(course.courseName);
                const currentModule = course.structure[moduleIndex];

                // Get or generate markdown content
                const contentRes = await axios.post(`${API_BASE}/courses/${courseId}/module/${moduleIndex}/generate`, {}, config);

                setModuleData({
                    topic: currentModule.topic,
                    chapter: currentModule.chapter || currentModule.dayRange,
                    markdown: contentRes.data.markdown,
                    youtubeId: contentRes.data.youtubeId,
                    status: currentModule.status
                });

            } catch (error) {
                console.error('Failed to fetch module content:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchModuleContent();
    }, [courseId, moduleIndex]);

    const handleMarkComplete = async () => {
        try {
            const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            await axios.put(`${API_BASE}/courses/update-module`, {
                courseId,
                moduleIndex: parseInt(moduleIndex),
                status: 'completed'
            }, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            navigate(`/course/${courseId}`);
        } catch (error) {
            console.error('Failed to mark complete:', error);
        }
    };

    if (loading) return (
        <Layout>
            <div className="h-[80vh] flex flex-col items-center justify-center">
                <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-6" />
                <h2 className="text-2xl font-bold mb-2">Compiling Lesson Materials</h2>
                <p className="text-gray-400 max-w-sm text-center">
                    SkillPath AI is currently analyzing this topic, generating rich explanations, and finding the best real-world examples for you.
                </p>
            </div>
        </Layout>
    );

    if (!moduleData) return (
        <Layout>
            <div className="h-[80vh] flex items-center justify-center">
                <p className="text-gray-400">Failed to load module content. Please try again.</p>
            </div>
        </Layout>
    );

    return (
        <Layout>
            <div className="max-w-4xl mx-auto py-8 md:py-10 px-4 md:px-8 pb-32">
                {/* Header */}
                <button
                    onClick={() => navigate(`/course/${courseId}`)}
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Roadmap
                </button>

                <div className="mb-12">
                    <span className="text-blue-400 font-bold tracking-widest uppercase text-xs mb-2 block">
                        {courseName} • {moduleData.chapter.replace('Day', 'Chapter')}
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold leading-tight">{moduleData.topic}</h1>
                </div>

                {/* Smart YouTube Search Embed */}
                {moduleData.youtubeId && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="w-full aspect-video rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/10 mb-12 border border-white/10 relative bg-[#0a0f1d]"
                    >
                        <iframe 
                            className="w-full h-full absolute top-0 left-0"
                            src={`https://www.youtube.com/embed/${moduleData.youtubeId}`} 
                            allowFullScreen 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            title={`YouTube Tutorial for ${moduleData.topic}`}
                        ></iframe>
                    </motion.div>
                )}

                {/* Markdown Content Box */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-5 sm:p-8 md:p-12 prose prose-invert prose-blue max-w-none"
                >
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            h1: ({node, ...props}) => <h1 className="text-3xl font-bold mt-8 mb-6 pb-2 border-b border-white/10" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-blue-400 mt-8 mb-4" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-xl font-bold text-purple-400 mt-6 mb-3" {...props} />,
                            p: ({node, ...props}) => <p className="text-gray-300 leading-relaxed mb-6" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc list-inside text-gray-300 mb-6 space-y-2" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal list-inside text-gray-300 mb-6 space-y-2" {...props} />,
                            li: ({node, ...props}) => <li className="text-gray-300" {...props} />,
                            code: ({node, inline, ...props}) => 
                                inline ? 
                                <code className="bg-blue-500/10 text-blue-300 px-1.5 py-0.5 rounded text-sm font-mono border border-blue-500/20" {...props} /> :
                                <code className="block bg-[#050810] text-gray-300 p-6 rounded-xl overflow-x-auto text-sm font-mono border border-white/5 my-6 leading-loose shadow-inner" {...props} />,
                            blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-500 bg-blue-500/5 p-4 rounded-r-xl italic text-gray-400 my-6" {...props} />,
                            table: ({node, ...props}) => <div className="overflow-x-auto my-8"><table className="w-full text-left border-collapse" {...props} /></div>,
                            th: ({node, ...props}) => <th className="bg-white/5 p-4 font-bold border-b border-white/10 text-gray-200" {...props} />,
                            td: ({node, ...props}) => <td className="p-4 border-b border-white/5 text-gray-400" {...props} />
                        }}
                    >
                        {moduleData.markdown}
                    </ReactMarkdown>
                </motion.div>

                {/* Footer Action */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-12 flex justify-center"
                >
                    <button
                        onClick={handleMarkComplete}
                        className="btn-primary py-4 px-10 text-lg flex items-center gap-3 shadow-lg shadow-blue-500/25"
                    >
                        <CheckCircle className="w-6 h-6" />
                        Mark as Complete & Return
                    </button>
                </motion.div>
            </div>
        </Layout>
    );
};

export default ModuleView;
