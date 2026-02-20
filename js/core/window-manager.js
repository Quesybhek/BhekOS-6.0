// Window Manager
class WindowManager {
    constructor(os) {
        this.os = os;
        this.procs = new Map();
        this.zIdx = 1000;
    }

    spawn(name, type) {
        const pid = BhekHelpers.generateId();
        const win = this.createWindow(pid, name);
        
        const left = 100 + (this.procs.size % 5) * 30;
        const top = 50 + (this.procs.size % 5) * 30;
        
        win.style.left = `${left}px`;
        win.style.top = `${top}px`;
        win.style.zIndex = ++this.zIdx;
        
        document.getElementById('desktop').appendChild(win);
        this.procs.set(pid, { win, type, name });
        
        this.os.addTaskbar(pid, name, type);
        this.os.loadApp(pid, type);
        this.focus(pid);
        
        return pid;
    }

    createWindow(pid, name) {
        const win = document.createElement('div');
        win.className = 'window';
        win.id = pid;
        
        const isMobile = BhekHelpers.isMobile();
        win.style.width = isMobile ? '95vw' : '600px';
        win.style.height = isMobile ? '70vh' : '500px';
        
        win.innerHTML = `
            <div class="titlebar" onmousedown="os.wm.startDrag(event,'${pid}')">
                <span>${name}</span>
                <div class="titlebar-controls">
                    <span class="minimize" onclick="os.wm.minimize('${pid}'); event.stopPropagation();"></span>
                    <span class="maximize" onclick="os.wm.maximize('${pid}'); event.stopPropagation();"></span>
                    <span class="close" onclick="os.wm.kill('${pid}'); event.stopPropagation();"></span>
                </div>
            </div>
            <div class="view" id="view-${pid}"></div>
        `;
        
        return win;
    }

    focus(pid) {
        const proc = this.procs.get(pid);
        if (proc) {
            proc.win.style.zIndex = ++this.zIdx;
            
            document.querySelectorAll('.taskbar-icon').forEach(el => {
                el.classList.remove('active');
            });
            
            const taskBtn = document.getElementById('task-' + pid);
            if (taskBtn) taskBtn.classList.add('active');
            
            proc.win.style.display = 'flex';
        }
    }

    startDrag(e, pid) {
        const proc = this.procs.get(pid);
        if (!proc || proc.win.classList.contains('maximized')) return;
        
        const win = proc.win;
        const startX = e.clientX;
        const startY = e.clientY;
        const startLeft = parseInt(win.style.left) || 100;
        const startTop = parseInt(win.style.top) || 100;
        
        const onMouseMove = (moveEvent) => {
            const dx = moveEvent.clientX - startX;
            const dy = moveEvent.clientY - startY;
            win.style.left = (startLeft + dx) + 'px';
            win.style.top = (startTop + dy) + 'px';
        };
        
        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp, { once: true });
        
        this.focus(pid);
    }

    minimize(pid) {
        const proc = this.procs.get(pid);
        if (proc) {
            proc.win.style.display = 'none';
            const taskBtn = document.getElementById('task-' + pid);
            if (taskBtn) taskBtn.classList.remove('active');
        }
    }

    maximize(pid) {
        const proc = this.procs.get(pid);
        if (proc) {
            const win = proc.win;
            if (win.classList.contains('maximized')) {
                // Restore
                win.style.width = win.dataset.prevWidth || (BhekHelpers.isMobile() ? '95vw' : '600px');
                win.style.height = win.dataset.prevHeight || (BhekHelpers.isMobile() ? '70vh' : '500px');
                win.style.left = win.dataset.prevLeft || '100px';
                win.style.top = win.dataset.prevTop || '50px';
                win.style.borderRadius = '12px';
                win.classList.remove('maximized');
            } else {
                // Save current state
                win.dataset.prevWidth = win.style.width;
                win.dataset.prevHeight = win.style.height;
                win.dataset.prevLeft = win.style.left;
                win.dataset.prevTop = win.style.top;
                
                // Maximize
                win.style.width = '100vw';
                win.style.height = 'calc(100vh - var(--taskbar-height))';
                win.style.left = '0';
                win.style.top = '0';
                win.style.borderRadius = '0';
                win.classList.add('maximized');
            }
            this.focus(pid);
        }
    }

    kill(pid) {
        const proc = this.procs.get(pid);
        if (proc) {
            proc.win.remove();
            this.procs.delete(pid);
            
            const taskBtn = document.getElementById('task-' + pid);
            if (taskBtn) taskBtn.remove();
            
            this.os.notify('Application Closed', `${proc.name} has been closed`);
        }
    }

    closeAll() {
        this.procs.forEach((proc, pid) => {
            this.kill(pid);
        });
    }

    getProc(pid) {
        return this.procs.get(pid);
    }

    getAllProcs() {
        return Array.from(this.procs.values());
    }
}
