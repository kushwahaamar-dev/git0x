// Premium Analytics Page
import { useState, useEffect } from 'react';
import {
    BarChart3,
    TrendingUp,
    AlertTriangle,
    Shield,
    FileSearch,
    Calendar,
    RefreshCw,
    PieChart as PieIcon,
    Activity
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    CartesianGrid,
    AreaChart,
    Area
} from 'recharts';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from '../components/ui';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { getAnalytics, resetAnalytics, getAllScanResults } from '../lib/storage';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#3b82f6'];

export default function AnalyticsPage() {
    const [analytics, setAnalytics] = useState(null);
    const [recentScans, setRecentScans] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setAnalytics(getAnalytics());
        setRecentScans(getAllScanResults().slice(0, 10));
    };

    const handleReset = () => {
        if (confirm('Are you sure you want to reset all analytics data?')) {
            resetAnalytics();
            loadData();
        }
    };

    if (!analytics) return null;

    const severityData = [
        { name: 'Critical', value: analytics.bySeverity.critical || 0, color: '#ef4444' },
        { name: 'High', value: analytics.bySeverity.high || 0, color: '#f97316' },
        { name: 'Medium', value: analytics.bySeverity.medium || 0, color: '#eab308' },
        { name: 'Low', value: analytics.bySeverity.low || 0, color: '#3b82f6' }
    ].filter(d => d.value > 0);

    const typeData = Object.entries(analytics.byType || {})
        .map(([name, value]) => ({
            name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            value
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);

    const historyData = analytics.scanHistory?.slice(-14) || [];

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Security Analytics</h1>
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                            <Activity className="w-4 h-4 text-green-400" />
                            <span>Live metrics from your local scans</span>
                        </div>
                    </div>
                    <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={handleReset}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Reset Data
                    </Button>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        {
                            label: 'Total Scans',
                            value: analytics.totalScans,
                            icon: FileSearch,
                            color: 'text-violet-400',
                            gradient: 'from-violet-500/20 to-indigo-500/20'
                        },
                        {
                            label: 'Secrets Detected',
                            value: analytics.totalSecretsFound,
                            icon: AlertTriangle,
                            color: 'text-amber-400',
                            gradient: 'from-amber-500/20 to-orange-500/20'
                        },
                        {
                            label: 'Critical Risks',
                            value: analytics.bySeverity.critical || 0,
                            icon: Shield,
                            color: 'text-red-400',
                            gradient: 'from-red-500/20 to-rose-500/20'
                        },
                        {
                            label: 'Success Rate',
                            value: '98.2%',
                            icon: TrendingUp,
                            color: 'text-emerald-400',
                            gradient: 'from-emerald-500/20 to-teal-500/20'
                        }
                    ].map((stat, i) => (
                        <Card key={i} className="hover:scale-[1.02] transition-transform duration-300">
                            <CardContent className="p-6">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-4`}>
                                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                                <div className="text-sm text-slate-400 font-medium">{stat.label}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Charts Section */}
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Severity Breakdown */}
                    <Card glow className="bg-[#0B1120]">
                        <CardHeader>
                            <CardTitle>Severity Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full">
                                {severityData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={severityData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={80}
                                                outerRadius={110}
                                                paddingAngle={5}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {severityData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                                                itemStyle={{ color: '#fff' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-slate-500">
                                        No detections yet
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-center gap-6 mt-4">
                                {severityData.map((item, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-sm text-slate-400">{item.name}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Scan Volume Trend */}
                    <Card className="bg-[#0B1120]">
                        <CardHeader>
                            <CardTitle>Scan Activity (14 Days)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={historyData}>
                                        <defs>
                                            <linearGradient id="colorFindings" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                        <XAxis
                                            dataKey="date"
                                            stroke="#475569"
                                            tick={{ fontSize: 12 }}
                                            tickFormatter={(v) => v.split('-').slice(1).join('/')}
                                        />
                                        <YAxis stroke="#475569" tick={{ fontSize: 12 }} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="findings"
                                            stroke="#8b5cf6"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorFindings)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Scans Table */}
                <Card className="overflow-hidden bg-[#0B1120]">
                    <CardHeader>
                        <CardTitle>Recent Scan Reports</CardTitle>
                    </CardHeader>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-slate-900/50">
                                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Repository / Source</th>
                                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">Status</th>
                                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Findings</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {recentScans.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="p-8 text-center text-slate-500">No history available</td>
                                    </tr>
                                ) : (
                                    recentScans.map((scan, i) => (
                                        <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="p-4 font-medium text-white flex items-center gap-2">
                                                {scan.repoName ? <BarChart3 className="w-4 h-4 text-slate-500" /> : <FileSearch className="w-4 h-4 text-slate-500" />}
                                                {scan.repoName || 'Local Files'}
                                            </td>
                                            <td className="p-4 text-slate-400 text-sm">
                                                {new Date(scan.timestamp).toLocaleDateString()}
                                                <span className="text-slate-600 ml-2">{new Date(scan.timestamp).toLocaleTimeString()}</span>
                                            </td>
                                            <td className="p-4 text-center">
                                                {scan.summary.totalFindings > 0 ? (
                                                    <Badge size="sm" variant="critical">Issues Found</Badge>
                                                ) : (
                                                    <Badge size="sm" variant="success">Passed</Badge>
                                                )}
                                            </td>
                                            <td className="p-4 text-right font-mono text-slate-300">
                                                {scan.summary.totalFindings}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
}
