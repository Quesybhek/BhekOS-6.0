const CACHE_NAME = 'bhekos-v3';
const ASSETS = [
    '/',
    '/index.html',
    '/offline.html',
    '/manifest.json',
    
    // CSS
    '/css/main.css',
    '/css/animations.css',
    '/css/components/windows.css',
    '/css/components/taskbar.css',
    '/css/components/startmenu.css',
    '/css/components/desktop-switcher.css',
    '/css/components/shortcuts.css',
    '/css/components/collaboration.css',
    '/css/themes/dark.css',
    '/css/themes/light.css',
    
    // Utils
    '/js/utils/helpers.js',
    '/js/utils/storage.js',
    '/js/utils/event-bus.js',
    '/js/utils/logger.js',
    '/js/utils/crypto.js',
    '/js/utils/network.js',
    '/js/utils/worker.js',
    
    // Core Phase 1
    '/js/core/file-system.js',
    '/js/core/settings-manager.js',
    '/js/core/theme-manager.js',
    '/js/core/security.js',
    '/js/core/app-store.js',
    '/js/core/window-manager.js',
    
    // Core Phase 2
    '/js/core/display-manager.js',
    '/js/core/system-monitor.js',
    '/js/core/file-search.js',
    '/js/core/shortcuts.js',
    
    // Core Phase 3
    '/js/core/user-manager.js',
    '/js/core/cloud-sync.js',
    '/js/core/collaboration.js',
    '/js/core/chat-system.js',
    '/js/core/backup-manager.js',
    
    // Components Phase 1
    '/js/components/taskbar.js',
    '/js/components/start-menu.js',
    '/js/components/desktop-icons.js',
    '/js/components/notification.js',
    '/js/components/lock-screen.js',
    '/js/components/login-screen.js',
    '/js/components/password-prompt.js',
    
    // Components Phase 2
    '/js/components/search-overlay.js',
    
    // Components Phase 3
    '/js/components/user-switcher.js',
    '/js/components/activity-feed.js',
    '/js/components/file-share-dialog.js',
    
    // Apps Phase 1
    '/js/apps/file-explorer/index.js',
    '/js/apps/settings/index.js',
    '/js/apps/app-store/index.js',
    
    // Apps Phase 2
    '/js/apps/task-manager/index.js',
    
    // Apps Phase 3
    '/js/apps/users/index.js',
    '/js/apps/chat/index.js',
    '/js/apps/backup/index.js',
    '/js/apps/remote-desktop/index.js',
    
    // Boot
    '/js/core/boot.js'
    
    // Icons removed - using data URIs instead
];
