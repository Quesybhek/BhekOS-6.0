// Enhanced Helper Functions
const BhekHelpers = {
    // Version info
    version: '1.0.0',

    // Generate unique IDs
    generateId(prefix = '') {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 9);
        return prefix + timestamp + random;
    },

    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    // Date/Time utilities
    formatTime(date = new Date(), format = 'short') {
        const formats = {
            short: { hour: '2-digit', minute: '2-digit' },
            long: { hour: '2-digit', minute: '2-digit', second: '2-digit' },
            full: { weekday: 'long', hour: '2-digit', minute: '2-digit' },
            date: { year: 'numeric', month: 'short', day: 'numeric' },
            datetime: { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit', 
                minute: '2-digit' 
            }
        };
        
        return date.toLocaleTimeString([], formats[format] || formats.short);
    },

    formatDate(date = new Date(), format = 'short') {
        const formats = {
            short: { month: 'numeric', day: 'numeric', year: '2-digit' },
            medium: { month: 'short', day: 'numeric', year: 'numeric' },
            long: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
            iso: (d) => d.toISOString().split('T')[0]
        };
        
        if (format === 'iso') {
            return date.toISOString().split('T')[0];
        }
        
        return date.toLocaleDateString([], formats[format] || formats.short);
    },

    formatRelativeTime(date) {
        const now = new Date();
        const diff = now - date;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        return 'just now';
    },

    // String utilities
    truncate(str, length = 50, suffix = '...') {
        if (str.length <= length) return str;
        return str.substr(0, length - suffix.length) + suffix;
    },

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },

    camelToTitle(str) {
        return str
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (s) => s.toUpperCase());
    },

    slugify(str) {
        return str
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/--+/g, '-')
            .trim();
    },

    // Number utilities
    formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
        
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    },

    formatNumber(num, decimals = 0) {
        return num.toLocaleString(undefined, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    },

    // Array utilities
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    },

    uniqueArray(array) {
        return [...new Set(array)];
    },

    chunkArray(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    },

    // Object utilities
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj);
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (obj instanceof Object) {
            const cloned = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    cloned[key] = this.deepClone(obj[key]);
                }
            }
            return cloned;
        }
    },

    mergeObjects(target, ...sources) {
        return Object.assign({}, target, ...sources);
    },

    pick(obj, keys) {
        return keys.reduce((acc, key) => {
            if (obj.hasOwnProperty(key)) {
                acc[key] = obj[key];
            }
            return acc;
        }, {});
    },

    omit(obj, keys) {
        const result = { ...obj };
        keys.forEach(key => delete result[key]);
        return result;
    },

    // DOM utilities
    createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);
        
        for (const [key, value] of Object.entries(attributes)) {
            if (key === 'style' && typeof value === 'object') {
                Object.assign(element.style, value);
            } else if (key === 'dataset') {
                Object.assign(element.dataset, value);
            } else if (key.startsWith('on') && typeof value === 'function') {
                element.addEventListener(key.slice(2), value);
            } else {
                element.setAttribute(key, value);
            }
        }
        
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof Node) {
                element.appendChild(child);
            }
        });
        
        return element;
    },

    removeElement(element) {
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    },

    addClass(element, className) {
        if (element) element.classList.add(className);
    },

    removeClass(element, className) {
        if (element) element.classList.remove(className);
    },

    toggleClass(element, className) {
        if (element) element.classList.toggle(className);
    },

    // Event utilities
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

    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Device detection
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    isTouchDevice() {
        return ('ontouchstart' in window) || 
               (navigator.maxTouchPoints > 0) || 
               (navigator.msMaxTouchPoints > 0);
    },

    isOnline() {
        return navigator.onLine;
    },

    // Browser detection
    getBrowser() {
        const ua = navigator.userAgent;
        let browser = 'unknown';
        
        if (ua.indexOf('Firefox') > -1) browser = 'firefox';
        else if (ua.indexOf('Chrome') > -1) browser = 'chrome';
        else if (ua.indexOf('Safari') > -1) browser = 'safari';
        else if (ua.indexOf('Edge') > -1) browser = 'edge';
        else if (ua.indexOf('MSIE') > -1 || ua.indexOf('Trident') > -1) browser = 'ie';
        
        return browser;
    },

    // Color utilities
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },

    rgbToHex(r, g, b) {
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    },

    // Validation utilities
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },

    // Math utilities
    clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
    },

    random(min, max) {
        return Math.random() * (max - min) + min;
    },

    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // Performance utilities
    measureTime(fn) {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        return { result, time: end - start };
    },

    async measureTimeAsync(fn) {
        const start = performance.now();
        const result = await fn();
        const end = performance.now();
        return { result, time: end - start };
    },

    // Color manipulation
    lightenColor(color, percent) {
        const rgb = this.hexToRgb(color);
        if (!rgb) return color;
        
        const r = Math.min(255, rgb.r + (255 - rgb.r) * percent / 100);
        const g = Math.min(255, rgb.g + (255 - rgb.g) * percent / 100);
        const b = Math.min(255, rgb.b + (255 - rgb.b) * percent / 100);
        
        return this.rgbToHex(Math.round(r), Math.round(g), Math.round(b));
    },

    darkenColor(color, percent) {
        const rgb = this.hexToRgb(color);
        if (!rgb) return color;
        
        const r = Math.max(0, rgb.r - rgb.r * percent / 100);
        const g = Math.max(0, rgb.g - rgb.g * percent / 100);
        const b = Math.max(0, rgb.b - rgb.b * percent / 100);
        
        return this.rgbToHex(Math.round(r), Math.round(g), Math.round(b));
    },

    // Animation utilities
    async animate(element, keyframes, options) {
        return new Promise(resolve => {
            const animation = element.animate(keyframes, options);
            animation.onfinish = resolve;
        });
    },

    fadeIn(element, duration = 300) {
        element.style.opacity = '0';
        element.style.display = 'block';
        
        return this.animate(element, [
            { opacity: 0 },
            { opacity: 1 }
        ], { duration, easing: 'ease-in' });
    },

    fadeOut(element, duration = 300) {
        return this.animate(element, [
            { opacity: 1 },
            { opacity: 0 }
        ], { duration, easing: 'ease-out' }).then(() => {
            element.style.display = 'none';
        });
    },

    // Cookie utilities
    setCookie(name, value, days = 7) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = `expires=${date.toUTCString()}`;
        document.cookie = `${name}=${value};${expires};path=/`;
    },

    getCookie(name) {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [cookieName, cookieValue] = cookie.trim().split('=');
            if (cookieName === name) {
                return cookieValue;
            }
        }
        return null;
    },

    deleteCookie(name) {
        this.setCookie(name, '', -1);
    },

    // Query string utilities
    getQueryParams() {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        for (const [key, value] of params) {
            result[key] = value;
        }
        return result;
    },

    buildQueryString(params) {
        return Object.entries(params)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&');
    },

    // Platform detection
    isWindows() {
        return navigator.platform.indexOf('Win') > -1;
    },

    isMac() {
        return navigator.platform.indexOf('Mac') > -1;
    },

    isLinux() {
        return navigator.platform.indexOf('Linux') > -1;
    },

    isiOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent);
    },

    isAndroid() {
        return /Android/.test(navigator.userAgent);
    },

    // Keyboard utilities
    isModifierKey(e) {
        return e.ctrlKey || e.metaKey || e.altKey || e.shiftKey;
    },

    getKeyCombo(e) {
        const parts = [];
        if (e.ctrlKey) parts.push('Ctrl');
        if (e.metaKey) parts.push('Cmd');
        if (e.altKey) parts.push('Alt');
        if (e.shiftKey) parts.push('Shift');
        
        if (e.key && !['Control', 'Meta', 'Alt', 'Shift'].includes(e.key)) {
            parts.push(e.key.length === 1 ? e.key.toUpperCase() : e.key);
        }
        
        return parts.join('+');
    },

    // Sound utilities
    playSound(frequency = 600, duration = 100, volume = 0.1) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        gainNode.gain.value = volume;
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + duration / 1000);
    },

    // Clipboard utilities
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            return true;
        }
    },

    async readFromClipboard() {
        try {
            return await navigator.clipboard.readText();
        } catch {
            return null;
        }
    },

    // File utilities
    async readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    },

    async readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },

    downloadFile(content, filename, type = 'text/plain') {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    },

    // Localization
    getCurrentLanguage() {
        return navigator.language || navigator.userLanguage || 'en-US';
    },

    formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat(this.getCurrentLanguage(), {
            style: 'currency',
            currency
        }).format(amount);
    },

    formatPercentage(value, decimals = 0) {
        return new Intl.NumberFormat(this.getCurrentLanguage(), {
            style: 'percent',
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(value / 100);
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BhekHelpers;
    }
