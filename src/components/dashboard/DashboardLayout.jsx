// Premium Sidebar Component
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Shield,
    LayoutDashboard,
    FolderGit2,
    Play,
    Terminal,
    BarChart3,
    Settings,
    Menu,
    X,
    ChevronLeft,
    Zap
} from 'lucide-react';

const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { path: '/dashboard/scan', icon: Play, label: 'Scan Now' },
    { path: '/dashboard/repositories', icon: FolderGit2, label: 'Repositories' },
    { path: '/dashboard/hooks', icon: Terminal, label: 'Git Hooks' },
    { path: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export default function DashboardLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

    return (
        <div className="min-h-screen flex bg-[#030711]">
            {/* Mobile menu button */}
            <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-slate-800 text-white border border-slate-700"
            >
                <Menu className="w-5 h-5" />
            </button>

            {/* Mobile overlay */}
            {mobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40 transition-opacity"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed lg:relative inset-y-0 left-0 z-50
          ${sidebarOpen ? 'w-72' : 'w-20'}
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          bg-[#0B1120] border-r border-white/[0.05] flex flex-col
          transition-all duration-300 ease-in-out
          shadow-2xl shadow-black/50
        `}
            >
                {/* Logo */}
                <div className="h-20 flex items-center px-6 border-b border-white/[0.05]">
                    <Link to="/" className="flex items-center gap-3 overflow-hidden">
                        <div className="relative flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg shadow-lg shadow-indigo-500/20">
                            <Shield className="w-5 h-5 text-white" />
                            <div className="absolute inset-0 bg-white/20 rounded-lg animate-pulse-glow" />
                        </div>

                        <div className={`transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
                            <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                                GitGuardian
                            </span>
                        </div>
                    </Link>

                    <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="lg:hidden ml-auto text-slate-400 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`
                  relative flex items-center gap-3 px-3 py-3 rounded-xl
                  transition-all duration-200 group overflow-hidden
                  ${isActive
                                        ? 'bg-gradient-to-r from-violet-600/10 to-indigo-600/10 text-white'
                                        : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
                                    }
                `}
                            >
                                {isActive && (
                                    <div className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-r-full" />
                                )}

                                <item.icon
                                    className={`
                    w-5 h-5 flex-shrink-0 transition-colors
                    ${isActive ? 'text-indigo-400' : 'group-hover:text-indigo-300'}
                  `}
                                />

                                <span className={`transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
                                    {item.label}
                                </span>

                                {item.label === 'Scan Now' && sidebarOpen && (
                                    <span className="ml-auto flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Pro Banner */}
                {sidebarOpen && (
                    <div className="p-4">
                        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 p-4">
                            <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-white/10 rounded-full blur-xl" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-2 text-white font-semibold">
                                    <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                                    <span>Pro Plan</span>
                                </div>
                                <p className="text-xs text-indigo-100 mb-3 leading-relaxed">
                                    Unlock private repo scanning and unlimited history.
                                </p>
                                <button className="w-full py-2 px-3 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium text-white transition-colors border border-white/10">
                                    Upgrade Now
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer / User */}
                <div className="p-4 border-t border-white/[0.05]">
                    <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-500 p-[1px]">
                            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-xs font-bold text-white">
                                JD
                            </div>
                        </div>
                        {sidebarOpen && (
                            <div className="overflow-hidden">
                                <div className="text-sm font-medium text-white truncate">John Doe</div>
                                <div className="text-xs text-slate-500 truncate">Free Tier</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Collapse button */}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="hidden lg:flex absolute -right-3 top-24 w-6 h-6 items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white shadow-lg transition-transform hover:scale-110"
                >
                    <ChevronLeft className={`w-3 h-3 transition-transform duration-300 ${!sidebarOpen ? 'rotate-180' : ''}`} />
                </button>
            </aside>

            {/* Main content area with grid background */}
            <main className="flex-1 overflow-auto bg-[#030711] relative">
                <div className="absolute inset-0 bg-grid bg-grid-mask pointer-events-none opacity-20" />
                <div className="relative z-10 p-6 lg:p-8 pt-20 lg:pt-8 max-w-[1600px] mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
