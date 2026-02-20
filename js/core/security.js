// Security Module
class BhekSecurity {
    constructor(os) {
        this.os = os;
        this.settings = this.loadSettings();
        this.autoLockTimer = null;
        this.inactivityTimer = null;
    }

    loadSettings() {
        const defaultSettings = {
            autoLock: true,
            autoLockMinutes: 5,
            requirePasswordForSensitiveApps: true,
            requirePasswordForGames: false,
            masterPassword: 'bhekos123',
            gamePassword: 'play123',
            appPasswords: {},
            lockOnStartup: false
        };
        
        return BhekStorage.load('securitySettings', defaultSettings);
    }

    saveSettings() {
        BhekStorage.save('securitySettings', this.settings);
    }

    // Password verification
    verifyPassword(input, type = 'master', appId = null) {
        if (type === 'master') {
            return input === this.settings.masterPassword;
        } else if (type === 'game') {
            return input === this.settings.gamePassword;
        } else if (type === 'app' && appId) {
            return input === (this.settings.appPasswords[appId] || this.settings.masterPassword);
        }
        return false;
    }

    // Check if app requires password
    requiresPassword(appId) {
        return this.settings.requirePasswordForSensitiveApps && 
               ['settings', 'terminal', 'explorer'].includes(appId);
    }

    // Show password prompt
    showPasswordPrompt(type, appId = null, callback) {
        const promptDiv = document.createElement('div');
        promptDiv.className = 'password-prompt';
        
        let title = 'Password Required';
        let placeholder = 'Enter password';
        
        if (type === 'game') {
            title = 'Game Password Required';
        } else if (type === 'app' && appId) {
            title = `Password for ${appId}`;
        }
        
        promptDiv.innerHTML = `
            <h3>🔐 ${title}</h3>
            <p>Please enter your password</p>
            <input type="password" id="security-password-input" placeholder="${placeholder}" 
                   style="width: 100%; margin: 10px 0; padding: 10px;" 
                   onkeydown="if(event.key === 'Enter') this.nextElementSibling.children[1].click()">
            <div style="display: flex; gap: 10px; margin-top: 15px;">
                <button onclick="this.parentElement.parentElement.parentElement.remove()">Cancel</button>
                <button onclick="window.os.security.verifyAndExecute('${type}', '${appId}', this)">Unlock</button>
            </div>
        `;
        
        document.getElementById('desktop').appendChild(promptDiv);
        promptDiv.querySelector('input').focus();
    }

    verifyAndExecute(type, appId, button) {
        const input = document.getElementById('security-password-input');
        const promptDiv = input.closest('.password-prompt');
        
        if (this.verifyPassword(input.value, type, appId)) {
            promptDiv.remove();
            return true;
        } else {
            input.value = '';
            input.placeholder = 'Wrong password, try again';
            input.style.borderColor = '#ff5252';
            this.os.notify('Security', 'Access denied - wrong password');
            return false;
        }
    }

    // Auto-lock functionality
    startInactivityMonitoring() {
        const resetTimer = () => {
            this.resetInactivityTimer();
            this.resetAutoLockTimer();
        };
        
        ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, resetTimer, { passive: true });
        });
    }

    resetInactivityTimer() {
        if (this.inactivityTimer) clearTimeout(this.inactivityTimer);
        if (this.settings.autoLock) {
            this.inactivityTimer = setTimeout(() => {
                this.os.lockScreen();
            }, this.settings.autoLockMinutes * 60 * 1000);
        }
    }

    resetAutoLockTimer() {
        if (this.autoLockTimer) clearTimeout(this.autoLockTimer);
        this.autoLockTimer = setTimeout(() => {
            this.os.lockScreen();
        }, 30 * 60 * 1000);
    }

    // Settings toggles
    toggleAutoLock(enabled) {
        this.settings.autoLock = enabled;
        this.saveSettings();
        this.os.notify('Security', `Auto-lock ${enabled ? 'enabled' : 'disabled'}`);
    }

    setAutoLockTime(minutes) {
        this.settings.autoLockMinutes = parseInt(minutes);
        this.saveSettings();
        this.os.notify('Security', `Auto-lock time set to ${minutes} minutes`);
    }

    toggleAppPasswords(enabled) {
        this.settings.requirePasswordForSensitiveApps = enabled;
        this.saveSettings();
        this.os.notify('Security', `App passwords ${enabled ? 'enabled' : 'disabled'}`);
    }

    toggleGamePasswords(enabled) {
        this.settings.requirePasswordForGames = enabled;
        this.saveSettings();
        this.os.notify('Security', `Game passwords ${enabled ? 'enabled' : 'disabled'}`);
    }

    changeMasterPassword() {
        const newPass = prompt('Enter new master password:');
        if (newPass && newPass.length >= 4) {
            this.settings.masterPassword = newPass;
            this.saveSettings();
            this.os.notify('Security', 'Master password updated');
        } else if (newPass) {
            this.os.notify('Security', 'Password must be at least 4 characters');
        }
    }

    setAppPassword(appId) {
        const newPass = prompt(`Set password for ${appId}:`);
        if (newPass) {
            this.settings.appPasswords[appId] = newPass;
            this.saveSettings();
            this.os.notify('Security', `Password set for ${appId}`);
        }
    }
}
