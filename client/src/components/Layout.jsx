import React from 'react';
import { motion } from 'framer-motion';
import { LogOut, User, BookOpen, LayoutDashboard, Menu, X, Users, Briefcase } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import AIMentor from './AIMentor';

const Layout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'New Course', path: '/new-course', icon: BookOpen },
        { name: 'Enrolled Courses', path: '/enrolled-courses', icon: BookOpen },
        { name: 'Community', path: '/community', icon: Users },
        { name: 'Jobs', path: '/jobs', icon: Briefcase },
        { name: 'Profile', path: '/profile', icon: User },
    ];

    return (
        <div className="min-h-screen bg-[#0B0F1A] text-white flex flex-col md:flex-row overflow-hidden relative">
            {/* Mobile Top Bar */}
            <div className="md:hidden flex items-center justify-between p-4 glass border-b border-white/10 z-20">
                <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                    <div className="w-8 h-8 md:hidden bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/25"></div>
                    SkillPath <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">AI</span>
                </div>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-300 hover:text-white glass rounded-lg border-white/10">
                    {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Animated Background Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[150px]" />
            </div>

            {/* Sidebar Overlay for Mobile */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <nav className={`w-64 glass border-r border-white/10 p-6 flex flex-col fixed h-full z-30 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                
                {/* Desktop Logo (hidden on mobile) */}
                <div className="hidden md:flex items-center gap-2 mb-10 px-2 group cursor-pointer" onClick={() => navigate('/dashboard')}>
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all"></div>
                    <h2 className="text-2xl font-bold tracking-tight">SkillPath <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">AI</span></h2>
                </div>

                <div className="flex-1 space-y-2">
                    {navItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${location.pathname === item.path
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20'
                                : 'hover:bg-white/5 text-gray-400 hover:text-white'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 ${location.pathname === item.path ? 'text-white' : 'text-gray-400'}`} />
                            <span className="font-medium">{item.name}</span>
                        </button>
                    ))}
                </div>

                <div className="mt-auto border-t border-white/10 pt-6">
                    <div className="flex items-center gap-3 px-2 mb-6 cursor-pointer hover:bg-white/5 p-2 rounded-xl transition-colors" onClick={() => navigate('/profile')}>
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                            <User className="text-blue-400 w-6 h-6" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold truncate text-white">{userInfo?.name || 'User'}</p>
                            <p className="text-xs text-gray-400 truncate">{userInfo?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-400 transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 w-full md:ml-64 p-4 md:p-8 relative z-10 md:w-[calc(100%-16rem)] overflow-x-hidden overflow-y-auto min-h-[calc(100vh-73px)] md:min-h-screen">
                {children}
                <AIMentor context={`User ${userInfo?.name} is on the ${location.pathname} page.`} />
            </main>
        </div>
    );
};

export default Layout;
