/**
 * LocalStorage Cleanup Utility
 * Manages the distinction between global app preferences and character-specific data
 */
class LocalStorageCleanup {
    
    // Keys that should remain in localStorage (global app preferences)
    static GLOBAL_KEYS = [
        'zevi-auth-token',
        'zevi-current-user', 
        'zevi-current-character-id',
        'zevi-theme',
        // Legacy/import-export features (can be global)
        'zevi-character-code',
        'zevi-character-data-snapshot'
    ];
    
    // Keys that are now character-specific and handled by cloud storage
    static CHARACTER_SPECIFIC_KEYS = [
        'zevi-hope',
        'zevi-max-hope',
        'zevi-stress-circles',
        'zevi-stress-current',
        'zevi-hp-circles', 
        'zevi-hp-current',
        'zevi-armor-circles',
        'zevi-active-armor-count',
        'zevi-total-armor-circles',
        'zevi-minor-damage-value',
        'zevi-major-damage-value',
        'zevi-equipment',
        'zevi-journal-entries',
        'zevi-character-details',
        'zevi-experiences',
        'zevi-projects',
        'zevi-domain-vault',
        'zevi-domain-cards',
        'zevi-selected-domains',
        'zevi-domain-abilities',
        'zevi-effects-features',
        'zevi-active-effects',
        'zevi-features',
        'zevi-conditions',
        'zevi-section-order',
        'zevi-backpack-enabled',
        'zevi-character-name-font-size',
        'zevi-background-image',
        'zevi-accent-color',
        'zevi-custom-accent-base',
        'zevi-custom-accent-light',
        'zevi-custom-accent-dark',
        'zevi-glass-color',
        'zevi-glass-opacity',
        'zevi-glassmorphic-tint'
    ];
    
    // Clean up character-specific data from localStorage
    static cleanupCharacterData() {
        console.log('🧹 Cleaning up character-specific data from localStorage...');
        
        let cleanedCount = 0;
        
        // Remove all character-specific keys
        LocalStorageCleanup.CHARACTER_SPECIFIC_KEYS.forEach(key => {
            if (localStorage.getItem(key)) {
                localStorage.removeItem(key);
                cleanedCount++;
                console.log(`Removed: ${key}`);
            }
        });
        
        // Also remove character-ID-specific keys
        const allKeys = Object.keys(localStorage);
        allKeys.forEach(key => {
            // Remove character-specific keys with ID suffixes
            if (LocalStorageCleanup.CHARACTER_SPECIFIC_KEYS.some(baseKey => 
                key.startsWith(baseKey + '-') && /\d+$/.test(key))) {
                localStorage.removeItem(key);
                cleanedCount++;
                console.log(`Removed character-specific: ${key}`);
            }
        });
        
        console.log(`✅ Cleaned up ${cleanedCount} localStorage items`);
        return cleanedCount;
    }
    
    // Show localStorage analysis
    static analyzeLocalStorage() {
        const allKeys = Object.keys(localStorage);
        const global = [];
        const characterSpecific = [];
        const unknown = [];
        
        allKeys.forEach(key => {
            if (LocalStorageCleanup.GLOBAL_KEYS.includes(key)) {
                global.push(key);
            } else if (LocalStorageCleanup.CHARACTER_SPECIFIC_KEYS.some(baseKey => 
                key === baseKey || key.startsWith(baseKey + '-'))) {
                characterSpecific.push(key);
            } else {
                unknown.push(key);
            }
        });
        
        console.log('📊 localStorage Analysis:');
        console.log('Global keys (keeping):', global);
        console.log('Character-specific keys (should remove):', characterSpecific);
        console.log('Unknown keys:', unknown);
        
        return { global, characterSpecific, unknown };
    }
    
    // Migrate to cloud-first mode
    static async migrateToCloudFirst() {
        console.log('☁️ Migrating to cloud-first mode...');
        
        // First analyze what we have
        const analysis = LocalStorageCleanup.analyzeLocalStorage();
        
        // If there's character data, we could optionally save it to cloud first
        if (analysis.characterSpecific.length > 0) {
            console.log('Found character data in localStorage. Consider saving current character before cleanup.');
            
            // Trigger a save if we have a current character
            if (window.app?.autoSave?.triggerSave) {
                console.log('Triggering final save before cleanup...');
                window.app.autoSave.triggerSave();
                
                // Wait a moment for the save to complete
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }
        
        // Clean up character data
        const cleanedCount = LocalStorageCleanup.cleanupCharacterData();
        
        console.log('🎉 Migration to cloud-first mode complete!');
        console.log(`Kept ${analysis.global.length} global preferences, removed ${cleanedCount} character-specific items`);
        
        return cleanedCount;
    }
}

// Make it globally available
window.LocalStorageCleanup = LocalStorageCleanup;

export default LocalStorageCleanup;