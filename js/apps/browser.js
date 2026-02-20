// Browser App with BhekWork Integration
const Browser = {
    load(view, os) {
        this.os = os;
        
        view.innerHTML = `
            <div style="height: 100%; display: flex; flex-direction: column; background: #0f172a; font-family: 'Inter', system-ui, sans-serif;">
                <!-- Header -->
                <div style="padding: 12px 20px; background: rgba(255,255,255,0.03); border-bottom: 1px solid #4a76a833; display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="font-size: 24px; color: #f9a84d;">🌐</span>
                        <div>
                            <h2 style="font-size: 14px; font-weight: 800; color: #f9a84d;">BHEKWORK BROWSER</h2>
                            <p style="font-size: 10px; opacity: 0.7;">Bhek Network Global</p>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span class="security-indicator ${os.integrations.bhekwork?.isConnected ? 'security-high' : 'security-low'}" id="work-indicator"></span>
                        <span style="font-size: 11px;" id="browser-mode">${os.integrations.bhekwork?.isConnected ? 'LIVE' : 'FALLBACK'}</span>
                    </div>
                </div>
                
                <!-- Search Bar -->
                <div style="padding: 20px; display: flex; flex-direction: column; align-items: center; gap: 15px;">
                    <img src="https://quesybhek.github.io/BhekWork/BhekWork.png" 
                         style="width: 120px; margin-bottom: 10px; border-radius: 20px;" 
                         onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'120\' height=\'120\' viewBox=\'0 0 100 100\'><rect width=\'100\' height=\'100\' fill=\'%230f172a\'/><text x=\'50\' y=\'50\' font-size=\'40\' text-anchor=\'middle\' fill=\'%23f9a84d\'>🌐</text></svg>'">
                    
                    <div style="width: 100%; max-width: 600px; background: rgba(255,255,255,0.05); border-radius: 50px; display: flex; padding: 5px 15px; backdrop-filter: blur(15px); border: 1px solid #4a76a866;">
                        <select id="browser-engine" style="background: none; border: none; color: #f9a84d; font-weight: bold; outline: none; padding-right: 8px; cursor: pointer;">
                            <option value="google">Google</option>
                            <option value="youtube">YouTube</option>
                            <option value="github">GitHub</option>
                            <option value="linkedin">LinkedIn</option>
                            <option value="wiki">Wikipedia</option>
                            <option value="bing">Bing</option>
                        </select>
                        <input type="text" id="browser-search" placeholder="Search Bhek Network..." 
                               style="flex: 1; background: none; border: none; color: white; padding: 12px; outline: none; font-size: 14px;">
                        <span class="material-symbols-rounded" style="color: #f9a84d; cursor: pointer; font-size: 24px;" onclick="Browser.voiceSearch()">mic</span>
                    </div>
                    
                    <div style="display: flex; gap: 10px;">
                        <button onclick="Browser.search()" style="background: #4a76a8; color: white; border: none; padding: 12px 40px; border-radius: 30px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                            EXECUTE
                        </button>
                        <button class="secondary" onclick="Browser.openInNewTab()">Open BhekWork</button>
                    </div>
                </div>
                
                <!-- Quick Links -->
                <div style="padding: 20px;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)); gap: 20px; max-width: 600px; margin: 0 auto;">
                        ${this.getQuickLinks().map(link => `
                            <a href="#" onclick="Browser.quickLink('${link.url}')" 
                               style="text-decoration: none; color: #94a3b8; display: flex; flex-direction: column; align-items: center; gap: 8px; transition: 0.3s;">
                                <i class="${link.icon}" style="font-size: 24px;"></i>
                                <span style="font-size: 11px; font-weight: 600;">${link.name}</span>
                            </a>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Tools Section -->
                <div style="margin-top: auto; padding: 20px; border-top: 1px solid rgba(255,255,255,0.05);">
                    <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                        <button class="secondary" onclick="Browser.generatePassword()">🔑 Generate Password</button>
                        <button class="secondary" onclick="Browser.wordCounter()">📊 Word Counter</button>
                        <button class="secondary" onclick="Browser.showBookmarks()">⭐ Bookmarks</button>
                        <button class="secondary" onclick="Browser.showHistory()">📋 History</button>
                    </div>
                </div>
                
                <!-- Status Bar -->
                <div style="padding: 8px 20px; background: #020617; font-size: 11px; display: flex; justify-content: space-between; color: #94a3b8;">
                    <span id="browser-greeting">GOOD ${os.integrations.bhekwork?.getGreeting?.() || 'MORNING'}</span>
                    <span id="browser-time">${new Date().toLocaleTimeString()}</span>
                    <span id="browser-weather"><i class="fas fa-cloud-sun"></i> <span id="browser-temp">--°C</span></span>
                </div>
            </div>
        `;
        
        this.setupSearch();
        this.startClock();
        this.updateWeather();
    },

    getQuickLinks() {
        return [
            { name: "Google", url: "https://google.com", icon: "fab fa-google" },
            { name: "YouTube", url: "https://youtube.com", icon: "fab fa-youtube" },
            { name: "GitHub", url: "https://github.com", icon: "fab fa-github" },
            { name: "LinkedIn", url: "https://linkedin.com", icon: "fab fa-linkedin" },
            { name: "Wiki", url: "https://wikipedia.org", icon: "fab fa-wikipedia-w" },
            { name: "Bing", url: "https://bing.com", icon: "fas fa-search" }
        ];
    },

    setupSearch() {
        const input = document.getElementById('browser-search');
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.search();
        });
    },

    search() {
        const query = document.getElementById('browser-search').value;
        const engine = document.getElementById('browser-engine').value;
        
        if (!query) return;
        
        this.os.integrations.bhekwork.search(query, engine);
    },

    voiceSearch() {
        this.os.integrations.bhekwork.voiceSearch((text) => {
            document.getElementById('browser-search').value = text;
            this.search();
        });
    },

    quickLink(url) {
        window.open(url, '_blank');
    },

    openInNewTab() {
        this.os.integrations.bhekwork.openInNewTab();
    },

    generatePassword() {
        const password = this.os.integrations.bhekwork.generatePassword();
        document.getElementById('browser-search').value = password;
        this.os.notify('BhekWork', 'Password generated: ' + password);
    },

    wordCounter() {
        const text = document.getElementById('browser-search').value;
        const count = this.os.integrations.bhekwork.countWords(text);
        this.os.notify('Word Counter', `Words: ${count}`);
    },

    showBookmarks() {
        const bookmarks = this.os.integrations.bhekwork.bookmarks;
        let message = '📌 Bookmarks:\n\n';
        if (bookmarks.length === 0) {
            message += 'No bookmarks yet';
        } else {
            bookmarks.slice(-5).forEach(b => {
                message += `• ${b.title || b.url}\n`;
            });
        }
        alert(message);
    },

    showHistory() {
        const history = this.os.integrations.bhekwork.searchHistory;
        let message = '📋 Recent Searches:\n\n';
        if (history.length === 0) {
            message += 'No search history';
        } else {
            history.slice(-5).reverse().forEach(h => {
                message += `• ${h.query} (${h.engine})\n`;
            });
        }
        alert(message);
    },

    startClock() {
        setInterval(() => {
            const time = document.getElementById('browser-time');
            if (time) time.textContent = new Date().toLocaleTimeString();
            
            const greeting = document.getElementById('browser-greeting');
            if (greeting) {
                greeting.textContent = `GOOD ${this.os.integrations.bhekwork?.getGreeting?.() || 'MORNING'}`;
            }
        }, 1000);
    },

    async updateWeather() {
        const temp = await this.os.integrations.bhekwork.getWeather();
        const tempEl = document.getElementById('browser-temp');
        if (tempEl) tempEl.textContent = temp;
        
        setInterval(async () => {
            const temp = await this.os.integrations.bhekwork.getWeather();
            if (tempEl) tempEl.textContent = temp;
        }, 600000);
    }
};
