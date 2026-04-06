import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Bot, User, Loader2 } from 'lucide-react';
import axios from 'axios';

const AIMentor = ({ context }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', text: "Hello! I'm your SkillPath AI Mentor. How can I help you on your learning journey today?" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
            const { data } = await axios.post(`${API_BASE}/courses/ask-mentor`,
                { question: input, context },
                { headers: { Authorization: `Bearer ${userInfo.token}` } }
            );

            setMessages(prev => [...prev, { role: 'assistant', text: data.answer }]);
        } catch (err) {
            console.error('Mentor Error:', err);
            setMessages(prev => [...prev, { role: 'assistant', text: "I'm having trouble connecting to my brain right now. Please try again in a moment." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="glass-card w-[calc(100vw-2rem)] sm:w-96 h-[400px] sm:h-[500px] mb-4 flex flex-col overflow-hidden border-accent1/20 shadow-2xl shadow-black/50"
                    >
                        {/* Header */}
                        <div className="p-4 bg-accent1/10 border-b border-white/10 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Bot className="w-5 h-5 text-accent1" />
                                <h3 className="font-bold">AI Mentor</h3>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-secondary hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((m, i) => (
                                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-3 rounded-2xl flex gap-3 ${m.role === 'user'
                                            ? 'bg-accent1 text-white rounded-tr-none'
                                            : 'bg-white/5 border border-white/10 text-secondary rounded-tl-none'
                                        }`}>
                                        <div className="shrink-0">
                                            {m.role === 'user' ? <User className="w-4 h-4 mt-1" /> : <Bot className="w-4 h-4 mt-1" />}
                                        </div>
                                        <p className="text-sm leading-relaxed">{m.text}</p>
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-white/5 border border-white/10 p-3 rounded-2xl rounded-tl-none flex gap-2 items-center">
                                        <Loader2 className="w-4 h-4 animate-spin text-accent1" />
                                        <span className="text-sm text-secondary">Thinking...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSend} className="p-4 border-t border-white/10 bg-white/5">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Ask your mentor..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 pr-10 text-sm focus:outline-none focus:border-accent1 transition-colors"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                />
                                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-accent1 hover:scale-110 transition-transform">
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            {!isOpen && (
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(true)}
                    className="w-16 h-16 bg-accent1 rounded-full flex items-center justify-center shadow-lg shadow-accent1/30 text-white"
                >
                    <MessageSquare className="w-8 h-8" />
                </motion.button>
            )}
        </div>
    );
};

export default AIMentor;
