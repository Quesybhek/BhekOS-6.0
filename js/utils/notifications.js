// Enhanced Notification System
const BhekNotifications = {
    container: null,
    defaults: {
        timeout: 3000,
        position: 'top-right',
        maxNotifications: 5
    },
    activeNotifications: [],

    init() {
        // Create notification container
        this.container = document.createElement('div');
        this.container.id = 'bhek-notification-container';
        this.container.style.cssText = `
            position: fixed;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
        `;
        
        this.setPosition(this.defaults.position);
        document.body.appendChild(this.container);
        
        // Add styles
        this.addStyles();
    },

    setPosition(position) {
        const positions = {
            'top-right': { top: '20px', right: '20px' },
            'top-left': { top: '20px', left: '20px' },
            'bottom-right': { bottom: '80px', right: '20px' },
            'bottom-left': { bottom: '80px', left: '20px' },
            'top-center': { top: '20px', left: '50%', transform: 'translateX(-50%)' }
        };
        
        const pos = positions[position] || positions['top-right'];
        Object.assign(this.container.style, pos);
    },

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes notificationSlideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes notificationSlideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
            
            @keyframes notificationPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            
            .bhek-notification {
                background: var(--mica, rgba(20,20,20,0.95));
                backdrop-filter: blur(10px);
                border: 1px solid var(--mica-border, rgba(255,255,255,0.15));
                border-radius: 8px;
                padding: 16px;
                min-width: 280px;
                max-width: 350px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                color: white;
                font-family: var(--font, system-ui);
                animation: notificationSlideIn 0.3s ease;
                pointer-events: auto;
                position: relative;
                overflow: hidden;
            }
            
            .bhek-notification::before {
                content: '';
                position: absolute;
                left: 0;
                top: 0;
                height: 100%;
                width: 4px;
                background: var(--accent, #0078d4);
            }
            
            .bhek-notification.success::before { background: #4CAF50; }
            .bhek-notification.error::before { background: #F44336; }
            .bhek-notification.warning::before { background: #FF9800; }
            .bhek-notification.info::before { background: #2196F3; }
            
            .bhek-notification.fadeout {
                animation: notificationSlideOut 0.3s ease forwards;
            }
            
            .bhek-notification.pulse {
                animation: notificationPulse 1s ease infinite;
            }
            
            .bhek-notification-header {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 8px;
                font-weight: 500;
            }
            
            .bhek-notification-icon {
                font-size: 20px;
            }
            
            .bhek-notification-title {
                flex: 1;
            }
            
            .bhek-notification-close {
                cursor: pointer;
                opacity: 0.7;
                transition: opacity 0.2s;
                font-size: 18px;
            }
            
            .bhek-notification-close:hover {
                opacity: 1;
            }
            
            .bhek-notification-message {
                font-size: 13px;
                opacity: 0.9;
                line-height: 1.5;
            }
            
            .bhek-notification-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: var(--accent, #0078d4);
                animation: progress linear forwards;
            }
            
            @keyframes progress {
                from { width: 100%; }
                to { width: 0%; }
            }
        `;
        document.head.appendChild(style);
    },

    show(options) {
        // Handle different argument types
        if (typeof options === 'string') {
            options = { message: options };
        } else if (arguments.length >= 2) {
            options = {
                title: arguments[0],
                message: arguments[1],
                type: arguments[2] || 'info'
            };
        }
        
        const {
            title = 'Notification',
            message = '',
            type = 'info',
            icon = this.getIconForType(type),
            timeout = this.defaults.timeout,
            persistent = false,
            actions = [],
            progress = false,
            sound = false
        } = options;
        
        // Limit notifications
        if (this.activeNotifications.length >= this.defaults.maxNotifications) {
            const oldest = this.activeNotifications.shift();
            oldest.remove();
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `bhek-notification ${type}`;
        
        // Build HTML
        let actionsHtml = '';
        if (actions.length > 0) {
            actionsHtml = `
                <div style="display: flex; gap: 8px; margin-top: 12px;">
                    ${actions.map(action => `
                        <button onclick="${action.handler}" 
                                style="flex: 1; padding: 6px; font-size: 12px;"
                                class="${action.primary ? '' : 'secondary'}">
                            ${action.label}
                        </button>
                    `).join('')}
                </div>
            `;
        }
        
        notification.innerHTML = `
            <div class="bhek-notification-header">
                <span class="bhek-notification-icon">${icon}</span>
                <span class="bhek-notification-title">${title}</span>
                <span class="bhek-notification-close" onclick="this.closest('.bhek-notification').remove()">✕</span>
            </div>
            <div class="bhek-notification-message">${message}</div>
            ${actionsHtml}
            ${progress ? '<div class="bhek-notification-progress"></div>' : ''}
        `;
        
        // Add to container
        this.container.appendChild(notification);
        this.activeNotifications.push(notification);
        
        // Auto-remove after timeout
        if (!persistent && timeout > 0) {
            setTimeout(() => {
                notification.classList.add('fadeout');
                setTimeout(() => {
                    notification.remove();
                    this.activeNotifications = this.activeNotifications.filter(n => n !== notification);
                }, 300);
            }, timeout);
        }
        
        // Play sound if enabled
        if (sound) {
            this.playSound(type);
        }
        
        return notification;
    },

    getIconForType(type) {
        const icons = {
            'success': '✅',
            'error': '❌',
            'warning': '⚠️',
            'info': 'ℹ️',
            'game': '🎮',
            'security': '🔒',
            'download': '📥',
            'upload': '📤',
            'update': '🔄'
        };
        return icons[type] || '📋';
    },

    // Convenience methods
    success(title, message, timeout = 3000) {
        return this.show({ title, message, type: 'success', timeout });
    },

    error(title, message, timeout = 5000) {
        return this.show({ title, message, type: 'error', timeout });
    },

    warning(title, message, timeout = 4000) {
        return this.show({ title, message, type: 'warning', timeout });
    },

    info(title, message, timeout = 3000) {
        return this.show({ title, message, type: 'info', timeout });
    },

    game(title, message, timeout = 3000) {
        return this.show({ title, message, type: 'game', timeout });
    },

    security(title, message, timeout = 5000) {
        return this.show({ title, message, type: 'security', timeout });
    },

    // Progress notification
    progress(title, duration = 5000) {
        const notification = this.show({
            title,
            message: 'Processing...',
            type: 'info',
            progress: true,
            persistent: true
        });
        
        // Update progress bar
        const progressBar = notification.querySelector('.bhek-notification-progress');
        if (progressBar) {
            progressBar.style.animationDuration = duration + 'ms';
            
            setTimeout(() => {
                notification.classList.add('fadeout');
                setTimeout(() => notification.remove(), 300);
            }, duration);
        }
        
        return notification;
    },

    // Confirmation dialog
    confirm(options) {
        const {
            title = 'Confirm',
            message = 'Are you sure?',
            onConfirm,
            onCancel,
            confirmText = 'Yes',
            cancelText = 'No'
        } = options;
        
        return this.show({
            title,
            message,
            type: 'warning',
            persistent: true,
            actions: [
                {
                    label: cancelText,
                    handler: `this.closest('.bhek-notification').remove(); ${onCancel || ''}`
                },
                {
                    label: confirmText,
                    primary: true,
                    handler: `this.closest('.bhek-notification').remove(); ${onConfirm || ''}`
                }
            ]
        });
    },

    // Toast notification (auto-hides quickly)
    toast(message, type = 'info') {
        return this.show({
            title: '',
            message,
            type,
            timeout: 2000,
            persistent: false
        });
    },

    // Play sound for notifications
    playSound(type) {
        // Simple beep using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Different sounds for different types
        const frequencies = {
            'success': 800,
            'error': 300,
            'warning': 500,
            'info': 600,
            'game': 700,
            'security': 400
        };
        
        oscillator.frequency.value = frequencies[type] || 600;
        gainNode.gain.value = 0.1;
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
    },

    // Clear all notifications
    clearAll() {
        this.activeNotifications.forEach(notification => {
            notification.remove();
        });
        this.activeNotifications = [];
    },

    // Update defaults
    setDefaults(options) {
        Object.assign(this.defaults, options);
        if (options.position) {
            this.setPosition(options.position);
        }
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    BhekNotifications.init();
});
