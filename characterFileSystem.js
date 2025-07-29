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
            // 1) Name
            name: 'New Character',
            
            // 2) Image
            imageUrl: '',
            
            // 3) Site background
            siteBackground: {
                textColor: 'default',
                accentColor: 'default',
                theme: 'default',
                glassColor: 'default',
                glassOpacity: 'default'
            },
            
            // 4) Level
            level: 5,
            
            // 5) Domains
            domain1: 'Domain 1',
            domain2: 'Domain 2',
            
            // 6) Information (community, ancestry, class, etc)
            subtitle: 'Community Ancestry Class (Subclass)',
            characterInfo: {
                community: '',
                ancestry: '',
                class: '',
                subclass: ''
            },
            
            // 7) Hope tracker
            hope: {
                current: 0,
                max: 6
            },
            
            // 8) Stress tracker
            stress: {
                circles: Array(4).fill({ active: false }),
                current: 0,
                max: 4
            },
            
            // 9) HP tracker
            hp: {
                circles: Array(4).fill({ active: true }),
                current: 4,
                max: 4
            },
            
            // 10) Damage thresholds
            damage: {
                minor: 1,
                major: 2
            },
            
            // 11) Ability scores
            attributes: {
                agility: 0,
                strength: 0,
                finesse: 0,
                instinct: 0,
                presence: 0,
                knowledge: 0
            },
            
            // 12) Armor tracker
            armor: {
                circles: Array(4).fill({ active: false }),
                current: 0,
                max: 4,
                activeCount: 0,
                totalCircles: 4
            },
            
            // 13) All equipment - including backpack selection, items, gold, and equipped
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
            
            // 14) Journal
            journal: {
                entries: []
            },
            
            // 15) Details
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
            
            // 16) Experiences
            experiences: [],
            
            // 17) Domain vault
            domainVault: {
                domainCards: [],
                selectedDomains: [],
                domainAbilities: {}
            },
            
            // 18) Effects & features
            effectsFeatures: {
                activeEffects: [],
                features: [],
                conditions: []
            },
            
            // Additional combat stats
            evasion: 10,
            
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
            version: '3.0'
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
        console.log('Applying COMPREHENSIVE character state to application');
        
        try {
            // Clear all localStorage data first to ensure clean state
            this.clearAllCharacterData();
            
            // 1) Name
            this.setUIElement('.name-box input[type="text"]', characterData.name, 'value');
            
            // 2) Character image
            this.setCharacterImage(characterData.imageUrl);
            
            // 3) Site background (theme colors) - Only apply if character has custom settings
            if (characterData.siteBackground) {
                if (characterData.siteBackground.textColor !== 'default') {
                    localStorage.setItem('zevi-text-color', characterData.siteBackground.textColor);
                }
                if (characterData.siteBackground.accentColor !== 'default') {
                    localStorage.setItem('zevi-accent-color', characterData.siteBackground.accentColor);
                }
                if (characterData.siteBackground.theme !== 'default') {
                    localStorage.setItem('zevi-theme', characterData.siteBackground.theme);
                }
                if (characterData.siteBackground.glassColor !== 'default') {
                    localStorage.setItem('zevi-glass-color', characterData.siteBackground.glassColor);
                }
                if (characterData.siteBackground.glassOpacity !== 'default') {
                    localStorage.setItem('zevi-glass-opacity', characterData.siteBackground.glassOpacity);
                }
            }
            
            // 4) Level
            this.setUIElement('#charLevel', characterData.level, 'textContent');
            
            // 5) Domains
            const domainBadges = document.querySelectorAll('.name-box .domain-badge');
            if (domainBadges[0]) domainBadges[0].textContent = characterData.domain1 || 'Domain 1';
            if (domainBadges[1]) domainBadges[1].textContent = characterData.domain2 || 'Domain 2';
            
            // 6) Information (community, ancestry, class, etc)
            this.setUIElement('.name-box .subtitle', characterData.subtitle, 'textContent');
            if (characterData.characterInfo) {
                this.setUIElement('#community', characterData.characterInfo.community, 'value');
                this.setUIElement('#ancestry', characterData.characterInfo.ancestry, 'value');
                this.setUIElement('#class', characterData.characterInfo.class, 'value');
                this.setUIElement('#subclass', characterData.characterInfo.subclass, 'value');
            }
            
            // 7) Hope tracker
            localStorage.setItem('zevi-hope', characterData.hope.current.toString());
            localStorage.setItem('zevi-max-hope', characterData.hope.max.toString());
            
            // 8) Stress tracker
            localStorage.setItem('zevi-stress-circles', JSON.stringify(characterData.stress.circles));
            
            // 9) HP tracker
            localStorage.setItem('zevi-hp-circles', JSON.stringify(characterData.hp.circles));
            
            // 10) Damage thresholds
            localStorage.setItem('zevi-minor-damage-value', characterData.damage.minor.toString());
            localStorage.setItem('zevi-major-damage-value', characterData.damage.major.toString());
            
            // 11) Ability scores
            Object.keys(characterData.attributes).forEach(attr => {
                this.setUIElement(`[data-attribute="${attr}"]`, characterData.attributes[attr], 'value');
            });
            
            // 12) Armor tracker
            localStorage.setItem('zevi-armor-circles', JSON.stringify(characterData.armor.circles));
            localStorage.setItem('zevi-active-armor-count', characterData.armor.activeCount.toString());
            localStorage.setItem('zevi-total-armor-circles', characterData.armor.totalCircles.toString());
            
            // 13) All equipment - including backpack selection, items, gold, and equipped
            localStorage.setItem('zevi-equipment', JSON.stringify(characterData.equipment));
            if (characterData.equipment.backpackEnabled !== undefined) {
                localStorage.setItem('zevi-backpack-enabled', characterData.equipment.backpackEnabled.toString());
            }
            
            // 14) Journal
            localStorage.setItem('zevi-journal-entries', JSON.stringify(characterData.journal.entries));
            
            // 15) Details
            localStorage.setItem('zevi-character-details', JSON.stringify(characterData.details));
            
            // 16) Experiences
            localStorage.setItem('zevi-experiences', JSON.stringify(characterData.experiences));
            
            // 17) Domain vault
            if (characterData.domainVault) {
                if (characterData.domainVault.domainCards) {
                    localStorage.setItem('zevi-domain-cards', JSON.stringify(characterData.domainVault.domainCards));
                }
                if (characterData.domainVault.selectedDomains) {
                    localStorage.setItem('zevi-selected-domains', JSON.stringify(characterData.domainVault.selectedDomains));
                }
                if (characterData.domainVault.domainAbilities) {
                    localStorage.setItem('zevi-domain-abilities', JSON.stringify(characterData.domainVault.domainAbilities));
                }
            }
            
            // 18) Effects & features
            if (characterData.effectsFeatures) {
                if (characterData.effectsFeatures.activeEffects) {
                    localStorage.setItem('zevi-active-effects', JSON.stringify(characterData.effectsFeatures.activeEffects));
                }
                if (characterData.effectsFeatures.features) {
                    localStorage.setItem('zevi-features', JSON.stringify(characterData.effectsFeatures.features));
                }
                if (characterData.effectsFeatures.conditions) {
                    localStorage.setItem('zevi-conditions', JSON.stringify(characterData.effectsFeatures.conditions));
                }
            }
            
            // Additional combat stats
            this.setUIElement('#evasionValue', characterData.evasion, 'value');
            localStorage.setItem('zevi-evasion', characterData.evasion.toString());
            
            // Downtime projects
            localStorage.setItem('zevi-projects', JSON.stringify(characterData.downtime.projects));
            
            // UI state restoration
            if (characterData.ui) {
                if (characterData.ui.sectionOrder) {
                    localStorage.setItem('zevi-section-order', characterData.ui.sectionOrder);
                }
                
                // Restore UI colors
                if (characterData.ui.colors) {
                    Object.keys(characterData.ui.colors).forEach(colorKey => {
                        localStorage.setItem(colorKey, characterData.ui.colors[colorKey]);
                    });
                }
            }
            
            console.log('Character state restoration complete:', {
                name: characterData.name,
                level: characterData.level,
                evasion: characterData.evasion,
                equipment: characterData.equipment?.selectedBag,
                hope: characterData.hope.current,
                hp: characterData.hp.circles?.length,
                stress: characterData.stress.circles?.length
            });
            
            // Trigger system refreshes with delay to ensure localStorage is set
            setTimeout(() => {
                this.refreshAllSystems();
            }, 200);
            
            console.log('COMPREHENSIVE character state applied successfully');
        } catch (error) {
            console.error('Error applying character state:', error);
        }
    }
    
    // Clear all character-specific data from localStorage
    clearAllCharacterData() {
        const characterDataKeys = [
            // Core character data
            'zevi-equipment',
            'zevi-journal-entries',
            'zevi-character-details',
            'zevi-experiences',
            'zevi-hope',
            'zevi-max-hope',
            'zevi-projects',
            
            // Combat stats
            'zevi-hp-circles',
            'zevi-stress-circles',
            'zevi-armor-circles',
            'zevi-minor-damage-value',
            'zevi-major-damage-value',
            'zevi-active-armor-count',
            'zevi-total-armor-circles',
            'zevi-evasion',
            
            // Equipment related
            'zevi-backpack-enabled',
            
            // Domain vault
            'zevi-domain-cards',
            'zevi-selected-domains', 
            'zevi-domain-abilities',
            
            // Effects & features
            'zevi-active-effects',
            'zevi-features',
            'zevi-conditions',
            
            // UI state
            'zevi-section-order',
            
            // UI colors (character-specific)
            'zevi-color-main-glass',
            'zevi-color-char-image-border',
            'zevi-color-name-box',
            'zevi-color-ability-scores',
            'zevi-color-hp-stress',
            'zevi-color-active-weapons',
            'zevi-color-armor-section',
            'zevi-color-hope-section',
            'zevi-color-experiences-section'
        ];
        
        characterDataKeys.forEach(key => {
            localStorage.removeItem(key);
        });
        
        console.log('Cleared all character-specific data from localStorage');
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
        
        console.log('Comprehensive character state capture starting...');
        
        // Load current character file
        const currentData = this.loadCharacterFile(this.currentCharacterId);
        if (!currentData) return;
        
        // COMPREHENSIVE DATA CAPTURE - All 18 elements
        const updatedData = {
            ...currentData,
            
            // 1) Name
            name: this.getUIValue('.name-box input[type="text"]') || currentData.name,
            
            // 2) Character image
            imageUrl: this.getCurrentImageUrl() || currentData.imageUrl,
            
            // 3) Site background (theme colors)
            siteBackground: {
                textColor: localStorage.getItem('zevi-text-color') || 'default',
                accentColor: localStorage.getItem('zevi-accent-color') || 'default',
                theme: localStorage.getItem('zevi-theme') || 'default',
                glassColor: localStorage.getItem('zevi-glass-color') || 'default',
                glassOpacity: localStorage.getItem('zevi-glass-opacity') || 'default'
            },
            
            // 4) Level
            level: parseInt(this.getUIValue('#charLevel', 'textContent')) || currentData.level,
            
            // 5) Domains
            domain1: document.querySelectorAll('.name-box .domain-badge')[0]?.textContent || currentData.domain1,
            domain2: document.querySelectorAll('.name-box .domain-badge')[1]?.textContent || currentData.domain2,
            
            // 6) Information (community, ancestry, class, etc)
            subtitle: this.getUIValue('.name-box .subtitle', 'textContent') || currentData.subtitle,
            characterInfo: {
                community: this.getUIValue('#community') || '',
                ancestry: this.getUIValue('#ancestry') || '',
                class: this.getUIValue('#class') || '',
                subclass: this.getUIValue('#subclass') || ''
            },
            
            // 7) Hope tracker
            hope: {
                current: parseInt(localStorage.getItem('zevi-hope')) || currentData.hope.current,
                max: parseInt(localStorage.getItem('zevi-max-hope')) || currentData.hope.max
            },
            
            // 8) Stress tracker
            stress: {
                circles: this.parseJSON(localStorage.getItem('zevi-stress-circles')) || currentData.stress.circles,
                current: this.calculateActiveCircles(this.parseJSON(localStorage.getItem('zevi-stress-circles')) || []),
                max: currentData.stress.max
            },
            
            // 9) HP tracker
            hp: {
                circles: this.parseJSON(localStorage.getItem('zevi-hp-circles')) || currentData.hp.circles,
                current: this.calculateActiveCircles(this.parseJSON(localStorage.getItem('zevi-hp-circles')) || []),
                max: currentData.hp.max
            },
            
            // 10) Damage thresholds
            damage: {
                minor: parseInt(localStorage.getItem('zevi-minor-damage-value')) || currentData.damage.minor,
                major: parseInt(localStorage.getItem('zevi-major-damage-value')) || currentData.damage.major
            },
            
            // 11) Ability scores
            attributes: {},
            
            // 12) Armor tracker
            armor: {
                circles: this.parseJSON(localStorage.getItem('zevi-armor-circles')) || currentData.armor.circles,
                activeCount: parseInt(localStorage.getItem('zevi-active-armor-count')) || currentData.armor.activeCount,
                totalCircles: parseInt(localStorage.getItem('zevi-total-armor-circles')) || currentData.armor.totalCircles,
                current: this.calculateActiveCircles(this.parseJSON(localStorage.getItem('zevi-armor-circles')) || []),
                max: currentData.armor.max
            },
            
            // 13) All equipment - including backpack selection, items, gold, and equipped
            equipment: this.captureCompleteEquipmentState() || currentData.equipment,
            
            // 14) Journal
            journal: {
                entries: this.parseJSON(localStorage.getItem('zevi-journal-entries')) || currentData.journal.entries
            },
            
            // 15) Details
            details: this.parseJSON(localStorage.getItem('zevi-character-details')) || currentData.details,
            
            // 16) Experiences
            experiences: this.parseJSON(localStorage.getItem('zevi-experiences')) || currentData.experiences,
            
            // 17) Domain vault
            domainVault: this.captureDomainVaultState() || currentData.domainVault || {},
            
            // 18) Effects & features
            effectsFeatures: this.captureEffectsFeaturesState() || currentData.effectsFeatures || {},
            
            // Additional combat stats
            evasion: parseInt(this.getUIValue('#evasionValue')) || parseInt(localStorage.getItem('zevi-evasion')) || currentData.evasion,
            
            // Downtime projects
            downtime: {
                projects: this.parseJSON(localStorage.getItem('zevi-projects')) || currentData.downtime.projects
            },
            
            // UI state
            ui: {
                sectionOrder: localStorage.getItem('zevi-section-order'),
                activeTab: this.getActiveTab(),
                colors: this.captureUIColors()
            }
        };
        
        // Collect all attributes
        ['agility', 'strength', 'finesse', 'instinct', 'presence', 'knowledge'].forEach(attr => {
            const value = this.getUIValue(`[data-attribute="${attr}"]`);
            updatedData.attributes[attr] = parseInt(value) || 0;
        });
        
        console.log('Character state captured:', {
            name: updatedData.name,
            level: updatedData.level,
            evasion: updatedData.evasion,
            equipment: !!updatedData.equipment,
            hope: updatedData.hope,
            attributes: updatedData.attributes
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
        
        console.log('Comprehensive character state saved successfully');
        
        // Show auto-save indicator if available
        if (typeof showAutoSaveStatus === 'function') {
            showAutoSaveStatus();
        }
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
    
    // Calculate active circles from circle data
    calculateActiveCircles(circles) {
        if (!Array.isArray(circles)) return 0;
        return circles.filter(circle => circle && circle.active).length;
    }
    
    // Capture complete equipment state including backpack selection
    captureCompleteEquipmentState() {
        try {
            const equipmentData = this.parseJSON(localStorage.getItem('zevi-equipment')) || {};
            
            // Get backpack selection from equipment system
            const backpackSelect = document.querySelector('#backpack-select') || document.querySelector('[data-backpack-type]');
            let selectedBag = 'Standard Backpack';
            
            if (backpackSelect) {
                selectedBag = backpackSelect.value || backpackSelect.dataset.backpackType || 'Standard Backpack';
            }
            
            // Also check if it's stored in the equipment data
            if (equipmentData.selectedBag) {
                selectedBag = equipmentData.selectedBag;
            }
            
            return {
                selectedBag: selectedBag,
                backpackType: selectedBag, // For compatibility
                backpackEnabled: localStorage.getItem('zevi-backpack-enabled') !== 'false',
                items: equipmentData.items || [],
                activeWeapons: equipmentData.activeWeapons || [],
                activeArmor: equipmentData.activeArmor || [],
                gold: equipmentData.gold || 0,
                equipped: equipmentData.equipped || {}
            };
        } catch (error) {
            console.error('Error capturing equipment state:', error);
            return null;
        }
    }
    
    // Capture domain vault state
    captureDomainVaultState() {
        try {
            return {
                domainCards: this.parseJSON(localStorage.getItem('zevi-domain-cards')) || [],
                selectedDomains: this.parseJSON(localStorage.getItem('zevi-selected-domains')) || [],
                domainAbilities: this.parseJSON(localStorage.getItem('zevi-domain-abilities')) || {}
            };
        } catch (error) {
            console.error('Error capturing domain vault state:', error);
            return {};
        }
    }
    
    // Capture effects & features state
    captureEffectsFeaturesState() {
        try {
            return {
                activeEffects: this.parseJSON(localStorage.getItem('zevi-active-effects')) || [],
                features: this.parseJSON(localStorage.getItem('zevi-features')) || [],
                conditions: this.parseJSON(localStorage.getItem('zevi-conditions')) || []
            };
        } catch (error) {
            console.error('Error capturing effects & features state:', error);
            return {};
        }
    }
    
    // Get currently active tab
    getActiveTab() {
        const activeTab = document.querySelector('.tabs button.active');
        return activeTab ? activeTab.dataset.target : 'downtime-tab-content';
    }
    
    // Capture UI color customizations
    captureUIColors() {
        const colors = {};
        const colorKeys = [
            'zevi-color-main-glass',
            'zevi-color-char-image-border', 
            'zevi-color-name-box',
            'zevi-color-ability-scores',
            'zevi-color-hp-stress',
            'zevi-color-active-weapons',
            'zevi-color-armor-section',
            'zevi-color-hope-section',
            'zevi-color-experiences-section'
        ];
        
        colorKeys.forEach(key => {
            const value = localStorage.getItem(key);
            if (value) {
                colors[key] = value;
            }
        });
        
        return colors;
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