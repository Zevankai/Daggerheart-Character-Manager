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

    // Save character data
    saveCharacterData(characterId, data) {
        const saveKey = `zevi-character-file-${characterId}`;
        const characterData = {
            ...data,
            lastModified: new Date().toISOString()
        };
        
        try {
            localStorage.setItem(saveKey, JSON.stringify(characterData));
            console.log('Character data saved:', characterId);
            return true;
        } catch (error) {
            console.error('Failed to save character data:', error);
            return false;
        }
    }

    // Load character data
    loadCharacterData(characterId) {
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