/**
 * AutoSave Module
 * Handles automatic saving of character data
 */
class AutoSave {
    constructor(characterData, uiManager) {
        this.characterData = characterData;
        this.uiManager = uiManager;
        this.saveInterval = null;
        this.saveIntervalMs = 10000; // Save every 10 seconds
        this.isEnabled = true;
        this.triggerSaveTimeout = null;
        this.triggerSaveDelay = 2000; // Debounce delay for triggered saves (2 seconds)
    }

    // Start autosave
    start() {
        if (this.saveInterval) {
            this.stop();
        }
        
        console.log('AutoSave started - saving every', this.saveIntervalMs / 1000, 'seconds');
        
        this.saveInterval = setInterval(() => {
            this.performAutoSave();
        }, this.saveIntervalMs);
    }

    // Stop autosave
    stop() {
        if (this.saveInterval) {
            clearInterval(this.saveInterval);
            this.saveInterval = null;
            console.log('AutoSave stopped');
        }
    }

    // Enable/disable autosave
    setEnabled(enabled) {
        this.isEnabled = enabled;
        if (enabled && !this.saveInterval) {
            this.start();
        } else if (!enabled && this.saveInterval) {
            this.stop();
        }
    }

    // Perform automatic save
    async performAutoSave() {
        if (!this.isEnabled) return;
        
        const currentCharacterId = this.characterData.getCurrentCharacterId();
        if (!currentCharacterId) {
            console.log('AutoSave: No current character to save');
            return;
        }

        try {
            console.log('AutoSave: Saving character', currentCharacterId);
            
            // Collect current character data from UI and localStorage
            const characterData = this.collectCurrentCharacterData();
            
            // Save the data
            const success = await this.characterData.saveCharacterData(currentCharacterId, characterData);
            
            if (success) {
                console.log('AutoSave: Character saved successfully');
                this.uiManager.showStatus('Auto-saved', 'success');
            } else {
                console.error('AutoSave: Save failed');
                this.uiManager.showStatus('Auto-save failed', 'error');
            }
            
        } catch (error) {
            console.error('AutoSave: Error during save:', error);
            this.uiManager.showStatus('Auto-save error', 'error');
        }
    }

    // Trigger an immediate save with debouncing
    triggerSave() {
        if (!this.isEnabled) return;
        
        console.log('AutoSave: Triggered save requested');
        
        // Clear any existing timeout
        if (this.triggerSaveTimeout) {
            clearTimeout(this.triggerSaveTimeout);
        }
        
        // Set a new timeout with debouncing
        this.triggerSaveTimeout = setTimeout(() => {
            this.performAutoSave();
            this.triggerSaveTimeout = null;
        }, this.triggerSaveDelay);
    }

    // Collect current character data from UI and localStorage
    collectCurrentCharacterData() {
        const data = {
            // Basic info from UI
            name: window.characterNameEditor ? window.characterNameEditor.getValue() : (this.uiManager.getUIValue('.character-name-editor', 'textContent') || 'New Character'),
            level: parseInt(this.uiManager.getUIValue('#charLevel', 'textContent')) || 5,
            subtitle: this.uiManager.getUIValue('.subtitle', 'textContent') || 'Community Ancestry Class (Subclass)',
            
            // Domains from UI
            domain1: document.querySelectorAll('.name-box .domain-badge')[0]?.textContent || 'Domain 1',
            domain2: document.querySelectorAll('.name-box .domain-badge')[1]?.textContent || 'Domain 2',
            
            // Character image
            imageUrl: this.getCurrentImageUrl(),
            
            // Ability scores from UI
            attributes: {
                agility: parseInt(this.uiManager.getUIValue('#agility', 'textContent')) || 0,
                strength: parseInt(this.uiManager.getUIValue('#strength', 'textContent')) || 0,
                finesse: parseInt(this.uiManager.getUIValue('#finesse', 'textContent')) || 0,
                instinct: parseInt(this.uiManager.getUIValue('#instinct', 'textContent')) || 0,
                presence: parseInt(this.uiManager.getUIValue('#presence', 'textContent')) || 0,
                knowledge: parseInt(this.uiManager.getUIValue('#knowledge', 'textContent')) || 0
            },
            
            // Combat stats from UI
            evasion: parseInt(this.uiManager.getUIValue('#evasionValue')) || 10,
            damage: {
                minor: parseInt(this.uiManager.getUIValue('#minorDamageValue')) || 1,
                major: parseInt(this.uiManager.getUIValue('#majorDamageValue')) || 2
            },
            
            // Data from localStorage
            hope: this.parseJSON(localStorage.getItem('zevi-hope')) || { current: 0, max: 6 },
            stress: { 
                circles: this.parseJSON(localStorage.getItem('zevi-stress-circles')) || Array(4).fill({ active: false }),
                current: parseInt(localStorage.getItem('zevi-stress-current')) || 0,
                max: 4
            },
            hp: { 
                circles: this.parseJSON(localStorage.getItem('zevi-hp-circles')) || Array(4).fill({ active: true }),
                current: parseInt(localStorage.getItem('zevi-hp-current')) || 4,
                max: 4
            },
            armor: {
                circles: this.parseJSON(localStorage.getItem('zevi-armor-circles')) || Array(4).fill({ active: false }),
                current: parseInt(localStorage.getItem('zevi-armor-current')) || 0,
                max: 4,
                activeCount: parseInt(localStorage.getItem('zevi-active-armor-count')) || 0,
                totalCircles: parseInt(localStorage.getItem('zevi-total-armor-circles')) || 4
            },
            
            // Complex data from localStorage
            equipment: this.parseJSON(localStorage.getItem('zevi-equipment')) || {
                selectedBag: 'Standard Backpack',
                backpackType: 'Standard Backpack',
                backpackEnabled: true,
                items: [],
                activeWeapons: [],
                activeArmor: [],
                gold: 0,
                equipped: {}
            },
            journal: { entries: this.parseJSON(localStorage.getItem('zevi-journal-entries')) || [] },
            details: this.parseJSON(localStorage.getItem('zevi-character-details')) || { personal: {}, physical: {} },
            experiences: this.parseJSON(localStorage.getItem('zevi-experiences')) || [],
            downtime: { projects: this.parseJSON(localStorage.getItem('zevi-projects')) || [] },
            
            // Game systems
            domainVault: {
                domainCards: this.parseJSON(localStorage.getItem('zevi-domain-cards')) || [],
                selectedDomains: this.parseJSON(localStorage.getItem('zevi-selected-domains')) || [],
                domainAbilities: this.parseJSON(localStorage.getItem('zevi-domain-abilities')) || {}
            },
            effectsFeatures: {
                activeEffects: this.parseJSON(localStorage.getItem('zevi-active-effects')) || [],
                features: this.parseJSON(localStorage.getItem('zevi-features')) || [],
                conditions: this.parseJSON(localStorage.getItem('zevi-conditions')) || []
            },
            
            // UI state
            ui: {
                sectionOrder: localStorage.getItem('zevi-section-order'),
                activeTab: this.getActiveTab(),
                colors: {}
            },
            
            // Metadata
            lastModified: new Date().toISOString(),
            version: '4.0'
        };
        
        return data;
    }

    // Get current character image URL
    getCurrentImageUrl() {
        const img = document.getElementById('charImage');
        if (img && img.src && !img.src.includes('placeholder') && img.style.display !== 'none') {
            return img.src;
        }
        return '';
    }

    // Get currently active tab
    getActiveTab() {
        const activeTab = document.querySelector('.tab-panel.active');
        return activeTab ? activeTab.id : 'downtime-tab-content';
    }

    // Safely parse JSON
    parseJSON(str) {
        if (!str) return null;
        try {
            return JSON.parse(str);
        } catch (e) {
            console.error('Error parsing JSON:', e);
            return null;
        }
    }

    // Manual save trigger (for keyboard shortcuts, etc.)
    async triggerManualSave() {
        console.log('Manual save triggered');
        await this.performAutoSave();
    }
}

// Export for use in other modules
window.AutoSave = AutoSave;