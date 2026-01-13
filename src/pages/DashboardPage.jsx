// Premium Dashboard Home
import { Link } from 'react-router-dom';
import {
    Shield,
    AlertTriangle,
    FileSearch,
    Terminal,
    ArrowRight,
    Clock,
    Github,
    CheckCircle2,
    TrendingUp
} from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '../components/ui';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { getRecentScans, getAnalytics } from '../lib/storage';

export default function DashboardPage() {
    const recentScans = getRecentScans();
    const analytics = getAnalytics();

    // Safe stats
    const stats = {
        totalScans: analytics?.totalScans || 0,
        criticalFound: analytics?.bySeverity?.critical || 0,
        secretsFound: analytics?.totalSecretsFound || 0
    };

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-fade-in">
                {/* Welcome Section with Gradient */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 to-indigo-600 p-8 shadow-2xl shadow-indigo-500/20">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
                    <div className="relative z-10">
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Welcome back, Developer
                        </h1>
                        <p className="text-indigo-100 max-w-xl text-lg mb-6">
                            Your codebase is currently <span className="font-bold text-white">mostly secure</span>.
                            You performed {stats.totalScans} scans finding {stats.secretsFound} potential leaks.
                        </p>
                        <div className="flex gap-4">
                            <Link to="/dashboard/scan">
                                <button className="px-6 py-2.5 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg">
                                    Start New Scan
                                </button>
                            </Link>
                            <Link to="/dashboard/hooks">
                                <button className="px-6 py-2.5 bg-indigo-700/50 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors border border-indigo-400/30">
                                    Configure Hooks
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Quick Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card hover glow className="bg-gradient-to-br from-slate-900 to-slate-900 border-l-4 border-l-purple-500">
                        <CardContent className="flex items-center justify-between p-6">
                            <div>
                                <p className="text-slate-400 font-medium text-sm">Total Scans</p>
                                <h3 className="text-3xl font-bold text-white mt-1">{stats.totalScans}</h3>
                                <div className="flex items-center gap-1 text-emerald-400 text-xs mt-2 font-medium">
                                    <TrendingUp className="w-3 h-3" />
                                    <span>+12% vs last week</span>
                                </div>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                <FileSearch className="w-6 h-6 text-purple-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card hover glow className="bg-gradient-to-br from-slate-900 to-slate-900 border-l-4 border-l-amber-500">
                        <CardContent className="flex items-center justify-between p-6">
                            <div>
                                <p className="text-slate-400 font-medium text-sm">Secrets Found</p>
                                <h3 className="text-3xl font-bold text-white mt-1">{stats.secretsFound}</h3>
                                <div className="flex items-center gap-1 text-slate-500 text-xs mt-2">
                                    <span>Across {stats.totalScans} repositories</span>
                                </div>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-amber-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card hover glow className="bg-gradient-to-br from-slate-900 to-slate-900 border-l-4 border-l-emerald-500">
                        <CardContent className="flex items-center justify-between p-6">
                            <div>
                                <p className="text-slate-400 font-medium text-sm">Security Score</p>
                                <h3 className="text-3xl font-bold text-white mt-1">A+</h3>
                                <div className="flex items-center gap-1 text-emerald-400 text-xs mt-2 font-medium">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>System optimal</span>
                                </div>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                <Shield className="w-6 h-6 text-emerald-400" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity */}
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Recent Scans */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">Recent Scans</h2>
                            <Link to="/dashboard/scan" className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">
                                View All
                            </Link>
                        </div>

                        <div className="space-y-3">
                            {recentScans.length === 0 ? (
                                <Card className="border-dashed border-2 bg-transparent">
                                    <CardContent className="text-center py-12">
                                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <FileSearch className="w-8 h-8 text-slate-500" />
                                        </div>
                                        <h3 className="text-lg font-medium text-white mb-1">No scans yet</h3>
                                        <p className="text-slate-400 text-sm mb-4">Start your first scan to see results here</p>
                                        <Link to="/dashboard/scan">
                                            <Button variant="secondary" size="sm">Scan Now</Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            ) : (
                                recentScans.slice(0, 4).map((scan, i) => (
                                    <Link key={i} to="/dashboard/results" state={{ scanResult: scan }} className="block">
                                        <Card hover className="group transition-all">
                                            <div className="p-4 flex items-center gap-4">
                                                <div className={`
                          w-10 h-10 rounded-lg flex items-center justify-center
                          ${scan.summary.totalFindings > 0 ? 'bg-amber-500/10 text-amber-400' : 'bg-green-500/10 text-green-400'}
                        `}>
                                                    {scan.summary.totalFindings > 0 ? <AlertTriangle className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h4 className="font-medium text-white truncate pr-4 group-hover:text-indigo-400 transition-colors">
                                                            {scan.repoName || 'Local Scan'}
                                                        </h4>
                                                        <span className="text-xs text-slate-500 flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {new Date(scan.timestamp).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs text-slate-400">
                                                        <span>{scan.summary.scannedFiles} files</span>
                                                        <span className="w-1 h-1 rounded-full bg-slate-700" />
                                                        <span className={scan.summary.totalFindings > 0 ? 'text-amber-400 font-medium' : 'text-green-400'}>
                                                            {scan.summary.totalFindings} findings
                                                        </span>
                                                    </div>
                                                </div>

                                                <ChevronIcon className="w-5 h-5 text-slate-600 group-hover:text-slate-300" />
                                            </div>
                                        </Card>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-white">Quick Actions</h2>
                        <div className="grid gap-4">
                            <Link to="/playground">
                                <Card hover className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border-blue-500/20 group">
                                    <div className="p-5 flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Terminal className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">Live Playground</h3>
                                            <p className="text-sm text-slate-400 mt-1">Test regex patterns and entropy analysis in real-time on code snippets.</p>
                                        </div>
                                    </div>
                                </Card>
                            </Link>

                            <Link to="/dashboard/hooks">
                                <Card hover className="bg-gradient-to-r from-violet-900/20 to-purple-900/20 border-violet-500/20 group">
                                    <div className="p-5 flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Github className="w-6 h-6 text-violet-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white group-hover:text-violet-400 transition-colors">Generate Git Hooks</h3>
                                            <p className="text-sm text-slate-400 mt-1">Create pre-commit hooks for Node.js, Python, or Bash to block secrets locally.</p>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

function ChevronIcon({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
    );
}
