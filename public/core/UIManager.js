/**
 * UI Manager Module
 * Handles all UI updates and DOM manipulation
 */
class UIManager {
    constructor() {
        this.characterData = null;
    }

    // Set character data reference
    setCharacterData(characterData) {
        this.characterData = characterData;
    }

    // Apply character data to UI elements
    applyCharacterDataToUI(data) {
        console.log('=== APPLYING CHARACTER DATA TO UI ===');
        
        // Basic character info
        if (window.characterNameEditor) {
            window.characterNameEditor.setValue(data.name || 'New Character');
        } else {
            this.setUIValue('.character-name-editor', data.name || 'New Character', 'textContent');
        }
        this.setUIValue('.subtitle', data.subtitle || 'Community Ancestry Class (Subclass)');
        this.setUIValue('#charLevel', data.level || 5, 'textContent');
        
        // Domains
        const domainBadges = document.querySelectorAll('.name-box .domain-badge');
        if (domainBadges[0]) domainBadges[0].textContent = data.domain1 || 'Domain 1';
        if (domainBadges[1]) domainBadges[1].textContent = data.domain2 || 'Domain 2';
        
        // Character image
        if (data.imageUrl) {
            const img = document.getElementById('charImage');
            const placeholder = document.getElementById('charPlaceholder');
            if (img && placeholder) {
                img.src = data.imageUrl;
                img.style.display = 'block';
                placeholder.style.display = 'none';
            }
        }
        
        // Ability scores
        if (data.attributes) {
            Object.keys(data.attributes).forEach(attr => {
                const element = document.getElementById(attr);
                if (element) {
                    element.textContent = data.attributes[attr] || 0;
                }
            });
        }
        
        // Evasion
        this.setUIValue('#evasionValue', data.evasion || 10);
        
        // Damage thresholds
        this.setUIValue('#minorDamageValue', data.damage?.minor || 1);
        this.setUIValue('#majorDamageValue', data.damage?.major || 2);
        
        console.log('UI data application complete');
    }

    // Set UI element value
    setUIValue(selector, value, property = 'value') {
        const element = document.querySelector(selector);
        if (element) {
            if (property === 'textContent') {
                element.textContent = value;
            } else if (property === 'innerHTML') {
                element.innerHTML = value;
            } else {
                element.value = value;
            }
        }
    }

    // Get UI element value
    getUIValue(selector, property = 'value') {
        const element = document.querySelector(selector);
        if (element) {
            if (property === 'textContent') {
                return element.textContent;
            } else if (property === 'innerHTML') {
                return element.innerHTML;
            } else {
                return element.value;
            }
        }
        return '';
    }

    // Clear all UI elements to default state
    clearUIToDefaults() {
        console.log('Clearing UI to defaults...');
        
        // Basic info
        if (window.characterNameEditor) {
            window.characterNameEditor.setValue('New Character');
        } else {
            this.setUIValue('.character-name-editor', 'New Character', 'textContent');
        }
        this.setUIValue('.subtitle', 'Community Ancestry Class (Subclass)');
        this.setUIValue('#charLevel', 5, 'textContent');
        
        // Domains
        const domainBadges = document.querySelectorAll('.name-box .domain-badge');
        if (domainBadges[0]) domainBadges[0].textContent = 'Domain 1';
        if (domainBadges[1]) domainBadges[1].textContent = 'Domain 2';
        
        // Character image
        const img = document.getElementById('charImage');
        const placeholder = document.getElementById('charPlaceholder');
        if (img && placeholder) {
            img.style.display = 'none';
            placeholder.style.display = 'block';
        }
        
        // Ability scores
        ['agility', 'strength', 'finesse', 'instinct', 'presence', 'knowledge'].forEach(attr => {
            this.setUIValue(`#${attr}`, 0, 'textContent');
        });
        
        // Evasion
        this.setUIValue('#evasionValue', 10);
        
        // Damage thresholds
        this.setUIValue('#minorDamageValue', 1);
        this.setUIValue('#majorDamageValue', 2);
        
        // Clear circles
        this.clearAllCircles();
        
        console.log('UI cleared to defaults');
    }

    // Clear all circle states
    clearAllCircles() {
        // HP circles
        const hpCircles = document.querySelectorAll('.hp-section .circle');
        hpCircles.forEach((circle, index) => {
            if (index < 4) { // Default HP is 4 active circles
                circle.classList.add('active');
            } else {
                circle.classList.remove('active');
            }
        });
        
        // Stress circles
        const stressCircles = document.querySelectorAll('.stress-section .circle');
        stressCircles.forEach(circle => {
            circle.classList.remove('active');
        });
        
        // Armor circles
        const armorCircles = document.querySelectorAll('.armor-section .circle');
        armorCircles.forEach(circle => {
            circle.classList.remove('active');
        });
        
        // Hope value
        const hopeDisplay = document.getElementById('hopeValue');
        if (hopeDisplay) {
            hopeDisplay.textContent = '0';
        }
    }

    // Refresh circle displays from localStorage
    refreshCircleDisplays() {
        console.log('Refreshing circle displays...');
        
        // HP Circles
        const hpData = localStorage.getItem('zevi-hp-circles');
        if (hpData) {
            try {
                const hpCircles = JSON.parse(hpData);
                const hpElements = document.querySelectorAll('.hp-section .circle');
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
            }
        }
        
        console.log('Circle displays refreshed');
    }

    // Show status message (for feedback)
    showStatus(message, type = 'info') {
        console.log(`[${type.toUpperCase()}] ${message}`);
        
        // Could be extended to show actual UI notifications
        // For now, just console logging
    }
}

// Export for use in other modules
window.UIManager = UIManager;