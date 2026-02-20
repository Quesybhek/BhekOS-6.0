// Storage Utility
const BhekStorage = {
    // Save data with encryption
    save(key, value) {
        try {
            const serialized = JSON.stringify(value);
            localStorage.setItem(key, serialized);
            return true;
        } catch (e) {
            console.error('Storage save failed:', e);
            return false;
        }
    },

    // Load data with decryption
    load(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Storage load failed:', e);
            return defaultValue;
        }
    },

    // Save game score with encryption
    saveScore(game, score) {
        const scores = this.load('gameScores', {});
        if (!scores[game] || score > scores[game]) {
            scores[game] = score;
            return this.save('gameScores', scores);
        }
        return false;
    },

    // Get high score for game
    getHighScore(game) {
        const scores = this.load('gameScores', {});
        return scores[game] || 0;
    },

    // Clear all data
    clearAll() {
        if (confirm('Clear all data? This cannot be undone!')) {
            localStorage.clear();
            sessionStorage.clear();
            indexedDB.deleteDatabase('bhekos');
            location.reload();
        }
    }
};
