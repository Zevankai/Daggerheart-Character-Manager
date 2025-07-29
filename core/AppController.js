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

            // Start autosave
            this.autoSave.start();

            // Set up event listeners
            this.setupEventListeners();

            // Remove any old save buttons that might exist
            this.removeOldSaveButtons();

            // Set up periodic button removal (in case other scripts create them)
            setInterval(() => {
                this.removeOldSaveButtons();
            }, 5000); // Check every 5 seconds

            // Load current character if one exists
            await this.loadCurrentCharacter();

            this.initialized = true;
            console.log('=== APPLICATION INITIALIZED ===');

        } catch (error) {
            console.error('Failed to initialize application:', error);
        }
    }

    // Clean up all old character storage systems
    cleanupOldCharacterStorage() {
        console.log('=== CLEANING UP OLD CHARACTER STORAGE ===');
        
        const keysToRemove = [];
        
        // Find all old character storage keys
        Object.keys(localStorage).forEach(key => {
            // Old character-specific storage (per-character keys)
            if (key.includes('-char_') || 
                key.includes('-character-') ||
                key.startsWith('zevi-equipment-') ||
                key.startsWith('zevi-journal-') ||
                key.startsWith('zevi-experiences-') ||
                key.startsWith('zevi-hope-') ||
                key.startsWith('zevi-max-hope-') ||
                key.startsWith('zevi-downtime-') ||
                key.startsWith('zevi-projects-') ||
                key.startsWith('zevi-character-details-') ||
                key.startsWith('zevi-hp-') ||
                key.startsWith('zevi-stress-') ||
                key.startsWith('zevi-armor-') ||
                key.startsWith('zevi-minor-damage-') ||
                key.startsWith('zevi-major-damage-') ||
                key.startsWith('zevi-active-armor-') ||
                key.startsWith('zevi-total-armor-') ||
                key.startsWith('zevi-evasion-') ||
                key.startsWith('zevi-hp-stress-state-') ||
                key.startsWith('zevi-active-weapons-armor-')) {
                keysToRemove.push(key);
            }
            
            // Old character directory systems
            if (key === 'zevi-characters' || 
                key === 'zevi-character-directory') {
                keysToRemove.push(key);
            }
        });
        
        // Remove all old keys
        keysToRemove.forEach(key => {
            console.log('Removing old storage key:', key);
            localStorage.removeItem(key);
        });
        
        console.log(`Cleaned up ${keysToRemove.length} old character storage keys`);
        console.log('=== OLD CHARACTER STORAGE CLEANUP COMPLETE ===');
    }

    // Set up global event listeners
    setupEventListeners() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 's') {
                event.preventDefault();
                this.autoSave.triggerManualSave();
            }
        });

        // Image upload handling
        const imageUpload = document.getElementById('charUpload');
        if (imageUpload) {
            imageUpload.addEventListener('change', (event) => {
                this.handleImageUpload(event);
            });
        }

        console.log('Event listeners set up');
    }

    // Remove any old save buttons that might exist
    removeOldSaveButtons() {
        console.log('Removing old save buttons...');
        
        // Remove buttons by ID
        const buttonIds = [
            'simpleSaveBtn',
            'cleanupBtn', 
            'manualSaveBtn',
            'saveBtn'
        ];
        
        buttonIds.forEach(id => {
            const button = document.getElementById(id);
            if (button) {
                console.log('Removing button:', id);
                button.remove();
            }
        });
        
        // Remove buttons by class
        const buttonClasses = [
            'simple-save-btn',
            'cleanup-btn',
            'manual-save-btn'
        ];
        
        buttonClasses.forEach(className => {
            const buttons = document.querySelectorAll(`.${className}`);
            buttons.forEach(button => {
                console.log('Removing button with class:', className);
                button.remove();
            });
        });
        
        // Remove any buttons containing save-related text
        const allButtons = document.querySelectorAll('button');
        allButtons.forEach(button => {
            const text = button.textContent.toLowerCase();
            if (text.includes('💾') || text.includes('save character') || text.includes('free storage') || text.includes('🧹')) {
                console.log('Removing button with save-related text:', button.textContent);
                button.remove();
            }
        });
        
        console.log('Old save buttons removed');
    }

    // Handle character image upload
    async handleImageUpload(event) {
        if (!event.target.files || !event.target.files[0]) {
            console.warn('No file selected for character image upload');
            return;
        }

        console.log('Character image upload started');
        const reader = new FileReader();

        reader.onload = async () => {
            console.log('Image file read successfully');

            const img = document.getElementById("charImage");
            const placeholder = document.getElementById("charPlaceholder");

            if (img) {
                img.src = reader.result;
                img.style.display = 'block';
                console.log('Character image displayed in UI');
            }

            if (placeholder) {
                placeholder.style.display = 'none';
            }

            // Trigger immediate save to capture the image
            this.autoSave.triggerManualSave();
            console.log('Character image saved');

            // Reset the file input
            event.target.value = '';
        };

        reader.readAsDataURL(event.target.files[0]);
    }

    // Load current character
    async loadCurrentCharacter() {
        const currentCharacterId = this.characterData.getCurrentCharacterId();
        
        if (currentCharacterId) {
            console.log('Loading current character:', currentCharacterId);
            await this.switchToCharacter(currentCharacterId);
        } else {
            console.log('No current character, using defaults');
            this.uiManager.clearUIToDefaults();
        }
    }

    // Switch to a specific character
    async switchToCharacter(characterId) {
        console.log('=== SWITCHING TO CHARACTER ===', characterId);

        try {
            // Save current character first (if different)
            const currentId = this.characterData.getCurrentCharacterId();
            if (currentId && currentId !== characterId) {
                console.log('Saving current character before switch:', currentId);
                this.autoSave.triggerManualSave();
            }

            // Set new current character
            this.characterData.setCurrentCharacterId(characterId);

            // Clear localStorage and UI
            this.characterData.clearAllCharacterData();
            this.uiManager.clearUIToDefaults();

            // Load character data
            const characterData = this.characterData.loadCharacterData(characterId);
            console.log('Loaded character data:', characterData);

            // Apply data to UI
            this.uiManager.applyCharacterDataToUI(characterData);

            // Restore localStorage data for systems
            this.restoreLocalStorageData(characterData);

            // Refresh all systems
            setTimeout(() => {
                this.refreshAllSystems();
            }, 500);

            console.log('=== CHARACTER SWITCH COMPLETE ===');

        } catch (error) {
            console.error('Error switching character:', error);
            this.uiManager.showStatus('Error loading character', 'error');
        }
    }

    // Restore localStorage data from character data
    restoreLocalStorageData(data) {
        console.log('Restoring localStorage data...');

        // Restore all localStorage items
        const localStorageMap = {
            'zevi-hope': data.hope?.current || 0,
            'zevi-max-hope': data.hope?.max || 6,
            'zevi-hp-circles': JSON.stringify(data.hp?.circles || Array(4).fill({ active: true })),
            'zevi-stress-circles': JSON.stringify(data.stress?.circles || Array(4).fill({ active: false })),
            'zevi-armor-circles': JSON.stringify(data.armor?.circles || Array(4).fill({ active: false })),
            'zevi-minor-damage-value': data.damage?.minor || 1,
            'zevi-major-damage-value': data.damage?.major || 2,
            'zevi-active-armor-count': data.armor?.activeCount || 0,
            'zevi-total-armor-circles': data.armor?.totalCircles || 4,
            'zevi-evasion': data.evasion || 10,
            'zevi-equipment': JSON.stringify(data.equipment || {}),
            'zevi-journal-entries': JSON.stringify(data.journal?.entries || []),
            'zevi-character-details': JSON.stringify(data.details || {}),
            'zevi-experiences': JSON.stringify(data.experiences || []),
            'zevi-projects': JSON.stringify(data.downtime?.projects || []),
            'zevi-domain-cards': JSON.stringify(data.domainVault?.domainCards || []),
            'zevi-selected-domains': JSON.stringify(data.domainVault?.selectedDomains || []),
            'zevi-domain-abilities': JSON.stringify(data.domainVault?.domainAbilities || {}),
            'zevi-active-effects': JSON.stringify(data.effectsFeatures?.activeEffects || []),
            'zevi-features': JSON.stringify(data.effectsFeatures?.features || []),
            'zevi-conditions': JSON.stringify(data.effectsFeatures?.conditions || [])
        };

        Object.entries(localStorageMap).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                localStorage.setItem(key, value.toString());
            }
        });

        console.log('localStorage data restored');
    }

    // Refresh all game systems
    refreshAllSystems() {
        console.log('Refreshing all game systems...');

        // Refresh circles first
        this.uiManager.refreshCircleDisplays();

        // Refresh other systems
        const systems = [
            'initializeHPStress',
            'initializeHope',
            'initializeEquipment',
            'renderJournalEntries',
            'initializeDetailsTab',
            'renderExperiences'
        ];

        systems.forEach(system => {
            if (window[system] && typeof window[system] === 'function') {
                try {
                    console.log('Refreshing:', system);
                    window[system]();
                } catch (error) {
                    console.error('Error refreshing', system, error);
                }
            }
        });

        console.log('All systems refreshed');
    }

    // Create new character
    async createNewCharacter() {
        console.log('Creating new character...');

        // Generate new character ID
        const newId = 'char_' + Date.now();

        // Create default character data
        const defaultData = this.characterData.createDefaultState();
        defaultData.createdAt = new Date().toISOString();

        // Save the new character
        this.characterData.saveCharacterData(newId, defaultData);

        // Update character directory for compatibility with old character manager
        this.updateCharacterDirectory();

        // Switch to the new character
        await this.switchToCharacter(newId);

        console.log('New character created:', newId);
        return newId;
    }

    // Update character directory (for compatibility with old systems)
    updateCharacterDirectory() {
        const characters = [];
        
        // Get all character files
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('zevi-character-file-')) {
                try {
                    const characterData = JSON.parse(localStorage.getItem(key));
                    const characterId = key.replace('zevi-character-file-', '');
                    
                    characters.push({
                        id: characterId,
                        name: characterData.name || 'Unnamed Character',
                        platform: 'Daggerheart',
                        level: characterData.level || 5,
                        imageUrl: characterData.imageUrl || '',
                        createdAt: characterData.createdAt || new Date().toISOString(),
                        lastModified: characterData.lastModified || new Date().toISOString()
                    });
                } catch (error) {
                    console.error('Error parsing character data for key:', key, error);
                }
            }
        });

        // Save directory for old character manager compatibility
        localStorage.setItem('zevi-characters', JSON.stringify(characters));
        localStorage.setItem('zevi-character-directory', JSON.stringify(characters));
        
        // Update old character manager if it exists
        if (window.characterManager) {
            window.characterManager.characters = characters;
            console.log('Updated character manager with', characters.length, 'characters');
        }
    }

    // Delete character
    deleteCharacter(characterId) {
        console.log('Deleting character:', characterId);
        
        this.characterData.deleteCharacterData(characterId);
        
        // Update character directory
        this.updateCharacterDirectory();
        
        // If this was the current character, clear current state
        if (this.characterData.getCurrentCharacterId() === characterId) {
            this.characterData.setCurrentCharacterId(null);
            this.uiManager.clearUIToDefaults();
            this.characterData.clearAllCharacterData();
        }
        
        console.log('Character deleted:', characterId);
    }

    // Get application status
    getStatus() {
        return {
            initialized: this.initialized,
            currentCharacterId: this.characterData?.getCurrentCharacterId(),
            autoSaveEnabled: this.autoSave?.isEnabled || false
        };
    }
}

// Create global app instance
window.app = new AppController();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.app.initialize();
    }, 1000);
});

// Export for use in other modules
window.AppController = AppController;