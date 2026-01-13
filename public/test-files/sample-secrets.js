// Test file with various secrets - use this to test the scanner
// ALL of these should be detected!

// AWS Credentials
const AWS_ACCESS_KEY = "AKIAIOSFODNN7EXAMPLE";
const AWS_SECRET = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY";

// Stripe API Keys
const STRIPE_LIVE_KEY = "sk_live_4eC39HqLyjWDarjtT1zdp7dc";
const STRIPE_TEST_KEY = "sk_test_4eC39HqLyjWDarjtT1zdp7dc";

// GitHub Token
const GITHUB_TOKEN = "ghp_1234567890abcdefghijklmnopqrstuvwxyz";

// GitLab Token
const GITLAB_TOKEN = "glpat-xxxxxxxxxxxxxxxxxxxx";

// Database URLs
const MONGODB_URL = "mongodb://admin:SuperSecret123@localhost:27017/myapp";
const POSTGRES_URL = "postgresql://user:password123@host:5432/db";
const MYSQL_URL = "mysql://root:secret@localhost:3306/database";

// JWT Token
const JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

// Private Key
const PRIVATE_KEY = `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA2mKqH...
-----END RSA PRIVATE KEY-----`;

// Slack Tokens
const SLACK_BOT_TOKEN = "xoxb-123456789012-1234567890123-abcdefghijklmnopqrstuvwx";
const SLACK_WEBHOOK = "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX";

// Discord Webhook
const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/123456789012345678/abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";

// SendGrid
const SENDGRID_KEY = "SG.abcdefghijklmnopqrstuv.wxyz1234567890abcdefghijklmnopqrstuvwxyz12";

// Google API Key
const GOOGLE_API_KEY = "AIzaSyDaGmWKa4JsXZ-HjGw7ISLn_3namBGewQe";

// Twilio
const TWILIO_KEY = "SKabcdefghijklmnopqrstuvwxyz012345";

// NPM Token
const NPM_TOKEN = "npm_abcdefghijklmnopqrstuvwxyz123456";

// Generic Patterns
const password = "mysupersecretpassword123";
const api_key = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6";

// Bearer Token
const AUTH_HEADER = "Bearer eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJ0ZXN0In0.abc123";

console.log("This file contains test secrets for the scanner");
