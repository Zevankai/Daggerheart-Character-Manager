/**
 * Simple Application Controller - NO SAVE FUNCTIONALITY
 * Just coordinates basic modules and manages simple application state
 */
class AppController {
    constructor() {
        this.characterData = null;
        this.uiManager = null;
        this.initialized = false;
    }

    // Initialize the application
    async initialize() {
        if (this.initialized) {
            console.log('App already initialized');
            return;
        }

        console.log('=== INITIALIZING SIMPLE APPLICATION ===');

        try {
            // Initialize core modules (simplified)
            this.characterData = new CharacterData();
            this.uiManager = new UIManager();

            this.initialized = true;
            console.log('✅ Application initialized successfully');

            // Make globally available
            window.app = this;

        } catch (error) {
            console.error('❌ Failed to initialize application:', error);
            throw error;
        }
    }

    // Get current character data (no saving)
    getCurrentCharacterData() {
        if (!this.characterData) {
            console.warn('CharacterData not initialized');
            return null;
        }
        return this.characterData.collectAllCharacterData();
    }

    // Set current character ID
    setCurrentCharacterId(id) {
        if (this.characterData) {
            this.characterData.setCurrentCharacterId(id);
        }
    }

    // Get current character ID  
    getCurrentCharacterId() {
        return this.characterData ? this.characterData.getCurrentCharacterId() : null;
    }

    // Apply character data to UI (loads a character)
    applyCharacterDataToUI(data) {
        console.log('📂 Loading character data into UI:', data?.name);
        
        if (!data) {
            console.warn('No character data provided');
            return;
        }

        try {
            // Basic character info
            this.setUIValue('.character-name-editor', data.name || 'New Character', 'textContent');
            this.setUIValue('.subtitle', data.subtitle || 'Community Ancestry Class (Subclass)', 'textContent');
            this.setUIValue('#charLevel', data.level || 1, 'textContent');
            this.setUIValue('#domain1', data.domain1 || 'Domain 1', 'textContent');
            this.setUIValue('#domain2', data.domain2 || 'Domain 2', 'textContent');
            
            // Character image
            const img = document.getElementById('charImage');
            const placeholder = document.getElementById('charPlaceholder');
            if (img && placeholder) {
                if (data.imageUrl) {
                    img.src = data.imageUrl;
                    img.style.display = 'block';
                    placeholder.style.display = 'none';
                } else {
                    img.src = '';
                    img.style.display = 'none';
                    placeholder.style.display = 'block';
                }
            }

            // Background image
            if (data.appearanceSettings?.backgroundImage) {
                document.body.style.backgroundImage = `url('${data.appearanceSettings.backgroundImage}')`;
                console.log('🏞️ Background image applied from character data');
            } else {
                document.body.style.backgroundImage = '';
                console.log('🏞️ Background image cleared (character has none)');
            }

            // Glassmorphic settings
            if (data.appearanceSettings) {
                const glassColor = data.appearanceSettings.glassColor || '#ffffff';
                const glassOpacity = data.appearanceSettings.glassOpacity || 10;
                
                // Apply glassmorphic settings
                this.applyGlassmorphicSettings(glassColor, glassOpacity);
                
                // Update UI controls
                const glassColorPicker = document.getElementById('glassColorPicker');
                const glassOpacitySlider = document.getElementById('glassOpacitySlider');
                const glassOpacityValue = document.getElementById('glassOpacityValue');
                
                if (glassColorPicker) glassColorPicker.value = glassColor;
                if (glassOpacitySlider) glassOpacitySlider.value = glassOpacity;
                if (glassOpacityValue) glassOpacityValue.textContent = `${glassOpacity}%`;
                
                console.log('🌈 Glassmorphic settings applied:', { color: glassColor, opacity: glassOpacity });
            }

            // Ability scores
            if (data.attributes) {
                Object.entries(data.attributes).forEach(([attr, value]) => {
                    this.setUIValue(`#${attr}`, value || 0, 'textContent');
                });
            }

            // Combat stats
            this.setUIValue('#evasionValue', data.evasion || 10, 'textContent');
            this.setUIValue('#minor-damage-value', data.damage?.minor || 1, 'value');
            this.setUIValue('#major-damage-value', data.damage?.major || 2, 'value');

            // Set global variables for modules
            window.currentHope = data.hope?.current || 0;
            window.currentMaxHope = data.hope?.max || 6;
            window.hpCircles = data.hp?.circles || Array(4).fill({active: true});
            window.stressCircles = data.stress?.circles || Array(4).fill({active: false});
            window.armorCircles = data.armor?.circles || Array(4).fill({active: false});
            window.totalArmorCircles = data.armor?.totalCircles || 4;
            window.activeArmorCount = data.armor?.activeCount || 0;

            // Module data
            window.equipmentData = data.equipment || {};
            window.journalEntries = data.journal?.entries || [];
            window.characterDetails = data.details || {};
            window.experiences = data.experiences || [];
            window.projects = data.downtime?.projects || [];
            window.domainVaultData = data.domainVault || {};
            window.effectsFeaturesData = data.effectsFeatures || {};

            // Re-render all modules
            this.reRenderAllModules();

            console.log('✅ Character data loaded successfully');
        } catch (error) {
            console.error('❌ Failed to apply character data:', error);
            alert('Failed to load character: ' + error.message);
        }
    }

    // Re-render all modules after loading character data
    reRenderAllModules() {
        console.log('🔄 Re-rendering all modules...');
        
        try {
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

            // Re-render circles (hope, HP, stress, armor)
            if (window.renderHopeCircles) {
                window.renderHopeCircles();
            }
            if (window.renderHPCircles) {
                window.renderHPCircles();
            }
            if (window.renderStressCircles) {
                window.renderStressCircles();
            }
            if (window.renderArmorCircles) {
                window.renderArmorCircles();
            }
            
            console.log('✅ All modules re-rendered');
        } catch (error) {
            console.error('Error re-rendering modules:', error);
        }
    }

    // Apply glassmorphic settings (color and opacity)
    applyGlassmorphicSettings(glassColor, glassOpacity) {
        try {
            const root = document.documentElement;
            
            // Convert hex to RGB
            const hexToRgb = (hex) => {
                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? {
                    r: parseInt(result[1], 16),
                    g: parseInt(result[2], 16),
                    b: parseInt(result[3], 16)
                } : null;
            };
            
            const rgb = hexToRgb(glassColor);
            if (!rgb) {
                console.error('Invalid glass color:', glassColor);
                return;
            }
            
            // Convert opacity percentage to decimal
            const opacity = glassOpacity / 100;
            const rgbaColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
            
            // Apply CSS variable
            root.style.setProperty('--glass-background-color', rgbaColor);
            
        } catch (error) {
            console.error('Error applying glassmorphic settings:', error);
        }
    }

    // Utility method to set UI values
    setUIValue(selector, value, property = 'textContent') {
        const element = document.querySelector(selector);
        if (element) {
            element[property] = value;
        }
    }
}

// Make globally available
if (typeof window !== 'undefined') {
    window.AppController = AppController;
}