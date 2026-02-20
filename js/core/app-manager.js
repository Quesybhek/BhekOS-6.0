// App Manager - Handles app installation and management
class AppManager {
    constructor(os) {
        this.os = os;
        this.installedApps = new Map();
        this.availableApps = new Map();
        this.appRepositories = [
            {
                name: 'Official BhekOS Store',
                url: 'https://api.bhekos.com/apps',
                local: true
            }
        ];
        
        // Load installed apps
        this.loadInstalledApps();
        
        // Initialize default apps
        this.registerDefaultApps();
    }

    // Register built-in apps
    registerDefaultApps() {
        const defaultApps = [
            {
                id: 'explorer',
                name: 'File Explorer',
                description: 'Browse and manage files',
                version: '1.0.0',
                author: 'BhekOS',
                icon: '📁',
                category: 'system',
                builtin: true,
                load: (view, os) => FileExplorer.load(view, os)
            },
            {
                id: 'terminal',
                name: 'Terminal',
                description: 'Command-line interface',
                version: '1.0.0',
                author: 'BhekOS',
                icon: '💻',
                category: 'system',
                builtin: true,
                load: (view, os) => Terminal.load(view, os)
            },
            {
                id: 'browser',
                name: 'Web Browser',
                description: 'Browse the internet with BhekWork integration',
                version: '2.0.0',
                author: 'BhekOS',
                icon: '🌐',
                category: 'internet',
                builtin: true,
                integrations: ['BhekWork'],
                load: (view, os) => Browser.load(view, os)
            },
            {
                id: 'media',
                name: 'Media Player',
                description: 'Play music and videos',
                version: '1.0.0',
                author: 'BhekOS',
                icon: '🎵',
                category: 'media',
                builtin: true,
                load: (view, os) => MediaPlayer.load(view, os)
            },
            {
                id: 'settings',
                name: 'Settings',
                description: 'Configure BhekOS including integrations',
                version: '2.0.0',
                author: 'BhekOS',
                icon: '⚙️',
                category: 'system',
                builtin: true,
                load: (view, os) => Settings.load(view, os)
            },
            {
                id: 'games',
                name: 'Game Center',
                description: 'Play games',
                version: '1.0.0',
                author: 'BhekOS',
                icon: '🎮',
                category: 'games',
                builtin: true,
                load: (view, os) => Games.load(view, os)
            },
            {
                id: 'ai',
                name: 'BhekAI',
                description: 'AI Assistant powered by BhekThink',
                version: '2.0.0',
                author: 'BhekOS',
                icon: '🤖',
                category: 'utilities',
                builtin: true,
                integrations: ['BhekThink'],
                load: (view, os) => AIChat.load(view, os)
            },
            {
                id: 'notepad',
                name: 'Notepad',
                description: 'Take notes',
                version: '1.0.0',
                author: 'BhekOS',
                icon: '📝',
                category: 'utilities',
                builtin: true,
                load: (view, os) => Notepad.load(view, os)
            },
            {
                id: 'calculator',
                name: 'Calculator',
                description: 'Perform calculations',
                version: '1.0.0',
                author: 'BhekOS',
                icon: '🧮',
                category: 'utilities',
                builtin: true,
                load: (view, os) => Calculator.load(view, os)
            },
            {
                id: 'paint',
                name: 'Paint',
                description: 'Draw and create',
                version: '1.0.0',
                author: 'BhekOS',
                icon: '🎨',
                category: 'utilities',
                builtin: true,
                load: (view, os) => Paint.load(view, os)
            },
            {
                id: 'app-store',
                name: 'App Store',
                description: 'Discover and install apps',
                version: '1.0.0',
                author: 'BhekOS',
                icon: '📱',
                category: 'system',
                builtin: true,
                load: (view, os) => AppStore.load(view, os)
            },
            {
                id: 'integration-settings',
                name: 'Integrations',
                description: 'Manage BhekThink and BhekWork',
                version: '1.0.0',
                author: 'BhekOS',
                icon: '🔌',
                category: 'system',
                builtin: true,
                load: (view, os) => IntegrationSettings.load(view, os)
            }
        ];

        defaultApps.forEach(app => {
            this.installedApps.set(app.id, app);
        });
    }

    // Load installed apps from storage
    loadInstalledApps() {
        const saved = BhekStorage.load('installedApps', []);
        saved.forEach(appData => {
            try {
                const app = {
                    ...appData,
                    load: new Function('view', 'os', appData.loadFunction)
                };
                this.installedApps.set(app.id, app);
            } catch (e) {
                console.error('Failed to load app:', appData.id, e);
            }
        });
    }

    // Save installed apps
    saveInstalledApps() {
        const apps = Array.from(this.installedApps.values()).map(app => ({
            id: app.id,
            name: app.name,
            description: app.description,
            version: app.version,
            author: app.author,
            icon: app.icon,
            category: app.category,
            builtin: app.builtin || false,
            integrations: app.integrations || [],
            loadFunction: app.load ? app.load.toString() : null
        }));
        BhekStorage.save('installedApps', apps);
    }

    // Install new app
    async installApp(appSource) {
        try {
            BhekNotifications?.progress('Installing app...', 3000);

            let app;
            if (typeof appSource === 'string') {
                const response = await fetch(appSource);
                app = await response.json();
            } else {
                app = appSource;
            }

            if (!this.validateApp(app)) {
                throw new Error('Invalid app format');
            }

            if (this.installedApps.has(app.id)) {
                if (app.version <= this.installedApps.get(app.id).version) {
                    throw new Error('App already installed');
                }
                return await this.updateApp(app);
            }

            if (app.scriptUrl) {
                await this.loadAppScript(app.scriptUrl);
            }

            this.installedApps.set(app.id, app);
            this.saveInstalledApps();

            this.os.refreshDesktop();
            this.os.initStartMenu();

            BhekNotifications?.success('App Installed', `${app.name} v${app.version} installed successfully`);

            this.logInstallation(app);

            return app;
        } catch (error) {
            BhekNotifications?.error('Installation Failed', error.message);
            throw error;
        }
    }

    // Validate app format
    validateApp(app) {
        const required = ['id', 'name', 'version', 'load'];
        return required.every(field => app[field] !== undefined);
    }

    // Load external app script
    async loadAppScript(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Update existing app
    async updateApp(newApp) {
        const oldApp = this.installedApps.get(newApp.id);
        
        if (this.compareVersions(newApp.version, oldApp.version) <= 0) {
            throw new Error('No newer version available');
        }

        if (newApp.scriptUrl && newApp.scriptUrl !== oldApp.scriptUrl) {
            await this.loadAppScript(newApp.scriptUrl);
        }

        this.installedApps.set(newApp.id, newApp);
        this.saveInstalledApps();

        BhekNotifications?.success('App Updated', `${newApp.name} updated to v${newApp.version}`);

        return newApp;
    }

    // Uninstall app
    uninstallApp(appId) {
        const app = this.installedApps.get(appId);
        
        if (!app) {
            throw new Error('App not found');
        }

        if (app.builtin) {
            if (!confirm('This is a built-in app. Uninstalling may affect system stability. Continue?')) {
                return false;
            }
        }

        this.os.wm.procs.forEach((proc, pid) => {
            if (proc.type === appId) {
                this.os.wm.kill(pid);
            }
        });

        this.installedApps.delete(appId);
        this.saveInstalledApps();

        this.os.refreshDesktop();
        this.os.initStartMenu();

        BhekNotifications?.info('App Uninstalled', `${app.name} has been removed`);

        return true;
    }

    // Get app info
    getApp(appId) {
        return this.installedApps.get(appId);
    }

    // Get all apps
    getAllApps() {
        return Array.from(this.installedApps.values());
    }

    // Get apps by category
    getAppsByCategory(category) {
        return this.getAllApps().filter(app => app.category === category);
    }

    // Get apps by integration
    getAppsByIntegration(integration) {
        return this.getAllApps().filter(app => app.integrations?.includes(integration));
    }

    // Search apps
    searchApps(query) {
        query = query.toLowerCase();
        return this.getAllApps().filter(app => 
            app.name.toLowerCase().includes(query) ||
            app.description.toLowerCase().includes(query) ||
            app.author.toLowerCase().includes(query)
        );
    }

    // Compare versions
    compareVersions(v1, v2) {
        const parts1 = v1.split('.').map(Number);
        const parts2 = v2.split('.').map(Number);
        
        for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
            const p1 = parts1[i] || 0;
            const p2 = parts2[i] || 0;
            if (p1 !== p2) return p1 - p2;
        }
        return 0;
    }

    // Log installation
    logInstallation(app) {
        const logs = BhekStorage.load('installationLogs', []);
        logs.push({
            app: app.id,
            name: app.name,
            version: app.version,
            timestamp: new Date().toISOString()
        });
        BhekStorage.save('installationLogs', logs);
    }

    // Add app repository
    addRepository(repo) {
        this.appRepositories.push(repo);
        BhekStorage.save('appRepositories', this.appRepositories);
    }

    // Fetch available apps from repositories
    async fetchAvailableApps() {
        const allApps = [];
        
        for (const repo of this.appRepositories) {
            try {
                const response = await fetch(repo.url);
                const apps = await response.json();
                allApps.push(...apps.map(app => ({ ...app, repository: repo.name })));
            } catch (error) {
                console.error(`Failed to fetch from ${repo.name}:`, error);
            }
        }
        
        return allApps;
    }

    // Create app manifest for distribution
    createAppManifest(app) {
        return {
            id: app.id,
            name: app.name,
            description: app.description,
            version: app.version,
            author: app.author,
            icon: app.icon,
            category: app.category,
            permissions: app.permissions || [],
            integrations: app.integrations || [],
            scriptUrl: app.scriptUrl,
            size: app.size,
            minOSVersion: app.minOSVersion || '6.0.0',
            screenshot: app.screenshot,
            website: app.website
        };
    }
        }
