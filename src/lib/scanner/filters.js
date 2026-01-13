/**
 * False Positive Filters
 * Detects and filters out strings that look like secrets but aren't
 */

// UUID pattern (v1-v5)
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Common hash patterns
const HASH_PATTERNS = {
    md5: /^[a-f0-9]{32}$/i,
    sha1: /^[a-f0-9]{40}$/i,
    sha256: /^[a-f0-9]{64}$/i,
    sha512: /^[a-f0-9]{128}$/i,
};

// Known placeholder/example patterns
const PLACEHOLDER_PATTERNS = [
    /^x{3,}$/i,                           // xxx, XXXX
    /^0{8,}$/,                            // 00000000
    /^1{8,}$/,                            // 11111111
    /^(abc|123|test|demo|example|sample|dummy|fake|placeholder)/i,
    /(example|sample|test|demo|dummy|fake|placeholder|your[-_]?|insert[-_]?|replace[-_]?)/i,
    /^<.*>$/,                             // <YOUR_KEY_HERE>
    /^\[.*\]$/,                           // [YOUR_KEY]
    /^\$\{.*\}$/,                         // ${VAR}
    /^%[a-z_]+%$/i,                       // %VARIABLE%
];

// Known non-secret high-entropy strings
const FALSE_POSITIVE_PREFIXES = [
    'data:image/',                        // Data URLs
    'data:application/',
    'http://',                            // URLs
    'https://',
    'file://',
    'mailto:',
    'tel:',
];

// Common variable names that hold non-secrets
const BENIGN_VARIABLE_NAMES = [
    'id', 'uuid', 'guid', 'hash', 'checksum', 'digest',
    'signature', 'nonce', 'salt', 'iv', 'vector',
    'session', 'transaction', 'request', 'response',
    'version', 'revision', 'commit', 'ref', 'sha',
];

/**
 * Check if a string is a UUID
 */
export function isUUID(str) {
    return UUID_PATTERN.test(str);
}

/**
 * Check if a string is a cryptographic hash
 */
export function isHash(str) {
    const clean = str.replace(/[^a-f0-9]/gi, '');
    return Object.values(HASH_PATTERNS).some(pattern => pattern.test(clean));
}

/**
 * Check if a string appears to be a placeholder or example
 */
export function isPlaceholder(str) {
    const lower = str.toLowerCase();

    // Check direct patterns
    if (PLACEHOLDER_PATTERNS.some(p => p.test(str))) return true;

    // Check for repeating characters (like "aaaa" or "1111")
    if (/^(.)\1{7,}$/.test(str)) return true;

    // Check for sequential patterns
    if (/^(0123|1234|abcd|qwert)/i.test(str)) return true;

    // Check for "example" domain patterns in Base64
    try {
        const decoded = atob(str);
        if (/(example|test|demo|localhost)/i.test(decoded)) return true;
    } catch { }

    return false;
}

/**
 * Check if string starts with known non-secret prefix
 */
export function hasNonSecretPrefix(str) {
    const lower = str.toLowerCase();
    return FALSE_POSITIVE_PREFIXES.some(prefix => lower.startsWith(prefix));
}

/**
 * Check if the variable name suggests this is not a secret
 */
export function isBenignVariableName(variableName) {
    const lower = variableName.toLowerCase();
    return BENIGN_VARIABLE_NAMES.some(name =>
        lower === name ||
        lower.endsWith(`_${name}`) ||
        lower.endsWith(`${name}Id`) ||
        lower.startsWith(`${name}_`)
    );
}

/**
 * Check if string looks like encoded binary data (not a secret)
 */
export function isEncodedBinary(str) {
    // Very long Base64 strings are likely encoded files, not secrets
    if (str.length > 500 && /^[A-Za-z0-9+/=]+$/.test(str)) return true;

    // PNG/JPEG signatures in Base64
    if (str.startsWith('iVBORw0KGgo')) return true;  // PNG
    if (str.startsWith('/9j/')) return true;          // JPEG
    if (str.startsWith('R0lGODlh')) return true;      // GIF

    return false;
}

/**
 * Main false positive check - combines all filters
 */
export function isFalsePositive(str, context = {}) {
    // Skip very short strings
    if (str.length < 8) return true;

    // Apply all filters
    if (isUUID(str)) return true;
    if (isHash(str)) return true;
    if (isPlaceholder(str)) return true;
    if (hasNonSecretPrefix(str)) return true;
    if (isEncodedBinary(str)) return true;

    // Check variable name if provided
    if (context.variableName && isBenignVariableName(context.variableName)) {
        // Only filter if entropy is not extremely high
        if (!context.entropy || context.entropy < 5.5) return true;
    }

    return false;
}

/**
 * Get reason why something was filtered (for debugging/UI)
 */
export function getFalsePositiveReason(str) {
    if (str.length < 8) return 'too_short';
    if (isUUID(str)) return 'uuid';
    if (isHash(str)) return 'hash';
    if (isPlaceholder(str)) return 'placeholder';
    if (hasNonSecretPrefix(str)) return 'non_secret_prefix';
    if (isEncodedBinary(str)) return 'encoded_binary';
    return null;
}

export default {
    isUUID,
    isHash,
    isPlaceholder,
    hasNonSecretPrefix,
    isBenignVariableName,
    isEncodedBinary,
    isFalsePositive,
    getFalsePositiveReason,
};
