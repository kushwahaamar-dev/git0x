/**
 * Secret Patterns with Format Validators
 * Each pattern includes regex, validation, and metadata
 */

export const SECRET_PATTERNS = {
    // ===== AWS =====
    aws_access_key: {
        name: 'AWS Access Key ID',
        pattern: /(?<![A-Z0-9])(AKIA[0-9A-Z]{16})(?![A-Z0-9])/g,
        severity: 'critical',
        description: 'AWS Access Key ID that grants access to AWS services.',
        remediation: 'Immediately rotate this key in AWS IAM console and use environment variables.',
        validate: (match) => match.length === 20 && match.startsWith('AKIA'),
    },

    aws_secret_key: {
        name: 'AWS Secret Access Key',
        pattern: /(?<![A-Za-z0-9/+=])([A-Za-z0-9/+=]{40})(?![A-Za-z0-9/+=])/g,
        severity: 'critical',
        description: 'AWS Secret Key used with Access Key ID for authentication.',
        remediation: 'Rotate immediately in AWS IAM and store in environment variables or AWS Secrets Manager.',
        contextRequired: ['aws', 'secret', 'credential'],
        validate: (match) => match.length === 40,
    },

    // ===== Stripe =====
    stripe_live_key: {
        name: 'Stripe Live Secret Key',
        pattern: /sk_live_[0-9a-zA-Z]{24,}/g,
        severity: 'critical',
        description: 'Stripe live secret key grants full access to your Stripe account.',
        remediation: 'Revoke this key immediately in Stripe Dashboard > Developers > API Keys.',
        validate: (match) => match.startsWith('sk_live_') && match.length >= 32,
    },

    stripe_test_key: {
        name: 'Stripe Test Secret Key',
        pattern: /sk_test_[0-9a-zA-Z]{24,}/g,
        severity: 'low',
        description: 'Stripe test mode key. Lower risk but should still be secured.',
        remediation: 'Move to environment variables for better security practices.',
        validate: (match) => match.startsWith('sk_test_'),
    },

    stripe_restricted_key: {
        name: 'Stripe Restricted Key',
        pattern: /rk_live_[0-9a-zA-Z]{24,}/g,
        severity: 'high',
        description: 'Stripe restricted key with limited permissions.',
        remediation: 'Revoke and rotate in Stripe Dashboard.',
    },

    // ===== GitHub =====
    github_pat: {
        name: 'GitHub Personal Access Token',
        pattern: /ghp_[A-Za-z0-9]{36}/g,
        severity: 'critical',
        description: 'GitHub Personal Access Token can access repositories and APIs.',
        remediation: 'Revoke token at github.com/settings/tokens and create new one with minimal scopes.',
        validate: (match) => match.length === 40 && match.startsWith('ghp_'),
    },

    github_oauth: {
        name: 'GitHub OAuth Access Token',
        pattern: /gho_[A-Za-z0-9]{36}/g,
        severity: 'critical',
        description: 'GitHub OAuth token for API authentication.',
        remediation: 'Revoke the OAuth app access in GitHub settings.',
    },

    github_app_token: {
        name: 'GitHub App Token',
        pattern: /(?:ghu|ghs)_[A-Za-z0-9]{36}/g,
        severity: 'high',
        description: 'GitHub App installation or user-to-server token.',
        remediation: 'These tokens expire, but revoke if compromised.',
    },

    github_refresh_token: {
        name: 'GitHub Refresh Token',
        pattern: /ghr_[A-Za-z0-9]{36,}/g,
        severity: 'high',
        description: 'GitHub refresh token for obtaining new access tokens.',
        remediation: 'Revoke immediately in GitHub app settings.',
    },

    // ===== GitLab =====
    gitlab_pat: {
        name: 'GitLab Personal Access Token',
        pattern: /glpat-[A-Za-z0-9\-_]{20,}/g,
        severity: 'critical',
        description: 'GitLab Personal Access Token provides API access.',
        remediation: 'Revoke in GitLab User Settings > Access Tokens.',
    },

    // ===== Slack =====
    slack_token: {
        name: 'Slack Token',
        pattern: /xox[baprs]-[0-9]{10,}-[0-9a-zA-Z]{10,}/g,
        severity: 'high',
        description: 'Slack API token can access messages and channels.',
        remediation: 'Regenerate in Slack App settings.',
    },

    slack_webhook: {
        name: 'Slack Webhook URL',
        pattern: /https:\/\/hooks\.slack\.com\/services\/T[A-Z0-9]{8,}\/B[A-Z0-9]{8,}\/[A-Za-z0-9]{24}/g,
        severity: 'medium',
        description: 'Slack incoming webhook URL.',
        remediation: 'Delete and recreate webhook in Slack app configuration.',
    },

    // ===== Google =====
    google_api_key: {
        name: 'Google API Key',
        pattern: /AIza[0-9A-Za-z\-_]{35}/g,
        severity: 'high',
        description: 'Google Cloud API key may have access to various Google services.',
        remediation: 'Restrict key in Google Cloud Console or rotate it.',
    },

    google_oauth_secret: {
        name: 'Google OAuth Client Secret',
        pattern: /GOCSPX-[A-Za-z0-9\-_]{28}/g,
        severity: 'critical',
        description: 'Google OAuth client secret for authentication.',
        remediation: 'Rotate in Google Cloud Console > APIs & Services > Credentials.',
    },

    // ===== Database URLs =====
    mongodb_url: {
        name: 'MongoDB Connection String',
        pattern: /mongodb(?:\+srv)?:\/\/[^:]+:[^@]+@[^\s"']+/g,
        severity: 'critical',
        description: 'MongoDB connection string with credentials.',
        remediation: 'Rotate database password and use environment variables.',
    },

    postgres_url: {
        name: 'PostgreSQL Connection String',
        pattern: /postgres(?:ql)?:\/\/[^:]+:[^@]+@[^\s"']+/g,
        severity: 'critical',
        description: 'PostgreSQL connection string with credentials.',
        remediation: 'Rotate database password and use environment variables.',
    },

    mysql_url: {
        name: 'MySQL Connection String',
        pattern: /mysql:\/\/[^:]+:[^@]+@[^\s"']+/g,
        severity: 'critical',
        description: 'MySQL connection string with credentials.',
        remediation: 'Rotate database password and use environment variables.',
    },

    redis_url: {
        name: 'Redis Connection String',
        pattern: /redis:\/\/[^:]*:[^@]+@[^\s"']+/g,
        severity: 'high',
        description: 'Redis connection string with password.',
        remediation: 'Change Redis password and update environment variables.',
    },

    // ===== JWT =====
    jwt_token: {
        name: 'JSON Web Token',
        pattern: /eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g,
        severity: 'medium',
        description: 'JWT token that may contain authentication claims.',
        remediation: 'If this is a long-lived token, rotate it. Use short expiration times.',
    },

    // ===== Private Keys =====
    private_key_rsa: {
        name: 'RSA Private Key',
        pattern: /-----BEGIN RSA PRIVATE KEY-----[\s\S]+?-----END RSA PRIVATE KEY-----/g,
        severity: 'critical',
        description: 'RSA private key file content.',
        remediation: 'Revoke certificate, generate new key pair, and never commit private keys.',
    },

    private_key_openssh: {
        name: 'OpenSSH Private Key',
        pattern: /-----BEGIN OPENSSH PRIVATE KEY-----[\s\S]+?-----END OPENSSH PRIVATE KEY-----/g,
        severity: 'critical',
        description: 'OpenSSH private key for SSH authentication.',
        remediation: 'Remove from authorized_keys on servers and generate new keypair.',
    },

    private_key_ec: {
        name: 'EC Private Key',
        pattern: /-----BEGIN EC PRIVATE KEY-----[\s\S]+?-----END EC PRIVATE KEY-----/g,
        severity: 'critical',
        description: 'Elliptic Curve private key.',
        remediation: 'Generate new key pair and update all services using this key.',
    },

    private_key_generic: {
        name: 'Private Key',
        pattern: /-----BEGIN (?:ENCRYPTED )?PRIVATE KEY-----[\s\S]+?-----END (?:ENCRYPTED )?PRIVATE KEY-----/g,
        severity: 'critical',
        description: 'Generic private key format.',
        remediation: 'Rotate the key and update all dependent services.',
    },

    // ===== SendGrid =====
    sendgrid_api_key: {
        name: 'SendGrid API Key',
        pattern: /SG\.[A-Za-z0-9\-_]{22}\.[A-Za-z0-9\-_]{43}/g,
        severity: 'high',
        description: 'SendGrid API key for email services.',
        remediation: 'Delete key in SendGrid and create new one with minimal permissions.',
    },

    // ===== Twilio =====
    twilio_api_key: {
        name: 'Twilio API Key',
        pattern: /SK[0-9a-fA-F]{32}/g,
        severity: 'high',
        description: 'Twilio API key for SMS and voice services.',
        remediation: 'Revoke in Twilio Console and create new restricted key.',
    },

    // ===== NPM =====
    npm_token: {
        name: 'NPM Access Token',
        pattern: /npm_[A-Za-z0-9]{36}/g,
        severity: 'high',
        description: 'NPM token for publishing packages.',
        remediation: 'Revoke at npmjs.com/settings/tokens.',
    },

    // ===== PyPI =====
    pypi_token: {
        name: 'PyPI API Token',
        pattern: /pypi-AgEI[A-Za-z0-9\-_]{50,}/g,
        severity: 'high',
        description: 'PyPI token for publishing Python packages.',
        remediation: 'Delete token at pypi.org/manage/account/token.',
    },

    // ===== Heroku =====
    heroku_api_key: {
        name: 'Heroku API Key',
        pattern: /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g,
        severity: 'medium',
        description: 'Heroku API key (UUID format).',
        remediation: 'Regenerate in Heroku Account Settings.',
        contextRequired: ['heroku', 'api_key', 'authorization'],
    },

    // ===== Discord =====
    discord_token: {
        name: 'Discord Bot Token',
        pattern: /[MN][A-Za-z\d]{23,}\.[\w-]{6}\.[\w-]{27}/g,
        severity: 'high',
        description: 'Discord bot or user token.',
        remediation: 'Regenerate token in Discord Developer Portal.',
    },

    discord_webhook: {
        name: 'Discord Webhook URL',
        pattern: /https:\/\/discord(?:app)?\.com\/api\/webhooks\/\d+\/[\w-]+/g,
        severity: 'medium',
        description: 'Discord webhook URL.',
        remediation: 'Delete and recreate webhook in Discord server settings.',
    },

    // ===== Generic Patterns =====
    generic_api_key: {
        name: 'Generic API Key',
        pattern: /(?:api[_-]?key|apikey)['":\s]*[=:]\s*['"]([A-Za-z0-9\-_]{20,})['"]?/gi,
        severity: 'medium',
        description: 'Potential API key detected by pattern.',
        remediation: 'Verify if this is a real API key and move to environment variables.',
        extractGroup: 1,
    },

    generic_secret: {
        name: 'Generic Secret',
        pattern: /(?:secret|password|passwd|pwd)['":\s]*[=:]\s*['"]([^'"]{8,})['"]?/gi,
        severity: 'medium',
        description: 'Potential secret or password detected.',
        remediation: 'If real, rotate immediately and use a secrets manager.',
        extractGroup: 1,
        contextRequired: ['config', 'env', 'settings', 'credential'],
    },

    bearer_token: {
        name: 'Bearer Token',
        pattern: /[Bb]earer\s+([A-Za-z0-9\-_=]+\.?[A-Za-z0-9\-_=]*\.?[A-Za-z0-9\-_=]*)/g,
        severity: 'medium',
        description: 'Bearer authentication token in header.',
        remediation: 'Verify token validity and remove from code.',
        extractGroup: 1,
    },

    basic_auth: {
        name: 'Basic Auth Credentials',
        pattern: /[Bb]asic\s+([A-Za-z0-9+/=]{20,})/g,
        severity: 'high',
        description: 'Base64 encoded Basic authentication credentials.',
        remediation: 'Never hardcode credentials. Use environment variables.',
        extractGroup: 1,
    },
};

/**
 * Get all pattern keys
 */
export function getPatternKeys() {
    return Object.keys(SECRET_PATTERNS);
}

/**
 * Get pattern by severity
 */
export function getPatternsBySeverity(severity) {
    return Object.entries(SECRET_PATTERNS)
        .filter(([_, config]) => config.severity === severity)
        .map(([key]) => key);
}

export default SECRET_PATTERNS;
