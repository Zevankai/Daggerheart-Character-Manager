/**
 * Character Data Store - Comprehensive Character Data Management
 * This system ensures complete data isolation between characters
 * All character data is stored and retrieved through this centralized system
 */

class CharacterDataStore {
    constructor() {
        this.currentCharacterId = null;
        this.characterDataCache = new Map();
        this.isInitialized = false;
        
        // Define the complete character data structure
        this.defaultCharacterData = {
            // Basic character info
            name: 'New Character',
            subtitle: '',
            level: 1,
            platform: 'Daggerheart',
            imageUrl: '',
            
            // Domains
            domain1: 'Domain 1',
            domain2: 'Domain 2',
            
            // Attributes
            attributes: {
                agility: 0,
                strength: 0,
                finesse: 0,
                instinct: 0,
                presence: 0,
                knowledge: 0
            },
            
            // Combat stats
            evasion: 10,
            hp: {
                current: 4,
                max: 4,
                circles: [
                    { active: true },
                    { active: true },
                    { active: true },
                    { active: true }
                ]
            },
            stress: {
                current: 0,
                max: 4,
                circles: [
                    { active: false },
                    { active: false },
                    { active: false },
                    { active: false }
                ]
            },
            armor: {
                current: 0,
                max: 4,
                circles: [
                    { active: false },
                    { active: false },
                    { active: false },
                    { active: false }
                ],
                activeCount: 0,
                totalCircles: 4
            },
            
            // Damage thresholds
            damage: {
                minor: 1,
                major: 2
            },
            
            // Hope system
            hope: {
                current: 0,
                max: 6
            },
            
            // Equipment system
            equipment: {
                backpackType: 'None',
                backpackEnabled: true,
                items: [],
                activeWeapons: [],
                activeArmor: []
            },
            
            // Journal system
            journal: {
                entries: []
            },
            
            // Details system
            details: {
                background: '',
                personality: '',
                connections: '',
                notes: ''
            },
            
            // Experiences system
            experiences: [],
            
            // Downtime system
            downtime: {
                projects: [],
                activities: []
            },
            
            // UI customization per character
            ui: {
                sectionOrder: null,
                colors: {},
                theme: null // Character can have their own theme preference
            },
            
            // Metadata
            createdAt: null,
            lastModified: null,
            version: '1.0'
        };
    }
    
    // Initialize the data store
    initialize() {
        if (this.isInitialized) return;
        
        console.log('=== INITIALIZING CHARACTER DATA STORE ===');
        
        // Load current character ID
        this.currentCharacterId = localStorage.getItem('zevi-current-character-id');
        
        // Pre-load current character data if available
        if (this.currentCharacterId) {
            this.loadCharacterData(this.currentCharacterId);
        }
        
        this.isInitialized = true;
        console.log('Character Data Store initialized');
    }
    
    // Create a new character with default data
    createCharacterData(characterId, basicInfo = {}) {
        console.log('Creating character data for:', characterId);
        
        const characterData = {
            ...this.defaultCharacterData,
            ...basicInfo,
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString()
        };
        
        // Save to localStorage with character-specific key
        const storageKey = `zevi-character-data-${characterId}`;
        localStorage.setItem(storageKey, JSON.stringify(characterData));
        
        // Cache the data
        this.characterDataCache.set(characterId, characterData);
        
        console.log('Character data created and saved:', characterId);
        return characterData;
    }
    
    // Load character data from storage
    loadCharacterData(characterId) {
        console.log('Loading character data for:', characterId);
        
        // Check cache first
        if (this.characterDataCache.has(characterId)) {
            const cached = this.characterDataCache.get(characterId);
            console.log('Character data loaded from cache');
            return cached;
        }
        
        // Load from localStorage
        const storageKey = `zevi-character-data-${characterId}`;
        const stored = localStorage.getItem(storageKey);
        
        if (stored) {
            try {
                const characterData = JSON.parse(stored);
                
                // Ensure data structure is complete (for backwards compatibility)
                const completeData = this.ensureCompleteDataStructure(characterData);
                
                // Cache the data
                this.characterDataCache.set(characterId, completeData);
                
                console.log('Character data loaded from storage');
                return completeData;
            } catch (error) {
                console.error('Error parsing character data:', error);
                return this.createCharacterData(characterId);
            }
        } else {
            console.log('No existing data found, creating default data');
            return this.createCharacterData(characterId);
        }
    }
    
    // Ensure data structure is complete (for backwards compatibility)
    ensureCompleteDataStructure(data) {
        const complete = { ...this.defaultCharacterData };
        
        // Recursively merge data, ensuring all properties exist
        const deepMerge = (target, source) => {
            for (const key in target) {
                if (source && source.hasOwnProperty(key)) {
                    if (typeof target[key] === 'object' && target[key] !== null && !Array.isArray(target[key])) {
                        target[key] = deepMerge(target[key], source[key]);
                    } else {
                        target[key] = source[key];
                    }
                }
            }
            return target;
        };
        
        return deepMerge(complete, data);
    }
    
    // Save character data
    saveCharacterData(characterId, data) {
        console.log('Saving character data for:', characterId);
        
        // Update metadata
        data.lastModified = new Date().toISOString();
        
        // Save to localStorage
        const storageKey = `zevi-character-data-${characterId}`;
        localStorage.setItem(storageKey, JSON.stringify(data));
        
        // Update cache
        this.characterDataCache.set(characterId, data);
        
        console.log('Character data saved successfully');
    }
    
    // Switch to a character (sets current context)
    switchToCharacter(characterId) {
        console.log('Switching to character:', characterId);
        
        // Save current character data if switching from another character
        if (this.currentCharacterId && this.currentCharacterId !== characterId) {
            console.log('Saving current character data before switching');
            this.saveCurrentCharacterData();
        }
        
        // Load new character data
        const characterData = this.loadCharacterData(characterId);
        
        // Set as current character
        this.currentCharacterId = characterId;
        localStorage.setItem('zevi-current-character-id', characterId);
        
        // Apply character data to UI
        this.applyCharacterDataToUI(characterData);
        
        console.log('Successfully switched to character:', characterId);
        return characterData;
    }
    
    // Apply character data to the UI
    applyCharacterDataToUI(data) {
        console.log('Applying character data to UI');
        
        try {
            // Basic character info
            this.setUIValue('.name-box input[type="text"]', data.name);
            this.setUIValue('#charLevel', data.level, 'textContent');
            this.setUIValue('.name-box .subtitle', data.subtitle, 'textContent');
            
            // Domains
            const domainBadges = document.querySelectorAll('.name-box .domain-badge');
            if (domainBadges[0]) domainBadges[0].textContent = data.domain1 || 'Domain 1';
            if (domainBadges[1]) domainBadges[1].textContent = data.domain2 || 'Domain 2';
            
            // Attributes
            Object.keys(data.attributes).forEach(attr => {
                this.setUIValue(`[data-attribute="${attr}"]`, data.attributes[attr]);
            });
            
            // Evasion
            this.setUIValue('#evasionValue', data.evasion);
            
            // Character image
            this.setCharacterImage(data.imageUrl);
            
            // Combat stats will be handled by their respective systems
            // Equipment, journal, etc. will be handled by their respective systems
            
            console.log('Character data applied to UI successfully');
        } catch (error) {
            console.error('Error applying character data to UI:', error);
        }
    }
    
    // Helper to set UI values safely
    setUIValue(selector, value, property = 'value') {
        const element = document.querySelector(selector);
        if (element && value !== undefined && value !== null) {
            element[property] = value;
        }
    }
    
    // Set character image
    setCharacterImage(imageUrl) {
        const charImage = document.getElementById('charImage');
        const charPlaceholder = document.getElementById('charPlaceholder');
        
        if (imageUrl && charImage) {
            charImage.src = imageUrl;
            charImage.style.display = 'block';
            if (charPlaceholder) {
                charPlaceholder.style.display = 'none';
            }
        } else if (charImage && charPlaceholder) {
            charImage.style.display = 'none';
            charPlaceholder.style.display = 'flex';
        }
    }
    
    // Get current character data
    getCurrentCharacterData() {
        if (!this.currentCharacterId) {
            console.warn('No current character set');
            return null;
        }
        
        return this.loadCharacterData(this.currentCharacterId);
    }
    
    // Update specific data for current character
    updateCurrentCharacterData(updates) {
        if (!this.currentCharacterId) {
            console.warn('No current character to update');
            return false;
        }
        
        const currentData = this.getCurrentCharacterData();
        if (!currentData) return false;
        
        // Deep merge updates
        const updatedData = this.deepMerge(currentData, updates);
        
        // Save updated data
        this.saveCharacterData(this.currentCharacterId, updatedData);
        
        return true;
    }
    
    // Deep merge helper
    deepMerge(target, source) {
        const result = { ...target };
        
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(target[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        
        return result;
    }
    
    // Save current character data from UI
    saveCurrentCharacterData() {
        if (!this.currentCharacterId) return false;
        
        console.log('Collecting current character data from UI');
        
        const currentData = this.getCurrentCharacterData();
        if (!currentData) return false;
        
        // Collect data from UI
        const uiData = this.collectDataFromUI();
        
        // Merge with current data
        const updatedData = this.deepMerge(currentData, uiData);
        
        // Save
        this.saveCharacterData(this.currentCharacterId, updatedData);
        
        return true;
    }
    
    // Collect data from UI
    collectDataFromUI() {
        const data = {};
        
        try {
            // Basic info
            const nameInput = document.querySelector('.name-box input[type="text"]');
            if (nameInput) data.name = nameInput.value;
            
            const levelInput = document.getElementById('charLevel');
            if (levelInput) data.level = parseInt(levelInput.textContent) || 1;
            
            const subtitleInput = document.querySelector('.name-box .subtitle');
            if (subtitleInput) data.subtitle = subtitleInput.textContent;
            
            // Domains
            const domainBadges = document.querySelectorAll('.name-box .domain-badge');
            if (domainBadges[0]) data.domain1 = domainBadges[0].textContent;
            if (domainBadges[1]) data.domain2 = domainBadges[1].textContent;
            
            // Attributes
            data.attributes = {};
            ['agility', 'strength', 'finesse', 'instinct', 'presence', 'knowledge'].forEach(attr => {
                const input = document.querySelector(`[data-attribute="${attr}"]`);
                if (input) data.attributes[attr] = parseInt(input.value) || 0;
            });
            
            // Evasion
            const evasionInput = document.getElementById('evasionValue');
            if (evasionInput) data.evasion = parseInt(evasionInput.value) || 10;
            
            // Character image
            const charImage = document.getElementById('charImage');
            if (charImage && charImage.src && !charImage.src.includes('placeholder')) {
                data.imageUrl = charImage.src;
            }
            
            console.log('Collected data from UI:', data);
        } catch (error) {
            console.error('Error collecting data from UI:', error);
        }
        
        return data;
    }
    
    // Delete character data
    deleteCharacterData(characterId) {
        console.log('Deleting character data for:', characterId);
        
        // Remove from localStorage
        const storageKey = `zevi-character-data-${characterId}`;
        localStorage.removeItem(storageKey);
        
        // Remove from cache
        this.characterDataCache.delete(characterId);
        
        console.log('Character data deleted');
    }
    
    // Get debug information
    getDebugInfo() {
        return {
            currentCharacterId: this.currentCharacterId,
            cachedCharacters: Array.from(this.characterDataCache.keys()),
            isInitialized: this.isInitialized
        };
    }
    
    // Auto-save current character data periodically
    startAutoSave() {
        setInterval(() => {
            if (this.currentCharacterId) {
                this.saveCurrentCharacterData();
            }
        }, 10000); // Save every 10 seconds
    }
}

// Create global instance
window.characterDataStore = new CharacterDataStore();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.characterDataStore.initialize();
        window.characterDataStore.startAutoSave();
    }, 200);
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CharacterDataStore;
}