// Main OS Class with Integrations - COMPLETE VERSION
class BhekOS {
    constructor() {
        this.version = "6.0.0";
        this.build = "22000.556";
        
        // Initialize modules
        this.security = new BhekSecurity(this);
        this.wm = new WindowManager(this);
        this.appManager = new AppManager(this);
        
        // Initialize integrations object
        this.integrations = {};
        
        // State
        this.selectedDesktopIcon = null;
        this.wallpaper = BhekStorage.load('wallpaper', 'default');
        this.deferredPrompt = null;
        this.startMenuVisible = false;
        
        // Initialize
        this.init();
    }

    init() {
        console.log('BhekOS initializing...');
        
        // Set wallpaper immediately
        this.setWallpaper();
        
        // Initialize components
        this.initIconSettings();
        this.initDesktopIcons();
        this.initStartMenu();
        
        // Setup event listeners
        this.setupEventListeners();
        this.setupPWA();
        this.startClock();
        
        // Initialize integrations
        this.initIntegrations();
        
        // Start security monitoring
        this.security.startInactivityMonitoring();
        
        // Show welcome message
        setTimeout(() => this.notify('BhekOS 6.0', 'System initialized and ready'), 1000);
        setTimeout(() => this.notify('Tip', 'Double-click desktop icons to launch apps'), 2000);
        
        console.log('BhekOS initialized successfully');
    }

    // ==================== WALLPAPER METHODS ====================
    setWallpaper() {
        const wallpapers = {
            'default': 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=2564&q=80',
            'nature': 'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=2564&q=80',
            'abstract': 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?auto=format&fit=crop&w=2564&q=80',
            'gradient': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=2564&q=80'
        };
        
        const url = wallpapers[this.wallpaper] || wallpapers.default;
        const desktop = document.getElementById('desktop');
        if (desktop) {
            desktop.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url('${url}')`;
            desktop.style.backgroundSize = 'cover';
            desktop.style.backgroundPosition = 'center';
            desktop.style.backgroundRepeat = 'no-repeat';
            console.log('Wallpaper set:', url);
        }
    }

    changeWallpaper(type) {
        this.wallpaper = type;
        BhekStorage.save('wallpaper', type);
        this.setWallpaper();
        this.notify('Settings', `Wallpaper changed to ${type}`);
    }

    // ==================== ICON METHODS ====================
    initIconSettings() {
        if (!BhekStorage.load('iconSettings')) {
            const defaultSettings = {};
            ['explorer', 'terminal', 'browser', 'media', 'settings', 'games', 'ai', 'notepad', 'calculator', 'paint', 'app-store', 'integration-settings']
                .forEach(type => {
                    defaultSettings[type] = {
                        emoji: this.getDefaultIcon(type),
                        color: this.getDefaultColor(type),
                        size: 32,
                        bgOpacity: 20
                    };
                });
            BhekStorage.save('iconSettings', defaultSettings);
        }
    }

    getDefaultIcon(type) {
        const map = {
            'explorer': '📁', 'terminal': '💻', 'browser': '🌐',
            'media': '🎵', 'settings': '⚙️', 'games': '🎮',
            'ai': '🤖', 'notepad': '📝', 'calculator': '🧮', 
            'paint': '🎨', 'app-store': '📱', 'integration-settings': '🔌'
        };
        return map[type] || '📄';
    }

    getDefaultColor(type) {
        const map = {
            'explorer': '#4CAF50', 'terminal': '#2196F3', 'browser': '#FF9800',
            'media': '#9C27B0', 'settings': '#607D8B', 'games': '#E91E63',
            'ai': '#00BCD4', 'notepad': '#009688', 'calculator': '#FF5722', 
            'paint': '#8BC34A', 'app-store': '#9C27B0', 'integration-settings': '#00FF88'
        };
        return map[type] || '#0078d4';
    }

    // ==================== DESKTOP ICONS ====================
    initDesktopIcons() {
        const icons = [
            { id: 'explorer', name: 'File Explorer', icon: '📁', color: '#4CAF50' },
            { id: 'terminal', name: 'Terminal', icon: '💻', color: '#2196F3' },
            { id: 'browser', name: 'Web Browser', icon: '🌐', color: '#FF9800' },
            { id: 'media', name: 'Media Player', icon: '🎵', color: '#9C27B0' },
            { id: 'settings', name: 'Settings', icon: '⚙️', color: '#607D8B' },
            { id: 'games', name: 'Game Center', icon: '🎮', color: '#E91E63' },
            { id: 'ai', name: 'BhekAI', icon: '🤖', color: '#00BCD4' },
            { id: 'notepad', name: 'Notepad', icon: '📝', color: '#009688' },
            { id: 'calculator', name: 'Calculator', icon: '🧮', color: '#FF5722' },
            { id: 'paint', name: 'Paint', icon: '🎨', color: '#8BC34A' },
            { id: 'app-store', name: 'App Store', icon: '📱', color: '#9C27B0' },
            { id: 'integration-settings', name: 'Integrations', icon: '🔌', color: '#00FF88' }
        ];
        
        const container = document.getElementById('desktopIcons');
        if (!container) {
            console.error('Desktop icons container not found');
            return;
        }
        
        container.innerHTML = '';
        container.style.position = 'absolute';
        container.style.top = '20px';
        container.style.left = '20px';
        container.style.zIndex = '10';
        
        icons.forEach((icon, index) => {
            const div = document.createElement('div');
            div.className = 'desktop-icon';
            div.id = `desktop-${icon.id}`;
            
            // Position in a grid
            const col = index % 4;
            const row = Math.floor(index / 4);
            div.style.left = (col * 100) + 'px';
            div.style.top = (row * 110) + 'px';
            
            div.innerHTML = `
                <div class="icon-emoji" style="background: ${icon.color}33;">${icon.icon}</div>
                <div class="icon-name">${icon.name}</div>
            `;
            
            // Double-click to launch
            div.ondblclick = (e) => {
                e.stopPropagation();
                console.log(`Launching: ${icon.name}`);
                this.launchApp(icon.name, icon.id);
            };
            
            // Single click to select
            div.onclick = (e) => {
                e.stopPropagation();
                this.selectDesktopIcon(icon.id);
            };
            
            container.appendChild(div);
        });
        
        console.log(`${icons.length} desktop icons created`);
    }

    selectDesktopIcon(id) {
        if (this.selectedDesktopIcon) {
            const prev = document.getElementById(`desktop-${this.selectedDesktopIcon}`);
            if (prev) prev.classList.remove('selected');
        }
        this.selectedDesktopIcon = id;
        const current = document.getElementById(`desktop-${id}`);
        if (current) current.classList.add('selected');
    }

    // ==================== START MENU ====================
    initStartMenu() {
        const menu = document.getElementById('startMenu');
        if (!menu) return;
        
        const apps = [
            { id: 'explorer', name: 'File Explorer', icon: '📁' },
            { id: 'terminal', name: 'Terminal', icon: '💻' },
            { id: 'browser', name: 'Web Browser', icon: '🌐' },
            { id: 'media', name: 'Media Player', icon: '🎵' },
            { id: 'settings', name: 'Settings', icon: '⚙️' },
            { id: 'games', name: 'Game Center', icon: '🎮' },
            { id: 'ai', name: 'BhekAI', icon: '🤖' },
            { id: 'notepad', name: 'Notepad', icon: '📝' },
            { id: 'calculator', name: 'Calculator', icon: '🧮' },
            { id: 'paint', name: 'Paint', icon: '🎨' },
            { id: 'app-store', name: 'App Store', icon: '📱' },
            { id: 'integration-settings', name: 'Integrations', icon: '🔌' }
        ];
        
        const thinkConnected = this.integrations?.bhekthink?.isConnected;
        const workConnected = this.integrations?.bhekwork?.isConnected;
        
        menu.innerHTML = `
            <div class="start-menu-header">
                <h2>BhekOS ${this.version}</h2>
                <p style="display: flex; align-items: center; gap: 10px;">
                    <span>${apps.length} apps</span>
                    <span>|</span>
                    <span class="integration-badge" style="color: #00ff88;">🤖 ${thinkConnected ? 'AI Online' : 'AI'}</span>
                    <span class="integration-badge" style="color: #f9a84d;">🌐 ${workConnected ? 'Browser Online' : 'Browser'}</span>
                </p>
            </div>
            <div class="start-menu-grid">
                ${apps.map(app => `
                    <div class="start-menu-item" onclick="os.launchApp('${app.name}', '${app.id}'); os.toggleStart()">
                        <div class="emoji">${app.icon}</div>
                        <div>${app.name}</div>
                    </div>
                `).join('')}
            </div>
            <div style="padding: 20px; border-top: 1px solid var(--mica-border);">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-weight: 500;">Administrator</div>
                        <div style="font-size: 12px; opacity: 0.8;">BhekOS User</div>
                    </div>
                    <button class="secondary" onclick="os.shutdown()">⏻ Power</button>
                </div>
                <div style="display: flex; gap: 8px; justify-content: space-around; margin-top: 10px; font-size: 11px;">
                    <div onclick="showIntegrationStatus()" style="cursor: pointer;">
                        <span class="security-indicator ${thinkConnected ? 'security-high' : 'security-low'}"></span>
                        BhekThink
                    </div>
                    <div onclick="showIntegrationStatus()" style="cursor: pointer;">
                        <span class="security-indicator ${workConnected ? 'security-high' : 'security-low'}"></span>
                        BhekWork
                    </div>
                </div>
            </div>
        `;
    }

    toggleStart() {
        const menu = document.getElementById('startMenu');
        this.startMenuVisible = !this.startMenuVisible;
        menu.style.display = this.startMenuVisible ? 'flex' : 'none';
        this.updateStartButton(); // Update start button state
    }

    // ==================== START BUTTON METHODS ====================
    updateStartButton() {
        const startBtn = document.getElementById('startButton');
        if (!startBtn) return;
        
        // Update based on start menu visibility
        if (this.startMenuVisible) {
            startBtn.classList.add('active');
        } else {
            startBtn.classList.remove('active');
        }
    }

    // ==================== APP LAUNCHING ====================
    launchApp(name, type) {
        console.log(`Launching app: ${name} (${type})`);
        
        if (type === 'browser' && this.integrations.bhekwork) {
            this.integrations.bhekwork.openInNewTab();
            return;
        }
        
        if (type === 'integration-settings') {
            const pid = this.wm.spawn(name, type);
            setTimeout(() => {
                const view = document.getElementById(`view-${pid}`);
                if (view && IntegrationSettings) {
                    IntegrationSettings.load(view, this);
                }
            }, 100);
            return;
        }
        
        if (type === 'app-store') {
            const pid = this.wm.spawn(name, type);
            setTimeout(() => {
                const view = document.getElementById(`view-${pid}`);
                if (view && AppStore) {
                    AppStore.load(view, this);
                }
            }, 100);
            return;
        }

        if (this.security.requiresPassword(type)) {
            this.security.showPasswordPrompt('app', type, () => {
                this.createAppWindow(name, type);
            });
        } else {
            this.createAppWindow(name, type);
        }
    }

    createAppWindow(name, type) {
        const pid = this.wm.spawn(name, type);
        setTimeout(() => {
            const view = document.getElementById(`view-${pid}`);
            if (view) {
                switch(type) {
                    case 'ai':
                        if (AIChat) AIChat.load(view, this);
                        break;
                    case 'explorer':
                        if (FileExplorer) FileExplorer.load(view, this);
                        break;
                    case 'terminal':
                        if (Terminal) Terminal.load(view, this);
                        break;
                    case 'media':
                        if (MediaPlayer) MediaPlayer.load(view, this);
                        break;
                    case 'settings':
                        if (Settings) Settings.load(view, this);
                        break;
                    case 'games':
                        if (Games) Games.load(view, this);
                        break;
                    case 'notepad':
                        if (Notepad) Notepad.load(view, this);
                        break;
                    case 'calculator':
                        if (Calculator) Calculator.load(view, this);
                        break;
                    case 'paint':
                        if (Paint) Paint.load(view, this);
                        break;
                    default:
                        view.innerHTML = `<h3>${name} app loaded</h3>`;
                }
            }
        }, 100);
    }

    // ==================== TASKBAR ====================
    addTaskbar(pid, name, type) {
        const bar = document.getElementById('runningApps');
        if (!bar) return;
        
        const btn = document.createElement('div');
        btn.className = 'taskbar-icon';
        btn.id = 'task-' + pid;
        
        const iconMap = {
            'explorer': '📁', 'terminal': '💻', 'browser': '🌐',
            'media': '🎵', 'settings': '⚙️', 'games': '🎮',
            'ai': '🤖', 'notepad': '📝', 'calculator': '🧮',
            'paint': '🎨', 'app-store': '📱', 'integration-settings': '🔌'
        };
        
        btn.innerHTML = iconMap[type] || '📄';
        btn.title = name;
        
        btn.onclick = () => {
            const proc = this.wm.getProc(pid);
            if (proc) {
                this.wm.focus(pid);
                if (proc.win.style.display === 'none') {
                    proc.win.style.display = 'flex';
                }
            }
        };
        
        bar.appendChild(btn);
        return btn;
    }

    // ==================== INTEGRATION METHODS ====================
    initIntegrations() {
        // Initialize BhekThink
        try {
            if (typeof BhekThinkBridge !== 'undefined') {
                BhekThinkBridge.config.appUrl = 'https://quesybhek.github.io/BhekThink-AI-Pro/';
                this.integrations.bhekthink = BhekThinkBridge.init(this);
                console.log('✅ BhekThink AI integration initialized');
            }
        } catch (error) {
            console.error('Failed to initialize BhekThink:', error);
        }

        // Initialize BhekWork
        try {
            if (typeof BhekWorkBridge !== 'undefined') {
                BhekWorkBridge.config.appUrl = 'https://quesybhek.github.io/BhekWork/';
                this.integrations.bhekwork = BhekWorkBridge.init(this);
                console.log('✅ BhekWork Browser integration initialized');
            }
        } catch (error) {
            console.error('Failed to initialize BhekWork:', error);
        }
        
        // Update integration indicators
        this.updateIntegrationIndicators();
    }

    updateIntegrationIndicators() {
        const thinkIndicator = document.getElementById('think-status');
        const workIndicator = document.getElementById('work-status');
        
        if (thinkIndicator) {
            const connected = this.integrations.bhekthink?.isConnected;
            thinkIndicator.className = `security-indicator ${connected ? 'security-high' : 'security-low'}`;
        }
        
        if (workIndicator) {
            const connected = this.integrations.bhekwork?.isConnected;
            workIndicator.className = `security-indicator ${connected ? 'security-high' : 'security-low'}`;
        }
    }

    async processAIRequest(message, context = {}) {
        if (this.integrations.bhekthink) {
            return await this.integrations.bhekthink.processMessage(message, context);
        }
        return "BhekThink integration not available";
    }

    openBrowser(url) {
        if (this.integrations.bhekwork) {
            return this.integrations.bhekwork.search(url || '');
        }
        window.open('https://google.com', '_blank');
        return null;
    }

    getIntegrationStatus() {
        return {
            bhekthink: this.integrations.bhekthink?.getStatus() || { connected: false },
            bhekwork: this.integrations.bhekwork?.getStatus() || { connected: false }
        };
    }

    async testAllIntegrations() {
        this.notify('Testing', 'Running integration tests...', 'info');
        
        const results = {
            bhekthink: null,
            bhekwork: null
        };
        
        if (this.integrations.bhekthink) {
            results.bhekthink = await this.integrations.bhekthink.testConnection();
        }
        
        if (this.integrations.bhekwork) {
            results.bhekwork = await this.integrations.bhekwork.testConnection();
        }
        
        const allPassed = results.bhekthink?.success && results.bhekwork?.success;
        
        this.notify(
            'Integration Test',
            allPassed ? '✅ All integrations working!' : '⚠️ Some integrations failed',
            allPassed ? 'success' : 'warning'
        );
        
        console.log('Integration test results:', results);
        return results;
    }

    // ==================== CONTEXT MENUS ====================
    showContextMenu(e) {
        e.preventDefault();
        const menu = document.getElementById('contextMenu');
        menu.innerHTML = `
            <div class="context-menu-item" onclick="os.refreshDesktop()">↻ Refresh Desktop</div>
            <div class="context-menu-item" onclick="os.changeWallpaper('default')">🖼️ Change Wallpaper</div>
            <div class="context-menu-item" onclick="os.lockScreen()">🔒 Lock Screen</div>
            <hr style="border: none; border-top: 1px solid var(--mica-border); margin: 4px 0;">
            <div class="context-menu-item" onclick="os.launchApp('Terminal', 'terminal')">💻 Open Terminal</div>
            <div class="context-menu-item" onclick="os.launchApp('Settings', 'settings')">⚙️ Open Settings</div>
            <div class="context-menu-item" onclick="os.openBrowser()">🌐 Open Browser</div>
            <div class="context-menu-item" onclick="os.testAllIntegrations()">🔌 Test Integrations</div>
            <div class="context-menu-item" onclick="showIntegrationStatus()">📊 Integration Status</div>
        `;
        this.showMenuAt(menu, e.clientX, e.clientY);
    }

    showDesktopContextMenu(e, icon) {
        e.preventDefault();
        e.stopPropagation();
        
        const menu = document.getElementById('contextMenu');
        menu.innerHTML = `
            <div class="context-menu-item" onclick="os.launchApp('${icon.name}', '${icon.id}')">▶️ Open</div>
            <div class="context-menu-item" onclick="os.security.setAppPassword('${icon.id}')">🔐 Set Password</div>
            <hr style="border: none; border-top: 1px solid var(--mica-border); margin: 4px 0;">
            <div class="context-menu-item" onclick="os.deleteIcon('${icon.id}')">🗑️ Delete</div>
            <div class="context-menu-item" onclick="os.renameIcon('${icon.id}')">✏️ Rename</div>
        `;
        this.showMenuAt(menu, e.clientX, e.clientY);
    }

    showMenuAt(menu, x, y) {
        menu.style.left = x + 'px';
        menu.style.top = y + 'px';
        menu.style.display = 'flex';
        
        setTimeout(() => {
            const closeMenu = (ev) => {
                if (!menu.contains(ev.target)) {
                    menu.style.display = 'none';
                    document.removeEventListener('click', closeMenu);
                }
            };
            document.addEventListener('click', closeMenu);
        }, 10);
    }

    refreshDesktop() {
        this.initDesktopIcons();
        this.initStartMenu();
        this.notify('Desktop', 'Desktop refreshed');
    }

    // ==================== SYSTEM METHODS ====================
    lockScreen() {
        const lockScreen = document.getElementById('lock-screen');
        lockScreen.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 48px; margin-bottom: 20px;">🔐</div>
                <h1 style="font-size: 32px; margin-bottom: 10px;">BhekOS Locked</h1>
                <p style="opacity: 0.8; margin-bottom: 30px;">${new Date().toLocaleTimeString()}</p>
                <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; max-width: 300px;">
                    <input type="password" id="lock-password" placeholder="Enter password" 
                           style="width: 100%; padding: 12px; margin-bottom: 15px; border-radius: 6px; border: none;">
                    <button onclick="os.unlockScreen()" 
                            style="width: 100%; padding: 12px; background: var(--accent); border: none; border-radius: 6px; color: white; cursor: pointer;">
                        Unlock
                    </button>
                </div>
                <div style="margin-top: 20px; font-size: 12px; opacity: 0.6;">
                    Press Enter to unlock
                </div>
            </div>
        `;
        lockScreen.style.display = 'flex';
        
        const input = document.getElementById('lock-password');
        input.focus();
        input.onkeydown = (e) => {
            if (e.key === 'Enter') this.unlockScreen();
        };
    }

    unlockScreen() {
        const input = document.getElementById('lock-password');
        if (this.security.verifyPassword(input.value, 'master')) {
            document.getElementById('lock-screen').style.display = 'none';
            this.notify('Security', 'System unlocked');
        } else {
            input.value = '';
            input.placeholder = 'Wrong password';
            input.style.border = '2px solid #ff5252';
        }
    }

    shutdown() {
        const screen = document.getElementById('shutdown-screen');
        screen.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 64px; margin-bottom: 30px;">🖥️</div>
                <h1 style="font-size: 36px; margin-bottom: 10px;">Shut Down BhekOS?</h1>
                <p style="opacity: 0.8; margin-bottom: 40px;">Any unsaved work will be lost</p>
                <div class="shutdown-options">
                    <button onclick="os.performShutdown()" style="background: #ff5252;">Shut Down</button>
                    <button onclick="os.restart()" style="background: #2196F3;">Restart</button>
                    <button onclick="document.getElementById('shutdown-screen').style.display = 'none'" 
                            style="background: rgba(255,255,255,0.1);">Cancel</button>
                </div>
                <div style="margin-top: 30px; font-size: 12px; opacity: 0.6;">
                    BhekOS ${this.version} | Build ${this.build}
                </div>
            </div>
        `;
        screen.style.display = 'flex';
    }

    performShutdown() {
        document.body.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: black; color: white; font-family: monospace;">
                <div style="text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 20px;">🖥️</div>
                    <div>Shutting down BhekOS...</div>
                    <div style="margin-top: 20px; font-size: 12px; opacity: 0.6;">Safe to close this window</div>
                </div>
            </div>
        `;
    }

    restart() {
        document.body.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: black; color: white; font-family: monospace;">
                <div style="text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 20px;">↻</div>
                    <div>Restarting BhekOS...</div>
                    <div style="margin-top: 10px; font-size: 12px; opacity: 0.6;">Please wait</div>
                    <div id="restart-progress" style="width: 200px; height: 4px; background: rgba(255,255,255,0.2); margin: 20px auto; border-radius: 2px;">
                        <div id="progress-bar" style="width: 0%; height: 100%; background: var(--accent); border-radius: 2px; transition: width 0.3s;"></div>
                    </div>
                </div>
            </div>
        `;
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += 20;
            const bar = document.getElementById('progress-bar');
            if (bar) bar.style.width = progress + '%';
            
            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => location.reload(), 500);
            }
        }, 200);
    }

    // ==================== UTILITY METHODS ====================
    notify(title, message, type = 'info') {
        console.log(`[${type}] ${title}: ${message}`);
        
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <div style="font-weight: 500;">${title}</div>
            <div style="font-size: 12px; margin-top: 4px;">${message}</div>
        `;
        
        document.getElementById('desktop').appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fadeout');
            setTimeout(() => notification.remove(), 1000);
        }, 3000);
    }

    startClock() {
        setInterval(() => {
            const clock = document.getElementById('clock');
            if (clock) {
                clock.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
        }, 1000);
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.getElementById('contextMenu').style.display = 'none';
                document.getElementById('startMenu').style.display = 'none';
                document.getElementById('install-instructions').style.display = 'none';
                document.getElementById('integration-status').style.display = 'none';
            }
        });

        document.getElementById('desktop').addEventListener('click', (e) => {
            if (!e.target.closest('.window') && !e.target.closest('.taskbar') && 
                !e.target.closest('#startMenu') && !e.target.closest('#contextMenu') &&
                !e.target.closest('#integration-status')) {
                
                document.getElementById('contextMenu').style.display = 'none';
                document.getElementById('startMenu').style.display = 'none';
                document.getElementById('integration-status').style.display = 'none';
                
                if (this.selectedDesktopIcon) {
                    const selected = document.getElementById(`desktop-${this.selectedDesktopIcon}`);
                    if (selected) selected.classList.remove('selected');
                    this.selectedDesktopIcon = null;
                }
            }
        });
    }

    // ==================== PWA METHODS ====================
    setupPWA() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallPrompt();
        });

        this.registerServiceWorker();
    }

    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js').catch(err => {
                console.log('Service Worker registration failed:', err);
            });
        }
    }

    showInstallPrompt() {
        if (!this.deferredPrompt) return;
        
        const prompt = document.getElementById('install-prompt');
        prompt.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                <div style="font-size: 24px;">🖥️</div>
                <div>
                    <div style="font-weight: 500;">Install BhekOS</div>
                    <div style="font-size: 12px; opacity: 0.8;">Install as an app for easy access</div>
                </div>
            </div>
            <div style="display: flex; gap: 8px;">
                <button onclick="os.installPWA()" style="flex: 1;">Install App</button>
                <button onclick="this.parentElement.parentElement.style.display='none'" class="secondary">Later</button>
            </div>
        `;
        prompt.style.display = 'block';
        
        setTimeout(() => {
            prompt.style.display = 'none';
        }, 10000);
    }

    installPWA() {
        if (!this.deferredPrompt) {
            this.showInstallInstructions();
            return;
        }
        
        this.deferredPrompt.prompt();
        this.deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                this.notify('Installation', 'BhekOS is being installed...');
            }
            this.deferredPrompt = null;
            document.getElementById('install-prompt').style.display = 'none';
        });
    }

    showInstallInstructions() {
        const instructions = document.getElementById('install-instructions');
        instructions.innerHTML = `
            <h3 style="margin-bottom: 16px;">📱 Install BhekOS</h3>
            <div style="text-align: left; margin-bottom: 20px;">
                <div style="margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                    <span style="background: var(--accent); width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px;">1</span>
                    <strong>Chrome/Edge:</strong> Click ⋮ menu → "Install BhekOS"
                </div>
                <div style="margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                    <span style="background: var(--accent); width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px;">2</span>
                    <strong>Safari:</strong> Tap Share → "Add to Home Screen"
                </div>
                <div style="margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                    <span style="background: var(--accent); width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px;">3</span>
                    <strong>Firefox:</strong> Click ⚙ menu → "Install"
                </div>
                <div style="margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                    <span style="background: var(--accent); width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px;">4</span>
                    <strong>Android Chrome:</strong> Tap ⋮ → "Add to Home screen"
                </div>
            </div>
            <button onclick="this.parentElement.style.display='none'" style="width: 100%;">Close</button>
        `;
        instructions.style.display = 'block';
    }
}
