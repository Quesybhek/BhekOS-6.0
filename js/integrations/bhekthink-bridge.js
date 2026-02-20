// BhekThink Integration Bridge - Connected to https://quesybhek.github.io/BhekThink-AI-Pro/
const BhekThinkBridge = {
    // Configuration with your live URL
    config: {
        appUrl: 'https://quesybhek.github.io/BhekThink-AI-Pro/',
        localUrl: 'http://localhost:3000',
        useLocal: false,
        autoConnect: true,
        version: '1000.5'
    },

    // Initialize
    init(os) {
        this.os = os;
        this.thinkWindow = null;
        this.isConnected = false;
        this.isLoading = false;
        this.messageQueue = [];
        this.eventListeners = new Map();
        this.conversationHistory = [];
        this.authToken = null;
        this.user = null;
        this.fallbackMode = false;
        this.pendingMessages = {};
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        
        // Load saved config
        this.loadConfig();
        
        console.log('BhekThink Bridge initialized with URL:', this.config.appUrl);
        
        // Auto-connect if enabled
        if (this.config.autoConnect) {
            this.connect();
        }
        
        return this;
    },

    // Load configuration
    loadConfig() {
        const saved = BhekStorage.load('bhekthink-config', {});
        this.config = { ...this.config, ...saved };
        this.conversationHistory = BhekStorage.load('bhekthink-history', []);
    },

    // Save configuration
    saveConfig() {
        BhekStorage.save('bhekthink-config', this.config);
        BhekStorage.save('bhekthink-history', this.conversationHistory, true);
    },

    // Connect to BhekThink
    async connect() {
        if (this.isConnected || this.isLoading) return;

        this.isLoading = true;
        this.os?.notify('BhekThink', 'Connecting to AI Sovereign...', 'info');

        try {
            const baseUrl = this.config.useLocal ? this.config.localUrl : this.config.appUrl;
            
            // Load BhekThink in iframe
            await this.loadThinkFrame(baseUrl);
            
            // Setup message listener
            this.setupMessageListener();
            
            // Wait for iframe to initialize
            await this.waitForIframe();
            
            this.isConnected = true;
            this.isLoading = false;
            this.reconnectAttempts = 0;
            
            this.os?.notify('BhekThink', 'AI Sovereign connected', 'success');
            this.dispatchEvent('connected', { service: 'bhekthink', url: baseUrl });
            
            // Process queued messages
            this.processQueue();
            
            // Try to authenticate
            setTimeout(() => this.authenticate(), 1000);
            
        } catch (error) {
            console.error('BhekThink connection failed:', error);
            this.isLoading = false;
            this.reconnectAttempts++;
            
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
                this.os?.notify('BhekThink', `Reconnecting in ${delay/1000}s...`, 'warning');
                setTimeout(() => this.connect(), delay);
            } else {
                this.useFallback();
            }
        }
    },

    // Load BhekThink in iframe
    loadThinkFrame(baseUrl) {
        return new Promise((resolve, reject) => {
            // Remove existing iframe if any
            const existing = document.getElementById('bhekthink-frame-container');
            if (existing) existing.remove();
            
            // Create iframe container
            const container = document.createElement('div');
            container.id = 'bhekthink-frame-container';
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
            iframe.id = 'bhekthink-frame';
            iframe.src = baseUrl;
            iframe.sandbox = 'allow-scripts allow-same-origin allow-forms allow-popups allow-modals';
            
            let timeout = setTimeout(() => {
                reject(new Error('BhekThink iframe load timeout'));
            }, 10000);
            
            iframe.onload = () => {
                clearTimeout(timeout);
                console.log('BhekThink iframe loaded successfully');
                this.thinkWindow = iframe.contentWindow;
                
                // Give it a moment to initialize
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

    // Wait for iframe to be ready
    waitForIframe() {
        return new Promise((resolve) => {
            let attempts = 0;
            const check = setInterval(() => {
                attempts++;
                if (this.thinkWindow) {
                    clearInterval(check);
                    resolve();
                } else if (attempts > 50) { // 5 seconds
                    clearInterval(check);
                    resolve(); // Continue anyway
                }
            }, 100);
        });
    },

    // Setup message listener for iframe communication
    setupMessageListener() {
        window.addEventListener('message', (event) => {
            // Verify origin - accept your GitHub Pages URL
            const allowedOrigins = [
                'https://quesybhek.github.io',
                'http://localhost:3000'
            ];
            
            if (!allowedOrigins.some(origin => event.origin.startsWith(origin))) {
                return;
            }
            
            const data = event.data;
            if (!data || !data.type) return;
            
            console.log('BhekThink message:', data.type);
            
            switch(data.type) {
                case 'think-response':
                case 'response':
                    this.handleResponse(data);
                    break;
                    
                case 'think-ready':
                case 'ready':
                    console.log('BhekThink ready');
                    this.sendConfig();
                    break;
                    
                case 'think-auth':
                case 'auth':
                    this.handleAuth(data);
                    break;
                    
                case 'think-log':
                case 'log':
                    this.handleLog(data);
                    break;
                    
                case 'think-image':
                case 'image':
                    this.handleImage(data);
                    break;
                    
                case 'think-error':
                case 'error':
                    this.handleError(data);
                    break;
            }
        });
    },

    // Send configuration to BhekThink
    sendConfig() {
        if (!this.thinkWindow) return;
        
        try {
            this.thinkWindow.postMessage({
                type: 'think-config',
                config: {
                    lang: this.getLanguage(),
                    theme: 'dark',
                    user: this.user,
                    source: 'bhekos',
                    version: this.config.version
                }
            }, '*');
            
            console.log('Config sent to BhekThink');
        } catch (error) {
            console.error('Failed to send config:', error);
        }
    },

    // Handle response from BhekThink
    handleResponse(data) {
        const messageId = data.id || data.messageId;
        const response = data.response || data.content || data.text;
        const query = data.query || data.message;
        
        // Find and resolve promise
        if (messageId && this.pendingMessages[messageId]) {
            this.pendingMessages[messageId].resolve(response);
            delete this.pendingMessages[messageId];
        }
        
        // Save to history
        if (query && response) {
            this.saveToHistory(query, response);
        }
        
        this.dispatchEvent('response', { query, response });
    },

    // Handle authentication
    handleAuth(data) {
        this.authToken = data.token;
        this.user = data.user || { username: 'BhekThink User' };
        this.os?.notify('BhekThink', `Authenticated as ${this.user.username}`, 'success');
        this.dispatchEvent('auth', this.user);
    },

    // Handle logs
    handleLog(data) {
        const message = data.message || data.text || 'BhekThink log';
        console.log('[BhekThink]', message);
    },

    // Handle image generation
    handleImage(data) {
        const imageUrl = data.url || data.src;
        const messageId = data.id;
        
        if (messageId && this.pendingMessages[messageId]) {
            this.pendingMessages[messageId].resolve({ type: 'image', url: imageUrl });
            delete this.pendingMessages[messageId];
        }
        
        this.dispatchEvent('image', { url: imageUrl });
    },

    // Handle errors
    handleError(data) {
        const error = data.error || data.message || 'Unknown error';
        console.error('[BhekThink Error]', error);
        
        const messageId = data.id;
        if (messageId && this.pendingMessages[messageId]) {
            this.pendingMessages[messageId].reject(new Error(error));
            delete this.pendingMessages[messageId];
        }
    },

    // Send message to BhekThink
    async sendMessage(message, context = {}) {
        if (!this.isConnected) {
            this.messageQueue.push({ message, context });
            return this.queueResponse();
        }

        return new Promise((resolve, reject) => {
            const messageId = 'think_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            
            // Store promise resolver
            this.pendingMessages[messageId] = { 
                resolve: (result) => {
                    delete this.pendingMessages[messageId];
                    resolve(result);
                },
                reject: (error) => {
                    delete this.pendingMessages[messageId];
                    reject(error);
                }
            };
            
            // Send to iframe
            if (this.thinkWindow) {
                try {
                    this.thinkWindow.postMessage({
                        type: 'think-query',
                        id: messageId,
                        message: message,
                        context: {
                            ...context,
                            osVersion: this.os?.version,
                            timestamp: new Date().toISOString(),
                            history: this.conversationHistory.slice(-5),
                            source: 'bhekos'
                        }
                    }, '*');
                    
                    console.log('Message sent to BhekThink:', messageId);
                } catch (error) {
                    this.pendingMessages[messageId].reject(error);
                }
            } else {
                // Fallback
                setTimeout(() => {
                    this.pendingMessages[messageId]?.resolve(this.fallbackResponse(message));
                }, 500);
            }
            
            // Timeout
            setTimeout(() => {
                if (this.pendingMessages[messageId]) {
                    this.pendingMessages[messageId].resolve(this.fallbackResponse(message));
                    delete this.pendingMessages[messageId];
                }
            }, 15000);
        });
    },

    // Process message with BhekThink
    async processMessage(message, context = {}) {
        try {
            const response = await this.sendMessage(message, context);
            
            // Handle different response types
            if (typeof response === 'object' && response.type === 'image') {
                return `![Generated Image](${response.url})`;
            }
            
            return response || this.fallbackResponse(message);
            
        } catch (error) {
            console.error('BhekThink error:', error);
            return this.fallbackResponse(message);
        }
    },

    // Queue response for when connected
    queueResponse() {
        return new Promise((resolve) => {
            const checkQueue = setInterval(() => {
                if (this.isConnected) {
                    clearInterval(checkQueue);
                    this.processQueue();
                    resolve("AI is connected. Please send your message again.");
                }
            }, 100);
            
            setTimeout(() => {
                clearInterval(checkQueue);
                resolve("⚡ BhekThink is initializing. Please try again in a moment.");
            }, 10000);
        });
    },

    // Process queued messages
    processQueue() {
        this.messageQueue.forEach(item => {
            this.processMessage(item.message, item.context);
        });
        this.messageQueue = [];
    },

    // Generate image with BhekThink
    async generateImage(prompt) {
        if (!this.isConnected || this.fallbackMode) {
            return this.fallbackImage(prompt);
        }
        
        try {
            const messageId = 'img_' + Date.now();
            
            this.thinkWindow.postMessage({
                type: 'think-generate',
                id: messageId,
                prompt: prompt
            }, '*');
            
            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    window.removeEventListener('message', handler);
                    resolve(this.fallbackImage(prompt));
                }, 20000);
                
                const handler = (event) => {
                    if (event.data.type === 'think-image' && event.data.id === messageId) {
                        clearTimeout(timeout);
                        window.removeEventListener('message', handler);
                        resolve(event.data.url);
                    }
                };
                
                window.addEventListener('message', handler);
            });
        } catch (error) {
            console.error('Image generation failed:', error);
            return this.fallbackImage(prompt);
        }
    },

    // Save to history
    saveToHistory(query, response) {
        this.conversationHistory.push({
            query,
            response,
            timestamp: new Date().toISOString(),
            user: this.user?.username || 'sovereign'
        });
        
        if (this.conversationHistory.length > 100) {
            this.conversationHistory.shift();
        }
        
        this.saveConfig();
    },

    // Use fallback when BhekThink unavailable
    useFallback() {
        console.log('Using fallback AI mode');
        this.fallbackMode = true;
        this.isConnected = true; // Mark as connected for fallback
        this.os?.notify('BhekThink', 'Using offline AI mode', 'warning');
    },

    // Enhanced fallback response with BhekThink style
    fallbackResponse(message) {
        const lowerMsg = message.toLowerCase();
        
        if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
            return "# ⚡ BhekThink Sovereign\n\nGreetings. I am BhekThink v1000.5, your absolute AI companion. The neural mesh is active and ready to assist.\n\nHow may I serve you today?";
        }
        
        if (lowerMsg.includes('who are you') || lowerMsg.includes('what are you')) {
            return "## Omega Sovereign AI\n\n**BhekThink v1000.5**\n\nI am an advanced neural system with:\n\n- 🧠 **Full Language Mesh** (English, Twi, French, Spanish, Arabic, Chinese)\n- 🔧 **Sovereign Toolset** (Vision, Web-Sync, Voice)\n- 🎨 **Artificer Mode** (Image generation)\n- 💾 **Neural Memory** (Cloud-synced context)";
        }
        
        if (lowerMsg.includes('draw') || lowerMsg.includes('generate') || lowerMsg.includes('create image')) {
            return "## 🎨 Artificer Mode Activated\n\nI can generate images for you. When fully connected to BhekThink with Puter.js, you'll get full AI image generation.\n\nFor now, imagine:\n\n> *A cyberpunk cityscape with neon lights, floating holograms, and a massive AI tower in the center*";
        }
        
        return "## ⚡ Neural Processing\n\nYour query has been received. The BhekThink kernel is processing through neural networks...";
    },

    // Fallback image
    fallbackImage(prompt) {
        return `https://via.placeholder.com/512x512/000000/00ff88?text=${encodeURIComponent(prompt.substring(0, 30))}`;
    },

    // Get language
    getLanguage() {
        return localStorage.getItem('bt_lang') || 'English';
    },

    // Set language
    setLanguage(lang) {
        localStorage.setItem('bt_lang', lang);
        if (this.thinkWindow) {
            this.thinkWindow.postMessage({
                type: 'think-lang',
                lang: lang
            }, '*');
        }
        this.os?.notify('BhekThink', `Language set to ${lang}`);
    },

    // Voice synthesis
    speak(text) {
        if (this.thinkWindow && !this.fallbackMode) {
            this.thinkWindow.postMessage({
                type: 'think-speak',
                text: text
            }, '*');
        } else {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.15;
            utterance.pitch = 1.1;
            window.speechSynthesis.speak(utterance);
        }
    },

    // Stop speaking
    stopSpeaking() {
        window.speechSynthesis.cancel();
        if (this.thinkWindow) {
            this.thinkWindow.postMessage({
                type: 'think-stop'
            }, '*');
        }
    },

    // Voice recognition
    listen(callback) {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = this.getLanguage() === 'English' ? 'en-US' : 'en-GH';
        recognition.start();
        
        recognition.onresult = (e) => {
            const text = e.results[0][0].transcript;
            if (callback) callback(text);
        };
    },

    // Sign in with Puter
    async signIn() {
        if (this.thinkWindow) {
            this.thinkWindow.postMessage({ type: 'think-auth-request' }, '*');
            
            return new Promise((resolve) => {
                const handler = (event) => {
                    if (event.data.type === 'think-auth') {
                        window.removeEventListener('message', handler);
                        this.user = event.data.user;
                        resolve(event.data.user);
                    }
                };
                window.addEventListener('message', handler);
                setTimeout(() => {
                    window.removeEventListener('message', handler);
                    resolve(null);
                }, 30000);
            });
        }
        return null;
    },

    // Get status
    getStatus() {
        return {
            connected: this.isConnected,
            loading: this.isLoading,
            fallback: this.fallbackMode || false,
            user: this.user?.username || null,
            historyCount: this.conversationHistory.length,
            queueLength: this.messageQueue.length,
            language: this.getLanguage(),
            url: this.config.appUrl,
            version: this.config.version
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
            const response = await this.processMessage("Hello, are you working? Respond with '⚡ BhekThink Sovereign active' if you can hear me.");
            const latency = Date.now() - startTime;
            
            return {
                success: true,
                response: response,
                latency: latency,
                mode: this.fallbackMode ? 'fallback' : 'connected',
                user: this.user?.username || 'anonymous',
                url: this.config.appUrl
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                url: this.config.appUrl
            };
        }
    },

    // Export conversation
    exportConversation() {
        const data = {
            history: this.conversationHistory,
            user: this.user,
            exported: new Date().toISOString(),
            version: this.config.version,
            url: this.config.appUrl
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bhekthink-history-${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.os?.notify('BhekThink', 'Conversation exported');
    },

    // Get direct link
    getDirectLink() {
        return this.config.appUrl;
    },

    // Open in new tab
    openInNewTab() {
        window.open(this.config.appUrl, '_blank');
        this.os?.notify('BhekThink', 'Opening sovereign AI in new tab');
    },

    // Clean up
    destroy() {
        const container = document.getElementById('bhekthink-frame-container');
        if (container) {
            container.remove();
        }
        this.isConnected = false;
        this.thinkWindow = null;
    }
};
