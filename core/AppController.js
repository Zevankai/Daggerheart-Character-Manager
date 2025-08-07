/**
 * Simple Application Controller - NO SAVE FUNCTIONALITY
 * Just coordinates basic modules and manages simple application state
 */
class AppController {
    constructor() {
        this.characterData = null;
        this.uiManager = null;
        this.initialized = false;
    }

    // Initialize the application
    async initialize() {
        if (this.initialized) {
            console.log('App already initialized');
            return;
        }

        console.log('=== INITIALIZING SIMPLE APPLICATION ===');

        try {
            // Initialize core modules (simplified)
            this.characterData = new CharacterData();
            this.uiManager = new UIManager();

            this.initialized = true;
            console.log('✅ Application initialized successfully');

            // Make globally available
            window.app = this;

        } catch (error) {
            console.error('❌ Failed to initialize application:', error);
            throw error;
        }
    }

    // Get current character data (no saving)
    getCurrentCharacterData() {
        if (!this.characterData) {
            console.warn('CharacterData not initialized');
            return null;
        }
        return this.characterData.collectAllCharacterData();
    }

    // Set current character ID
    setCurrentCharacterId(id) {
        if (this.characterData) {
            this.characterData.setCurrentCharacterId(id);
        }
    }

    // Get current character ID  
    getCurrentCharacterId() {
        return this.characterData ? this.characterData.getCurrentCharacterId() : null;
    }
}

// Make globally available
if (typeof window !== 'undefined') {
    window.AppController = AppController;
}