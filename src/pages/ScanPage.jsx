import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Github,
    FolderUp,
    ArrowRight,
    Loader2,
    AlertCircle,
    FileCode2,
    Gauge,
    Cpu,
    Fingerprint
} from 'lucide-react';
import { Button, Card, CardContent, Input } from '../components/ui';

export default function ScanPage() {
    const navigate = useNavigate();
    const [url, setUrl] = useState('');
    const [scanning, setScanning] = useState(false);
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');
    const [dragActive, setDragActive] = useState(false);

    const handleGitHubScan = async () => {
        if (!url.trim()) return;

        setError('');
        setScanning(true);
        setStatus('Fetching repository...');

        try {
            const { scanGitHubRepo } = await import('../lib/github/api');
            const { scanFiles } = await import('../lib/scanner/client');
            const { saveScanResult, updateAnalytics } = await import('../lib/storage');

            const repoData = await scanGitHubRepo(url, (p) => setStatus(p.message));
            setStatus('Scanning files (background thread)...');

            const results = await scanFiles(repoData.files, {}, (progress) => {
                setStatus(`Scanning ${progress.file}...`);
            });

            const saved = await saveScanResult({
                repoName: repoData.repoInfo.fullName,
                repoUrl: url,
                findings: results.findings,
                summary: results.summary,
            });

            await updateAnalytics(results);

            navigate('/results', { state: { result: saved } });
        } catch (err) {
            setError(err.message);
            setScanning(false);
        }
    };

    const handleFiles = useCallback(async (files) => {
        if (!files?.length) return;

        setError('');
        setScanning(true);
        setStatus('Reading files...');

        try {
            const { scanFiles } = await import('../lib/scanner/client');
            const { saveScanResult, updateAnalytics } = await import('../lib/storage');

            const contents = await Promise.all(
                Array.from(files).map(async (f) => ({
                    name: f.name,
                    content: await f.text()
                }))
            );

            setStatus('Scanning (background thread)...');

            const results = await scanFiles(contents, {}, (progress) => {
                setStatus(`Scanning ${progress.file}...`);
            });

            const saved = await saveScanResult({
                repoName: files.length === 1 ? files[0].name : `${files.length} files`,
                findings: results.findings,
                summary: results.summary,
            });

            await updateAnalytics(results);

            navigate('/results', { state: { result: saved } });
        } catch (err) {
            setError(err.message);
            setScanning(false);
        }
    }, [navigate]);

    return (
        <div className="p-8 max-w-3xl mx-auto">
            <div className="mb-10">
                <h1 className="text-2xl font-semibold text-[var(--color-text)] mb-2">
                    Scan for secrets
                </h1>
                <p className="text-[var(--color-text-muted)] text-sm">
                    Analyze repositories or files for exposed API keys, tokens, and credentials.
                </p>
            </div>

            {/* GitHub URL */}
            <Card className="mb-5">
                <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 flex items-center justify-center">
                            <Github className="h-5 w-5 text-zinc-300" strokeWidth={1.5} />
                        </div>
                        <div>
                            <h2 className="font-medium text-[var(--color-text)] text-sm">GitHub Repository</h2>
                            <p className="text-xs text-[var(--color-text-muted)]">Public repositories only</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Input
                            placeholder="https://github.com/owner/repository"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            disabled={scanning}
                            className="flex-1"
                        />
                        <Button onClick={handleGitHubScan} disabled={scanning || !url.trim()}>
                            {scanning ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    Scan
                                    <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </div>

                    {status && scanning && (
                        <div className="mt-4 flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            {status}
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 flex items-center gap-2 text-sm text-[var(--color-error)]">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* File Upload */}
            <Card>
                <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-900/50 to-blue-950 border border-blue-800/50 flex items-center justify-center">
                            <FileCode2 className="h-5 w-5 text-blue-400" strokeWidth={1.5} />
                        </div>
                        <div>
                            <h2 className="font-medium text-[var(--color-text)] text-sm">Upload Files</h2>
                            <p className="text-xs text-[var(--color-text-muted)]">Drag and drop or click to select</p>
                        </div>
                    </div>

                    <div
                        className={`
              relative border-2 border-dashed rounded-xl p-8 text-center
              transition-all duration-200 cursor-pointer
              ${dragActive
                                ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/5'
                                : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)] hover:bg-[var(--color-bg-muted)]'
                            }
            `}
                        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                        onDragLeave={() => setDragActive(false)}
                        onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFiles(e.dataTransfer.files); }}
                        onClick={() => document.getElementById('file-input').click()}
                    >
                        <input
                            id="file-input"
                            type="file"
                            multiple
                            className="hidden"
                            onChange={(e) => handleFiles(e.target.files)}
                        />
                        <FolderUp className="h-8 w-8 mx-auto mb-3 text-[var(--color-text-muted)]" strokeWidth={1.5} />
                        <p className="text-sm text-[var(--color-text-secondary)]">
                            Drop files here or <span className="text-[var(--color-accent)]">browse</span>
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)] mt-1">
                            .js, .ts, .py, .env, .json, .yml and more
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Quick stats */}
            <div className="mt-8 grid grid-cols-3 gap-4">
                {[
                    { label: 'Detection Patterns', value: '30+', icon: Fingerprint, color: 'text-violet-400' },
                    { label: 'File Types', value: '50+', icon: FileCode2, color: 'text-blue-400' },
                    { label: 'Processing', value: 'Off-thread', icon: Cpu, color: 'text-emerald-400' },
                ].map((stat, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-3 p-4 rounded-xl bg-[var(--color-bg-subtle)] border border-[var(--color-border-subtle)]"
                    >
                        <stat.icon className={`h-5 w-5 ${stat.color}`} strokeWidth={1.5} />
                        <div>
                            <p className="text-sm font-semibold text-[var(--color-text)]">{stat.value}</p>
                            <p className="text-[10px] text-[var(--color-text-muted)]">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
