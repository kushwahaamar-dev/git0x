import { useState } from 'react';
import { Copy, Check, Download, Terminal, Info } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui';
import { generateHook } from '../lib/utils/codeGeneration';

const languages = [
    { id: 'nodejs', label: 'Node.js', icon: '⬢' },
    { id: 'python', label: 'Python', icon: '🐍' },
    { id: 'bash', label: 'Bash', icon: '$' },
];

export default function HooksPage() {
    const [lang, setLang] = useState('nodejs');
    const [options, setOptions] = useState({ blockCommit: true, showSuggestions: true });
    const [copied, setCopied] = useState(false);

    const code = generateHook(lang, options);

    const copy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const download = () => {
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'pre-commit';
        a.click();
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-[var(--color-text)] mb-2">Git Hooks</h1>
                <p className="text-[var(--color-text-muted)]">
                    Generate pre-commit hooks to prevent secrets from being committed.
                </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Configuration */}
                <div className="space-y-6">
                    {/* Language */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Runtime</CardTitle>
                            <CardDescription>Select your project environment</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-3">
                                {languages.map((l) => (
                                    <button
                                        key={l.id}
                                        onClick={() => setLang(l.id)}
                                        className={`
                      p-4 rounded-lg border text-center transition-all
                      ${lang === l.id
                                                ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-text)]'
                                                : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)] text-[var(--color-text-muted)]'
                                            }
                    `}
                                    >
                                        <span className="text-2xl block mb-1">{l.icon}</span>
                                        <span className="text-sm font-medium">{l.label}</span>
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Options */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Behavior</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={options.blockCommit}
                                    onChange={(e) => setOptions({ ...options, blockCommit: e.target.checked })}
                                    className="mt-0.5 rounded border-[var(--color-border)] bg-[var(--color-bg-muted)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                                />
                                <div>
                                    <p className="text-sm font-medium text-[var(--color-text)] group-hover:text-[var(--color-text)]">Block commits</p>
                                    <p className="text-xs text-[var(--color-text-muted)]">Prevent commits containing secrets</p>
                                </div>
                            </label>

                            <label className="flex items-start gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={options.showSuggestions}
                                    onChange={(e) => setOptions({ ...options, showSuggestions: e.target.checked })}
                                    className="mt-0.5 rounded border-[var(--color-border)] bg-[var(--color-bg-muted)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                                />
                                <div>
                                    <p className="text-sm font-medium text-[var(--color-text)] group-hover:text-[var(--color-text)]">Show suggestions</p>
                                    <p className="text-xs text-[var(--color-text-muted)]">Display remediation tips in terminal</p>
                                </div>
                            </label>
                        </CardContent>
                    </Card>

                    {/* Installation */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Info className="h-4 w-4 text-[var(--color-text-muted)]" />
                                Installation
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <pre className="bg-[var(--color-bg)] p-4 rounded-lg text-sm font-mono text-[var(--color-text-secondary)] overflow-x-auto">
                                {`cd your-project
mkdir -p .git/hooks
# Save script as .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit`}
                            </pre>
                        </CardContent>
                    </Card>
                </div>

                {/* Generated code */}
                <Card className="flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Generated Hook</CardTitle>
                            <CardDescription>pre-commit</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={copy}>
                                {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={download}>
                                <Download className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-0">
                        <div className="h-full max-h-[500px] overflow-auto bg-[var(--color-bg)] rounded-lg p-4">
                            <pre className="text-xs font-mono text-[var(--color-text-secondary)] whitespace-pre">
                                {code}
                            </pre>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
