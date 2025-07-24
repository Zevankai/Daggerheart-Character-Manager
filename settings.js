// ===== SETTINGS MODULE =====
// This module handles all settings-related functionality including:
// 1. Accent color customization
// 2. Glassmorphic background tint customization  
// 3. Character data deletion
// 4. Account deletion

// ===== ACCENT COLOR THEME MANAGEMENT =====
function initializeAccentColorPicker() {
    const accentColorPicker = document.getElementById('accentColorPicker');
    const accentColorPreview = document.getElementById('accentColorPreview');
    const resetAccentBtn = document.getElementById('resetAccentColor');
    
    // Load current accent color - prioritize saved custom color
    const savedAccentBase = localStorage.getItem('zevi-custom-accent-base');
    let hexColor;
    
    if (savedAccentBase) {
        hexColor = savedAccentBase;
    } else {
        // Get current computed accent color
        const root = document.documentElement;
        const currentAccentColor = getComputedStyle(root).getPropertyValue('--accent-color').trim();
        
        // Convert RGB to hex if needed
        if (currentAccentColor.startsWith('rgb')) {
            hexColor = rgbToHex(currentAccentColor);
        } else {
            hexColor = currentAccentColor;
        }
    }
    
    accentColorPicker.value = hexColor;
    accentColorPreview.style.backgroundColor = hexColor;
    
    // Handle color change
    accentColorPicker.addEventListener('input', (event) => {
        const newColor = event.target.value;
        changeAccentColor(newColor);
        accentColorPreview.style.backgroundColor = newColor;
    });
    
    // Handle reset to default
    resetAccentBtn.addEventListener('click', () => {
        const defaultColor = '#ffd700'; // Default yellow
        changeAccentColor(defaultColor);
        accentColorPicker.value = defaultColor;
        accentColorPreview.style.backgroundColor = defaultColor;
    });
}

function changeAccentColor(newColor) {
    const root = document.documentElement;
    const currentTheme = document.body.getAttribute('data-theme');
    
    // Calculate a darker version for light theme
    const darkerColor = adjustColorBrightness(newColor, -0.3);
    
    // Set the accent color based on current theme
    const finalColor = (currentTheme === 'light') ? darkerColor : newColor;
    root.style.setProperty('--accent-color', finalColor);
    
    // Update transparent versions of the accent color
    updateAccentColorTransparencies(finalColor);
    
    // Save colors for theme switching
    if (currentTheme === 'light') {
        localStorage.setItem('zevi-custom-accent-light', darkerColor);
    } else {
        localStorage.setItem('zevi-custom-accent-dark', newColor);
    }
    
    // Save the base color for future theme switches
    localStorage.setItem('zevi-custom-accent-base', newColor);
}

function updateAccentColorTransparencies(accentColor) {
    const root = document.documentElement;
    const rgb = hexToRgb(accentColor);
    
    // Update transparent versions
    root.style.setProperty('--accent-color-50', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`);
    root.style.setProperty('--accent-color-70', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)`);
    root.style.setProperty('--accent-color-80', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`);
}

// ===== GLASSMORPHIC BACKGROUND TINT MANAGEMENT =====
function initializeGlassColorPicker() {
    const glassColorPicker = document.getElementById('glassColorPicker');
    const glassColorPreview = document.getElementById('glassColorPreview');
    const glassOpacitySlider = document.getElementById('glassOpacitySlider');
    const glassOpacityValue = document.getElementById('glassOpacityValue');
    const resetGlassBtn = document.getElementById('resetGlassColor');
    
    // Load current glass background color
    const root = document.documentElement;
    const currentGlassColor = getComputedStyle(root).getPropertyValue('--glass-background-color').trim();
    
    // Parse the rgba values
    const rgbaMatch = currentGlassColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d\.]+)?\)/);
    let currentColor = '#ffffff';
    let currentOpacity = 0.1;
    
    if (rgbaMatch) {
        const r = parseInt(rgbaMatch[1]);
        const g = parseInt(rgbaMatch[2]);
        const b = parseInt(rgbaMatch[3]);
        currentOpacity = rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 0.1;
        currentColor = rgbToHex(`rgb(${r}, ${g}, ${b})`);
    }
    
    glassColorPicker.value = currentColor;
    glassOpacitySlider.value = currentOpacity * 100;
    glassOpacityValue.textContent = Math.round(currentOpacity * 100) + '%';
    updateGlassPreview(currentColor, currentOpacity);
    
    // Handle color change
    glassColorPicker.addEventListener('input', (event) => {
        const newColor = event.target.value;
        const opacity = parseFloat(glassOpacitySlider.value) / 100;
        changeGlassBackgroundColor(newColor, opacity);
        updateGlassPreview(newColor, opacity);
    });
    
    // Handle opacity change
    glassOpacitySlider.addEventListener('input', (event) => {
        const opacity = parseFloat(event.target.value) / 100;
        const color = glassColorPicker.value;
        glassOpacityValue.textContent = Math.round(opacity * 100) + '%';
        changeGlassBackgroundColor(color, opacity);
        updateGlassPreview(color, opacity);
    });
    
    // Handle reset to default
    resetGlassBtn.addEventListener('click', () => {
        const defaultColor = '#ffffff';
        const defaultOpacity = 0.1;
        changeGlassBackgroundColor(defaultColor, defaultOpacity);
        glassColorPicker.value = defaultColor;
        glassOpacitySlider.value = defaultOpacity * 100;
        glassOpacityValue.textContent = Math.round(defaultOpacity * 100) + '%';
        updateGlassPreview(defaultColor, defaultOpacity);
    });
}

function changeGlassBackgroundColor(hexColor, opacity) {
    const root = document.documentElement;
    const rgb = hexToRgb(hexColor);
    const newRgbaColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
    
    root.style.setProperty('--glass-background-color', newRgbaColor);
    localStorage.setItem('zevi-glass-color', hexColor);
    localStorage.setItem('zevi-glass-opacity', opacity.toString());
}

function updateGlassPreview(hexColor, opacity) {
    const glassColorPreview = document.getElementById('glassColorPreview');
    const rgb = hexToRgb(hexColor);
    glassColorPreview.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
    glassColorPreview.style.border = '1px solid rgba(255, 255, 255, 0.2)';
    glassColorPreview.style.backdropFilter = 'blur(15px)';
}

// ===== CHARACTER DELETION =====
function initializeCharacterDeletion() {
    const deleteCharBtn = document.getElementById('deleteCharacterBtn');
    const confirmCharDeleteBtn = document.getElementById('confirmCharacterDelete');
    const cancelCharDeleteBtn = document.getElementById('cancelCharacterDelete');
    const charDeleteModal = document.getElementById('characterDeleteModal');
    
    deleteCharBtn.addEventListener('click', () => {
        showCharacterDeleteModal();
    });
    
    confirmCharDeleteBtn.addEventListener('click', () => {
        deleteCharacterData();
        hideCharacterDeleteModal();
    });
    
    cancelCharDeleteBtn.addEventListener('click', () => {
        hideCharacterDeleteModal();
    });
    
    // Close modal when clicking outside
    charDeleteModal.addEventListener('click', (event) => {
        if (event.target === charDeleteModal) {
            hideCharacterDeleteModal();
        }
    });
}

function showCharacterDeleteModal() {
    const modal = document.getElementById('characterDeleteModal');
    modal.style.display = 'flex';
}

function hideCharacterDeleteModal() {
    const modal = document.getElementById('characterDeleteModal');
    modal.style.display = 'none';
}

function deleteCharacterData() {
    // Get all localStorage keys that start with 'zevi-' but exclude settings
    const keysToDelete = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('zevi-') && !key.includes('custom-accent') && !key.includes('glass-') && key !== 'zevi-theme') {
            keysToDelete.push(key);
        }
    }
    
    // Delete character-specific data
    keysToDelete.forEach(key => localStorage.removeItem(key));
    
    // Reset the character sheet to default state
    resetCharacterSheet();
    
    // Show success message
    showNotification('Character data deleted successfully!', 'success');
}

function resetCharacterSheet() {
    // Reset character name and details
    document.querySelector('.name-box input[type="text"]').value = 'Character Name';
    document.querySelector('.name-box .subtitle').textContent = 'Community Ancestry Class (Subclass)';
    document.querySelector('#charLevel').textContent = '5';
    
    // Reset domain badges
    const domainBadges = document.querySelectorAll('.domain-badge');
    domainBadges[0].textContent = 'Domain 1';
    domainBadges[1].textContent = 'Domain 2';
    
    // Reset character image
    const charImage = document.getElementById('charImage');
    const charPlaceholder = document.getElementById('charPlaceholder');
    charImage.src = '';
    charImage.style.display = 'none';
    charPlaceholder.style.display = 'block';
    
    // Reset all editable content to defaults
    document.querySelectorAll('[contenteditable="true"]').forEach(element => {
        if (element.classList.contains('subtitle')) {
            element.textContent = 'Community Ancestry Class (Subclass)';
        } else if (element.classList.contains('domain-badge')) {
            // Already handled above
        } else if (element.id === 'charLevel') {
            element.textContent = '5';
        } else {
            element.textContent = '';
        }
    });
    
    // Reset all input fields
    document.querySelectorAll('input[type="text"], input[type="number"], textarea').forEach(input => {
        if (input.closest('.name-box')) {
            input.value = 'Character Name';
        } else {
            input.value = '';
        }
    });
}

// ===== ACCOUNT DELETION =====
function initializeAccountDeletion() {
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    const confirmAccountDeleteBtn = document.getElementById('confirmAccountDelete');
    const cancelAccountDeleteBtn = document.getElementById('cancelAccountDelete');
    const accountDeleteModal = document.getElementById('accountDeleteModal');
    
    deleteAccountBtn.addEventListener('click', () => {
        showAccountDeleteModal();
    });
    
    confirmAccountDeleteBtn.addEventListener('click', () => {
        deleteAccountData();
        hideAccountDeleteModal();
    });
    
    cancelAccountDeleteBtn.addEventListener('click', () => {
        hideAccountDeleteModal();
    });
    
    // Close modal when clicking outside
    accountDeleteModal.addEventListener('click', (event) => {
        if (event.target === accountDeleteModal) {
            hideAccountDeleteModal();
        }
    });
}

function showAccountDeleteModal() {
    const modal = document.getElementById('accountDeleteModal');
    modal.style.display = 'flex';
}

function hideAccountDeleteModal() {
    const modal = document.getElementById('accountDeleteModal');
    modal.style.display = 'none';
}

function deleteAccountData() {
    // Clear ALL localStorage data
    localStorage.clear();
    
    // Reset everything to default state
    resetToDefaults();
    
    // Show success message
    showNotification('Account deleted successfully! All data has been cleared.', 'success');
}

function resetToDefaults() {
    // Reset theme to default
    const root = document.documentElement;
    root.style.setProperty('--text-color', '#fff');
    root.style.setProperty('--accent-color', '#ffd700');
    root.style.setProperty('--glass-background-color', 'rgba(255, 255, 255, 0.1)');
    root.style.setProperty('--char-image-border-color', 'rgba(255, 255, 255, 0.12)');
    document.body.setAttribute('data-theme', 'dark');
    
    // Reset character sheet
    resetCharacterSheet();
    
    // Reset all section colors to default
    document.querySelectorAll('[data-color-target]').forEach(element => {
        element.style.backgroundColor = '';
    });
    
    // Reload the page to ensure everything is reset
    setTimeout(() => {
        location.reload();
    }, 2000);
}

// ===== UTILITY FUNCTIONS =====
function adjustColorBrightness(hexColor, percent) {
    const rgb = hexToRgb(hexColor);
    const adjust = (color) => {
        const adjusted = Math.round(color * (1 + percent));
        return Math.max(0, Math.min(255, adjusted));
    };
    
    const newR = adjust(rgb.r);
    const newG = adjust(rgb.g);
    const newB = adjust(rgb.b);
    
    return "#" + ((1 << 24) + (newR << 16) + (newG << 8) + newB).toString(16).slice(1);
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3',
        color: 'white',
        padding: '15px 20px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        zIndex: '10000',
        fontSize: '14px',
        maxWidth: '300px',
        opacity: '0',
        transform: 'translateX(100%)',
        transition: 'all 0.3s ease'
    });
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// ===== INITIALIZATION =====
function initializeSettings() {
    initializeAccentColorPicker();
    initializeGlassColorPicker();
    initializeCharacterDeletion();
    initializeAccountDeletion();
    
    // Apply saved custom colors on load
    applySavedCustomColors();
}

function applySavedCustomColors() {
    const root = document.documentElement;
    const currentTheme = document.body.getAttribute('data-theme') || 'dark';
    
    // Apply saved accent color
    const savedAccentBase = localStorage.getItem('zevi-custom-accent-base');
    if (savedAccentBase) {
        const savedAccentLight = localStorage.getItem('zevi-custom-accent-light');
        const savedAccentDark = localStorage.getItem('zevi-custom-accent-dark');
        
        let finalAccentColor;
        if (currentTheme === 'light' && savedAccentLight) {
            finalAccentColor = savedAccentLight;
            root.style.setProperty('--accent-color', savedAccentLight);
        } else if (currentTheme === 'dark' && savedAccentDark) {
            finalAccentColor = savedAccentDark;
            root.style.setProperty('--accent-color', savedAccentDark);
        }
        
        // Update transparent versions if we have a final color
        if (finalAccentColor) {
            updateAccentColorTransparencies(finalAccentColor);
        }
    } else {
        // No custom colors saved, use defaults and set up transparent versions
        const defaultColor = currentTheme === 'light' ? '#b8860b' : '#ffd700';
        root.style.setProperty('--accent-color', defaultColor);
        updateAccentColorTransparencies(defaultColor);
    }
    
    // Apply saved glass color
    const savedGlassColor = localStorage.getItem('zevi-glass-color');
    const savedGlassOpacity = localStorage.getItem('zevi-glass-opacity');
    if (savedGlassColor && savedGlassOpacity) {
        const rgb = hexToRgb(savedGlassColor);
        const newRgbaColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${savedGlassOpacity})`;
        root.style.setProperty('--glass-background-color', newRgbaColor);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure other scripts have loaded and theme is set
    setTimeout(initializeSettings, 200);
});

// Export functions for global access
window.changeAccentColor = changeAccentColor;
window.updateAccentColorTransparencies = updateAccentColorTransparencies;
window.changeGlassBackgroundColor = changeGlassBackgroundColor;
window.deleteCharacterData = deleteCharacterData;
window.deleteAccountData = deleteAccountData;
window.initializeSettings = initializeSettings;