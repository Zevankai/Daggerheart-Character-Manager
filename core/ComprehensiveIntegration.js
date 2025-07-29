/**
 * Comprehensive Character Save Integration
 * Integrates the comprehensive save system with the existing application
 * Sets up autosaving, character switching, and creation workflows
 */

class ComprehensiveIntegration {
    constructor() {
        this.autosaveInterval = null;
        this.autosaveDelay = 5000; // 5 seconds
        this.isInitialized = false;
        this.lastSaveTime = 0;
        
        console.log('🔧 ComprehensiveIntegration initializing...');
        this.init();
    }

    async init() {
        // Wait for comprehensive save system to be ready
        if (!window.comprehensiveCharacterSave) {
            console.log('⏳ Waiting for comprehensive save system...');
            setTimeout(() => this.init(), 100);
            return;
        }

        console.log('✅ Comprehensive save system ready, setting up integration...');
        
        // Set up autosaving
        this.setupAutosave();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Load current character if exists
        await this.loadCurrentCharacter();
        
        this.isInitialized = true;
        console.log('🚀 ComprehensiveIntegration ready!');
        
        // Dispatch ready event
        window.dispatchEvent(new CustomEvent('comprehensiveIntegrationReady'));
    }

    /**
     * Set up autosaving system
     */
    setupAutosave() {
        console.log('⚙️ Setting up autosave system...');
        
        // Clear any existing interval
        if (this.autosaveInterval) {
            clearInterval(this.autosaveInterval);
        }

        // Set up periodic autosave
        this.autosaveInterval = setInterval(() => {
            this.performAutosave();
        }, this.autosaveDelay);

        // Set up change detection for immediate saves on important changes
        this.setupChangeDetection();
        
        console.log(`✅ Autosave set up with ${this.autosaveDelay/1000}s interval`);
    }

    /**
     * Set up change detection for immediate saves
     */
    setupChangeDetection() {
        // Save on character name change
        const nameInput = document.querySelector('.name-box input[type="text"]');
        if (nameInput) {
            nameInput.addEventListener('blur', () => this.scheduleImmediateSave());
        }

        // Save on level change
        const levelInput = document.querySelector('#charLevel');
        if (levelInput) {
            levelInput.addEventListener('blur', () => this.scheduleImmediateSave());
        }

        // Save on image upload
        const imageUpload = document.querySelector('#charUpload');
        if (imageUpload) {
            imageUpload.addEventListener('change', () => {
                setTimeout(() => this.scheduleImmediateSave(), 1000); // Allow time for image processing
            });
        }

        // Save on tab switches
        document.querySelectorAll('.tabs button').forEach(button => {
            button.addEventListener('click', () => this.scheduleImmediateSave());
        });

        // Save on circle interactions
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('circle') || 
                e.target.classList.contains('tracker-btn') ||
                e.target.closest('.trackers-wrapper')) {
                this.scheduleImmediateSave();
            }
        });

        // Save on attribute changes
        document.querySelectorAll('.attribute-value').forEach(input => {
            input.addEventListener('change', () => this.scheduleImmediateSave());
        });

        // Save on contenteditable changes
        document.querySelectorAll('[contenteditable="true"]').forEach(element => {
            element.addEventListener('blur', () => this.scheduleImmediateSave());
        });
    }

    /**
     * Schedule an immediate save (debounced)
     */
    scheduleImmediateSave() {
        const now = Date.now();
        if (now - this.lastSaveTime > 1000) { // Debounce to max once per second
            setTimeout(() => this.performAutosave(), 100);
        }
    }

    // Keep old method name for compatibility
    scheduleImediateSave() {
        return this.scheduleImmediateSave();
    }

    /**
     * Perform autosave
     */
    async performAutosave() {
        if (!window.comprehensiveCharacterSave) return;
        
        const currentCharacterId = window.comprehensiveCharacterSave.getCurrentCharacter();
        if (!currentCharacterId) return;

        try {
            const success = window.comprehensiveCharacterSave.saveCharacter(currentCharacterId);
            if (success) {
                this.lastSaveTime = Date.now();
                console.log(`💾 Auto-saved character: ${currentCharacterId}`);
                
                // Show subtle save indicator
                this.showSaveIndicator();
            }
        } catch (error) {
            console.error('❌ Autosave failed:', error);
        }
    }

    /**
     * Show subtle save indicator
     */
    showSaveIndicator() {
        // Remove any existing indicator
        const existing = document.querySelector('.autosave-indicator');
        if (existing) existing.remove();

        // Create new indicator
        const indicator = document.createElement('div');
        indicator.className = 'autosave-indicator';
        indicator.innerHTML = '💾 Saved';
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            background: rgba(76, 175, 80, 0.9);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
        `;
        
        document.body.appendChild(indicator);
        
        // Animate in
        setTimeout(() => indicator.style.opacity = '1', 10);
        
        // Animate out and remove
        setTimeout(() => {
            indicator.style.opacity = '0';
            setTimeout(() => {
                if (document.body.contains(indicator)) {
                    document.body.removeChild(indicator);
                }
            }, 300);
        }, 2000);
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Listen for character creation events
        window.addEventListener('characterCreated', (event) => {
            if (event.detail && event.detail.characterId) {
                this.switchToCharacter(event.detail.characterId);
            }
        });

        // Listen for manual save requests (Ctrl+S)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.performManualSave();
            }
        });

        // Listen for page visibility changes to save before leaving
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.performAutosave();
            }
        });

        // Save before page unload
        window.addEventListener('beforeunload', () => {
            this.performAutosave();
        });
    }

    /**
     * Perform manual save
     */
    async performManualSave() {
        const currentCharacterId = window.comprehensiveCharacterSave?.getCurrentCharacter();
        if (!currentCharacterId) {
            this.showNotification('❌ No character to save', 'error');
            return;
        }

        try {
            const success = window.comprehensiveCharacterSave.saveCharacter(currentCharacterId);
            if (success) {
                this.showNotification('✅ Character saved manually', 'success');
            } else {
                this.showNotification('❌ Save failed', 'error');
            }
        } catch (error) {
            console.error('Manual save failed:', error);
            this.showNotification('❌ Save error: ' + error.message, 'error');
        }
    }

    /**
     * Load current character on startup
     */
    async loadCurrentCharacter() {
        const currentCharacterId = window.comprehensiveCharacterSave?.getCurrentCharacter();
        if (currentCharacterId) {
            console.log(`📂 Loading current character: ${currentCharacterId}`);
            const success = await window.comprehensiveCharacterSave.loadCharacter(currentCharacterId);
            if (success) {
                console.log('✅ Current character loaded successfully');
            } else {
                console.warn('⚠️ Failed to load current character, clearing ID');
                localStorage.removeItem('zevi-current-character-id');
            }
        } else {
            console.log('ℹ️ No current character to load');
        }
    }

    /**
     * Switch to a different character
     */
    async switchToCharacter(characterId) {
        if (!characterId) {
            console.error('❌ No character ID provided for switch');
            return false;
        }

        console.log(`🔄 Switching to character: ${characterId}`);

        try {
            // Save current character first
            const currentId = window.comprehensiveCharacterSave?.getCurrentCharacter();
            if (currentId && currentId !== characterId) {
                await this.performAutosave();
            }

            // Load new character
            const success = await window.comprehensiveCharacterSave.loadCharacter(characterId);
            if (success) {
                console.log('✅ Character switch successful');
                
                // Refresh characters list if on characters tab
                if (window.charactersPageManager) {
                    window.charactersPageManager.refreshCharactersList();
                }
                
                return true;
            } else {
                console.error('❌ Character switch failed');
                return false;
            }
        } catch (error) {
            console.error('❌ Error during character switch:', error);
            return false;
        }
    }

    /**
     * Create a new character
     */
    async createNewCharacter(characterData = {}) {
        console.log('🆕 Creating new character...', characterData);

        try {
            // Save current character first
            await this.performAutosave();

            // Generate new character ID
            const newCharacterId = 'char_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

            // Create default character data
            const defaultData = {
                basicInfo: {
                    name: characterData.name || 'New Character',
                    level: characterData.level || '1',
                    subtitle: 'Community Ancestry Class (Subclass)',
                    domain1: 'Domain 1',
                    domain2: 'Domain 2',
                    imageUrl: characterData.imageUrl || ''
                }
            };

            // Set as current character first
            window.comprehensiveCharacterSave.setCurrentCharacter(newCharacterId);

            // Clear current UI to defaults
            this.clearUIToDefaults();

            // Apply new character data
            if (characterData.name) {
                const nameInput = document.querySelector('.name-box input[type="text"]');
                if (nameInput) nameInput.value = characterData.name;
            }

            if (characterData.level) {
                const levelInput = document.querySelector('#charLevel');
                if (levelInput) levelInput.textContent = characterData.level;
            }

            if (characterData.imageUrl) {
                const charImage = document.querySelector('#charImage');
                const charPlaceholder = document.querySelector('#charPlaceholder');
                if (charImage && charPlaceholder) {
                    charImage.src = characterData.imageUrl;
                    charPlaceholder.style.display = 'none';
                }
            }

            // Save the new character with current state
            const success = window.comprehensiveCharacterSave.saveCharacter(newCharacterId);
            
            if (success) {
                console.log(`✅ New character created: ${newCharacterId}`);
                
                // Dispatch event
                window.dispatchEvent(new CustomEvent('characterCreated', {
                    detail: { characterId: newCharacterId, characterData: defaultData }
                }));
                
                return newCharacterId;
            } else {
                console.error('❌ Failed to save new character');
                return null;
            }
        } catch (error) {
            console.error('❌ Error creating new character:', error);
            return null;
        }
    }

    /**
     * Clear UI to default state
     */
    clearUIToDefaults() {
        console.log('🧹 Clearing UI to defaults...');

        // Clear basic info
        const nameInput = document.querySelector('.name-box input[type="text"]');
        if (nameInput) nameInput.value = 'Character Name';

        const subtitleDiv = document.querySelector('.name-box .subtitle');
        if (subtitleDiv) subtitleDiv.textContent = 'Community Ancestry Class (Subclass)';

        const levelDisplay = document.querySelector('#charLevel');
        if (levelDisplay) levelDisplay.textContent = '5';

        const domain1 = document.querySelector('.domain-badge:first-of-type');
        if (domain1) domain1.textContent = 'Domain 1';

        const domain2 = document.querySelector('.domain-badge:last-of-type');
        if (domain2) domain2.textContent = 'Domain 2';

        // Clear character image
        const charImage = document.querySelector('#charImage');
        const charPlaceholder = document.querySelector('#charPlaceholder');
        if (charImage && charPlaceholder) {
            charImage.src = '';
            charPlaceholder.style.display = 'block';
        }

        // Reset attributes to 0
        document.querySelectorAll('.attribute-value').forEach(input => {
            input.value = '0';
        });

        // Reset evasion
        const evasionInput = document.querySelector('#evasionValue');
        if (evasionInput) evasionInput.value = '10';

        // Reset damage thresholds
        document.querySelectorAll('.damage-value-input').forEach(input => {
            input.value = '0';
        });

        // Clear all localStorage data
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('zevi-') && !key.includes('current-character-id') && !key.includes('comprehensive-character-')) {
                localStorage.removeItem(key);
            }
        });

        // Reset circles if functions exist
        if (window.refreshHPCircles) window.refreshHPCircles();
        if (window.refreshStressCircles) window.refreshStressCircles();
        if (window.refreshArmorCircles) window.refreshArmorCircles();
        if (window.refreshHopeTracker) window.refreshHopeTracker();

        console.log('✅ UI cleared to defaults');
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        const colors = {
            success: '#4CAF50',
            error: '#f44336',
            warning: '#ff9800',
            info: '#2196F3'
        };

        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type] || colors.info};
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            z-index: 10000;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    /**
     * Get integration status
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            autosaveActive: !!this.autosaveInterval,
            currentCharacter: window.comprehensiveCharacterSave?.getCurrentCharacter(),
            lastSaveTime: this.lastSaveTime
        };
    }

    /**
     * Cleanup
     */
    destroy() {
        if (this.autosaveInterval) {
            clearInterval(this.autosaveInterval);
            this.autosaveInterval = null;
        }
        console.log('🧹 ComprehensiveIntegration destroyed');
    }
}

// Initialize and expose globally
window.ComprehensiveIntegration = ComprehensiveIntegration;
window.comprehensiveIntegration = new ComprehensiveIntegration();

console.log('🚀 ComprehensiveIntegration system loaded');