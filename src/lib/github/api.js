// GitHub API integration for public repository scanning

const GITHUB_API_BASE = 'https://api.github.com';
const RAW_GITHUB_BASE = 'https://raw.githubusercontent.com';

/**
 * Parse GitHub URL to extract owner and repo
 * @param {string} url - GitHub repository URL
 * @returns {object} - {owner, repo}
 */
export function parseGitHubUrl(url) {
    // Support various URL formats
    const patterns = [
        /github\.com\/([^\/]+)\/([^\/\?\#]+)/,  // https://github.com/owner/repo
        /github\.com:([^\/]+)\/([^\/\.\?\#]+)/,  // git@github.com:owner/repo
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
            return {
                owner: match[1],
                repo: match[2].replace(/\.git$/, '')
            };
        }
    }

    throw new Error('Invalid GitHub URL format');
}

/**
 * Fetch repository metadata
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {object} - Repository data
 */
export async function fetchRepoInfo(owner, repo) {
    const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`);

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Repository not found or is private');
        }
        throw new Error(`GitHub API error: ${response.status}`);
    }

    return response.json();
}

/**
 * Fetch repository file tree
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} branch - Branch name (default: default_branch)
 * @returns {Array} - Array of file objects
 */
export async function fetchRepoTree(owner, repo, branch = 'main') {
    const response = await fetch(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`
    );

    if (!response.ok) {
        throw new Error(`Failed to fetch repository tree: ${response.status}`);
    }

    const data = await response.json();

    // Filter to only blob (files) and apply file filters
    return data.tree
        .filter(item => item.type === 'blob')
        .map(item => ({
            path: item.path,
            size: item.size || 0,
            sha: item.sha,
            url: item.url
        }));
}

/**
 * Check if a file should be scanned
 * @param {string} path - File path
 * @returns {boolean}
 */
export function shouldScanFile(path) {
    const scannableExtensions = [
        '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs',
        '.py', '.pyw',
        '.java', '.kt', '.scala',
        '.go',
        '.rb', '.erb',
        '.php',
        '.env', '.env.local', '.env.example', '.env.development', '.env.production',
        '.yml', '.yaml',
        '.json',
        '.xml',
        '.toml',
        '.ini', '.cfg', '.conf',
        '.properties',
        '.sh', '.bash', '.zsh',
        '.tf', '.tfvars'
    ];

    const skipPatterns = [
        'node_modules/',
        'vendor/',
        'dist/',
        'build/',
        '.git/',
        '__pycache__/',
        '.min.js',
        '.min.css',
        '.map',
        'package-lock.json',
        'yarn.lock',
        'pnpm-lock.yaml',
        '.snap',
        '.test.',
        '.spec.'
    ];

    // Skip if matches skip pattern
    for (const skip of skipPatterns) {
        if (path.includes(skip)) return false;
    }

    // Check if extension is scannable
    return scannableExtensions.some(ext => path.endsWith(ext));
}

/**
 * Fetch file content from raw.githubusercontent.com
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} branch - Branch name
 * @param {string} path - File path
 * @returns {string} - File content
 */
export async function fetchFileContent(owner, repo, branch, path) {
    const url = `${RAW_GITHUB_BASE}/${owner}/${repo}/${branch}/${path}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to fetch file: ${path}`);
    }

    return response.text();
}

/**
 * Fetch multiple files in parallel with rate limiting
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} branch - Branch name
 * @param {Array} paths - Array of file paths
 * @param {function} onProgress - Progress callback
 * @returns {Array} - Array of {name, content} objects
 */
export async function fetchFiles(owner, repo, branch, paths, onProgress = null) {
    const files = [];
    const batchSize = 5; // Fetch 5 files at a time to avoid rate limiting

    for (let i = 0; i < paths.length; i += batchSize) {
        const batch = paths.slice(i, i + batchSize);

        const batchResults = await Promise.all(
            batch.map(async (path) => {
                try {
                    const content = await fetchFileContent(owner, repo, branch, path);
                    return { name: path, content };
                } catch (error) {
                    console.warn(`Failed to fetch ${path}:`, error.message);
                    return null;
                }
            })
        );

        files.push(...batchResults.filter(Boolean));

        if (onProgress) {
            onProgress({
                fetched: Math.min(i + batchSize, paths.length),
                total: paths.length
            });
        }

        // Small delay between batches to be nice to GitHub
        if (i + batchSize < paths.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    return files;
}

/**
 * Full repository scan workflow
 * @param {string} url - GitHub repository URL
 * @param {function} onProgress - Progress callback
 * @returns {object} - {repoInfo, files, tree}
 */
export async function scanGitHubRepo(url, onProgress = null) {
    // Parse URL
    const { owner, repo } = parseGitHubUrl(url);

    if (onProgress) onProgress({ phase: 'info', message: 'Fetching repository info...' });

    // Get repo info
    const repoInfo = await fetchRepoInfo(owner, repo);
    const branch = repoInfo.default_branch || 'main';

    if (onProgress) onProgress({ phase: 'tree', message: 'Fetching file tree...' });

    // Get file tree
    const tree = await fetchRepoTree(owner, repo, branch);

    // Filter scannable files
    const scannableFiles = tree.filter(f => shouldScanFile(f.path));

    if (onProgress) {
        onProgress({
            phase: 'files',
            message: `Found ${scannableFiles.length} files to scan`,
            totalFiles: scannableFiles.length
        });
    }

    // Limit to first 50 files for demo (avoid rate limiting)
    const filesToFetch = scannableFiles.slice(0, 50);

    // Fetch file contents
    const files = await fetchFiles(
        owner,
        repo,
        branch,
        filesToFetch.map(f => f.path),
        (progress) => {
            if (onProgress) {
                onProgress({
                    phase: 'downloading',
                    message: `Downloading files... (${progress.fetched}/${progress.total})`,
                    ...progress
                });
            }
        }
    );

    return {
        repoInfo: {
            owner,
            repo,
            branch,
            fullName: repoInfo.full_name,
            description: repoInfo.description,
            stars: repoInfo.stargazers_count,
            url: repoInfo.html_url
        },
        files,
        tree: scannableFiles
    };
}

export default {
    parseGitHubUrl,
    fetchRepoInfo,
    fetchRepoTree,
    fetchFileContent,
    fetchFiles,
    shouldScanFile,
    scanGitHubRepo
};
