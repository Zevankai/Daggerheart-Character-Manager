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
          
          // Load basic character data into DOM
          setTimeout(() => {
              this.loadBasicCharacterData(character);
          }, 100); // Small delay to ensure DOM is ready
          
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

          // Save basic character sheet data (name, attributes, HP, etc.)
          this.saveBasicCharacterData(character);

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

  // Save basic character sheet data (name, attributes, HP, stress, etc.)
  saveBasicCharacterData(character) {
      try {
          const characterId = character.id;
          const basicData = this.collectBasicCharacterData();
          
          localStorage.setItem(`zevi-basic-data-${characterId}`, JSON.stringify(basicData));
          
          // Also update the character object itself
          Object.assign(character, basicData);
          this.saveCharacters(); // Save the updated characters list
          
      } catch (error) {
          console.error('Error saving basic character data:', error);
      }
  }

  // Collect current basic character data from the DOM
  collectBasicCharacterData() {
      const data = {};
      
      // Character name
      const nameInput = document.querySelector('.name-box input[type="text"]');
      if (nameInput) data.name = nameInput.value;
      
      // Character subtitle
      const subtitleDiv = document.querySelector('.name-box .subtitle');
      if (subtitleDiv) data.subtitle = subtitleDiv.textContent || subtitleDiv.innerText;
      
      // Character level
      const levelSpan = document.getElementById('charLevel');
      if (levelSpan) data.level = parseInt(levelSpan.textContent || levelSpan.innerText) || 1;
      
      // Domain badges
      const domainBadges = document.querySelectorAll('.domain-badge');
      data.domains = Array.from(domainBadges).map(badge => badge.textContent || badge.innerText);
      
      // Attributes
      data.attributes = {};
      const attributeInputs = document.querySelectorAll('.attribute-value[data-attribute]');
      attributeInputs.forEach(input => {
          const attribute = input.getAttribute('data-attribute');
          data.attributes[attribute] = parseInt(input.value) || 0;
      });
      
      // Evasion
      const evasionInput = document.getElementById('evasionValue');
      if (evasionInput) data.evasion = parseInt(evasionInput.value) || 10;
      
      // HP and Stress (if available)
      const minorDamageInput = document.getElementById('minor-damage-value');
      const majorDamageInput = document.getElementById('major-damage-value');
      if (minorDamageInput && majorDamageInput) {
          data.damage = {
              minor: parseInt(minorDamageInput.value) || 0,
              major: parseInt(majorDamageInput.value) || 0
          };
      }
      
      // Character image
      const charImage = document.getElementById('charImage');
      if (charImage && charImage.src && !charImage.src.includes('blob:')) data.image = charImage.src;
      
      // HP and Stress circles
      const hpCircles = localStorage.getItem('zevi-hp-circles');
      const stressCircles = localStorage.getItem('zevi-stress-circles');
      if (hpCircles) data.hpCircles = hpCircles;
      if (stressCircles) data.stressCircles = stressCircles;
      
      // Armor circles
      const armorCircles = localStorage.getItem('zevi-armor-circles');
      const activeArmorCount = localStorage.getItem('zevi-active-armor-count');
      const totalArmorCircles = localStorage.getItem('zevi-total-armor-circles');
      if (armorCircles) data.armorCircles = armorCircles;
      if (activeArmorCount) data.activeArmorCount = activeArmorCount;
      if (totalArmorCircles) data.totalArmorCircles = totalArmorCircles;
      
      // Evasion
      const evasionValue = localStorage.getItem('zevi-evasion');
      if (evasionValue) data.evasionLS = evasionValue;
      
      return data;
  }

  // Load basic character data into the DOM
  loadBasicCharacterData(character) {
      try {
          const characterId = character.id;
          const basicDataStr = localStorage.getItem(`zevi-basic-data-${characterId}`);
          
          if (!basicDataStr) return;
          
          const basicData = JSON.parse(basicDataStr);
          
          // Character name
          const nameInput = document.querySelector('.name-box input[type="text"]');
          if (nameInput && basicData.name) nameInput.value = basicData.name;
          
          // Character subtitle
          const subtitleDiv = document.querySelector('.name-box .subtitle');
          if (subtitleDiv && basicData.subtitle) subtitleDiv.textContent = basicData.subtitle;
          
          // Character level
          const levelSpan = document.getElementById('charLevel');
          if (levelSpan && basicData.level) levelSpan.textContent = basicData.level;
          
          // Domain badges
          const domainBadges = document.querySelectorAll('.domain-badge');
          if (basicData.domains && basicData.domains.length > 0) {
              domainBadges.forEach((badge, index) => {
                  if (basicData.domains[index]) {
                      badge.textContent = basicData.domains[index];
                  }
              });
          }
          
          // Attributes
          if (basicData.attributes) {
              Object.keys(basicData.attributes).forEach(attribute => {
                  const input = document.querySelector(`.attribute-value[data-attribute="${attribute}"]`);
                  if (input) input.value = basicData.attributes[attribute];
              });
          }
          
          // Evasion
          const evasionInput = document.getElementById('evasionValue');
          if (evasionInput && basicData.evasion) evasionInput.value = basicData.evasion;
          
          // HP and Stress
          if (basicData.damage) {
              const minorDamageInput = document.getElementById('minor-damage-value');
              const majorDamageInput = document.getElementById('major-damage-value');
              if (minorDamageInput) minorDamageInput.value = basicData.damage.minor || 0;
              if (majorDamageInput) majorDamageInput.value = basicData.damage.major || 0;
          }
          
          // Character image
          const charImage = document.getElementById('charImage');
          const charPlaceholder = document.getElementById('charPlaceholder');
          if (charImage && basicData.image) {
              charImage.src = basicData.image;
              if (charPlaceholder) charPlaceholder.style.display = 'none';
          }
          
          // HP and Stress circles
          if (basicData.hpCircles) localStorage.setItem('zevi-hp-circles', basicData.hpCircles);
          if (basicData.stressCircles) localStorage.setItem('zevi-stress-circles', basicData.stressCircles);
          
          // Armor data
          if (basicData.armorCircles) localStorage.setItem('zevi-armor-circles', basicData.armorCircles);
          if (basicData.activeArmorCount) localStorage.setItem('zevi-active-armor-count', basicData.activeArmorCount);
          if (basicData.totalArmorCircles) localStorage.setItem('zevi-total-armor-circles', basicData.totalArmorCircles);
          
          // Evasion
          if (basicData.evasionLS) localStorage.setItem('zevi-evasion', basicData.evasionLS);
          
      } catch (error) {
          console.error('Error loading basic character data:', error);
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
          localStorage.removeItem(`zevi-basic-data-${characterId}`);
      } catch (error) {
          console.error('Error clearing character storage:', error);
      }
  }

  // Initialize event listeners
  initializeEventListeners() {
      // Check if user has existing characters on page load
      document.addEventListener('DOMContentLoaded', () => {
          this.checkFirstTimeUser();
          this.setupAutoSave();
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

  // Setup real-time auto-saving for all character data
  setupAutoSave() {
      const autoSaveData = () => {
          if (this.currentCharacter) {
              this.saveBasicCharacterData(this.currentCharacter);
              this.showSaveIndicator();
          }
      };

      // Debounce function to prevent excessive saving
      let saveTimeout;
      const debouncedSave = () => {
          clearTimeout(saveTimeout);
          saveTimeout = setTimeout(autoSaveData, 500); // Save after 500ms of inactivity
      };

      // Character name input
      const nameInput = document.querySelector('.name-box input[type="text"]');
      if (nameInput) {
          nameInput.addEventListener('input', debouncedSave);
          nameInput.addEventListener('blur', autoSaveData);
      }

      // Character subtitle (contenteditable)
      const subtitleDiv = document.querySelector('.name-box .subtitle');
      if (subtitleDiv) {
          subtitleDiv.addEventListener('input', debouncedSave);
          subtitleDiv.addEventListener('blur', autoSaveData);
      }

      // Character level
      const levelSpan = document.getElementById('charLevel');
      if (levelSpan) {
          levelSpan.addEventListener('input', debouncedSave);
          levelSpan.addEventListener('blur', autoSaveData);
      }

      // Domain badges
      const domainBadges = document.querySelectorAll('.domain-badge');
      domainBadges.forEach(badge => {
          badge.addEventListener('input', debouncedSave);
          badge.addEventListener('blur', autoSaveData);
      });

      // Attribute inputs
      const attributeInputs = document.querySelectorAll('.attribute-value[data-attribute]');
      attributeInputs.forEach(input => {
          input.addEventListener('input', debouncedSave);
          input.addEventListener('change', autoSaveData);
          input.addEventListener('blur', autoSaveData);
      });

      // Evasion input
      const evasionInput = document.getElementById('evasionValue');
      if (evasionInput) {
          evasionInput.addEventListener('input', debouncedSave);
          evasionInput.addEventListener('change', autoSaveData);
          evasionInput.addEventListener('blur', autoSaveData);
      }

      // HP and Stress inputs
      const damageInputs = document.querySelectorAll('.damage-value-input');
      damageInputs.forEach(input => {
          input.addEventListener('input', debouncedSave);
          input.addEventListener('change', autoSaveData);
          input.addEventListener('blur', autoSaveData);
      });

      // Character image upload
      const charUpload = document.getElementById('charUpload');
      if (charUpload) {
          charUpload.addEventListener('change', () => {
              setTimeout(autoSaveData, 1000); // Give time for image to load
          });
      }

      // Set up mutation observer for dynamically added content
      const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
              mutation.addedNodes.forEach((node) => {
                  if (node.nodeType === Node.ELEMENT_NODE) {
                      // Check for new input fields that need auto-save
                      const newInputs = node.querySelectorAll ? node.querySelectorAll('input, [contenteditable]') : [];
                      newInputs.forEach(input => {
                          if (input.type === 'text' || input.type === 'number' || input.contentEditable === 'true') {
                              input.addEventListener('input', debouncedSave);
                              input.addEventListener('change', autoSaveData);
                              input.addEventListener('blur', autoSaveData);
                          }
                      });
                  }
              });
          });
      });

      // Start observing
      observer.observe(document.body, {
          childList: true,
          subtree: true
      });

      console.log('Auto-save system initialized for character data');
  }

  // Show visual indicator that data has been saved
  showSaveIndicator() {
      const indicator = document.getElementById('autoSaveIndicator');
      if (indicator) {
          indicator.style.display = 'block';
          indicator.style.opacity = '1';
          
          // Hide after 2 seconds
          setTimeout(() => {
              indicator.style.opacity = '0';
              setTimeout(() => {
                  indicator.style.display = 'none';
              }, 300);
          }, 2000);
      }
  }

  // Check if this is a first-time user or if they have characters
  checkFirstTimeUser() {
      const hasCharacters = this.characters.length > 0;
      const currentCharacterId = localStorage.getItem('zevi-current-character-id');
      
      // Never auto-redirect - always let users choose from the landing page
      // The landing page should always be the entry point
      
      // Clear any redirect flags since we're staying on the landing page
      const isOnLandingPage = window.location.pathname.includes('landing.html') || window.location.pathname === '/';
      if (isOnLandingPage) {
          sessionStorage.removeItem('zevi-redirect-attempted');
      }
      
      // If no characters exist, disable load button
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
      } else {
          // If characters exist, ensure load button is enabled
          const loadBtn = document.getElementById('loadCharacterCard');
          if (loadBtn) {
              loadBtn.style.opacity = '1';
              loadBtn.style.pointerEvents = 'auto';
              const button = loadBtn.querySelector('.option-btn');
              if (button) {
                  button.textContent = 'Load Character';
                  button.disabled = false;
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
          // Set flag to indicate we're coming from landing page with a character selection
          sessionStorage.setItem('zevi-from-landing', 'true');
          sessionStorage.removeItem('zevi-redirect-attempted');
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
      // Clear any redirect flags
      sessionStorage.removeItem('zevi-redirect-attempted');
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
  
  // Clear any redirect flags
  sessionStorage.removeItem('zevi-redirect-attempted');
  
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
