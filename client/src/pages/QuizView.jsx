import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, CheckCircle, Trophy, RefreshCw, AlertCircle } from 'lucide-react';
import Layout from '../components/Layout';

const QuizView = () => {
    const { courseId, stageName } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [quizData, setQuizData] = useState(null);
    const [answers, setAnswers] = useState({});
    const [score, setScore] = useState(null);
    const [showResults, setShowResults] = useState(false);
    
    // We fetch the course to check if the quiz is already generated
    useEffect(() => {
        const fetchOrGenerateQuiz = async () => {
            try {
                const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

                // Get course metadata
                const courseRes = await axios.get(`${API_BASE}/courses/${courseId}`, config);
                const course = courseRes.data;
                
                // Check if this explicit stage has a quiz already completed or generated
                const existingQuiz = course.chapterQuizzes?.find(q => q.stage === decodeURIComponent(stageName));
                
                if (existingQuiz && existingQuiz.questions && existingQuiz.questions.length > 0) {
                    setQuizData(existingQuiz.questions);
                    if (existingQuiz.completed) {
                        // We could show results immediately if we stored their specific answers, 
                        // but the DB only stores Score and Completed. So we let them retake for practice.
                        // Or we can just let them take it fresh.
                    }
                    setLoading(false);
                } else {
                    // We need to generate it
                    setGenerating(true);
                    const generateRes = await axios.post(`${API_BASE}/courses/${courseId}/stage/${encodeURIComponent(stageName)}/quiz`, {}, config);
                    setQuizData(generateRes.data.questions);
                    setGenerating(false);
                    setLoading(false);
                }

            } catch (error) {
                console.error('Failed to manage quiz:', error);
                setLoading(false);
                setGenerating(false);
            }
        };
        
        fetchOrGenerateQuiz();
    }, [courseId, stageName]);

    const handleSelectOption = (qIndex, option) => {
        if (showResults) return; // Prevent changing answers after submit
        setAnswers(prev => ({ ...prev, [qIndex]: option }));
    };

    const handleSubmitQuiz = async () => {
        let correctContent = 0;
        quizData.forEach((question, index) => {
            if (answers[index] === question.answer) {
                correctContent++;
            }
        });
        
        const calculatedScore = Math.round((correctContent / quizData.length) * 100);
        setScore(calculatedScore);
        setShowResults(true);

        try {
            const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            await axios.put(`${API_BASE}/courses/update-quiz`, {
                courseId,
                stageName: decodeURIComponent(stageName),
                score: calculatedScore
            }, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
        } catch (error) {
            console.error('Failed to save quiz score:', error);
        }
    };

    if (loading) return (
        <Layout>
            <div className="h-[80vh] flex flex-col items-center justify-center text-center p-4">
                <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-6" />
                <h2 className="text-3xl font-bold mb-4">{generating ? "Generating Your Custom Evaluation..." : "Loading Exam"}</h2>
                <p className="text-gray-400 max-w-md">
                    {generating ? `SkillPath AI is currently analyzing all topics in "${decodeURIComponent(stageName)}" to build a rigorous 5-question multiple-choice mastery exam.` : "Preparing exam environment..."}
                </p>
            </div>
        </Layout>
    );

    if (!quizData || quizData.length === 0) return (
        <Layout>
            <div className="h-[80vh] flex items-center justify-center">
                <p className="text-gray-400">Failed to load quiz content. Please try again.</p>
            </div>
        </Layout>
    );

    return (
        <Layout>
            <div className="max-w-4xl mx-auto py-8 md:py-12 px-4 md:px-8 pb-32">
                {/* Header */}
                <button
                    onClick={() => navigate(`/course/${courseId}`)}
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Roadmap
                </button>

                <div className="mb-12 flex flex-col items-center text-center">
                    <div className="bg-purple-500/10 p-4 rounded-full mb-6">
                        <Trophy className="w-10 h-10 text-purple-400" />
                    </div>
                    <span className="text-purple-400 font-bold tracking-widest uppercase text-xs mb-3 block">
                        Chapter Excellence Exam
                    </span>
                    <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">{decodeURIComponent(stageName)}</h1>
                    <p className="text-gray-400 max-w-xl">
                        Prove your mastery of this chapter. Complete all 5 technical questions generated specifically tailored to your syllabus.
                    </p>
                </div>

                {/* Score Banner */}
                <AnimatePresence>
                    {showResults && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className={`p-8 rounded-2xl mb-12 flex flex-col md:flex-row items-center justify-between text-center md:text-left shadow-2xl ${score >= 80 ? 'bg-green-500/10 border border-green-500/30 shadow-green-500/10' : 'bg-red-500/10 border border-red-500/30 shadow-red-500/10'}`}
                        >
                            <div>
                                <h3 className={`text-2xl md:text-3xl font-bold mb-2 ${score >= 80 ? 'text-green-400' : 'text-red-400'}`}>
                                    {score >= 80 ? 'Excellent Mastery!' : 'Needs Review'}
                                </h3>
                                <p className="text-gray-300">
                                    {score >= 80 ? 'You have successfully proven your knowledge of this stage.' : 'We recommend reviewing the chapter materials before moving on.'}
                                </p>
                            </div>
                            <div className="mt-6 md:mt-0 text-5xl md:text-6xl font-black tabular-nums tracking-tighter">
                                <span className={score >= 80 ? 'text-green-500' : 'text-red-500'}>{score}</span>
                                <span className="text-2xl text-gray-500">/100</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Questions */}
                <div className="space-y-8 md:space-y-12">
                    {quizData.map((question, qIndex) => (
                        <motion.div
                            key={qIndex}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: qIndex * 0.1 }}
                            className={`glass-card p-6 md:p-8 relative overflow-hidden transition-all duration-500 ${showResults ? (answers[qIndex] === question.answer ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5') : 'border-white/10'}`}
                        >
                            <div className="flex items-start gap-4 mb-6">
                                <span className={`flex shrink-0 items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${showResults ? (answers[qIndex] === question.answer ? 'bg-green-500 text-white' : 'bg-red-500 text-white') : 'bg-white/10 text-gray-300'}`}>
                                    {qIndex + 1}
                                </span>
                                <h3 className="text-lg md:text-xl font-medium leading-relaxed mt-0.5">{question.question}</h3>
                            </div>

                            <div className="space-y-3 pl-12">
                                {question.options.map((option, oIndex) => {
                                    const isSelected = answers[qIndex] === option;
                                    const isCorrect = showResults && option === question.answer;
                                    const isWrongSelection = showResults && isSelected && !isCorrect;

                                    let bgClass = "bg-white/5 hover:bg-white/10 text-gray-300";
                                    let borderClass = "border-transparent";
                                    let icon = null;

                                    if (isSelected && !showResults) {
                                        bgClass = "bg-blue-500/20 text-blue-300";
                                        borderClass = "border-blue-500/50";
                                    } else if (showResults) {
                                        if (isCorrect) {
                                            bgClass = "bg-green-500/20 text-green-300";
                                            borderClass = "border-green-500/50";
                                            icon = <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />;
                                        } else if (isWrongSelection) {
                                            bgClass = "bg-red-500/20 text-red-300";
                                            borderClass = "border-red-500/50";
                                            icon = <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />;
                                        } else {
                                            bgClass = "bg-white/5 text-gray-500 opacity-50"; // muted innocent option
                                        }
                                    }

                                    return (
                                        <button
                                            key={oIndex}
                                            onClick={() => handleSelectOption(qIndex, option)}
                                            disabled={showResults}
                                            className={`w-full text-left p-4 rounded-xl border flex items-center justify-between gap-4 transition-all duration-200 ${bgClass} ${borderClass}`}
                                        >
                                            <span className="leading-relaxed">{option}</span>
                                            {icon}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Explanation Reveal */}
                            <AnimatePresence>
                                {showResults && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="mt-6 pl-12 overflow-hidden"
                                    >
                                        <div className={`p-4 rounded-xl border flex items-start gap-4 ${answers[qIndex] === question.answer ? 'bg-green-500/5 border-green-500/20' : 'bg-blue-500/5 border-blue-500/20'}`}>
                                            <Trophy className={`w-5 h-5 shrink-0 mt-0.5 ${answers[qIndex] === question.answer ? 'text-green-500' : 'text-blue-400'}`} />
                                            <div>
                                                <span className={`text-xs font-bold tracking-wider uppercase block mb-1 ${answers[qIndex] === question.answer ? 'text-green-500' : 'text-blue-400'}`}>
                                                    Explanation
                                                </span>
                                                <p className="text-gray-300 text-sm leading-relaxed">
                                                    {question.explanation}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>

                {/* Footer Action */}
                <div className="mt-16 flex justify-center">
                    {!showResults ? (
                        <button
                            onClick={handleSubmitQuiz}
                            disabled={Object.keys(answers).length < quizData.length}
                            className="btn-primary py-4 px-12 text-lg shadow-xl shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Submit Application Exam
                        </button>
                    ) : (
                        <div className="flex gap-4">
                            <button
                                onClick={() => {
                                    setShowResults(false);
                                    setAnswers({});
                                    setScore(null);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="px-8 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-all flex items-center gap-2"
                            >
                                <RefreshCw className="w-5 h-5" /> Retake Exam
                            </button>
                            <button
                                onClick={() => navigate(`/course/${courseId}`)}
                                className="btn-primary py-3 px-8 shadow-xl shadow-blue-500/20 flex items-center gap-2"
                            >
                                Return to Roadmap <ArrowLeft className="w-5 h-5 rotate-180" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default QuizView;
