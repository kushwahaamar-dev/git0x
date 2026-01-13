/**
 * Entropy Analysis Module (Improved)
 * Stricter thresholds and better integration with filters
 */

import { isFalsePositive } from './filters.js';
import { hasSecretKeywordsNearby } from './context.js';

/**
 * Calculate Shannon entropy of a string
 * @param {string} str - Input string
 * @returns {number} - Entropy (0-8 for ASCII)
 */
export function calculateEntropy(str) {
    if (!str || str.length === 0) return 0;

    const len = str.length;
    const frequencies = {};

    for (const char of str) {
        frequencies[char] = (frequencies[char] || 0) + 1;
    }

    let entropy = 0;
    for (const freq of Object.values(frequencies)) {
        const probability = freq / len;
        entropy -= probability * Math.log2(probability);
    }

    return entropy;
}

/**
 * Calculate normalized entropy (0-1 scale)
 * Accounts for string length
 */
export function calculateNormalizedEntropy(str) {
    if (!str || str.length <= 1) return 0;

    const entropy = calculateEntropy(str);
    const maxEntropy = Math.log2(str.length);

    return maxEntropy > 0 ? entropy / maxEntropy : 0;
}

/**
 * Analyze character class diversity
 * Real secrets typically use multiple character classes
 */
export function analyzeCharacterClasses(str) {
    const classes = {
        lowercase: /[a-z]/.test(str),
        uppercase: /[A-Z]/.test(str),
        digits: /[0-9]/.test(str),
        special: /[^a-zA-Z0-9]/.test(str),
    };

    const classCount = Object.values(classes).filter(Boolean).length;

    return {
        ...classes,
        count: classCount,
        hasMultiple: classCount >= 2,
    };
}

/**
 * Check if string appears to be a real secret based on entropy analysis
 * Much stricter than before - requires multiple signals
 */
export function isLikelySecret(str, content = '', matchIndex = 0) {
    // Minimum length for entropy-only detection (stricter)
    if (str.length < 24) return { likely: false, reason: 'too_short' };

    // Maximum length sanity check
    if (str.length > 500) return { likely: false, reason: 'too_long' };

    // Calculate entropy
    const entropy = calculateEntropy(str);

    // Strict entropy threshold (raised from 4.5)
    if (entropy < 5.0) return { likely: false, reason: 'low_entropy', entropy };

    // Check for false positives
    if (isFalsePositive(str, { entropy })) {
        return { likely: false, reason: 'false_positive', entropy };
    }

    // REQUIRE nearby secret keywords for entropy-only detection
    const hasContext = hasSecretKeywordsNearby(content, matchIndex, 80);
    if (!hasContext) {
        return { likely: false, reason: 'no_context', entropy };
    }

    // Check character class diversity
    const charClasses = analyzeCharacterClasses(str);
    if (!charClasses.hasMultiple) {
        return { likely: false, reason: 'single_char_class', entropy };
    }

    // All checks passed
    return {
        likely: true,
        entropy,
        charClasses,
        confidence: calculateEntropyConfidence(str, entropy, hasContext)
    };
}

/**
 * Calculate confidence score for entropy-based detection
 */
function calculateEntropyConfidence(str, entropy, hasContext) {
    let confidence = 30; // Base for entropy detection

    // Entropy contribution
    if (entropy > 5.5) confidence += 20;
    else if (entropy > 5.0) confidence += 10;

    // Length contribution
    if (str.length >= 32) confidence += 10;
    else if (str.length >= 24) confidence += 5;

    // Context contribution
    if (hasContext) confidence += 20;

    // Character diversity
    const classes = analyzeCharacterClasses(str);
    if (classes.count >= 3) confidence += 10;

    return Math.min(100, confidence);
}

/**
 * Find potential secrets using entropy analysis
 * Only returns high-confidence findings
 */
export function findEntropySecrets(content, filename = '') {
    const findings = [];
    const lines = content.split('\n');

    // Extract quoted strings and values
    const patterns = [
        { regex: /"([^"]{24,200})"/g, type: 'double_quoted' },
        { regex: /'([^']{24,200})'/g, type: 'single_quoted' },
        { regex: /`([^`]{24,200})`/g, type: 'template' },
        { regex: /[=:]\s*([A-Za-z0-9+/=_-]{24,200})\s*(?:[,;\n\r]|$)/g, type: 'assignment' },
    ];

    for (const { regex, type } of patterns) {
        regex.lastIndex = 0;
        let match;

        while ((match = regex.exec(content)) !== null) {
            const str = match[1] || match[0];
            const analysis = isLikelySecret(str, content, match.index);

            if (analysis.likely) {
                const lineNumber = content.substring(0, match.index).split('\n').length;

                findings.push({
                    match: str,
                    index: match.index,
                    line: lineNumber,
                    entropy: analysis.entropy,
                    confidence: analysis.confidence,
                    type: 'high_entropy',
                    extractionMethod: type,
                });
            }
        }
    }

    return findings;
}

export default {
    calculateEntropy,
    calculateNormalizedEntropy,
    analyzeCharacterClasses,
    isLikelySecret,
    findEntropySecrets,
};
