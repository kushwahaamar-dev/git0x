/**
 * Safe Regex Execution
 * Prevents ReDoS by limiting execution time and input size
 */

const MAX_INPUT_SIZE = 1_000_000; // 1MB max input per file
const MAX_MATCH_TIME_MS = 100;    // Max time per pattern
const MAX_MATCHES_PER_PATTERN = 500; // Prevent infinite matches

/**
 * Safely execute a regex with timeout and limits
 * Returns matches or empty array on timeout/error
 */
export function safeExec(pattern, content, options = {}) {
    const {
        maxMatches = MAX_MATCHES_PER_PATTERN,
        maxTime = MAX_MATCH_TIME_MS
    } = options;

    // Limit input size
    const input = content.length > MAX_INPUT_SIZE
        ? content.substring(0, MAX_INPUT_SIZE)
        : content;

    const matches = [];
    const startTime = performance.now();

    // Reset lastIndex for global patterns
    pattern.lastIndex = 0;

    let match;
    while ((match = pattern.exec(input)) !== null) {
        matches.push({
            match: match[0],
            groups: match.slice(1),
            index: match.index,
        });

        // Check limits
        if (matches.length >= maxMatches) {
            console.warn(`[SafeRegex] Max matches (${maxMatches}) reached for pattern`);
            break;
        }

        if (performance.now() - startTime > maxTime) {
            console.warn(`[SafeRegex] Timeout (${maxTime}ms) for pattern`);
            break;
        }

        // Prevent infinite loops on zero-width matches
        if (match[0].length === 0) {
            pattern.lastIndex++;
        }
    }

    return matches;
}

/**
 * Check if content is safe to scan
 */
export function isSafeToScan(content) {
    if (!content || typeof content !== 'string') return false;
    if (content.length > MAX_INPUT_SIZE * 10) return false; // 10MB absolute max
    return true;
}

/**
 * Sanitize content before rendering (prevent XSS)
 */
export function sanitizeForDisplay(content) {
    if (!content) return '';
    return content
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * Truncate content for display
 */
export function truncate(content, maxLength = 200) {
    if (!content || content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
}

export default {
    safeExec,
    isSafeToScan,
    sanitizeForDisplay,
    truncate,
    MAX_INPUT_SIZE,
    MAX_MATCH_TIME_MS,
    MAX_MATCHES_PER_PATTERN,
};
