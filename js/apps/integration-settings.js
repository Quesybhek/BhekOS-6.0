// Integration Settings App
const IntegrationSettings = {
    load(view, os) {
        this.os = os;
        
        view.innerHTML = `
            <div style="padding: 20px; height: 100%; overflow-y: auto;">
                <h2 style="margin-bottom: 20px; color: #00ff88;">🔌 Integration Settings</h2>
                
                <div style="display: grid; gap: 20px;">
                    <!-- BhekThink Card -->
                    <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; border-left: 3px solid #00ff88;">
                        ${this.renderThinkCard()}
                    </div>
                    
                    <!-- BhekWork Card -->
                    <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; border-left: 3px solid #f9a84d;">
                        ${this.renderWorkCard()}
                    </div>
                    
                    <!-- Integration Testing -->
                    <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px;">
                        <h3 style="margin-bottom: 16px; color: #00ff88;">🧪 Integration Testing</h3>
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                            <button onclick="IntegrationSettings.testThink()">Test BhekThink</button>
                            <button onclick="IntegrationSettings.testWork()">Test BhekWork</button>
                            <button onclick="IntegrationSettings.testBoth()" class="secondary">Test Both</button>
                            <button onclick="IntegrationSettings.viewLogs()" class="secondary">View Logs</button>
                        </div>
                    </div>
                    
                    <!-- Advanced Settings -->
                    <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px;">
                        <h3 style="margin-bottom: 16px; color: #00ff88;">⚙️ Advanced</h3>
                        
                        <div class="apple-settings-item">
                            <div>
                                <div>Debug Mode</div>
                                <div style="font-size: 12px; opacity: 0.7;">Log detailed integration information</div>
                            </div>
                            <label class="settings-toggle">
                                <input type="checkbox" id="debug-mode" onchange="IntegrationSettings.toggleDebug(this.checked)">
                                <span class="settings-slider"></span>
                            </label>
                        </div>
                        
                        <div class="apple-settings-item">
                            <div>
                                <div>Auto-update Integrations</div>
                                <div style="font-size: 12px; opacity: 0.7;">Automatically check for updates</div>
                            </div>
                            <label class="settings-toggle">
                                <input type="checkbox" checked onchange="IntegrationSettings.toggleAutoUpdate(this.checked)">
                                <span class="settings-slider"></span>
                            </label>
                        </div>
                        
                        <div class="apple-settings-item">
                            <div>
                                <div>Clear Integration Cache</div>
                                <div style="font-size: 12px; opacity: 0.7;">Remove temporary integration data</div>
                            </div>
                            <button onclick="IntegrationSettings.clearCache()" style="padding: 4px 12px;">Clear</button>
                        </div>
                        
                        <div class="apple-settings-item">
                            <div>
                                <div>Reset All Integrations</div>
                                <div style="font-size: 12px; opacity: 0.7;">Restore default settings</div>
                            </div>
                            <button onclick="IntegrationSettings.resetAll()" style="padding: 4px 12px; background: #ff5252;">Reset</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderThinkCard() {
        const status = this.os.integrations.bhekthink?.getStatus() || {};
        
        return `
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                <div style="font-size: 40px;">🤖</div>
                <div>
                    <h3 style="margin-bottom: 4px;">BhekThink AI</h3>
                    <p style="opacity: 0.7; font-size: 12px;">AI Sovereign Integration</p>
                </div>
                <div style="margin-left: auto;">
                    <span class="security-indicator ${status.connected ? 'security-high' : 'security-low'}"></span>
                    <span style="margin-left: 8px;">${status.connected ? 'Connected' : 'Disconnected'}</span>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 16px;">
                <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px;">
                    <div style="font-size: 12px; opacity: 0.7;">Mode</div>
                    <div style="font-weight: 500;">${status.fallback ? 'Fallback' : 'Live'}</div>
                </div>
                <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px;">
                    <div style="font-size: 12px; opacity: 0.7;">User</div>
                    <div style="font-weight: 500;">${status.user || 'Anonymous'}</div>
                </div>
                <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px;">
                    <div style="font-size: 12px; opacity: 0.7;">History</div>
                    <div style="font-weight: 500;">${status.historyCount || 0}</div>
                </div>
                <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px;">
                    <div style="font-size: 12px; opacity: 0.7;">Language</div>
                    <div style="font-weight: 500;">${status.language || 'English'}</div>
                </div>
            </div>
            
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <button onclick="IntegrationSettings.connectThink()" ${status.connected ? 'disabled' : ''}>
                    ${status.connected ? 'Connected' : 'Connect'}
                </button>
                <button class="secondary" onclick="IntegrationSettings.configureThink()">Configure</button>
                <button class="secondary" onclick="IntegrationSettings.exportThinkHistory()">Export History</button>
                <button class="secondary" onclick="IntegrationSettings.openThinkInNewTab()">Open in Tab</button>
            </div>
        `;
    },

    renderWorkCard() {
        const status = this.os.integrations.bhekwork?.getStatus() || {};
        
        return `
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                <div style="font-size: 40px;">🌐</div>
                <div>
                    <h3 style="margin-bottom: 4px;">BhekWork Browser</h3>
                    <p style="opacity: 0.7; font-size: 12px;">Bhek Network Browser</p>
                </div>
                <div style="margin-left: auto;">
                    <span class="security-indicator ${status.connected ? 'security-high' : 'security-low'}"></span>
                    <span style="margin-left: 8px;">${status.connected ? 'Connected' : 'Disconnected'}</span>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 16px;">
                <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px;">
                    <div style="font-size: 12px; opacity: 0.7;">Mode</div>
                    <div style="font-weight: 500;">${status.fallback ? 'Fallback' : 'Live'}</div>
                </div>
                <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px;">
                    <div style="font-size: 12px; opacity: 0.7;">Default Engine</div>
                    <div style="font-weight: 500;">${status.defaultEngine || 'google'}</div>
                </div>
                <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px;">
                    <div style="font-size: 12px; opacity: 0.7;">History</div>
                    <div style="font-weight: 500;">${status.historyCount || 0}</div>
                </div>
                <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px;">
                    <div style="font-size: 12px; opacity: 0.7;">Bookmarks</div>
                    <div style="font-weight: 500;">${status.bookmarksCount || 0}</div>
                </div>
            </div>
            
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <button onclick="IntegrationSettings.openBrowser()">Open Browser</button>
                <button class="secondary" onclick="IntegrationSettings.configureWork()">Configure</button>
                <button class="secondary" onclick="IntegrationSettings.exportWorkData()">Export Data</button>
                <button class="secondary" onclick="IntegrationSettings.openWorkInNewTab()">Open in Tab</button>
            </div>
        `;
    },

    // Integration methods
    async connectThink() {
        await this.os.integrations.bhekthink.connect();
        this.refresh();
    },

    configureThink() {
        const url = prompt('Enter BhekThink API URL:', this.os.integrations.bhekthink.config.appUrl);
        if (url) {
            this.os.integrations.bhekthink.config.appUrl = url;
            this.os.integrations.bhekthink.saveConfig();
            this.os.notify('BhekThink', 'Configuration updated');
        }
    },

    configureWork() {
        const url = prompt('Enter BhekWork App URL:', this.os.integrations.bhekwork.config.appUrl);
        if (url) {
            this.os.integrations.bhekwork.config.appUrl = url;
            this.os.integrations.bhekwork.saveConfig();
            this.os.notify('BhekWork', 'Configuration updated');
        }
    },

    openBrowser() {
        this.os.integrations.bhekwork.createWindow?.() || this.os.integrations.bhekwork.openInNewTab();
    },

    async testThink() {
        const result = await this.os.integrations.bhekthink.testConnection();
        if (result.success) {
            this.os.notify('Test Passed', `AI responded in ${result.latency}ms`, 'success');
        } else {
            this.os.notify('Test Failed', result.error, 'error');
        }
    },

    async testWork() {
        const result = await this.os.integrations.bhekwork.testConnection();
        if (result.success) {
            this.os.notify('Test Passed', `Browser ready in ${result.latency}ms`, 'success');
        } else {
            this.os.notify('Test Failed', result.error, 'error');
        }
    },

    async testBoth() {
        this.os.notify('Testing', 'Running integration tests...', 'info');
        
        const thinkResult = await this.os.integrations.bhekthink.testConnection();
        const workResult = await this.os.integrations.bhekwork.testConnection();
        
        if (thinkResult.success && workResult.success) {
            this.os.notify('All Tests Passed', 'Both integrations working!', 'success');
        } else {
            const failures = [];
            if (!thinkResult.success) failures.push('BhekThink');
            if (!workResult.success) failures.push('BhekWork');
            this.os.notify('Tests Failed', `${failures.join(', ')} failed`, 'error');
        }
    },

    exportThinkHistory() {
        this.os.integrations.bhekthink.exportConversation();
    },

    exportWorkData() {
        this.os.integrations.bhekwork.exportData();
    },

    openThinkInNewTab() {
        this.os.integrations.bhekthink.openInNewTab();
    },

    openWorkInNewTab() {
        this.os.integrations.bhekwork.openInNewTab();
    },

    viewLogs() {
        const thinkLogs = BhekStorage.load('bhekthink-history', []);
        const workLogs = BhekStorage.load('bhekwork-history', []);
        
        alert(`📊 Integration Statistics\n\n` +
              `BhekThink History: ${thinkLogs.length} conversations\n` +
              `BhekWork History: ${workLogs.length} searches\n` +
              `Bookmarks: ${this.os.integrations.bhekwork.bookmarks.length}`);
    },

    toggleDebug(enabled) {
        localStorage.setItem('debug-mode', enabled);
        this.os.notify('Debug Mode', enabled ? 'Enabled' : 'Disabled');
    },

    toggleAutoUpdate(enabled) {
        localStorage.setItem('auto-update', enabled);
        this.os.notify('Auto-Update', enabled ? 'Enabled' : 'Disabled');
    },

    clearCache() {
        if (confirm('Clear integration cache?')) {
            localStorage.removeItem('bhekthink-history');
            localStorage.removeItem('bhekwork-history');
            localStorage.removeItem('bhekwork-bookmarks');
            this.os.notify('Cache Cleared', 'Integration cache cleared');
            this.refresh();
        }
    },

    resetAll() {
        if (confirm('Reset all integration settings? This will clear all configurations.')) {
            localStorage.removeItem('bhekthink-config');
            localStorage.removeItem('bhekwork-config');
            localStorage.removeItem('bhekthink-history');
            localStorage.removeItem('bhekwork-history');
            localStorage.removeItem('bhekwork-bookmarks');
            
            // Reinitialize
            this.os.integrations.bhekthink.init(this.os);
            this.os.integrations.bhekwork.init(this.os);
            
            this.os.notify('Reset Complete', 'All integrations reset to defaults');
            this.refresh();
        }
    },

    refresh() {
        const view = document.querySelector('.window:last-child .view');
        if (view) {
            this.load(view, this.os);
        }
    }
};
