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
            
            // Parse subtitle into individual components for compatibility
            ...this.parseSubtitleIntoComponents(this.getSubtitleFromUI()),
            
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
            
            // Data from character-specific localStorage
            hope: this.getCharacterSpecificData('zevi-hope') || { current: 0, max: 6 },
            stress: this.getStressFromStorage(),
            hp: this.getHPFromStorage(),
            armor: this.getArmorFromStorage(),
            
            // Complex data from character-specific localStorage
            equipment: this.getCharacterSpecificData('zevi-equipment') || this.defaultCharacterState.equipment,
            journal: { entries: this.getCharacterSpecificData('zevi-journal-entries') || [] },
            details: this.getCharacterSpecificData('zevi-character-details') || { personal: {}, physical: {} },
            experiences: this.getCharacterSpecificData('zevi-experiences') || [],
            downtime: { projects: this.getCharacterSpecificData('zevi-projects') || [] },
            
            // Game systems
            domainVault: {
                domainCards: this.getCharacterSpecificData('zevi-domain-cards') || [],
                selectedDomains: this.getCharacterSpecificData('zevi-selected-domains') || [],
                domainAbilities: this.getCharacterSpecificData('zevi-domain-abilities') || {}
            },
            effectsFeatures: {
                activeEffects: this.getCharacterSpecificData('zevi-active-effects') || [],
                features: this.getCharacterSpecificData('zevi-features') || [],
                conditions: this.getCharacterSpecificData('zevi-conditions') || []
            },
            
            // Appearance settings
            appearanceSettings: this.getCurrentAppearanceSettings(),
            
            // UI preferences (character-specific)
            ui: {
                sectionOrder: this.getCharacterSpecificValue('zevi-section-order'),
                activeTab: this.getActiveTab(),
                backpackEnabled: this.getCharacterSpecificValue('zevi-backpack-enabled') === 'true',
                characterNameFontSize: this.getCharacterSpecificValue('zevi-character-name-font-size') || '2rem',
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

    parseSubtitleIntoComponents(subtitle) {
        // Parse subtitle like "Community Ancestry Class (Subclass)" into individual fields
        if (!subtitle || subtitle === 'Community Ancestry Class (Subclass)') {
            return {
                ancestry: '',
                class: '',
                subclass: '',
                characterInfo: {
                    community: '',
                    ancestry: '',
                    class: '',
                    subclass: ''
                }
            };
        }

        // Try to parse the subtitle into components
        // Expected format: "Community Ancestry Class (Subclass)" or variations
        const parts = subtitle.split(' ');
        
        // Look for parentheses to identify subclass
        const subclassMatch = subtitle.match(/\(([^)]+)\)/);
        const subclass = subclassMatch ? subclassMatch[1] : '';
        
        // Remove the subclass part to get the remaining parts
        const withoutSubclass = subtitle.replace(/\s*\([^)]*\)\s*/, '').trim();
        const remainingParts = withoutSubclass.split(' ').filter(part => part.length > 0);
        
        // Attempt to identify community, ancestry, and class
        // This is a best-guess parsing since the format can vary
        let community = '';
        let ancestry = '';
        let characterClass = '';
        
        if (remainingParts.length >= 3) {
            community = remainingParts[0];
            ancestry = remainingParts[1];
            characterClass = remainingParts.slice(2).join(' ');
        } else if (remainingParts.length === 2) {
            ancestry = remainingParts[0];
            characterClass = remainingParts[1];
        } else if (remainingParts.length === 1) {
            characterClass = remainingParts[0];
        }

        return {
            ancestry: ancestry,
            class: characterClass,
            subclass: subclass,
            characterInfo: {
                community: community,
                ancestry: ancestry,
                class: characterClass,
                subclass: subclass
            }
        };
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
            circles: this.getCharacterSpecificData('zevi-stress-circles') || Array(4).fill({ active: false }),
            current: parseInt(this.getCharacterSpecificValue('zevi-stress-current')) || 0,
            max: 4
        };
    }

    getHPFromStorage() {
        return {
            circles: this.getCharacterSpecificData('zevi-hp-circles') || Array(4).fill({ active: true }),
            current: parseInt(this.getCharacterSpecificValue('zevi-hp-current')) || 4,
            max: 4
        };
    }

    getArmorFromStorage() {
        return {
            circles: this.getCharacterSpecificData('zevi-armor-circles') || Array(4).fill({ active: false }),
            current: parseInt(this.getCharacterSpecificValue('zevi-armor-current')) || 0,
            max: 4,
            activeCount: parseInt(this.getCharacterSpecificValue('zevi-active-armor-count')) || 0,
            totalCircles: parseInt(this.getCharacterSpecificValue('zevi-total-armor-circles')) || 4
        };
    }

    getCurrentAppearanceSettings() {
        return {
            theme: document.body.getAttribute('data-theme') || 'auto',
            accentColor: getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || '#ffd700',
            accentColorLight: this.getCharacterSpecificValue('zevi-custom-accent-light'),
            accentColorDark: this.getCharacterSpecificValue('zevi-custom-accent-dark'),
            glassColor: this.getCharacterSpecificValue('zevi-glass-color') || '#ffffff',
            glassOpacity: parseInt(this.getCharacterSpecificValue('zevi-glass-opacity')) || 10,
            backgroundImage: this.getCharacterSpecificValue('zevi-background-image'),
            glassmorphicTint: this.getCharacterSpecificValue('zevi-glassmorphic-tint'),
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
        
        // First, reset all character state to ensure fresh slate
        await this.resetCharacterState();
        
        // Set the current character ID
        this.setCurrentCharacterId(characterId);
        
        // Apply appearance settings if they exist
        if (characterData && characterData.appearanceSettings) {
            await this.applyAppearanceSettings(characterData.appearanceSettings);
        }
        
        // Apply UI preferences if they exist
        if (characterData && characterData.ui) {
            await this.applyUIPreferences(characterData.ui);
        }
        
        // Load the character data into the app
        if (window.app && window.app.loadCharacterFromData) {
            await window.app.loadCharacterFromData(characterData);
        }
        
        // Force re-render all modules with fresh data
        await this.reRenderAllModules();
        
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
            this.setCharacterSpecificValue('zevi-custom-accent-base', settings.accentColor);
        }
        
        // Apply accent color variations
        if (settings.accentColorLight) {
            this.setCharacterSpecificValue('zevi-custom-accent-light', settings.accentColorLight);
        }
        if (settings.accentColorDark) {
            this.setCharacterSpecificValue('zevi-custom-accent-dark', settings.accentColorDark);
        }
        
        // Apply glass color and opacity
        if (settings.glassColor) {
            this.setCharacterSpecificValue('zevi-glass-color', settings.glassColor);
        }
        if (settings.glassOpacity !== undefined) {
            this.setCharacterSpecificValue('zevi-glass-opacity', settings.glassOpacity.toString());
        }
        
        // Apply glassmorphic tint
        if (settings.glassmorphicTint) {
            this.setCharacterSpecificValue('zevi-glassmorphic-tint', settings.glassmorphicTint);
        }
        
        // Apply background image
        if (settings.backgroundImage) {
            this.setCharacterSpecificValue('zevi-background-image', settings.backgroundImage);
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

    async applyUIPreferences(ui) {
        if (!ui) return;
        
        console.log('🎨 Applying UI preferences:', ui);
        
        // Apply backpack setting
        if (ui.backpackEnabled !== undefined) {
            // Update the UI toggle if it exists
            const backpackToggle = document.querySelector('#backpack-enabled');
            if (backpackToggle) {
                backpackToggle.checked = ui.backpackEnabled;
                // Trigger the change event to update the UI
                backpackToggle.dispatchEvent(new Event('change'));
            }
        }
        
        // Apply character name font size
        if (ui.characterNameFontSize) {
            const characterNameElement = document.querySelector('#character-name');
            if (characterNameElement) {
                characterNameElement.style.fontSize = ui.characterNameFontSize;
            }
        }
        
        // Apply section order
        if (ui.sectionOrder && window.applySectionOrder) {
            window.applySectionOrder(ui.sectionOrder);
        }
        
        console.log('✅ UI preferences applied');
    }

    // Reset all character state to ensure fresh slate for new character
    async resetCharacterState() {
        console.log('🔄 Resetting character state for fresh slate...');
        
        try {
            // Reset global module variables
            this.resetModuleGlobals();
            
            // Clear UI elements
            this.clearUIElements();
            
            // Reset form inputs to defaults
            this.resetFormInputs();
            
            console.log('✅ Character state reset complete');
        } catch (error) {
            console.error('Error resetting character state:', error);
        }
    }

    // Reset global variables used by modules
    resetModuleGlobals() {
        // Reset HP/Stress global variables
        if (window.hpCircles) {
            window.hpCircles = Array(4).fill({ active: true });
        }
        if (window.stressCircles) {
            window.stressCircles = Array(4).fill({ active: false });
        }
        if (window.armorCircles) {
            window.armorCircles = Array(4).fill({ active: false });
        }
        
        // Reset hope variables
        if (window.currentHope !== undefined) {
            window.currentHope = 0;
        }
        if (window.currentMaxHope !== undefined) {
            window.currentMaxHope = 6;
        }
        
        // Reset equipment data
        if (window.equipmentData) {
            window.equipmentData = {
                weapons: [], armor: [], accessories: [], consumables: [], 
                treasures: [], tools: [], materials: []
            };
        }
        
        // Reset journal entries
        if (window.journalEntries) {
            window.journalEntries = [];
        }
        
        // Reset experiences
        if (window.experiences) {
            window.experiences = [];
        }
        
        // Reset projects
        if (window.projects) {
            window.projects = [];
        }
        
        // Reset character details
        if (window.characterDetails) {
            window.characterDetails = { personal: {}, physical: {} };
        }
        
        // Reset domain vault
        if (window.domainVaultData) {
            window.domainVaultData = {
                equippedCards: [null, null, null, null, null],
                availableCards: [],
                selectedDomains: [],
                domainAbilities: {}
            };
        }
        
        // Reset effects and features
        if (window.effectsFeaturesData) {
            window.effectsFeaturesData = {
                activeEffects: [],
                features: [],
                conditions: []
            };
        }
    }

    // Clear UI elements to default state
    clearUIElements() {
        // Clear character name and subtitle
        const nameEditor = document.querySelector('.character-name-editor');
        if (nameEditor) {
            nameEditor.textContent = 'Character Name';
        }
        
        const subtitle = document.querySelector('.subtitle');
        if (subtitle) {
            subtitle.textContent = 'Community Ancestry Class (Subclass)';
        }
        
        // Clear character image
        const charImage = document.getElementById('charImage');
        const charPlaceholder = document.getElementById('charPlaceholder');
        if (charImage && charPlaceholder) {
            charImage.src = '';
            charImage.style.display = 'none';
            charPlaceholder.style.display = 'block';
        }
        
        // Clear level
        const levelElement = document.querySelector('.level');
        if (levelElement) {
            levelElement.textContent = '1';
        }
        
        // Clear ability scores
        const abilities = ['agility', 'strength', 'finesse', 'instinct', 'presence', 'knowledge'];
        abilities.forEach(ability => {
            const element = document.getElementById(ability);
            if (element) {
                element.textContent = '0';
            }
        });
        
        // Clear evasion and damage values
        const evasionElement = document.getElementById('evasionValue');
        if (evasionElement) {
            evasionElement.textContent = '10';
        }
        
        const minorDamage = document.getElementById('minor-damage-value');
        const majorDamage = document.getElementById('major-damage-value');
        if (minorDamage) minorDamage.value = '1';
        if (majorDamage) majorDamage.value = '2';
    }

    // Reset form inputs to defaults
    resetFormInputs() {
        // Reset all text inputs, textareas, and selects in character forms
        const characterForms = document.querySelectorAll('.tab-panel');
        characterForms.forEach(form => {
            // Clear text inputs and textareas
            form.querySelectorAll('input[type="text"], input[type="number"], textarea').forEach(input => {
                if (input.id !== 'minor-damage-value' && input.id !== 'major-damage-value') {
                    input.value = '';
                }
            });
            
            // Reset checkboxes
            form.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                checkbox.checked = false;
            });
            
            // Reset select elements
            form.querySelectorAll('select').forEach(select => {
                select.selectedIndex = 0;
            });
        });
        
        // Clear dynamic content areas
        const dynamicContainers = [
            'journal-entries-container',
            'experiences-list',
            'projects-container',
            'equipment-list',
            'domain-cards-container',
            'effects-features-container'
        ];
        
        dynamicContainers.forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = '';
            }
                 });
     }

     // Force re-render all modules to use fresh character data
     async reRenderAllModules() {
         console.log('🔄 Re-rendering all modules with fresh data...');
         
         try {
             // Re-render HP/Stress circles
             if (window.renderHPCircles) {
                 window.renderHPCircles();
             }
             if (window.renderStressCircles) {
                 window.renderStressCircles();
             }
             if (window.renderArmorCircles) {
                 window.renderArmorCircles();
             }
             
             // Re-render hope circles
             if (window.renderHopeCircles) {
                 window.renderHopeCircles();
             }
             
             // Re-render equipment
             if (window.renderEquipmentCategories) {
                 window.renderEquipmentCategories();
             }
             
             // Re-render journal
             if (window.renderJournalEntries) {
                 window.renderJournalEntries();
             }
             
             // Re-render experiences
             if (window.renderExperiences) {
                 window.renderExperiences();
             }
             
             // Re-render projects
             if (window.renderProjects) {
                 window.renderProjects();
             }
             
             // Re-render character details
             if (window.initializeDetailsTab) {
                 window.initializeDetailsTab();
             }
             
             // Re-render domain vault
             if (window.initializeDomainVault) {
                 window.initializeDomainVault();
             }
             
             // Re-render effects and features
             if (window.initializeEffectsFeatures) {
                 window.initializeEffectsFeatures();
             }
             
             console.log('✅ All modules re-rendered with fresh data');
         } catch (error) {
             console.error('Error re-rendering modules:', error);
         }
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

    // Get character-specific data from localStorage
    getCharacterSpecificData(key) {
        const currentCharacterId = this.getCurrentCharacterId();
        if (!currentCharacterId) {
            // Fallback to global key if no character ID
            return this.parseJSON(localStorage.getItem(key));
        }
        
        const characterKey = `${key}-${currentCharacterId}`;
        const characterData = this.parseJSON(localStorage.getItem(characterKey));
        
        // If character-specific data doesn't exist, try the global key as fallback
        if (characterData === null) {
            return this.parseJSON(localStorage.getItem(key));
        }
        
        return characterData;
    }

    // Get character-specific simple value from localStorage
    getCharacterSpecificValue(key) {
        const currentCharacterId = this.getCurrentCharacterId();
        if (!currentCharacterId) {
            // Fallback to global key if no character ID
            return localStorage.getItem(key);
        }
        
        const characterKey = `${key}-${currentCharacterId}`;
        const characterValue = localStorage.getItem(characterKey);
        
        // If character-specific data doesn't exist, try the global key as fallback
        if (characterValue === null) {
            return localStorage.getItem(key);
        }
        
        return characterValue;
    }

    // Set character-specific simple value in localStorage
    setCharacterSpecificValue(key, value) {
        const currentCharacterId = this.getCurrentCharacterId();
        if (!currentCharacterId) {
            // Fallback to global key if no character ID
            localStorage.setItem(key, value);
            return;
        }
        
        const characterKey = `${key}-${currentCharacterId}`;
        localStorage.setItem(characterKey, value);
    }

    // Universal helper for modules to trigger auto-save instead of localStorage
    static triggerAutoSaveInsteadOfLocalStorage() {
        // Trigger auto-save to persist all current data to database
        if (window.app?.autoSave?.triggerSave) {
            window.app.autoSave.triggerSave();
        }
        
        // Optional: Show a brief save indicator
        if (window.showBriefSaveIndicator) {
            window.showBriefSaveIndicator();
        }
    }

    // Helper for modules to replace localStorage.setItem calls
    static saveCharacterData() {
        console.log('💾 Module triggered character data save');
        CharacterData.triggerAutoSaveInsteadOfLocalStorage();
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