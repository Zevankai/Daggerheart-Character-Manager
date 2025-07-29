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
        
        // Create cleanup button
        const cleanupBtn = document.createElement('button');
        cleanupBtn.id = 'cleanupBtn';
        cleanupBtn.className = 'cleanup-btn';
        cleanupBtn.innerHTML = '🧹 Free Storage';
        cleanupBtn.onclick = () => this.performCleanup();
        cleanupBtn.title = 'Clean up old data to free storage space';
        
        // Add to name box at the top
        nameBox.insertBefore(saveBtn, nameBox.firstChild);
        nameBox.insertBefore(cleanupBtn, nameBox.firstChild);
        nameBox.insertBefore(statusDiv, nameBox.firstChild);
        
        console.log('Save and cleanup buttons added to page');
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
            // Clean up old data first to free space
            this.cleanupOldData();
            
            // Collect essential data from the page
            const characterData = this.collectAllData();
            
            console.log('Collected data size:', JSON.stringify(characterData).length, 'characters');
            
            // Check if data is too large
            const dataString = JSON.stringify(characterData);
            if (dataString.length > 1000000) { // 1MB limit
                throw new Error('Character data too large. Try removing some journal entries or equipment.');
            }
            
            // Save to localStorage with character-specific key
            const saveKey = `simple-character-${this.currentCharacterId}`;
            localStorage.setItem(saveKey, dataString);
            
            console.log('Data saved to:', saveKey);
            this.showStatus('✅ SAVED!', 'success');
            
        } catch (error) {
            console.error('Save failed:', error);
            
            if (error.name === 'QuotaExceededError' || error.message.includes('quota')) {
                this.showStatus('❌ Storage full! Try: 1) Clear browser data, 2) Remove journal entries, 3) Remove equipment', 'error');
                this.suggestCleanup();
            } else {
                this.showStatus('❌ Save failed: ' + error.message, 'error');
            }
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
    
    // Get current character image URL (optimized to avoid large data URLs)
    getCurrentImageUrl() {
        const img = document.getElementById('charImage');
        if (img && img.src && !img.src.includes('placeholder')) {
            // Don't save large data URLs to avoid quota issues
            if (img.src.startsWith('data:') && img.src.length > 50000) {
                console.log('Image too large for localStorage, skipping');
                return '';
            }
            return img.src;
        }
        return '';
    }
    
    // Get essential character-related localStorage data (optimized for size)
    getAllLocalStorageData() {
        const data = {};
        
        // Save all essential character data including circle states
        const essentialKeys = [
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
            'zevi-evasion',
            'zevi-backpack-enabled',
            'zevi-domain-cards',
            'zevi-selected-domains',
            'zevi-domain-abilities',
            'zevi-active-effects',
            'zevi-features',
            'zevi-conditions'
        ];
        
        essentialKeys.forEach(key => {
            const value = localStorage.getItem(key);
            if (value) {
                // Compress data if it's JSON
                try {
                    const parsed = JSON.parse(value);
                    // Only save if it's not empty
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        data[key] = value;
                    } else if (typeof parsed === 'object' && Object.keys(parsed).length > 0) {
                        data[key] = value;
                    } else if (typeof parsed !== 'object') {
                        data[key] = value;
                    }
                } catch {
                    // Not JSON, save as is if not empty
                    if (value.trim()) {
                        data[key] = value;
                    }
                }
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
        console.log('=== REFRESHING ALL SYSTEMS ===');
        
        // First, force refresh circle systems with current localStorage data
        setTimeout(() => {
            this.forceRefreshCircles();
        }, 100);
        
        // Then refresh other systems
        setTimeout(() => {
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
            
            console.log('=== SYSTEM REFRESH COMPLETE ===');
        }, 200);
    }
    
    // Force refresh circle displays based on localStorage
    forceRefreshCircles() {
        console.log('Force refreshing circles from localStorage...');
        
        // HP Circles
        const hpData = localStorage.getItem('zevi-hp-circles');
        if (hpData) {
            try {
                const hpCircles = JSON.parse(hpData);
                const hpElements = document.querySelectorAll('.hp-section .circle');
                console.log('HP data:', hpCircles, 'Elements:', hpElements.length);
                
                hpElements.forEach((element, index) => {
                    if (hpCircles[index] && hpCircles[index].active) {
                        element.classList.add('active');
                    } else {
                        element.classList.remove('active');
                    }
                });
            } catch (e) {
                console.error('Error refreshing HP circles:', e);
            }
        }
        
        // Stress Circles
        const stressData = localStorage.getItem('zevi-stress-circles');
        if (stressData) {
            try {
                const stressCircles = JSON.parse(stressData);
                const stressElements = document.querySelectorAll('.stress-section .circle');
                console.log('Stress data:', stressCircles, 'Elements:', stressElements.length);
                
                stressElements.forEach((element, index) => {
                    if (stressCircles[index] && stressCircles[index].active) {
                        element.classList.add('active');
                    } else {
                        element.classList.remove('active');
                    }
                });
            } catch (e) {
                console.error('Error refreshing stress circles:', e);
            }
        }
        
        // Armor Circles
        const armorData = localStorage.getItem('zevi-armor-circles');
        if (armorData) {
            try {
                const armorCircles = JSON.parse(armorData);
                const armorElements = document.querySelectorAll('.armor-section .circle');
                console.log('Armor data:', armorCircles, 'Elements:', armorElements.length);
                
                armorElements.forEach((element, index) => {
                    if (armorCircles[index] && armorCircles[index].active) {
                        element.classList.add('active');
                    } else {
                        element.classList.remove('active');
                    }
                });
            } catch (e) {
                console.error('Error refreshing armor circles:', e);
            }
        }
        
        // Hope Value
        const hopeData = localStorage.getItem('zevi-hope');
        if (hopeData) {
            const hopeDisplay = document.getElementById('hopeValue');
            if (hopeDisplay) {
                hopeDisplay.textContent = hopeData;
                console.log('Hope value set to:', hopeData);
            }
        }
        
        console.log('Circle refresh complete');
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
    
    // Clean up old data to free storage space
    cleanupOldData() {
        try {
            console.log('Cleaning up old data...');
            
            // Remove old character file system data
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('zevi-character-file-') || 
                    key.startsWith('zevi-character-data-')) {
                    localStorage.removeItem(key);
                }
            });
            
            console.log('Old data cleaned up');
        } catch (error) {
            console.error('Error cleaning up:', error);
        }
    }
    
    // Perform cleanup to free storage space
    performCleanup() {
        console.log('=== PERFORMING STORAGE CLEANUP ===');
        this.showStatus('Cleaning up storage...', 'saving');
        
        try {
            let itemsRemoved = 0;
            let spaceFreed = 0;
            
            // Remove old character file system data
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('zevi-character-file-') || 
                    key.startsWith('zevi-character-data-')) {
                    const size = localStorage.getItem(key).length;
                    localStorage.removeItem(key);
                    itemsRemoved++;
                    spaceFreed += size;
                }
            });
            
            console.log(`Cleanup complete: ${itemsRemoved} items removed, ${spaceFreed} characters freed`);
            this.showStatus(`✅ Freed ${Math.round(spaceFreed/1000)}KB of storage!`, 'success');
            
        } catch (error) {
            console.error('Cleanup failed:', error);
            this.showStatus('❌ Cleanup failed: ' + error.message, 'error');
        }
    }
    
    // Suggest cleanup options to user
    suggestCleanup() {
        console.log('=== STORAGE CLEANUP SUGGESTIONS ===');
        console.log('1. Click the "🧹 Free Storage" button');
        console.log('2. Clear browser data: Settings > Privacy > Clear browsing data');
        console.log('3. Remove journal entries you don\'t need');
        console.log('4. Remove equipment items you don\'t need');
        console.log('5. Use smaller character images');
        console.log('6. Run: localStorage.clear() in console (WARNING: loses all data)');
        
        // Show storage usage
        let totalSize = 0;
        Object.keys(localStorage).forEach(key => {
            totalSize += localStorage.getItem(key).length;
        });
        console.log('Total localStorage usage:', totalSize, 'characters');
        
        // Show largest items
        const items = [];
        Object.keys(localStorage).forEach(key => {
            const size = localStorage.getItem(key).length;
            items.push({ key, size });
        });
        items.sort((a, b) => b.size - a.size);
        console.log('Largest localStorage items:');
        items.slice(0, 10).forEach(item => {
            console.log(`- ${item.key}: ${item.size} characters`);
        });
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
                console.log('Saved data size:', savedData.length, 'characters');
                console.log('Saved data:', JSON.parse(savedData));
            }
        }
        
        // Show storage usage
        let totalSize = 0;
        console.log('Current localStorage data:');
        Object.keys(localStorage).forEach(key => {
            const value = localStorage.getItem(key);
            const size = value.length;
            totalSize += size;
            if (key.startsWith('zevi-') || key.startsWith('simple-character-')) {
                console.log(`- ${key}: ${size} characters`);
            }
        });
        console.log('Total storage used:', totalSize, 'characters');
        console.log('Storage limit typically: ~5,000,000 characters');
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
    margin: 5px;
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

.cleanup-btn {
    background: linear-gradient(135deg, #ff9800, #f57c00);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    margin: 5px;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    width: 100%;
    max-width: 150px;
}

.cleanup-btn:hover {
    background: linear-gradient(135deg, #f57c00, #ff9800);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
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
    font-size: 12px;
    line-height: 1.2;
}

.simple-save-status.saving {
    color: #ff9800;
}
`;
document.head.appendChild(style);

// Make debug function available
window.debugSimpleSave = () => window.simpleCharacterSave.debug();