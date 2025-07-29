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
        const grid = document.getElementById('charactersGrid');
        const emptyState = document.getElementById('charactersEmptyState');
        
        if (!grid || !emptyState) return;

        const characters = window.characterManager ? window.characterManager.characters : [];
        
        // Clear existing content
        grid.innerHTML = '';
        
        if (characters.length === 0) {
            grid.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        grid.style.display = 'grid';
        emptyState.style.display = 'none';

        // Create character cards
        characters.forEach(character => {
            const card = this.createCharacterCard(character);
            grid.appendChild(card);
        });

        // Apply current filters
        this.filterCharacters();
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
        if (!window.characterManager) {
            console.error('Character manager not available');
            return;
        }

        const character = window.characterManager.getCharacter(characterId);
        if (character) {
            // Use the existing character manager functionality
            window.characterManager.loadCharacterData(character);
            window.characterManager.currentCharacter = character;
            
            // Switch to main character view (first tab)
            const firstTab = document.querySelector('.tabs button[data-target="domain-vault-tab-content"]');
            if (firstTab) {
                // Trigger tab switch
                document.querySelectorAll('.tabs button').forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
                
                firstTab.classList.add('active');
                document.getElementById('domain-vault-tab-content').classList.add('active');
            }
            
            console.log('Character loaded:', character.name);
        } else {
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
        document.getElementById('editCharacterSubtitle').value = character.subtitle || '';
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
        const name = document.getElementById('newCharacterName').value.trim();
        const platform = document.getElementById('newCharacterPlatform').value;
        const subtitle = document.getElementById('newCharacterSubtitle').value.trim();
        const level = parseInt(document.getElementById('newCharacterLevel').value) || 1;
        
        if (!name) {
            alert('Please enter a character name');
            return;
        }

        // Get image if uploaded
        const imageFile = document.getElementById('newCharacterImage').files[0];
        let imageUrl = '';
        
        if (imageFile) {
            // Convert to data URL for storage
            const reader = new FileReader();
            reader.onload = (e) => {
                imageUrl = e.target.result;
                this.saveNewCharacter(name, platform, subtitle, level, imageUrl);
            };
            reader.readAsDataURL(imageFile);
        } else {
            this.saveNewCharacter(name, platform, subtitle, level, imageUrl);
        }
    }

    saveNewCharacter(name, platform, subtitle, level, imageUrl) {
        if (!window.characterManager) return;

        const characterData = {
            name,
            platform,
            subtitle,
            level,
            imageUrl
        };

        const newCharacter = window.characterManager.createCharacter(characterData);
        
        // Close modal and refresh list
        this.closeCreateCharacterModal();
        this.refreshCharactersList();
        
        console.log('Character created:', newCharacter.name);
    }

    // Save character edits
    saveCharacterEdit() {
        if (!this.currentEditingCharacter || !window.characterManager) return;

        const name = document.getElementById('editCharacterName').value.trim();
        const platform = document.getElementById('editCharacterPlatform').value;
        const subtitle = document.getElementById('editCharacterSubtitle').value.trim();
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
                this.updateCharacterData(name, platform, subtitle, level, e.target.result);
            };
            reader.readAsDataURL(imageFile);
        } else {
            // Keep existing image
            this.updateCharacterData(name, platform, subtitle, level, this.currentEditingCharacter.imageUrl);
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
        if (!this.currentEditingCharacter) return;
        
        this.currentDeleteCharacter = this.currentEditingCharacter;
        document.getElementById('deleteCharacterNameDisplay').textContent = this.currentEditingCharacter.name;
        
        // Close edit modal and show delete confirmation
        this.closeEditCharacterModal();
        document.getElementById('deleteCharacterConfirmModal').style.display = 'flex';
    }

    // Execute character deletion
    executeCharacterDelete() {
        if (!this.currentDeleteCharacter || !window.characterManager) return;

        const success = window.characterManager.deleteCharacter(this.currentDeleteCharacter.id);
        
        if (success) {
            this.closeDeleteCharacterConfirmModal();
            this.refreshCharactersList();
            console.log('Character deleted:', this.currentDeleteCharacter.name);
        } else {
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
        // Reset form
        document.getElementById('newCharacterName').value = '';
        document.getElementById('newCharacterPlatform').value = 'Daggerheart';
        document.getElementById('newCharacterSubtitle').value = '';
        document.getElementById('newCharacterLevel').value = '1';
        document.getElementById('newCharacterImage').value = '';
        document.getElementById('characterImagePreview').innerHTML = `
            <div class="image-placeholder">
                <span>📷</span>
                <p>Click to add character portrait</p>
            </div>
        `;
        
        document.getElementById('createCharacterModal').style.display = 'flex';
    }

    closeCreateCharacterModal() {
        document.getElementById('createCharacterModal').style.display = 'none';
    }

    closeEditCharacterModal() {
        document.getElementById('editCharacterModal').style.display = 'none';
        this.currentEditingCharacter = null;
    }

    closeDeleteCharacterConfirmModal() {
        document.getElementById('deleteCharacterConfirmModal').style.display = 'none';
        this.currentDeleteCharacter = null;
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
    if (window.charactersPageManager) {
        window.charactersPageManager.previewCharacterImage(event);
    }
}

function previewEditCharacterImage(event) {
    if (window.charactersPageManager) {
        window.charactersPageManager.previewEditCharacterImage(event);
    }
}

function filterCharacters() {
    if (window.charactersPageManager) {
        window.charactersPageManager.filterCharacters();
    }
}

// Initialize the characters page manager
window.charactersPageManager = new CharactersPageManager();