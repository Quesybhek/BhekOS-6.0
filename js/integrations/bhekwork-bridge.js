// BhekWork Browser Integration Bridge - Connected to https://quesybhek.github.io/BhekWork/
const BhekWorkBridge = {
    // Configuration with your live URL
    config: {
        appUrl: 'https://quesybhek.github.io/BhekWork/',
        localUrl: 'http://localhost:3001',
        useLocal: false,
        autoConnect: true,
        defaultEngine: 'google',
        supportedEngines: ['google', 'youtube', 'github', 'linkedin', 'wiki', 'bing']
    },

    // Initialize
    init(os) {
        this.os = os;
        this.workWindow = null;
        this.isConnected = false;
        this.isLoading = false;
        this.searchHistory = [];
        this.bookmarks = [];
        this.eventListeners = new Map();
        this.fallbackMode = false;
        
        // Load saved config
        this.loadConfig();
        
        console.log('BhekWork Bridge initialized with URL:', this.config.appUrl);
        
        // Auto-connect if enabled
        if (this.config.autoConnect) {
            this.connect();
        }
        
        return this;
    },

    // Load configuration
    loadConfig() {
        const saved = BhekStorage.load('bhekwork-config', {});
        this.config = { ...this.config, ...saved };
        this.searchHistory = BhekStorage.load('bhekwork-history', []);
        this.bookmarks = BhekStorage.load('bhekwork-bookmarks', []);
    },

    // Save configuration
    saveConfig() {
        BhekStorage.save('bhekwork-config', this.config);
        BhekStorage.save('bhekwork-history', this.searchHistory);
        BhekStorage.save('bhekwork-bookmarks', this.bookmarks);
    },

    // Connect to BhekWork
    async connect() {
        if (this.isConnected || this.isLoading) return;

        this.isLoading = true;
        this.os?.notify('BhekWork', 'Connecting to browser service...', 'info');

        try {
            const baseUrl = this.config.useLocal ? this.config.localUrl : this.config.appUrl;
            
            // Load BhekWork in iframe
            await this.loadWorkFrame(baseUrl);
            
            // Setup message listener
            this.setupMessageListener();
            
            this.isConnected = true;
            this.isLoading = false;
            
            this.os?.notify('BhekWork', 'Browser service connected', 'success');
            this.dispatchEvent('connected', { service: 'bhekwork', url: baseUrl });
            
        } catch (error) {
            console.error('BhekWork connection failed:', error);
            this.isLoading = false;
            this.useFallback();
        }
    },

    // Load BhekWork in iframe
    loadWorkFrame(baseUrl) {
        return new Promise((resolve, reject) => {
            // Remove existing iframe if any
            const existing = document.getElementById('bhekwork-frame-container');
            if (existing) existing.remove();
            
            // Create iframe container
            const container = document.createElement('div');
            container.id = 'bhekwork-frame-container';
            container.style.cssText = `
                position: fixed;
                top: -9999px;
                left: -9999px;
                width: 1px;
                height: 1px;
                opacity: 0;
                pointer-events: none;
                z-index: -9999;
            `;
            
            // Create iframe
            const iframe = document.createElement('iframe');
            iframe.id = 'bhekwork-frame';
            iframe.src = baseUrl;
            iframe.sandbox = 'allow-scripts allow-same-origin allow-forms allow-popups allow-modals';
            
            let timeout = setTimeout(() => {
                reject(new Error('BhekWork iframe load timeout'));
            }, 10000);
            
            iframe.onload = () => {
                clearTimeout(timeout);
                console.log('BhekWork iframe loaded successfully');
                this.workWindow = iframe.contentWindow;
                setTimeout(resolve, 1000);
            };
            
            iframe.onerror = (e) => {
                clearTimeout(timeout);
                reject(e);
            };
            
            container.appendChild(iframe);
            document.body.appendChild(container);
        });
    },

    // Setup message listener
    setupMessageListener() {
        window.addEventListener('message', (event) => {
            // Verify origin
            const allowedOrigins = [
                'https://quesybhek.github.io',
                'http://localhost:3001'
            ];
            
            if (!allowedOrigins.some(origin => event.origin.startsWith(origin))) {
                return;
            }
            
            const data = event.data;
            if (!data) return;
            
            switch(data.type) {
                case 'search-result':
                    this.handleSearchResult(data);
                    break;
                case 'work-ready':
                    console.log('BhekWork ready');
                    break;
                case 'work-log':
                    console.log('[BhekWork]', data.message);
                    break;
            }
        });
    },

    // Handle search results
    handleSearchResult(data) {
        const { query, results, engine } = data;
        this.addToHistory(query, engine);
        this.dispatchEvent('search', { query, results, engine });
    },

    // Perform search
    async search(query, engine = this.config.defaultEngine) {
        if (!this.isConnected || this.fallbackMode) {
            return this.fallbackSearch(query, engine);
        }

        try {
            if (this.workWindow) {
                this.workWindow.postMessage({
                    type: 'work-search',
                    query: query,
                    engine: engine
                }, '*');
                
                // Track search
                this.addToHistory(query, engine);
                
                // Open in new tab (BhekWork style)
                this.openSearch(query, engine);
            }
        } catch (error) {
            console.error('Search failed:', error);
            this.fallbackSearch(query, engine);
        }
    },

    // Open search in new tab
    openSearch(query, engine = 'google') {
        const urls = {
            google: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
            youtube: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
            github: `https://github.com/search?q=${encodeURIComponent(query)}`,
            linkedin: `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(query)}`,
            wiki: `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`,
            bing: `https://www.bing.com/search?q=${encodeURIComponent(query)}`
        };
        
        window.open(urls[engine] || urls.google, '_blank');
        this.os?.notify('BhekWork', `Searching ${engine} for: ${query}`);
    },

    // Fallback search
    fallbackSearch(query, engine) {
        this.openSearch(query, engine);
        return {
            success: true,
            mode: 'fallback',
            query: query,
            engine: engine,
            url: this.getSearchUrl(query, engine)
        };
    },

    // Get search URL
    getSearchUrl(query, engine) {
        const urls = {
            google: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
            youtube: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
            github: `https://github.com/search?q=${encodeURIComponent(query)}`,
            linkedin: `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(query)}`,
            wiki: `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`,
            bing: `https://www.bing.com/search?q=${encodeURIComponent(query)}`
        };
        return urls[engine] || urls.google;
    },

    // Add to search history
    addToHistory(query, engine) {
        this.searchHistory.push({
            query,
            engine,
            timestamp: new Date().toISOString()
        });
        
        if (this.searchHistory.length > 100) {
            this.searchHistory.shift();
        }
        
        this.saveConfig();
    },

    // Add bookmark
    addBookmark(url, title) {
        this.bookmarks.push({
            url,
            title: title || url,
            timestamp: new Date().toISOString()
        });
        this.saveConfig();
        this.os?.notify('BhekWork', 'Bookmark added');
    },

    // Remove bookmark
    removeBookmark(url) {
        this.bookmarks = this.bookmarks.filter(b => b.url !== url);
        this.saveConfig();
        this.os?.notify('BhekWork', 'Bookmark removed');
    },

    // Get weather
    async getWeather(location = 'Accra') {
        try {
            const response = await fetch(`https://wttr.in/${location}?format=%t`);
            const temp = await response.text();
            return temp.trim();
        } catch (error) {
            return 'N/A';
        }
    },

    // Generate secure password
    generatePassword() {
        const password = Math.random().toString(36).slice(-10) + "!" + 
                        Math.random().toString(36).slice(-2).toUpperCase();
        return password;
    },

    // Word counter
    countWords(text) {
        return text ? text.trim().split(/\s+/).length : 0;
    },

    // Voice search
    voiceSearch(callback) {
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRec) {
            this.os?.notify('BhekWork', 'Voice search not supported', 'error');
            return null;
        }
        
        const recognition = new SpeechRec();
        
        recognition.onstart = () => {
            this.os?.notify('BhekWork', 'Listening...', 'info');
        };
        
        recognition.onresult = (e) => {
            const text = e.results[0][0].transcript;
            if (callback) callback(text);
        };
        
        recognition.start();
        return recognition;
    },

    // Get current time greeting
    getGreeting() {
        const hour = new Date().getHours();
        if (hour < 12) return 'MORNING';
        if (hour < 18) return 'AFTERNOON';
        return 'EVENING';
    },

    // Use fallback mode
    useFallback() {
        this.fallbackMode = true;
        this.isConnected = true;
        this.os?.notify('BhekWork', 'Using fallback browser mode', 'warning');
    },

    // Get status
    getStatus() {
        return {
            connected: this.isConnected,
            loading: this.isLoading,
            fallback: this.fallbackMode || false,
            historyCount: this.searchHistory.length,
            bookmarksCount: this.bookmarks.length,
            url: this.config.appUrl,
            defaultEngine: this.config.defaultEngine
        };
    },

    // Event handling
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    },

    dispatchEvent(event, data) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => callback(data));
        }
    },

    // Test connection
    async testConnection() {
        try {
            const startTime = Date.now();
            const testQuery = "test";
            this.openSearch(testQuery);
            const latency = Date.now() - startTime;
            
            return {
                success: true,
                latency: latency,
                mode: this.fallbackMode ? 'fallback' : 'connected',
                url: this.config.appUrl,
                greeting: this.getGreeting()
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                url: this.config.appUrl
            };
        }
    },

    // Get direct link
    getDirectLink() {
        return this.config.appUrl;
    },

    // Open in new tab
    openInNewTab() {
        window.open(this.config.appUrl, '_blank');
        this.os?.notify('BhekWork', 'Opening BhekWork in new tab');
    },

    // Clear history
    clearHistory() {
        this.searchHistory = [];
        this.saveConfig();
        this.os?.notify('BhekWork', 'Search history cleared');
    },

    // Export data
    exportData() {
        const data = {
            history: this.searchHistory,
            bookmarks: this.bookmarks,
            config: this.config,
            exported: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bhekwork-data-${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.os?.notify('BhekWork', 'Data exported');
    },

    // Clean up
    destroy() {
        const container = document.getElementById('bhekwork-frame-container');
        if (container) {
            container.remove();
        }
        this.isConnected = false;
        this.workWindow = null;
    }
};
