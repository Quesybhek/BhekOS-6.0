// File Explorer App
const FileExplorer = {
    load(view, os) {
        view.innerHTML = `
            <div class="file-explorer">
                <div class="sidebar">
                    <div class="sidebar-item active" onclick="FileExplorer.navigate('thispc')">📁 This PC</div>
                    <div class="sidebar-item" onclick="FileExplorer.navigate('documents')">📁 Documents</div>
                    <div class="sidebar-item" onclick="FileExplorer.navigate('downloads')">📁 Downloads</div>
                    <div class="sidebar-item" onclick="FileExplorer.navigate('pictures')">📁 Pictures</div>
                    <div class="sidebar-item" onclick="FileExplorer.navigate('music')">📁 Music</div>
                    <div class="sidebar-item" onclick="FileExplorer.navigate('videos')">📁 Videos</div>
                    <div class="sidebar-item" onclick="FileExplorer.navigate('desktop')">📁 Desktop</div>
                    <div class="sidebar-item" onclick="FileExplorer.navigate('network')">🔗 Network</div>
                </div>
                <div class="content">
                    <div style="display: flex; gap: 8px; margin-bottom: 16px;">
                        <button onclick="FileExplorer.navigate('back')">← Back</button>
                        <button onclick="FileExplorer.navigate('forward')">→ Forward</button>
                        <button class="secondary" onclick="FileExplorer.refresh()">↻ Refresh</button>
                        <input type="text" id="file-search" placeholder="Search files..." style="flex: 1;" onkeyup="FileExplorer.search(this.value)">
                    </div>
                    <div id="file-grid" class="file-grid"></div>
                    <div id="file-status" style="margin-top: 16px; font-size: 12px; opacity: 0.7;"></div>
                </div>
            </div>
        `;
        
        this.currentPath = 'thispc';
        this.history = ['thispc'];
        this.historyIndex = 0;
        this.files = this.loadFiles();
        this.renderFiles();
    },

    loadFiles() {
        const defaultFiles = [
            { name: 'Documents', type: 'folder', icon: '📁', size: '-', modified: new Date().toLocaleDateString() },
            { name: 'Downloads', type: 'folder', icon: '📁', size: '-', modified: new Date().toLocaleDateString() },
            { name: 'Pictures', type: 'folder', icon: '📁', size: '-', modified: new Date().toLocaleDateString() },
            { name: 'Music', type: 'folder', icon: '📁', size: '-', modified: new Date().toLocaleDateString() },
            { name: 'Videos', type: 'folder', icon: '📁', size: '-', modified: new Date().toLocaleDateString() },
            { name: 'Project Proposal.docx', type: 'doc', icon: '📄', size: '245 KB', modified: new Date().toLocaleDateString() },
            { name: 'Budget.xlsx', type: 'xlsx', icon: '📊', size: '189 KB', modified: new Date().toLocaleDateString() },
            { name: 'Presentation.pptx', type: 'pptx', icon: '📽️', size: '2.1 MB', modified: new Date().toLocaleDateString() },
            { name: 'Vacation.jpg', type: 'jpg', icon: '🖼️', size: '3.4 MB', modified: new Date().toLocaleDateString() },
            { name: 'Tutorial.mp4', type: 'mp4', icon: '🎬', size: '156 MB', modified: new Date().toLocaleDateString() },
            { name: 'Favorite.mp3', type: 'mp3', icon: '🎵', size: '5.2 MB', modified: new Date().toLocaleDateString() },
            { name: 'Archive.zip', type: 'zip', icon: '📦', size: '45 MB', modified: new Date().toLocaleDateString() },
            { name: 'Script.js', type: 'js', icon: '📝', size: '12 KB', modified: new Date().toLocaleDateString() },
            { name: 'Readme.txt', type: 'txt', icon: '📃', size: '3 KB', modified: new Date().toLocaleDateString() },
            { name: 'Config.json', type: 'json', icon: '⚙️', size: '8 KB', modified: new Date().toLocaleDateString() }
        ];
        
        return BhekStorage.load('explorerFiles', defaultFiles);
    },

    saveFiles() {
        BhekStorage.save('explorerFiles', this.files);
    },

    renderFiles() {
        const grid = document.getElementById('file-grid');
        if (!grid) return;
        
        const status = document.getElementById('file-status');
        const filesToShow = this.currentPath === 'thispc' ? this.files : this.getFilesInPath();
        
        grid.innerHTML = filesToShow.map(file => `
            <div class="file-item" ondblclick="FileExplorer.open('${file.name}')" 
                 oncontextmenu="FileExplorer.showContextMenu(event, '${file.name}')">
                <div class="icon">${file.icon}</div>
                <div style="font-size: 12px; word-break: break-word;">${file.name}</div>
                <div style="font-size: 10px; opacity: 0.6;">${file.size}</div>
            </div>
        `).join('');
        
        if (status) {
            status.textContent = `${filesToShow.length} items`;
        }
    },

    getFilesInPath() {
        // Simulate folder navigation
        if (this.currentPath === 'documents') {
            return this.files.filter(f => f.type === 'doc' || f.type === 'txt');
        } else if (this.currentPath === 'pictures') {
            return this.files.filter(f => f.type === 'jpg' || f.type === 'png');
        } else if (this.currentPath === 'music') {
            return this.files.filter(f => f.type === 'mp3');
        } else if (this.currentPath === 'videos') {
            return this.files.filter(f => f.type === 'mp4');
        } else if (this.currentPath === 'downloads') {
            return this.files.filter(f => f.type === 'zip' || f.type === 'exe');
        }
        return this.files;
    },

    navigate(destination) {
        if (destination === 'back') {
            if (this.historyIndex > 0) {
                this.historyIndex--;
                this.currentPath = this.history[this.historyIndex];
                this.renderFiles();
            }
        } else if (destination === 'forward') {
            if (this.historyIndex < this.history.length - 1) {
                this.historyIndex++;
                this.currentPath = this.history[this.historyIndex];
                this.renderFiles();
            }
        } else {
            // Add to history
            this.history = this.history.slice(0, this.historyIndex + 1);
            this.history.push(destination);
            this.historyIndex++;
            this.currentPath = destination;
            this.renderFiles();
        }
        
        // Update sidebar active state
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.classList.remove('active');
            if (item.textContent.includes(destination)) {
                item.classList.add('active');
            }
        });
    },

    refresh() {
        this.renderFiles();
        window.os.notify('File Explorer', 'Refreshed');
    },

    search(query) {
        const grid = document.getElementById('file-grid');
        if (!grid) return;
        
        if (!query) {
            this.renderFiles();
            return;
        }
        
        const filtered = this.files.filter(file => 
            file.name.toLowerCase().includes(query.toLowerCase())
        );
        
        grid.innerHTML = filtered.map(file => `
            <div class="file-item" ondblclick="FileExplorer.open('${file.name}')">
                <div class="icon">${file.icon}</div>
                <div style="font-size: 12px;">${file.name}</div>
                <div style="font-size: 10px; opacity: 0.6;">${file.size}</div>
            </div>
        `).join('');
        
        document.getElementById('file-status').textContent = `${filtered.length} items found`;
    },

    open(filename) {
        const file = this.files.find(f => f.name === filename);
        if (!file) return;
        
        if (file.type === 'folder') {
            this.navigate(file.name.toLowerCase());
        } else {
            window.os.notify('File Explorer', `Opening ${filename}`);
        }
    },

    showContextMenu(event, filename) {
        event.preventDefault();
        
        const menu = document.getElementById('contextMenu');
        menu.innerHTML = `
            <div class="context-menu-item" onclick="FileExplorer.open('${filename}')">📂 Open</div>
            <div class="context-menu-item" onclick="FileExplorer.rename('${filename}')">✏️ Rename</div>
            <div class="context-menu-item" onclick="FileExplorer.delete('${filename}')">🗑️ Delete</div>
            <div class="context-menu-item" onclick="FileExplorer.copy('${filename}')">📋 Copy</div>
            <div class="context-menu-item" onclick="FileExplorer.cut('${filename}')">✂️ Cut</div>
            <div class="context-menu-item" onclick="FileExplorer.properties('${filename}')">ℹ️ Properties</div>
        `;
        
        menu.style.left = event.clientX + 'px';
        menu.style.top = event.clientY + 'px';
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
    },

    rename(filename) {
        const newName = prompt('Enter new name:', filename);
        if (newName && newName !== filename) {
            const file = this.files.find(f => f.name === filename);
            if (file) {
                file.name = newName;
                this.saveFiles();
                this.renderFiles();
                window.os.notify('File Explorer', `Renamed to ${newName}`);
            }
        }
    },

    delete(filename) {
        if (confirm(`Delete ${filename}?`)) {
            this.files = this.files.filter(f => f.name !== filename);
            this.saveFiles();
            this.renderFiles();
            window.os.notify('File Explorer', `${filename} deleted`);
        }
    },

    copy(filename) {
        this.clipboard = { action: 'copy', filename };
        window.os.notify('File Explorer', `${filename} copied`);
    },

    cut(filename) {
        this.clipboard = { action: 'cut', filename };
        window.os.notify('File Explorer', `${filename} cut`);
    },

    properties(filename) {
        const file = this.files.find(f => f.name === filename);
        if (file) {
            alert(`
                File: ${file.name}
                Type: ${file.type}
                Size: ${file.size}
                Modified: ${file.modified}
            `);
        }
    }
};

// Make FileExplorer globally available
window.FileExplorer = FileExplorer;
