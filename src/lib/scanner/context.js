/**
 * Context Analyzer
 * Analyzes code context to determine if a potential secret is real
 */

// Keywords that strongly indicate a secret
const SECRET_KEYWORDS = [
    'api_key', 'apikey', 'api-key',
    'secret', 'secret_key', 'secretkey',
    'password', 'passwd', 'pwd',
    'token', 'access_token', 'auth_token', 'bearer',
    'private_key', 'privatekey',
    'credential', 'credentials',
    'auth', 'authorization',
    'client_secret', 'client_id',
    'aws_access', 'aws_secret',
    'database_url', 'db_password', 'db_pass',
    'encryption_key', 'signing_key',
    'webhook_secret', 'signing_secret',
];

// Keywords that suggest test/example data
const TEST_KEYWORDS = [
    'test', 'spec', 'mock', 'fake', 'dummy', 'stub',
    'fixture', 'sample', 'example', 'demo',
    'placeholder', 'template', 'todo', 'fixme',
];

// File path patterns indicating test files
const TEST_FILE_PATTERNS = [
    /\.(test|spec)\.[jt]sx?$/,
    /__(tests|mocks|fixtures)__/,
    /\/tests?\//,
    /\/fixtures?\//,
    /\/mocks?\//,
    /\.stories\.[jt]sx?$/,
    /\.example\./,
];

// File paths indicating sensitive files
const SENSITIVE_FILE_PATTERNS = [
    /\.env($|\.)/,
    /\.pem$/,
    /\.key$/,
    /credentials/i,
    /secrets/i,
    /config\.(prod|production)/i,
];

/**
 * Extract variable name from assignment context
 */
export function extractVariableName(line) {
    // Match common assignment patterns
    const patterns = [
        /(?:const|let|var|export)\s+(\w+)\s*=/,           // JS variable
        /(\w+)\s*[:=]\s*["'`]/,                            // Key: "value" or key = "value"
        /"?(\w+)"?\s*:\s*["'`]/,                           // JSON key
        /(\w+)\s*=\s*["'`]/,                               // Assignment
        /\.(\w+)\s*=\s*["'`]/,                             // Property assignment
        /\[['"](\w+)['"]\]\s*=\s*["'`]/,                   // Bracket notation
    ];

    for (const pattern of patterns) {
        const match = line.match(pattern);
        if (match) return match[1];
    }

    return null;
}

/**
 * Check if variable name suggests a secret
 */
export function isSecretVariableName(name) {
    if (!name) return false;
    const lower = name.toLowerCase();
    return SECRET_KEYWORDS.some(kw => lower.includes(kw));
}

/**
 * Check if content around match contains secret keywords
 */
export function hasSecretKeywordsNearby(content, matchIndex, range = 50) {
    const start = Math.max(0, matchIndex - range);
    const end = Math.min(content.length, matchIndex + range);
    const context = content.substring(start, end).toLowerCase();

    return SECRET_KEYWORDS.some(kw => context.includes(kw));
}

/**
 * Check if line appears to be a comment
 */
export function isComment(line) {
    const trimmed = line.trim();
    return (
        trimmed.startsWith('//') ||
        trimmed.startsWith('#') ||
        trimmed.startsWith('/*') ||
        trimmed.startsWith('*') ||
        trimmed.startsWith('"""') ||
        trimmed.startsWith("'''") ||
        trimmed.includes('<!--')
    );
}

/**
 * Check if match appears in a string that's being logged/printed
 */
export function isLoggingStatement(line) {
    const lower = line.toLowerCase();
    return (
        /console\.(log|info|warn|error|debug)/.test(lower) ||
        /print\s*\(/.test(lower) ||
        /logger?\.(log|info|warn|error|debug)/.test(lower) ||
        /puts\s/.test(lower) ||
        /echo\s/.test(lower)
    );
}

/**
 * Check if file path indicates a test file
 */
export function isTestFile(filePath) {
    return TEST_FILE_PATTERNS.some(pattern => pattern.test(filePath));
}

/**
 * Check if file path indicates a sensitive file
 */
export function isSensitiveFile(filePath) {
    return SENSITIVE_FILE_PATTERNS.some(pattern => pattern.test(filePath));
}

/**
 * Check if line contains test/example indicators
 */
export function hasTestIndicators(line) {
    const lower = line.toLowerCase();
    return TEST_KEYWORDS.some(kw => lower.includes(kw));
}

/**
 * Full context analysis for a potential secret
 */
export function analyzeContext(content, match, matchIndex, filePath = '') {
    // Get the line containing the match
    const lineStart = content.lastIndexOf('\n', matchIndex - 1) + 1;
    const lineEnd = content.indexOf('\n', matchIndex);
    const line = content.substring(lineStart, lineEnd === -1 ? undefined : lineEnd);

    // Extract variable name
    const variableName = extractVariableName(line);

    // Calculate confidence adjustments
    const signals = {
        variableName,
        isSecretVariable: isSecretVariableName(variableName),
        hasNearbyKeywords: hasSecretKeywordsNearby(content, matchIndex),
        isInComment: isComment(line),
        isLogging: isLoggingStatement(line),
        isTestFile: isTestFile(filePath),
        isSensitiveFile: isSensitiveFile(filePath),
        hasTestIndicators: hasTestIndicators(line),
        line: line.trim(),
    };

    // Calculate confidence modifier (-50 to +50)
    let modifier = 0;

    // Positive signals (increase confidence)
    if (signals.isSecretVariable) modifier += 25;
    if (signals.hasNearbyKeywords) modifier += 15;
    if (signals.isSensitiveFile) modifier += 20;

    // Negative signals (decrease confidence)
    if (signals.isInComment) modifier -= 25;
    if (signals.isTestFile) modifier -= 30;
    if (signals.hasTestIndicators) modifier -= 35;
    if (signals.isLogging) modifier -= 10;

    return {
        ...signals,
        confidenceModifier: modifier,
    };
}

export default {
    extractVariableName,
    isSecretVariableName,
    hasSecretKeywordsNearby,
    isComment,
    isLoggingStatement,
    isTestFile,
    isSensitiveFile,
    hasTestIndicators,
    analyzeContext,
};
