/**
 * Main Application Controller
 * Coordinates all modules and manages application state
 */
class AppController {
    constructor() {
        this.characterData = null;
        this.uiManager = null;
        this.autoSave = null;
        this.initialized = false;
        this.autoSaveInterval = null;
    }

    // Initialize the application
    async initialize() {
        if (this.initialized) {
            console.log('App already initialized');
            return;
        }

        console.log('=== INITIALIZING APPLICATION ===');

        try {
            // Clean up all old character storage first
            this.cleanupOldCharacterStorage();

            // Initialize core modules
            this.characterData = new CharacterData();
            this.uiManager = new UIManager();
            this.autoSave = new AutoSave(this.characterData, this.uiManager);

            // Set up relationships
            this.uiManager.setCharacterData(this.characterData);

            // Initialize cloud mode if logged in
            this.characterData.initializeCloudMode();

            // Set up event listeners
            this.setupEventListeners();

            // Remove any old save buttons that might exist
            this.removeOldSaveButtons();

            // Set up periodic button removal (in case other scripts create them)
            setInterval(() => {
                this.removeOldSaveButtons();
            }, 5000); // Check every 5 seconds

            // Start auto-save system
            this.startAutoSave();

            // Load current/active character if one exists
            await this.loadCurrentCharacter();

            // Mark as initialized
            this.initialized = true;
            console.log('✅ Application initialized successfully');

        } catch (error) {
            console.error('❌ Failed to initialize application:', error);
            throw error;
        }
    }

    // Start the auto-save system
    startAutoSave() {
        console.log('🔄 Starting auto-save system');
        
        // Clear any existing interval
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
        
        // Set up auto-save every 10 seconds
        this.autoSaveInterval = setInterval(() => {
            this.performAutoSave();
        }, 10000);
        
        // Also set up event-based auto-save triggers
        this.setupAutoSaveTriggers();
    }

    // Stop the auto-save system
    stopAutoSave() {
        console.log('⏸️ Stopping auto-save system');
        
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }

    // Set up auto-save triggers for various events
    setupAutoSaveTriggers() {
        // Auto-save on form input changes (debounced)
        let autoSaveTimeout = null;
        
        const triggerDebounced = () => {
            if (autoSaveTimeout) {
                clearTimeout(autoSaveTimeout);
            }
            autoSaveTimeout = setTimeout(() => {
                this.characterData.triggerAutoSave();
            }, 2000);
        };
        
        // Listen for various events that should trigger auto-save
        document.addEventListener('input', (e) => {
            if (e.target.matches('.character-name-editor, .subtitle, .domain-badge, #charLevel, .attribute-value, #evasionValue')) {
                triggerDebounced();
            }
        });
        
        document.addEventListener('click', (e) => {
            if (e.target.matches('.tracker-btn, .damage-btn, .hp-circle, .stress-circle, .armor-circle')) {
                triggerDebounced();
            }
        });
        
        // Auto-save on tab switching
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-target]')) {
                setTimeout(() => {
                    this.characterData.triggerAutoSave();
                }, 1000);
            }
        });
    }

    // Perform auto-save
    async performAutoSave() {
        const currentCharacterId = this.characterData.getCurrentCharacterId();
        if (!currentCharacterId) {
            console.log('No current character for auto-save');
            return;
        }
        
        if (!this.characterData.isCloudMode) {
            console.log('Not in cloud mode, skipping auto-save');
            return;
        }
        
        try {
            console.log('🔄 Performing auto-save for character:', currentCharacterId);
            
            const characterData = this.characterData.collectCurrentCharacterData();
            await this.characterData.saveCharacterData(currentCharacterId, characterData, 'auto');
            
            console.log('✅ Auto-save completed successfully');
            
            // Update save indicator if available
            if (window.characterManager) {
                window.characterManager.updateStatus('Auto-saved', '💾', 'success');
            }
            
        } catch (error) {
            console.error('❌ Auto-save failed:', error);
            
            // Update save indicator if available
            if (window.characterManager) {
                window.characterManager.updateStatus('Auto-save failed', '❌', 'error');
            }
        }
    }

    // Load current character (either from cloud or localStorage)
    async loadCurrentCharacter() {
        console.log('📂 Loading current character...');
        
        try {
            // If in cloud mode, try to load active character
            if (this.characterData.isCloudMode) {
                console.log('Cloud mode: Loading active character');
                const character = await this.characterData.loadActiveCharacter();
                
                if (character) {
                    console.log('✅ Loaded active character from cloud:', character.name || character.id);
                    return;
                }
                
                console.log('No active character found in cloud');
            }
            
            // Try to load from localStorage as fallback
            const localCharacterId = this.characterData.getCurrentCharacterId();
            if (localCharacterId) {
                console.log('Loading character from localStorage:', localCharacterId);
                const savedData = this.getStoredCharacterData(localCharacterId);
                if (savedData) {
                    await this.characterData.loadCharacterData(savedData, localCharacterId);
                    console.log('✅ Loaded character from localStorage');
                    return;
                }
            }
            
            console.log('No current character found, using defaults');
            
        } catch (error) {
            console.error('❌ Failed to load current character:', error);
            console.log('Continuing with default character state');
        }
    }

    // Switch to a different character
    async switchToCharacter(characterId) {
        console.log('🔄 Switching to character:', characterId);
        
        try {
            // Save current character first
            const currentCharacterId = this.characterData.getCurrentCharacterId();
            if (currentCharacterId && currentCharacterId !== characterId) {
                console.log('Saving current character before switching');
                const currentData = this.characterData.collectCurrentCharacterData();
                await this.characterData.saveCharacterData(currentCharacterId, currentData, 'manual');
            }
            
            // Load the new character
            if (this.characterData.isCloudMode) {
                await this.characterData.loadCloudCharacter(characterId);
            } else {
                const savedData = this.getStoredCharacterData(characterId);
                if (savedData) {
                    await this.characterData.loadCharacterData(savedData, characterId);
                } else {
                    throw new Error('Character not found in localStorage');
                }
            }
            
            console.log('✅ Successfully switched to character:', characterId);
            
        } catch (error) {
            console.error('❌ Failed to switch character:', error);
            throw error;
        }
    }

    // Collect all current character data
    collectCharacterData() {
        return this.characterData.collectCurrentCharacterData();
    }

    // Load character from data
    async loadCharacterFromData(characterData) {
        console.log('📂 Loading character from provided data');
        
        if (!characterData) {
            console.log('No character data provided, using defaults');
            characterData = this.characterData.createDefaultState();
        }
        
        try {
            // Apply the character data to the UI
            this.applyCharacterDataToUI(characterData);
            console.log('✅ Character data applied to UI successfully');
            
        } catch (error) {
            console.error('❌ Failed to apply character data to UI:', error);
            throw error;
        }
    }

    // Apply character data to the UI
    applyCharacterDataToUI(data) {
        // Basic info
        this.setUIValue('.character-name-editor', data.name || 'New Character', 'textContent');
        this.setUIValue('#charLevel', data.level || 5, 'textContent');
        this.setUIValue('.subtitle', data.subtitle || 'Community Ancestry Class (Subclass)', 'textContent');
        
        // Domains
        const domainElements = document.querySelectorAll('.name-box .domain-badge');
        if (domainElements[0]) domainElements[0].textContent = data.domain1 || 'Domain 1';
        if (domainElements[1]) domainElements[1].textContent = data.domain2 || 'Domain 2';
        
        // Character image
        if (data.imageUrl) {
            const img = document.getElementById('charImage');
            if (img) {
                img.src = data.imageUrl;
                img.style.display = 'block';
            }
        }
        
        // Attributes
        if (data.attributes) {
            Object.entries(data.attributes).forEach(([attr, value]) => {
                this.setUIValue(`#${attr}`, value, 'textContent');
                const input = document.querySelector(`[data-attribute="${attr}"]`);
                if (input) input.value = value;
            });
        }
        
        // Combat stats
        if (data.evasion !== undefined) {
            this.setUIValue('#evasionValue', data.evasion, 'value');
        }
        
        if (data.damage) {
            this.setUIValue('#minorDamageValue', data.damage.minor || 1, 'textContent');
            this.setUIValue('#majorDamageValue', data.damage.major || 2, 'textContent');
        }
        
        // Store complex data in localStorage for other modules to use
        this.storeComplexDataInLocalStorage(data);
        
        // Apply appearance settings if they exist
        if (data.appearanceSettings) {
            this.characterData.applyAppearanceSettings(data.appearanceSettings);
        }
        
        console.log('Character data applied to UI');
    }

    // Store complex data structures in localStorage for other modules
    storeComplexDataInLocalStorage(data) {
        const currentCharacterId = this.characterData.getCurrentCharacterId();
        
        // Character-specific data that should be unique per character
        const characterSpecificData = {
            'zevi-hope': data.hope,
            'zevi-stress-circles': data.stress?.circles,
            'zevi-stress-current': data.stress?.current,
            'zevi-hp-circles': data.hp?.circles,
            'zevi-hp-current': data.hp?.current,
            'zevi-armor-circles': data.armor?.circles,
            'zevi-armor-current': data.armor?.current,
            'zevi-active-armor-count': data.armor?.activeCount,
            'zevi-total-armor-circles': data.armor?.totalCircles,
            'zevi-equipment': data.equipment,
            'zevi-journal-entries': data.journal?.entries,
            'zevi-character-details': data.details,
            'zevi-experiences': data.experiences,
            'zevi-projects': data.downtime?.projects,
            'zevi-domain-cards': data.domainVault?.domainCards,
            'zevi-selected-domains': data.domainVault?.selectedDomains,
            'zevi-domain-abilities': data.domainVault?.domainAbilities,
            'zevi-active-effects': data.effectsFeatures?.activeEffects,
            'zevi-features': data.effectsFeatures?.features,
            'zevi-conditions': data.effectsFeatures?.conditions
        };
        
        // Global data that should persist across characters
        const globalData = {
            'zevi-section-order': data.ui?.sectionOrder
        };
        
        // Store character-specific data with character ID prefix
        if (currentCharacterId) {
            Object.entries(characterSpecificData).forEach(([key, value]) => {
                if (value !== undefined) {
                    try {
                        const characterKey = `${key}-${currentCharacterId}`;
                        localStorage.setItem(characterKey, typeof value === 'string' ? value : JSON.stringify(value));
                    } catch (error) {
                        console.warn(`Failed to store character-specific ${key}:`, error);
                    }
                }
            });
        }
        
        // Store global data without character ID
        Object.entries(globalData).forEach(([key, value]) => {
            if (value !== undefined) {
                try {
                    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
                } catch (error) {
                    console.warn(`Failed to store global ${key}:`, error);
                }
            }
        });
    }

    // Utility method to set UI values
    setUIValue(selector, value, property = 'textContent') {
        const element = document.querySelector(selector);
        if (element) {
            element[property] = value;
        }
    }

    // Legacy method for localStorage character data
    getStoredCharacterData(characterId) {
        const saveKey = `zevi-character-file-${characterId}`;
        const savedData = localStorage.getItem(saveKey);
        
        if (savedData) {
            try {
                return JSON.parse(savedData);
            } catch (error) {
                console.error('Failed to parse character data:', error);
                return this.characterData.createDefaultState();
            }
        }
        
        return this.characterData.createDefaultState();
    }

    // Set up event listeners
    setupEventListeners() {
        // Remove any existing event listeners first
        this.removeEventListeners();

        // Set up new event listeners
        console.log('Setting up event listeners');

        // Handle logout events
        document.addEventListener('click', (e) => {
            if (e.target.id === 'logoutBtn') {
                this.handleLogout();
            }
        });

        // Handle auth state changes
        window.addEventListener('zeviAuth:login', () => {
            this.handleLogin();
        });

        // Character sheet interactions for auto-save
        this.setupAutoSaveTriggers();
    }

    // Handle user login
    async handleLogin() {
        console.log('🔐 User logged in, initializing cloud mode');
        
        try {
            // Initialize cloud mode
            this.characterData.initializeCloudMode();
            
            // Try to load active character
            await this.loadCurrentCharacter();
            
            console.log('✅ Cloud mode initialized after login');
            
        } catch (error) {
            console.error('❌ Failed to initialize cloud mode after login:', error);
        }
    }

    // Handle user logout
    handleLogout() {
        console.log('🚪 User logged out, switching to local mode');
        
        // Stop auto-save
        this.stopAutoSave();
        
        // Clear cloud mode
        this.characterData.isCloudMode = false;
        
        // Clear current character
        this.characterData.setCurrentCharacterId(null);
        
        // Clear character data from localStorage
        this.characterData.clearAllCharacterData();
        
        console.log('✅ Switched to local mode after logout');
    }

    // Remove event listeners
    removeEventListeners() {
        // This is a simplified version - in a real app you'd track and remove specific listeners
        console.log('Removing old event listeners');
    }

    // Clean up old character storage
    cleanupOldCharacterStorage() {
        console.log('🧹 Cleaning up old character storage');
        
        // Remove legacy save buttons and old character data if needed
        const legacyKeys = Object.keys(localStorage).filter(key => 
            key.includes('zevi-save-') || 
            key.includes('old-character-') ||
            key.includes('backup-character-')
        );
        
        legacyKeys.forEach(key => {
            localStorage.removeItem(key);
        });
        
        console.log(`Cleaned up ${legacyKeys.length} legacy storage items`);
    }

    // Remove old save buttons
    removeOldSaveButtons() {
        const oldSaveButtons = document.querySelectorAll('[onclick*="saveCharacter"], .save-btn:not(.cm-btn), button[title*="Save Character"]:not(.cm-btn)');
        oldSaveButtons.forEach(btn => {
            if (!btn.classList.contains('cm-btn') && !btn.closest('.character-management-container')) {
                console.log('Removing old save button:', btn);
                btn.remove();
            }
        });
    }

    // Get version info
    getVersion() {
        return {
            app: '4.0',
            characterData: this.characterData?.version || '4.0',
            cloudMode: this.characterData?.isCloudMode || false
        };
    }
}

// Create global app instance and make it available
window.app = new AppController();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('🚀 DOM loaded, initializing application...');
        await window.app.initialize();
        console.log('✅ Application ready');
    } catch (error) {
        console.error('❌ Failed to initialize application:', error);
    }
});

// Export for use in other modules
window.AppController = AppController;