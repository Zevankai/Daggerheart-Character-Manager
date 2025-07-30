// --- GLOBAL HELPER FUNCTIONS ---

// Legacy functions for compatibility (now handled by core system)
function updateSaveStatus(type, message) {
    console.log('Legacy save status:', type, message);
}

function showAutoSaveStatus() {
    console.log('Legacy auto-save status');
}

// Debug function for new core system
function debugCharacterData() {
    if (window.app && window.app.initialized) {
        const currentId = window.app.characterData.getCurrentCharacterId();
        console.log('=== DEBUG CHARACTER DATA (NEW SYSTEM) ===');
        console.log('Current Character ID:', currentId);
        
        if (currentId) {
            const characterData = window.app.characterData.loadCharacterData(currentId);
            console.log('Character Data:', characterData);
        }
        
        return window.app.getStatus();
    } else {
        console.log('New app system not initialized');
        return null;
    }
}

// Make debug function globally available
window.debugCharacterData = debugCharacterData;

// Image upload with comprehensive save system
function uploadCharacterImage(event) {
    const file = event.target.files[0];
    if (!file) return;

    console.log('📸 Uploading character image...');

    const reader = new FileReader();
    reader.onload = function(e) {
        const imageUrl = e.target.result;
        
        // Update the character image display
        const charImage = document.querySelector('#charImage');
        const charPlaceholder = document.querySelector('#charPlaceholder');
        
        if (charImage && charPlaceholder) {
            charImage.src = imageUrl;
            charImage.style.display = 'block';
            charPlaceholder.style.display = 'none';
        }

        console.log('✅ Character image updated');

        // Save the image to localStorage for persistence
        try {
            localStorage.setItem('zevi-character-image', imageUrl);
            console.log('💾 Character image saved to localStorage');
        } catch (error) {
            console.error('Failed to save character image:', error);
        }
    };

    reader.readAsDataURL(file);
}

// Load saved character image on page load
function loadSavedCharacterImage() {
    try {
        const savedImage = localStorage.getItem('zevi-character-image');
        if (savedImage) {
            const charImage = document.querySelector('#charImage');
            const charPlaceholder = document.querySelector('#charPlaceholder');
            
            if (charImage && charPlaceholder) {
                charImage.src = savedImage;
                charImage.style.display = 'block';
                charPlaceholder.style.display = 'none';
                console.log('✅ Loaded saved character image');
            }
        }
    } catch (error) {
        console.error('Failed to load saved character image:', error);
    }
}

// Load saved image when DOM is ready
document.addEventListener('DOMContentLoaded', loadSavedCharacterImage);

function uploadBackground(event) {
    const reader = new FileReader();
    reader.onload = function(){
      document.body.style.backgroundImage = `url('${reader.result}')`;
    };
    reader.readAsDataURL(event.target.files[0]);
}

function toggleTextColor() {
    const root = document.documentElement;
    const current = getComputedStyle(root).getPropertyValue('--text-color').trim();
    const isLight = current === 'rgb(0, 0, 0)' || current === '#000';

    let finalAccentColor;

    if (isLight) {
        // Switching to dark theme
        root.style.setProperty('--text-color', '#fff');
        document.body.setAttribute('data-theme', 'dark');
        
        // Use custom accent color if available, otherwise default
        const customAccentDark = localStorage.getItem('zevi-custom-accent-dark');
        if (customAccentDark) {
            finalAccentColor = customAccentDark;
            root.style.setProperty('--accent-color', customAccentDark);
        } else {
            finalAccentColor = '#ffd700';
            root.style.setProperty('--accent-color', '#ffd700');
        }
    } else {
        // Switching to light theme
        root.style.setProperty('--text-color', '#000');
        document.body.setAttribute('data-theme', 'light');
        
        // Use custom accent color if available, otherwise default
        const customAccentLight = localStorage.getItem('zevi-custom-accent-light');
        if (customAccentLight) {
            finalAccentColor = customAccentLight;
            root.style.setProperty('--accent-color', customAccentLight);
        } else {
            finalAccentColor = '#b8860b';
            root.style.setProperty('--accent-color', '#b8860b');
        }
    }

    // Update transparent accent colors if the updateAccentColorTransparencies function is available
    if (typeof window.updateAccentColorTransparencies === 'function') {
        window.updateAccentColorTransparencies(finalAccentColor);
    }

    localStorage.setItem('zevi-text-color', root.style.getPropertyValue('--text-color'));
    localStorage.setItem('zevi-accent-color', root.style.getPropertyValue('--accent-color'));
    localStorage.setItem('zevi-theme', document.body.getAttribute('data-theme'));
}

// --- ATTRIBUTE VALUE HANDLING ---
function formatAttributeValue(value) {
    const num = parseInt(value, 10);
    return isNaN(num) ? '' : (num >= 0 ? '+' : '') + num;
}

// --- COLOR PICKER LOGIC ---
const colorTargets = {
    'main-glass': '.glass',
    'char-image-border': '.char-img-wrapper .char-img-border',
    'name-box': '.name-box',
    'ability-scores': '[data-color-target="ability-scores"]',
    'hp-stress': '[data-color-target="hp-stress"]',
    'active-weapons': '[data-color-target="active-weapons"]',
    'armor-section': '[data-color-target="armor-section"]',
    'hope-section': '[data-color-target="hope-section"]',
    'experiences-section': '[data-color-target="experiences-section"]'
};

let colorPickerActive = false;
let currentSelectedColorElement = null;

function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
}

function rgbToHex(rgbString) {
    let match = rgbString.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (!match) {
        match = rgbString.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d\.]+\)$/);
    }
    if (match) {
        const r = parseInt(match[1], 10);
        const g = parseInt(match[2], 10);
        const b = parseInt(match[3], 10);
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
    return rgbString; // Return original if not a valid rgb/rgba string
}

function applySavedColors() {
    const root = document.documentElement;
    for (const key in colorTargets) {
        const savedColor = localStorage.getItem(`zevi-color-${key}`);
        if (savedColor) {
            const elements = document.querySelectorAll(colorTargets[key]);
            elements.forEach(el => {
                if (key === 'main-glass') {
                    // Use a consistent alpha value for the glass effect
                    let alpha = 0.1; // Default alpha for glass
                    const newRgb = hexToRgb(savedColor);
                    root.style.setProperty('--glass-background-color', `rgba(${newRgb.r}, ${newRgb.g}, ${newRgb.b}, ${alpha})`);
                } else if (key === 'char-image-border') {
                    // Update the CSS variable for the border
                    const currentCssVar = getComputedStyle(root).getPropertyValue('--char-image-border-color').trim();
                    const rgbaMatch = currentCssVar.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d\.]+)?\)/);
                    let alpha = rgbaMatch && rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 0.12; // Default alpha for image border

                    const newRgb = hexToRgb(savedColor);
                    root.style.setProperty('--char-image-border-color', `rgba(${newRgb.r}, ${newRgb.g}, ${newRgb.b}, ${alpha})`);
                } else {
                    el.style.backgroundColor = savedColor; // Apply to background for other sections
                }
            });
        }
    }
}


// Keyboard shortcuts are now handled by AppController
// This is kept for compatibility but should not be needed

// --- DOMContentLoaded for main script logic ---
document.addEventListener('DOMContentLoaded', () => {
    // Restore theme from local storage
    const savedTextColor = localStorage.getItem('zevi-text-color');
    const savedTheme = localStorage.getItem('zevi-theme');

    if (savedTextColor) {
        document.documentElement.style.setProperty('--text-color', savedTextColor);
    }
    if (savedTheme) {
        document.body.setAttribute('data-theme', savedTheme);
    }

    // Apply saved colors (including the new CSS variable ones)
    applySavedColors();
    
    // Apply custom accent colors (this will be handled by settings.js)
    // Note: Don't set accent color here anymore, let settings.js handle it

    // Toggle theme on click
    document.getElementById('toggleTheme').addEventListener('click', toggleTextColor);

    // Draggable sections with SortableJS
    const draggableSections = document.getElementById('draggable-sections');
    const savedOrder = JSON.parse(localStorage.getItem('zevi-section-order'));

    if (savedOrder) {
        const sections = Array.from(draggableSections.children);
        const reorderedSections = savedOrder.map(id => sections.find(section => section.dataset.id === id));
        reorderedSections.forEach(section => {
            if (section) draggableSections.appendChild(section);
        });
    }

    new Sortable(draggableSections, {
        animation: 150,
        onEnd: function (evt) {
            const newOrder = Array.from(evt.from.children).map(item => item.dataset.id);
            localStorage.setItem('zevi-section-order', JSON.stringify(newOrder));
        },
    });

    // Tab switching logic
    document.querySelectorAll('nav.tabs button').forEach(button => {
        button.addEventListener('click', function() {
            document.querySelectorAll('nav.tabs button').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));

            this.classList.add('active');
            const targetPanelId = this.dataset.target;
            document.getElementById(targetPanelId).classList.add('active');

            if (targetPanelId === 'downtime-tab-content') {
                if (window.resetDowntimeView && typeof window.resetDowntimeView === 'function') {
                    window.resetDowntimeView();
                } else {
                    console.warn('resetDowntimeView function not found. Ensure downtime.js is loaded.');
                }
            }
            if (targetPanelId === 'equipment-tab-content') {
                console.log('Equipment tab clicked!');
                if (window.initializeEquipment && typeof window.initializeEquipment === 'function') {
                    console.log('Calling initializeEquipment...');
                    window.initializeEquipment();
                } else {
                    console.warn('initializeEquipment function not found. Ensure equipment.js is loaded.');
                }
            }
            if (targetPanelId === 'journal-tab-content') {
                if (window.renderJournalEntries && typeof window.renderJournalEntries === 'function') {
                    window.renderJournalEntries();
                } else {
                    console.warn('renderJournalEntries function not found. Ensure journal.js is loaded.');
                }
            }
            if (targetPanelId === 'experiences-tab-content') {
                if (window.renderExperiences && typeof window.renderExperiences === 'function') {
                    window.renderExperiences();
                } else {
                    console.warn('renderExperiences function not found. Ensure experiences.js is loaded.');
                }
            }
            if (targetPanelId === 'characters-tab-content') {
                if (window.charactersPageManager && typeof window.charactersPageManager.refreshCharactersList === 'function') {
                    console.log('Characters tab clicked - refreshing characters list');
                    window.charactersPageManager.refreshCharactersList();
                } else {
                    console.warn('charactersPageManager not found. Ensure characters.js is loaded.');
                }
            }
        });
    });

    // Initial rendering based on which tab is active on load
    const initiallyActiveTabButton = document.querySelector('nav.tabs button.active');
    if (initiallyActiveTabButton) {
        const initialTargetPanelId = initiallyActiveTabButton.dataset.target;
        if (initialTargetPanelId === 'downtime-tab-content' && window.resetDowntimeView) {
            window.resetDowntimeView();
        } else if (initialTargetPanelId === 'journal-tab-content' && window.renderJournalEntries) {
            window.renderJournalEntries();
        } else if (initialTargetPanelId === 'experiences-tab-content' && window.renderExperiences) {
            window.renderExperiences();
        } else if (initialTargetPanelId === 'characters-tab-content' && window.charactersPageManager) {
            window.charactersPageManager.refreshCharactersList();
        }
    }

    // Attribute value formatting
    document.querySelectorAll('.attribute-value').forEach(input => {
        let initialValue = input.value;
        if (initialValue === '') {
            input.value = 0;
        }
        input.setAttribute('placeholder', formatAttributeValue(input.value));

        input.addEventListener('input', (event) => {
            event.target.setAttribute('placeholder', formatAttributeValue(event.target.value));
        });

        input.addEventListener('blur', (event) => {
            if (event.target.value === '') {
                event.target.value = 0;
                event.target.setAttribute('placeholder', formatAttributeValue(0));
            }
        });

        input.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                event.preventDefault();
            }
        });
    });

    // Color picker logic
    const colorPicker = document.getElementById('sectionColorPicker');
    const colorPickerToggle = document.querySelector('.color-picker-toggle');
    const colorPickerInput = document.getElementById('sectionColorPicker');

    colorPickerInput.style.display = 'none'; // Ensure hidden initially

    colorPickerToggle.addEventListener('click', () => {
        colorPickerActive = !colorPickerActive;
        if (colorPickerActive) {
            colorPickerInput.style.display = 'block';
            if (window.showNotification && typeof window.showNotification === 'function') {
                window.showNotification('Click on a section to change its color!', 'info');
            }
            setTimeout(() => {
                const downtimeNotificationArea = document.getElementById('downtime-notification-area');
                if (downtimeNotificationArea) {
                    downtimeNotificationArea.style.display = 'none';
                }
            }, 3000);
        } else {
            colorPickerInput.style.display = 'none';
            currentSelectedColorElement = null;
            const downtimeNotificationArea = document.getElementById('downtime-notification-area');
            if (downtimeNotificationArea) {
                downtimeNotificationArea.style.display = 'none';
            }
        }
    });

    document.addEventListener('click', (event) => {
        if (colorPickerActive && event.target.closest('[data-color-target]')) {
            const targetElement = event.target.closest('[data-color-target]');
            const targetKey = targetElement.dataset.colorTarget;
            const root = document.documentElement;

            currentSelectedColorElement = { element: targetElement, key: targetKey };

            let currentColor;
            if (targetKey === 'main-glass') {
                // Get the current value of the CSS variable
                const currentCssVar = getComputedStyle(root).getPropertyValue('--glass-background-color').trim();
                currentColor = rgbToHex(currentCssVar);
            } else if (targetKey === 'char-image-border') {
                // Get the current value of the CSS variable for the border
                const currentCssVar = getComputedStyle(root).getPropertyValue('--char-image-border-color').trim();
                currentColor = rgbToHex(currentCssVar);
            } else {
                currentColor = targetElement.style.backgroundColor ? rgbToHex(targetElement.style.backgroundColor) : '#ffffff';
            }
            if (currentColor) {
                colorPicker.value = currentColor;
            }

            colorPicker.click();
        } else if (colorPickerActive && !event.target.closest('.color-picker-container')) {
            colorPickerActive = false;
            colorPickerInput.style.display = 'none';
            const downtimeNotificationArea = document.getElementById('downtime-notification-area');
            if (downtimeNotificationArea) {
                downtimeNotificationArea.style.display = 'none';
            }
        }
    });

    colorPicker.addEventListener('input', (event) => {
        const selectedColor = event.target.value;
        const root = document.documentElement;

        if (currentSelectedColorElement) {
            const { element, key } = currentSelectedColorElement;
            if (key === 'main-glass') {
                // Use a consistent alpha value for the glass effect
                let alpha = 0.1;
                const newRgb = hexToRgb(selectedColor);
                root.style.setProperty('--glass-background-color', `rgba(${newRgb.r}, ${newRgb.g}, ${newRgb.b}, ${alpha})`);
                localStorage.setItem(`zevi-color-${key}`, selectedColor); // Save hex for future loading
            } else if (key === 'char-image-border') {
                // Get the current alpha from the CSS variable for the border
                const currentCssVar = getComputedStyle(root).getPropertyValue('--char-image-border-color').trim();
                const rgbaMatch = currentCssVar.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d\.]+)?\)/);
                let alpha = rgbaMatch && rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 0.12;

                const newRgb = hexToRgb(selectedColor);
                // Update the CSS variable
                root.style.setProperty('--char-image-border-color', `rgba(${newRgb.r}, ${newRgb.g}, ${newRgb.b}, ${alpha})`);
                localStorage.setItem(`zevi-color-${key}`, selectedColor); // Save hex for future loading
            } else {
                element.style.backgroundColor = selectedColor;
                localStorage.setItem(`zevi-color-${key}`, selectedColor);
            }
        }
    });

    // If your armor circles are still static in HTML and you want them clickable:
    document.querySelectorAll('#armor-tracker .circle').forEach(circle => {
        circle.addEventListener('click', () => {
            circle.classList.toggle('active');
        });
    });

    // Evasion value functionality
    const evasionValue = document.getElementById('evasionValue');
    if (evasionValue) {
        // Evasion value is now managed by the file system
        // It will be loaded when a character is switched to
        // and saved automatically when the character state is saved

        // Save evasion value when it changes to localStorage for immediate use
        evasionValue.addEventListener('input', () => {
            localStorage.setItem('zevi-evasion', evasionValue.value);
        });

        // Handle blur to ensure valid value
        evasionValue.addEventListener('blur', () => {
            if (evasionValue.value === '' || isNaN(evasionValue.value)) {
                evasionValue.value = 10; // Default value
                localStorage.setItem('zevi-evasion', '10');
            }
        });

        // Format like attribute values
        evasionValue.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                event.preventDefault();
            }
        });
    }

});

// Expose these functions for HTML `onchange` and `onclick` attributes or `downtime.js` if needed.
window.uploadCharacterImage = uploadCharacterImage;
window.uploadBackground = uploadBackground;
window.toggleTextColor = toggleTextColor;
