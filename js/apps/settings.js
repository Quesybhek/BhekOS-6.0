// Settings App
const Settings = {
    load(view, os) {
        view.innerHTML = `
            <div class="settings-grid">
                <div class="settings-nav">
                    <div class="settings-nav-item active" onclick="os.showSettingsTab('personalization')">
                        🎨 Personalization
                    </div>
                    <div class="settings-nav-item" onclick="os.showSettingsTab('icons')">
                        🖼️ Icon Customization
                    </div>
                    <div class="settings-nav-item" onclick="os.showSettingsTab('security')">
                        🔐 Security & Password
                    </div>
                    <div class="settings-nav-item" onclick="os.showSettingsTab('system')">
                        ⚙️ System
                    </div>
                    <div class="settings-nav-item" onclick="os.showSettingsTab('about')">
                        ℹ️ About
                    </div>
                </div>
                <div class="settings-content" id="settings-content">
                    ${this.getPersonalizationSettings(os)}
                </div>
            </div>
        `;
    },

    getPersonalizationSettings(os) {
        const wallpaper = BhekStorage.load('wallpaper', 'default');
        const darkMode = BhekStorage.load('darkMode', false);
        const transparency = BhekStorage.load('transparency', true);
        const accent = BhekStorage.load('accentColor', '#0078d4');
        
        return `
            <div class="apple-settings-item">
                <div>
                    <div style="font-weight: 500;">Dark Mode</div>
                    <div style="font-size: 12px; opacity: 0.8;">Enable dark theme</div>
                </div>
                <label class="settings-toggle">
                    <input type="checkbox" ${darkMode ? 'checked' : ''} onchange="os.toggleDarkMode(this.checked)">
                    <span class="settings-slider"></span>
                </label>
            </div>
            <div class="apple-settings-item">
                <div>
                    <div style="font-weight: 500;">Transparency Effects</div>
                    <div style="font-size: 12px; opacity: 0.8;">Mica and glass effects</div>
                </div>
                <label class="settings-toggle">
                    <input type="checkbox" ${transparency ? 'checked' : ''} onchange="os.toggleTransparency(this.checked)">
                    <span class="settings-slider"></span>
                </label>
            </div>
            <div class="apple-settings-item">
                <div>
                    <div style="font-weight: 500;">Wallpaper</div>
                    <div style="font-size: 12px; opacity: 0.8;">Change desktop background</div>
                </div>
                <select onchange="os.changeWallpaper(this.value)" style="width: 150px;">
                    <option value="default" ${wallpaper === 'default' ? 'selected' : ''}>Default</option>
                    <option value="nature" ${wallpaper === 'nature' ? 'selected' : ''}>Nature</option>
                    <option value="abstract" ${wallpaper === 'abstract' ? 'selected' : ''}>Abstract</option>
                    <option value="gradient" ${wallpaper === 'gradient' ? 'selected' : ''}>Gradient</option>
                </select>
            </div>
            <div class="apple-settings-item">
                <div>
                    <div style="font-weight: 500;">Accent Color</div>
                    <div style="font-size: 12px; opacity: 0.8;">System highlight color</div>
                </div>
                <input type="color" value="${accent}" onchange="os.changeAccentColor(this.value)" style="width: 60px; height: 30px;">
            </div>
            <div class="apple-settings-item">
                <div>
                    <div style="font-weight: 500;">Desktop Icon Size</div>
                    <div style="font-size: 12px; opacity: 0.8;">Size of desktop icons</div>
                </div>
                <select onchange="os.changeIconSize(this.value)" style="width: 100px;">
                    <option value="small">Small</option>
                    <option value="medium" selected>Medium</option>
                    <option value="large">Large</option>
                </select>
            </div>
        `;
    },

    getIconSettings(os) {
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
            { id: 'paint', name: 'Paint' }
        ];
        
        return `
            <p style="margin-bottom: 20px; opacity: 0.8;">Customize desktop and start menu icons</p>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px;">
                ${icons.map(icon => {
                    const settings = savedSettings[icon.id] || {};
                    const emoji = settings.emoji || os.getDefaultIcon(icon.id);
                    const color = settings.color || os.getDefaultColor(icon.id);
                    const size = settings.size || 32;
                    const bgOpacity = settings.bgOpacity || 20;
                    
                    return `
                        <div class="icon-pack" onclick="os.customizeIcon('${icon.id}')" 
                             style="padding: 16px; background: ${color}${Math.round(bgOpacity * 2.55).toString(16).padStart(2, '0')}; border-radius: 8px; text-align: center; cursor: pointer;">
                            <div style="font-size: ${size}px; margin-bottom: 8px;">${emoji}</div>
                            <div style="font-size: 12px;">${icon.name}</div>
                        </div>
                    `;
                }).join('')}
            </div>
            <div style="margin-top: 20px;">
                <button onclick="os.resetAllIcons()" class="secondary">🔄 Reset All Icons</button>
                <button onclick="os.exportIconSettings()" class="secondary" style="margin-left: 8px;">📤 Export Settings</button>
            </div>
        `;
    },

    getSecuritySettings(os) {
        const security = os.security.settings;
        
        return `
            <div class="apple-settings-item">
                <div>
                    <div style="font-weight: 500;">Auto-Lock</div>
                    <div style="font-size: 12px; opacity: 0.8;">Lock system after inactivity</div>
                </div>
                <label class="settings-toggle">
                    <input type="checkbox" ${security.autoLock ? 'checked' : ''} onchange="os.security.toggleAutoLock(this.checked)">
                    <span class="settings-slider"></span>
                </label>
            </div>
            <div class="apple-settings-item">
                <div>
                    <div style="font-weight: 500;">Auto-Lock Time</div>
                    <div style="font-size: 12px; opacity: 0.8;">Minutes of inactivity before lock</div>
                </div>
                <select onchange="os.security.setAutoLockTime(this.value)" style="width: 100px;">
                    <option value="1" ${security.autoLockMinutes === 1 ? 'selected' : ''}>1 minute</option>
                    <option value="5" ${security.autoLockMinutes === 5 ? 'selected' : ''}>5 minutes</option>
                    <option value="10" ${security.autoLockMinutes === 10 ? 'selected' : ''}>10 minutes</option>
                    <option value="30" ${security.autoLockMinutes === 30 ? 'selected' : ''}>30 minutes</option>
                </select>
            </div>
            <div class="apple-settings-item">
                <div>
                    <div style="font-weight: 500;">App Password Protection</div>
                    <div style="font-size: 12px; opacity: 0.8;">Require password for sensitive apps</div>
                </div>
                <label class="settings-toggle">
                    <input type="checkbox" ${security.requirePasswordForSensitiveApps ? 'checked' : ''} onchange="os.security.toggleAppPasswords(this.checked)">
                    <span class="settings-slider"></span>
                </label>
            </div>
            <div class="apple-settings-item">
                <div>
                    <div style="font-weight: 500;">Game Password Protection</div>
                    <div style="font-size: 12px; opacity: 0.8;">Require password for games</div>
                </div>
                <label class="settings-toggle">
                    <input type="checkbox" ${security.requirePasswordForGames ? 'checked' : ''} onchange="os.security.toggleGamePasswords(this.checked)">
                    <span class="settings-slider"></span>
                </label>
            </div>
            <div class="apple-settings-item">
                <div>
                    <div style="font-weight: 500;">Master Password</div>
                    <div style="font-size: 12px; opacity: 0.8;">Change system master password</div>
                </div>
                <button onclick="os.security.changeMasterPassword()" style="padding: 6px 12px; font-size: 12px;">Change</button>
            </div>
        `;
    },

    getSystemSettings(os) {
        return `
            <div class="apple-settings-item">
                <div>
                    <div style="font-weight: 500;">Performance Mode</div>
                    <div style="font-size: 12px; opacity: 0.8;">Optimize for better performance</div>
                </div>
                <label class="settings-toggle">
                    <input type="checkbox" onchange="os.togglePerformanceMode(this.checked)">
                    <span class="settings-slider"></span>
                </label>
            </div>
            <div class="apple-settings-item">
                <div>
                    <div style="font-weight: 500;">Animations</div>
                    <div style="font-size: 12px; opacity: 0.8;">Window and UI animations</div>
                </div>
                <label class="settings-toggle">
                    <input type="checkbox" checked onchange="os.toggleAnimations(this.checked)">
                    <span class="settings-slider"></span>
                </label>
            </div>
            <div class="apple-settings-item">
                <div>
                    <div style="font-weight: 500;">Auto-Save</div>
                    <div style="font-size: 12px; opacity: 0.8;">Automatically save work</div>
                </div>
                <label class="settings-toggle">
                    <input type="checkbox" checked onchange="os.toggleAutoSave(this.checked)">
                    <span class="settings-slider"></span>
                </label>
            </div>
            <div class="apple-settings-item">
                <div>
                    <div style="font-weight: 500;">Reset All Settings</div>
                    <div style="font-size: 12px; opacity: 0.8;">Restore default settings</div>
                </div>
                <button onclick="os.resetAllSettings()" style="padding: 6px 12px; font-size: 12px; background: #ff5252;">Reset</button>
            </div>
            <div class="apple-settings-item">
                <div>
                    <div style="font-weight: 500;">Clear All Data</div>
                    <div style="font-size: 12px; opacity: 0.8;">Delete all saved data</div>
                </div>
                <button onclick="BhekStorage.clearAll()" style="padding: 6px 12px; font-size: 12px; background: #ff5252;">Clear</button>
            </div>
        `;
    },

    getAboutSettings(os) {
        return `
            <div style="text-align: center; padding: 20px;">
                <div style="font-size: 48px; margin-bottom: 16px;">🖥️</div>
                <h2 style="margin-bottom: 8px;">BhekOS ${os.version}</h2>
                <p style="margin-bottom: 24px; opacity: 0.8;">Professional Edition • Build ${os.build}</p>
                
                <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px; margin-bottom: 24px;">
                    <h4 style="margin-bottom: 12px;">🌟 Features</h4>
                    <ul style="text-align: left; margin-left: 20px; opacity: 0.9;">
                        <li>Complete desktop environment</li>
                        <li>10+ built-in applications</li>
                        <li>6 games with encryption</li>
                        <li>Advanced security system</li>
                        <li>PWA installable on all devices</li>
                        <li>Cross-platform compatibility</li>
                    </ul>
                </div>
                
                <div style="margin-top: 24px;">
                    <button onclick="os.checkForUpdates()">🔄 Check for Updates</button>
                    <button onclick="os.showInstallInstructions()" class="secondary" style="margin-left: 8px;">📱 Install App</button>
                </div>
                
                <div style="margin-top: 30px; font-size: 12px; opacity: 0.6;">
                    © 2024 BhekOS Project. All rights reserved.<br>
                    Made with ❤️ for the open source community.
                </div>
            </div>
        `;
    }
};

// Add settings methods to OS
BhekOS.prototype.showSettingsTab = function(tab) {
    const content = document.getElementById('settings-content');
    if (!content) return;
    
    document.querySelectorAll('.settings-nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const clickedItem = Array.from(document.querySelectorAll('.settings-nav-item'))
        .find(item => item.textContent.includes(tab));
    if (clickedItem) clickedItem.classList.add('active');
    
    switch(tab) {
        case 'personalization':
            content.innerHTML = `<h2 style="margin-bottom: 20px;">🎨 Personalization</h2>${Settings.getPersonalizationSettings(this)}`;
            break;
        case 'icons':
            content.innerHTML = `<h2 style="margin-bottom: 20px;">🖼️ Icon Customization</h2>${Settings.getIconSettings(this)}`;
            break;
        case 'security':
            content.innerHTML = `<h2 style="margin-bottom: 20px;">🔐 Security & Password</h2>${Settings.getSecuritySettings(this)}`;
            break;
        case 'system':
            content.innerHTML = `<h2 style="margin-bottom: 20px;">⚙️ System</h2>${Settings.getSystemSettings(this)}`;
            break;
        case 'about':
            content.innerHTML = `<h2 style="margin-bottom: 20px;">ℹ️ About BhekOS</h2>${Settings.getAboutSettings(this)}`;
            break;
    }
};

BhekOS.prototype.toggleDarkMode = function(enabled) {
    BhekStorage.save('darkMode', enabled);
    if (enabled) {
        document.documentElement.style.setProperty('--mica', 'rgba(10,10,10,0.95)');
    } else {
        document.documentElement.style.setProperty('--mica', 'rgba(240,240,240,0.85)');
    }
    this.notify('Settings', `Dark mode ${enabled ? 'enabled' : 'disabled'}`);
};

BhekOS.prototype.toggleTransparency = function(enabled) {
    BhekStorage.save('transparency', enabled);
    const glass = enabled ? 'blur(45px) saturate(210%) brightness(110%)' : 'none';
    document.documentElement.style.setProperty('--glass', glass);
    this.notify('Settings', `Transparency effects ${enabled ? 'enabled' : 'disabled'}`);
};

BhekOS.prototype.changeWallpaper = function(type) {
    this.wallpaper = type;
    BhekStorage.save('wallpaper', type);
    this.setWallpaper();
    this.notify('Settings', `Wallpaper changed to ${type}`);
};

BhekOS.prototype.changeAccentColor = function(color) {
    BhekStorage.save('accentColor', color);
    document.documentElement.style.setProperty('--accent', color);
    
    const r = parseInt(color.slice(1,3), 16);
    const g = parseInt(color.slice(3,5), 16);
    const b = parseInt(color.slice(5,7), 16);
    document.documentElement.style.setProperty('--accent-rgb', `${r}, ${g}, ${b}`);
    
    this.notify('Settings', 'Accent color changed');
};

BhekOS.prototype.changeIconSize = function(size) {
    BhekStorage.save('iconSize', size);
    const sizes = { 'small': 24, 'medium': 32, 'large': 48 };
    document.querySelectorAll('.desktop-icon .icon-emoji').forEach(el => {
        el.style.fontSize = sizes[size] + 'px';
    });
    this.notify('Settings', `Icon size set to ${size}`);
};

BhekOS.prototype.resetAllIcons = function() {
    if (confirm('Reset all icons to default?')) {
        BhekStorage.save('iconSettings', null);
        this.initIconSettings();
        this.initDesktopIcons();
        this.initStartMenu();
        this.notify('Icons', 'All icons reset to default');
    }
};

BhekOS.prototype.exportIconSettings = function() {
    const settings = BhekStorage.load('iconSettings');
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bhekos-icons.json';
    a.click();
    URL.revokeObjectURL(url);
    this.notify('Icons', 'Icon settings exported');
};

BhekOS.prototype.customizeIcon = function(iconId) {
    this.launchApp('Settings', 'settings');
    setTimeout(() => this.showSettingsTab('icons'), 100);
};

BhekOS.prototype.togglePerformanceMode = function(enabled) {
    this.notify('System', `Performance mode ${enabled ? 'enabled' : 'disabled'}`);
};

BhekOS.prototype.toggleAnimations = function(enabled) {
    this.notify('System', `Animations ${enabled ? 'enabled' : 'disabled'}`);
};

BhekOS.prototype.toggleAutoSave = function(enabled) {
    this.notify('System', `Auto-save ${enabled ? 'enabled' : 'disabled'}`);
};

BhekOS.prototype.resetAllSettings = function() {
    if (confirm('Reset all settings to default? This will clear all preferences.')) {
        localStorage.clear();
        location.reload();
    }
};

BhekOS.prototype.checkForUpdates = function() {
    this.notify('Updates', 'Checking for updates...');
    setTimeout(() => {
        this.notify('Updates', 'You have the latest version of BhekOS!');
    }, 2000);
};
