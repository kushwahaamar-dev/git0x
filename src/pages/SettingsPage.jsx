import { useState, useEffect } from 'react';
import {
    Save,
    Check,
    Trash2,
    Download,
    SlidersHorizontal,
    Database,
    Loader2,
    BarChart3,
    ScanSearch,
    ShieldAlert,
    Sparkles
} from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription, Label } from '../components/ui';
import { getSettings, saveSettings, exportData, clearAllData, getAnalytics } from '../lib/storage';

export default function SettingsPage() {
    const [settings, setSettings] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getSettings(), getAnalytics()])
            .then(([s, a]) => { setSettings(s); setAnalytics(a); })
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        await saveSettings(settings);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleExport = async () => {
        const data = await exportData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gitguardian-export-${Date.now()}.json`;
        a.click();
    };

    const handleClear = async () => {
        if (confirm('This will delete all scan history and settings. Continue?')) {
            await clearAllData();
            const s = await getSettings();
            setSettings(s);
            setAnalytics({ totalScans: 0, totalFindings: 0, bySeverity: {} });
        }
    };

    if (loading || !settings) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-6 w-6 animate-spin text-[var(--color-text-muted)]" />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <div className="mb-8">
                <h1 className="text-xl font-semibold text-[var(--color-text)] mb-1">Settings</h1>
                <p className="text-sm text-[var(--color-text-muted)]">Configure scanner behavior and manage data</p>
            </div>

            <div className="space-y-5">
                {/* Scanner settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <SlidersHorizontal className="h-4 w-4 text-[var(--color-text-muted)]" strokeWidth={1.5} />
                            Scanner Configuration
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <Label>Confidence threshold</Label>
                                <span className="text-sm font-mono font-medium text-[var(--color-accent)]">{settings.minConfidence}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="10"
                                value={settings.minConfidence}
                                onChange={(e) => setSettings({ ...settings, minConfidence: parseInt(e.target.value) })}
                                className="w-full h-1.5 bg-[var(--color-bg-muted)] rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none 
                  [&::-webkit-slider-thumb]:w-4 
                  [&::-webkit-slider-thumb]:h-4 
                  [&::-webkit-slider-thumb]:bg-[var(--color-accent)] 
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-webkit-slider-thumb]:shadow-lg
                  [&::-webkit-slider-thumb]:shadow-[var(--color-accent)]/20"
                            />
                            <div className="flex justify-between mt-2 text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide">
                                <span>More sensitive</span>
                                <span>Fewer false positives</span>
                            </div>
                        </div>

                        <label className="flex items-start gap-3 p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border-subtle)] cursor-pointer hover:border-[var(--color-border)] transition-colors">
                            <input
                                type="checkbox"
                                checked={settings.enableEntropy}
                                onChange={(e) => setSettings({ ...settings, enableEntropy: e.target.checked })}
                                className="mt-0.5 rounded border-[var(--color-border)] bg-[var(--color-bg-muted)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                            />
                            <div>
                                <p className="text-sm font-medium text-[var(--color-text)] flex items-center gap-1.5">
                                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                                    Entropy analysis
                                </p>
                                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                                    Detect high-randomness strings like passwords and generated keys
                                </p>
                            </div>
                        </label>

                        <Button onClick={handleSave}>
                            {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" strokeWidth={1.5} />}
                            {saved ? 'Saved' : 'Save changes'}
                        </Button>
                    </CardContent>
                </Card>

                {/* Stats */}
                {analytics && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-4 w-4 text-[var(--color-text-muted)]" strokeWidth={1.5} />
                                Usage Statistics
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border-subtle)] text-center">
                                    <ScanSearch className="h-5 w-5 text-blue-400 mx-auto mb-2" strokeWidth={1.5} />
                                    <p className="text-xl font-semibold text-[var(--color-text)]">{analytics.totalScans}</p>
                                    <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide">Total scans</p>
                                </div>
                                <div className="p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border-subtle)] text-center">
                                    <ShieldAlert className="h-5 w-5 text-amber-400 mx-auto mb-2" strokeWidth={1.5} />
                                    <p className="text-xl font-semibold text-[var(--color-text)]">{analytics.totalFindings}</p>
                                    <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide">Findings</p>
                                </div>
                                <div className="p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border-subtle)] text-center">
                                    <ShieldAlert className="h-5 w-5 text-red-400 mx-auto mb-2" strokeWidth={1.5} />
                                    <p className="text-xl font-semibold text-red-400">{analytics.bySeverity?.critical || 0}</p>
                                    <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide">Critical</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Data management */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="h-4 w-4 text-[var(--color-text-muted)]" strokeWidth={1.5} />
                            Data Management
                        </CardTitle>
                        <CardDescription>Export or clear your local data (stored in IndexedDB)</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button variant="secondary" onClick={handleExport} className="w-full">
                            <Download className="h-4 w-4" strokeWidth={1.5} />
                            Export all data
                        </Button>

                        <div className="h-px bg-[var(--color-border-subtle)]" />

                        <Button variant="destructive" onClick={handleClear} className="w-full">
                            <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                            Clear all data
                        </Button>
                    </CardContent>
                </Card>

                <div className="text-center py-4 text-[var(--color-text-muted)]">
                    <p className="text-xs">All scans run in a Web Worker. Data stored locally in IndexedDB.</p>
                </div>
            </div>
        </div>
    );
}
