/**
 * Scanner Client
 * Bridge to communicate with the scanner Web Worker
 * Falls back to main thread if workers unsupported
 */

let worker = null;
let messageId = 0;
const pendingMessages = new Map();
const progressCallbacks = new Map();

/**
 * Initialize the worker
 */
function initWorker() {
    if (worker) return worker;

    try {
        // Create worker from module
        worker = new Worker(
            new URL('./worker.js', import.meta.url),
            { type: 'module' }
        );

        worker.onmessage = (event) => {
            const { id, type, payload } = event.data;

            if (type === 'ready') {
                console.log('[Scanner] Worker ready');
                return;
            }

            if (type === 'progress') {
                const callback = progressCallbacks.get(id);
                if (callback) callback(payload);
                return;
            }

            const pending = pendingMessages.get(id);
            if (!pending) return;

            pendingMessages.delete(id);
            progressCallbacks.delete(id);

            if (type === 'error') {
                pending.reject(new Error(payload.message));
            } else {
                pending.resolve(payload);
            }
        };

        worker.onerror = (error) => {
            console.error('[Scanner] Worker error:', error);
        };

        return worker;
    } catch (e) {
        console.warn('[Scanner] Worker initialization failed, using main thread:', e);
        return null;
    }
}

/**
 * Send message to worker and wait for response
 */
function sendMessage(type, payload, onProgress) {
    const w = initWorker();

    // Fallback to main thread if worker unavailable
    if (!w) {
        return import('./engine.js').then((engine) => {
            switch (type) {
                case 'scanContent':
                    return engine.scanContent(payload.content, payload.filename, payload.options);
                case 'scanFiles':
                    return engine.scanFiles(payload.files, payload.options, onProgress);
                case 'quickScan':
                    return engine.quickScan(payload.content);
                case 'isScannableFile':
                    return engine.isScannableFile(payload.filename);
                default:
                    throw new Error(`Unknown type: ${type}`);
            }
        });
    }

    return new Promise((resolve, reject) => {
        const id = ++messageId;
        pendingMessages.set(id, { resolve, reject });

        if (onProgress) {
            progressCallbacks.set(id, onProgress);
        }

        w.postMessage({ id, type, payload });
    });
}

/**
 * Scan file content (off main thread)
 */
export function scanContent(content, filename, options = {}) {
    return sendMessage('scanContent', { content, filename, options });
}

/**
 * Scan multiple files (off main thread)
 */
export function scanFiles(files, options = {}, onProgress) {
    return sendMessage('scanFiles', { files, options }, onProgress);
}

/**
 * Quick scan for real-time highlighting
 * Uses main thread for low latency
 */
export async function quickScan(content) {
    // For real-time, we use main thread to avoid message overhead
    const { quickScan: qs } = await import('./engine.js');
    return qs(content);
}

/**
 * Check if file should be scanned
 */
export function isScannableFile(filename) {
    return sendMessage('isScannableFile', { filename });
}

/**
 * Terminate the worker (cleanup)
 */
export function terminate() {
    if (worker) {
        worker.terminate();
        worker = null;
    }
}

export default {
    scanContent,
    scanFiles,
    quickScan,
    isScannableFile,
    terminate,
};
