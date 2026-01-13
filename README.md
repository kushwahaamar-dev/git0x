# git0x

A client-side secret scanner that detects API keys, tokens, and credentials in your code before they leak.

## Features

- **100% Client-Side** — All scanning runs in your browser. No data leaves your machine.
- **Web Worker Architecture** — Scans run off the main thread, keeping the UI responsive.
- **IndexedDB Storage** — Unlimited scan history (no 5MB localStorage cap).
- **30+ Detection Patterns** — AWS, Stripe, GitHub, GitLab, Slack, Google, database URLs, private keys, and more.
- **Low False Positives** — Multi-layer filtering excludes UUIDs, hashes, placeholders, and test data.

## Installation

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Pages

### Scan (`/scan`)
Upload files or paste a public GitHub repository URL. The scanner fetches repo contents via GitHub API and analyzes all files in a background Web Worker.

### History (`/history`)
View past scan results stored in IndexedDB. Click any entry to see full findings.

### Playground (`/playground`)
Live editor with real-time secret detection. Paste code and see findings highlighted instantly.

### Git Hooks (`/hooks`)
Generate pre-commit hooks for your project. Supports Bash, Python, Node.js, and Go.

### Settings (`/settings`)
Configure confidence threshold and entropy analysis. Export or clear local data.

---

## Scanner Architecture

```
┌────────────────────────────────────────────────────────────┐
│                    6-LAYER PIPELINE                        │
├────────────────────────────────────────────────────────────┤
│  1. PATTERN MATCHING     → 30+ regex patterns              │
│  2. FALSE POSITIVE FILTER → UUID, hash, placeholder check  │
│  3. CONTEXT ANALYSIS     → Variable names, file types      │
│  4. PATTERN VALIDATION   → Format/length verification      │
│  5. CONFIDENCE SCORING   → Weighted score (0-100)          │
│  6. ENTROPY FALLBACK     → High-randomness strings         │
└────────────────────────────────────────────────────────────┘
```

---

## Core Modules

### `src/lib/scanner/`

| File | Purpose |
|------|---------|
| `patterns.js` | 30+ regex patterns with validators (AWS, Stripe, GitHub, etc.) |
| `filters.js` | False positive detection (UUID, hash, placeholder, binary) |
| `context.js` | Code context analysis (variable names, file types, comments) |
| `entropy.js` | Shannon entropy calculation with strict thresholds (5.0+) |
| `engine.js` | Main scanner with 6-layer pipeline and confidence scoring |
| `worker.js` | Web Worker wrapper for off-thread scanning |
| `client.js` | Worker bridge with main-thread fallback |
| `safety.js` | Regex timeout limits and XSS sanitization |

### `src/lib/storage/`

| File | Purpose |
|------|---------|
| `index.js` | IndexedDB storage for scans, settings, and analytics |

### `src/lib/github/`

| File | Purpose |
|------|---------|
| `api.js` | GitHub API integration for fetching public repo contents |

---

## Detection Patterns

| Category | Examples |
|----------|----------|
| **AWS** | Access Key ID (`AKIA...`), Secret Access Key |
| **Stripe** | Live/Test Secret Keys (`sk_live_`, `sk_test_`) |
| **GitHub** | PAT (`ghp_`), OAuth (`gho_`), App Tokens |
| **GitLab** | Personal Access Token (`glpat-`) |
| **Slack** | Bot Tokens (`xoxb-`), Webhooks |
| **Google** | API Keys (`AIza...`), OAuth Secrets |
| **Database** | MongoDB, PostgreSQL, MySQL, Redis URLs |
| **Private Keys** | RSA, OpenSSH, EC, Generic PEM |
| **JWT** | JSON Web Tokens |
| **Generic** | `api_key`, `secret`, `password`, Bearer tokens |

---

## False Positive Filters

The scanner automatically excludes:

- **UUIDs** — `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- **Hashes** — MD5 (32 chars), SHA-1 (40), SHA-256 (64)
- **Placeholders** — `xxx`, `test`, `example`, `<YOUR_KEY>`
- **Data URLs** — `data:image/...`
- **Encoded Binary** — Base64 images (PNG, JPEG, GIF signatures)
- **Test Files** — `*.test.js`, `__tests__/`, fixtures

---

## Configuration

In Settings, configure:

| Option | Default | Description |
|--------|---------|-------------|
| **Confidence Threshold** | 50% | Minimum score to report a finding |
| **Entropy Analysis** | On | Detect high-randomness strings |

---

## Tech Stack

- **React 19** + **Vite 7**
- **Tailwind CSS** (dark theme)
- **Lucide React** (icons)
- **IndexedDB** (storage)
- **Web Workers** (background processing)

---

## License

MIT
