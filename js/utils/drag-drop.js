// Drag and Drop Utilities
const BhekDragDrop = {
    init() {
        this.draggedElement = null;
        this.dropZones = new Map();
        this.dragHandlers = new Map();
        
        this.setupGlobalListeners();
    },

    setupGlobalListeners() {
        document.addEventListener('dragstart', (e) => e.preventDefault());
        document.addEventListener('drag', (e) => e.preventDefault());
        document.addEventListener('dragend', (e) => this.onDragEnd(e));
    },

    // Make element draggable
    makeDraggable(element, options = {}) {
        const {
            handle = null,
            onDragStart = null,
            onDrag = null,
            onDragEnd = null,
            constraint = null, // 'x', 'y', or function
            snapToGrid = null, // { x: 20, y: 20 }
            bounds = null // { top, left, bottom, right }
        } = options;
        
        const dragHandle = handle ? element.querySelector(handle) : element;
        
        if (!dragHandle) return;
        
        dragHandle.style.cursor = 'move';
        dragHandle.setAttribute('draggable', false);
        
        let isDragging = false;
        let startX, startY, startLeft, startTop;
        let currentX, currentY;
        
        const onMouseDown = (e) => {
            if (e.button !== 0) return; // Only left click
            
            e.preventDefault();
            
            isDragging = true;
            
            const rect = element.getBoundingClientRect();
            startX = e.clientX;
            startY = e.clientY;
            startLeft = rect.left;
            startTop = rect.top;
            
            element.style.position = 'absolute';
            element.style.zIndex = '9999';
            element.style.transition = 'none';
            
            if (onDragStart) {
                onDragStart({ element, startX, startY, startLeft, startTop });
            }
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        };
        
        const onMouseMove = (e) => {
            if (!isDragging) return;
            
            e.preventDefault();
            
            let dx = e.clientX - startX;
            let dy = e.clientY - startY;
            
            // Apply constraints
            if (constraint === 'x') {
                dy = 0;
            } else if (constraint === 'y') {
                dx = 0;
            } else if (typeof constraint === 'function') {
                const result = constraint({ dx, dy, element });
                dx = result.dx;
                dy = result.dy;
            }
            
            let newLeft = startLeft + dx;
            let newTop = startTop + dy;
            
            // Apply snap to grid
            if (snapToGrid) {
                newLeft = Math.round(newLeft / snapToGrid.x) * snapToGrid.x;
                newTop = Math.round(newTop / snapToGrid.y) * snapToGrid.y;
            }
            
            // Apply bounds
            if (bounds) {
                newLeft = Math.max(bounds.left || -Infinity, Math.min(bounds.right || Infinity, newLeft));
                newTop = Math.max(bounds.top || -Infinity, Math.min(bounds.bottom || Infinity, newTop));
            }
            
            element.style.left = `${newLeft}px`;
            element.style.top = `${newTop}px`;
            
            currentX = newLeft;
            currentY = newTop;
            
            // Check drop zones
            this.checkDropZones(element, newLeft, newTop);
            
            if (onDrag) {
                onDrag({ element, x: newLeft, y: newTop, dx, dy });
            }
        };
        
        const onMouseUp = (e) => {
            if (!isDragging) return;
            
            isDragging = false;
            
            element.style.zIndex = '';
            element.style.transition = '';
            
            if (onDragEnd) {
                onDragEnd({ element, x: currentX, y: currentY });
            }
            
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
        
        dragHandle.addEventListener('mousedown', onMouseDown);
        
        // Store handlers for cleanup
        this.dragHandlers.set(element, {
            element,
            handle: dragHandle,
            onMouseDown,
            onMouseMove,
            onMouseUp
        });
        
        return element;
    },

    // Make element a drop zone
    makeDropZone(element, options = {}) {
        const {
            accept = '*', // Accept any draggable, or array of types
            onDrop = null,
            onDragOver = null,
            onDragLeave = null,
            highlight = true
        } = options;
        
        const id = BhekHelpers.generateId('dropzone-');
        element.dataset.dropZone = id;
        
        this.dropZones.set(id, {
            element,
            accept,
            onDrop,
            onDragOver,
            onDragLeave,
            highlight,
            active: false
        });
        
        return element;
    },

    checkDropZones(draggedElement, x, y) {
        const draggedRect = draggedElement.getBoundingClientRect();
        const draggedCenter = {
            x: draggedRect.left + draggedRect.width / 2,
            y: draggedRect.top + draggedRect.height / 2
        };
        
        let activeZone = null;
        
        for (const [id, zone] of this.dropZones) {
            const rect = zone.element.getBoundingClientRect();
            
            const isOver = draggedCenter.x >= rect.left &&
                          draggedCenter.x <= rect.right &&
                          draggedCenter.y >= rect.top &&
                          draggedCenter.y <= rect.bottom;
            
            if (isOver && this.accepts(zone, draggedElement)) {
                if (!zone.active) {
                    zone.active = true;
                    
                    if (zone.highlight) {
                        zone.element.style.border = '2px dashed var(--accent)';
                        zone.element.style.backgroundColor = 'rgba(var(--accent-rgb), 0.1)';
                    }
                    
                    if (zone.onDragOver) {
                        zone.onDragOver(draggedElement, zone.element);
                    }
                }
                
                activeZone = zone;
            } else if (zone.active) {
                zone.active = false;
                
                if (zone.highlight) {
                    zone.element.style.border = '';
                    zone.element.style.backgroundColor = '';
                }
                
                if (zone.onDragLeave) {
                    zone.onDragLeave(draggedElement, zone.element);
                }
            }
        }
        
        // Handle drop
        if (activeZone && this.dropPending) {
            if (activeZone.onDrop) {
                activeZone.onDrop(this.draggedElement, activeZone.element);
            }
            this.dropPending = false;
        }
    },

    accepts(zone, element) {
        if (zone.accept === '*') return true;
        
        const elementType = element.dataset.dragType || 'default';
        return zone.accept.includes(elementType);
    },

    onDragEnd(e) {
        this.dropPending = true;
        
        // Clear all zone highlights
        for (const [id, zone] of this.dropZones) {
            if (zone.active) {
                zone.active = false;
                zone.element.style.border = '';
                zone.element.style.backgroundColor = '';
            }
        }
    },

    // Remove draggable functionality
    removeDraggable(element) {
        const handlers = this.dragHandlers.get(element);
        if (handlers) {
            handlers.handle.removeEventListener('mousedown', handlers.onMouseDown);
            this.dragHandlers.delete(element);
        }
    },

    // Remove drop zone
    removeDropZone(element) {
        const id = element.dataset.dropZone;
        if (id) {
            this.dropZones.delete(id);
            delete element.dataset.dropZone;
        }
    },

    // Desktop icon specific dragging
    makeDesktopIconDraggable(icon, options = {}) {
        const {
            onPositionChange = null,
            snapToGrid = { x: 20, y: 20 }
        } = options;
        
        return this.makeDraggable(icon, {
            snapToGrid,
            onDragEnd: ({ element, x, y }) => {
                if (onPositionChange) {
                    onPositionChange({ element, x, y });
                }
            }
        });
    },

    // Window dragging
    makeWindowDraggable(window, options = {}) {
        const {
            onMaximize = null,
            onMinimize = null,
            onClose = null
        } = options;
        
        return this.makeDraggable(window, {
            handle: '.titlebar',
            constraint: ({ dx, dy }) => {
                // Keep window within viewport
                const rect = window.getBoundingClientRect();
                const maxLeft = window.innerWidth - rect.width;
                const maxTop = window.innerHeight - rect.height - 48; // Account for taskbar
                
                return {
                    dx: Math.max(0, Math.min(maxLeft, rect.left + dx)) - rect.left,
                    dy: Math.max(0, Math.min(maxTop, rect.top + dy)) - rect.top
                };
            }
        });
    },

    // File drag and drop
    setupFileDrop(zone, options = {}) {
        const {
            onFileDrop = null,
            accept = ['image/*', 'text/*'],
            multiple = true
        } = options;
        
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('drag-over');
        });
        
        zone.addEventListener('dragleave', () => {
            zone.classList.remove('drag-over');
        });
        
        zone.addEventListener('drop', async (e) => {
            e.preventDefault();
            zone.classList.remove('drag-over');
            
            const files = Array.from(e.dataTransfer.files);
            
            // Filter by accept
            const acceptedFiles = files.filter(file => {
                return accept.some(pattern => {
                    if (pattern.endsWith('/*')) {
                        const type = pattern.replace('/*', '');
                        return file.type.startsWith(type);
                    }
                    return file.type === pattern;
                });
            });
            
            if (onFileDrop) {
                const fileData = await Promise.all(
                    acceptedFiles.map(async file => ({
                        file,
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        lastModified: file.lastModified,
                        data: await BhekHelpers.readFileAsDataURL(file)
                    }))
                );
                
                onFileDrop(multiple ? fileData : fileData[0]);
            }
        });
    }
};

// Initialize
BhekDragDrop.init();
