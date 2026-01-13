// Premium Landing Page
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Shield,
    Zap,
    GitBranch,
    Lock,
    Eye,
    Terminal,
    Check,
    ArrowRight,
    Github,
    AlertTriangle,
    Code2,
    FileSearch,
    ChevronRight,
    Star
} from 'lucide-react';
import { Button } from '../components/ui';

function ParticleBackground() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent blur-3xl opacity-50" />
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] animate-pulse-glow" />
            <div className="absolute top-40 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '1s' }} />
        </div>
    );
}

function CodeTypewriter() {
    const [text, setText] = useState('');
    const code = `git commit -m "Add auth"
> 🛡️  Scanning...
> ⚠️  SECRET DETECTED!
> Blocked AWS Key in config.js`;

    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            setText(code.slice(0, i));
            i++;
            if (i > code.length) {
                clearInterval(interval);
                setTimeout(() => { i = 0 }, 3000);
            }
        }, 50);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="font-mono text-sm leading-relaxed p-4">
            {text.split('\n').map((line, i) => (
                <div key={i} className={
                    line.includes('⚠️') ? 'text-amber-400' :
                        line.includes('Blocked') ? 'text-red-400 font-bold' :
                            line.includes('Scanning') ? 'text-blue-400' : 'text-slate-300'
                }>
                    {line}
                </div>
            ))}
            <span className="inline-block w-2 H-4 bg-purple-500 animate-pulse ml-1">_</span>
        </div>
    );
}

export default function LandingPage() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-[#030711] text-white overflow-hidden font-sans selection:bg-purple-500/30">
            <ParticleBackground />

            {/* Navigation */}
            <nav className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${scrolled ? 'bg-[#030711]/80 backdrop-blur-md border-b border-white/5 py-3' : 'bg-transparent py-6'}
      `}>
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="relative">
                            <Shield className="w-8 h-8 text-indigo-500 group-hover:text-indigo-400 transition-colors" />
                            <div className="absolute inset-0 bg-indigo-500/20 filter blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            GitGuardian
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8 text-sm font-medium">
                        {['Features', 'How it Works', 'Pricing'].map((item) => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                                className="text-slate-400 hover:text-white transition-colors hover:glow-text"
                            >
                                {item}
                            </a>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <Link to="/dashboard" className="hidden sm:block text-slate-300 hover:text-white text-sm font-medium">
                            Log In
                        </Link>
                        <Link to="/dashboard">
                            <Button variant="primary" className="shadow-neon">
                                Get Started
                                <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <div className="relative z-10 animate-fade-in-up">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
                            <span className="flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            <span className="text-xs font-medium text-slate-300">
                                Secrets leaked every 3 seconds
                            </span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
                            Protect Your Code <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                                Before You Commit
                            </span>
                        </h1>

                        <p className="text-xl text-slate-400 mb-10 leading-relaxed max-w-xl">
                            The enterprise-grade secret scanning platform that lives in your terminal.
                            Prevent API keys, tokens, and credentials from ever reaching your repository.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link to="/dashboard">
                                <Button size="xl" variant="primary" className="w-full sm:w-auto shadow-[0_0_30px_-5px_rgba(79,70,229,0.4)]">
                                    <Shield className="w-5 h-5 mr-2" />
                                    Start Scanning
                                </Button>
                            </Link>
                            <Link to="/playground">
                                <Button size="xl" variant="secondary" className="w-full sm:w-auto">
                                    <Terminal className="w-5 h-5 mr-2" />
                                    Live Demo
                                </Button>
                            </Link>
                        </div>

                        <div className="mt-12 flex items-center gap-8 text-slate-500">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className={`w-10 h-10 rounded-full border-2 border-[#030711] bg-slate-800 flex items-center justify-center text-xs font-bold text-white z-${10 - i}`}>
                                        {['GH', 'GL', 'BB', '+'][i - 1]}
                                    </div>
                                ))}
                            </div>
                            <div className="text-sm">
                                <div className="flex items-center gap-1 text-yellow-400 mb-1">
                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                                </div>
                                <span className="font-medium text-slate-400">Trusted by 10,000+ devs</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative animate-float">
                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-2xl blur-3xl" />
                        <div className="relative bg-[#0B1120] border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
                            <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/5">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                                </div>
                                <div className="text-xs font-mono text-slate-500">pre-commit-hook</div>
                            </div>
                            <div className="h-[300px] flex flex-col">
                                <CodeTypewriter />

                                <div className="mt-auto p-4 border-t border-white/5 bg-white/[0.02]">
                                    <div className="flex items-center gap-3">
                                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-500 w-2/3 animate-shimmer"
                                                style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }}
                                            />
                                        </div>
                                        <span className="text-xs text-indigo-400 font-mono">Scanning...</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating badges */}
                        <div className="absolute -right-6 top-10 bg-[#0B1120] border border-red-500/30 p-4 rounded-xl shadow-xl animate-pulse-glow z-20">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-500/20 rounded-lg">
                                    <AlertTriangle className="w-6 h-6 text-red-500" />
                                </div>
                                <div>
                                    <div className="text-xs text-red-400 font-bold uppercase tracking-wider">Blocked</div>
                                    <div className="text-sm font-medium text-white">AWS Access Key</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section with Grid Background */}
            <section className="relative py-20 border-y border-white/5 bg-white/[0.02]">
                <div className="absolute inset-0 bg-grid opacity-30" />
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
                    {[
                        { label: 'Secret Patterns', value: '30+', icon: FileSearch, color: 'text-indigo-400' },
                        { label: 'False Positives', value: '< 0.1%', icon: Check, color: 'text-emerald-400' },
                        { label: 'Scan Speed', value: '15ms', icon: Zap, color: 'text-yellow-400' },
                        { label: 'Repositories', value: '1M+', icon: Github, color: 'text-white' },
                    ].map((stat, i) => (
                        <div key={i} className="text-center group">
                            <div className={`mb-4 inline-flex p-3 rounded-2xl bg-white/5 group-hover:bg-white/10 transition-colors`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <div className="text-3xl font-bold text-white mb-1 group-hover:scale-110 transition-transform">{stat.value}</div>
                            <div className="text-sm text-slate-400">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-32 px-6 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500">
                                Everything you need
                            </span>
                        </h2>
                        <p className="text-slate-400 text-lg">Comprehensive protection across your entire development lifecycle</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                title: 'Real-time Detection',
                                desc: 'Scans your code as you type in the IDE or before you commit.',
                                icon: Zap,
                                gradient: 'from-orange-500/20 to-red-500/20',
                                text: 'text-orange-400'
                            },
                            {
                                title: 'Private Repos',
                                desc: 'Securely scan private GitHub, GitLab, and Bitbucket repositories.',
                                icon: Lock,
                                gradient: 'from-indigo-500/20 to-blue-500/20',
                                text: 'text-indigo-400'
                            },
                            {
                                title: 'Custom Patterns',
                                desc: 'Define your own regex patterns to catch internal company secrets.',
                                icon: Code2,
                                gradient: 'from-emerald-500/20 to-teal-500/20',
                                text: 'text-emerald-400'
                            },
                            {
                                title: 'Entropy Analysis',
                                desc: 'ML-powered engine detects high-entropy strings effectively.',
                                icon: BarChart3,
                                gradient: 'from-pink-500/20 to-rose-500/20',
                                text: 'text-pink-400'
                            },
                            {
                                title: 'History Scanning',
                                desc: 'Go back in time to find secrets buried in old commits.',
                                icon: GitBranch,
                                gradient: 'from-violet-500/20 to-purple-500/20',
                                text: 'text-violet-400'
                            },
                            {
                                title: 'Team Management',
                                desc: 'Centralized dashboard for security teams to monitor risk.',
                                icon: user => <Shield className="w-6 h-6" />,
                                gradient: 'from-cyan-500/20 to-sky-500/20',
                                text: 'text-cyan-400',
                                customIcon: true
                            }
                        ].map((feature, i) => (
                            <div
                                key={i}
                                className="group relative p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all duration-300 hover:-translate-y-1"
                            >
                                <div className={`
                  w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} 
                  flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300
                `}>
                                    {feature.customIcon ? <Shield className={`w-7 h-7 ${feature.text}`} /> : <feature.icon className={`w-7 h-7 ${feature.text}`} />}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>

                                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                                    <ArrowRight className={`w-5 h-5 ${feature.text}`} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6">
                <div className="max-w-5xl mx-auto relative rounded-[2.5rem] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600" />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

                    <div className="relative z-10 px-8 py-20 text-center">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            Ready to secure your codebase?
                        </h2>
                        <p className="text-indigo-100 text-lg mb-10 max-w-2xl mx-auto">
                            Join thousands of developers and security teams who sleep better at night.
                            Start for free, no credit card required.
                        </p>
                        <Link to="/dashboard">
                            <button className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-colors shadow-xl hover:shadow-2xl hover:scale-105 transform duration-200">
                                Get Started Now
                            </button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/10 bg-[#02040a] pt-16 pb-8 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        <div className="col-span-2">
                            <Link to="/" className="flex items-center gap-2 mb-4">
                                <Shield className="w-6 h-6 text-indigo-500" />
                                <span className="text-xl font-bold text-white">GitGuardian</span>
                            </Link>
                            <p className="text-slate-400 max-w-sm">
                                The standard for secret detection and remediation.
                                Built for developers, trusted by security teams.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-bold text-white mb-4">Product</h4>
                            <ul className="space-y-2 text-sm text-slate-400">
                                <li><a href="#" className="hover:text-indigo-400">Features</a></li>
                                <li><a href="#" className="hover:text-indigo-400">Integrations</a></li>
                                <li><a href="#" className="hover:text-indigo-400">Pricing</a></li>
                                <li><a href="#" className="hover:text-indigo-400">Changelog</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-white mb-4">Company</h4>
                            <ul className="space-y-2 text-sm text-slate-400">
                                <li><a href="#" className="hover:text-indigo-400">About</a></li>
                                <li><a href="#" className="hover:text-indigo-400">Blog</a></li>
                                <li><a href="#" className="hover:text-indigo-400">Careers</a></li>
                                <li><a href="#" className="hover:text-indigo-400">Contact</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
                        <div>© 2026 GitGuardian. All rights reserved.</div>
                        <div className="flex gap-6">
                            <a href="#" className="hover:text-white">Privacy Policy</a>
                            <a href="#" className="hover:text-white">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
