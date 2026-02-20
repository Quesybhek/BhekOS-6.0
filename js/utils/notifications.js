// Notification System
const BhekNotifications = {
    container: null,
    timeout: 3000,

    init() {
        this.container = document.createElement('div');
        this.container.id = 'notification-container';
        this.container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
        `;
        document.body.appendChild(this.container);
    },

    show(title, message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div style="font-weight: 500; margin-bottom: 4px;">${title}</div>
            <div style="font-size: 13px; opacity: 0.9;">${message}</div>
        `;
        
        this.container.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fadeout');
            setTimeout(() => notification.remove(), 1000);
        }, this.timeout);
    },

    success(title, message) {
        this.show(title, message, 'success');
    },

    error(title, message) {
        this.show(title, message, 'error');
    },

    warning(title, message) {
        this.show(title, message, 'warning');
    }
};
