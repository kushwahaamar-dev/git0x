/**
 * Advanced Secret Scanner Engine
 * Multi-layer pipeline: Pattern Matching → Context Analysis → FP Filtering → Entropy Fallback
 */

import { SECRET_PATTERNS } from './patterns.js';
import { calculateEntropy, findEntropySecrets } from './entropy.js';
import { isFalsePositive, getFalsePositiveReason } from './filters.js';
import { analyzeContext, isSecretVariableName } from './context.js';

/**
 * Get line number from character index
 */
function getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
}

/**
 * Get line content by line number
 */
function getLineContent(content, lineNumber) {
    const lines = content.split('\n');
    return lines[lineNumber - 1] || '';
}

/**
 * Mask secret for display
 */
export function maskSecret(secret, visibleChars = 4) {
    if (!secret || secret.length <= visibleChars * 2) {
        return '*'.repeat(secret?.length || 0);
    }
    const start = secret.substring(0, visibleChars);
    const end = secret.substring(secret.length - visibleChars);
    return `${start}${'*'.repeat(Math.min(16, secret.length - visibleChars * 2))}${end}`;
}

/**
 * Check if file should be scanned
 */
export function isScannableFile(filename) {
    const scannable = [
        '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs',
        '.py', '.pyw', '.rb', '.php', '.java', '.go', '.rs', '.swift', '.kt',
        '.env', '.yml', '.yaml', '.json', '.xml', '.toml', '.ini', '.cfg',
        '.sh', '.bash', '.zsh', '.ps1',
        '.sql', '.tf', '.tfvars',
        '.dockerfile', 'dockerfile',
        '.md', '.txt', '.conf', '.properties'
    ];

    const skip = [
        'node_modules', 'vendor', '.git', 'dist', 'build', '__pycache__',
        '.min.js', '.min.css', '.map', 'package-lock.json', 'yarn.lock'
    ];

    if (skip.some(s => filename.toLowerCase().includes(s))) return false;
    return scannable.some(ext => filename.toLowerCase().endsWith(ext));
}

/**
 * Calculate confidence score based on multiple signals
 */
function calculateConfidence(config, context, entropy, match) {
    let confidence = 0;

    // Pattern match quality (base)
    confidence += 45;

    // Pattern-specific boost
    if (config.severity === 'critical') confidence += 10;
    if (config.validate && config.validate(match)) confidence += 15;

    // Context signals
    confidence += context.confidenceModifier; // -50 to +50

    // Entropy boost
    if (entropy > 5.0) confidence += 10;
    else if (entropy > 4.0) confidence += 5;

    return Math.max(0, Math.min(100, confidence));
}

/**
 * Main scanning function - multi-layer pipeline
 */
export async function scanContent(content, filename = 'unknown', options = {}) {
    const findings = [];
    const seenMatches = new Set();

    const {
        enablePatterns = true,
        enableEntropy = true,
        minConfidence = 40,
    } = options;

    // ========== LAYER 1: Pattern Matching ==========
    if (enablePatterns) {
        for (const [patternKey, config] of Object.entries(SECRET_PATTERNS)) {
            config.pattern.lastIndex = 0;

            let match;
            while ((match = config.pattern.exec(content)) !== null) {
                // Extract the actual secret (may be in a capture group)
                const matchStr = config.extractGroup
                    ? (match[config.extractGroup] || match[0])
                    : match[0];

                // Dedup
                const key = `${patternKey}:${match.index}:${matchStr}`;
                if (seenMatches.has(key)) continue;
                seenMatches.add(key);

                // ========== LAYER 2: False Positive Filter ==========
                if (isFalsePositive(matchStr)) {
                    continue;
                }

                // ========== LAYER 3: Context Analysis ==========
                const context = analyzeContext(content, matchStr, match.index, filename);

                // Check context requirements
                if (config.contextRequired) {
                    const hasRequired = config.contextRequired.some(kw =>
                        context.hasNearbyKeywords ||
                        context.line.toLowerCase().includes(kw)
                    );
                    if (!hasRequired) continue;
                }

                // ========== LAYER 4: Pattern Validation ==========
                if (config.validate && !config.validate(matchStr)) {
                    continue;
                }

                // ========== LAYER 5: Confidence Scoring ==========
                const entropy = calculateEntropy(matchStr);
                const confidence = calculateConfidence(config, context, entropy, matchStr);

                if (confidence < minConfidence) continue;

                const lineNumber = getLineNumber(content, match.index);

                findings.push({
                    id: `${filename}:${lineNumber}:${patternKey}`,
                    type: patternKey,
                    severity: config.severity,
                    name: config.name,
                    description: config.description,
                    remediation: config.remediation,
                    file: filename,
                    line: lineNumber,
                    match: matchStr,
                    masked: maskSecret(matchStr),
                    context: context.line,
                    entropy: Math.round(entropy * 100) / 100,
                    confidence,
                    signals: {
                        pattern: true,
                        contextKeywords: context.hasNearbyKeywords,
                        secretVariable: context.isSecretVariable,
                        inComment: context.isInComment,
                        testFile: context.isTestFile,
                    },
                    timestamp: new Date().toISOString(),
                });
            }
        }
    }

    // ========== LAYER 6: Entropy-based Detection (Fallback) ==========
    if (enableEntropy) {
        const entropyFindings = findEntropySecrets(content, filename);

        for (const ef of entropyFindings) {
            // Skip if already found by pattern matching
            const alreadyFound = findings.some(f =>
                f.match === ef.match ||
                f.match.includes(ef.match) ||
                ef.match.includes(f.match)
            );
            if (alreadyFound) continue;

            // Extra FP check for entropy findings
            if (isFalsePositive(ef.match)) continue;

            // Context analysis
            const context = analyzeContext(content, ef.match, ef.index, filename);

            // Skip if in test file or comment (stricter for entropy)
            if (context.isTestFile || context.isInComment) continue;

            // Require STRONG context for entropy findings
            if (!context.isSecretVariable && !context.hasNearbyKeywords) continue;

            // Adjust confidence based on context
            let confidence = ef.confidence + context.confidenceModifier;
            confidence = Math.max(0, Math.min(100, confidence));

            if (confidence < minConfidence) continue;

            findings.push({
                id: `${filename}:${ef.line}:entropy`,
                type: 'high_entropy',
                severity: confidence >= 70 ? 'high' : 'medium',
                name: 'High Entropy String',
                description: 'Detected high-randomness string near secret-related keywords.',
                remediation: 'Verify if this is a secret. If so, move to environment variables.',
                file: filename,
                line: ef.line,
                match: ef.match,
                masked: maskSecret(ef.match),
                context: context.line,
                entropy: Math.round(ef.entropy * 100) / 100,
                confidence,
                signals: {
                    pattern: false,
                    entropy: true,
                    contextKeywords: context.hasNearbyKeywords,
                    secretVariable: context.isSecretVariable,
                },
                timestamp: new Date().toISOString(),
            });
        }
    }

    // Sort by severity then line number
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    findings.sort((a, b) => {
        const sevDiff = severityOrder[a.severity] - severityOrder[b.severity];
        return sevDiff !== 0 ? sevDiff : a.line - b.line;
    });

    return findings;
}

/**
 * Scan multiple files
 */
export async function scanFiles(files, options = {}, onProgress = null) {
    const allFindings = [];
    let scanned = 0;

    for (const file of files) {
        if (!isScannableFile(file.name)) continue;

        const findings = await scanContent(file.content, file.name, options);
        allFindings.push(...findings);
        scanned++;

        onProgress?.({
            current: scanned,
            total: files.length,
            file: file.name,
            findingsCount: findings.length,
        });
    }

    const summary = {
        totalFiles: files.length,
        scannedFiles: scanned,
        skippedFiles: files.length - scanned,
        totalFindings: allFindings.length,
        bySeverity: {
            critical: allFindings.filter(f => f.severity === 'critical').length,
            high: allFindings.filter(f => f.severity === 'high').length,
            medium: allFindings.filter(f => f.severity === 'medium').length,
            low: allFindings.filter(f => f.severity === 'low').length,
        },
        byType: allFindings.reduce((acc, f) => {
            acc[f.type] = (acc[f.type] || 0) + 1;
            return acc;
        }, {}),
        timestamp: new Date().toISOString(),
    };

    return { findings: allFindings, summary };
}

/**
 * Quick scan for real-time editor (optimized, no entropy)
 */
export function quickScan(content) {
    const findings = [];

    for (const [patternKey, config] of Object.entries(SECRET_PATTERNS)) {
        config.pattern.lastIndex = 0;

        let match;
        while ((match = config.pattern.exec(content)) !== null) {
            const matchStr = config.extractGroup
                ? (match[config.extractGroup] || match[0])
                : match[0];

            // Quick FP check
            if (isFalsePositive(matchStr)) continue;

            // Quick validation
            if (config.validate && !config.validate(matchStr)) continue;

            const lineNumber = getLineNumber(content, match.index);

            findings.push({
                type: patternKey,
                severity: config.severity,
                name: config.name,
                line: lineNumber,
                match: matchStr,
            });
        }
    }

    return findings;
}

export default {
    scanContent,
    scanFiles,
    quickScan,
    maskSecret,
    isScannableFile,
};
