// Enhanced Storage Utility with Encryption
const BhekStorage = {
    // Encryption key (in a real app, this would be more secure)
    encryptionKey: 'bhekos-secure-key-2024',

    // Save data with optional encryption
    save(key, value, encrypt = false) {
        try {
            let dataToStore = value;
            
            if (encrypt) {
                dataToStore = this.encrypt(JSON.stringify(value));
            } else {
                dataToStore = JSON.stringify(value);
            }
            
            localStorage.setItem(key, dataToStore);
            
            // Trigger storage event for cross-tab sync
            this.notifyStorageChange(key, value);
            
            return true;
        } catch (e) {
            console.error('Storage save failed:', e);
            return false;
        }
    },

    // Load data with decryption
    load(key, defaultValue = null, encrypted = false) {
        try {
            const item = localStorage.getItem(key);
            
            if (!item) return defaultValue;
            
            if (encrypted) {
                const decrypted = this.decrypt(item);
                return decrypted ? JSON.parse(decrypted) : defaultValue;
            } else {
                return JSON.parse(item);
            }
        } catch (e) {
            console.error('Storage load failed:', e);
            return defaultValue;
        }
    },

    // Simple XOR encryption (for demonstration - in production, use proper crypto)
    encrypt(data) {
        let result = '';
        for (let i = 0; i < data.length; i++) {
            result += String.fromCharCode(data.charCodeAt(i) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length));
        }
        return btoa(result); // Base64 encode
    },

    decrypt(data) {
        try {
            const decoded = atob(data);
            let result = '';
            for (let i = 0; i < decoded.length; i++) {
                result += String.fromCharCode(decoded.charCodeAt(i) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length));
            }
            return result;
        } catch (e) {
            console.error('Decryption failed:', e);
            return null;
        }
    },

    // Game score management
    saveScore(game, score, metadata = {}) {
        const scores = this.load('gameScores', {});
        
        if (!scores[game] || score > scores[game].score) {
            scores[game] = {
                score: score,
                date: new Date().toISOString(),
                ...metadata
            };
            return this.save('gameScores', scores, true);
        }
        return false;
    },

    getHighScore(game) {
        const scores = this.load('gameScores', {}, true);
        return scores[game]?.score || 0;
    },

    getAllScores() {
        return this.load('gameScores', {}, true);
    },

    // User preferences
    savePreference(key, value) {
        const prefs = this.load('userPreferences', {});
        prefs[key] = value;
        return this.save('userPreferences', prefs);
    },

    getPreference(key, defaultValue = null) {
        const prefs = this.load('userPreferences', {});
        return prefs.hasOwnProperty(key) ? prefs[key] : defaultValue;
    },

    // File system simulation
    saveFile(path, content, metadata = {}) {
        const files = this.load('fileSystem', {});
        
        files[path] = {
            content: content,
            modified: new Date().toISOString(),
            size: content.length,
            ...metadata
        };
        
        return this.save('fileSystem', files, true);
    },

    readFile(path) {
        const files = this.load('fileSystem', {}, true);
        return files[path] || null;
    },

    listFiles(directory = '/') {
        const files = this.load('fileSystem', {}, true);
        return Object.keys(files)
            .filter(path => path.startsWith(directory))
            .map(path => ({
                path,
                ...files[path]
            }));
    },

    deleteFile(path) {
        const files = this.load('fileSystem', {}, true);
        if (files[path]) {
            delete files[path];
            return this.save('fileSystem', files, true);
        }
        return false;
    },

    // Session management (cleared when browser closes)
    session: {
        save(key, value) {
            try {
                sessionStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (e) {
                console.error('Session save failed:', e);
                return false;
            }
        },

        load(key, defaultValue = null) {
            try {
                const item = sessionStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (e) {
                console.error('Session load failed:', e);
                return defaultValue;
            }
        },

        clear() {
            sessionStorage.clear();
        }
    },

    // Storage management
    getUsage() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length * 2; // Approximate size in bytes
            }
        }
        return {
            bytes: total,
            kilobytes: Math.round(total / 1024),
            megabytes: (total / (1024 * 1024)).toFixed(2)
        };
    },

    clearAll(confirm = true) {
        if (!confirm || window.confirm('Clear all data? This cannot be undone!')) {
            localStorage.clear();
            sessionStorage.clear();
            indexedDB.deleteDatabase('bhekos');
            return true;
        }
        return false;
    },

    // Export/Import
    exportData() {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            data[key] = localStorage.getItem(key);
        }
        return data;
    },

    importData(data, merge = false) {
        if (!merge) {
            localStorage.clear();
        }
        
        for (let [key, value] of Object.entries(data)) {
            localStorage.setItem(key, value);
        }
        
        return true;
    },

    // Cross-tab synchronization
    notifyStorageChange(key, value) {
        const event = new CustomEvent('bhekStorageChange', {
            detail: { key, value }
        });
        window.dispatchEvent(event);
    },

    // Migration helper
    migrate(oldKey, newKey, transformer = null) {
        const oldData = this.load(oldKey);
        if (oldData !== null) {
            const newData = transformer ? transformer(oldData) : oldData;
            this.save(newKey, newData);
            localStorage.removeItem(oldKey);
            return true;
        }
        return false;
    }
};

// Listen for storage changes from other tabs
window.addEventListener('storage', (e) => {
    if (e.key) {
        const event = new CustomEvent('bhekStorageChange', {
            detail: { key: e.key, value: JSON.parse(e.newValue) }
        });
        window.dispatchEvent(event);
    }
});
