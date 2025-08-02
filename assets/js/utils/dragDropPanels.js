// ===== DRAG & DROP PANEL SYSTEM =====
// This module handles drag-and-drop functionality for moving tabs to different panel positions

class DragDropPanelManager {
    constructor() {
        this.draggedElement = null;
        this.dropZones = {
            left: null,
            right: null
        };
        this.isDragging = false;
        this.init();
    }

    init() {
        this.createDropZones();
        this.setupDragListeners();
        this.setupDropZoneListeners();
        console.log('Drag & Drop Panel Manager initialized');
    }

    createDropZones() {
        // Create left drop zone
        const leftDropZone = document.createElement('div');
        leftDropZone.id = 'left-drop-zone';
        leftDropZone.className = 'drop-zone left-drop-zone';
        leftDropZone.innerHTML = '<div class="drop-zone-content"><span class="drop-zone-text">Drop tab here for left panel</span></div>';
        
        // Create right drop zone
        const rightDropZone = document.createElement('div');
        rightDropZone.id = 'right-drop-zone';
        rightDropZone.className = 'drop-zone right-drop-zone';
        rightDropZone.innerHTML = '<div class="drop-zone-content"><span class="drop-zone-text">Drop tab here for right panel</span></div>';

        // Add drop zones to the page
        document.body.appendChild(leftDropZone);
        document.body.appendChild(rightDropZone);

        this.dropZones.left = leftDropZone;
        this.dropZones.right = rightDropZone;
    }

    setupDragListeners() {
        // Make all tab buttons draggable
        const tabButtons = document.querySelectorAll('nav.tabs button[data-target]');
        
        tabButtons.forEach(button => {
            button.setAttribute('draggable', 'true');
            button.addEventListener('dragstart', (e) => this.handleDragStart(e));
            button.addEventListener('dragend', (e) => this.handleDragEnd(e));
        });

        // Listen for new tab buttons being added
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const newTabButtons = node.querySelectorAll && node.querySelectorAll('nav.tabs button[data-target]');
                        if (newTabButtons) {
                            newTabButtons.forEach(button => {
                                if (!button.hasAttribute('draggable')) {
                                    button.setAttribute('draggable', 'true');
                                    button.addEventListener('dragstart', (e) => this.handleDragStart(e));
                                    button.addEventListener('dragend', (e) => this.handleDragEnd(e));
                                }
                            });
                        }
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    setupDropZoneListeners() {
        Object.values(this.dropZones).forEach(dropZone => {
            dropZone.addEventListener('dragover', (e) => this.handleDragOver(e));
            dropZone.addEventListener('dragenter', (e) => this.handleDragEnter(e));
            dropZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            dropZone.addEventListener('drop', (e) => this.handleDrop(e));
        });
    }

    handleDragStart(e) {
        this.isDragging = true;
        this.draggedElement = e.target;
        e.target.style.opacity = '0.5';
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target.outerHTML);
        
        // Show drop zones
        this.showDropZones();
        
        console.log('Drag started:', e.target.textContent);
    }

    handleDragEnd(e) {
        this.isDragging = false;
        this.draggedElement = null;
        e.target.style.opacity = '1';
        
        // Hide drop zones
        this.hideDropZones();
        
        console.log('Drag ended');
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    handleDragEnter(e) {
        e.preventDefault();
        e.currentTarget.classList.add('drag-over');
    }

    handleDragLeave(e) {
        e.currentTarget.classList.remove('drag-over');
    }

    handleDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        
        if (this.draggedElement) {
            const targetPanelId = this.draggedElement.getAttribute('data-target');
            const dropZone = e.currentTarget;
            const position = dropZone.classList.contains('left-drop-zone') ? 'left' : 'right';
            
            console.log(`Dropped ${targetPanelId} to ${position} panel`);
            
            // Use the multi-panel manager to set the panel
            if (window.multiPanelManager) {
                window.multiPanelManager.setPanel(position, targetPanelId);
                this.showDropNotification(this.draggedElement.textContent, position);
            }
        }
    }

    showDropNotification(tabName, position) {
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.className = 'drop-notification';
        notification.textContent = `${tabName} moved to ${position} panel`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 215, 0, 0.9);
            color: #000;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            animation: slideInDown 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Remove notification after 2 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutUp 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 2000);
    }

    showDropZones() {
        Object.values(this.dropZones).forEach(dropZone => {
            dropZone.classList.add('visible');
        });
    }

    hideDropZones() {
        Object.values(this.dropZones).forEach(dropZone => {
            dropZone.classList.remove('visible', 'drag-over');
        });
    }

    // Public method to update drop zone visibility based on multi-panel state
    updateDropZoneVisibility() {
        if (window.multiPanelManager && window.multiPanelManager.isInMultiPanelMode()) {
            // In multi-panel mode, show drop zones when dragging
            if (this.isDragging) {
                this.showDropZones();
            }
        } else {
            // In single panel mode, always hide drop zones
            this.hideDropZones();
        }
    }
}

// Initialize the drag & drop manager when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dragDropPanelManager = new DragDropPanelManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DragDropPanelManager;
}