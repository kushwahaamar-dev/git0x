import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    ExternalLink,
    ShieldCheck,
    ShieldAlert,
    CalendarDays,
    FileStack,
    Loader2,
    FolderSearch
} from 'lucide-react';
import { Button, Card, CardContent, Badge } from '../components/ui';
import { getAllScanResults } from '../lib/storage';

export default function HistoryPage() {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAllScanResults()
            .then(setResults)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-6 w-6 animate-spin text-[var(--color-text-muted)]" />
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-xl font-semibold text-[var(--color-text)] mb-1">Scan History</h1>
                    <p className="text-sm text-[var(--color-text-muted)]">
                        {results.length} {results.length === 1 ? 'scan' : 'scans'} recorded
                    </p>
                </div>
                <Link to="/scan">
                    <Button>New Scan</Button>
                </Link>
            </div>

            {results.length === 0 ? (
                <Card>
                    <CardContent className="py-16 text-center">
                        <div className="h-14 w-14 rounded-2xl bg-[var(--color-bg-muted)] flex items-center justify-center mx-auto mb-4">
                            <FolderSearch className="h-7 w-7 text-[var(--color-text-muted)]" strokeWidth={1.5} />
                        </div>
                        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-1">No scans yet</h2>
                        <p className="text-sm text-[var(--color-text-muted)] mb-5">Run your first scan to see results here</p>
                        <Link to="/scan">
                            <Button>Start scanning</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-2">
                    {results.map((result, i) => (
                        <Link
                            key={result.id || i}
                            to="/results"
                            state={{ result }}
                            className="block"
                        >
                            <Card className="hover:border-[var(--color-border)] transition-colors">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className={`
                    h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0
                    ${result.summary?.totalFindings > 0
                                            ? 'bg-red-500/10 border border-red-500/20'
                                            : 'bg-emerald-500/10 border border-emerald-500/20'
                                        }
                  `}>
                                        {result.summary?.totalFindings > 0
                                            ? <ShieldAlert className="h-5 w-5 text-red-400" strokeWidth={1.5} />
                                            : <ShieldCheck className="h-5 w-5 text-emerald-400" strokeWidth={1.5} />
                                        }
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-[var(--color-text)] text-sm truncate">
                                            {result.repoName || 'Unknown source'}
                                        </p>
                                        <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)] mt-1">
                                            <span className="flex items-center gap-1">
                                                <CalendarDays className="h-3 w-3" />
                                                {new Date(result.timestamp).toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <FileStack className="h-3 w-3" />
                                                {result.summary?.scannedFiles || 0} files
                                            </span>
                                        </div>
                                    </div>

                                    {result.summary?.totalFindings > 0 ? (
                                        <Badge variant="critical">
                                            {result.summary.totalFindings} {result.summary.totalFindings === 1 ? 'finding' : 'findings'}
                                        </Badge>
                                    ) : (
                                        <Badge variant="success">Clean</Badge>
                                    )}

                                    <ExternalLink className="h-4 w-4 text-[var(--color-text-muted)]" />
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
