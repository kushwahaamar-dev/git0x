import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import {
    ArrowLeft, ChevronDown, ChevronRight, Copy, Check,
    FileCode, Shield, AlertTriangle, Download, ExternalLink
} from 'lucide-react';
import { Button, Card, CardContent, Badge, SeverityBadge } from '../components/ui';

function StatCard({ label, value, variant = 'default' }) {
    const colors = {
        default: 'text-[var(--color-text)]',
        critical: 'text-red-400',
        high: 'text-orange-400',
        medium: 'text-yellow-400',
        low: 'text-blue-400',
        success: 'text-green-400'
    };

    return (
        <div className="p-4 rounded-lg bg-[var(--color-bg-subtle)] border border-[var(--color-border-subtle)]">
            <p className={`text-2xl font-semibold ${colors[variant]}`}>{value}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">{label}</p>
        </div>
    );
}

function Finding({ finding }) {
    const [expanded, setExpanded] = useState(false);
    const [copied, setCopied] = useState(false);

    const copy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="border border-[var(--color-border-subtle)] rounded-lg overflow-hidden bg-[var(--color-bg-subtle)]">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full p-4 flex items-start gap-4 text-left hover:bg-[var(--color-bg-muted)] transition-colors"
            >
                <div className="pt-0.5 text-[var(--color-text-muted)]">
                    {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <SeverityBadge severity={finding.severity} />
                        <span className="font-medium text-[var(--color-text)]">{finding.name}</span>
                    </div>
                    <div className="text-sm text-[var(--color-text-muted)] flex items-center gap-2">
                        <FileCode className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{finding.file}</span>
                        <span className="text-[var(--color-border)]">•</span>
                        <span>Line {finding.line}</span>
                        <span className="text-[var(--color-border)]">•</span>
                        <span>{finding.confidence}% confidence</span>
                    </div>
                </div>
            </button>

            {expanded && (
                <div className="px-4 pb-4 space-y-4 border-t border-[var(--color-border-subtle)]">
                    <div className="pt-4">
                        <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide mb-2">Context</p>
                        <pre className="bg-[var(--color-bg)] p-3 rounded-lg text-sm overflow-x-auto font-mono">
                            <code className="text-[var(--color-text-secondary)]">{finding.context}</code>
                        </pre>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide mb-2">Detected Value</p>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 bg-[var(--color-bg)] px-3 py-2 rounded text-sm font-mono text-[var(--color-warning)] truncate">
                                    {finding.masked}
                                </code>
                                <Button variant="ghost" size="icon" onClick={() => copy(finding.masked)}>
                                    {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>

                        {finding.remediation && (
                            <div>
                                <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide mb-2">Remediation</p>
                                <p className="text-sm text-[var(--color-text-secondary)] bg-[var(--color-bg)] p-3 rounded-lg">
                                    {finding.remediation}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ResultsPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const result = location.state?.result;

    if (!result) {
        return (
            <div className="p-8 text-center">
                <p className="text-[var(--color-text-muted)] mb-4">No results to display</p>
                <Link to="/scan">
                    <Button>Start a scan</Button>
                </Link>
            </div>
        );
    }

    const { findings, summary, repoName, repoUrl } = result;
    const grouped = findings.reduce((acc, f) => {
        (acc[f.severity] = acc[f.severity] || []).push(f);
        return acc;
    }, {});

    const downloadReport = () => {
        const report = JSON.stringify({ ...result, exportedAt: new Date().toISOString() }, null, 2);
        const blob = new Blob([report], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `scan-report-${Date.now()}.json`;
        a.click();
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
                <div>
                    <button
                        onClick={() => navigate('/scan')}
                        className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors mb-3"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to scan
                    </button>

                    <h1 className="text-xl font-semibold text-[var(--color-text)] flex items-center gap-2">
                        {repoName || 'Scan Results'}
                        {repoUrl && (
                            <a href={repoUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                                <ExternalLink className="h-4 w-4" />
                            </a>
                        )}
                    </h1>
                    <p className="text-sm text-[var(--color-text-muted)] mt-1">
                        {summary?.scannedFiles || 0} files scanned • {new Date(result.timestamp).toLocaleString()}
                    </p>
                </div>

                <Button variant="secondary" size="sm" onClick={downloadReport}>
                    <Download className="h-4 w-4" />
                    Export
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-5 gap-3 mb-8">
                <StatCard label="Total findings" value={findings.length} />
                <StatCard label="Critical" value={grouped.critical?.length || 0} variant="critical" />
                <StatCard label="High" value={grouped.high?.length || 0} variant="high" />
                <StatCard label="Medium" value={grouped.medium?.length || 0} variant="medium" />
                <StatCard label="Low" value={grouped.low?.length || 0} variant="low" />
            </div>

            {/* Findings */}
            {findings.length === 0 ? (
                <Card>
                    <CardContent className="py-16 text-center">
                        <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                            <Shield className="h-6 w-6 text-green-400" />
                        </div>
                        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-1">All clear</h2>
                        <p className="text-sm text-[var(--color-text-muted)]">No secrets detected in this scan</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {['critical', 'high', 'medium', 'low'].map((sev) => {
                        const items = grouped[sev];
                        if (!items?.length) return null;

                        return (
                            <div key={sev}>
                                <h3 className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)] mb-3 flex items-center gap-2">
                                    <AlertTriangle className="h-3.5 w-3.5" />
                                    {sev} severity • {items.length} {items.length === 1 ? 'finding' : 'findings'}
                                </h3>
                                <div className="space-y-2">
                                    {items.map((f, i) => <Finding key={i} finding={f} />)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
