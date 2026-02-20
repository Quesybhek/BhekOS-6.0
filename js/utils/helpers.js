// Helper Functions
const BhekHelpers = {
    // Generate random ID
    generateId() {
        return 'PID_' + Math.random().toString(36).substr(2, 8).toUpperCase();
    },

    // Format date/time
    formatTime(date = new Date()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },

    // Format date
    formatDate(date = new Date()) {
        return date.toLocaleDateString();
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Check if mobile device
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    // Deep clone object
    clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    // Merge objects
    merge(target, ...sources) {
        return Object.assign({}, target, ...sources);
    }
};
