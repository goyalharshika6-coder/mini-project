import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronRight, Loader2, Award, AlertCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';

const DiagnosticTest = () => {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch course with diagnostic test
        const fetchCourse = async () => {
            try {
                const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                const { data } = await axios.get(`${API_BASE}/courses/${courseId}`, {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                });
                setCourse(data);
            } catch (err) {
                console.error('Error fetching test:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [courseId]);

    const handleAnswer = (option) => {
        setAnswers(prev => ({ ...prev, [currentQuestion]: option }));
    };

    const handleNext = () => {
        console.log('handleNext clicked. currentQuestion:', currentQuestion, 'Total:', course.diagnosticTest.length);
        if (currentQuestion < course.diagnosticTest.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            console.log('Triggering submitTest...');
            submitTest();
        }
    };

    const submitTest = async () => {
        setSubmitting(true);
        try {
            const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            console.log('Sending submission payload:', { testResults: answers });
            const { data } = await axios.post(`${API_BASE}/courses/${courseId}/analyze`,
                { testResults: answers },
                { headers: { Authorization: `Bearer ${userInfo.token}` } }
            );
            console.log('Submission success:', data);
            navigate(`/skill-gap/${courseId}`);
        } catch (err) {
            console.error('Error submitting test:', err);
            setError(err.response?.data?.message || 'Failed to analyze test results. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <Layout>
            <div className="h-full flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                <p className="text-gray-400 animate-pulse">AI is preparing your diagnostic test...</p>
            </div>
        </Layout>
    );

    const question = course?.diagnosticTest[currentQuestion];
    const progress = ((currentQuestion + 1) / course?.diagnosticTest.length) * 100;

    return (
        <Layout>
            <div className="max-w-3xl mx-auto py-10">
                <div className="mb-10">
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <span className="text-blue-400 font-bold text-sm uppercase tracking-widest">Diagnostic Test</span>
                            <h1 className="text-3xl mt-1 font-bold">{course.courseName} Assessment</h1>
                        </div>
                        <span className="text-gray-400 font-medium">Question {currentQuestion + 1} of {course.diagnosticTest.length}</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                        ></motion.div>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestion}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="glass-card p-10 border-white/5"
                    >
                        <div className="flex items-start gap-4 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
                                < Award className="text-purple-400 w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-medium leading-tight">{question.question}</h2>
                        </div>

                        <div className="space-y-4">
                            {question.options && question.options.length > 0 ? (
                                question.options.map((option, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleAnswer(option)}
                                        className={`w-full text-left p-5 rounded-2xl border transition-all flex justify-between items-center group ${answers[currentQuestion] === option
                                            ? 'bg-blue-500/10 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                                            : 'bg-white/5 border-white/10 text-gray-400 hover:border-blue-500/30 hover:bg-blue-500/10'
                                            }`}
                                    >
                                        <span className="text-lg">{option}</span>
                                        {answers[currentQuestion] === option && <CheckCircle2 className="w-6 h-6 text-blue-500" />}
                                    </button>
                                ))
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-2"
                                >
                                    <textarea
                                        className="w-full h-40 bg-white/5 border border-white/10 rounded-2xl p-6 text-white text-lg focus:outline-none focus:border-blue-500 transition-colors resize-none placeholder:text-gray-500/50"
                                        placeholder="Type your explanation here..."
                                        value={answers[currentQuestion] || ''}
                                        onChange={(e) => handleAnswer(e.target.value)}
                                    />
                                    <p className="text-sm text-gray-500 text-right">Provide a concise technical explanation.</p>
                                </motion.div>
                            )}
                        </div>

                        {error && (
                            <div className="mt-6 flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        <div className="mt-12 flex justify-end">
                            <button
                                disabled={!answers[currentQuestion] || submitting}
                                onClick={handleNext}
                                className="btn-primary flex items-center gap-2 px-10 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? (
                                    <>Analyzing <Loader2 className="w-5 h-5 animate-spin" /></>
                                ) : (
                                    <>
                                        {currentQuestion === course.diagnosticTest.length - 1 ? 'Finish & Analyze' : 'Next Question'}
                                        <ChevronRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </AnimatePresence>

                <div className="mt-8 flex items-center gap-3 bg-purple-500/10 p-4 rounded-2xl border border-purple-500/20">
                    <AlertCircle className="text-purple-400 w-5 h-5 shrink-0" />
                    <p className="text-sm text-purple-400/80">Don't worry if you're not sure. This assessment helps us tailor the course to your exact level.</p>
                </div>
            </div>
        </Layout>
    );
};

export default DiagnosticTest;
