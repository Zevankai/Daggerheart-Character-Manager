// Character Manager - Compatibility layer for old systems
class CharacterManager {
  constructor() {
      this.characters = [];
      this.currentCharacter = null;
      this.loadCharacters();
  }

  // Load characters from new core system
  loadCharacters() {
      this.characters = [];
      
      // Get characters from new system storage
      Object.keys(localStorage).forEach(key => {
          if (key.startsWith('zevi-character-file-')) {
              try {
                  const characterData = JSON.parse(localStorage.getItem(key));
                  const characterId = key.replace('zevi-character-file-', '');
                  
                  this.characters.push({
                      id: characterId,
                      name: characterData.name || 'Unnamed Character',
                      platform: 'Daggerheart',
                      level: characterData.level || 5,
                      imageUrl: characterData.imageUrl || '',
                      subtitle: characterData.subtitle || '',
                      createdAt: characterData.createdAt || new Date().toISOString(),
                      lastModified: characterData.lastModified || new Date().toISOString()
                  });
              } catch (error) {
                  console.error('Error parsing character data for key:', key, error);
              }
          }
      });
      
      // Sort by creation date
      this.characters.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      return this.characters;
  }

  // Save characters (handled by new core system)
  saveCharacters() {
      // No-op - handled by new core system
      console.log('Character saving handled by new core system');
  }

  // Create character (delegate to new system)
  createCharacter(characterData = {}) {
      if (window.app && window.app.initialized) {
          // Let the new system handle it
          return window.app.createNewCharacter().then(id => {
              return {
                  id: id,
                  name: characterData.name || 'New Character',
                  platform: characterData.platform || 'Daggerheart',
                  level: characterData.level || 5,
                  imageUrl: characterData.imageUrl || '',
                  subtitle: characterData.subtitle || '',
                  createdAt: new Date().toISOString(),
                  lastModified: new Date().toISOString()
              };
          });
      }
      
      console.error('New app system not available');
      return null;
  }

  // Get character by ID
  getCharacter(id) {
      return this.characters.find(char => char.id === id) || null;
  }

  // Delete character (delegate to new system)
  deleteCharacter(id) {
      if (window.app && window.app.initialized) {
          window.app.deleteCharacter(id);
          this.loadCharacters(); // Refresh list
      }
  }

  // Load character data (delegate to new system)
  async loadCharacterData(character) {
      if (window.app && window.app.initialized) {
          await window.app.switchToCharacter(character.id);
          this.currentCharacter = character;
      }
  }

  // Update character metadata
  updateCharacterMetadata(id, updates) {
      if (window.app && window.app.initialized) {
          const characterData = window.app.characterData.loadCharacterData(id);
          Object.assign(characterData, updates);
          window.app.characterData.saveCharacterData(id, characterData);
          this.loadCharacters(); // Refresh list
      }
  }

  // Save character data (delegate to new system)
  saveCharacterData(character) {
      if (window.app && window.app.initialized) {
          window.app.autoSave.triggerManualSave();
      }
  }
}

// Create global instance
window.characterManager = new CharacterManager();

// Landing page functions
function showCharacterList() {
    const modal = document.getElementById('characterSelectionModal');
    const characterList = document.getElementById('characterList');
    
    if (!modal || !characterList) {
        console.error('Character selection modal elements not found');
        return;
    }
    
    // Clear previous content
    characterList.innerHTML = '';
    
    // Get characters from character manager
    const characters = window.characterManager ? window.characterManager.characters : [];
    
    if (characters.length === 0) {
        characterList.innerHTML = `
            <div class="empty-state">
                <h4>No Characters Found</h4>
                <p>Create your first character to get started!</p>
            </div>
        `;
    } else {
        characters.forEach(character => {
            const characterCard = document.createElement('div');
            characterCard.className = 'character-card';
            characterCard.innerHTML = `
                <div class="character-info">
                    <div class="character-details">
                        <h4>${character.name}</h4>
                        <div class="character-meta">Level: ${character.level}</div>
                        <div class="character-meta">Created: ${formatDate(character.createdAt)}</div>
                        <div class="character-meta">Last Modified: ${formatDate(character.lastModified)}</div>
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
    if (modal) {
        modal.style.display = 'none';
    }
}

function loadCharacter(characterId) {
    const character = window.characterManager ? window.characterManager.getCharacter(characterId) : null;
    if (character) {
        // Set current character and redirect to main page
        if (window.app && window.app.initialized) {
            window.app.switchToCharacter(characterId).then(() => {
                window.location.href = 'index.html';
            });
        } else {
            // Fallback: set character ID and redirect
            localStorage.setItem('zevi-current-character-id', characterId);
            window.location.href = 'index.html';
        }
    } else {
        alert('Character not found!');
    }
}

async function createNewCharacter() {
    console.log('=== CREATE NEW CHARACTER: Starting ===');
    
    try {
        // Try comprehensive integration system first
        if (window.comprehensiveIntegration && window.comprehensiveIntegration.isInitialized) {
            console.log('Using comprehensive integration system');
            const newCharacterId = await window.comprehensiveIntegration.createNewCharacter({
                name: 'New Character',
                level: '1'
            });
            
            if (newCharacterId) {
                console.log('New character created:', newCharacterId);
                // Redirect to main page
                window.location.href = 'index.html';
                return;
            } else {
                console.error('Comprehensive system failed to create character');
            }
        }
        
        // Fallback to old app system
        if (window.app && window.app.initialized) {
            console.log('Falling back to old app system');
            const newCharacterId = await window.app.createNewCharacter();
            console.log('New character created:', newCharacterId);
            
            // Redirect to main page
            window.location.href = 'index.html';
        } else {
            console.error('No character creation system available');
            alert('Character creation system not ready. Please refresh the page and try again.');
        }
    } catch (error) {
        console.error('Error creating character:', error);
        alert('Error creating character. Please try again.');
    }
}

function showDeleteConfirmation(characterId, characterName) {
    const modal = document.getElementById('deleteConfirmModal');
    const nameElement = document.getElementById('deleteCharacterName');
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    
    if (!modal || !nameElement || !confirmBtn) {
        console.error('Delete confirmation modal elements not found');
        return;
    }
    
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
    if (modal) {
        modal.style.display = 'none';
    }
}

function deleteCharacter(characterId) {
    if (window.characterManager) {
        window.characterManager.deleteCharacter(characterId);
        closeDeleteModal();
        
        // Refresh the character list if modal is open
        const characterModal = document.getElementById('characterSelectionModal');
        if (characterModal && characterModal.style.display === 'flex') {
            showCharacterList();
        }
    } else {
        alert('Error deleting character. Please try again.');
    }
}

function formatDate(dateString) {
    if (!dateString) return 'Unknown';
    
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return 'Invalid Date';
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.characterManager) {
            window.characterManager.loadCharacters();
        }
    }, 1500); // Load after core system
});
