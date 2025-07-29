/**
 * Universal Character Creation System
 * Provides a single, reliable character creation function that works
 * regardless of which other systems are available or initialized
 */

class UniversalCharacterCreation {
    constructor() {
        this.isReady = true; // Always ready
        console.log('🌟 UniversalCharacterCreation initialized');
    }

    /**
     * Create a new character with maximum reliability
     * This function tries multiple systems in order and always succeeds
     */
    async createCharacter(characterData = {}) {
        console.log('🆕 UniversalCharacterCreation: Starting character creation...', characterData);
        
        const defaultData = {
            name: characterData.name || 'New Character',
            level: characterData.level || '1',
            platform: characterData.platform || 'Daggerheart',
            imageUrl: characterData.imageUrl || ''
        };

        // Try Method 1: Comprehensive Integration System
        try {
            if (window.comprehensiveIntegration && window.comprehensiveIntegration.isInitialized) {
                console.log('📋 Trying comprehensive integration system...');
                const characterId = await window.comprehensiveIntegration.createNewCharacter(defaultData);
                if (characterId) {
                    console.log('✅ Character created with comprehensive system:', characterId);
                    return { success: true, characterId, method: 'comprehensive' };
                }
            }
        } catch (error) {
            console.warn('⚠️ Comprehensive system failed:', error);
        }

        // Try Method 2: Old App System
        try {
            if (window.app && window.app.initialized) {
                console.log('📋 Trying old app system...');
                const characterId = await window.app.createNewCharacter();
                if (characterId) {
                    // Update with provided data
                    const characterData = window.app.characterData.loadCharacterData(characterId);
                    Object.assign(characterData, defaultData);
                    window.app.characterData.saveCharacterData(characterId, characterData);
                    
                    console.log('✅ Character created with old app system:', characterId);
                    return { success: true, characterId, method: 'app' };
                }
            }
        } catch (error) {
            console.warn('⚠️ Old app system failed:', error);
        }

        // Try Method 3: Direct Comprehensive Save System
        try {
            if (window.comprehensiveCharacterSave) {
                console.log('📋 Trying direct comprehensive save system...');
                const characterId = this.generateCharacterId();
                
                // Set as current character
                window.comprehensiveCharacterSave.setCurrentCharacter(characterId);
                
                // Apply character data to UI first
                this.applyCharacterDataToUI(defaultData);
                
                // Save the character
                const success = window.comprehensiveCharacterSave.saveCharacter(characterId);
                if (success) {
                    console.log('✅ Character created with direct comprehensive save:', characterId);
                    return { success: true, characterId, method: 'direct-comprehensive' };
                }
            }
        } catch (error) {
            console.warn('⚠️ Direct comprehensive save failed:', error);
        }

        // Method 4: Basic localStorage Fallback (Always works)
        try {
            console.log('📋 Using basic localStorage fallback...');
            const characterId = this.generateCharacterId();
            
            const characterRecord = {
                id: characterId,
                name: defaultData.name,
                level: defaultData.level,
                platform: defaultData.platform,
                imageUrl: defaultData.imageUrl,
                createdAt: new Date().toISOString(),
                lastModified: new Date().toISOString()
            };

            // Save to characters list
            const characters = JSON.parse(localStorage.getItem('zevi-characters') || '[]');
            characters.push(characterRecord);
            localStorage.setItem('zevi-characters', JSON.stringify(characters));
            
            // Set as current character
            localStorage.setItem('zevi-current-character-id', characterId);
            
            // Apply data to UI
            this.applyCharacterDataToUI(defaultData);
            
            // Try to save with comprehensive system if available
            if (window.comprehensiveCharacterSave) {
                try {
                    window.comprehensiveCharacterSave.setCurrentCharacter(characterId);
                    window.comprehensiveCharacterSave.saveCharacter(characterId);
                } catch (error) {
                    console.warn('Could not save to comprehensive system, but localStorage succeeded');
                }
            }

            console.log('✅ Character created with localStorage fallback:', characterId);
            return { success: true, characterId, method: 'localStorage' };

        } catch (error) {
            console.error('❌ Even localStorage fallback failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Generate a unique character ID
     */
    generateCharacterId() {
        return 'char_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Apply character data to UI elements
     */
    applyCharacterDataToUI(characterData) {
        try {
            // Update name
            const nameInput = document.querySelector('.name-box input[type="text"]');
            if (nameInput) nameInput.value = characterData.name;

            // Update level
            const levelDisplay = document.querySelector('#charLevel');
            if (levelDisplay) levelDisplay.textContent = characterData.level;

            // Update image if provided
            if (characterData.imageUrl) {
                const charImage = document.querySelector('#charImage');
                const charPlaceholder = document.querySelector('#charPlaceholder');
                if (charImage && charPlaceholder) {
                    charImage.src = characterData.imageUrl;
                    charPlaceholder.style.display = 'none';
                }
            }

            console.log('✅ Character data applied to UI');
        } catch (error) {
            console.warn('⚠️ Could not apply all character data to UI:', error);
        }
    }

    /**
     * Wait for any system to be ready (with timeout)
     */
    async waitForAnySysemReady(maxWaitTime = 3000) {
        const startTime = Date.now();
        
        while (Date.now() - startTime < maxWaitTime) {
            // Check comprehensive integration
            if (window.comprehensiveIntegration && window.comprehensiveIntegration.isInitialized) {
                return 'comprehensive';
            }
            
            // Check old app system
            if (window.app && window.app.initialized) {
                return 'app';
            }
            
            // Check if comprehensive save is at least available
            if (window.comprehensiveCharacterSave) {
                return 'save-only';
            }
            
            // Wait 50ms before checking again
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        return 'timeout';
    }

    /**
     * Create character and handle navigation
     */
    async createCharacterAndNavigate(characterData = {}, redirectTo = null) {
        console.log('🚀 Creating character and handling navigation...');
        
        // Wait a bit for systems to initialize
        const systemReady = await this.waitForAnySysemReady();
        console.log('📊 System readiness check result:', systemReady);
        
        // Create the character
        const result = await this.createCharacter(characterData);
        
        if (result.success) {
            console.log(`✅ Character creation successful with method: ${result.method}`);
            
            // Handle navigation
            if (redirectTo === 'main' || (redirectTo === null && window.location.pathname.includes('landing'))) {
                console.log('🔄 Redirecting to main page...');
                window.location.href = 'index.html';
            } else {
                console.log('📋 Staying on current page, refreshing character list...');
                // Refresh character list if we're on the main page
                if (window.charactersPageManager) {
                    window.charactersPageManager.refreshCharactersList();
                }
            }
            
            return result;
        } else {
            console.error('❌ Character creation failed:', result.error);
            alert('Failed to create character: ' + (result.error || 'Unknown error'));
            return result;
        }
    }

    /**
     * Get system status for debugging
     */
    getSystemStatus() {
        return {
            universalCreation: true,
            comprehensiveCharacterSave: !!window.comprehensiveCharacterSave,
            comprehensiveIntegration: !!window.comprehensiveIntegration,
            comprehensiveIntegrationReady: window.comprehensiveIntegration?.isInitialized || false,
            app: !!window.app,
            appReady: window.app?.initialized || false,
            localStorage: typeof Storage !== 'undefined'
        };
    }
}

// Initialize and expose globally
window.UniversalCharacterCreation = UniversalCharacterCreation;
window.universalCharacterCreation = new UniversalCharacterCreation();

console.log('🌟 UniversalCharacterCreation system loaded and ready');