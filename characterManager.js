// Character Manager - Handles character storage and management
class CharacterManager {
    constructor() {
        this.characters = this.loadCharacters();
        this.currentCharacter = null;
        this.initializeEventListeners();
    }

    // Load all characters from localStorage
    loadCharacters() {
        try {
            const stored = localStorage.getItem('zevi-characters');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading characters:', error);
            return [];
        }
    }

    // Save all characters to localStorage
    saveCharacters() {
        try {
            localStorage.setItem('zevi-characters', JSON.stringify(this.characters));
        } catch (error) {
            console.error('Error saving characters:', error);
        }
    }

    // Create a new character with basic structure
    createCharacter(characterData = {}) {
        const newCharacter = {
            id: Date.now().toString(),
            name: characterData.name || 'Unnamed Character',
            subtitle: characterData.subtitle || '',
            level: characterData.level || 1,
            domains: characterData.domains || [],
            attributes: characterData.attributes || {
                might: 10,
                agility: 10,
                intellect: 10,
                charm: 10
            },
            hp: characterData.hp || { current: 10, max: 10 },
            stress: characterData.stress || { current: 0, max: 10 },
            evasion: characterData.evasion || 10,
            equipment: characterData.equipment || null,
            journal: characterData.journal || null,
            experiences: characterData.experiences || null,
            hope: characterData.hope || null,
            downtime: characterData.downtime || null,
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString()
        };

        this.characters.push(newCharacter);
        this.saveCharacters();
        return newCharacter;
    }

    // Delete a character
    deleteCharacter(characterId) {
        const index = this.characters.findIndex(char => char.id === characterId);
        if (index !== -1) {
            // Also clear the individual character storage
            this.clearCharacterStorage(this.characters[index]);
            this.characters.splice(index, 1);
            this.saveCharacters();
            return true;
        }
        return false;
    }

    // Get character by ID
    getCharacter(characterId) {
        return this.characters.find(char => char.id === characterId);
    }

    // Update character metadata
    updateCharacterMetadata(characterId, updates) {
        const character = this.getCharacter(characterId);
        if (character) {
            Object.assign(character, updates);
            character.lastModified = new Date().toISOString();
            this.saveCharacters();
            return true;
        }
        return false;
    }

    // Load character data from localStorage
    loadCharacterData(character) {
        try {
            // Load all character-specific data
            const equipment = localStorage.getItem(`zevi-equipment-${character.id}`);
            const journal = localStorage.getItem(`zevi-journal-${character.id}`);
            const experiences = localStorage.getItem(`zevi-experiences-${character.id}`);
            const hope = localStorage.getItem(`zevi-hope-${character.id}`);
            const downtime = localStorage.getItem(`zevi-downtime-${character.id}`);

            // Set the current character context
            localStorage.setItem('zevi-current-character-id', character.id);

            // Load equipment data
            if (equipment) {
                localStorage.setItem('zevi-equipment', equipment);
            } else {
                localStorage.removeItem('zevi-equipment');
            }

            // Load journal data
            if (journal) {
                localStorage.setItem('zevi-journal', journal);
            } else {
                localStorage.removeItem('zevi-journal');
            }

            // Load experiences data
            if (experiences) {
                localStorage.setItem('zevi-experiences', experiences);
            } else {
                localStorage.removeItem('zevi-experiences');
            }

            // Load hope data
            if (hope) {
                localStorage.setItem('zevi-hope', hope);
            } else {
                localStorage.removeItem('zevi-hope');
            }

            // Load downtime data
            if (downtime) {
                localStorage.setItem('zevi-downtime', downtime);
            } else {
                localStorage.removeItem('zevi-downtime');
            }

            this.currentCharacter = character;
            return true;
        } catch (error) {
            console.error('Error loading character data:', error);
            return false;
        }
    }

    // Save current character data to character-specific storage
    saveCharacterData(character) {
        try {
            const characterId = character.id;

            // Save all current localStorage data to character-specific keys
            const equipment = localStorage.getItem('zevi-equipment');
            const journal = localStorage.getItem('zevi-journal');
            const experiences = localStorage.getItem('zevi-experiences');
            const hope = localStorage.getItem('zevi-hope');
            const downtime = localStorage.getItem('zevi-downtime');

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

            // Update character metadata
            this.updateCharacterMetadata(characterId, {
                lastModified: new Date().toISOString()
            });

            return true;
        } catch (error) {
            console.error('Error saving character data:', error);
            return false;
        }
    }

    // Clear character-specific storage
    clearCharacterStorage(character) {
        try {
            const characterId = character.id;
            localStorage.removeItem(`zevi-equipment-${characterId}`);
            localStorage.removeItem(`zevi-journal-${characterId}`);
            localStorage.removeItem(`zevi-experiences-${characterId}`);
            localStorage.removeItem(`zevi-hope-${characterId}`);
            localStorage.removeItem(`zevi-downtime-${characterId}`);
        } catch (error) {
            console.error('Error clearing character storage:', error);
        }
    }

    // Initialize event listeners
    initializeEventListeners() {
        // Check if user has existing characters on page load
        document.addEventListener('DOMContentLoaded', () => {
            this.checkFirstTimeUser();
        });

        // Handle page visibility change to save current character
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.currentCharacter) {
                this.saveCharacterData(this.currentCharacter);
            }
        });

        // Handle page unload to save current character
        window.addEventListener('beforeunload', () => {
            if (this.currentCharacter) {
                this.saveCharacterData(this.currentCharacter);
            }
        });
    }

    // Check if this is a first-time user or if they have characters
    checkFirstTimeUser() {
        const hasCharacters = this.characters.length > 0;
        const currentCharacterId = localStorage.getItem('zevi-current-character-id');
        
        if (hasCharacters && currentCharacterId) {
            // Try to load the last character automatically
            const lastCharacter = this.getCharacter(currentCharacterId);
            if (lastCharacter) {
                this.loadCharacterAndRedirect(lastCharacter);
                return;
            }
        }
        
        // If no valid character or first time, disable load button if no characters
        if (!hasCharacters) {
            const loadBtn = document.getElementById('loadCharacterCard');
            if (loadBtn) {
                loadBtn.style.opacity = '0.6';
                loadBtn.style.pointerEvents = 'none';
                const button = loadBtn.querySelector('.option-btn');
                if (button) {
                    button.textContent = 'No Characters';
                    button.disabled = true;
                }
            }
        }
    }

    // Format date for display
    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Load character and redirect to main app
    loadCharacterAndRedirect(character) {
        if (this.loadCharacterData(character)) {
            window.location.href = 'index.html';
        } else {
            alert('Error loading character data. Please try again.');
        }
    }
}

// Global character manager instance
const characterManager = new CharacterManager();

// Global functions for the landing page
function showCharacterList() {
    const modal = document.getElementById('characterSelectionModal');
    const characterList = document.getElementById('characterList');
    
    // Clear previous content
    characterList.innerHTML = '';
    
    if (characterManager.characters.length === 0) {
        characterList.innerHTML = `
            <div class="empty-state">
                <h4>No Characters Found</h4>
                <p>Create your first character to get started!</p>
            </div>
        `;
    } else {
        characterManager.characters.forEach(character => {
            const characterCard = document.createElement('div');
            characterCard.className = 'character-card';
            characterCard.innerHTML = `
                <div class="character-info">
                    <div class="character-details">
                        <h4>${character.name}</h4>
                        ${character.subtitle ? `<div class="character-meta">Subtitle: ${character.subtitle}</div>` : ''}
                        <div class="character-meta">Level: ${character.level}</div>
                        <div class="character-meta">Created: ${characterManager.formatDate(character.createdAt)}</div>
                        <div class="character-meta">Last Modified: ${characterManager.formatDate(character.lastModified)}</div>
                    </div>
                    <div class="character-actions">
                        <button class="character-action-btn load-btn" onclick="loadCharacter('${character.id}')">Load</button>
                        <button class="character-action-btn delete-btn" onclick="showDeleteConfirmation('${character.id}', '${character.name}')">Delete</button>
                    </div>
                </div>
            `;
            
            characterList.appendChild(characterCard);
        });
    }
    
    modal.style.display = 'flex';
}

function closeCharacterModal() {
    const modal = document.getElementById('characterSelectionModal');
    modal.style.display = 'none';
}

function loadCharacter(characterId) {
    const character = characterManager.getCharacter(characterId);
    if (character) {
        characterManager.loadCharacterAndRedirect(character);
    } else {
        alert('Character not found!');
    }
}

function createNewCharacter() {
    // Clear any existing character data
    localStorage.removeItem('zevi-current-character-id');
    localStorage.removeItem('zevi-equipment');
    localStorage.removeItem('zevi-journal');
    localStorage.removeItem('zevi-experiences');
    localStorage.removeItem('zevi-hope');
    localStorage.removeItem('zevi-downtime');
    
    // Create a new character entry
    const newCharacter = characterManager.createCharacter({
        name: 'New Character',
        subtitle: '',
        level: 1
    });
    
    // Load the new character and redirect
    characterManager.loadCharacterAndRedirect(newCharacter);
}

function showDeleteConfirmation(characterId, characterName) {
    const modal = document.getElementById('deleteConfirmModal');
    const nameElement = document.getElementById('deleteCharacterName');
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    
    nameElement.textContent = characterName;
    
    // Remove any existing event listeners
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    
    // Add new event listener
    newConfirmBtn.addEventListener('click', () => {
        deleteCharacter(characterId);
    });
    
    modal.style.display = 'flex';
}

function closeDeleteModal() {
    const modal = document.getElementById('deleteConfirmModal');
    modal.style.display = 'none';
}

function deleteCharacter(characterId) {
    if (characterManager.deleteCharacter(characterId)) {
        closeDeleteModal();
        // Refresh the character list if modal is open
        const characterModal = document.getElementById('characterSelectionModal');
        if (characterModal.style.display === 'flex') {
            showCharacterList();
        }
        
        // Update the main page if no characters left
        characterManager.checkFirstTimeUser();
    } else {
        alert('Error deleting character. Please try again.');
    }
}

// Export for use in other files
window.characterManager = characterManager;