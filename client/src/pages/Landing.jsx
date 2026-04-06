import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
    Bot, Sparkles, Target, Zap, ChevronRight, CheckCircle2, 
    Brain, MessageSquare, BookOpen, LayoutDashboard, 
    Trophy, Lightbulb, Rocket, Users, Github, Twitter, 
    Linkedin, Play, ArrowRight, Cpu, Network, LineChart,
    Menu, X
} from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// 3D Floating Particles Background Component
const FloatingNetwork = () => {
    const pointsRef = useRef();
    const linesRef = useRef();
    
    // Create particles with positions
    const particleCount = 80;
    const connectionDistance = 2.5;
    
    const [positions, velocities] = useMemo(() => {
        const pos = new Float32Array(particleCount * 3);
        const vel = [];
        
        for (let i = 0; i < particleCount; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 15;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
            
            vel.push({
                x: (Math.random() - 0.5) * 0.01,
                y: (Math.random() - 0.5) * 0.01,
                z: (Math.random() - 0.5) * 0.01
            });
        }
        return [pos, vel];
    }, []);
    
    // Lines for connections
    const linePositions = useMemo(() => {
        return new Float32Array(particleCount * particleCount * 6); // Max possible lines
    }, []);
    
    const lineColors = useMemo(() => {
        return new Float32Array(particleCount * particleCount * 6);
    }, []);
    
    useFrame((state) => {
        if (!pointsRef.current) return;
        
        const posArray = pointsRef.current.geometry.attributes.position.array;
        const time = state.clock.elapsedTime;
        
        // Update particle positions
        for (let i = 0; i < particleCount; i++) {
            posArray[i * 3] += velocities[i].x + Math.sin(time * 0.5 + i) * 0.002;
            posArray[i * 3 + 1] += velocities[i].y + Math.cos(time * 0.3 + i) * 0.002;
            posArray[i * 3 + 2] += velocities[i].z;
            
            // Boundary check
            if (Math.abs(posArray[i * 3]) > 8) velocities[i].x *= -1;
            if (Math.abs(posArray[i * 3 + 1]) > 5) velocities[i].y *= -1;
            if (Math.abs(posArray[i * 3 + 2]) > 5) velocities[i].z *= -1;
        }
        
        pointsRef.current.geometry.attributes.position.needsUpdate = true;
        
        // Update connections
        if (linesRef.current) {
            let lineIndex = 0;
            const linePos = linesRef.current.geometry.attributes.position.array;
            const lineCol = linesRef.current.geometry.attributes.color.array;
            
            for (let i = 0; i < particleCount; i++) {
                for (let j = i + 1; j < particleCount; j++) {
                    const dx = posArray[i * 3] - posArray[j * 3];
                    const dy = posArray[i * 3 + 1] - posArray[j * 3 + 1];
                    const dz = posArray[i * 3 + 2] - posArray[j * 3 + 2];
                    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
                    
                    if (dist < connectionDistance && lineIndex < linePos.length / 6) {
                        // Line start
                        linePos[lineIndex * 6] = posArray[i * 3];
                        linePos[lineIndex * 6 + 1] = posArray[i * 3 + 1];
                        linePos[lineIndex * 6 + 2] = posArray[i * 3 + 2];
                        
                        // Line end
                        linePos[lineIndex * 6 + 3] = posArray[j * 3];
                        linePos[lineIndex * 6 + 4] = posArray[j * 3 + 1];
                        linePos[lineIndex * 6 + 5] = posArray[j * 3 + 2];
                        
                        // Color based on distance (cyan to purple)
                        const alpha = 1 - (dist / connectionDistance);
                        lineCol[lineIndex * 6] = 0.2 + alpha * 0.4;     // R
                        lineCol[lineIndex * 6 + 1] = 0.8;               // G
                        lineCol[lineIndex * 6 + 2] = 1;                 // B
                        lineCol[lineIndex * 6 + 3] = 0.6;               // R
                        lineCol[lineIndex * 6 + 4] = 0.2;               // G
                        lineCol[lineIndex * 6 + 5] = 0.8 + alpha * 0.2; // B
                        
                        lineIndex++;
                    }
                }
            }
            
            // Hide unused lines
            for (let i = lineIndex * 6; i < linePos.length; i++) {
                linePos[i] = 0;
            }
            
            linesRef.current.geometry.attributes.position.needsUpdate = true;
            linesRef.current.geometry.attributes.color.needsUpdate = true;
        }
    });
    
    return (
        <>
            {/* Particles */}
            <points ref={pointsRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={particleCount}
                        array={positions}
                        itemSize={3}
                    />
                </bufferGeometry>
                <pointsMaterial
                    size={0.15}
                    color="#00d4ff"
                    transparent
                    opacity={0.8}
                    sizeAttenuation
                    blending={THREE.AdditiveBlending}
                />
            </points>
            
            {/* Connection Lines */}
            <lineSegments ref={linesRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={particleCount * particleCount * 2}
                        array={linePositions}
                        itemSize={3}
                    />
                    <bufferAttribute
                        attach="attributes-color"
                        count={particleCount * particleCount * 2}
                        array={lineColors}
                        itemSize={3}
                    />
                </bufferGeometry>
                <lineBasicMaterial
                    vertexColors
                    transparent
                    opacity={0.3}
                    blending={THREE.AdditiveBlending}
                />
            </lineSegments>
            
            {/* Ambient Light */}
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#00d4ff" />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
        </>
    );
};

const Landing = () => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { scrollYProgress } = useScroll();
    
    // Parallax effects
    const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
    const y2 = useTransform(scrollYProgress, [0, 1], [0, -50]);
    
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Navigation items
    const navItems = [
        { name: 'Home', href: '#' },
        { name: 'Features', href: '#features' },
        { name: 'How It Works', href: '#how-it-works' },
        { name: 'Projects', href: '#projects' },
        { name: 'Community', href: '#community' },
    ];

    // How It Works steps
    const steps = [
        {
            icon: <Target className="w-8 h-8" />,
            title: "Define Your Goal",
            desc: "Enter your dream career or skill you want to master",
            color: "from-blue-500 to-cyan-500"
        },
        {
            icon: <Brain className="w-8 h-8" />,
            title: "AI Assessment",
            desc: "Our AI evaluates your current knowledge and experience",
            color: "from-purple-500 to-pink-500"
        },
        {
            icon: <Network className="w-8 h-8" />,
            title: "Gap Analysis",
            desc: "Identify exactly what you need to learn to reach your goal",
            color: "from-cyan-500 to-blue-500"
        },
        {
            icon: <Rocket className="w-8 h-8" />,
            title: "Your Roadmap",
            desc: "Get a personalized learning path with resources and projects",
            color: "from-pink-500 to-purple-500"
        }
    ];

    // Core features
    const features = [
        {
            icon: <Brain className="w-6 h-6" />,
            title: "AI Skill Gap Analyzer",
            desc: "Deep analysis of your current skills vs. career requirements"
        },
        {
            icon: <LayoutDashboard className="w-6 h-6" />,
            title: "Personalized Roadmap",
            desc: "Dynamic learning paths that adapt to your progress"
        },
        {
            icon: <MessageSquare className="w-6 h-6" />,
            title: "AI Mentor Chat",
            desc: "24/7 AI tutor for explanations, hints, and motivation"
        },
        {
            icon: <BookOpen className="w-6 h-6" />,
            title: "Smart Resources",
            desc: "Curated learning materials matched to your level"
        },
        {
            icon: <Cpu className="w-6 h-6" />,
            title: "Project-Based Learning",
            desc: "Hands-on projects that build real-world portfolio"
        },
        {
            icon: <LineChart className="w-6 h-6" />,
            title: "Progress Dashboard",
            desc: "Visual tracking of your skill development journey"
        },
        {
            icon: <Trophy className="w-6 h-6" />,
            title: "Skill Assessments",
            desc: "Regular quizzes to validate your learning progress"
        }
    ];

    // Future features with timeline dates
    const futureFeatures = [
        {
            date: "Q2 2026",
            icon: <LineChart className="w-6 h-6" />,
            title: "AI Career Predictor",
            desc: "Predict your career trajectory based on current skills",
            status: "In Development"
        },
        {
            date: "Q3 2026",
            icon: <CheckCircle2 className="w-6 h-6" />,
            title: "AI Project Evaluator",
            desc: "Get instant feedback on your portfolio projects",
            status: "Planning"
        },
        {
            date: "Q4 2026",
            icon: <Users className="w-6 h-6" />,
            title: "Interview Simulator",
            desc: "Practice coding interviews with AI feedback",
            status: "Research"
        },
        {
            date: "Q1 2027",
            icon: <BookOpen className="w-6 h-6" />,
            title: "ATS Resume Builder",
            desc: "AI-optimized resumes that pass screening systems",
            status: "Upcoming"
        },
        {
            date: "Q2 2027",
            icon: <Rocket className="w-6 h-6" />,
            title: "Job Platform Integration",
            desc: "Direct connections to opportunities matching your skills",
            status: "Future Scope"
        }
    ];

    return (
        <div className="min-h-screen bg-[#0B0F1A] text-white overflow-x-hidden font-sans selection:bg-cyan-500/30">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[150px]" />
            </div>

            {/* Navigation */}
            <motion.nav 
                className={`fixed top-0 w-full z-50 transition-all duration-300 ${
                    scrolled ? 'bg-[#0B0F1A]/90 backdrop-blur-xl border-b border-white/10' : 'bg-transparent'
                }`}
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all">
                            <Bot className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight">
                            SkillPath <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">AI</span>
                        </span>
                    </div>
                    
                    <div className="hidden md:flex items-center gap-8">
                        {navItems.map((item) => (
                            <a 
                                key={item.name} 
                                href={item.href}
                                className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
                            >
                                {item.name}
                            </a>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <button 
                            onClick={() => navigate('/login')} 
                            className="hidden sm:block text-gray-300 hover:text-white transition-colors font-medium"
                        >
                            Login
                        </button>
                        <button
                            onClick={() => navigate('/register')}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-full font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all hover:scale-105"
                        >
                            Get Started
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button 
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="text-gray-300 hover:text-white p-2"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {mobileMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="md:hidden bg-[#0B0F1A]/95 border-b border-white/10 backdrop-blur-xl px-6 py-4 flex flex-col gap-4"
                    >
                        {navItems.map((item) => (
                            <a 
                                key={item.name} 
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-gray-400 hover:text-white transition-colors text-base font-medium py-2"
                            >
                                {item.name}
                            </a>
                        ))}
                        <div className="border-t border-white/10 mt-2 pt-4 flex flex-col gap-3">
                            <button 
                                onClick={() => navigate('/login')} 
                                className="w-full bg-white/5 border border-white/10 text-white py-3 rounded-xl font-medium"
                            >
                                Login
                            </button>
                            <button
                                onClick={() => navigate('/register')}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold"
                            >
                                Get Started Free
                            </button>
                        </div>
                    </motion.div>
                )}
            </motion.nav>

            {/* Hero Section - Centered Text with 3D Background */}
            <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
                {/* 3D Background Canvas */}
                <div className="absolute inset-0 z-0">
                    <Canvas
                        camera={{ position: [0, 0, 8], fov: 60 }}
                        dpr={[1, 1.5]}
                        gl={{ antialias: true, alpha: true }}
                        style={{ background: 'transparent' }}
                    >
                        <Suspense fallback={null}>
                            <FloatingNetwork />
                        </Suspense>
                    </Canvas>
                </div>

                {/* Gradient Overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F1A]/50 via-transparent to-[#0B0F1A] z-10 pointer-events-none" />

                {/* Centered Content */}
                <div className="relative z-20 max-w-5xl mx-auto px-6 text-center">
                    <motion.div 
                        className="space-y-8"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <motion.div 
                            className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-sm mx-auto"
                            whileHover={{ scale: 1.05 }}
                        >
                            <Sparkles className="w-4 h-4 text-cyan-400" />
                            <span className="text-sm font-medium text-gray-300">The Future of Personalized Learning</span>
                        </motion.div>

                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold leading-tight">
                            Learn Only What You <br className="hidden md:block" />
                            Need with{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400">
                                AI
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl md:px-0 text-gray-400 max-w-3xl mx-auto leading-relaxed">
                            SkillPath AI analyzes your current skills, detects gaps, and builds a personalized roadmap to help you reach your dream career faster.
                        </p>

                        <div className="flex justify-center">
                            <button
                                onClick={() => navigate('/register')}
                                className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-xl hover:shadow-blue-500/25 transition-all flex items-center justify-center gap-2 hover:scale-105"
                            >
                                Get Started Free
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        <div className="flex items-center justify-center gap-4 text-sm text-gray-500 pt-4">
                            <div className="flex -space-x-2">
                                {[1,2,3,4].map((i) => (
                                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-2 border-[#0B0F1A]" />
                                ))}
                            </div>
                            <p>Trusted by <span className="text-white font-semibold">10,000+</span> learners</p>
                        </div>
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
                <motion.div 
                    className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center pt-2">
                        <div className="w-1 h-2 bg-cyan-400 rounded-full" />
                    </div>
                </motion.div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-32 px-6 relative">
                <div className="max-w-7xl mx-auto">
                    <motion.div 
                        className="text-center mb-20"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
                        <p className="text-gray-400 text-lg">Four steps to your personalized learning journey</p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {steps.map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ y: -10 }}
                                className="relative group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm hover:border-white/20 transition-all h-full">
                                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${step.color} flex items-center justify-center mb-6 shadow-lg`}>
                                        {step.icon}
                                    </div>
                                    <div className="text-xs font-bold text-cyan-400 mb-2">STEP {i + 1}</div>
                                    <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                                </div>
                                {i < 3 && (
                                    <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                                        <ChevronRight className="w-6 h-6 text-gray-600" />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Core Features Section */}
            <section id="features" className="py-32 px-6 relative bg-white/[0.02]">
                <div className="max-w-7xl mx-auto">
                    <motion.div 
                        className="text-center mb-20"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">Core Features</h2>
                        <p className="text-gray-400 text-lg">Everything you need to master new skills efficiently</p>
                    </motion.div>

                    {/* Inverted Triangle Layout for Features (4-2-1) */}
                    <div className="flex flex-col gap-6">
                        {/* Row 1: 4 Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {features.slice(0, 4).map((feature, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.05 }}
                                    whileHover={{ scale: 1.02, y: -5 }}
                                    className="group relative"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
                                    <div className="relative bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/10 transition-all h-full">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-6 group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all">
                                            <div className="text-cyan-400">{feature.icon}</div>
                                        </div>
                                        <h3 className="text-lg font-bold mb-3 group-hover:text-cyan-400 transition-colors">{feature.title}</h3>
                                        <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Row 2: 2 Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto w-full">
                            {features.slice(4, 6).map((feature, i) => (
                                <motion.div
                                    key={i + 4}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: (i + 4) * 0.05 }}
                                    whileHover={{ scale: 1.02, y: -5 }}
                                    className="group relative"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
                                    <div className="relative bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/10 transition-all h-full">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-6 group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all">
                                            <div className="text-cyan-400">{feature.icon}</div>
                                        </div>
                                        <h3 className="text-lg font-bold mb-3 group-hover:text-cyan-400 transition-colors">{feature.title}</h3>
                                        <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Row 3: 1 Card */}
                        <div className="max-w-md mx-auto w-full">
                            {features.slice(6, 7).map((feature, i) => (
                                <motion.div
                                    key={i + 6}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: (i + 6) * 0.05 }}
                                    whileHover={{ scale: 1.02, y: -5 }}
                                    className="group relative"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
                                    <div className="relative bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/10 transition-all h-full text-center">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-6 group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all mx-auto">
                                            <div className="text-cyan-400">{feature.icon}</div>
                                        </div>
                                        <h3 className="text-lg font-bold mb-3 group-hover:text-cyan-400 transition-colors">{feature.title}</h3>
                                        <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>


            {/* Future Vision Section */}
            <section className="py-32 px-6 relative bg-gradient-to-b from-transparent via-purple-900/10 to-transparent">
                <div className="max-w-7xl mx-auto">
                    <motion.div 
                        className="text-center mb-20"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">Future Vision</h2>
                        <p className="text-gray-400 text-lg">Expanding your AI-powered career toolkit</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {futureFeatures.map((feature, i) => {
                            // Define col-spans for "puzzled" look
                            const spans = [
                                "md:col-span-2", // Item 1
                                "md:col-span-1", // Item 2
                                "md:col-span-1", // Item 3
                                "md:col-span-2", // Item 4
                                "md:col-span-3"  // Item 5
                            ];
                            
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: i * 0.1 }}
                                    className={`group relative ${spans[i]}`}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
                                    <div className="relative bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm hover:border-purple-500/30 transition-all h-full">
                                        <div className="absolute top-4 right-4">
                                            <span className="px-2 py-1 rounded bg-purple-500/10 text-purple-400 text-xs font-semibold tracking-wider uppercase">
                                                {feature.status}
                                            </span>
                                        </div>
                                        <div className="text-cyan-400 font-bold text-sm mb-2">{feature.date}</div>
                                        <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6 text-purple-400 group-hover:scale-110 transition-transform">
                                            {feature.icon}
                                        </div>
                                        <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                        <p className="text-gray-400 text-sm leading-relaxed max-w-md">{feature.desc}</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>


        </div>
    );
};

export default Landing;