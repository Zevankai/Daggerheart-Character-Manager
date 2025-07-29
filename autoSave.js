/**
 * Auto-Save System for Main Character Page
 * Monitors changes to character fields and automatically saves them
 */

class AutoSaveManager {
    constructor() {
        this.saveTimeout = null;
        this.saveDelay = 1000; // Wait 1 second after last change before saving
        this.isInitialized = false;
        this.monitoredFields = new Map();
        
        console.log('AutoSave Manager initialized');
    }

    // Initialize auto-save when DOM is ready
    initialize() {
        if (this.isInitialized) return;
        
        console.log('=== AUTO-SAVE: Initializing field monitoring ===');
        
        // Wait for character manager to be available
        if (!window.characterManager) {
            setTimeout(() => this.initialize(), 100);
            return;
        }
        
        this.setupFieldMonitoring();
        this.isInitialized = true;
        
        console.log('Auto-save monitoring active');
    }

    // Set up monitoring for all character fields
    setupFieldMonitoring() {
        // Character name
        const nameInput = document.querySelector('.name-box input[type="text"]');
        if (nameInput) {
            this.monitorField(nameInput, 'name', (value) => value.trim());
        }

        // Character level
        const levelInput = document.getElementById('charLevel');
        if (levelInput) {
            this.monitorField(levelInput, 'level', (value) => parseInt(value) || 1);
        }

        // Subtitle/Description
        const subtitleInput = document.querySelector('.name-box .subtitle');
        if (subtitleInput) {
            this.monitorField(subtitleInput, 'subtitle', (value) => value.trim());
        }

        // Domain badges
        const domainBadges = document.querySelectorAll('.name-box .domain-badge');
        domainBadges.forEach((badge, index) => {
            this.monitorField(badge, `domain${index + 1}`, (value) => value.trim());
        });

        // Attribute values
        const attributeInputs = document.querySelectorAll('.attribute-value');
        attributeInputs.forEach(input => {
            const attribute = input.getAttribute('data-attribute');
            if (attribute) {
                this.monitorField(input, `attributes.${attribute}`, (value) => parseInt(value) || 0);
            }
        });

        // Evasion
        const evasionInput = document.getElementById('evasionValue');
        if (evasionInput) {
            this.monitorField(evasionInput, 'evasion', (value) => parseInt(value) || 10);
        }

        // HP and Stress values
        this.monitorHPStress();
        
        console.log('Monitoring fields:', Array.from(this.monitoredFields.keys()));
    }

    // Monitor a specific field for changes
    monitorField(element, fieldPath, valueProcessor = (v) => v) {
        if (!element) return;
        
        this.monitoredFields.set(fieldPath, {
            element,
            valueProcessor,
            lastValue: this.getElementValue(element)
        });

        // Add event listeners for different types of inputs
        const events = ['input', 'change', 'blur', 'keyup'];
        
        events.forEach(event => {
            element.addEventListener(event, () => {
                this.handleFieldChange(fieldPath);
            });
        });

        // Special handling for contenteditable elements
        if (element.hasAttribute('contenteditable')) {
            element.addEventListener('input', () => {
                this.handleFieldChange(fieldPath);
            });
        }
    }

    // Monitor HP and Stress trackers
    monitorHPStress() {
        // Monitor HP tracker changes
        const hpTracker = document.getElementById('hp-tracker');
        if (hpTracker) {
            const observer = new MutationObserver(() => {
                this.handleFieldChange('hp');
            });
            observer.observe(hpTracker, { childList: true, subtree: true });
        }

        // Monitor Stress tracker changes
        const stressTracker = document.getElementById('stress-tracker');
        if (stressTracker) {
            const observer = new MutationObserver(() => {
                this.handleFieldChange('stress');
            });
            observer.observe(stressTracker, { childList: true, subtree: true });
        }

        // Monitor Hope tracker changes
        const hopeTracker = document.getElementById('hope-tracker');
        if (hopeTracker) {
            const observer = new MutationObserver(() => {
                this.handleFieldChange('hope');
            });
            observer.observe(hopeTracker, { childList: true, subtree: true });
        }
    }

    // Get value from element based on its type
    getElementValue(element) {
        if (element.hasAttribute('contenteditable')) {
            return element.textContent || element.innerText;
        } else if (element.tagName === 'INPUT') {
            return element.value;
        } else {
            return element.textContent || element.innerText;
        }
    }

    // Handle field change event
    handleFieldChange(fieldPath) {
        console.log(`Field changed: ${fieldPath}`);
        
        // Log current character info for debugging
        if (window.characterManager && window.characterManager.currentCharacter) {
            console.log('Current character when field changed:', window.characterManager.currentCharacter.name, 'ID:', window.characterManager.currentCharacter.id);
        } else {
            console.warn('No current character when field changed!');
        }
        
        // Clear existing timeout
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }
        
        // Set new timeout to save after delay
        this.saveTimeout = setTimeout(() => {
            this.saveCharacterData();
        }, this.saveDelay);
    }

    // Extract current HP values from tracker
    getHPValues() {
        const hpTracker = document.getElementById('hp-tracker');
        if (!hpTracker) return { current: 0, max: 0 };
        
        const filled = hpTracker.querySelectorAll('.hp-pip.filled').length;
        const total = hpTracker.querySelectorAll('.hp-pip').length;
        
        return { current: filled, max: total };
    }

    // Extract current Stress values from tracker
    getStressValues() {
        const stressTracker = document.getElementById('stress-tracker');
        if (!stressTracker) return { current: 0, max: 0 };
        
        const filled = stressTracker.querySelectorAll('.stress-pip.filled').length;
        const total = stressTracker.querySelectorAll('.stress-pip').length;
        
        return { current: filled, max: total };
    }

    // Extract current Hope value from tracker
    getHopeValue() {
        const hopeTracker = document.getElementById('hope-tracker');
        if (!hopeTracker) return 0;
        
        return hopeTracker.querySelectorAll('.hope-pip.filled').length;
    }

    // Collect all current character data from the page
    collectCharacterData() {
        const data = {};
        
        // Collect monitored field values
        for (const [fieldPath, fieldInfo] of this.monitoredFields.entries()) {
            const currentValue = this.getElementValue(fieldInfo.element);
            const processedValue = fieldInfo.valueProcessor(currentValue);
            
            // Handle nested properties (like attributes.agility)
            if (fieldPath.includes('.')) {
                const [parent, child] = fieldPath.split('.');
                if (!data[parent]) data[parent] = {};
                data[parent][child] = processedValue;
            } else {
                data[fieldPath] = processedValue;
            }
        }

        // Collect HP/Stress/Hope values
        data.hp = this.getHPValues();
        data.stress = this.getStressValues();
        data.hope = this.getHopeValue();

        // Add metadata
        data.lastModified = new Date().toISOString();
        
        return data;
    }

    // Save character data
    saveCharacterData() {
        if (!window.characterManager || !window.characterManager.currentCharacter) {
            console.warn('No current character to save');
            return;
        }

        console.log('=== AUTO-SAVE: Saving character data ===');
        
        const currentCharacter = window.characterManager.currentCharacter;
        const characterData = this.collectCharacterData();
        
        console.log('Collected character data:', characterData);
        
        // Update the character object with new data
        Object.assign(currentCharacter, characterData);
        
        // Save to character manager (this updates the characters array)
        const success = window.characterManager.updateCharacterMetadata(currentCharacter.id, characterData);
        
        if (success) {
            console.log('Character data saved successfully to character:', currentCharacter.id);
            
            // IMPORTANT: Save current UI state to character-specific localStorage
            // This ensures that when we switch characters, each has their own data
            this.saveCurrentUIStateToCharacterStorage(currentCharacter.id);
            
            // Update characters list display if it's visible
            if (window.charactersPageManager && typeof window.charactersPageManager.refreshCharactersList === 'function') {
                window.charactersPageManager.refreshCharactersList();
            }
        } else {
            console.error('Failed to save character data');
        }
    }

    // Save current UI state to character-specific localStorage keys
    saveCurrentUIStateToCharacterStorage(characterId) {
        try {
            console.log('Saving UI state to character-specific storage for:', characterId);
            
            // Get current localStorage data that should be character-specific
            const equipment = localStorage.getItem('zevi-equipment');
            const journal = localStorage.getItem('zevi-journal');
            const experiences = localStorage.getItem('zevi-experiences');
            const hope = localStorage.getItem('zevi-hope');
            const downtime = localStorage.getItem('zevi-downtime');

            // Save to character-specific keys
            if (equipment) {
                localStorage.setItem(`zevi-equipment-${characterId}`, equipment);
            }
            if (journal) {
                localStorage.setItem(`zevi-journal-${characterId}`, journal);
            }
            if (experiences) {
                localStorage.setItem(`zevi-experiences-${characterId}`, experiences);
            }
            if (hope) {
                localStorage.setItem(`zevi-hope-${characterId}`, hope);
            }
            if (downtime) {
                localStorage.setItem(`zevi-downtime-${characterId}`, downtime);
            }

            console.log('UI state saved to character-specific storage');
        } catch (error) {
            console.error('Error saving UI state to character storage:', error);
        }
    }

    // Manual save trigger
    saveNow() {
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
            this.saveTimeout = null;
        }
        this.saveCharacterData();
    }
}

// Create global instance
window.autoSaveManager = new AutoSaveManager();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.autoSaveManager.initialize();
    }, 500); // Wait a bit for other scripts to load
});

// Also provide manual save function
window.saveCharacterNow = () => {
    if (window.autoSaveManager) {
        window.autoSaveManager.saveNow();
    }
};