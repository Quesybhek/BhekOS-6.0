// App Store Application with Integration Support
const AppStore = {
    load(view, os) {
        this.os = os;
        this.currentView = 'featured';
        this.searchQuery = '';
        
        view.innerHTML = `
            <div style="height: 100%; display: flex; flex-direction: column; background: rgba(0,0,0,0.3);">
                <!-- Header with Integration Status -->
                <div style="padding: 20px; border-bottom: 1px solid var(--mica-border);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h2 style="margin-bottom: 8px;">📱 BhekOS App Store</h2>
                            <p style="opacity: 0.8;">Discover and install applications</p>
                        </div>
                        <div style="display: flex; gap: 12px;">
                            <div style="text-align: center;" title="BhekThink AI">
                                <span class="security-indicator ${os.integrations.bhekthink?.isConnected ? 'security-high' : 'security-low'}"></span>
                                <div style="font-size: 11px;">🤖 AI</div>
                            </div>
                            <div style="text-align: center;" title="BhekWork Browser">
                                <span class="security-indicator ${os.integrations.bhekwork?.isConnected ? 'security-high' : 'security-low'}"></span>
                                <div style="font-size: 11px;">🌐 Browser</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Search and Categories -->
                <div style="padding: 16px; background: rgba(0,0,0,0.2);">
                    <div style="display: flex; gap: 12px; margin-bottom: 16px;">
                        <input type="text" id="app-search" placeholder="Search apps..." 
                               style="flex: 1; padding: 12px;"
                               onkeyup="AppStore.search(this.value)">
                        <button onclick="AppStore.refresh()">↻ Refresh</button>
                    </div>
                    
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        <button class="${this.currentView === 'featured' ? '' : 'secondary'}" 
                                onclick="AppStore.showView('featured')">Featured</button>
                        <button class="${this.currentView === 'installed' ? '' : 'secondary'}" 
                                onclick="AppStore.showView('installed')">Installed</button>
                        <button class="${this.currentView === 'updates' ? '' : 'secondary'}" 
                                onclick="AppStore.showView('updates')">Updates</button>
                        <button class="${this.currentView === 'integrations' ? '' : 'secondary'}" 
                                onclick="AppStore.showView('integrations')">Integrations</button>
                        <button class="${this.currentView === 'categories' ? '' : 'secondary'}" 
                                onclick="AppStore.showView('categories')">Categories</button>
                    </div>
                </div>
                
                <!-- Content Area -->
                <div id="app-store-content" style="flex: 1; overflow-y: auto; padding: 20px;">
                    ${this.renderFeatured()}
                </div>
            </div>
        `;
        
        this.loadApps();
    },

    loadApps() {
        // Sample apps with integration requirements
        this.availableApps = [
            {
                id: 'advanced-ai',
                name: 'Advanced AI Chat',
                description: 'Enhanced AI chat with BhekThink integration',
                version: '2.0.0',
                author: 'Bhek Network',
                icon: '🤖',
                category: 'ai',
                size: '5.2 MB',
                requiresBhekThink: true,
                integrations: ['BhekThink'],
                rating: 4.8,
                downloads: '1.2k'
            },
            {
                id: 'web-explorer',
                name: 'Web Explorer Pro',
                description: 'Advanced browser with BhekWork engine',
                version: '1.5.0',
                author: 'Bhek Network',
                icon: '🌐',
                category: 'browser',
                size: '4.8 MB',
                requiresBhekWork: true,
                integrations: ['BhekWork'],
                rating: 4.7,
                downloads: '2.1k'
            },
            {
                id: 'ai-browser-combo',
                name: 'AI Browser Suite',
                description: 'Combined AI and browsing experience',
                version: '1.0.0',
                author: 'Bhek Network',
                icon: '🚀',
                category: 'productivity',
                size: '8.5 MB',
                requiresBhekThink: true,
                requiresBhekWork: true,
                integrations: ['BhekThink', 'BhekWork'],
                rating: 5.0,
                downloads: '500'
            },
            {
                id: 'language-translator',
                name: 'Twi Translator',
                description: 'Translate between Twi, Ga, and English using BhekThink',
                version: '1.2.0',
                author: 'Bhek Network',
                icon: '🗣️',
                category: 'utilities',
                size: '3.1 MB',
                requiresBhekThink: true,
                integrations: ['BhekThink'],
                rating: 4.9,
                downloads: '850'
            },
            {
                id: 'voice-assistant',
                name: 'Voice Assistant',
                description: 'Voice-controlled assistant with BhekThink AI',
                version: '1.1.0',
                author: 'Bhek Network',
                icon: '🎤',
                category: 'ai',
                size: '4.2 MB',
                requiresBhekThink: true,
                integrations: ['BhekThink'],
                rating: 4.6,
                downloads: '750'
            },
            {
                id: 'search-master',
                name: 'Search Master',
                description: 'Multi-engine search with BhekWork',
                version: '1.3.0',
                author: 'Bhek Network',
                icon: '🔍',
                category: 'browser',
                size: '2.8 MB',
                requiresBhekWork: true,
                integrations: ['BhekWork'],
                rating: 4.5,
                downloads: '1.5k'
            }
        ];
        
        this.renderCurrentView();
    },

    renderCurrentView() {
        const content = document.getElementById('app-store-content');
        if (!content) return;

        switch(this.currentView) {
            case 'featured':
                content.innerHTML = this.renderFeatured();
                break;
            case 'installed':
                content.innerHTML = this.renderInstalled();
                break;
            case 'updates':
                content.innerHTML = this.renderUpdates();
                break;
            case 'integrations':
                content.innerHTML = this.renderIntegrations();
                break;
            case 'categories':
                content.innerHTML = this.renderCategories();
                break;
        }
    },

    renderFeatured() {
        const featured = this.availableApps.slice(0, 4);
        
        return `
            <div>
                <h3 style="margin-bottom: 16px;">🌟 Featured Apps with Integrations</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
                    ${featured.map(app => this.renderAppCard(app)).join('')}
                </div>
                
                <h3 style="margin: 32px 0 16px;">📊 Popular Integration Apps</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
                    ${this.availableApps.slice(4, 8).map(app => this.renderAppCard(app)).join('')}
                </div>
            </div>
        `;
    },

    renderInstalled() {
        const installed = this.os.appManager?.getAllApps() || [];
        
        return `
            <div>
                <h3 style="margin-bottom: 16px;">📦 Installed Apps (${installed.length})</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
                    ${installed.map(app => this.renderInstalledAppCard(app)).join('')}
                </div>
            </div>
        `;
    },

    renderUpdates() {
        const updates = this.availableApps.filter(app => {
            const installed = this.os.appManager?.getApp(app.id);
            return installed && app.version > installed.version;
        });

        return `
            <div>
                <h3 style="margin-bottom: 16px;">🔄 Available Updates (${updates.length})</h3>
                ${updates.length === 0 ? 
                    '<p style="opacity: 0.7; text-align: center;">All apps are up to date</p>' : 
                    `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
                        ${updates.map(app => this.renderUpdateCard(app)).join('')}
                    </div>`
                }
            </div>
        `;
    },

    renderIntegrations() {
        const thinkStatus = this.os.integrations.bhekthink?.getStatus() || {};
        const workStatus = this.os.integrations.bhekwork?.getStatus() || {};
        
        return `
            <div>
                <h3 style="margin-bottom: 20px;">🔌 Integration Hub</h3>
                
                <!-- BhekThink AI App -->
                <div class="game-card" style="padding: 20px; margin-bottom: 20px; border-left: 3px solid #00ff88;">
                    <div style="display: flex; align-items: center; gap: 20px;">
                        <div style="font-size: 64px;">🤖</div>
                        <div style="flex: 1;">
                            <h3 style="margin-bottom: 4px;">BhekThink AI Sovereign</h3>
                            <p style="opacity: 0.7; margin-bottom: 8px;">Advanced AI integration with language mesh, image generation, and voice</p>
                            <div style="display: flex; gap: 16px; font-size: 12px; flex-wrap: wrap;">
                                <div>
                                    <span class="security-indicator ${thinkStatus.connected ? 'security-high' : 'security-low'}"></span>
                                    ${thinkStatus.connected ? 'Connected' : 'Disconnected'}
                                </div>
                                <div>Mode: ${thinkStatus.fallback ? 'Fallback' : 'Live'}</div>
                                <div>User: ${thinkStatus.user || 'Anonymous'}</div>
                                <div>History: ${thinkStatus.historyCount || 0}</div>
                            </div>
                        </div>
                        <div>
                            <button onclick="AppStore.launchIntegration('bhekthink')" 
                                    style="margin-right: 8px;">Open AI</button>
                            <button class="secondary" onclick="AppStore.configureIntegration('bhekthink')">Configure</button>
                        </div>
                    </div>
                </div>
                
                <!-- BhekWork Browser App -->
                <div class="game-card" style="padding: 20px; margin-bottom: 20px; border-left: 3px solid #f9a84d;">
                    <div style="display: flex; align-items: center; gap: 20px;">
                        <div style="font-size: 64px;">🌐</div>
                        <div style="flex: 1;">
                            <h3 style="margin-bottom: 4px;">BhekWork Browser</h3>
                            <p style="opacity: 0.7; margin-bottom: 8px;">Multi-engine search with Google, YouTube, GitHub, LinkedIn, Wiki, Bing</p>
                            <div style="display: flex; gap: 16px; font-size: 12px; flex-wrap: wrap;">
                                <div>
                                    <span class="security-indicator ${workStatus.connected ? 'security-high' : 'security-low'}"></span>
                                    ${workStatus.connected ? 'Connected' : 'Disconnected'}
                                </div>
                                <div>Mode: ${workStatus.fallback ? 'Fallback' : 'Live'}</div>
                                <div>Engine: ${workStatus.defaultEngine || 'google'}</div>
                                <div>History: ${workStatus.historyCount || 0}</div>
                            </div>
                        </div>
                        <div>
                            <button onclick="AppStore.launchIntegration('bhekwork')" 
                                    style="margin-right: 8px;">Open Browser</button>
                            <button class="secondary" onclick="AppStore.configureIntegration('bhekwork')">Configure</button>
                        </div>
                    </div>
                </div>
                
                <!-- Integration Stats -->
                <div style="background: rgba(0,0,0,0.2); border-radius: 8px; padding: 16px; margin-top: 20px;">
                    <h4 style="margin-bottom: 12px;">📊 Integration Statistics</h4>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
                        <div>
                            <div style="font-size: 12px; opacity: 0.7;">AI Response Time</div>
                            <div style="font-size: 20px;">~150ms</div>
                        </div>
                        <div>
                            <div style="font-size: 12px; opacity: 0.7;">Searches Today</div>
                            <div style="font-size: 20px;">${workStatus.historyCount || 0}</div>
                        </div>
                        <div>
                            <div style="font-size: 12px; opacity: 0.7;">Languages Supported</div>
                            <div style="font-size: 20px;">6</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderCategories() {
        const categories = [
            { id: 'ai', name: 'AI Apps', icon: '🤖', count: 3, color: '#00ff88' },
            { id: 'browser', name: 'Browser Apps', icon: '🌐', count: 3, color: '#f9a84d' },
            { id: 'productivity', name: 'Productivity', icon: '⚡', count: 2, color: '#4a76a8' },
            { id: 'utilities', name: 'Utilities', icon: '🔧', count: 2, color: '#ff9800' }
        ];

        return `
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px;">
                ${categories.map(cat => `
                    <div class="game-card" onclick="AppStore.showCategory('${cat.id}')" 
                         style="padding: 24px; text-align: center; border-left: 3px solid ${cat.color};">
                        <div style="font-size: 48px; margin-bottom: 12px;">${cat.icon}</div>
                        <h4 style="margin-bottom: 4px;">${cat.name}</h4>
                        <p style="font-size: 12px; opacity: 0.7;">${cat.count} integration apps</p>
                    </div>
                `).join('')}
            </div>
        `;
    },

    renderAppCard(app) {
        const installed = this.os.appManager?.getApp(app.id);
        const hasUpdate = installed && app.version > installed.version;
        
        return `
            <div class="game-card" style="padding: 20px; position: relative; border-left: 3px solid ${this.getIntegrationColor(app)};">
                ${app.integrations ? `
                    <div style="position: absolute; top: 10px; right: 10px; display: flex; gap: 4px;">
                        ${app.requiresBhekThink ? '<span style="background: #00ff88; color: black; padding: 2px 8px; border-radius: 12px; font-size: 10px;">🤖 AI</span>' : ''}
                        ${app.requiresBhekWork ? '<span style="background: #f9a84d; color: black; padding: 2px 8px; border-radius: 12px; font-size: 10px;">🌐 Web</span>' : ''}
                    </div>
                ` : ''}
                
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                    <div style="font-size: 40px;">${app.icon || '📦'}</div>
                    <div style="flex: 1;">
                        <h4 style="margin-bottom: 4px;">${app.name}</h4>
                        <p style="font-size: 12px; opacity: 0.7;">by ${app.author || 'Bhek Network'}</p>
                    </div>
                </div>
                
                <p style="font-size: 13px; opacity: 0.8; margin-bottom: 12px;">${app.description || 'No description'}</p>
                
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; flex-wrap: wrap;">
                    <span style="font-size: 11px; background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 12px;">v${app.version}</span>
                    <span style="font-size: 11px; background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 12px;">${app.size || '2MB'}</span>
                    <span style="font-size: 11px; color: gold;">⭐ ${app.rating || '4.5'}</span>
                </div>
                
                <div style="display: flex; gap: 8px;">
                    ${installed ? 
                        `<button class="secondary" style="flex: 1;" onclick="AppStore.uninstall('${app.id}')">Uninstall</button>
                         ${hasUpdate ? `<button style="flex: 1;" onclick="AppStore.update('${app.id}')">Update</button>` : ''}`
                        :
                        `<button style="flex: 1;" onclick="AppStore.install('${app.id}')" 
                                ${this.checkIntegrationRequirements(app) ? '' : 'disabled'}>
                            ${this.checkIntegrationRequirements(app) ? 'Install' : 'Requires Integration'}
                        </button>`
                    }
                    <button class="secondary" onclick="AppStore.showDetails('${app.id}')">Details</button>
                </div>
            </div>
        `;
    },

    renderInstalledAppCard(app) {
        return `
            <div class="game-card" style="padding: 20px; border-left: 3px solid ${app.builtin ? '#4a76a8' : this.getIntegrationColor(app)};">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                    <div style="font-size: 40px;">${app.icon || '📦'}</div>
                    <div style="flex: 1;">
                        <h4 style="margin-bottom: 4px;">${app.name}</h4>
                        <p style="font-size: 12px; opacity: 0.7;">v${app.version}</p>
                    </div>
                </div>
                
                <p style="font-size: 13px; opacity: 0.8; margin-bottom: 12px;">${app.description || 'No description'}</p>
                
                <div style="display: flex; gap: 8px;">
                    <button style="flex: 1;" onclick="os.launchApp('${app.name}', '${app.id}')">Open</button>
                    ${!app.builtin ? 
                        `<button class="secondary" onclick="AppStore.uninstall('${app.id}')">Uninstall</button>` : 
                        ''
                    }
                </div>
            </div>
        `;
    },

    renderUpdateCard(app) {
        const installed = this.os.appManager?.getApp(app.id);
        
        return `
            <div class="game-card" style="padding: 20px; border-left: 3px solid #ff9800;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                    <div style="font-size: 40px;">${app.icon || '📦'}</div>
                    <div style="flex: 1;">
                        <h4 style="margin-bottom: 4px;">${app.name}</h4>
                        <p style="font-size: 12px; opacity: 0.7;">${installed.version} → ${app.version}</p>
                    </div>
                </div>
                
                <div style="background: rgba(255,152,0,0.1); padding: 8px; border-radius: 6px; margin-bottom: 12px;">
                    <p style="font-size: 12px;">New features and improvements available</p>
                </div>
                
                <button style="width: 100%;" onclick="AppStore.update('${app.id}')">Update Now</button>
            </div>
        `;
    },

    getIntegrationColor(app) {
        if (app.requiresBhekThink && app.requiresBhekWork) return 'linear-gradient(135deg, #00ff88, #f9a84d)';
        if (app.requiresBhekThink) return '#00ff88';
        if (app.requiresBhekWork) return '#f9a84d';
        return '#4a76a8';
    },

    checkIntegrationRequirements(app) {
        if (app.requiresBhekThink && !this.os.integrations.bhekthink?.isConnected) {
            return false;
        }
        if (app.requiresBhekWork && !this.os.integrations.bhekwork?.isConnected) {
            return false;
        }
        return true;
    },

    launchIntegration(type) {
        if (type === 'bhekthink') {
            this.os.launchApp('BhekAI', 'ai');
        } else if (type === 'bhekwork') {
            this.os.launchApp('Web Browser', 'browser');
        }
    },

    configureIntegration(type) {
        this.os.launchApp('Settings', 'settings');
        setTimeout(() => {
            const settingsApp = document.querySelector('.window:last-child .view');
            if (settingsApp) {
                Settings.loadSettingsTab('integrations');
            }
        }, 500);
    },

    install(appId) {
        const app = this.availableApps.find(a => a.id === appId);
        if (!app) return;
        
        if (!this.checkIntegrationRequirements(app)) {
            this.os.notify('App Store', 'Required integration not connected', 'error');
            return;
        }
        
        this.os.notify('App Store', `Installing ${app.name}...`, 'info');
        
        setTimeout(() => {
            this.os.appManager?.installApp({
                id: app.id,
                name: app.name,
                description: app.description,
                version: app.version,
                author: app.author,
                icon: app.icon,
                category: app.category,
                load: (view, os) => {
                    view.innerHTML = `
                        <div style="padding: 40px; text-align: center;">
                            <div style="font-size: 48px; margin-bottom: 20px;">${app.icon}</div>
                            <h2>${app.name}</h2>
                            <p style="margin: 20px 0;">${app.description}</p>
                            <p style="opacity: 0.7;">Version ${app.version} | Installed from App Store</p>
                            <hr style="margin: 20px 0; border-color: rgba(255,255,255,0.1);">
                            <p style="font-size: 12px;">This app integrates with: ${app.integrations?.join(', ') || 'None'}</p>
                        </div>
                    `;
                }
            });
            
            this.os.notify('App Store', `${app.name} installed successfully`, 'success');
            this.renderCurrentView();
        }, 2000);
    },

    uninstall(appId) {
        if (confirm('Uninstall this app?')) {
            this.os.appManager?.uninstallApp(appId);
            this.renderCurrentView();
        }
    },

    update(appId) {
        this.os.notify('App Store', 'Updating app...', 'info');
        setTimeout(() => {
            this.os.notify('App Store', 'App updated successfully', 'success');
            this.renderCurrentView();
        }, 2000);
    },

    showView(view) {
        this.currentView = view;
        this.renderCurrentView();
        
        // Update button styles
        document.querySelectorAll('.category-btn, [onclick^="AppStore.showView"]').forEach(btn => {
            btn.classList.toggle('secondary', true);
        });
        event.target.classList.remove('secondary');
    },

    showCategory(categoryId) {
        const categoryApps = this.availableApps.filter(app => app.category === categoryId);
        
        const content = document.getElementById('app-store-content');
        content.innerHTML = `
            <div>
                <button onclick="AppStore.showView('categories')" style="margin-bottom: 16px;">← Back to Categories</button>
                <h3 style="margin-bottom: 16px;">${categoryId.charAt(0).toUpperCase() + categoryId.slice(1)} Apps</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
                    ${categoryApps.map(app => this.renderAppCard(app)).join('')}
                </div>
            </div>
        `;
    },

    search(query) {
        this.searchQuery = query;
        
        if (!query) {
            this.renderCurrentView();
            return;
        }

        const results = this.availableApps.filter(app => 
            app.name.toLowerCase().includes(query.toLowerCase()) ||
            app.description.toLowerCase().includes(query.toLowerCase()) ||
            app.author?.toLowerCase().includes(query.toLowerCase())
        );
        
        const content = document.getElementById('app-store-content');
        content.innerHTML = `
            <div>
                <h3 style="margin-bottom: 16px;">Search Results for "${query}"</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
                    ${results.map(app => this.renderAppCard(app)).join('')}
                </div>
            </div>
        `;
    },

    refresh() {
        this.os.notify('App Store', 'Refreshing app list...', 'info');
        setTimeout(() => {
            this.renderCurrentView();
            this.os.notify('App Store', 'App list refreshed', 'success');
        }, 1000);
    },

    showDetails(appId) {
        const app = this.availableApps.find(a => a.id === appId);
        
        const content = document.getElementById('app-store-content');
        content.innerHTML = `
            <div style="max-width: 600px; margin: 0 auto;">
                <button onclick="AppStore.renderCurrentView()" style="margin-bottom: 20px;">← Back</button>
                
                <div style="background: rgba(0,0,0,0.2); border-radius: 12px; padding: 24px; border-left: 3px solid ${this.getIntegrationColor(app)};">
                    <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 20px;">
                        <div style="font-size: 64px;">${app.icon || '📦'}</div>
                        <div>
                            <h2 style="margin-bottom: 4px;">${app.name}</h2>
                            <p style="opacity: 0.7;">by ${app.author || 'Bhek Network'}</p>
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px;">
                        <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px;">
                            <div style="font-size: 12px; opacity: 0.7;">Version</div>
                            <div style="font-weight: 500;">${app.version}</div>
                        </div>
                        <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px;">
                            <div style="font-size: 12px; opacity: 0.7;">Category</div>
                            <div style="font-weight: 500;">${app.category || 'Uncategorized'}</div>
                        </div>
                        <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px;">
                            <div style="font-size: 12px; opacity: 0.7;">Size</div>
                            <div style="font-weight: 500;">${app.size || '~2MB'}</div>
                        </div>
                        <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px;">
                            <div style="font-size: 12px; opacity: 0.7;">Downloads</div>
                            <div style="font-weight: 500;">${app.downloads || '1.2k'}</div>
                        </div>
                    </div>
                    
                    <h4 style="margin-bottom: 8px;">Description</h4>
                    <p style="opacity: 0.8; margin-bottom: 20px;">${app.description || 'No description available'}</p>
                    
                    <h4 style="margin-bottom: 8px;">Integration Requirements</h4>
                    <div style="display: flex; gap: 12px; margin-bottom: 20px;">
                        ${app.requiresBhekThink ? 
                            `<div style="background: rgba(0,255,136,0.1); padding: 4px 12px; border-radius: 16px; font-size: 12px;">
                                🤖 Requires BhekThink ${this.os.integrations.bhekthink?.isConnected ? '✅' : '❌'}
                            </div>` : ''}
                        ${app.requiresBhekWork ? 
                            `<div style="background: rgba(249,168,77,0.1); padding: 4px 12px; border-radius: 16px; font-size: 12px;">
                                🌐 Requires BhekWork ${this.os.integrations.bhekwork?.isConnected ? '✅' : '❌'}
                            </div>` : ''}
                    </div>
                    
                    <div style="display: flex; gap: 8px;">
                        ${this.os.appManager?.getApp(app.id) ? 
                            `<button class="secondary" style="flex: 1;" onclick="AppStore.uninstall('${app.id}')">Uninstall</button>` :
                            `<button style="flex: 1;" onclick="AppStore.install('${app.id}')" 
                                    ${this.checkIntegrationRequirements(app) ? '' : 'disabled'}>
                                ${this.checkIntegrationRequirements(app) ? 'Install App' : 'Integrations Required'}
                            </button>`
                        }
                    </div>
                </div>
            </div>
        `;
    }
};
