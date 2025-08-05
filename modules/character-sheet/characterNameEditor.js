/**
 * Character Name Editor Module
 * Handles rich text editing for character names with font size adjustment
 */

class CharacterNameEditor {
    constructor() {
        this.editor = null;
        this.initialized = false;
    }

    initialize() {
        if (this.initialized) return;
        
        this.editor = document.querySelector('.character-name-editor');
        if (!this.editor) return;

        this.setupEditor();
        this.setupFontSizeControls();
        this.initialized = true;
    }

    setupEditor() {
        // Set initial font size
        this.editor.style.fontSize = '2rem';
        
        // Handle paste events to strip formatting
        this.editor.addEventListener('paste', (e) => {
            e.preventDefault();
            const text = e.clipboardData.getData('text/plain');
            document.execCommand('insertText', false, text);
        });

        // Handle input to auto-adjust font size
        this.editor.addEventListener('input', () => {
            this.autoAdjustFontSize();
        });

        // Handle focus to show controls
        this.editor.addEventListener('focus', () => {
            this.showFontSizeControls();
        });

        // Handle blur to hide controls
        this.editor.addEventListener('blur', () => {
            // Delay hiding controls to allow button clicks
            setTimeout(() => {
                this.hideFontSizeControls();
            }, 200);
        });

        // Prevent enter key from creating new lines
        this.editor.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.editor.blur();
            }
        });
    }

    setupFontSizeControls() {
        // Create font size controls
        const controls = document.createElement('div');
        controls.className = 'character-name-controls';
        controls.innerHTML = `
            <div class="font-size-controls">
                <button class="font-size-btn" data-action="decrease" title="Decrease font size">A-</button>
                <span class="font-size-display">2rem</span>
                <button class="font-size-btn" data-action="increase" title="Increase font size">A+</button>
            </div>
        `;

        // Insert controls after the editor
        this.editor.parentNode.insertBefore(controls, this.editor.nextSibling);

        // Add event listeners for font size buttons
        const decreaseBtn = controls.querySelector('[data-action="decrease"]');
        const increaseBtn = controls.querySelector('[data-action="increase"]');
        const sizeDisplay = controls.querySelector('.font-size-display');

        decreaseBtn.addEventListener('click', () => {
            this.changeFontSize(-0.25);
            sizeDisplay.textContent = this.editor.style.fontSize;
        });

        increaseBtn.addEventListener('click', () => {
            this.changeFontSize(0.25);
            sizeDisplay.textContent = this.editor.style.fontSize;
        });

        // Store references
        this.controls = controls;
        this.sizeDisplay = sizeDisplay;
    }

    changeFontSize(delta) {
        const currentSize = parseFloat(this.editor.style.fontSize);
        const newSize = Math.max(1, Math.min(4, currentSize + delta)); // Limit between 1rem and 4rem
        this.editor.style.fontSize = newSize + 'rem';
        
        // Save font size preference to character-specific storage
        if (window.app?.characterData?.setCharacterSpecificValue) {
            window.app.characterData.setCharacterSpecificValue('zevi-character-name-font-size', newSize + 'rem');
            
            // Trigger auto-save to persist to database
            if (window.app?.autoSave?.triggerSave) {
                window.app.autoSave.triggerSave();
            }
        }
    }

    autoAdjustFontSize() {
        const text = this.editor.textContent;
        const maxLength = 20; // Threshold for auto-adjustment
        
        if (text.length > maxLength) {
            const currentSize = parseFloat(this.editor.style.fontSize);
            const newSize = Math.max(1, currentSize - 0.1);
            this.editor.style.fontSize = newSize + 'rem';
        }
    }

    showFontSizeControls() {
        if (this.controls) {
            this.controls.style.display = 'flex';
        }
    }

    hideFontSizeControls() {
        if (this.controls) {
            this.controls.style.display = 'none';
        }
    }

    getValue() {
        return this.editor ? this.editor.textContent : '';
    }

    setValue(value) {
        if (this.editor) {
            this.editor.textContent = value;
            this.autoAdjustFontSize();
        }
    }

    loadFontSizePreference() {
        let savedSize;
        if (window.app?.characterData?.getCharacterSpecificValue) {
            savedSize = window.app.characterData.getCharacterSpecificValue('zevi-character-name-font-size');
        }
        
        if (savedSize && this.editor) {
            this.editor.style.fontSize = savedSize;
            if (this.sizeDisplay) {
                this.sizeDisplay.textContent = savedSize;
            }
        }
    }
}

// Initialize the editor when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.characterNameEditor = new CharacterNameEditor();
    window.characterNameEditor.initialize();
    window.characterNameEditor.loadFontSizePreference();
});

// Export for use in other modules
window.CharacterNameEditor = CharacterNameEditor;