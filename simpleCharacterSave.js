/**
 * Simple Character Save System
 * Direct approach to character data isolation
 */

class SimpleCharacterSave {
    constructor() {
        this.currentCharacterId = null;
        this.isInitialized = false;
    }
    
    // Initialize the system
    initialize() {
        if (this.isInitialized) return;
        
        console.log('=== SIMPLE CHARACTER SAVE INITIALIZED ===');
        
        // Get current character ID
        this.currentCharacterId = localStorage.getItem('zevi-current-character-id');
        console.log('Current character ID:', this.currentCharacterId);
        
        this.isInitialized = true;
        
        // Add save button if it doesn't exist
        this.ensureSaveButton();
        
        // Load current character data if available
        if (this.currentCharacterId) {
            this.loadCharacterData(this.currentCharacterId);
        }
    }
    
    // Ensure save button exists
    ensureSaveButton() {
        if (document.getElementById('simpleSaveBtn')) return;
        
        const nameBox = document.querySelector('.name-box');
        if (!nameBox) return;
        
        // Create save button
        const saveBtn = document.createElement('button');
        saveBtn.id = 'simpleSaveBtn';
        saveBtn.className = 'simple-save-btn';
        saveBtn.innerHTML = '💾 SAVE CHARACTER';
        saveBtn.onclick = () => this.saveCurrentCharacter();
        
        // Create status div
        const statusDiv = document.createElement('div');
        statusDiv.id = 'simpleSaveStatus';
        statusDiv.className = 'simple-save-status';
        
        // Add to name box at the top
        nameBox.insertBefore(saveBtn, nameBox.firstChild);
        nameBox.insertBefore(statusDiv, nameBox.firstChild);
        
        console.log('Save button added to page');
    }
    
    // Save current character data
    saveCurrentCharacter() {
        if (!this.currentCharacterId) {
            this.showStatus('No character loaded!', 'error');
            return;
        }
        
        console.log('=== SAVING CHARACTER ===', this.currentCharacterId);
        this.showStatus('Saving...', 'saving');
        
        try {
            // Collect ALL data from the page
            const characterData = this.collectAllData();
            
            console.log('Collected data:', characterData);
            
            // Save to localStorage with character-specific key
            const saveKey = `simple-character-${this.currentCharacterId}`;
            localStorage.setItem(saveKey, JSON.stringify(characterData));
            
            console.log('Data saved to:', saveKey);
            this.showStatus('✅ SAVED!', 'success');
            
        } catch (error) {
            console.error('Save failed:', error);
            this.showStatus('❌ Save failed: ' + error.message, 'error');
        }
    }
    
    // Collect all data from the current page
    collectAllData() {
        const data = {
            timestamp: new Date().toISOString(),
            
            // 1. Name
            name: this.getValue('.name-box input[type="text"]'),
            
            // 2. Level  
            level: this.getValue('#charLevel', 'textContent'),
            
            // 3. Subtitle
            subtitle: this.getValue('.name-box .subtitle', 'textContent'),
            
            // 4. Domains
            domain1: this.getValue('.domain-badge:nth-of-type(1)', 'textContent'),
            domain2: this.getValue('.domain-badge:nth-of-type(3)', 'textContent'),
            
            // 5. Attributes
            attributes: {
                agility: this.getValue('[data-attribute="agility"]'),
                strength: this.getValue('[data-attribute="strength"]'),
                finesse: this.getValue('[data-attribute="finesse"]'),
                instinct: this.getValue('[data-attribute="instinct"]'),
                presence: this.getValue('[data-attribute="presence"]'),
                knowledge: this.getValue('[data-attribute="knowledge"]')
            },
            
            // 6. Evasion
            evasion: this.getValue('#evasionValue'),
            
            // 7. Character image
            imageUrl: this.getCurrentImageUrl(),
            
            // 8. All localStorage data
            localStorage: this.getAllLocalStorageData()
        };
        
        return data;
    }
    
    // Get value from element safely
    getValue(selector, property = 'value') {
        const element = document.querySelector(selector);
        if (!element) return '';
        return element[property] || '';
    }
    
    // Get current character image URL
    getCurrentImageUrl() {
        const img = document.getElementById('charImage');
        if (img && img.src && !img.src.includes('placeholder')) {
            return img.src;
        }
        return '';
    }
    
    // Get all character-related localStorage data
    getAllLocalStorageData() {
        const data = {};
        const keys = Object.keys(localStorage);
        
        keys.forEach(key => {
            if (key.startsWith('zevi-') && 
                key !== 'zevi-characters' && 
                key !== 'zevi-current-character-id' &&
                key !== 'zevi-character-directory') {
                data[key] = localStorage.getItem(key);
            }
        });
        
        return data;
    }
    
    // Load character data
    loadCharacterData(characterId) {
        console.log('=== LOADING CHARACTER ===', characterId);
        
        const saveKey = `simple-character-${characterId}`;
        const savedData = localStorage.getItem(saveKey);
        
        if (!savedData) {
            console.log('No saved data found for character:', characterId);
            return;
        }
        
        try {
            const data = JSON.parse(savedData);
            console.log('Loading data:', data);
            
            // Apply data to page
            this.applyDataToPage(data);
            
            this.showStatus('Character loaded', 'success');
            
        } catch (error) {
            console.error('Error loading character data:', error);
            this.showStatus('Error loading character', 'error');
        }
    }
    
    // Apply data to the page
    applyDataToPage(data) {
        // Clear all character-specific localStorage first
        this.clearCharacterLocalStorage();
        
        // 1. Basic info
        this.setValue('.name-box input[type="text"]', data.name);
        this.setValue('#charLevel', data.level, 'textContent');
        this.setValue('.name-box .subtitle', data.subtitle, 'textContent');
        
        // 2. Domains
        this.setValue('.domain-badge:nth-of-type(1)', data.domain1, 'textContent');
        this.setValue('.domain-badge:nth-of-type(3)', data.domain2, 'textContent');
        
        // 3. Attributes
        if (data.attributes) {
            Object.keys(data.attributes).forEach(attr => {
                this.setValue(`[data-attribute="${attr}"]`, data.attributes[attr]);
            });
        }
        
        // 4. Evasion
        this.setValue('#evasionValue', data.evasion);
        
        // 5. Character image
        if (data.imageUrl) {
            this.setCharacterImage(data.imageUrl);
        }
        
        // 6. Restore all localStorage data
        if (data.localStorage) {
            Object.keys(data.localStorage).forEach(key => {
                localStorage.setItem(key, data.localStorage[key]);
            });
        }
        
        // 7. Trigger system refreshes
        setTimeout(() => {
            this.refreshSystems();
        }, 200);
    }
    
    // Set value to element safely
    setValue(selector, value, property = 'value') {
        const element = document.querySelector(selector);
        if (element && value !== undefined && value !== null && value !== '') {
            element[property] = value;
        }
    }
    
    // Set character image
    setCharacterImage(imageUrl) {
        const img = document.getElementById('charImage');
        const placeholder = document.getElementById('charPlaceholder');
        
        if (img && imageUrl) {
            img.src = imageUrl;
            img.style.display = 'block';
            if (placeholder) placeholder.style.display = 'none';
        }
    }
    
    // Clear character-specific localStorage
    clearCharacterLocalStorage() {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('zevi-') && 
                key !== 'zevi-characters' && 
                key !== 'zevi-current-character-id' &&
                key !== 'zevi-character-directory' &&
                key !== 'zevi-theme' &&
                key !== 'zevi-text-color' &&
                key !== 'zevi-accent-color') {
                localStorage.removeItem(key);
            }
        });
    }
    
    // Refresh systems
    refreshSystems() {
        const systems = [
            'initializeHPStress',
            'initializeHope', 
            'initializeEquipment',
            'renderJournalEntries',
            'initializeDetailsTab',
            'renderExperiences'
        ];
        
        systems.forEach(system => {
            if (window[system] && typeof window[system] === 'function') {
                try {
                    console.log('Refreshing:', system);
                    window[system]();
                } catch (error) {
                    console.error('Error refreshing', system, error);
                }
            }
        });
    }
    
    // Show status message
    showStatus(message, type = '') {
        const statusDiv = document.getElementById('simpleSaveStatus');
        if (statusDiv) {
            statusDiv.textContent = message;
            statusDiv.className = 'simple-save-status ' + type;
            
            if (type === 'success' || type === 'error') {
                setTimeout(() => {
                    statusDiv.textContent = '';
                    statusDiv.className = 'simple-save-status';
                }, 3000);
            }
        }
        console.log('Status:', message);
    }
    
    // Switch to character
    switchToCharacter(characterId) {
        console.log('=== SWITCHING TO CHARACTER ===', characterId);
        
        // Save current character first
        if (this.currentCharacterId && this.currentCharacterId !== characterId) {
            this.saveCurrentCharacter();
        }
        
        // Set new character
        this.currentCharacterId = characterId;
        localStorage.setItem('zevi-current-character-id', characterId);
        
        // Load new character data
        this.loadCharacterData(characterId);
    }
    
    // Debug function
    debug() {
        console.log('=== SIMPLE CHARACTER SAVE DEBUG ===');
        console.log('Current Character ID:', this.currentCharacterId);
        console.log('Save button exists:', !!document.getElementById('simpleSaveBtn'));
        
        if (this.currentCharacterId) {
            const saveKey = `simple-character-${this.currentCharacterId}`;
            const savedData = localStorage.getItem(saveKey);
            console.log('Saved data exists:', !!savedData);
            if (savedData) {
                console.log('Saved data:', JSON.parse(savedData));
            }
        }
        
        console.log('Current localStorage data:');
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('zevi-')) {
                console.log(`- ${key}:`, localStorage.getItem(key));
            }
        });
    }
}

// Create global instance
window.simpleCharacterSave = new SimpleCharacterSave();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.simpleCharacterSave.initialize();
        console.log('Simple Character Save ready');
    }, 1000);
});

// Add styles
const style = document.createElement('style');
style.textContent = `
.simple-save-btn {
    background: linear-gradient(135deg, #4CAF50, #45a049);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    font-weight: bold;
    margin: 10px 0;
    transition: all 0.3s ease;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    width: 100%;
    max-width: 200px;
}

.simple-save-btn:hover {
    background: linear-gradient(135deg, #45a049, #4CAF50);
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0,0,0,0.3);
}

.simple-save-status {
    font-size: 14px;
    margin: 5px 0;
    min-height: 20px;
    font-weight: bold;
}

.simple-save-status.success {
    color: #4CAF50;
}

.simple-save-status.error {
    color: #f44336;
}

.simple-save-status.saving {
    color: #ff9800;
}
`;
document.head.appendChild(style);

// Make debug function available
window.debugSimpleSave = () => window.simpleCharacterSave.debug();