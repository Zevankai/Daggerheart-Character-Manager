/**
 * Core Character Data Module
 * Handles all character data operations with cloud backend integration
 */
class CharacterData {
    constructor() {
        this.currentCharacterId = null;
        this.defaultCharacterState = this.createDefaultState();
        this.isCloudMode = false;
        this.autoSaveDebounceTimer = null;
        this.autoSaveInterval = 10000; // 10 seconds
    }

    // Create default character state
    createDefaultState() {
        return {
            // Basic Info
            name: 'New Character',
            imageUrl: '',
            level: 5,
            
            // Domains
            domain1: 'Domain 1',
            domain2: 'Domain 2',
            
            // Character Info
            subtitle: 'Community Ancestry Class (Subclass)',
            characterInfo: {
                community: '',
                ancestry: '',
                class: '',
                subclass: ''
            },

            // Appearance Settings (character-specific)
            appearanceSettings: {
                theme: 'auto', // 'light', 'dark', 'auto'
                accentColor: '#ffd700',
                accentColorLight: null,
                accentColorDark: null,
                glassColor: '#ffffff',
                glassOpacity: 10,
                backgroundImage: null,
                customColors: {}
            },
            
            // Trackers
            hope: { current: 0, max: 6 },
            stress: { 
                circles: Array(4).fill({ active: false }), 
                current: 0, 
                max: 4 
            },
            hp: { 
                circles: Array(4).fill({ active: true }), 
                current: 4, 
                max: 4 
            },
            armor: { 
                circles: Array(4).fill({ active: false }), 
                current: 0, 
                max: 4,
                activeCount: 0,
                totalCircles: 4
            },
            
            // Combat Stats
            damage: { minor: 1, major: 2 },
            attributes: {
                agility: 0,
                strength: 0,
                finesse: 0,
                instinct: 0,
                presence: 0,
                knowledge: 0
            },
            evasion: 10,
            
            // Equipment & Inventory
            equipment: {
                selectedBag: 'Standard Backpack',
                backpackType: 'Standard Backpack',
                backpackEnabled: true,
                items: [],
                activeWeapons: [],
                activeArmor: [],
                gold: 0,
                equipped: {}
            },
            
            // Character Development
            journal: { entries: [] },
            details: { personal: {}, physical: {} },
            experiences: [],
            
            // Game Systems
            domainVault: {
                domainCards: [],
                selectedDomains: [],
                domainAbilities: {}
            },
            effectsFeatures: {
                activeEffects: [],
                features: [],
                conditions: []
            },
            downtime: { projects: [] },
            
            // UI State
            ui: {
                sectionOrder: null,
                colors: {},
                activeTab: 'downtime-tab-content'
            },
            
            // Metadata
            createdAt: null,
            lastModified: null,
            version: '4.0'
        };
    }

    // Initialize cloud mode
    initializeCloudMode() {
        this.isCloudMode = window.zeviAPI && window.zeviAPI.isLoggedIn();
        console.log('CharacterData cloud mode:', this.isCloudMode);
        
        if (this.isCloudMode) {
            // Sync any existing backups
            window.zeviAPI.syncBackups().catch(error => {
                console.warn('Failed to sync backups:', error);
            });
        }
    }

    // Get current character ID
    getCurrentCharacterId() {
        if (this.currentCharacterId) {
            return this.currentCharacterId;
        }
        
        const storedId = localStorage.getItem('zevi-current-character-id');
        if (storedId) {
            this.currentCharacterId = storedId;
            return storedId;
        }
        
        return null;
    }

    // Set current character ID
    setCurrentCharacterId(id) {
        this.currentCharacterId = id;
        if (id) {
            localStorage.setItem('zevi-current-character-id', id);
        } else {
            localStorage.removeItem('zevi-current-character-id');
        }
        console.log('Current character ID set to:', id);
    }

    // Load active character from cloud
    async loadActiveCharacter() {
        if (!this.isCloudMode) {
            console.log('Not in cloud mode, skipping active character load');
            return null;
        }
        
        try {
            console.log('Loading active character from cloud...');
            const response = await window.zeviAPI.getActiveCharacter();
            const character = response.character;
            
            console.log('Active character loaded:', character);
            
            // Set as current character
            this.setCurrentCharacterId(character.id.toString());
            
            // Load the character data
            await this.loadCharacterData(character.character_data, character.id.toString());
            
            return character;
        } catch (error) {
            if (error.message.includes('No active character found')) {
                console.log('No active character found in cloud');
                return null;
            }
            console.error('Failed to load active character:', error);
            throw error;
        }
    }

    // Set active character in cloud
    async setActiveCharacter(characterId) {
        if (!this.isCloudMode) {
            console.log('Not in cloud mode, cannot set active character');
            return false;
        }
        
        try {
            console.log('Setting active character in cloud:', characterId);
            const response = await window.zeviAPI.setActiveCharacter(characterId);
            
            // Update local current character ID
            this.setCurrentCharacterId(characterId);
            
            console.log('Active character set successfully:', response);
            return true;
        } catch (error) {
            console.error('Failed to set active character:', error);
            throw error;
        }
    }

    // Get current custom colors from localStorage
    getCurrentCustomColors() {
        const customColors = {};
        const colorKeys = [
            'main-glass', 'ability-scores', 'name-box', 'char-image-border',
            'auth-modal', 'downtime-glass', 'equipment-glass', 'journal-glass',
            'experiences-glass', 'effects-features-glass', 'domain-vault-glass',
            'details-glass'
        ];
        
        colorKeys.forEach(key => {
            const color = localStorage.getItem(`zevi-color-${key}`);
            if (color) {
                customColors[key] = color;
            }
        });
        
        return customColors;
    }

    // Collect current character data from the application
    collectCurrentCharacterData() {
        const uiManager = window.app?.uiManager;
        
        const data = {
            // Basic info from UI
            name: this.getCharacterNameFromUI(),
            level: this.getLevelFromUI(),
            subtitle: this.getSubtitleFromUI(),
            
            // Domains from UI
            domain1: this.getDomainFromUI(0),
            domain2: this.getDomainFromUI(1),
            
            // Character image
            imageUrl: this.getCurrentImageUrl(),
            
            // Ability scores from UI
            attributes: this.getAttributesFromUI(),
            
            // Combat stats from UI
            evasion: this.getEvasionFromUI(),
            damage: this.getDamageFromUI(),
            
            // Data from localStorage
            hope: this.parseJSON(localStorage.getItem('zevi-hope')) || { current: 0, max: 6 },
            stress: this.getStressFromStorage(),
            hp: this.getHPFromStorage(),
            armor: this.getArmorFromStorage(),
            
            // Complex data from localStorage
            equipment: this.parseJSON(localStorage.getItem('zevi-equipment')) || this.defaultCharacterState.equipment,
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
            
            // Appearance settings
            appearanceSettings: this.getCurrentAppearanceSettings(),
            
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

    // Helper methods for collecting data from UI
    getCharacterNameFromUI() {
        const nameElement = document.querySelector('.character-name-editor');
        if (nameElement && nameElement.textContent && nameElement.textContent !== 'Character Name') {
            return nameElement.textContent.trim();
        }
        return 'New Character';
    }

    getLevelFromUI() {
        const levelElement = document.getElementById('charLevel');
        return parseInt(levelElement?.textContent) || 5;
    }

    getSubtitleFromUI() {
        const subtitleElement = document.querySelector('.subtitle');
        return subtitleElement?.textContent || 'Community Ancestry Class (Subclass)';
    }

    getDomainFromUI(index) {
        const domainElements = document.querySelectorAll('.name-box .domain-badge');
        return domainElements[index]?.textContent || `Domain ${index + 1}`;
    }

    getCurrentImageUrl() {
        const img = document.getElementById('charImage');
        if (img && img.src && !img.src.includes('placeholder') && img.style.display !== 'none') {
            return img.src;
        }
        return '';
    }

    getAttributesFromUI() {
        return {
            agility: parseInt(document.getElementById('agility')?.textContent) || 0,
            strength: parseInt(document.getElementById('strength')?.textContent) || 0,
            finesse: parseInt(document.getElementById('finesse')?.textContent) || 0,
            instinct: parseInt(document.getElementById('instinct')?.textContent) || 0,
            presence: parseInt(document.getElementById('presence')?.textContent) || 0,
            knowledge: parseInt(document.getElementById('knowledge')?.textContent) || 0
        };
    }

    getEvasionFromUI() {
        const evasionElement = document.getElementById('evasionValue');
        return parseInt(evasionElement?.value || evasionElement?.textContent) || 10;
    }

    getDamageFromUI() {
        return {
            minor: parseInt(document.getElementById('minorDamageValue')?.textContent) || 1,
            major: parseInt(document.getElementById('majorDamageValue')?.textContent) || 2
        };
    }

    getStressFromStorage() {
        return {
            circles: this.parseJSON(localStorage.getItem('zevi-stress-circles')) || Array(4).fill({ active: false }),
            current: parseInt(localStorage.getItem('zevi-stress-current')) || 0,
            max: 4
        };
    }

    getHPFromStorage() {
        return {
            circles: this.parseJSON(localStorage.getItem('zevi-hp-circles')) || Array(4).fill({ active: true }),
            current: parseInt(localStorage.getItem('zevi-hp-current')) || 4,
            max: 4
        };
    }

    getArmorFromStorage() {
        return {
            circles: this.parseJSON(localStorage.getItem('zevi-armor-circles')) || Array(4).fill({ active: false }),
            current: parseInt(localStorage.getItem('zevi-armor-current')) || 0,
            max: 4,
            activeCount: parseInt(localStorage.getItem('zevi-active-armor-count')) || 0,
            totalCircles: parseInt(localStorage.getItem('zevi-total-armor-circles')) || 4
        };
    }

    getCurrentAppearanceSettings() {
        return {
            theme: document.body.getAttribute('data-theme') || 'auto',
            accentColor: getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || '#ffd700',
            accentColorLight: localStorage.getItem('zevi-custom-accent-light'),
            accentColorDark: localStorage.getItem('zevi-custom-accent-dark'),
            glassColor: localStorage.getItem('zevi-glass-color') || '#ffffff',
            glassOpacity: parseInt(localStorage.getItem('zevi-glass-opacity')) || 10,
            backgroundImage: localStorage.getItem('zevi-background-image'),
            customColors: this.getCurrentCustomColors()
        };
    }

    getActiveTab() {
        const activeTab = document.querySelector('.tab-panel.active');
        return activeTab ? activeTab.id : 'downtime-tab-content';
    }

    // Save character data
    async saveCharacterData(characterId, data, saveType = 'auto') {
        console.log('💾 Saving character data:', { characterId, saveType, isCloudMode: this.isCloudMode });
        
        const characterData = {
            ...data,
            lastModified: new Date().toISOString()
        };
        
        // Try cloud save first if in cloud mode
        if (this.isCloudMode) {
            try {
                if (saveType === 'auto') {
                    await window.zeviAPI.autoSaveCharacter(characterId, characterData);
                } else {
                    const characterName = data.name;
                    await window.zeviAPI.saveCharacter(characterId, characterData, characterName);
                }
                console.log('✅ Character data saved to cloud:', characterId);
                return true;
            } catch (error) {
                console.warn('❌ Cloud save failed, falling back to localStorage:', error);
                // Fall through to localStorage save
            }
        }
        
        // Fallback to localStorage
        const saveKey = `zevi-character-file-${characterId}`;
        try {
            localStorage.setItem(saveKey, JSON.stringify(characterData));
            console.log('✅ Character data saved locally:', characterId);
            return true;
        } catch (error) {
            console.error('❌ Failed to save character data:', error);
            return false;
        }
    }

    // Auto-save with debouncing
    async triggerAutoSave() {
        const currentCharacterId = this.getCurrentCharacterId();
        if (!currentCharacterId) {
            console.log('No current character for auto-save');
            return;
        }
        
        // Clear existing timer
        if (this.autoSaveDebounceTimer) {
            clearTimeout(this.autoSaveDebounceTimer);
        }
        
        // Set new timer for debounced save
        this.autoSaveDebounceTimer = setTimeout(async () => {
            try {
                console.log('🔄 Triggering auto-save for character:', currentCharacterId);
                const characterData = this.collectCurrentCharacterData();
                await this.saveCharacterData(currentCharacterId, characterData, 'auto');
                
                // Update last saved timestamp for character manager display
                localStorage.setItem(`zevi-character-${currentCharacterId}-lastSaved`, new Date().toISOString());
                
                // Show save indicator
                if (window.app?.uiManager?.showStatus) {
                    window.app.uiManager.showStatus('Auto-saved', 'success');
                }
            } catch (error) {
                console.error('❌ Auto-save failed:', error);
                if (window.app?.uiManager?.showStatus) {
                    window.app.uiManager.showStatus('Auto-save failed', 'error');
                }
            }
        }, 2000); // 2 second debounce
    }

    // Load character data
    async loadCharacterData(characterData, characterId) {
        console.log('📂 Loading character data:', { characterId, hasData: !!characterData });
        
        // Set the current character ID
        this.setCurrentCharacterId(characterId);
        
        // Apply appearance settings if they exist
        if (characterData && characterData.appearanceSettings) {
            await this.applyAppearanceSettings(characterData.appearanceSettings);
        }
        
        // Load the character data into the app
        if (window.app && window.app.loadCharacterFromData) {
            await window.app.loadCharacterFromData(characterData);
        }
        
        console.log('✅ Character data loaded successfully');
        return characterData;
    }

    // Load character from cloud by ID
    async loadCloudCharacter(characterId) {
        if (!this.isCloudMode) {
            throw new Error('Not in cloud mode');
        }
        
        try {
            console.log('📂 Loading character from cloud:', characterId);
            const response = await window.zeviAPI.getCharacter(characterId);
            const character = response.character;
            
            // Set as active character
            await this.setActiveCharacter(characterId);
            
            // Load the character data
            await this.loadCharacterData(character.character_data, characterId);
            
            return character;
        } catch (error) {
            console.error('❌ Failed to load character from cloud:', error);
            throw error;
        }
    }

    // Apply appearance settings to the current page
    async applyAppearanceSettings(settings) {
        const root = document.documentElement;
        
        // Apply theme
        if (settings.theme) {
            document.body.setAttribute('data-theme', settings.theme);
            localStorage.setItem('zevi-theme', settings.theme);
        }
        
        // Apply accent color
        if (settings.accentColor) {
            root.style.setProperty('--accent-color', settings.accentColor);
            localStorage.setItem('zevi-custom-accent-base', settings.accentColor);
        }
        
        // Apply accent color variations
        if (settings.accentColorLight) {
            localStorage.setItem('zevi-custom-accent-light', settings.accentColorLight);
        }
        if (settings.accentColorDark) {
            localStorage.setItem('zevi-custom-accent-dark', settings.accentColorDark);
        }
        
        // Apply glass color and opacity
        if (settings.glassColor) {
            localStorage.setItem('zevi-glass-color', settings.glassColor);
        }
        if (settings.glassOpacity !== undefined) {
            localStorage.setItem('zevi-glass-opacity', settings.glassOpacity.toString());
        }
        
        // Apply background image
        if (settings.backgroundImage) {
            localStorage.setItem('zevi-background-image', settings.backgroundImage);
        }
        
        // Apply custom colors
        if (settings.customColors) {
            Object.entries(settings.customColors).forEach(([key, color]) => {
                localStorage.setItem(`zevi-color-${key}`, color);
            });
        }
        
        // Trigger any existing appearance update functions
        if (window.updateGlassColor) {
            window.updateGlassColor();
        }
        if (window.loadSavedColors) {
            window.loadSavedColors();
        }
        
        console.log('✅ Applied character-specific appearance settings');
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

    // Delete character data
    deleteCharacterData(characterId) {
        const saveKey = `zevi-character-file-${characterId}`;
        localStorage.removeItem(saveKey);
        console.log('Character data deleted:', characterId);
    }

    // Clear all character data from localStorage
    clearAllCharacterData() {
        const characterDataKeys = [
            'zevi-equipment', 'zevi-journal-entries', 'zevi-character-details', 
            'zevi-experiences', 'zevi-hope', 'zevi-max-hope', 'zevi-projects', 
            'zevi-hp-circles', 'zevi-stress-circles', 'zevi-armor-circles', 
            'zevi-minor-damage-value', 'zevi-major-damage-value',
            'zevi-active-armor-count', 'zevi-total-armor-circles', 'zevi-evasion',
            'zevi-backpack-enabled', 'zevi-domain-cards', 'zevi-selected-domains', 
            'zevi-domain-abilities', 'zevi-active-effects', 'zevi-features', 
            'zevi-conditions', 'zevi-section-order'
        ];
        
        characterDataKeys.forEach(key => {
            localStorage.removeItem(key);
        });
        
        console.log('All character localStorage data cleared');
    }
}

// Export for use in other modules
window.CharacterData = CharacterData;