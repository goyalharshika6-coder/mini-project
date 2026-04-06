import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, DollarSign, Clock, Building, ArrowRight, Bookmark, Search, Filter, Star } from 'lucide-react';
import axios from 'axios';
import Layout from '../components/Layout';

const Jobs = () => {
    const [activeFilter, setActiveFilter] = useState('all');
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                if (!userInfo || !userInfo.token) return;

                const { data } = await axios.get(`${API_BASE}/jobs`, {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                });
                setJobs(data);
            } catch (err) {
                console.error("Error fetching jobs:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, []);

    const filteredJobs = activeFilter === 'all' ? jobs : jobs.filter(j => j.type.toLowerCase() === activeFilter);

    if (loading) return <Layout><div className="h-full flex items-center justify-center text-gray-400">Loading jobs...</div></Layout>;

    return (
        <Layout>
            <div className="max-w-6xl mx-auto py-6 md:py-10 px-4 sm:px-0">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-0 mb-8 md:mb-12">
                    <div>
                        <h1 className="text-3xl md:text-4xl mb-2 font-bold tracking-tight flex items-center gap-3">
                            <Briefcase className="text-purple-400 w-8 h-8" /> 
                            Jobs & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Internships</span>
                        </h1>
                        <p className="text-gray-400 text-sm md:text-base">Find opportunities curated for your skill level.</p>
                    </div>
                </div>

                {/* Search & Filter Bar */}
                <div className="flex flex-col md:flex-row gap-4 mb-10 bg-white/5 p-4 rounded-2xl border border-white/10">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Job title, keywords, or company..." 
                            className="w-full bg-transparent border-none py-2 pl-12 pr-4 focus:outline-none text-white placeholder:text-gray-500"
                        />
                    </div>
                    <div className="w-px bg-white/10 hidden md:block"></div>
                    <div className="relative flex-1">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="City, state, or remote" 
                            className="w-full bg-transparent border-none py-2 pl-12 pr-4 focus:outline-none text-white placeholder:text-gray-500"
                        />
                    </div>
                    <button className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl px-8 py-3 font-semibold hover:shadow-lg transition-all text-white w-full md:w-auto">
                        Search jobs
                    </button>
                </div>

                {/* Quick Filters */}
                <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                    {['all', 'full-time', 'internship', 'freelance'].map(filter => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-6 py-2 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-all border ${
                                activeFilter === filter 
                                ? 'bg-purple-500/20 text-purple-400 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]' 
                                : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            {filter}
                        </button>
                    ))}
                    <button className="px-4 py-2 rounded-full text-sm font-medium bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 flex items-center gap-2 ml-auto shrink-0">
                        <Filter className="w-4 h-4" /> More Filters
                    </button>
                </div>

                {/* Grid Layout for Jobs */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredJobs.map(job => (
                        <motion.div 
                            key={job.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -4 }}
                            className="glass-card p-6 border-white/10 hover:border-purple-500/30 transition-all group flex flex-col"
                        >
                            {/* Top Info */}
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex gap-4 items-center">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 flex items-center justify-center font-bold text-lg shadow-inner">
                                        {job.company.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold group-hover:text-purple-400 transition-colors flex items-center gap-2">
                                            {job.role}
                                            {job.matchPercentage >= 75 && (
                                                <span title="Highly Recommended" className="text-yellow-400 flex items-center pointer-events-none">
                                                    <Star className="w-4 h-4 fill-yellow-400" />
                                                </span>
                                            )}
                                        </h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                                            <Building className="w-3.5 h-3.5" />
                                            {job.company}
                                            {job.isHot && (
                                                <span className="ml-2 bg-red-500/10 text-red-400 text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-red-500/20 flex items-center gap-1">
                                                    🔥 Hot
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button className="text-gray-500 hover:text-white transition-colors p-2 glass rounded-lg opacity-0 group-hover:opacity-100 hidden sm:block">
                                    <Bookmark className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Tags/Attributes */}
                            <div className="flex flex-wrap gap-3 mb-6">
                                <div className="flex items-center gap-1.5 text-sm bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">
                                    <Clock className="w-3.5 h-3.5" /> {job.type}
                                </div>
                                <div className="flex items-center gap-1.5 text-sm bg-white/5 text-gray-300 px-3 py-1 rounded-full border border-white/10">
                                    <MapPin className="w-3.5 h-3.5 text-gray-400" /> {job.location}
                                </div>
                                <div className="flex items-center gap-1.5 text-sm bg-green-500/10 text-green-400 px-3 py-1 rounded-full border border-green-500/20">
                                    <DollarSign className="w-3.5 h-3.5" /> {job.salary}
                                </div>
                            </div>

                            {/* Required Skills */}
                            <div className="mb-6 flex-1">
                                <p className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wider">Required Skills</p>
                                <div className="flex flex-wrap gap-2">
                                    {job.reqs.map(req => (
                                        <span key={req} className="text-xs bg-white/5 text-gray-300 px-2.5 py-1 rounded border border-white/5">
                                            {req}
                                        </span>
                                    ))}
                                </div>
                                {job.matchPercentage !== undefined && (
                                    <div className="mt-5 bg-white/5 p-3 rounded-xl border border-white/5">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Skill Match</span>
                                            <span className={`text-xs font-bold ${job.matchPercentage >= 75 ? 'text-green-400' : job.matchPercentage >= 40 ? 'text-yellow-400' : 'text-gray-400'}`}>
                                                {job.matchPercentage}%
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-1000 ${job.matchPercentage >= 75 ? 'bg-green-500' : job.matchPercentage >= 40 ? 'bg-yellow-500' : 'bg-gray-500'}`} 
                                                style={{ width: `${job.matchPercentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer / CTA */}
                            <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                                <span className="text-xs text-gray-500">Posted {new Date(job.createdAt || Date.now()).toLocaleDateString()}</span>
                                <button className="text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2 group/btn">
                                    Apply Now <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                    
                    {filteredJobs.length === 0 && (
                        <div className="lg:col-span-2 text-center py-20 glass-card">
                            <Briefcase className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold mb-2">No jobs found matching this filter</h3>
                            <p className="text-gray-400 mb-6">Try adjusting your filters or search terms.</p>
                            <button onClick={() => setActiveFilter('all')} className="btn-primary">Clear Filters</button>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Jobs;
