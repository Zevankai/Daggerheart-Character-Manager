/**
 * Core Character Data Module
 * Handles all character data operations with proper isolation
 */
class CharacterData {
    constructor() {
        this.currentCharacterId = null;
        this.defaultCharacterState = this.createDefaultState();
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

    // Get current character ID
    getCurrentCharacterId() {
        return this.currentCharacterId || localStorage.getItem('zevi-current-character-id');
    }

    // Set current character ID
    setCurrentCharacterId(id) {
        this.currentCharacterId = id;
        localStorage.setItem('zevi-current-character-id', id);
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

    // Get all current character data (for display in characters tab)
    getCharacterData(characterId) {
        if (!characterId) return null;
        
        // Try to get from current app state first
        if (window.app && window.app.collectCharacterData) {
            return window.app.collectCharacterData();
        }
        
        // Fallback to stored data
        return this.getStoredCharacterData(characterId);
    }

    // Save character data
    async saveCharacterData(characterId, data) {
        // Show saving status if available
        if (window.saveStatus) {
            window.saveStatus.showSaving();
        }
        
        const characterData = {
            ...data,
            // Capture current appearance settings
            appearanceSettings: {
                theme: document.body.getAttribute('data-theme') || 'auto',
                accentColor: getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || '#ffd700',
                accentColorLight: localStorage.getItem('zevi-custom-accent-light'),
                accentColorDark: localStorage.getItem('zevi-custom-accent-dark'),
                glassColor: localStorage.getItem('zevi-glass-color') || '#ffffff',
                glassOpacity: parseInt(localStorage.getItem('zevi-glass-opacity')) || 10,
                backgroundImage: localStorage.getItem('zevi-background-image'),
                customColors: this.getCurrentCustomColors()
            },
            lastModified: new Date().toISOString()
        };
        
        // Try to save to cloud first if user is logged in
        if (window.zeviAPI && window.zeviAPI.isLoggedIn()) {
            try {
                await window.zeviAPI.autoSaveCharacter(characterId, characterData);
                console.log('Character data saved to cloud:', characterId);
                
                // Show success status
                if (window.saveStatus) {
                    window.saveStatus.showSuccess();
                }
                
                return true;
            } catch (error) {
                console.warn('Cloud save failed, falling back to localStorage:', error);
                
                // Show warning about fallback
                if (window.saveStatus) {
                    window.saveStatus.showWarning('Cloud save failed, using local storage');
                }
                
                // Fall through to localStorage save
            }
        }
        
        // Fallback to localStorage
        const saveKey = `zevi-character-file-${characterId}`;
        try {
            localStorage.setItem(saveKey, JSON.stringify(characterData));
            console.log('Character data saved locally:', characterId);
            
            // Show success status for local save
            if (window.saveStatus) {
                window.saveStatus.showSuccess();
            }
            
            return true;
        } catch (error) {
            console.error('Failed to save character data:', error);
            
            // Show error status
            if (window.saveStatus) {
                window.saveStatus.showError('Save failed');
            }
            
            return false;
        }
    }

    // Load character data
    async loadCharacterData(characterData, characterId) {
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
        
        return characterData;
    }

    // Load character data from storage (legacy method)
    getStoredCharacterData(characterId) {
        const saveKey = `zevi-character-file-${characterId}`;
        const savedData = localStorage.getItem(saveKey);
        
        if (savedData) {
            try {
                return JSON.parse(savedData);
            } catch (error) {
                console.error('Failed to parse character data:', error);
                return this.defaultCharacterState;
            }
        }
        
        return this.defaultCharacterState;
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
        
        console.log('Applied character-specific appearance settings');
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