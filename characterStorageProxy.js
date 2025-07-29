/**
 * Character Storage Proxy System
 * Automatically handles character-specific localStorage isolation
 * This ensures ALL character data is properly isolated between characters
 */

class CharacterStorageProxy {
    constructor() {
        this.globalKeys = new Set([
            // Theme and UI settings that should be global
            'zevi-text-color',
            'zevi-accent-color', 
            'zevi-theme',
            'zevi-custom-accent-light',
            'zevi-custom-accent-dark',
            'zevi-custom-accent-base',
            'zevi-glass-color',
            'zevi-glass-opacity',
            'zevi-backpack-enabled',
            
            // Character management keys that should be global
            'zevi-characters',
            'zevi-current-character-id',
            'zevi-redirect-guard'
        ]);
        
        this.characterKeys = new Set([
            // Core character data
            'zevi-equipment',
            'zevi-journal',
            'zevi-journal-entries',
            'zevi-experiences',
            'zevi-hope',
            'zevi-max-hope',
            'zevi-downtime',
            'zevi-projects',
            'zevi-character-details',
            'zevi-character-code',
            'zevi-character-data-snapshot',
            
            // HP/Stress/Combat data
            'zevi-hp-circles',
            'zevi-stress-circles',
            'zevi-armor-circles',
            'zevi-minor-damage-value',
            'zevi-major-damage-value',
            'zevi-active-armor-count',
            'zevi-total-armor-circles',
            'zevi-evasion',
            
            // UI customization per character
            'zevi-section-order',
            'zevi-color-main-glass',
            'zevi-color-char-image-border',
            'zevi-color-name-box',
            'zevi-color-ability-scores',
            'zevi-color-hp-stress',
            'zevi-color-active-weapons',
            'zevi-color-armor-section',
            'zevi-color-hope-section',
            'zevi-color-experiences-section'
        ]);
        
        this.originalLocalStorage = {
            setItem: localStorage.setItem.bind(localStorage),
            getItem: localStorage.getItem.bind(localStorage),
            removeItem: localStorage.removeItem.bind(localStorage)
        };
        
        this.isProxyActive = false;
    }
    
    // Get the current character ID
    getCurrentCharacterId() {
        return this.originalLocalStorage.getItem('zevi-current-character-id');
    }
    
    // Check if a key should be character-specific
    isCharacterSpecificKey(key) {
        // Handle dynamic damage keys
        if (key.match(/^zevi-(minor|major)-damage-value$/)) {
            return true;
        }
        
        // Handle dynamic color keys
        if (key.startsWith('zevi-color-')) {
            return true;
        }
        
        return this.characterKeys.has(key);
    }
    
    // Get the character-specific key
    getCharacterSpecificKey(key) {
        const characterId = this.getCurrentCharacterId();
        if (!characterId) {
            console.warn(`No current character ID for key: ${key}`);
            return key; // Fallback to original key
        }
        return `${key}-${characterId}`;
    }
    
    // Proxied setItem
    setItem(key, value) {
        if (!this.isProxyActive) {
            return this.originalLocalStorage.setItem(key, value);
        }
        
        if (this.isCharacterSpecificKey(key)) {
            const characterSpecificKey = this.getCharacterSpecificKey(key);
            console.log(`PROXY: Redirecting ${key} -> ${characterSpecificKey}`);
            return this.originalLocalStorage.setItem(characterSpecificKey, value);
        }
        
        return this.originalLocalStorage.setItem(key, value);
    }
    
    // Proxied getItem
    getItem(key) {
        if (!this.isProxyActive) {
            return this.originalLocalStorage.getItem(key);
        }
        
        if (this.isCharacterSpecificKey(key)) {
            const characterSpecificKey = this.getCharacterSpecificKey(key);
            const value = this.originalLocalStorage.getItem(characterSpecificKey);
            console.log(`PROXY: Getting ${key} from ${characterSpecificKey}: ${value ? 'found' : 'not found'}`);
            return value;
        }
        
        return this.originalLocalStorage.getItem(key);
    }
    
    // Proxied removeItem
    removeItem(key) {
        if (!this.isProxyActive) {
            return this.originalLocalStorage.removeItem(key);
        }
        
        if (this.isCharacterSpecificKey(key)) {
            const characterSpecificKey = this.getCharacterSpecificKey(key);
            console.log(`PROXY: Removing ${key} from ${characterSpecificKey}`);
            return this.originalLocalStorage.removeItem(characterSpecificKey);
        }
        
        return this.originalLocalStorage.removeItem(key);
    }
    
    // Activate the proxy system
    activate() {
        if (this.isProxyActive) return;
        
        console.log('=== ACTIVATING CHARACTER STORAGE PROXY ===');
        
        // Override localStorage methods
        localStorage.setItem = this.setItem.bind(this);
        localStorage.getItem = this.getItem.bind(this);
        localStorage.removeItem = this.removeItem.bind(this);
        
        this.isProxyActive = true;
        console.log('Character storage proxy activated');
    }
    
    // Deactivate the proxy system
    deactivate() {
        if (!this.isProxyActive) return;
        
        console.log('=== DEACTIVATING CHARACTER STORAGE PROXY ===');
        
        // Restore original localStorage methods
        localStorage.setItem = this.originalLocalStorage.setItem;
        localStorage.getItem = this.originalLocalStorage.getItem;
        localStorage.removeItem = this.originalLocalStorage.removeItem;
        
        this.isProxyActive = false;
        console.log('Character storage proxy deactivated');
    }
    
    // Clear all character-specific data for a character
    clearCharacterData(characterId) {
        console.log(`Clearing all data for character: ${characterId}`);
        
        // Get all localStorage keys
        const allKeys = Object.keys(localStorage);
        
        // Find and remove all keys for this character
        allKeys.forEach(key => {
            if (key.endsWith(`-${characterId}`)) {
                console.log(`Removing character-specific key: ${key}`);
                this.originalLocalStorage.removeItem(key);
            }
        });
    }
    
    // Migrate existing data to character-specific storage
    migrateExistingData(characterId) {
        console.log(`Migrating existing data for character: ${characterId}`);
        
        this.characterKeys.forEach(key => {
            const existingValue = this.originalLocalStorage.getItem(key);
            if (existingValue) {
                const characterSpecificKey = `${key}-${characterId}`;
                console.log(`Migrating ${key} -> ${characterSpecificKey}`);
                this.originalLocalStorage.setItem(characterSpecificKey, existingValue);
                // Don't remove the original key yet - let the proxy handle it
            }
        });
    }
    
    // Load character data by switching the current character context
    loadCharacterContext(characterId) {
        console.log(`Loading character context: ${characterId}`);
        
        // Set the current character ID (this affects all subsequent proxy calls)
        this.originalLocalStorage.setItem('zevi-current-character-id', characterId);
        
        // The proxy will now automatically redirect all character-specific calls
        console.log('Character context loaded - proxy will handle all subsequent calls');
    }
    
    // Get debug information
    getDebugInfo() {
        const characterId = this.getCurrentCharacterId();
        const allKeys = Object.keys(localStorage);
        const characterSpecificKeys = allKeys.filter(key => key.endsWith(`-${characterId}`));
        
        return {
            isActive: this.isProxyActive,
            currentCharacterId: characterId,
            globalKeys: Array.from(this.globalKeys),
            characterKeys: Array.from(this.characterKeys),
            characterSpecificKeysInStorage: characterSpecificKeys
        };
    }
}

// Create global instance
window.characterStorageProxy = new CharacterStorageProxy();

// Auto-activate when DOM is ready, but after character manager is available
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for other scripts to load
    setTimeout(() => {
        console.log('Auto-activating character storage proxy...');
        window.characterStorageProxy.activate();
        
        // If there's a current character, ensure proxy is set to their context
        const currentCharacterId = window.characterStorageProxy.getCurrentCharacterId();
        if (currentCharacterId) {
            console.log('Setting proxy context to current character:', currentCharacterId);
            // The proxy is already active, so just log this - the context is already set
        }
    }, 100);
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CharacterStorageProxy;
}