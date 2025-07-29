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
          platform: characterData.platform || 'Daggerheart', // Default to Daggerheart
          imageUrl: characterData.imageUrl || '', // Character portrait URL
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
          console.log('=== LOADING CHARACTER DATA ===', character.name);
          
          // Load all character-specific data
          const equipment = localStorage.getItem(`zevi-equipment-${character.id}`);
          const journal = localStorage.getItem(`zevi-journal-${character.id}`);
          const experiences = localStorage.getItem(`zevi-experiences-${character.id}`);
          const hope = localStorage.getItem(`zevi-hope-${character.id}`);
          const downtime = localStorage.getItem(`zevi-downtime-${character.id}`);

          // Set character-specific data as current
          if (equipment) {
              localStorage.setItem('zevi-equipment', equipment);
          } else {
              localStorage.removeItem('zevi-equipment');
          }
          
          if (journal) {
              localStorage.setItem('zevi-journal', journal);
          } else {
              localStorage.removeItem('zevi-journal');
          }
          
          if (experiences) {
              localStorage.setItem('zevi-experiences', experiences);
          } else {
              localStorage.removeItem('zevi-experiences');
          }
          
          if (hope) {
              localStorage.setItem('zevi-hope', hope);
          } else {
              localStorage.removeItem('zevi-hope');
          }
          
          if (downtime) {
              localStorage.setItem('zevi-downtime', downtime);
          } else {
              localStorage.removeItem('zevi-downtime');
          }

          // Set current character
          localStorage.setItem('zevi-current-character-id', character.id);

          // Set current character
          this.currentCharacter = character;
          
          // Populate UI fields with character data
          this.populateUIFields(character);

          console.log('Character data loaded successfully');
          return true;
      } catch (error) {
          console.error('Error loading character data:', error);
          return false;
      }
  }

  // Populate UI fields with character data
  populateUIFields(character) {
      console.log('Populating UI fields with character data:', character);

      // Character name
      const nameInput = document.querySelector('.name-box input[type="text"]');
      if (nameInput && character.name) {
          nameInput.value = character.name;
      }

      // Character level
      const levelInput = document.getElementById('charLevel');
      if (levelInput && character.level) {
          levelInput.textContent = character.level;
      }

      // Character subtitle
      const subtitleInput = document.querySelector('.name-box .subtitle');
      if (subtitleInput && character.subtitle) {
          subtitleInput.textContent = character.subtitle;
      }

      // Domain badges
      const domainBadges = document.querySelectorAll('.name-box .domain-badge');
      if (character.domain1 && domainBadges[0]) {
          domainBadges[0].textContent = character.domain1;
      }
      if (character.domain2 && domainBadges[1]) {
          domainBadges[1].textContent = character.domain2;
      }

      // Attribute values
      if (character.attributes) {
          Object.keys(character.attributes).forEach(attr => {
              const input = document.querySelector(`[data-attribute="${attr}"]`);
              if (input) {
                  input.value = character.attributes[attr];
              }
          });
      }

      // Evasion
      const evasionInput = document.getElementById('evasionValue');
      if (evasionInput && character.evasion) {
          evasionInput.value = character.evasion;
      }

      // Character image
      const charImage = document.getElementById('charImage');
      const charPlaceholder = document.getElementById('charPlaceholder');
      if (character.imageUrl && charImage) {
          charImage.src = character.imageUrl;
          charImage.style.display = 'block';
          if (charPlaceholder) {
              charPlaceholder.style.display = 'none';
          }
      } else if (charImage && charPlaceholder) {
          charImage.style.display = 'none';
          charPlaceholder.style.display = 'flex';
      }

      // HP and Stress values will be handled by their respective initialization functions
      // Hope value will be handled by hope initialization function

      console.log('UI fields populated successfully');
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
      console.log('=== CHARACTER MANAGER: DOMContentLoaded called ===');
      // Only run checkFirstTimeUser on landing page, not on index page
      if (window.location.pathname.includes('landing.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
        console.log('On landing page or root, running checkFirstTimeUser');
        this.checkFirstTimeUser();
      } else {
        console.log('Not on landing page, skipping checkFirstTimeUser');
      }
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
    console.log('=== CHARACTER MANAGER: checkFirstTimeUser called ===');
    console.log('Current pathname:', window.location.pathname);
    
    // Add guard to prevent infinite redirects
    const redirectGuard = sessionStorage.getItem('zevi-redirect-guard');
    console.log('Redirect guard in character manager:', redirectGuard);
    
    if (redirectGuard && parseInt(redirectGuard) > Date.now() - 5000) {
      console.warn('Redirect guard active in character manager - skipping auto-redirect');
      console.log('Guard time:', parseInt(redirectGuard), 'Current time:', Date.now(), 'Diff:', Date.now() - parseInt(redirectGuard));
      return;
    }

    const hasCharacters = this.characters.length > 0;
    const currentCharacterId = localStorage.getItem('zevi-current-character-id');
    
    console.log('Has characters:', hasCharacters);
    console.log('Current character ID:', currentCharacterId);
    console.log('Characters array:', this.characters);
    
    if (hasCharacters && currentCharacterId) {
      // Try to load the last character automatically
      const lastCharacter = this.getCharacter(currentCharacterId);
      console.log('Last character lookup result:', lastCharacter);
      
      if (lastCharacter) {
        // Only auto-redirect if we're on the landing page
        if (window.location.pathname.includes('landing.html')) {
          console.log('On landing page, attempting auto-redirect to character');
          this.loadCharacterAndRedirect(lastCharacter);
        } else {
          console.log('Not on landing page, skipping auto-redirect');
        }
        return;
      } else {
        // Character ID exists but character not found - clean up
        console.warn('Character ID found but character does not exist, cleaning up');
        localStorage.removeItem('zevi-current-character-id');
      }
    }
    
    console.log('No valid character found or no characters exist');
    
    // If no valid character or first time, disable load button if no characters
    if (!hasCharacters) {
      console.log('No characters exist, disabling load button');
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
    console.log('=== CHARACTER MANAGER: loadCharacterAndRedirect called ===');
    console.log('Character to load:', character);
    
    if (this.loadCharacterData(character)) {
      console.log('Character data loaded successfully, redirecting to index.html');
      // Set redirect guard before redirecting
      sessionStorage.setItem('zevi-redirect-guard', Date.now().toString());
      console.log('Set redirect guard before redirect:', Date.now().toString());
      window.location.href = 'index.html';
    } else {
      console.error('Failed to load character data');
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
