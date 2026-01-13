/**
 * Scanner Web Worker
 * Runs secret detection off the main thread
 */

import { scanContent, scanFiles, quickScan, isScannableFile } from './engine.js';

// Message handler
self.onmessage = async (event) => {
    const { id, type, payload } = event.data;

    try {
        let result;

        switch (type) {
            case 'scanContent':
                result = await scanContent(payload.content, payload.filename, payload.options);
                break;

            case 'scanFiles':
                result = await scanFiles(
                    payload.files,
                    payload.options,
                    // Progress callback - send to main thread
                    (progress) => {
                        self.postMessage({
                            id,
                            type: 'progress',
                            payload: progress,
                        });
                    }
                );
                break;

            case 'quickScan':
                result = quickScan(payload.content);
                break;

            case 'isScannableFile':
                result = isScannableFile(payload.filename);
                break;

            default:
                throw new Error(`Unknown message type: ${type}`);
        }

        self.postMessage({
            id,
            type: 'result',
            payload: result,
        });

    } catch (error) {
        self.postMessage({
            id,
            type: 'error',
            payload: {
                message: error.message,
                stack: error.stack,
            },
        });
    }
};

// Signal ready
self.postMessage({ type: 'ready' });
