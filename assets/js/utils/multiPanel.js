// ===== MULTI-PANEL LAYOUT SYSTEM =====
// This module handles the multi-panel layout functionality allowing users
// to have up to 3 tabs open simultaneously (left, center, right)

class MultiPanelManager {
    constructor() {
        this.panels = {
            left: { id: null, content: null },
            center: { id: null, content: null },
            right: { id: null, content: null }
        };
        this.isMultiPanelMode = false;
        this.init();
    }

    init() {
        try {
            this.createPanelLayout();
            this.loadPanelState();
            this.setupEventListeners();
            this.updateLayout();
            console.log('Multi-panel manager initialized successfully');
        } catch (error) {
            console.error('Error initializing multi-panel manager:', error);
            this.setDefaultState();
            this.updateLayout();
        }
    }

    createPanelLayout() {
        // Find the main glass container
        const glassContainer = document.querySelector('.glass');
        if (!glassContainer) {
            console.error('Glass container not found');
            return;
        }

        // Create the multi-panel layout
        const multiPanelLayout = document.createElement('div');
        multiPanelLayout.className = 'multi-panel-layout';
        multiPanelLayout.innerHTML = `
            <div class="panel-container left-panel">
                <div class="panel-header">
                    <span class="panel-title">Left Panel</span>
                    <button class="close-panel-btn" data-panel="left">×</button>
                </div>
                <div class="panel-content">
                    <!-- Left panel content will be dynamically populated -->
                </div>
            </div>
            
            <div class="panel-container center-panel">
                <div class="panel-header">
                    <span class="panel-title">Center Panel</span>
                    <button class="close-panel-btn" data-panel="center">×</button>
                </div>
                <div class="panel-content">
                    <!-- Center panel content will be dynamically populated -->
                </div>
            </div>
            
            <div class="panel-container right-panel">
                <div class="panel-header">
                    <span class="panel-title">Right Panel</span>
                    <button class="close-panel-btn" data-panel="right">×</button>
                </div>
                <div class="panel-content">
                    <!-- Right panel content will be dynamically populated -->
                </div>
            </div>
        `;

        // Add the layout to the glass container
        glassContainer.appendChild(multiPanelLayout);
    }

    setupEventListeners() {
        // Multi-panel menu button
        const menuBtn = document.getElementById('multi-panel-menu-btn');
        const menu = document.getElementById('multi-panel-menu');
        
        if (menuBtn && menu) {
            menuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                menu.classList.toggle('show');
                menuBtn.classList.toggle('active');
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!menu.contains(e.target) && !menuBtn.contains(e.target)) {
                    menu.classList.remove('show');
                    menuBtn.classList.remove('active');
                }
            });
        }

        // Panel selection controls
        document.getElementById('left-panel-select').addEventListener('change', (e) => {
            this.setPanel('left', e.target.value);
        });

        document.getElementById('center-panel-select').addEventListener('change', (e) => {
            this.setPanel('center', e.target.value);
        });

        document.getElementById('right-panel-select').addEventListener('change', (e) => {
            this.setPanel('right', e.target.value);
        });

        // Reset button
        document.getElementById('reset-panels-btn').addEventListener('click', () => {
            this.resetToSinglePanel();
        });

        // Toggle panel mode button
        document.getElementById('toggle-panel-mode-btn').addEventListener('click', () => {
            this.togglePanelMode();
        });

        // Close panel buttons
        document.querySelectorAll('.close-panel-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const panel = e.target.dataset.panel;
                this.closePanel(panel);
            });
        });
    }

    setPanel(position, panelId) {
        try {
            if (!panelId) {
                this.closePanel(position);
                return;
            }

            // Check if panel is already open in another position
            const existingPosition = this.getPanelPosition(panelId);
            if (existingPosition && existingPosition !== position) {
                // Swap panels
                const currentPanelId = this.panels[position].id;
                this.panels[existingPosition].id = currentPanelId;
                this.panels[existingPosition].content = this.getPanelContent(currentPanelId);
            }

            this.panels[position].id = panelId;
            this.panels[position].content = this.getPanelContent(panelId);
            
            // If this is the first panel being set and we're not in multi-panel mode,
            // automatically enable multi-panel mode and set the current active tab as center
            if (!this.isMultiPanelMode) {
                const activeTab = document.querySelector('nav.tabs button.active');
                if (activeTab) {
                    const activePanelId = activeTab.dataset.target;
                    if (activePanelId !== panelId) {
                        this.panels.center = { id: activePanelId, content: this.getPanelContent(activePanelId) };
                    }
                }
            }
            
            this.updateLayout();
            this.savePanelState();
            this.initializePanelContent(panelId);
            
            console.log(`Panel ${panelId} set to ${position} position`);
        } catch (error) {
            console.error(`Error setting panel ${panelId} to ${position}:`, error);
        }
    }

    closePanel(position) {
        this.panels[position].id = null;
        this.panels[position].content = null;
        this.updateLayout();
        this.savePanelState();
    }

    getPanelPosition(panelId) {
        for (const [position, panel] of Object.entries(this.panels)) {
            if (panel.id === panelId) {
                return position;
            }
        }
        return null;
    }

    getPanelContent(panelId) {
        const originalPanel = document.getElementById(panelId);
        if (!originalPanel) return null;
        
        // Clone the panel content
        const clonedContent = originalPanel.cloneNode(true);
        clonedContent.id = `${panelId}-clone`;
        
        // Fix IDs in cloned content to avoid conflicts
        this.fixClonedContentIds(clonedContent, panelId);
        
        return clonedContent;
    }

    fixClonedContentIds(clonedContent, originalPanelId) {
        // Find all elements with IDs and update them to avoid conflicts
        const elementsWithIds = clonedContent.querySelectorAll('[id]');
        elementsWithIds.forEach(element => {
            const originalId = element.id;
            element.id = `${originalId}-${originalPanelId}-clone`;
        });

        // Update any references to these IDs in attributes like 'for', 'data-target', etc.
        const elementsWithReferences = clonedContent.querySelectorAll('[for], [data-target], [href]');
        elementsWithReferences.forEach(element => {
            if (element.getAttribute('for')) {
                const forId = element.getAttribute('for');
                element.setAttribute('for', `${forId}-${originalPanelId}-clone`);
            }
            if (element.getAttribute('data-target')) {
                const targetId = element.getAttribute('data-target');
                element.setAttribute('data-target', `${targetId}-${originalPanelId}-clone`);
            }
            if (element.getAttribute('href') && element.getAttribute('href').startsWith('#')) {
                const hrefId = element.getAttribute('href').substring(1);
                element.setAttribute('href', `#${hrefId}-${originalPanelId}-clone`);
            }
        });
    }

    updateLayout() {
        const hasActivePanels = Object.values(this.panels).some(panel => panel.id !== null);
        
        if (hasActivePanels) {
            this.enableMultiPanelMode();
        } else {
            this.enableSinglePanelMode();
        }

        // Update panel containers
        Object.entries(this.panels).forEach(([position, panel]) => {
            const container = document.querySelector(`.${position}-panel .panel-content`);
            const panelElement = document.querySelector(`.${position}-panel`);
            
            if (container && panelElement) {
                container.innerHTML = '';
                
                if (panel.id && panel.content) {
                    container.appendChild(panel.content);
                    panelElement.classList.remove('empty');
                    panelElement.classList.add('visible');
                    
                    // Update panel title
                    const titleElement = panelElement.querySelector('.panel-title');
                    if (titleElement) {
                        titleElement.textContent = this.getPanelDisplayName(panel.id);
                    }
                } else {
                    panelElement.classList.add('empty');
                    panelElement.classList.remove('visible');
                    container.innerHTML = '<p>No panel selected</p>';
                    
                    // Reset panel title
                    const titleElement = panelElement.querySelector('.panel-title');
                    if (titleElement) {
                        titleElement.textContent = this.getPanelDisplayName(position);
                    }
                }
            }
        });

        // Update select dropdowns
        this.updateSelectDropdowns();
        
        // Update toggle button text
        this.updateToggleButtonText();
        
        // Update drag & drop system
        this.updateDragDropSystem();
    }

    updateDragDropSystem() {
        if (window.dragDropPanelManager) {
            window.dragDropPanelManager.updateDropZoneVisibility();
        }
    }

    updateSelectDropdowns() {
        Object.entries(this.panels).forEach(([position, panel]) => {
            const select = document.getElementById(`${position}-panel-select`);
            if (select) {
                select.value = panel.id || '';
            }
        });
    }

    getPanelDisplayName(panelId) {
        const displayNames = {
            'domain-vault-tab-content': 'Domain Vault',
            'effects-features-tab-content': 'Effects & Features',
            'equipment-tab-content': 'Equipment',
            'details-tab-content': 'Details',
            'experiences-tab-content': 'Experiences',
            'journal-tab-content': 'Journal',
            'downtime-tab-content': 'Downtime',
            'characters-tab-content': 'Characters',
            'settings-tab-content': 'Settings'
        };
        
        return displayNames[panelId] || panelId;
    }

    enableMultiPanelMode() {
        document.body.classList.add('multi-panel-active');
        document.body.classList.remove('single-panel-active');
        this.isMultiPanelMode = true;
    }

    enableSinglePanelMode() {
        document.body.classList.add('single-panel-active');
        document.body.classList.remove('multi-panel-active');
        this.isMultiPanelMode = false;
    }

    resetToSinglePanel() {
        // Reset all panels
        Object.keys(this.panels).forEach(position => {
            this.panels[position].id = null;
            this.panels[position].content = null;
        });
        
        // Reset dropdowns
        document.querySelectorAll('.panel-select').forEach(select => {
            select.value = '';
        });
        
        // Show original downtime tab as active
        const downtimeTab = document.querySelector('nav.tabs button[data-target="downtime-tab-content"]');
        if (downtimeTab) {
            document.querySelectorAll('nav.tabs button').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
            
            downtimeTab.classList.add('active');
            document.getElementById('downtime-tab-content').classList.add('active');
        }
        
        this.updateLayout();
        this.savePanelState();
    }

    togglePanelMode() {
        if (this.isMultiPanelMode) {
            // Switch to single panel mode
            this.resetToSinglePanel();
        } else {
            // Switch to multi-panel mode with current active tab in center
            const activeTab = document.querySelector('nav.tabs button.active');
            if (activeTab) {
                const targetPanelId = activeTab.dataset.target;
                this.setPanel('center', targetPanelId);
            } else {
                // Default to downtime if no active tab
                this.setPanel('center', 'downtime-tab-content');
            }
        }
        
        // Update button text
        this.updateToggleButtonText();
    }

    updateToggleButtonText() {
        const toggleBtn = document.getElementById('toggle-panel-mode-btn');
        if (toggleBtn) {
            toggleBtn.textContent = this.isMultiPanelMode ? 'Switch to Single Panel' : 'Switch to Multi-Panel';
        }
    }

    initializePanelContent(panelId) {
        // Initialize specific panel content based on the panel type
        switch (panelId) {
            case 'downtime-tab-content':
                if (window.resetDowntimeView && typeof window.resetDowntimeView === 'function') {
                    window.resetDowntimeView();
                }
                break;
            case 'equipment-tab-content':
                if (window.initializeEquipment && typeof window.initializeEquipment === 'function') {
                    window.initializeEquipment();
                }
                break;
            case 'journal-tab-content':
                if (window.renderJournalEntries && typeof window.renderJournalEntries === 'function') {
                    window.renderJournalEntries();
                }
                break;
            case 'experiences-tab-content':
                if (window.renderExperiences && typeof window.renderExperiences === 'function') {
                    window.renderExperiences();
                }
                break;
            case 'domain-vault-tab-content':
                if (window.initializeDomainVault && typeof window.initializeDomainVault === 'function') {
                    window.initializeDomainVault();
                }
                break;
            case 'effects-features-tab-content':
                if (window.initializeEffectsFeatures && typeof window.initializeEffectsFeatures === 'function') {
                    window.initializeEffectsFeatures();
                }
                break;
            case 'characters-tab-content':
                if (window.charactersPageManager && typeof window.charactersPageManager.refreshCharactersList === 'function') {
                    window.charactersPageManager.refreshCharactersList();
                }
                break;
        }
    }

    savePanelState() {
        const state = {
            panels: this.panels,
            isMultiPanelMode: this.isMultiPanelMode
        };
        localStorage.setItem('zevi-multi-panel-state', JSON.stringify(state));
    }

    loadPanelState() {
        const savedState = localStorage.getItem('zevi-multi-panel-state');
        if (savedState) {
            try {
                const state = JSON.parse(savedState);
                this.panels = state.panels || this.panels;
                this.isMultiPanelMode = state.isMultiPanelMode || false;
            } catch (error) {
                console.error('Error loading multi-panel state:', error);
                this.setDefaultState();
            }
        } else {
            this.setDefaultState();
        }
    }

    setDefaultState() {
        // Set default state with downtime in center panel
        this.panels = {
            left: { id: null, content: null },
            center: { id: 'downtime-tab-content', content: null },
            right: { id: null, content: null }
        };
        this.isMultiPanelMode = true;
    }

    // Public method to check if we're in multi-panel mode
    isInMultiPanelMode() {
        return this.isMultiPanelMode;
    }

    // Public method to get current panel configuration
    getCurrentPanels() {
        return { ...this.panels };
    }
}

// Initialize the multi-panel manager when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.multiPanelManager = new MultiPanelManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MultiPanelManager;
}