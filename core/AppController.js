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

            // Load current character if one exists
            await this.loadCurrentCharacter();

            this.initialized = true;
            console.log('=== APPLICATION INITIALIZED ===');

        } catch (error) {
            console.error('Failed to initialize application:', error);
        }
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

        // Switch to the new character
        await this.switchToCharacter(newId);

        console.log('New character created:', newId);
        return newId;
    }

    // Delete character
    deleteCharacter(characterId) {
        console.log('Deleting character:', characterId);
        
        this.characterData.deleteCharacterData(characterId);
        
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