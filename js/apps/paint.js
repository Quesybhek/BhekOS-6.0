// Paint App
const Paint = {
    load(view, os) {
        this.os = os;
        this.tool = 'brush';
        this.color = '#0078d4';
        this.size = 5;
        this.history = [];
        this.historyIndex = -1;
        
        view.innerHTML = `
            <div style="height: 100%; display: flex; flex-direction: column; padding: 16px;">
                <h2 style="margin-bottom: 16px;">🎨 Paint</h2>
                
                <div style="display: flex; gap: 16px; margin-bottom: 16px; flex-wrap: wrap;">
                    <div style="display: flex; gap: 8px;">
                        <button onclick="Paint.setTool('brush')" class="${this.tool === 'brush' ? 'active' : ''}" style="background: ${this.tool === 'brush' ? 'var(--accent)' : 'rgba(255,255,255,0.1)'};">🖌️ Brush</button>
                        <button onclick="Paint.setTool('line')" class="${this.tool === 'line' ? 'active' : ''}" style="background: ${this.tool === 'line' ? 'var(--accent)' : 'rgba(255,255,255,0.1)'};">📏 Line</button>
                        <button onclick="Paint.setTool('rect')" class="${this.tool === 'rect' ? 'active' : ''}" style="background: ${this.tool === 'rect' ? 'var(--accent)' : 'rgba(255,255,255,0.1)'};">⬜ Rectangle</button>
                        <button onclick="Paint.setTool('circle')" class="${this.tool === 'circle' ? 'active' : ''}" style="background: ${this.tool === 'circle' ? 'var(--accent)' : 'rgba(255,255,255,0.1)'};">⭕ Circle</button>
                        <button onclick="Paint.setTool('fill')" class="${this.tool === 'fill' ? 'active' : ''}" style="background: ${this.tool === 'fill' ? 'var(--accent)' : 'rgba(255,255,255,0.1)'};">🪣 Fill</button>
                        <button onclick="Paint.setTool('eraser')" class="${this.tool === 'eraser' ? 'active' : ''}" style="background: ${this.tool === 'eraser' ? 'var(--accent)' : 'rgba(255,255,255,0.1)'};">🧽 Eraser</button>
                    </div>
                    
                    <div style="display: flex; gap: 8px; margin-left: auto;">
                        <button onclick="Paint.undo()" ${this.historyIndex <= 0 ? 'disabled' : ''}>↩️ Undo</button>
                        <button onclick="Paint.redo()" ${this.historyIndex >= this.history.length - 1 ? 'disabled' : ''}>↪️ Redo</button>
                        <button onclick="Paint.clear()" class="secondary">🗑️ Clear</button>
                        <button onclick="Paint.save()" class="secondary">💾 Save</button>
                    </div>
                </div>
                
                <div style="display: flex; gap: 16px; margin-bottom: 16px; align-items: center; background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span>Color:</span>
                        <input type="color" id="paint-color" value="${this.color}" onchange="Paint.setColor(this.value)" style="width: 40px; height: 40px;">
                    </div>
                    
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span>Size:</span>
                        <input type="range" id="paint-size" min="1" max="50" value="${this.size}" onchange="Paint.setSize(this.value)" style="width: 150px;">
                        <span id="paint-size-value">${this.size}px</span>
                    </div>
                    
                    <div style="display: flex; align-items: center; gap: 8px; margin-left: auto;">
                        <span>Opacity:</span>
                        <input type="range" id="paint-opacity" min="0" max="100" value="100" onchange="Paint.setOpacity(this.value)" style="width: 100px;">
                    </div>
                </div>
                
                <div style="flex: 1; background: white; border-radius: 8px; overflow: hidden; border: 2px solid var(--mica-border); position: relative;">
                    <canvas id="paint-canvas" width="800" height="500" 
                            style="width: 100%; height: 100%; cursor: crosshair; touch-action: none;"></canvas>
                </div>
                
                <div style="margin-top: 16px; display: flex; justify-content: space-between; font-size: 12px; opacity: 0.7;">
                    <div id="paint-status">Tool: Brush | Color: ${this.color} | Size: ${this.size}px</div>
                    <div>
                        <span class="security-indicator security-medium"></span>
                        Drawings saved locally
                    </div>
                </div>
            </div>
        `;
        
        setTimeout(() => this.initCanvas(), 100);
    },

    initCanvas() {
        const canvas = document.getElementById('paint-canvas');
        if (!canvas) return;
        
        this.ctx = canvas.getContext('2d');
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        this.painting = false;
        this.lastX = 0;
        this.lastY = 0;
        
        // Save initial state
        this.saveState();
        
        // Event listeners
        canvas.addEventListener('mousedown', (e) => this.startPainting(e));
        canvas.addEventListener('mousemove', (e) => this.paint(e));
        canvas.addEventListener('mouseup', () => this.stopPainting());
        canvas.addEventListener('mouseleave', () => this.stopPainting());
        
        // Touch support
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            canvas.dispatchEvent(mouseEvent);
        });
        
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            canvas.dispatchEvent(mouseEvent);
        });
        
        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.stopPainting();
        });
    },

    startPainting(e) {
        this.painting = true;
        const rect = e.target.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (e.target.width / rect.width);
        const y = (e.clientY - rect.top) * (e.target.height / rect.height);
        
        this.lastX = x;
        this.lastY = y;
        
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
    },

    paint(e) {
        if (!this.painting) return;
        
        const rect = e.target.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (e.target.width / rect.width);
        const y = (e.clientY - rect.top) * (e.target.height / rect.height);
        
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = this.size;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        if (this.tool === 'brush' || this.tool === 'eraser') {
            if (this.tool === 'eraser') {
                this.ctx.strokeStyle = '#ffffff';
            }
            this.ctx.lineTo(x, y);
            this.ctx.stroke();
        } else if (this.tool === 'line') {
            // Preview line
            this.redraw();
            this.ctx.beginPath();
            this.ctx.moveTo(this.lastX, this.lastY);
            this.ctx.lineTo(x, y);
            this.ctx.stroke();
        } else if (this.tool === 'rect') {
            this.redraw();
            const width = x - this.lastX;
            const height = y - this.lastY;
            this.ctx.strokeRect(this.lastX, this.lastY, width, height);
        } else if (this.tool === 'circle') {
            this.redraw();
            const radius = Math.sqrt(Math.pow(x - this.lastX, 2) + Math.pow(y - this.lastY, 2));
            this.ctx.beginPath();
            this.ctx.arc(this.lastX, this.lastY, radius, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        this.lastX = x;
        this.lastY = y;
    },

    stopPainting() {
        if (this.painting) {
            this.painting = false;
            this.saveState();
        }
    },

    setTool(tool) {
        this.tool = tool;
        this.updateStatus();
        
        // Update button styles
        document.querySelectorAll('[onclick^="Paint.setTool"]').forEach(btn => {
            btn.style.background = 'rgba(255,255,255,0.1)';
        });
        event.target.style.background = 'var(--accent)';
    },

    setColor(color) {
        this.color = color;
        this.updateStatus();
    },

    setSize(size) {
        this.size = parseInt(size);
        document.getElementById('paint-size-value').textContent = this.size + 'px';
        this.updateStatus();
    },

    setOpacity(opacity) {
        this.ctx.globalAlpha = opacity / 100;
    },

    updateStatus() {
        document.getElementById('paint-status').textContent = 
            `Tool: ${this.tool.charAt(0).toUpperCase() + this.tool.slice(1)} | Color: ${this.color} | Size: ${this.size}px`;
    },

    clear() {
        if (confirm('Clear canvas?')) {
            this.ctx.fillStyle = 'white';
            this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            this.saveState();
        }
    },

    save() {
        const canvas = document.getElementById('paint-canvas');
        const dataURL = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataURL;
        a.download = `bhekos-painting-${new Date().toISOString().slice(0, 10)}.png`;
        a.click();
        this.os.notify('Paint', 'Painting saved as PNG');
    },

    saveState() {
        const canvas = document.getElementById('paint-canvas');
        const state = canvas.toDataURL();
        
        // Remove future states if we're not at the end
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }
        
        this.history.push(state);
        this.historyIndex = this.history.length - 1;
        
        // Limit history size
        if (this.history.length > 20) {
            this.history.shift();
            this.historyIndex--;
        }
    },

    redraw() {
        if (this.historyIndex >= 0) {
            const img = new Image();
            img.onload = () => {
                this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
                this.ctx.drawImage(img, 0, 0);
            };
            img.src = this.history[this.historyIndex];
        }
    },

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.redraw();
        }
    },

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.redraw();
        }
    }
};

window.Paint = Paint;
