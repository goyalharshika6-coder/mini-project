import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, MessageCircle, Heart, Share2, Search, Filter, Plus, Code, Lightbulb, Link as LinkIcon, Loader2, X } from 'lucide-react';
import axios from 'axios';
import Layout from '../components/Layout';

const Community = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    
    // New Post State
    const [newPost, setNewPost] = useState({
        type: 'project',
        title: '',
        content: '',
        tags: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
            const { data } = await axios.get(`${API_BASE}/community`, config);
            setPosts(data);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
            const tagsArray = newPost.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
            
            const { data } = await axios.post(`${API_BASE}/community`, {
                ...newPost,
                tags: tagsArray
            }, config);
            
            setPosts([data, ...posts]);
            setShowModal(false);
            setNewPost({ type: 'project', title: '', content: '', tags: '' });
        } catch (error) {
            console.error('Error creating post:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleLike = async (postId) => {
        try {
            // Optimistic update
            const updatedPosts = posts.map(post => {
                if (post._id === postId) {
                    const isLiked = post.likes.includes(userInfo?._id);
                    const newLikes = isLiked 
                        ? post.likes.filter(id => id !== userInfo?._id)
                        : [...post.likes, userInfo?._id];
                    return { ...post, likes: newLikes };
                }
                return post;
            });
            setPosts(updatedPosts);

            const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
            await axios.put(`${API_BASE}/community/${postId}/like`, {}, config);
        } catch (error) {
            console.error('Error toggling like:', error);
            fetchPosts(); // Revert on failure
        }
    };

    const filteredPosts = activeTab === 'all' ? posts : posts.filter(p => p.type === activeTab.slice(0, -1));

    const timeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "mo ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m ago";
        return "Just now";
    };

    return (
        <Layout>
            <div className="max-w-6xl mx-auto py-6 md:py-10 px-4 sm:px-0 pb-32">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-0 mb-8 md:mb-12">
                    <div>
                        <h1 className="text-3xl md:text-4xl mb-2 font-bold tracking-tight flex items-center gap-3">
                            <Users className="text-blue-400 w-8 h-8" /> 
                            Learner <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Community</span>
                        </h1>
                        <p className="text-gray-400 text-sm md:text-base">Share projects, exchange ideas, and grow together.</p>
                    </div>
                    <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 w-full md:w-auto justify-center">
                        <Plus className="w-5 h-5" /> New Post
                    </button>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input 
                            type="text" 
                            placeholder="Search discussions, tags, or members..." 
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>
                    <button className="glass px-6 py-3 rounded-xl flex items-center justify-center gap-2 border-white/10 hover:bg-white/10 transition-colors shrink-0">
                        <Filter className="w-4 h-4" /> Filters
                    </button>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Feed */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Tabs */}
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {['all', 'projects', 'ideas', 'resources'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-5 py-2 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-all ${
                                        activeTab === tab 
                                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' 
                                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Posts List */}
                        {loading ? (
                            <div className="flex justify-center py-12 text-blue-400">
                                <Loader2 className="w-8 h-8 animate-spin" />
                            </div>
                        ) : filteredPosts.length === 0 ? (
                            <div className="text-center py-12 text-gray-400 glass-card">
                                No posts found in this category. Be the first to post!
                            </div>
                        ) : (
                            filteredPosts.map(post => (
                                <motion.div 
                                    key={post._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="glass-card p-6 border-white/10 hover:border-blue-500/30 transition-all group"
                                >
                                    {/* Post Author Header */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold shadow-inner text-white">
                                                {post.author?.name ? post.author.name.substring(0,2).toUpperCase() : 'U'}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-100 leading-tight group-hover:text-blue-400 transition-colors">
                                                    {post.author?.name || 'Unknown User'}
                                                </h4>
                                                <p className="text-xs text-gray-500">{post.author?.skillLevel || 'Learner'} • {timeAgo(post.createdAt)}</p>
                                            </div>
                                        </div>
                                        <div className="bg-white/5 px-3 py-1 rounded-full border border-white/5 flex items-center gap-1.5">
                                            {post.type === 'project' && <Code className="w-3 h-3 text-cyan-400" />}
                                            {post.type === 'idea' && <Lightbulb className="w-3 h-3 text-yellow-500" />}
                                            {post.type === 'resource' && <LinkIcon className="w-3 h-3 text-purple-400" />}
                                            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">{post.type}</span>
                                        </div>
                                    </div>

                                    {/* Post Body */}
                                    <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                                    <p className="text-gray-300 text-sm mb-4 leading-relaxed whitespace-pre-wrap">{post.content}</p>

                                    {/* Tags */}
                                    {post.tags && post.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {post.tags.map(tag => (
                                                <span key={tag} className="text-xs font-medium text-blue-400 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Interactions */}
                                    <div className="flex items-center gap-6 pt-4 border-t border-white/5 text-gray-400 text-sm">
                                        <button 
                                            onClick={() => handleLike(post._id)}
                                            className={`flex items-center gap-2 transition-colors ${post.likes.includes(userInfo?._id) ? 'text-pink-500' : 'hover:text-pink-500'}`}
                                        >
                                            <Heart className={`w-4 h-4 ${post.likes.includes(userInfo?._id) ? 'fill-current' : ''}`} /> 
                                            {post.likes.length}
                                        </button>
                                        <button className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                                            <MessageCircle className="w-4 h-4" /> {post.comments?.length || 0}
                                        </button>
                                        <button className="flex items-center gap-2 hover:text-green-400 transition-colors ml-auto">
                                            <Share2 className="w-4 h-4" /> Share
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>

                    {/* Sidebar Area */}
                    <div className="space-y-6">
                        {/* Trending Tags */}
                        <div className="glass-card p-6 border-white/10">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Search className="w-5 h-5 text-purple-400" /> Trending Topics
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {['React', 'MachineLearning', 'Python', 'WebDev'].map((tag) => (
                                    <div key={tag} className="bg-white/5 hover:bg-white/10 cursor-pointer border border-white/5 px-3 py-1.5 rounded-lg text-sm transition-colors text-gray-300">
                                        #{tag}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* New Post Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setShowModal(false)}
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-[#0f1525] border border-white/10 rounded-2xl w-full max-w-lg z-10 overflow-hidden shadow-2xl"
                        >
                            <div className="flex justify-between items-center p-6 border-b border-white/10">
                                <h2 className="text-xl font-bold">Create Post</h2>
                                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            
                            <form onSubmit={handleCreatePost} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Post Type</label>
                                    <select 
                                        value={newPost.type}
                                        onChange={(e) => setNewPost({...newPost, type: e.target.value})}
                                        className="w-full bg-[#050810] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="project">Project Showcase</option>
                                        <option value="idea">Idea / Discussion</option>
                                        <option value="resource">Resource Sharing</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={newPost.title}
                                        onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                                        className="w-full bg-[#050810] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                                        placeholder="What's on your mind?"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Content</label>
                                    <textarea 
                                        required
                                        value={newPost.content}
                                        onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                                        rows={4}
                                        className="w-full bg-[#050810] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 resize-none"
                                        placeholder="Share the details..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Tags (comma separated)</label>
                                    <input 
                                        type="text" 
                                        value={newPost.tags}
                                        onChange={(e) => setNewPost({...newPost, tags: e.target.value})}
                                        className="w-full bg-[#050810] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                                        placeholder="e.g. React, UI/UX, Python"
                                    />
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={submitting}
                                    className="w-full btn-primary py-3 mt-4 flex items-center justify-center gap-2"
                                >
                                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Publish Post'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </Layout>
    );
};

export default Community;
