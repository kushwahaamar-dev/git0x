// Pre-commit hook code generation for different languages

/**
 * Generate Node.js pre-commit hook
 */
export function generateNodeHook(options = {}) {
    const {
        blockCommit = true,
        showSuggestions = true,
        patterns = 'all'
    } = options;

    return `#!/usr/bin/env node

/**
 * GitGuardian Pre-Commit Hook
 * Scans staged files for secrets before allowing commits
 * 
 * Installation:
 * 1. Save this file as .git/hooks/pre-commit
 * 2. Make it executable: chmod +x .git/hooks/pre-commit
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Secret patterns to detect
const SECRET_PATTERNS = {
  aws_access_key: {
    pattern: /AKIA[0-9A-Z]{16}/g,
    name: 'AWS Access Key',
    severity: 'critical'
  },
  stripe_live_key: {
    pattern: /sk_live_[0-9a-zA-Z]{24,}/g,
    name: 'Stripe Live Key',
    severity: 'critical'
  },
  stripe_test_key: {
    pattern: /sk_test_[0-9a-zA-Z]{24,}/g,
    name: 'Stripe Test Key',
    severity: 'medium'
  },
  github_token: {
    pattern: /gh[ps]_[a-zA-Z0-9]{36,}/g,
    name: 'GitHub Token',
    severity: 'critical'
  },
  jwt_token: {
    pattern: /eyJ[A-Za-z0-9-_=]+\\.[A-Za-z0-9-_=]+\\.?[A-Za-z0-9-_.+\\/=]*/g,
    name: 'JWT Token',
    severity: 'high'
  },
  private_key: {
    pattern: /-----BEGIN (RSA |OPENSSH |EC |DSA )?PRIVATE KEY-----/g,
    name: 'Private Key',
    severity: 'critical'
  },
  mongodb_url: {
    pattern: /mongodb(\\+srv)?:\\/\\/[^\\s"']+:[^\\s"']+@[^\\s"']+/g,
    name: 'MongoDB URL with Credentials',
    severity: 'critical'
  },
  generic_api_key: {
    pattern: /(?:api[_-]?key|apikey|api[_-]?secret)\\s*[=:]\\s*['"][a-zA-Z0-9_\\-]{16,}['"]/gi,
    name: 'Hardcoded API Key',
    severity: 'high'
  },
  password_assignment: {
    pattern: /(?:password|passwd|pwd|secret)\\s*[=:]\\s*['"][^'"]{8,}['"]/gi,
    name: 'Hardcoded Password',
    severity: 'high'
  }
};

// Colors for terminal output
const colors = {
  red: '\\x1b[31m',
  yellow: '\\x1b[33m',
  green: '\\x1b[32m',
  blue: '\\x1b[34m',
  cyan: '\\x1b[36m',
  reset: '\\x1b[0m',
  bold: '\\x1b[1m'
};

function colorize(text, color) {
  return \`\${colors[color]}\${text}\${colors.reset}\`;
}

// Get staged files
function getStagedFiles() {
  try {
    const output = execSync('git diff --cached --name-only --diff-filter=ACM', { encoding: 'utf-8' });
    return output.split('\\n').filter(Boolean);
  } catch (error) {
    return [];
  }
}

// Scannable file extensions
const SCANNABLE_EXTENSIONS = [
  '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs',
  '.py', '.java', '.go', '.rb', '.php',
  '.env', '.yml', '.yaml', '.json', '.xml',
  '.sh', '.bash', '.sql', '.tf'
];

function isScannableFile(filename) {
  return SCANNABLE_EXTENSIONS.some(ext => filename.endsWith(ext));
}

// Mask secret for display
function maskSecret(secret) {
  if (secret.length <= 8) return '*'.repeat(secret.length);
  return secret.slice(0, 4) + '*'.repeat(Math.min(20, secret.length - 8)) + secret.slice(-4);
}

// Scan a file for secrets
function scanFile(filepath) {
  if (!fs.existsSync(filepath)) return [];
  if (!isScannableFile(filepath)) return [];
  
  const content = fs.readFileSync(filepath, 'utf-8');
  const lines = content.split('\\n');
  const findings = [];
  
  for (const [type, config] of Object.entries(SECRET_PATTERNS)) {
    config.pattern.lastIndex = 0;
    let match;
    
    while ((match = config.pattern.exec(content)) !== null) {
      const lineNum = content.substring(0, match.index).split('\\n').length;
      
      findings.push({
        type,
        name: config.name,
        severity: config.severity,
        file: filepath,
        line: lineNum,
        secret: match[0],
        lineContent: lines[lineNum - 1]?.trim() || ''
      });
    }
  }
  
  return findings;
}

// Main execution
console.log(colorize('\\n🛡️  GitGuardian Pre-Commit Scan', 'cyan'));
console.log(colorize('━'.repeat(40), 'cyan'));

const stagedFiles = getStagedFiles();
let allFindings = [];

for (const file of stagedFiles) {
  const findings = scanFile(file);
  allFindings.push(...findings);
}

if (allFindings.length === 0) {
  console.log(colorize('\\n✅ No secrets detected. Commit allowed.\\n', 'green'));
  process.exit(0);
}

// Group by severity
const critical = allFindings.filter(f => f.severity === 'critical');
const high = allFindings.filter(f => f.severity === 'high');
const medium = allFindings.filter(f => f.severity === 'medium');

console.log(colorize(\`\\n⚠️  BLOCKED: \${allFindings.length} potential secret(s) detected\\n\`, 'red'));

// Display findings
for (const finding of allFindings) {
  const severityColor = finding.severity === 'critical' ? 'red' : finding.severity === 'high' ? 'yellow' : 'blue';
  
  console.log(colorize(\`  📁 \${finding.file}:\${finding.line}\`, 'bold'));
  console.log(colorize(\`     [\${finding.severity.toUpperCase()}] \${finding.name}\`, severityColor));
  console.log(\`     Secret: \${maskSecret(finding.secret)}\`);
${showSuggestions ? `
  console.log(colorize('     💡 Suggestion: Move to environment variable', 'cyan'));
` : ''}
  console.log('');
}

console.log(colorize('Options:', 'bold'));
console.log('  - Fix the issues and try again');
console.log('  - Use git commit --no-verify to bypass (NOT RECOMMENDED)');
console.log('');

${blockCommit ? 'process.exit(1);' : `
console.log(colorize('⚠️  Warning mode: Commit allowed but secrets detected!', 'yellow'));
process.exit(0);
`}
`;
}

/**
 * Generate Python pre-commit hook
 */
export function generatePythonHook(options = {}) {
    const {
        blockCommit = true,
        showSuggestions = true
    } = options;

    return `#!/usr/bin/env python3
"""
GitGuardian Pre-Commit Hook
Scans staged files for secrets before allowing commits

Installation:
1. Save this file as .git/hooks/pre-commit
2. Make it executable: chmod +x .git/hooks/pre-commit
"""

import re
import subprocess
import sys
from pathlib import Path

# Secret patterns
SECRET_PATTERNS = {
    'aws_access_key': {
        'pattern': r'AKIA[0-9A-Z]{16}',
        'name': 'AWS Access Key',
        'severity': 'critical'
    },
    'stripe_live_key': {
        'pattern': r'sk_live_[0-9a-zA-Z]{24,}',
        'name': 'Stripe Live Key',
        'severity': 'critical'
    },
    'github_token': {
        'pattern': r'gh[ps]_[a-zA-Z0-9]{36,}',
        'name': 'GitHub Token',
        'severity': 'critical'
    },
    'jwt_token': {
        'pattern': r'eyJ[A-Za-z0-9-_=]+\\.eyJ[A-Za-z0-9-_=]+\\.?[A-Za-z0-9-_.+/=]*',
        'name': 'JWT Token',
        'severity': 'high'
    },
    'private_key': {
        'pattern': r'-----BEGIN (RSA |OPENSSH |EC )?PRIVATE KEY-----',
        'name': 'Private Key',
        'severity': 'critical'
    },
    'mongodb_url': {
        'pattern': r'mongodb(\\+srv)?://[^\\s"\']+:[^\\s"\']+@[^\\s"\']+',
        'name': 'MongoDB URL',
        'severity': 'critical'
    }
}

SCANNABLE_EXT = {'.py', '.js', '.ts', '.json', '.yml', '.yaml', '.env', '.sh'}

def get_staged_files():
    result = subprocess.run(
        ['git', 'diff', '--cached', '--name-only', '--diff-filter=ACM'],
        capture_output=True, text=True
    )
    return [f for f in result.stdout.strip().split('\\n') if f]

def mask_secret(secret):
    if len(secret) <= 8:
        return '*' * len(secret)
    return secret[:4] + '*' * min(20, len(secret) - 8) + secret[-4:]

def scan_file(filepath):
    path = Path(filepath)
    if not path.exists() or path.suffix not in SCANNABLE_EXT:
        return []
    
    content = path.read_text(errors='ignore')
    lines = content.split('\\n')
    findings = []
    
    for pattern_name, config in SECRET_PATTERNS.items():
        for match in re.finditer(config['pattern'], content):
            line_num = content[:match.start()].count('\\n') + 1
            findings.append({
                'name': config['name'],
                'severity': config['severity'],
                'file': filepath,
                'line': line_num,
                'secret': match.group()
            })
    
    return findings

def main():
    print("\\n🛡️  GitGuardian Pre-Commit Scan")
    print("━" * 40)
    
    staged_files = get_staged_files()
    all_findings = []
    
    for f in staged_files:
        all_findings.extend(scan_file(f))
    
    if not all_findings:
        print("\\n✅ No secrets detected. Commit allowed.\\n")
        return 0
    
    print(f"\\n⚠️  BLOCKED: {len(all_findings)} potential secret(s) detected\\n")
    
    for finding in all_findings:
        print(f"  📁 {finding['file']}:{finding['line']}")
        print(f"     [{finding['severity'].upper()}] {finding['name']}")
        print(f"     Secret: {mask_secret(finding['secret'])}")
${showSuggestions ? '        print("     💡 Suggestion: Move to environment variable")' : ''}
        print()
    
    ${blockCommit ? 'return 1' : 'print("⚠️  Warning mode: Commit allowed but secrets detected!")\\n    return 0'}

if __name__ == '__main__':
    sys.exit(main())
`;
}

/**
 * Generate Bash pre-commit hook
 */
export function generateBashHook(options = {}) {
    const { blockCommit = true } = options;

    return `#!/bin/bash
#
# GitGuardian Pre-Commit Hook
# Scans staged files for secrets before allowing commits
#
# Installation:
# 1. Save this file as .git/hooks/pre-commit
# 2. Make it executable: chmod +x .git/hooks/pre-commit

echo ""
echo "🛡️  GitGuardian Pre-Commit Scan"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Get staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM)

if [ -z "$STAGED_FILES" ]; then
    echo "✅ No staged files to scan."
    exit 0
fi

SECRETS_FOUND=0
FINDINGS=""

# Patterns to detect
declare -A PATTERNS
PATTERNS["AWS_KEY"]="AKIA[0-9A-Z]{16}"
PATTERNS["STRIPE_KEY"]="sk_(live|test)_[0-9a-zA-Z]{24,}"
PATTERNS["GITHUB_TOKEN"]="gh[ps]_[a-zA-Z0-9]{36,}"
PATTERNS["PRIVATE_KEY"]="-----BEGIN.*PRIVATE KEY-----"
PATTERNS["MONGODB_URL"]="mongodb(\\+srv)?://[^[:space:]]+"

# Scan each staged file
for FILE in $STAGED_FILES; do
    if [ ! -f "$FILE" ]; then
        continue
    fi
    
    for PATTERN_NAME in "\${!PATTERNS[@]}"; do
        PATTERN="\${PATTERNS[$PATTERN_NAME]}"
        
        MATCHES=$(grep -nE "$PATTERN" "$FILE" 2>/dev/null)
        
        if [ -n "$MATCHES" ]; then
            SECRETS_FOUND=$((SECRETS_FOUND + 1))
            FINDINGS="$FINDINGS\\n  📁 $FILE"
            FINDINGS="$FINDINGS\\n     [CRITICAL] $PATTERN_NAME detected"
            FINDINGS="$FINDINGS\\n"
        fi
    done
done

if [ $SECRETS_FOUND -eq 0 ]; then
    echo ""
    echo "✅ No secrets detected. Commit allowed."
    echo ""
    exit 0
fi

echo ""
echo "⚠️  BLOCKED: $SECRETS_FOUND potential secret(s) detected"
echo -e "$FINDINGS"

echo "Options:"
echo "  - Fix the issues and try again"
echo "  - Use 'git commit --no-verify' to bypass (NOT RECOMMENDED)"
echo ""

${blockCommit ? 'exit 1' : 'echo "⚠️  Warning mode: Commit allowed but secrets detected!"\\nexit 0'}
`;
}

/**
 * Generate hook based on language
 */
export function generateHook(language, options = {}) {
    switch (language) {
        case 'nodejs':
        case 'javascript':
            return generateNodeHook(options);
        case 'python':
            return generatePythonHook(options);
        case 'bash':
        case 'shell':
            return generateBashHook(options);
        default:
            return generateBashHook(options);
    }
}

/**
 * Generate installation instructions
 */
export function getInstallInstructions(language) {
    const base = `
## Installation

1. Navigate to your repository root
2. Create the hooks directory if it doesn't exist:
   \`\`\`bash
   mkdir -p .git/hooks
   \`\`\`
3. Create the pre-commit hook file:
   \`\`\`bash
   touch .git/hooks/pre-commit
   \`\`\`
4. Copy the generated code into the file
5. Make it executable:
   \`\`\`bash
   chmod +x .git/hooks/pre-commit
   \`\`\`
`;

    const languageSpecific = {
        nodejs: `
### Node.js Requirements
- Node.js 14+ must be installed
- No additional dependencies required
`,
        python: `
### Python Requirements
- Python 3.6+ must be installed
- No additional dependencies required
`,
        bash: `
### Bash Requirements
- Works on macOS, Linux, and WSL
- No additional dependencies
`
    };

    return base + (languageSpecific[language] || languageSpecific.bash);
}

export default {
    generateHook,
    generateNodeHook,
    generatePythonHook,
    generateBashHook,
    getInstallInstructions
};
