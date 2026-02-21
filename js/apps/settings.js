// Settings App with Integration Tabs
const Settings = {
    load(view, os) {
        this.os = os;
        this.currentTab = 'personalization';
        
        view.innerHTML = `
            <div style="height: 100%; display: flex; flex-direction: column;">
                <div style="padding: 16px; border-bottom: 1px solid var(--mica-border);">
                    <h2>⚙️ Settings</h2>
                </div>
                
                <div style="display: flex; flex: 1; overflow: hidden;">
                    <!-- Navigation Sidebar -->
                    <div style="width: 200px; background: rgba(0,0,0,0.2); padding: 16px; overflow-y: auto;">
                        <div class="settings-nav-item ${this.currentTab === 'personalization' ? 'active' : ''}" 
                             onclick="Settings.switchTab('personalization')">
                            🎨 Personalization
                        </div>
                        <div class="settings-nav-item ${this.currentTab === 'icons' ? 'active' : ''}" 
                             onclick="Settings.switchTab('icons')">
                            🖼️ Icons
                        </div>
                        <div class="settings-nav-item ${this.currentTab === 'security' ? 'active' : ''}" 
                             onclick="Settings.switchTab('security')">
                            🔐 Security
                        </div>
                        <div class="settings-nav-item ${this.currentTab === 'integrations' ? 'active' : ''}" 
                             onclick="Settings.switchTab('integrations')">
                            🔌 Integrations
                        </div>
                        <div class="settings-nav-item ${this.currentTab === 'system' ? 'active' : ''}" 
                             onclick="Settings.switchTab('system')">
                            ⚙️ System
                        </div>
                        <div class="settings-nav-item ${this.currentTab === 'about' ? 'active' : ''}" 
                             onclick="Settings.switchTab('about')">
                            ℹ️ About
                        </div>
                    </div>
                    
                    <!-- Content Area -->
                    <div id="settings-content" style="flex: 1; padding: 20px; overflow-y: auto;">
                        ${this.getPersonalizationSettings()}
                    </div>
                </div>
            </div>
        `;
    },

    switchTab(tab) {
        this.currentTab = tab;
        
        // Update navigation active state
        document.querySelectorAll('.settings-nav-item').forEach(item => {
            item.classList.remove('active');
        });
        event.target.classList.add('active');
        
        // Load content
        const content = document.getElementById('settings-content');
        switch(tab) {
            case 'personalization':
                content.innerHTML = this.getPersonalizationSettings();
                break;
            case 'icons':
                content.innerHTML = this.getIconSettings();
                break;
            case 'security':
                content.innerHTML = this.getSecuritySettings();
                break;
            case 'integrations':
                content.innerHTML = this.getIntegrationSettings();
                break;
            case 'system':
                content.innerHTML = this.getSystemSettings();
                break;
            case 'about':
                content.innerHTML = this.getAboutSettings();
                break;
        }
    },

    getPersonalizationSettings() {
        const wallpaper = BhekStorage.load('wallpaper', 'default');
        const darkMode = BhekStorage.load('darkMode', false);
        const transparency = BhekStorage.load('transparency', true);
        const accent = BhekStorage.load('accentColor', '#0078d4');
        
        return `
            <h3 style="margin-bottom: 20px;">🎨 Personalization</h3>
            
            <div class="apple-settings-item">
                <div>
                    <div style="font-weight: 500;">Dark Mode</div>
                    <div style="font-size: 12px; opacity: 0.7;">Enable dark theme</div>
                </div>
                <label class="settings-toggle">
                    <input type="checkbox" ${darkMode ? 'checked' : ''} onchange="Settings.toggleDarkMode(this.checked)">
                    <span class="settings-slider"></span>
                </label>
            </div>
            
            <div class="apple-settings-item">
                <div>
                    <div style="font-weight: 500;">Transparency Effects</div>
                    <div style="font-size: 12px; opacity: 0.7;">Mica and glass effects</div>
                </div>
                <label class="settings-toggle">
                    <input type="checkbox" ${transparency ? 'checked' : ''} onchange="Settings.toggleTransparency(this.checked)">
                    <span class="settings-slider"></span>
                </label>
            </div>
            
            <div class="apple-settings-item">
                <div>
                    <div style="font-weight: 500;">Wallpaper</div>
                    <div style="font-size: 12px; opacity: 0.7;">Change desktop background</div>
                </div>
                <select onchange="Settings.changeWallpaper(this.value)" style="width: 150px;">
                    <option value="default" ${wallpaper === 'default' ? 'selected' : ''}>Default</option>
                    <option value="nature" ${wallpaper === 'nature' ? 'selected' : ''}>Nature</option>
                    <option value="abstract" ${wallpaper === 'abstract' ? 'selected' : ''}>Abstract</option>
                    <option value="gradient" ${wallpaper === 'gradient' ? 'selected' : ''}>Gradient</option>
                </select>
            </div>
            
            <div class="apple-settings-item">
                <div>
                    <div style="font-weight: 500;">Accent Color</div>
                    <div style="font-size: 12px; opacity: 0.7;">System highlight color</div>
                </div>
                <input type="color" value="${accent}" onchange="Settings.changeAccentColor(this.value)" style="width: 60px; height: 30px;">
            </div>
        `;
    },

    getIconSettings() {
        const savedSettings = BhekStorage.load('iconSettings', {});
        const icons = [
            { id: 'explorer', name: 'File Explorer' },
            { id: 'terminal', name: 'Terminal' },
            { id: 'browser', name: 'Web Browser' },
            { id: 'media', name: 'Media Player' },
            { id: 'settings', name: 'Settings' },
            { id: 'games', name: 'Game Center' },
            { id: 'ai', name: 'BhekAI' },
            { id: 'notepad', name: 'Notepad' },
            { id: 'calculator', name: 'Calculator' },
            { id: 'paint', name: 'Paint' },
            { id: 'app-store', name: 'App Store' },
            { id: 'integration-settings', name: 'Integrations' }
        ];
        
        return `
            <h3 style="margin-bottom: 20px;">🖼️ Icon Customization</h3>
            <p style="margin-bottom: 20px; opacity: 0.8;">Customize desktop and start menu icons</p>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px;">
                ${icons.map(icon => {
                    const settings = savedSettings[icon.id] || {};
                    const emoji = settings.emoji || this.os.getDefaultIcon(icon.id);
                    const color = settings.color || this.os.getDefaultColor(icon.id);
                    
                    return `
                        <div class="icon-pack" onclick="Settings.customizeIcon('${icon.id}')" 
                             style="padding: 16px; background: ${color}33; border-radius: 8px; text-align: center; cursor: pointer; border: 1px solid ${color}66;">
                            <div style="font-size: 32px; margin-bottom: 8px;">${emoji}</div>
                            <div style="font-size: 12px;">${icon.name}</div>
                        </div>
                    `;
                }).join('')}
            </div>
            
            <div style="display: flex; gap: 8px;">
                <button onclick="Settings.resetIcons()" class="secondary">🔄 Reset All</button>
                <button onclick="Settings.exportIcons()" class="secondary">📤 Export</button>
            </div>
        `;
    },

    getSecuritySettings() {
        const security = this.os.security.settings;
        
        return `
            <h3 style="margin-bottom: 20px;">🔐 Security</h3>
            
            <div class="apple-settings-item">
                <div>
                    <div style="font-weight: 500;">Auto-Lock</div>
                    <div style="font-size: 12px; opacity: 0.7;">Lock after inactivity</div>
                </div>
                <label class="settings-toggle">
                    <input type="checkbox" ${security.autoLock ? 'checked' : ''} onchange="Settings.toggleAutoLock(this.checked)">
                    <span class="settings-slider"></span>
                </label>
            </div>
            
            <div class="apple-settings-item">
                <div>
                    <div style="font-weight: 500;">Auto-Lock Time</div>
                    <div style="font-size: 12px; opacity: 0.7;">Minutes before lock</div>
                </div>
                <select onchange="Settings.setAutoLockTime(this.value)" style="width: 100px;">
                    <option value="1" ${security.autoLockMinutes === 1 ? 'selected' : ''}>1 min</option>
                    <option value="5" ${security.autoLockMinutes === 5 ? 'selected' : ''}>5 min</option>
                    <option value="10" ${security.autoLockMinutes === 10 ? 'selected' : ''}>10 min</option>
                    <option value="30" ${security.autoLockMinutes === 30 ? 'selected' : ''}>30 min</option>
                </select>
            </div>
            
            <div class="apple-settings-item">
                <div>
                    <div style="font-weight: 500;">App Passwords</div>
                    <div style="font-size: 12px; opacity: 0.7;">Require password for apps</div>
                </div>
                <label class="settings-toggle">
                    <input type="checkbox" ${security.requirePasswordForSensitiveApps ? 'checked' : ''} onchange="Settings.toggleAppPasswords(this.checked)">
                    <span class="settings-slider"></span>
                </label>
            </div>
            
            <div class="apple-settings-item">
                <div>
                    <div style="font-weight: 500;">Master Password</div>
                    <div style="font-size: 12px; opacity: 0.7;">Change system password</div>
                </div>
                <button onclick="Settings.changeMasterPassword()">Change</button>
            </div>
        `;
    },

    getIntegrationSettings() {
        const thinkStatus = this.os.integrations.bhekthink?.getStatus() || { connected: false, fallback: false };
        const workStatus = this.os.integrations.bhekwork?.getStatus() || { connected: false, fallback: false };
        
        return `
            <h3 style="margin-bottom: 20px;">🔌 Integrations</h3>
            
            <!-- BhekThink Card -->
            <div style="background: rgba(0,255,136,0.05); border-radius: 12px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #00ff88;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                    <div style="font-size: 40px;">🤖</div>
                    <div style="flex: 1;">
                        <h4 style="margin-bottom: 4px;">BhekThink AI</h4>
                        <p style="font-size: 12px; opacity: 0.7;">https://quesybhek.github.io/BhekThink-AI-Pro/</p>
                    </div>
                    <div>
                        <span class="security-indicator ${thinkStatus.connected ? 'security-high' : 'security-low'}"></span>
                        <span style="font-size: 12px; margin-left: 8px;">${thinkStatus.connected ? 'Connected' : 'Disconnected'}</span>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px;">
                    <div style="background: rgba(0,0,0,0.2); padding: 8px; border-radius: 6px; text-align: center;">
                        <div style="font-size: 11px; opacity: 0.7;">Mode</div>
                        <div style="font-weight: 500;">${thinkStatus.fallback ? 'Fallback' : 'Live'}</div>
                    </div>
                    <div style="background: rgba(0,0,0,0.2); padding: 8px; border-radius: 6px; text-align: center;">
                        <div style="font-size: 11px; opacity: 0.7;">History</div>
                        <div style="font-weight: 500;">${thinkStatus.historyCount || 0}</div>
                    </div>
                    <div style="background: rgba(0,0,0,0.2); padding: 8px; border-radius: 6px; text-align: center;">
                        <div style="font-size: 11px; opacity: 0.7;">Language</div>
                        <div style="font-weight: 500;">${thinkStatus.language || 'English'}</div>
                    </div>
                </div>
                
                <div style="display: flex; gap: 8px;">
                    <button onclick="Settings.testThink()">Test</button>
                    <button class="secondary" onclick="Settings.configureThink()">Configure</button>
                    <button class="secondary" onclick="Settings.openThinkInTab()">Open in Tab</button>
                </div>
            </div>
            
            <!-- BhekWork Card -->
            <div style="background: rgba(249,168,77,0.05); border-radius: 12px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #f9a84d;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                    <div style="font-size: 40px;">🌐</div>
                    <div style="flex: 1;">
                        <h4 style="margin-bottom: 4px;">BhekWork Browser</h4>
                        <p style="font-size: 12px; opacity: 0.7;">https://quesybhek.github.io/BhekWork/</p>
                    </div>
                    <div>
                        <span class="security-indicator ${workStatus.connected ? 'security-high' : 'security-low'}"></span>
                        <span style="font-size: 12px; margin-left: 8px;">${workStatus.connected ? 'Connected' : 'Disconnected'}</span>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px;">
                    <div style="background: rgba(0,0,0,0.2); padding: 8px; border-radius: 6px; text-align: center;">
                        <div style="font-size: 11px; opacity: 0.7;">Mode</div>
                        <div style="font-weight: 500;">${workStatus.fallback ? 'Fallback' : 'Live'}</div>
                    </div>
                    <div style="background: rgba(0,0,0,0.2); padding: 8px; border-radius: 6px; text-align: center;">
                        <div style="font-size: 11px; opacity: 0.7;">Engine</div>
                        <div style="font-weight: 500;">${workStatus.defaultEngine || 'google'}</div>
                    </div>
                    <div style="background: rgba(0,0,0,0.2); padding: 8px; border-radius: 6px; text-align: center;">
                        <div style="font-size: 11px; opacity: 0.7;">History</div>
                        <div style="font-weight: 500;">${workStatus.historyCount || 0}</div>
                    </div>
                </div>
                
                <div style="display: flex; gap: 8px;">
                    <button onclick="Settings.testWork()">Test</button>
                    <button class="secondary" onclick="Settings.configureWork()">Configure</button>
                    <button class="secondary" onclick="Settings.openWorkInTab()">Open in Tab</button>
                </div>
            </div>
            
            <!-- Integration Actions -->
            <div style="display: flex; gap: 8px; justify-content: center; margin-top: 20px;">
                <button onclick="Settings.testAllIntegrations()">🧪 Test All</button>
                <button class="secondary" onclick="Settings.clearIntegrationCache()">🗑️ Clear Cache</button>
                <button class="secondary" onclick="Settings.exportIntegrationData()">📥 Export Data</button>
            </div>
        `;
    },

    getSystemSettings() {
        return `
            <h3 style="margin-bottom: 20px;">⚙️ System</h3>
            
            <div class="apple-settings-item">
                <div>
                    <div style="font-weight: 500;">Reset All Settings</div>
                    <div style="font-size: 12px; opacity: 0.7;">Restore default settings</div>
                </div>
                <button onclick="Settings.resetAll()" style="background: #ff5252;">Reset</button>
            </div>
            
            <div class="apple-settings-item">
                <div>
                    <div style="font-weight: 500;">Clear All Data</div>
                    <div style="font-size: 12px; opacity: 0.7;">Delete all saved data</div>
                </div>
                <button onclick="Settings.clearAll()" style="background: #ff5252;">Clear</button>
            </div>
        `;
    },

    getAboutSettings() {
        return `
            <h3 style="margin-bottom: 20px;">ℹ️ About BhekOS</h3>
            
            <div style="text-align: center; padding: 20px;">
                <div style="font-size: 64px; margin-bottom: 16px;">🖥️</div>
                <h2>BhekOS ${this.os.version}</h2>
                <p style="opacity: 0.7;">Build ${this.os.build}</p>
                
                <div style="margin: 30px 0; padding: 20px; background: rgba(0,0,0,0.2); border-radius: 12px;">
                    <h4>Integrations</h4>
                    <p style="margin-top: 10px;">🤖 BhekThink AI - v1000.5</p>
                    <p>🌐 BhekWork Browser - v2.0.0</p>
                </div>
                
                <p style="font-size: 12px; opacity: 0.6;">© 2025 Bhek Network Global</p>
            </div>
        `;
    },

    // Integration Methods
    static async testThink() {
        const result = await this.os.integrations.bhekthink?.testConnection();
        if (result?.success) {
            this.os.notify('BhekThink', `Connected (${result.latency}ms)`, 'success');
        } else {
            this.os.notify('BhekThink', 'Connection failed', 'error');
        }
    },

    static async testWork() {
        const result = await this.os.integrations.bhekwork?.testConnection();
        if (result?.success) {
            this.os.notify('BhekWork', `Connected (${result.latency}ms)`, 'success');
        } else {
            this.os.notify('BhekWork', 'Connection failed', 'error');
        }
    },

    static async testAllIntegrations() {
        await this.os.testAllIntegrations();
    },

    static configureThink() {
        const url = prompt('Enter BhekThink URL:', this.os.integrations.bhekthink?.config.appUrl);
        if (url) {
            this.os.integrations.bhekthink.config.appUrl = url;
            this.os.integrations.bhekthink.saveConfig();
            this.os.notify('BhekThink', 'URL updated');
        }
    },

    static configureWork() {
        const url = prompt('Enter BhekWork URL:', this.os.integrations.bhekwork?.config.appUrl);
        if (url) {
            this.os.integrations.bhekwork.config.appUrl = url;
            this.os.integrations.bhekwork.saveConfig();
            this.os.notify('BhekWork', 'URL updated');
        }
    },

    static openThinkInTab() {
        this.os.integrations.bhekthink?.openInNewTab();
    },

    static openWorkInTab() {
        this.os.integrations.bhekwork?.openInNewTab();
    },

    static clearIntegrationCache() {
        if (confirm('Clear integration cache?')) {
            localStorage.removeItem('bhekthink-history');
            localStorage.removeItem('bhekwork-history');
            localStorage.removeItem('bhekwork-bookmarks');
            this.os.notify('Cache', 'Integration cache cleared');
        }
    },

    static exportIntegrationData() {
        const data = {
            bhekthink: this.os.integrations.bhekthink?.conversationHistory || [],
            bhekwork: {
                history: this.os.integrations.bhekwork?.searchHistory || [],
                bookmarks: this.os.integrations.bhekwork?.bookmarks || []
            },
            exported: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `integration-data-${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.os.notify('Export', 'Integration data exported');
    },

    // Other settings methods
    static toggleDarkMode(enabled) {
        BhekStorage.save('darkMode', enabled);
        if (enabled) {
            document.documentElement.style.setProperty('--bg', '#000000');
        } else {
            document.documentElement.style.setProperty('--bg', '#f8fafc');
        }
        this.os.notify('Settings', `Dark mode ${enabled ? 'enabled' : 'disabled'}`);
    },

    static toggleTransparency(enabled) {
        BhekStorage.save('transparency', enabled);
        this.os.notify('Settings', `Transparency ${enabled ? 'enabled' : 'disabled'}`);
    },

    static changeWallpaper(type) {
        this.os.wallpaper = type;
        BhekStorage.save('wallpaper', type);
        this.os.setWallpaper();
        this.os.notify('Settings', `Wallpaper changed to ${type}`);
    },

    static changeAccentColor(color) {
        BhekStorage.save('accentColor', color);
        document.documentElement.style.setProperty('--accent', color);
        this.os.notify('Settings', 'Accent color updated');
    },

    static customizeIcon(iconId) {
        const newEmoji = prompt('Enter new emoji:');
        if (newEmoji) {
            const settings = BhekStorage.load('iconSettings', {});
            if (!settings[iconId]) settings[iconId] = {};
            settings[iconId].emoji = newEmoji;
            BhekStorage.save('iconSettings', settings);
            this.os.refreshDesktop();
            this.os.notify('Icons', `${iconId} icon updated`);
        }
    },

    static resetIcons() {
        if (confirm('Reset all icons to default?')) {
            localStorage.removeItem('iconSettings');
            this.os.initIconSettings();
            this.os.refreshDesktop();
            this.os.notify('Icons', 'Icons reset to default');
        }
    },

    static exportIcons() {
        const settings = BhekStorage.load('iconSettings', {});
        const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `icons-${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.os.notify('Icons', 'Icon settings exported');
    },

    static toggleAutoLock(enabled) {
        this.os.security.toggleAutoLock(enabled);
    },

    static setAutoLockTime(minutes) {
        this.os.security.setAutoLockTime(minutes);
    },

    static toggleAppPasswords(enabled) {
        this.os.security.toggleAppPasswords(enabled);
    },

    static changeMasterPassword() {
        this.os.security.changeMasterPassword();
    },

    static resetAll() {
        if (confirm('Reset all settings?')) {
            localStorage.clear();
            location.reload();
        }
    },

    static clearAll() {
        if (confirm('Clear all data? This cannot be undone!')) {
            localStorage.clear();
            indexedDB.deleteDatabase('bhekos');
            location.reload();
        }
    }
};
// Add to js/apps/settings.js
setStartButtonStyle(style) {
    const startBtn = document.getElementById('startButton');
    if (!startBtn) return;
    
    // Remove all style classes
    startBtn.className = 'start-button';
    
    // Add selected style
    if (style !== 'default') {
        startBtn.classList.add(style);
    }
    
    // Update icon based on style
    const icon = startBtn.querySelector('.start-icon');
    if (icon) {
        switch(style) {
            case 'windows':
                icon.textContent = '⊞';
                break;
            case 'apple':
                icon.textContent = '';
                break;
            case 'minimal':
                icon.textContent = '☰';
                break;
            case 'neon':
                icon.textContent = '⚡';
                break;
            default:
                icon.textContent = 'B';
        }
    }
    
    BhekStorage.save('startButtonStyle', style);
    this.os.notify('Start Button', `Style changed to ${style}`);
}

// Add to settings UI
`
<div class="apple-settings-item">
    <div>
        <div style="font-weight: 500;">Start Button Style</div>
        <div style="font-size: 12px; opacity: 0.7;">Customize your start button</div>
    </div>
    <select onchange="Settings.setStartButtonStyle(this.value)">
        <option value="default">BhekOS Default (B)</option>
        <option value="windows">Windows Style (⊞)</option>
        <option value="apple">Apple Style ()</option>
        <option value="minimal">Minimal (☰)</option>
        <option value="neon">Neon (⚡)</option>
    </select>
</div>
`
