/**
 * Simple Character Data Module - NO SAVE FUNCTIONALITY
 * Just provides basic character data structure and collection utilities
 */
class CharacterData {
    constructor() {
        this.currentCharacterId = null;
    }

    // Get current character ID
    getCurrentCharacterId() {
        return this.currentCharacterId || localStorage.getItem('zevi-current-character-id');
    }

    // Set current character ID
    setCurrentCharacterId(id) {
        this.currentCharacterId = id;
        if (id) {
            localStorage.setItem('zevi-current-character-id', id);
        } else {
            localStorage.removeItem('zevi-current-character-id');
        }
    }

    // Collect ALL character data from the UI and global variables
    collectAllCharacterData() {
        const data = {};

        // Basic character info from UI
        data.name = this.getUIValue('.character-name-editor', 'textContent') || 'New Character';
        data.subtitle = this.getUIValue('.subtitle', 'textContent') || 'Community Ancestry Class (Subclass)';
        data.level = parseInt(this.getUIValue('#charLevel', 'textContent')) || 1;
        data.domain1 = this.getUIValue('#domain1', 'textContent') || 'Domain 1';
        data.domain2 = this.getUIValue('#domain2', 'textContent') || 'Domain 2';
        data.imageUrl = this.getUIValue('#charImage', 'src') || '';

        // Parse subtitle into components
        const components = this.parseSubtitleIntoComponents(data.subtitle);
        data.ancestry = components.ancestry;
        data.class = components.class;
        data.subclass = components.subclass;

        // Ability scores from UI
        data.attributes = {};
        ['might', 'agility', 'instinct', 'presence', 'knowledge'].forEach(attr => {
            data.attributes[attr] = parseInt(this.getUIValue(`#${attr}`, 'textContent')) || 0;
        });

        // Combat stats from UI  
        data.evasion = parseInt(this.getUIValue('#evasionValue', 'textContent')) || 10;
        data.damage = {
            minor: parseInt(this.getUIValue('#minor-damage-value', 'value')) || 1,
            major: parseInt(this.getUIValue('#major-damage-value', 'value')) || 2
        };

        // Hope data from globals or UI
        data.hope = {
            current: window.currentHope || 0,
            max: window.currentMaxHope || 6
        };

        // HP/Stress/Armor from globals
        data.hp = {
            circles: window.hpCircles ? [...window.hpCircles] : Array(4).fill({active: false})
        };
        data.stress = {
            circles: window.stressCircles ? [...window.stressCircles] : Array(4).fill({active: false})
        };
        data.armor = {
            circles: window.armorCircles ? [...window.armorCircles] : Array(4).fill({active: false}),
            totalCircles: window.totalArmorCircles || 4,
            activeCount: window.activeArmorCount || 0
        };

        // Data from global variables (populated by modules)
        if (window.equipmentData) {
            data.equipment = { ...window.equipmentData };
        }
        if (window.journalEntries) {
            data.journal = { entries: [...window.journalEntries] };
        }
        if (window.characterDetails) {
            data.details = { ...window.characterDetails };
        }
        if (window.experiences) {
            data.experiences = [...window.experiences];
        }
        if (window.projects) {
            data.downtime = { projects: [...window.projects] };
        }
        if (window.domainVaultData) {
            data.domainVault = { ...window.domainVaultData };
        }
        if (window.effectsFeaturesData) {
            data.effectsFeatures = { ...window.effectsFeaturesData };
        }

        // UI preferences
        data.ui = {
            backpackEnabled: this.getCharacterSpecificValue('backpack-enabled') || false,
            selectedBag: window.equipmentData?.selectedBag || 'Standard Backpack',
            sectionOrder: this.getCharacterSpecificValue('zevi-section-order') || []
        };

        // Appearance settings
        const accentColor = this.getCharacterSpecificValue('zevi-accent-color') || '#ffd700';
        const glassColor = this.getCharacterSpecificValue('zevi-glass-color') || '#ffffff';
        const glassOpacity = parseInt(this.getCharacterSpecificValue('zevi-glass-opacity')) || 10;
        const backgroundImage = this.getCharacterSpecificValue('zevi-background-image') || null;
        
        console.log('🔍 CharacterData collecting appearance settings:', {
            accentColor: accentColor,
            glassColor: glassColor, 
            glassOpacity: glassOpacity,
            backgroundImage: backgroundImage ? 'YES (length: ' + backgroundImage.length + ')' : 'NO'
        });
        
        data.appearanceSettings = {
            accentColor: accentColor,
            glassColor: glassColor,
            glassOpacity: glassOpacity,
            backgroundImage: backgroundImage
        };

        data.lastModified = new Date().toISOString();
        data.version = '2.0';

        return data;
    }

    // Parse subtitle string into components
    parseSubtitleIntoComponents(subtitle) {
        if (!subtitle || subtitle === 'Community Ancestry Class (Subclass)') {
            return { ancestry: '', class: '', subclass: '' };
        }

        const parts = subtitle.split(' ');
        if (parts.length >= 3) {
            const ancestry = parts[1] || '';
            const classAndSubclass = parts.slice(2).join(' ');
            const subclassMatch = classAndSubclass.match(/^(.+?)\s*\((.+?)\)$/);
            
            if (subclassMatch) {
                return {
                    ancestry: ancestry,
                    class: subclassMatch[1].trim(),
                    subclass: subclassMatch[2].trim()
                };
            } else {
                return {
                    ancestry: ancestry,
                    class: classAndSubclass,
                    subclass: ''
                };
            }
        }

        return { ancestry: '', class: '', subclass: '' };
    }

    // Helper: Get value from UI element
    getUIValue(selector, property = 'textContent') {
        const element = document.querySelector(selector);
        return element ? element[property] : null;
    }

    // Helper: Get character-specific value from localStorage
    getCharacterSpecificValue(key) {
        const characterId = this.getCurrentCharacterId();
        if (!characterId) return null;
        return localStorage.getItem(`zevi-character-${characterId}-${key}`);
    }

    // Helper: Set character-specific value in localStorage
    setCharacterSpecificValue(key, value) {
        const characterId = this.getCurrentCharacterId();
        if (!characterId) return;
        localStorage.setItem(`zevi-character-${characterId}-${key}`, value);
    }
}

// Make globally available
if (typeof window !== 'undefined') {
    window.CharacterData = CharacterData;
}