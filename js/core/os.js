// Main OS Class with Integrations
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
        this.setWallpaper();
        this.initIconSettings();
        this.initStartMenu();
        this.initDesktopIcons();
        this.setupEventListeners();
        this.setupPWA();
        this.startClock();
        
        // Initialize integrations
        this.initIntegrations();
        
        // Start security monitoring
        this.security.startInactivityMonitoring();
        
        // Show welcome
        setTimeout(() => this.notify('BhekOS 6.0', 'System initialized and ready'), 1000);
        setTimeout(() => this.notify('Integrations', 'BhekThink and BhekWork available'), 2000);
    }

    // Initialize integrations
    initIntegrations() {
        // Initialize BhekThink with live URL
        try {
            if (typeof BhekThinkBridge !== 'undefined') {
                BhekThinkBridge.config.appUrl = 'https://quesybhek.github.io/BhekThink-AI-Pro/';
                this.integrations.bhekthink = BhekThinkBridge.init(this);
                console.log('✅ BhekThink AI integration initialized');
            } else {
                console.warn('BhekThinkBridge not found');
            }
        } catch (error) {
            console.error('Failed to initialize BhekThink:', error);
        }

        // Initialize BhekWork with live URL
        try {
            if (typeof BhekWorkBridge !== 'undefined') {
                BhekWorkBridge.config.appUrl = 'https://quesybhek.github.io/BhekWork/';
                this.integrations.bhekwork = BhekWorkBridge.init(this);
                console.log('✅ BhekWork Browser integration initialized');
            } else {
                console.warn('BhekWorkBridge not found');
            }
        } catch (error) {
            console.error('Failed to initialize BhekWork:', error);
        }
        
        // Update integration indicators
        this.updateIntegrationIndicators();
    }

    // Update taskbar indicators
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

    // Process AI request through BhekThink
    async processAIRequest(message, context = {}) {
        if (this.integrations.bhekthink) {
            return await this.integrations.bhekthink.processMessage(message, context);
        }
        return "BhekThink integration not available";
    }

    // Open browser through BhekWork
    openBrowser(url) {
        if (this.integrations.bhekwork) {
            return this.integrations.bhekwork.search(url || '');
        }
        window.open('https://google.com', '_blank');
        return null;
    }

    // Get integration status
    getIntegrationStatus() {
        return {
            bhekthink: this.integrations.bhekthink?.getStatus() || { connected: false },
            bhekwork: this.integrations.bhekwork?.getStatus() || { connected: false }
        };
    }

    // Test all integrations
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

    setWallpaper() {
        const wallpapers = {
            'default': 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=2564&q=80',
            'nature': 'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=2564&q=80',
            'abstract': 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?auto=format&fit=crop&w=2564&q=80',
            'gradient': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=2564&q=80'
        };
        
        const url = wallpapers[this.wallpaper] || wallpapers.default;
        document.getElementById('desktop').style.backgroundImage = 
            `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.9)), url('${url}') center/cover fixed`;
    }

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

    initDesktopIcons() {
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
        
        const container = document.getElementById('desktopIcons');
        container.innerHTML = '';
        
        const savedLayout = BhekStorage.load('desktopLayout', {});
        const savedSettings = BhekStorage.load('iconSettings', {});
        
        icons.forEach((ic, index) => {
            const div = this.createDesktopIcon(ic, index, savedLayout, savedSettings);
            container.appendChild(div);
        });
    }

    createDesktopIcon(ic, index, savedLayout, savedSettings) {
        const div = document.createElement('div');
        div.className = 'desktop-icon';
        div.id = `desktop-${ic.id}`;
        
        const savedPos = savedLayout[ic.id];
        const gridX = 20 + (index % 4) * 100;
        const gridY = 20 + Math.floor(index / 4) * 100;
        
        div.style.position = 'absolute';
        div.style.left = (savedPos?.left || gridX) + 'px';
        div.style.top = (savedPos?.top || gridY) + 'px';
        
        const settings = savedSettings[ic.id] || {};
        const emoji = settings.emoji || this.getDefaultIcon(ic.id);
        const color = settings.color || this.getDefaultColor(ic.id);
        const size = settings.size || 32;
        const bgOpacity = settings.bgOpacity || 20;
        
        const opacity = Math.round(bgOpacity * 2.55).toString(16).padStart(2, '0');
        const bgColor = `${color}${opacity}`;
        
        div.innerHTML = `
            <div class="icon-emoji" style="
                font-size: ${size}px;
                width: 64px;
                height: 64px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: ${bgColor};
                border-radius: 12px;
                margin-bottom: 4px;
            ">${emoji}</div>
            <div class="icon-name" style="
                font-size: 12px;
                text-align: center;
                max-width: 80px;
                word-wrap: break-word;
                line-height: 1.2;
            ">${ic.name}</div>
        `;
        
        div.ondblclick = () => {
            if (ic.id === 'browser') {
                this.integrations.bhekwork?.openInNewTab();
            } else if (ic.id === 'ai') {
                this.launchApp(ic.name, ic.id);
            } else if (ic.id === 'integration-settings') {
                this.launchApp('Integrations', 'integration-settings');
            } else if (ic.id === 'app-store') {
                this.launchApp('App Store', 'app-store');
            } else {
                if (this.security.requiresPassword(ic.id)) {
                    this.security.showPasswordPrompt('app', ic.id, () => {
                        this.launchApp(ic.name, ic.id);
                    });
                } else {
                    this.launchApp(ic.name, ic.id);
                }
            }
        };
        
        div.onclick = (e) => {
            e.stopPropagation();
            this.selectDesktopIcon(ic.id);
        };
        
        div.oncontextmenu = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.showDesktopContextMenu(e, ic);
        };
        
        this.setupIconDrag(div, ic, gridX, gridY);
        
        return div;
    }

    setupIconDrag(div, icon, gridX, gridY) {
        let isDragging = false;
        let startX, startY, startLeft, startTop;
        
        div.onmousedown = (e) => {
            if (e.button !== 0) return;
            if (e.detail > 1) return;
            
            this.selectDesktopIcon(icon.id);
            
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startLeft = parseInt(div.style.left) || gridX;
            startTop = parseInt(div.style.top) || gridY;
            
            div.style.zIndex = '1000';
            div.style.opacity = '0.8';
            
            const onMouseMove = (moveEvent) => {
                if (!isDragging) return;
                const dx = moveEvent.clientX - startX;
                const dy = moveEvent.clientY - startY;
                div.style.left = (startLeft + dx) + 'px';
                div.style.top = (startTop + dy) + 'px';
            };
            
            const onMouseUp = () => {
                isDragging = false;
                div.style.zIndex = '';
                div.style.opacity = '';
                
                const left = parseInt(div.style.left);
                const top = parseInt(div.style.top);
                
                div.style.left = Math.round(left / 20) * 20 + 'px';
                div.style.top = Math.round(top / 20) * 20 + 'px';
                
                this.saveDesktopIconPosition(icon.id, div.style.left, div.style.top);
                
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp, { once: true });
        };
    }

    saveDesktopIconPosition(type, left, top) {
        const layout = BhekStorage.load('desktopLayout', {});
        layout[type] = { left: parseInt(left), top: parseInt(top) };
        BhekStorage.save('desktopLayout', layout);
    }

    selectDesktopIcon(type) {
        if (this.selectedDesktopIcon) {
            const prev = document.getElementById(`desktop-${this.selectedDesktopIcon}`);
            if (prev) prev.classList.remove('selected');
        }
        this.selectedDesktopIcon = type;
        const current = document.getElementById(`desktop-${type}`);
        if (current) current.classList.add('selected');
    }

    initStartMenu() {
        const menu = document.getElementById('startMenu');
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
        
        const savedSettings = BhekStorage.load('iconSettings', {});
        const thinkConnected = this.integrations.bhekthink?.isConnected;
        const workConnected = this.integrations.bhekwork?.isConnected;
        
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
                        <div class="emoji" style="font-size: 32px;">${app.icon}</div>
                        <div>${app.name}</div>
                    </div>
                `).join('')}
            </div>
            <div style="margin-top: auto; padding: 20px; background: rgba(0,0,0,0.2); border-top: 1px solid var(--mica-border);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <div>
                        <div style="font-weight: 500;">Administrator</div>
                        <div style="font-size: 12px; opacity: 0.8;">BhekOS User</div>
                    </div>
                    <button class="secondary" onclick="os.shutdown()">⏻ Power</button>
                </div>
                <div style="display: flex; gap: 8px; justify-content: space-around; font-size: 12px;">
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
    }

    launchApp(name, type) {
        if (type === 'browser') {
            this.integrations.bhekwork?.openInNewTab();
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

    addTaskbar(pid, name, type) {
        const bar = document.getElementById('runningApps');
        const btn = document.createElement('div');
        btn.className = 'taskbar-icon';
        btn.id = 'task-' + pid;
        
        const savedSettings = BhekStorage.load('iconSettings', {});
        const settings = savedSettings[type] || {};
        
        let iconContent = settings.emoji || this.getDefaultIcon(type);
        btn.innerHTML = iconContent;
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

    notify(title, message, type = 'info') {
        if (typeof BhekNotifications !== 'undefined') {
            BhekNotifications.show({ title, message, type });
        } else {
            console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
        }
    }

    startClock() {
        setInterval(() => {
            const clock = document.getElementById('clock');
            if (clock) clock.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
        if (!this.deferredPrompt || BhekHelpers?.isMobile?.()) return;
        
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
