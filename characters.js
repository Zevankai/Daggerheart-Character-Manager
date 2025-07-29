// Characters Page Management
class CharactersPageManager {
    constructor() {
        this.currentEditingCharacter = null;
        this.currentDeleteCharacter = null;
        this.init();
    }

    init() {
        // Initialize when page loads
        document.addEventListener('DOMContentLoaded', () => {
            this.setupEventListeners();
        });
    }

    setupEventListeners() {
        // The main script.js now handles tab switching for characters
        // No additional event listeners needed here
    }

    // Display characters list
    refreshCharactersList() {
        console.log('=== REFRESH CHARACTERS LIST: Starting ===');
        
        const grid = document.getElementById('charactersGrid');
        const emptyState = document.getElementById('charactersEmptyState');
        
        console.log('Grid element:', grid);
        console.log('Empty state element:', emptyState);
        
        if (!grid || !emptyState) {
            console.error('Required elements not found:', {
                grid: !!grid,
                emptyState: !!emptyState
            });
            return;
        }

        console.log('Character manager available:', !!window.characterManager);
        const characters = window.characterManager ? window.characterManager.characters : [];
        console.log('Characters found:', characters.length);
        console.log('Characters data:', characters);
        
        // Clear existing content
        grid.innerHTML = '';
        
        if (characters.length === 0) {
            console.log('No characters found, showing empty state');
            grid.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        console.log('Showing characters grid');
        grid.style.display = 'grid';
        emptyState.style.display = 'none';

        // Create character cards
        console.log('Creating character cards...');
        characters.forEach((character, index) => {
            console.log(`Creating card for character ${index + 1}:`, character.name);
            const card = this.createCharacterCard(character);
            console.log('Card created:', card);
            grid.appendChild(card);
        });

        console.log('Characters added to grid, applying filters...');
        // Apply current filters
        this.filterCharacters();
        
        console.log('=== REFRESH CHARACTERS LIST: Complete ===');
    }

    // Create a character card element
    createCharacterCard(character) {
        const card = document.createElement('div');
        card.className = 'character-card';
        card.dataset.characterId = character.id;
        card.dataset.platform = character.platform || 'Daggerheart';
        card.dataset.name = character.name.toLowerCase();

        const imageUrl = character.imageUrl || '';
        const platformIcon = character.platform === 'Dungeons & Dragons' ? '🐉' : '⚔️';
        
        card.innerHTML = `
            <div class="character-card-header">
                <div class="character-image">
                    ${imageUrl ? 
                        `<img src="${imageUrl}" alt="${character.name}" onerror="this.parentElement.innerHTML='<div class=\\"character-placeholder\\"><span>👤</span></div>'">` :
                        '<div class="character-placeholder"><span>👤</span></div>'
                    }
                </div>
                <div class="character-platform">
                    <span class="platform-icon">${platformIcon}</span>
                    <span class="platform-text">${character.platform || 'Daggerheart'}</span>
                </div>
            </div>
            
            <div class="character-info">
                <h3 class="character-name">${character.name}</h3>
                ${character.subtitle ? `<p class="character-subtitle">${character.subtitle}</p>` : ''}
                <div class="character-meta">
                    <span class="character-level">Level ${character.level || 1}</span>
                    <span class="character-date">Created ${this.formatDate(character.createdAt)}</span>
                </div>
            </div>
            
            <div class="character-actions">
                <button class="character-action-btn load-btn" onclick="charactersPageManager.loadCharacter('${character.id}')" title="Load Character">
                    <span>▶️</span> Load
                </button>
                <button class="character-action-btn edit-btn" onclick="charactersPageManager.editCharacter('${character.id}')" title="Edit Character">
                    <span>✏️</span> Edit
                </button>
            </div>
        `;

        return card;
    }

    // Format date for display
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    // Filter characters based on search and platform
    filterCharacters() {
        const platformFilter = document.getElementById('platformFilter')?.value || 'all';
        const searchTerm = document.getElementById('characterSearch')?.value.toLowerCase() || '';
        const cards = document.querySelectorAll('.character-card');

        let visibleCount = 0;

        cards.forEach(card => {
            const platform = card.dataset.platform;
            const name = card.dataset.name;
            
            const matchesPlatform = platformFilter === 'all' || platform === platformFilter;
            const matchesSearch = searchTerm === '' || name.includes(searchTerm);
            
            if (matchesPlatform && matchesSearch) {
                card.style.display = 'block';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        // Show/hide empty state for filtered results
        const grid = document.getElementById('charactersGrid');
        const emptyState = document.getElementById('charactersEmptyState');
        
        if (visibleCount === 0 && document.querySelectorAll('.character-card').length > 0) {
            // Show "no results" message for filtered search
            grid.style.display = 'none';
            emptyState.style.display = 'block';
            emptyState.querySelector('h3').textContent = 'No Characters Found';
            emptyState.querySelector('p').textContent = 'Try adjusting your search or filter criteria.';
        } else if (visibleCount > 0) {
            grid.style.display = 'grid';
            emptyState.style.display = 'none';
        }
    }

    // Load a character
    loadCharacter(characterId) {
        console.log('=== LOAD CHARACTER: Starting load for ID:', characterId);
        
        if (!window.characterManager) {
            console.error('Character manager not available');
            return;
        }

        // IMPORTANT: Save current character data before switching
        if (window.characterManager.currentCharacter) {
            console.log('Saving current character data before switching...');
            console.log('Current character:', window.characterManager.currentCharacter.name, 'ID:', window.characterManager.currentCharacter.id);
            
            // Use CharacterManager's comprehensive save method
            window.characterManager.saveCharacterData(window.characterManager.currentCharacter);
        }

        const character = window.characterManager.getCharacter(characterId);
        console.log('Character found:', character);
        
        if (character) {
            console.log('Loading character data...');
            
            // Use the enhanced character manager functionality
            const loadSuccess = window.characterManager.loadCharacterData(character);
            console.log('Character data load result:', loadSuccess);
            
            if (loadSuccess) {
                // Switch to main character view (first tab)
                console.log('Switching to main character view...');
                const firstTab = document.querySelector('.tabs button[data-target="domain-vault-tab-content"]');
                if (firstTab) {
                    // Trigger tab switch
                    document.querySelectorAll('.tabs button').forEach(btn => btn.classList.remove('active'));
                    document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
                    
                    firstTab.classList.add('active');
                    document.getElementById('domain-vault-tab-content').classList.add('active');
                    console.log('Switched to domain vault tab');
                }
                
                // All system refreshes are now handled by CharacterManager.restoreAllCharacterSystems
                console.log('Character systems will be restored by CharacterManager');
                
                console.log('=== LOAD CHARACTER: Character loaded successfully:', character.name);
                
                // Show success message briefly
                const notification = document.createElement('div');
                notification.textContent = `Loaded character: ${character.name}`;
                notification.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #4CAF50;
                    color: white;
                    padding: 10px 20px;
                    border-radius: 4px;
                    z-index: 10000;
                    font-size: 14px;
                `;
                document.body.appendChild(notification);
                
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 3000);
            } else {
                console.error('Failed to load character data');
                alert('Failed to load character data. Please try again.');
            }
        } else {
            console.error('Character not found for ID:', characterId);
            alert('Character not found!');
        }
    }

    // Edit a character
    editCharacter(characterId) {
        if (!window.characterManager) return;

        const character = window.characterManager.getCharacter(characterId);
        if (!character) {
            alert('Character not found!');
            return;
        }

        this.currentEditingCharacter = character;
        
        // Populate edit form
        document.getElementById('editCharacterId').value = character.id;
        document.getElementById('editCharacterName').value = character.name;
        document.getElementById('editCharacterPlatform').value = character.platform || 'Daggerheart';
        document.getElementById('editCharacterLevel').value = character.level || 1;
        
        // Set image preview
        const preview = document.getElementById('editCharacterImagePreview');
        if (character.imageUrl) {
            preview.innerHTML = `<img src="${character.imageUrl}" alt="Character preview">`;
        } else {
            preview.innerHTML = `
                <div class="image-placeholder">
                    <span>📷</span>
                    <p>Click to change character portrait</p>
                </div>
            `;
        }
        
        // Show modal
        document.getElementById('editCharacterModal').style.display = 'flex';
    }

    // Create new character
    createCharacter() {
        console.log('=== CREATE CHARACTER: Starting character creation ===');
        
        const name = document.getElementById('newCharacterName').value.trim();
        const platform = document.getElementById('newCharacterPlatform').value;
        const level = parseInt(document.getElementById('newCharacterLevel').value) || 1;
        
        console.log('Character data:', { name, platform, level });
        
        if (!name) {
            alert('Please enter a character name');
            return;
        }

        // Get image if uploaded
        const imageFile = document.getElementById('newCharacterImage').files[0];
        let imageUrl = '';
        
        if (imageFile) {
            console.log('Image file found, processing...');
            // Convert to data URL for storage
            const reader = new FileReader();
            reader.onload = (e) => {
                imageUrl = e.target.result;
                this.saveNewCharacter(name, platform, level, imageUrl);
            };
            reader.readAsDataURL(imageFile);
        } else {
            console.log('No image file, proceeding without image');
            this.saveNewCharacter(name, platform, level, imageUrl);
        }
    }

    saveNewCharacter(name, platform, level, imageUrl) {
        console.log('=== SAVE NEW CHARACTER: Saving character ===');
        
        if (!window.characterManager) {
            console.error('Character manager not available');
            return;
        }

        const characterData = {
            name,
            platform,
            level,
            imageUrl,
            subtitle: '' // Default empty subtitle since we removed the field
        };

        console.log('Creating character with data:', characterData);
        const newCharacter = window.characterManager.createCharacter(characterData);
        
        console.log('Character created successfully:', newCharacter.name);
        
        // Close modal and refresh list
        console.log('Closing modal...');
        this.closeCreateCharacterModal();
        
        console.log('Refreshing character list...');
        this.refreshCharactersList();
        
        console.log('=== CREATE CHARACTER: Process complete ===');
    }

    // Save character edits
    saveCharacterEdit() {
        if (!this.currentEditingCharacter || !window.characterManager) return;

        const name = document.getElementById('editCharacterName').value.trim();
        const platform = document.getElementById('editCharacterPlatform').value;
        const level = parseInt(document.getElementById('editCharacterLevel').value) || 1;
        
        if (!name) {
            alert('Please enter a character name');
            return;
        }

        // Get image if uploaded
        const imageFile = document.getElementById('editCharacterImage').files[0];
        
        if (imageFile) {
            // Convert to data URL for storage
            const reader = new FileReader();
            reader.onload = (e) => {
                this.updateCharacterData(name, platform, '', level, e.target.result);
            };
            reader.readAsDataURL(imageFile);
        } else {
            // Keep existing image
            this.updateCharacterData(name, platform, '', level, this.currentEditingCharacter.imageUrl);
        }
    }

    updateCharacterData(name, platform, subtitle, level, imageUrl) {
        const updates = {
            name,
            platform,
            subtitle,
            level,
            imageUrl: imageUrl || '',
            lastModified: new Date().toISOString()
        };

        window.characterManager.updateCharacterMetadata(this.currentEditingCharacter.id, updates);
        
        // Close modal and refresh list
        this.closeEditCharacterModal();
        this.refreshCharactersList();
        
        console.log('Character updated:', name);
    }

    // Confirm character deletion
    confirmDeleteCharacter() {
        console.log('=== DELETE MODAL: confirmDeleteCharacter called ===');
        
        if (!this.currentEditingCharacter) {
            console.error('No current editing character found');
            return;
        }
        
        console.log('Setting up delete for character:', this.currentEditingCharacter.name);
        
        this.currentDeleteCharacter = this.currentEditingCharacter;
        const nameDisplay = document.getElementById('deleteCharacterNameDisplay');
        const modal = document.getElementById('deleteCharacterConfirmModal');
        
        if (!nameDisplay || !modal) {
            console.error('Delete modal elements not found:', {
                nameDisplay: !!nameDisplay,
                modal: !!modal
            });
            return;
        }
        
        nameDisplay.textContent = this.currentEditingCharacter.name;
        
        // Close edit modal and show delete confirmation
        console.log('Closing edit modal...');
        this.closeEditCharacterModal();
        
        console.log('Showing delete confirmation modal...');
        modal.style.display = 'flex';
        modal.style.visibility = 'visible';
        modal.style.opacity = '1';
        modal.setAttribute('data-visible', 'true');
        modal.style.zIndex = '10001';
        
        console.log('Delete modal should now be visible');
        
        // Fallback check
        setTimeout(() => {
            const computedStyle = window.getComputedStyle(modal);
            if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
                console.error('DELETE MODAL STILL NOT VISIBLE!');
                console.log('Computed display:', computedStyle.display);
                console.log('Computed visibility:', computedStyle.visibility);
                alert('Delete modal display issue. Check console for details.');
            } else {
                console.log('Delete modal is visible successfully');
            }
        }, 100);
    }

    // Execute character deletion
    executeCharacterDelete() {
        console.log('=== DELETE CHARACTER: executeCharacterDelete called ===');
        
        if (!this.currentDeleteCharacter || !window.characterManager) {
            console.error('Cannot delete character:', {
                currentDeleteCharacter: !!this.currentDeleteCharacter,
                characterManager: !!window.characterManager
            });
            return;
        }

        console.log('Deleting character:', this.currentDeleteCharacter.name);
        const success = window.characterManager.deleteCharacter(this.currentDeleteCharacter.id);
        
        if (success) {
            console.log('Character deleted successfully');
            this.closeDeleteCharacterConfirmModal();
            this.refreshCharactersList();
            console.log('Character deletion process complete');
        } else {
            console.error('Failed to delete character');
            alert('Error deleting character. Please try again.');
        }
        
        this.currentDeleteCharacter = null;
    }

    // Image preview functions
    previewCharacterImage(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('characterImagePreview').innerHTML = 
                `<img src="${e.target.result}" alt="Character preview">`;
        };
        reader.readAsDataURL(file);
    }

    previewEditCharacterImage(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('editCharacterImagePreview').innerHTML = 
                `<img src="${e.target.result}" alt="Character preview">`;
        };
        reader.readAsDataURL(file);
    }

    // Modal control functions
    showCreateCharacterModal() {
        console.log('=== MODAL DEBUG: showCreateCharacterModal called ===');
        
        // Reset form
        const nameInput = document.getElementById('newCharacterName');
        const platformSelect = document.getElementById('newCharacterPlatform');
        const levelInput = document.getElementById('newCharacterLevel');
        const imageInput = document.getElementById('newCharacterImage');
        const imagePreview = document.getElementById('characterImagePreview');
        const modal = document.getElementById('createCharacterModal');
        
        if (!nameInput || !platformSelect || !levelInput || !imageInput || !imagePreview || !modal) {
            console.error('MODAL ERROR: One or more form elements not found');
            console.log('Elements found:', {
                nameInput: !!nameInput,
                platformSelect: !!platformSelect,
                levelInput: !!levelInput,
                imageInput: !!imageInput,
                imagePreview: !!imagePreview,
                modal: !!modal
            });
            return;
        }
        
        console.log('All form elements found, resetting form');
        
        nameInput.value = '';
        platformSelect.value = 'Daggerheart';
        levelInput.value = '1';
        imageInput.value = '';
        imagePreview.innerHTML = `
            <div class="image-placeholder">
                <span>📷</span>
                <p>Click to add character portrait</p>
            </div>
        `;
        
        console.log('Form reset complete, showing modal');
        console.log('Modal element:', modal);
        console.log('Modal current style:', modal.style.display);
        
        // Force modal to display with multiple methods
        modal.style.display = 'flex';
        modal.style.visibility = 'visible';
        modal.style.opacity = '1';
        modal.setAttribute('data-visible', 'true');
        
        console.log('Modal display set to flex');
        console.log('Modal computed style:', window.getComputedStyle(modal).display);
        
        // Ensure modal is in front
        modal.style.zIndex = '10001';
        
        console.log('=== MODAL DEBUG: Modal should now be visible ===');
        
        // Fallback check - if modal still not visible after 100ms, show alert
        setTimeout(() => {
            const computedStyle = window.getComputedStyle(modal);
            if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
                console.error('MODAL STILL NOT VISIBLE!');
                console.log('Computed display:', computedStyle.display);
                console.log('Computed visibility:', computedStyle.visibility);
                console.log('Computed opacity:', computedStyle.opacity);
                alert('Modal display issue detected. Check browser console for details. Try refreshing the page.');
            } else {
                console.log('Modal is now visible successfully');
            }
        }, 100);
    }

    closeCreateCharacterModal() {
        console.log('=== MODAL DEBUG: closeCreateCharacterModal called ===');
        
        const modal = document.getElementById('createCharacterModal');
        if (!modal) {
            console.error('Modal element not found!');
            return;
        }
        
        console.log('Closing modal...');
        modal.style.display = 'none';
        modal.style.visibility = 'hidden';
        modal.style.opacity = '0';
        modal.removeAttribute('data-visible');
        
        console.log('Modal closed successfully');
    }

    closeEditCharacterModal() {
        document.getElementById('editCharacterModal').style.display = 'none';
        this.currentEditingCharacter = null;
    }

    closeDeleteCharacterConfirmModal() {
        console.log('=== DELETE MODAL: closeDeleteCharacterConfirmModal called ===');
        
        const modal = document.getElementById('deleteCharacterConfirmModal');
        if (!modal) {
            console.error('Delete modal element not found!');
            return;
        }
        
        console.log('Closing delete modal...');
        modal.style.display = 'none';
        modal.style.visibility = 'hidden';
        modal.style.opacity = '0';
        modal.removeAttribute('data-visible');
        
        this.currentDeleteCharacter = null;
        console.log('Delete modal closed successfully');
    }
}

// Global functions for HTML onclick handlers
function showCreateCharacterModal() {
    if (window.charactersPageManager) {
        window.charactersPageManager.showCreateCharacterModal();
    }
}

function closeCreateCharacterModal() {
    if (window.charactersPageManager) {
        window.charactersPageManager.closeCreateCharacterModal();
    }
}

function closeEditCharacterModal() {
    if (window.charactersPageManager) {
        window.charactersPageManager.closeEditCharacterModal();
    }
}

function closeDeleteCharacterConfirmModal() {
    if (window.charactersPageManager) {
        window.charactersPageManager.closeDeleteCharacterConfirmModal();
    }
}

function createCharacter() {
    if (window.charactersPageManager) {
        window.charactersPageManager.createCharacter();
    }
}

function saveCharacterEdit() {
    if (window.charactersPageManager) {
        window.charactersPageManager.saveCharacterEdit();
    }
}

function confirmDeleteCharacter() {
    if (window.charactersPageManager) {
        window.charactersPageManager.confirmDeleteCharacter();
    }
}

function executeCharacterDelete() {
    if (window.charactersPageManager) {
        window.charactersPageManager.executeCharacterDelete();
    }
}

function previewCharacterImage(event) {
    console.log('=== PREVIEW CHARACTER IMAGE: Function called ===');
    console.log('Event:', event);
    console.log('charactersPageManager available:', !!window.charactersPageManager);
    
    // Check if file was selected
    const file = event.target.files[0];
    console.log('File selected:', file);
    
    if (!file) {
        console.warn('No file selected');
        return;
    }

    // Handle image preview directly if charactersPageManager isn't available
    if (window.charactersPageManager) {
        console.log('Using charactersPageManager.previewCharacterImage');
        window.charactersPageManager.previewCharacterImage(event);
    } else {
        console.log('charactersPageManager not available, handling preview directly');
        
        const reader = new FileReader();
        reader.onload = (e) => {
            console.log('Image loaded, updating preview');
            const previewElement = document.getElementById('characterImagePreview');
            if (previewElement) {
                previewElement.innerHTML = `<img src="${e.target.result}" alt="Character preview">`;
                console.log('Image preview updated successfully');
            } else {
                console.error('characterImagePreview element not found');
            }
        };
        
        reader.onerror = (error) => {
            console.error('Error reading file:', error);
        };
        
        console.log('Starting to read file as data URL');
        reader.readAsDataURL(file);
    }
}

function previewEditCharacterImage(event) {
    console.log('=== PREVIEW EDIT CHARACTER IMAGE: Function called ===');
    
    if (window.charactersPageManager) {
        window.charactersPageManager.previewEditCharacterImage(event);
    } else {
        console.log('charactersPageManager not available, handling edit preview directly');
        
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const previewElement = document.getElementById('editCharacterImagePreview');
            if (previewElement) {
                previewElement.innerHTML = `<img src="${e.target.result}" alt="Character preview">`;
            }
        };
        reader.readAsDataURL(file);
    }
}

function filterCharacters() {
    if (window.charactersPageManager) {
        window.charactersPageManager.filterCharacters();
    }
}

// Initialize the characters page manager
window.charactersPageManager = new CharactersPageManager();