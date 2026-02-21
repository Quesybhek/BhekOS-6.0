// Notepad App
const Notepad = {
    load(view, os) {
        this.os = os;
        this.currentFile = 'untitled.txt';
        this.files = BhekStorage.load('notepadFiles', {
            'untitled.txt': 'Welcome to BhekOS Notepad!\n\nYou can type notes here and they will be saved automatically.\n\nFeatures:\n• Auto-save\n• Dark theme\n• Basic text editing\n• Secure storage\n• Multiple files support'
        });
        
        view.innerHTML = `
            <div style="height: 100%; display: flex; flex-direction: column;">
                <div style="display: flex; gap: 8px; padding: 12px; background: rgba(0,0,0,0.2); border-bottom: 1px solid var(--mica-border);">
                    <button onclick="Notepad.newFile()">📄 New</button>
                    <button onclick="Notepad.saveFile()">💾 Save</button>
                    <button onclick="Notepad.openFile()">📂 Open</button>
                    <button onclick="Notepad.downloadFile()" class="secondary">📥 Download</button>
                    <select id="file-selector" style="flex: 1;" onchange="Notepad.switchFile(this.value)">
                        ${Object.keys(this.files).map(f => `<option value="${f}" ${f === this.currentFile ? 'selected' : ''}>${f}</option>`).join('')}
                    </select>
                </div>
                
                <textarea id="notepad-text" 
                          style="flex: 1; background: rgba(0,0,0,0.3); border: none; padding: 16px; font-family: 'Cascadia Code', 'Consolas', monospace; font-size: 14px; resize: none; outline: none;"
                          placeholder="Start typing your notes here...">${this.files[this.currentFile]}</textarea>
                
                <div style="display: flex; justify-content: space-between; padding: 8px 16px; background: rgba(0,0,0,0.2); border-top: 1px solid var(--mica-border); font-size: 12px;">
                    <div>
                        <span class="security-indicator security-high"></span>
                        Encrypted Storage
                    </div>
                    <div id="file-info">
                        ${this.currentFile} | ${this.files[this.currentFile].length} characters
                    </div>
                </div>
            </div>
        `;
        
        // Auto-save every 30 seconds
        this.autoSaveInterval = setInterval(() => this.autoSave(), 30000);
    },

    newFile() {
        const name = prompt('Enter filename:', 'new-note.txt');
        if (name && !this.files[name]) {
            this.files[name] = '';
            this.currentFile = name;
            this.updateFileSelector();
            document.getElementById('notepad-text').value = '';
            this.saveFiles();
            this.os.notify('Notepad', `Created ${name}`);
        } else if (name) {
            this.os.notify('Notepad', 'File already exists');
        }
    },

    saveFile() {
        const text = document.getElementById('notepad-text').value;
        this.files[this.currentFile] = text;
        this.saveFiles();
        this.updateFileInfo();
        this.os.notify('Notepad', 'File saved');
    },

    autoSave() {
        const text = document.getElementById('notepad-text')?.value;
        if (text !== undefined) {
            this.files[this.currentFile] = text;
            this.saveFiles();
        }
    },

    saveFiles() {
        BhekStorage.save('notepadFiles', this.files);
    },

    openFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.txt,.md,.js,.html,.css,.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target.result;
                this.files[file.name] = content;
                this.currentFile = file.name;
                this.updateFileSelector();
                document.getElementById('notepad-text').value = content;
                this.saveFiles();
                this.os.notify('Notepad', `Opened ${file.name}`);
            };
            reader.readAsText(file);
        };
        input.click();
    },

    downloadFile() {
        const text = document.getElementById('notepad-text').value;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.currentFile;
        a.click();
        URL.revokeObjectURL(url);
        this.os.notify('Notepad', 'File downloaded');
    },

    switchFile(filename) {
        // Save current file
        const currentText = document.getElementById('notepad-text').value;
        this.files[this.currentFile] = currentText;
        
        // Switch to new file
        this.currentFile = filename;
        document.getElementById('notepad-text').value = this.files[filename] || '';
        this.updateFileInfo();
        
        // Update selector
        document.getElementById('file-selector').value = filename;
    },

    updateFileSelector() {
        const selector = document.getElementById('file-selector');
        if (selector) {
            selector.innerHTML = Object.keys(this.files).map(f => 
                `<option value="${f}" ${f === this.currentFile ? 'selected' : ''}>${f}</option>`
            ).join('');
        }
    },

    updateFileInfo() {
        const info = document.getElementById('file-info');
        if (info) {
            const text = document.getElementById('notepad-text').value;
            info.textContent = `${this.currentFile} | ${text.length} characters | ${text.split(/\s+/).length} words`;
        }
    },

    clearNotepad() {
        if (confirm('Clear all content?')) {
            document.getElementById('notepad-text').value = '';
            this.files[this.currentFile] = '';
            this.saveFiles();
            this.updateFileInfo();
            this.os.notify('Notepad', 'Content cleared');
        }
    }
};

window.Notepad = Notepad;
