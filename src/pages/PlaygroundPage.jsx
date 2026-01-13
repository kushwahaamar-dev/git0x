import { useState, useEffect, useRef } from 'react';
import {
    ShieldCheck,
    ShieldAlert,
    SquareTerminal,
    Eraser,
    FileCode,
    MousePointerClick
} from 'lucide-react';
import { Button, Card, CardContent, SeverityBadge } from '../components/ui';
import { quickScan } from '../lib/scanner/engine';

const SAMPLE = `// Paste code here to test secret detection
const config = {
  // AWS credentials
  aws_access_key: "AKIAIOSFODNN7EXAMPLE",
  aws_secret: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
  
  // Database
  db_url: "mongodb://admin:password123@localhost:27017/myapp",
  
  // Stripe
  stripe_key: "sk_live_4eC39HqLyjWDarjtT1zdp7dc",
  
  // GitHub
  github_token: "ghp_1234567890abcdefghijklmnopqrstuvwxyz"
};`;

export default function PlaygroundPage() {
    const [code, setCode] = useState(SAMPLE);
    const [findings, setFindings] = useState([]);
    const debounce = useRef(null);
    const textareaRef = useRef(null);

    useEffect(() => {
        if (debounce.current) clearTimeout(debounce.current);
        debounce.current = setTimeout(() => setFindings(quickScan(code)), 100);
        return () => clearTimeout(debounce.current);
    }, [code]);

    const lineCount = code.split('\n').length;
    const findingLines = new Set(findings.map(f => f.line));

    return (
        <div className="flex h-full">
            {/* Editor panel */}
            <div className="flex-1 flex flex-col border-r border-[var(--color-border-subtle)]">
                {/* Toolbar */}
                <div className="h-12 px-4 flex items-center justify-between border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)]">
                    <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                        <SquareTerminal className="h-4 w-4" strokeWidth={1.5} />
                        <span>Code Editor</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-[var(--color-text-muted)]">{code.length} chars</span>
                        <Button variant="ghost" size="sm" onClick={() => setCode('')}>
                            <Eraser className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setCode(SAMPLE)}>
                            <FileCode className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </Button>
                    </div>
                </div>

                {/* Editor */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Line numbers */}
                    <div className="w-12 py-4 text-right pr-3 select-none bg-[var(--color-bg-subtle)] border-r border-[var(--color-border-subtle)] overflow-hidden">
                        {Array.from({ length: lineCount }, (_, i) => (
                            <div
                                key={i}
                                className={`text-xs leading-6 font-mono ${findingLines.has(i + 1)
                                    ? 'text-red-400 font-medium'
                                    : 'text-[var(--color-text-muted)]'
                                    }`}
                            >
                                {i + 1}
                            </div>
                        ))}
                    </div>

                    {/* Textarea */}
                    <textarea
                        ref={textareaRef}
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        spellCheck={false}
                        className="flex-1 p-4 bg-transparent font-mono text-sm leading-6 resize-none focus:outline-none text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]"
                        placeholder="Paste code here..."
                    />
                </div>
            </div>

            {/* Findings panel */}
            <div className="w-80 flex flex-col bg-[var(--color-bg-subtle)]">
                {/* Header */}
                <div className="h-12 px-4 flex items-center justify-between border-b border-[var(--color-border-subtle)]">
                    <span className="text-sm font-medium text-[var(--color-text)]">Findings</span>
                    <span className={`
            text-xs font-medium px-2 py-0.5 rounded-md
            ${findings.length > 0
                            ? 'bg-red-500/15 text-red-400'
                            : 'bg-emerald-500/15 text-emerald-400'
                        }
          `}>
                        {findings.length}
                    </span>
                </div>

                {/* List */}
                <div className="flex-1 overflow-auto p-3 space-y-2">
                    {findings.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-4">
                            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
                                <ShieldCheck className="h-6 w-6 text-emerald-400" strokeWidth={1.5} />
                            </div>
                            <p className="text-sm font-medium text-[var(--color-text)]">No secrets detected</p>
                            <p className="text-xs text-[var(--color-text-muted)] mt-1">
                                Paste code with secrets to test
                            </p>
                        </div>
                    ) : (
                        findings.map((f, i) => (
                            <button
                                key={i}
                                onClick={() => {
                                    const lines = code.split('\n');
                                    let pos = 0;
                                    for (let j = 0; j < f.line - 1; j++) pos += lines[j].length + 1;
                                    textareaRef.current?.focus();
                                    textareaRef.current?.setSelectionRange(pos, pos);
                                }}
                                className="w-full text-left p-3 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border)] transition-colors group"
                            >
                                <div className="flex items-center gap-2 mb-1.5">
                                    <SeverityBadge severity={f.severity} />
                                    <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                                        Line {f.line}
                                        <MousePointerClick className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </span>
                                </div>
                                <p className="text-sm font-medium text-[var(--color-text)] mb-1">{f.name}</p>
                                <code className="text-xs text-amber-400/80 font-mono block truncate">
                                    {f.match.substring(0, 40)}{f.match.length > 40 ? '...' : ''}
                                </code>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
