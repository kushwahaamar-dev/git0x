/**
 * IndexedDB Storage Layer
 * Replaces localStorage with IndexedDB for unlimited storage
 */

const DB_NAME = 'gitguardian';
const DB_VERSION = 1;

const STORES = {
    scans: 'scans',
    settings: 'settings',
    analytics: 'analytics',
};

let dbPromise = null;

/**
 * Open/initialize the database
 */
function openDB() {
    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            // Scans store with indexes
            if (!db.objectStoreNames.contains(STORES.scans)) {
                const scansStore = db.createObjectStore(STORES.scans, { keyPath: 'id', autoIncrement: true });
                scansStore.createIndex('timestamp', 'timestamp', { unique: false });
                scansStore.createIndex('repoName', 'repoName', { unique: false });
            }

            // Settings store (key-value)
            if (!db.objectStoreNames.contains(STORES.settings)) {
                db.createObjectStore(STORES.settings, { keyPath: 'key' });
            }

            // Analytics store
            if (!db.objectStoreNames.contains(STORES.analytics)) {
                db.createObjectStore(STORES.analytics, { keyPath: 'id' });
            }
        };
    });

    return dbPromise;
}

/**
 * Get a transaction and store
 */
async function getStore(storeName, mode = 'readonly') {
    const db = await openDB();
    const tx = db.transaction(storeName, mode);
    return tx.objectStore(storeName);
}

/**
 * Wrap IDB request in a promise
 */
function promisify(request) {
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// ========== SCAN RESULTS ==========

/**
 * Save a scan result
 */
export async function saveScanResult(result) {
    const store = await getStore(STORES.scans, 'readwrite');
    const record = {
        ...result,
        timestamp: result.timestamp || new Date().toISOString(),
    };
    const id = await promisify(store.add(record));
    return { ...record, id };
}

/**
 * Get all scan results (sorted by timestamp desc)
 */
export async function getAllScanResults() {
    const store = await getStore(STORES.scans);
    const index = store.index('timestamp');
    const results = await promisify(index.getAll());
    return results.reverse(); // Most recent first
}

/**
 * Get recent scans (limited)
 */
export async function getRecentScans(limit = 10) {
    const all = await getAllScanResults();
    return all.slice(0, limit);
}

/**
 * Get a single scan by ID
 */
export async function getScanById(id) {
    const store = await getStore(STORES.scans);
    return promisify(store.get(id));
}

/**
 * Delete a scan
 */
export async function deleteScan(id) {
    const store = await getStore(STORES.scans, 'readwrite');
    return promisify(store.delete(id));
}

/**
 * Clear all scans
 */
export async function clearAllScans() {
    const store = await getStore(STORES.scans, 'readwrite');
    return promisify(store.clear());
}

// ========== SETTINGS ==========

const DEFAULT_SETTINGS = {
    minConfidence: 50,
    enableEntropy: true,
    enablePatterns: true,
    theme: 'dark',
};

/**
 * Get all settings
 */
export async function getSettings() {
    try {
        const store = await getStore(STORES.settings);
        const record = await promisify(store.get('userSettings'));
        return { ...DEFAULT_SETTINGS, ...(record?.value || {}) };
    } catch (e) {
        return DEFAULT_SETTINGS;
    }
}

/**
 * Save settings
 */
export async function saveSettings(settings) {
    const store = await getStore(STORES.settings, 'readwrite');
    return promisify(store.put({ key: 'userSettings', value: settings }));
}

// ========== ANALYTICS ==========

/**
 * Get analytics data
 */
export async function getAnalytics() {
    try {
        const store = await getStore(STORES.analytics);
        const record = await promisify(store.get('stats'));
        return record?.value || { totalScans: 0, totalFindings: 0, bySeverity: {} };
    } catch (e) {
        return { totalScans: 0, totalFindings: 0, bySeverity: {} };
    }
}

/**
 * Update analytics after a scan
 */
export async function updateAnalytics(scanResult) {
    const current = await getAnalytics();

    const updated = {
        totalScans: current.totalScans + 1,
        totalFindings: current.totalFindings + (scanResult.summary?.totalFindings || 0),
        bySeverity: {
            critical: (current.bySeverity?.critical || 0) + (scanResult.summary?.bySeverity?.critical || 0),
            high: (current.bySeverity?.high || 0) + (scanResult.summary?.bySeverity?.high || 0),
            medium: (current.bySeverity?.medium || 0) + (scanResult.summary?.bySeverity?.medium || 0),
            low: (current.bySeverity?.low || 0) + (scanResult.summary?.bySeverity?.low || 0),
        },
        lastScan: new Date().toISOString(),
    };

    const store = await getStore(STORES.analytics, 'readwrite');
    await promisify(store.put({ id: 'stats', value: updated }));
    return updated;
}

// ========== DATA MANAGEMENT ==========

/**
 * Export all data
 */
export async function exportData() {
    const scans = await getAllScanResults();
    const settings = await getSettings();
    const analytics = await getAnalytics();

    return {
        version: 1,
        exportedAt: new Date().toISOString(),
        scans,
        settings,
        analytics,
    };
}

/**
 * Import data
 */
export async function importData(data) {
    if (data.scans) {
        const store = await getStore(STORES.scans, 'readwrite');
        for (const scan of data.scans) {
            await promisify(store.add(scan));
        }
    }
    if (data.settings) {
        await saveSettings(data.settings);
    }
}

/**
 * Clear all data
 */
export async function clearAllData() {
    await clearAllScans();
    const settingsStore = await getStore(STORES.settings, 'readwrite');
    await promisify(settingsStore.clear());
    const analyticsStore = await getStore(STORES.analytics, 'readwrite');
    await promisify(analyticsStore.clear());
}

/**
 * Migrate from localStorage (one-time)
 */
export async function migrateFromLocalStorage() {
    try {
        const oldScans = localStorage.getItem('gitguardian_scans');
        const oldSettings = localStorage.getItem('gitguardian_settings');

        if (oldScans) {
            const scans = JSON.parse(oldScans);
            for (const scan of scans) {
                await saveScanResult(scan);
            }
            localStorage.removeItem('gitguardian_scans');
        }

        if (oldSettings) {
            await saveSettings(JSON.parse(oldSettings));
            localStorage.removeItem('gitguardian_settings');
        }

        console.log('[Storage] Migration from localStorage complete');
    } catch (e) {
        console.warn('[Storage] Migration failed:', e);
    }
}

// Run migration on load
migrateFromLocalStorage();

export default {
    saveScanResult,
    getAllScanResults,
    getRecentScans,
    getScanById,
    deleteScan,
    clearAllScans,
    getSettings,
    saveSettings,
    getAnalytics,
    updateAnalytics,
    exportData,
    importData,
    clearAllData,
};
