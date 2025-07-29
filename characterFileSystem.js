/**
 * Character File System
 * Simulates a file-based character storage system where each character
 * has their own complete data file with perfect isolation
 */

class CharacterFileSystem {
    constructor() {
        this.currentCharacterId = null;
        this.characterFiles = new Map(); // Simulates character files
        this.defaultCharacterState = null;
        this.isInitialized = false;
        
        console.log('CharacterFileSystem initialized');
    }
    
    // Initialize the file system
    async initialize() {
        if (this.isInitialized) return;
        
        console.log('=== INITIALIZING CHARACTER FILE SYSTEM ===');
        
        // Capture the default/generic state of the application
        await this.captureDefaultState();
        
        // Load character directory (list of character files)
        this.loadCharacterDirectory();
        
        this.isInitialized = true;
        console.log('Character File System initialized');
    }
    
    // Capture the default state of the application (generic settings)
    async captureDefaultState() {
        console.log('Capturing default application state...');
        
        // Wait for page to be fully loaded
        await new Promise(resolve => {
            if (document.readyState === 'complete') {
                resolve();
            } else {
                window.addEventListener('load', resolve);
            }
        });
        
        this.defaultCharacterState = {
            // Basic character info
            name: 'New Character',
            subtitle: 'Community Ancestry Class (Subclass)',
            level: 5,
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
            
            // HP system
            hp: {
                circles: Array(4).fill({ active: true }),
                current: 4,
                max: 4
            },
            
            // Stress system
            stress: {
                circles: Array(4).fill({ active: false }),
                current: 0,
                max: 4
            },
            
            // Armor system
            armor: {
                circles: Array(4).fill({ active: false }),
                current: 0,
                max: 4,
                activeCount: 0,
                totalCircles: 4
            },
            
            // Hope system
            hope: {
                current: 0,
                max: 6
            },
            
            // Damage values
            damage: {
                minor: 1,
                major: 2
            },
            
            // Equipment system
            equipment: {
                selectedBag: 'Standard Backpack',
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
                personal: {
                    pronouns: '',
                    nicknames: '',
                    personality: '',
                    moralCompass: ''
                },
                physical: {
                    eyeColor: '',
                    height: '',
                    build: '',
                    hairColor: '',
                    skinTone: '',
                    distinguishingFeatures: ''
                }
            },
            
            // Experiences
            experiences: [],
            
            // Downtime
            downtime: {
                projects: []
            },
            
            // UI state
            ui: {
                sectionOrder: null,
                colors: {},
                activeTab: 'downtime-tab-content'
            },
            
            // Metadata
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            version: '2.0'
        };
        
        console.log('Default character state captured');
    }
    
    // Load the character directory (list of all character files)
    loadCharacterDirectory() {
        try {
            const directory = localStorage.getItem('zevi-character-directory');
            if (directory) {
                const characterList = JSON.parse(directory);
                console.log('Loaded character directory:', characterList);
                return characterList;
            }
        } catch (error) {
            console.error('Error loading character directory:', error);
        }
        return [];
    }
    
    // Save the character directory
    saveCharacterDirectory(characterList) {
        try {
            localStorage.setItem('zevi-character-directory', JSON.stringify(characterList));
            console.log('Character directory saved');
        } catch (error) {
            console.error('Error saving character directory:', error);
        }
    }
    
    // Create a new character file
    createCharacterFile(characterInfo) {
        const characterId = Date.now().toString();
        console.log('Creating character file for:', characterId);
        
        // Create the character's complete data file
        const characterFile = {
            ...this.defaultCharacterState,
            id: characterId,
            name: characterInfo.name || 'New Character',
            subtitle: characterInfo.subtitle || 'Community Ancestry Class (Subclass)',
            level: characterInfo.level || 1,
            platform: characterInfo.platform || 'Daggerheart',
            imageUrl: characterInfo.imageUrl || '',
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString()
        };
        
        // Save the character file
        this.saveCharacterFile(characterId, characterFile);
        
        // Update character directory
        const directory = this.loadCharacterDirectory();
        directory.push({
            id: characterId,
            name: characterFile.name,
            platform: characterFile.platform,
            level: characterFile.level,
            imageUrl: characterFile.imageUrl,
            createdAt: characterFile.createdAt,
            lastModified: characterFile.lastModified
        });
        this.saveCharacterDirectory(directory);
        
        console.log('Character file created:', characterId);
        return characterFile;
    }
    
    // Save a character file
    saveCharacterFile(characterId, characterData) {
        try {
            characterData.lastModified = new Date().toISOString();
            
            // Save to localStorage as a "file"
            const fileKey = `zevi-character-file-${characterId}`;
            localStorage.setItem(fileKey, JSON.stringify(characterData));
            
            // Cache in memory
            this.characterFiles.set(characterId, characterData);
            
            console.log('Character file saved:', characterId);
        } catch (error) {
            console.error('Error saving character file:', error);
        }
    }
    
    // Load a character file
    loadCharacterFile(characterId) {
        try {
            // Check cache first
            if (this.characterFiles.has(characterId)) {
                return this.characterFiles.get(characterId);
            }
            
            // Load from localStorage "file"
            const fileKey = `zevi-character-file-${characterId}`;
            const fileData = localStorage.getItem(fileKey);
            
            if (fileData) {
                const characterData = JSON.parse(fileData);
                
                // Ensure the data structure is complete
                const completeData = this.ensureCompleteStructure(characterData);
                
                // Cache it
                this.characterFiles.set(characterId, completeData);
                
                console.log('Character file loaded:', characterId);
                return completeData;
            }
        } catch (error) {
            console.error('Error loading character file:', error);
        }
        
        return null;
    }
    
    // Ensure character data has complete structure
    ensureCompleteStructure(data) {
        const complete = JSON.parse(JSON.stringify(this.defaultCharacterState));
        
        // Deep merge to ensure all properties exist
        function deepMerge(target, source) {
            for (const key in source) {
                if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    if (!target[key]) target[key] = {};
                    deepMerge(target[key], source[key]);
                } else {
                    target[key] = source[key];
                }
            }
            return target;
        }
        
        return deepMerge(complete, data);
    }
    
    // Switch to a character (load their complete state)
    async switchToCharacter(characterId) {
        console.log('=== SWITCHING TO CHARACTER ===', characterId);
        
        // Save current character if switching from another
        if (this.currentCharacterId && this.currentCharacterId !== characterId) {
            console.log('Saving current character before switching');
            await this.saveCurrentCharacterState();
        }
        
        // Load the character file
        const characterData = this.loadCharacterFile(characterId);
        if (!characterData) {
            console.error('Character file not found:', characterId);
            return null;
        }
        
        // Set as current character
        this.currentCharacterId = characterId;
        localStorage.setItem('zevi-current-character-id', characterId);
        
        // Apply the complete character state to the application
        await this.applyCharacterState(characterData);
        
        console.log('Successfully switched to character:', characterId);
        return characterData;
    }
    
    // Apply a character's complete state to the application
    async applyCharacterState(characterData) {
        console.log('Applying complete character state to application');
        
        try {
            // Basic character info
            this.setUIElement('.name-box input[type="text"]', characterData.name, 'value');
            this.setUIElement('#charLevel', characterData.level, 'textContent');
            this.setUIElement('.name-box .subtitle', characterData.subtitle, 'textContent');
            
            // Domains
            const domainBadges = document.querySelectorAll('.name-box .domain-badge');
            if (domainBadges[0]) domainBadges[0].textContent = characterData.domain1;
            if (domainBadges[1]) domainBadges[1].textContent = characterData.domain2;
            
            // Attributes
            Object.keys(characterData.attributes).forEach(attr => {
                this.setUIElement(`[data-attribute="${attr}"]`, characterData.attributes[attr], 'value');
            });
            
            // Evasion
            this.setUIElement('#evasionValue', characterData.evasion, 'value');
            
            // Character image
            this.setCharacterImage(characterData.imageUrl);
            
            // Clear all localStorage data first to ensure clean state
            this.clearAllCharacterData();
            
            // Set character-specific data in localStorage for existing systems
            localStorage.setItem('zevi-equipment', JSON.stringify(characterData.equipment));
            localStorage.setItem('zevi-journal-entries', JSON.stringify(characterData.journal.entries));
            localStorage.setItem('zevi-character-details', JSON.stringify(characterData.details));
            localStorage.setItem('zevi-experiences', JSON.stringify(characterData.experiences));
            localStorage.setItem('zevi-hope', characterData.hope.current.toString());
            localStorage.setItem('zevi-max-hope', characterData.hope.max.toString());
            localStorage.setItem('zevi-projects', JSON.stringify(characterData.downtime.projects));
            localStorage.setItem('zevi-hp-circles', JSON.stringify(characterData.hp.circles));
            localStorage.setItem('zevi-stress-circles', JSON.stringify(characterData.stress.circles));
            localStorage.setItem('zevi-armor-circles', JSON.stringify(characterData.armor.circles));
            localStorage.setItem('zevi-minor-damage-value', characterData.damage.minor.toString());
            localStorage.setItem('zevi-major-damage-value', characterData.damage.major.toString());
            localStorage.setItem('zevi-active-armor-count', characterData.armor.activeCount.toString());
            localStorage.setItem('zevi-total-armor-circles', characterData.armor.totalCircles.toString());
            localStorage.setItem('zevi-evasion', characterData.evasion.toString());
            
            // Trigger system refreshes
            setTimeout(() => {
                this.refreshAllSystems();
            }, 100);
            
            console.log('Character state applied successfully');
        } catch (error) {
            console.error('Error applying character state:', error);
        }
    }
    
    // Clear all character-specific data from localStorage
    clearAllCharacterData() {
        const characterDataKeys = [
            'zevi-equipment',
            'zevi-journal-entries',
            'zevi-character-details',
            'zevi-experiences',
            'zevi-hope',
            'zevi-max-hope',
            'zevi-projects',
            'zevi-hp-circles',
            'zevi-stress-circles',
            'zevi-armor-circles',
            'zevi-minor-damage-value',
            'zevi-major-damage-value',
            'zevi-active-armor-count',
            'zevi-total-armor-circles',
            'zevi-evasion'
        ];
        
        characterDataKeys.forEach(key => {
            localStorage.removeItem(key);
        });
    }
    
    // Set UI element value safely
    setUIElement(selector, value, property = 'value') {
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
    
    // Refresh all systems to load the new character data
    refreshAllSystems() {
        console.log('Refreshing all systems for character data');
        
        // Refresh systems that have initialization functions
        const systemRefreshers = [
            'initializeHPStress',
            'initializeHope',
            'initializeEquipment',
            'renderExperiences',
            'renderJournalEntries',
            'initializeDetailsTab'
        ];
        
        systemRefreshers.forEach(refresher => {
            if (window[refresher] && typeof window[refresher] === 'function') {
                try {
                    console.log('Refreshing system:', refresher);
                    window[refresher]();
                } catch (error) {
                    console.error('Error refreshing system:', refresher, error);
                }
            }
        });
    }
    
    // Save current character state to their file
    async saveCurrentCharacterState() {
        if (!this.currentCharacterId) {
            console.log('No current character to save');
            return;
        }
        
        console.log('Saving current character state to file');
        
        // Load current character file
        const currentData = this.loadCharacterFile(this.currentCharacterId);
        if (!currentData) return;
        
        // Collect current state from UI and localStorage
        const updatedData = {
            ...currentData,
            
            // Basic info from UI
            name: this.getUIValue('.name-box input[type="text"]'),
            level: parseInt(this.getUIValue('#charLevel', 'textContent')) || currentData.level,
            subtitle: this.getUIValue('.name-box .subtitle', 'textContent'),
            evasion: parseInt(this.getUIValue('#evasionValue')) || currentData.evasion,
            
            // Domains
            domain1: document.querySelectorAll('.name-box .domain-badge')[0]?.textContent || currentData.domain1,
            domain2: document.querySelectorAll('.name-box .domain-badge')[1]?.textContent || currentData.domain2,
            
            // Attributes
            attributes: {},
            
            // Character image
            imageUrl: this.getCurrentImageUrl() || currentData.imageUrl,
            
            // Data from localStorage
            equipment: this.parseJSON(localStorage.getItem('zevi-equipment')) || currentData.equipment,
            journal: {
                entries: this.parseJSON(localStorage.getItem('zevi-journal-entries')) || currentData.journal.entries
            },
            details: this.parseJSON(localStorage.getItem('zevi-character-details')) || currentData.details,
            experiences: this.parseJSON(localStorage.getItem('zevi-experiences')) || currentData.experiences,
            hope: {
                current: parseInt(localStorage.getItem('zevi-hope')) || currentData.hope.current,
                max: parseInt(localStorage.getItem('zevi-max-hope')) || currentData.hope.max
            },
            downtime: {
                projects: this.parseJSON(localStorage.getItem('zevi-projects')) || currentData.downtime.projects
            },
            hp: {
                circles: this.parseJSON(localStorage.getItem('zevi-hp-circles')) || currentData.hp.circles,
                current: currentData.hp.current,
                max: currentData.hp.max
            },
            stress: {
                circles: this.parseJSON(localStorage.getItem('zevi-stress-circles')) || currentData.stress.circles,
                current: currentData.stress.current,
                max: currentData.stress.max
            },
            armor: {
                circles: this.parseJSON(localStorage.getItem('zevi-armor-circles')) || currentData.armor.circles,
                activeCount: parseInt(localStorage.getItem('zevi-active-armor-count')) || currentData.armor.activeCount,
                totalCircles: parseInt(localStorage.getItem('zevi-total-armor-circles')) || currentData.armor.totalCircles,
                current: currentData.armor.current,
                max: currentData.armor.max
            },
            damage: {
                minor: parseInt(localStorage.getItem('zevi-minor-damage-value')) || currentData.damage.minor,
                major: parseInt(localStorage.getItem('zevi-major-damage-value')) || currentData.damage.major
            }
        };
        
        // Collect attributes
        ['agility', 'strength', 'finesse', 'instinct', 'presence', 'knowledge'].forEach(attr => {
            const value = this.getUIValue(`[data-attribute="${attr}"]`);
            updatedData.attributes[attr] = parseInt(value) || 0;
        });
        
        // Save the updated character file
        this.saveCharacterFile(this.currentCharacterId, updatedData);
        
        // Update character directory with basic info
        this.updateCharacterInDirectory(this.currentCharacterId, {
            name: updatedData.name,
            level: updatedData.level,
            imageUrl: updatedData.imageUrl,
            lastModified: updatedData.lastModified
        });
    }
    
    // Helper to get UI values safely
    getUIValue(selector, property = 'value') {
        const element = document.querySelector(selector);
        return element ? element[property] : null;
    }
    
    // Helper to get current character image URL
    getCurrentImageUrl() {
        const charImage = document.getElementById('charImage');
        return charImage && charImage.src && !charImage.src.includes('placeholder') ? charImage.src : null;
    }
    
    // Helper to parse JSON safely
    parseJSON(str) {
        try {
            return str ? JSON.parse(str) : null;
        } catch {
            return null;
        }
    }
    
    // Update character info in directory
    updateCharacterInDirectory(characterId, updates) {
        const directory = this.loadCharacterDirectory();
        const index = directory.findIndex(char => char.id === characterId);
        if (index !== -1) {
            Object.assign(directory[index], updates);
            this.saveCharacterDirectory(directory);
        }
    }
    
    // Reset to generic state (for new character creation)
    async resetToGenericState() {
        console.log('Resetting to generic application state');
        
        // Clear current character
        this.currentCharacterId = null;
        localStorage.removeItem('zevi-current-character-id');
        
        // Clear all character data
        this.clearAllCharacterData();
        
        // Apply default state
        if (this.defaultCharacterState) {
            await this.applyCharacterState(this.defaultCharacterState);
        }
        
        console.log('Reset to generic state complete');
    }
    
    // Delete a character file
    deleteCharacterFile(characterId) {
        console.log('Deleting character file:', characterId);
        
        // Remove from localStorage
        const fileKey = `zevi-character-file-${characterId}`;
        localStorage.removeItem(fileKey);
        
        // Remove from cache
        this.characterFiles.delete(characterId);
        
        // Remove from directory
        const directory = this.loadCharacterDirectory();
        const filteredDirectory = directory.filter(char => char.id !== characterId);
        this.saveCharacterDirectory(filteredDirectory);
        
        console.log('Character file deleted');
    }
    
    // Get all character files (directory listing)
    getAllCharacters() {
        return this.loadCharacterDirectory();
    }
    
    // Get debug information
    getDebugInfo() {
        return {
            isInitialized: this.isInitialized,
            currentCharacterId: this.currentCharacterId,
            cachedFiles: Array.from(this.characterFiles.keys()),
            totalCharacters: this.loadCharacterDirectory().length
        };
    }
}

// Create global instance
window.characterFileSystem = new CharacterFileSystem();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(async () => {
        await window.characterFileSystem.initialize();
        console.log('Character File System ready');
        
        // Set up auto-save
        setInterval(async () => {
            if (window.characterFileSystem.currentCharacterId) {
                console.log('Auto-saving character state...');
                await window.characterFileSystem.saveCurrentCharacterState();
            }
        }, 10000); // Auto-save every 10 seconds
        
    }, 500);
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CharacterFileSystem;
}