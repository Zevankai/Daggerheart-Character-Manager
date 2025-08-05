/**
 * Character State Container
 * Each character gets their own isolated "folder" of data
 */
class CharacterState {
    constructor(characterId) {
        this.characterId = characterId;
        this.data = this.createFreshState();
        this.isActive = false;
    }

    // Create a completely fresh character state
    createFreshState() {
        return {
            // Basic character info
            name: 'Character Name',
            subtitle: 'Community Ancestry Class (Subclass)',
            level: 1,
            imageUrl: '',
            
            // Ability scores
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
            damage: {
                minor: 1,
                major: 2
            },
            
            // Hope system
            hope: {
                current: 0,
                max: 6
            },
            
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
                totalCircles: 4,
                activeCount: 0
            },
            
            // Equipment
            equipment: {
                weapons: [],
                armor: [],
                accessories: [],
                consumables: [],
                treasures: [],
                tools: [],
                materials: []
            },
            
            // Journal
            journal: {
                entries: []
            },
            
            // Character details
            details: {
                personal: {},
                physical: {}
            },
            
            // Experiences
            experiences: [],
            
            // Downtime projects
            downtime: {
                projects: []
            },
            
            // Domain vault
            domainVault: {
                equippedCards: [null, null, null, null, null],
                domainCards: [],
                selectedDomains: [],
                domainAbilities: {}
            },
            
            // Effects and features
            effectsFeatures: {
                activeEffects: [],
                features: [],
                conditions: []
            },
            
            // UI preferences (character-specific)
            ui: {
                sectionOrder: null,
                backpackEnabled: true,
                characterNameFontSize: '2rem'
            },
            
            // Appearance settings (character-specific)
            appearanceSettings: {
                backgroundImage: null,
                accentColor: null,
                glassmorphicTint: null,
                glassColor: '#ffffff',
                glassOpacity: 10
            }
        };
    }

    // Get a specific piece of data
    get(path) {
        const keys = path.split('.');
        let current = this.data;
        
        for (const key of keys) {
            if (current === null || current === undefined) {
                return undefined;
            }
            current = current[key];
        }
        
        return current;
    }

    // Set a specific piece of data
    set(path, value) {
        const keys = path.split('.');
        let current = this.data;
        
        // Navigate to the parent of the target key
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!(key in current) || typeof current[key] !== 'object') {
                current[key] = {};
            }
            current = current[key];
        }
        
        // Set the final value
        current[keys[keys.length - 1]] = value;
        
        // Auto-save if this character is active
        if (this.isActive && window.app?.autoSave?.triggerSave) {
            window.app.autoSave.triggerSave();
        }
    }

    // Update data from cloud/database
    updateFromCloudData(cloudData) {
        if (!cloudData) return;
        
        // Merge cloud data into the state, preserving structure
        this.data = { ...this.data, ...cloudData };
        
        console.log(`📁 Character ${this.characterId} state updated from cloud`);
    }

    // Get all data for saving to cloud
    getAllData() {
        return { ...this.data };
    }

    // Apply this character's data to the UI and global variables
    applyToUI() {
        console.log(`📂 Opening character ${this.characterId} folder...`);
        
        try {
            // Set as active character
            this.isActive = true;
            
            // Apply basic info to UI
            this.setUIElement('.character-name-editor', this.data.name, 'textContent');
            this.setUIElement('.subtitle', this.data.subtitle, 'textContent');
            this.setUIElement('.level', this.data.level, 'textContent');
            
            // Apply character image
            if (this.data.imageUrl) {
                const img = document.getElementById('charImage');
                const placeholder = document.getElementById('charPlaceholder');
                if (img && placeholder) {
                    img.src = this.data.imageUrl;
                    img.style.display = 'block';
                    placeholder.style.display = 'none';
                }
            }
            
            // Apply ability scores
            Object.entries(this.data.attributes).forEach(([attr, value]) => {
                this.setUIElement(`#${attr}`, value, 'textContent');
            });
            
            // Apply combat stats
            this.setUIElement('#evasionValue', this.data.evasion, 'textContent');
            this.setUIElement('#minor-damage-value', this.data.damage.minor, 'value');
            this.setUIElement('#major-damage-value', this.data.damage.major, 'value');
            
            // Apply hope directly to UI
            this.applyHopeToUI();
            
            // Apply HP/Stress/Armor directly to UI  
            this.applyCirclesToUI();
            
            // Apply data to global variables for modules
            this.applyToGlobals();
            
            // Apply appearance settings
            if (this.data.appearanceSettings && window.app?.characterData?.applyAppearanceSettings) {
                window.app.characterData.applyAppearanceSettings(this.data.appearanceSettings);
            }
            
            // Apply UI preferences
            if (this.data.ui && window.app?.characterData?.applyUIPreferences) {
                window.app.characterData.applyUIPreferences(this.data.ui);
            }
            
            console.log(`✅ Character ${this.characterId} folder opened and applied to UI`);
            
        } catch (error) {
            console.error(`Error applying character ${this.characterId} to UI:`, error);
        }
    }

    // Apply data to global variables that modules use
    applyToGlobals() {
        // Hope
        window.currentHope = this.data.hope.current;
        window.currentMaxHope = this.data.hope.max;
        
        // HP/Stress/Armor
        window.hpCircles = [...this.data.hp.circles];
        window.stressCircles = [...this.data.stress.circles];
        window.armorCircles = [...this.data.armor.circles];
        window.totalArmorCircles = this.data.armor.totalCircles;
        window.activeArmorCount = this.data.armor.activeCount;
        
        // Equipment
        window.equipmentData = { ...this.data.equipment };
        
        // Journal
        window.journalEntries = [...this.data.journal.entries];
        
        // Details
        window.characterDetails = { ...this.data.details };
        
        // Experiences
        window.experiences = [...this.data.experiences];
        
        // Projects
        window.projects = [...this.data.downtime.projects];
        
        // Domain vault
        window.domainVaultData = { ...this.data.domainVault };
        
        // Effects and features
        window.effectsFeaturesData = { ...this.data.effectsFeatures };
    }

    // Apply hope data directly to UI
    applyHopeToUI() {
        const hopeTracker = document.getElementById('hope-tracker');
        if (!hopeTracker) return;
        
        hopeTracker.innerHTML = ''; // Clear existing circles
        
        // Create circles based on character's hope data
        for (let i = 0; i < this.data.hope.max; i++) {
            const circle = document.createElement('div');
            circle.classList.add('hp-circle', 'hope-circle');
            if (i < this.data.hope.current) {
                circle.classList.add('active');
            }
            
            // Add click handler for this circle
            circle.addEventListener('click', () => {
                this.data.hope.current = i + 1;
                this.applyHopeToUI(); // Re-render
                if (window.app?.autoSave?.triggerSave) {
                    window.app.autoSave.triggerSave();
                }
            });
            
            hopeTracker.appendChild(circle);
        }
    }

    // Apply HP/Stress/Armor circles directly to UI
    applyCirclesToUI() {
        // Apply HP circles
        const hpTracker = document.getElementById('hp-tracker');
        if (hpTracker) {
            hpTracker.innerHTML = '';
            this.data.hp.circles.forEach((circle, index) => {
                const circleElement = document.createElement('div');
                circleElement.classList.add('hp-circle');
                if (circle.active) {
                    circleElement.classList.add('active');
                }
                
                circleElement.addEventListener('click', () => {
                    // Fill up to this point (like hope circles)
                    for (let i = 0; i < this.data.hp.circles.length; i++) {
                        this.data.hp.circles[i].active = i <= index;
                    }
                    this.applyCirclesToUI(); // Re-render
                    if (window.app?.autoSave?.triggerSave) {
                        window.app.autoSave.triggerSave();
                    }
                });
                
                hpTracker.appendChild(circleElement);
            });
        }
        
        // Apply Stress circles
        const stressTracker = document.getElementById('stress-tracker');
        if (stressTracker) {
            stressTracker.innerHTML = '';
            this.data.stress.circles.forEach((circle, index) => {
                const circleElement = document.createElement('div');
                circleElement.classList.add('hp-circle', 'stress-circle');
                if (circle.active) {
                    circleElement.classList.add('active');
                }
                
                circleElement.addEventListener('click', () => {
                    // Fill up to this point (like hope circles)
                    for (let i = 0; i < this.data.stress.circles.length; i++) {
                        this.data.stress.circles[i].active = i <= index;
                    }
                    this.applyCirclesToUI(); // Re-render
                    if (window.app?.autoSave?.triggerSave) {
                        window.app.autoSave.triggerSave();
                    }
                });
                
                stressTracker.appendChild(circleElement);
            });
        }
        
        // Apply Armor circles
        const armorTracker = document.getElementById('armor-tracker');
        if (armorTracker) {
            armorTracker.innerHTML = '';
            this.data.armor.circles.forEach((circle, index) => {
                const circleElement = document.createElement('div');
                circleElement.classList.add('hp-circle');
                if (circle.active) {
                    circleElement.classList.add('active');
                }
                
                circleElement.addEventListener('click', () => {
                    // Fill up to this point (like hope circles)
                    for (let i = 0; i < this.data.armor.circles.length; i++) {
                        this.data.armor.circles[i].active = i <= index;
                    }
                    this.applyCirclesToUI(); // Re-render
                    if (window.app?.autoSave?.triggerSave) {
                        window.app.autoSave.triggerSave();
                    }
                });
                
                armorTracker.appendChild(circleElement);
            });
        }
    }

    // Collect current data from UI and globals back into this character's folder
    collectFromUI() {
        console.log(`📥 Collecting data into character ${this.characterId} folder...`);
        
        try {
            // Collect basic info from UI
            this.data.name = this.getUIValue('.character-name-editor', 'textContent') || this.data.name;
            this.data.subtitle = this.getUIValue('.subtitle', 'textContent') || this.data.subtitle;
            this.data.level = parseInt(this.getUIValue('.level', 'textContent')) || this.data.level;
            
            // Collect ability scores
            Object.keys(this.data.attributes).forEach(attr => {
                this.data.attributes[attr] = parseInt(this.getUIValue(`#${attr}`, 'textContent')) || 0;
            });
            
            // Collect combat stats
            this.data.evasion = parseInt(this.getUIValue('#evasionValue', 'textContent')) || 10;
            this.data.damage.minor = parseInt(this.getUIValue('#minor-damage-value', 'value')) || 1;
            this.data.damage.major = parseInt(this.getUIValue('#major-damage-value', 'value')) || 2;
            
            // Collect hope data from UI (it's managed directly by character state now)
            const hopeCircles = document.querySelectorAll('#hope-tracker .hope-circle');
            if (hopeCircles.length > 0) {
                this.data.hope.max = hopeCircles.length;
                this.data.hope.current = document.querySelectorAll('#hope-tracker .hope-circle.active').length;
            }
            
            // Collect circle data from UI (it's managed directly by character state now) 
            const hpCircles = document.querySelectorAll('#hp-tracker .hp-circle');
            if (hpCircles.length > 0) {
                this.data.hp.circles = Array.from(hpCircles).map(circle => ({
                    active: circle.classList.contains('active')
                }));
            }
            
            const stressCircles = document.querySelectorAll('#stress-tracker .stress-circle');
            if (stressCircles.length > 0) {
                this.data.stress.circles = Array.from(stressCircles).map(circle => ({
                    active: circle.classList.contains('active')
                }));
            }
            
            const armorCircles = document.querySelectorAll('#armor-tracker .hp-circle');
            if (armorCircles.length > 0) {
                this.data.armor.circles = Array.from(armorCircles).map(circle => ({
                    active: circle.classList.contains('active')
                }));
                this.data.armor.totalCircles = armorCircles.length;
                this.data.armor.activeCount = document.querySelectorAll('#armor-tracker .hp-circle.active').length;
            }
            
            // Collect from global variables (for modules that still use them)
            this.collectFromGlobals();
            
            console.log(`✅ Data collected into character ${this.characterId} folder`);
            
        } catch (error) {
            console.error(`Error collecting data for character ${this.characterId}:`, error);
        }
    }

    // Collect data from global variables
    collectFromGlobals() {
        // Hope
        if (window.currentHope !== undefined) {
            this.data.hope.current = window.currentHope;
        }
        if (window.currentMaxHope !== undefined) {
            this.data.hope.max = window.currentMaxHope;
        }
        
        // HP/Stress/Armor
        if (window.hpCircles) {
            this.data.hp.circles = [...window.hpCircles];
        }
        if (window.stressCircles) {
            this.data.stress.circles = [...window.stressCircles];
        }
        if (window.armorCircles) {
            this.data.armor.circles = [...window.armorCircles];
        }
        if (window.totalArmorCircles !== undefined) {
            this.data.armor.totalCircles = window.totalArmorCircles;
        }
        if (window.activeArmorCount !== undefined) {
            this.data.armor.activeCount = window.activeArmorCount;
        }
        
        // Equipment
        if (window.equipmentData) {
            this.data.equipment = { ...window.equipmentData };
        }
        
        // Journal
        if (window.journalEntries) {
            this.data.journal.entries = [...window.journalEntries];
        }
        
        // Details
        if (window.characterDetails) {
            this.data.details = { ...window.characterDetails };
        }
        
        // Experiences
        if (window.experiences) {
            this.data.experiences = [...window.experiences];
        }
        
        // Projects
        if (window.projects) {
            this.data.downtime.projects = [...window.projects];
        }
        
        // Domain vault
        if (window.domainVaultData) {
            this.data.domainVault = { ...window.domainVaultData };
        }
        
        // Effects and features
        if (window.effectsFeaturesData) {
            this.data.effectsFeatures = { ...window.effectsFeaturesData };
        }
    }

    // Utility methods for UI interaction
    setUIElement(selector, value, property = 'textContent') {
        const element = document.querySelector(selector);
        if (element) {
            element[property] = value;
        }
    }

    getUIValue(selector, property = 'textContent') {
        const element = document.querySelector(selector);
        return element ? element[property] : null;
    }

    // Mark this character as inactive (when switching away)
    deactivate() {
        this.isActive = false;
        console.log(`📁 Character ${this.characterId} folder closed`);
    }
}

// Character State Manager - manages all character "folders"
class CharacterStateManager {
    constructor() {
        this.characters = new Map(); // characterId -> CharacterState
        this.activeCharacterId = null;
    }

    // Get or create a character's folder
    getCharacterState(characterId) {
        if (!this.characters.has(characterId)) {
            this.characters.set(characterId, new CharacterState(characterId));
            console.log(`📁 Created new folder for character ${characterId}`);
        }
        return this.characters.get(characterId);
    }

    // Switch to a different character's folder
    async switchToCharacter(characterId, cloudData = null) {
        console.log(`🔄 Switching to character ${characterId} folder...`);
        
        // Save current character's data first
        if (this.activeCharacterId) {
            const currentState = this.getCharacterState(this.activeCharacterId);
            currentState.collectFromUI();
            currentState.deactivate();
        }
        
        // Get the new character's folder
        const newState = this.getCharacterState(characterId);
        
        // Update with cloud data if provided
        if (cloudData) {
            newState.updateFromCloudData(cloudData);
        }
        
        // Apply the new character's data to UI
        newState.applyToUI();
        
        // Set as active
        this.activeCharacterId = characterId;
        
        // Force re-render all modules
        await this.reRenderAllModules();
        
        console.log(`✅ Switched to character ${characterId} folder`);
    }

    // Get the current active character's data for saving
    getCurrentCharacterData() {
        if (!this.activeCharacterId) return null;
        
        const currentState = this.getCharacterState(this.activeCharacterId);
        currentState.collectFromUI(); // Collect latest changes
        return currentState.getAllData();
    }

    // Force re-render all modules
    async reRenderAllModules() {
        console.log('🔄 Re-rendering all modules...');
        
        try {
            // Small delay to ensure data is applied
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Re-render various modules
            if (window.renderHPCircles) window.renderHPCircles();
            if (window.renderStressCircles) window.renderStressCircles();
            if (window.renderArmorCircles) window.renderArmorCircles();
            if (window.renderHopeCircles) window.renderHopeCircles();
            if (window.renderEquipmentCategories) window.renderEquipmentCategories();
            if (window.renderJournalEntries) window.renderJournalEntries();
            if (window.renderExperiences) window.renderExperiences();
            if (window.renderProjects) window.renderProjects();
            if (window.initializeDetailsTab) window.initializeDetailsTab();
            if (window.initializeDomainVault) window.initializeDomainVault();
            if (window.initializeEffectsFeatures) window.initializeEffectsFeatures();
            
            console.log('✅ All modules re-rendered');
        } catch (error) {
            console.error('Error re-rendering modules:', error);
        }
    }

    // Clear a character's folder (for deletion)
    clearCharacter(characterId) {
        this.characters.delete(characterId);
        console.log(`🗑️ Deleted folder for character ${characterId}`);
    }
}

// Global instance
window.CharacterStateManager = new CharacterStateManager();

export { CharacterState, CharacterStateManager };