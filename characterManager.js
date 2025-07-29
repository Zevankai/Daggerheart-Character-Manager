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
          // Use proxy system to clear character data
          if (window.characterStorageProxy) {
              window.characterStorageProxy.clearCharacterData(characterId);
          } else {
              // Fallback to manual clearing
              this.clearCharacterStorage(this.characters[index]);
          }
          
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
          console.log('=== LOADING CHARACTER DATA ===', character.name, 'ID:', character.id);
          
          // First, save any current character data to their specific storage
          if (this.currentCharacter && this.currentCharacter.id !== character.id) {
              console.log('Different character loading - saving current character data first');
              console.log('Current character:', this.currentCharacter.name, 'ID:', this.currentCharacter.id);
              console.log('New character:', character.name, 'ID:', character.id);
              
              // The proxy system will handle saving automatically
              console.log('Proxy system will handle character data isolation automatically');
          }
          
          // Use the proxy system to switch character context
          if (window.characterStorageProxy) {
              window.characterStorageProxy.loadCharacterContext(character.id);
          } else {
              // Fallback to manual system
              localStorage.setItem('zevi-current-character-id', character.id);
          }

          // Set current character
          this.currentCharacter = character;
          
          // Populate UI fields with character data
          this.populateUIFields(character);

          // IMPORTANT: Restore various system states
          setTimeout(() => {
              this.restoreAllCharacterSystems(character.id);
          }, 100); // Small delay to ensure UI is ready

          console.log('Character data loaded successfully');
          return true;
      } catch (error) {
          console.error('Error loading character data:', error);
          return false;
      }
  }

  // Clear all global character data to prevent cross-character contamination
  clearGlobalCharacterData() {
      console.log('Clearing global character data...');
      
      // Character-specific data that should be isolated
      const characterDataKeys = [
          'zevi-equipment',
          'zevi-journal',
          'zevi-journal-entries', // Used by journal.js
          'zevi-experiences',
          'zevi-hope',
          'zevi-max-hope',
          'zevi-downtime',
          'zevi-projects', // Used by downtime.js
          'zevi-character-details', // Used by details.js
          'zevi-hp-circles',
          'zevi-stress-circles',
          'zevi-armor-circles',
          'zevi-minor-damage-value',
          'zevi-major-damage-value',
          'zevi-active-armor-count',
          'zevi-total-armor-circles',
          'zevi-evasion'
      ];
      
      characterDataKeys.forEach(key => {
          localStorage.removeItem(key);
      });
      
      console.log('Global character data cleared');
  }

  // Load character-specific data and set as current global data
  loadCharacterSpecificData(characterId) {
      console.log('Loading character-specific data for:', characterId);
      
      // Define all character-specific data mappings
      const dataMapping = [
          // Core character data
          { global: 'zevi-equipment', specific: `zevi-equipment-${characterId}` },
          { global: 'zevi-journal', specific: `zevi-journal-${characterId}` },
          { global: 'zevi-journal-entries', specific: `zevi-journal-entries-${characterId}` },
          { global: 'zevi-experiences', specific: `zevi-experiences-${characterId}` },
          { global: 'zevi-hope', specific: `zevi-hope-${characterId}` },
          { global: 'zevi-max-hope', specific: `zevi-max-hope-${characterId}` },
          { global: 'zevi-downtime', specific: `zevi-downtime-${characterId}` },
          { global: 'zevi-projects', specific: `zevi-projects-${characterId}` },
          { global: 'zevi-character-details', specific: `zevi-character-details-${characterId}` },
          
          // HP/Stress/Armor system data
          { global: 'zevi-hp-circles', specific: `zevi-hp-circles-${characterId}` },
          { global: 'zevi-stress-circles', specific: `zevi-stress-circles-${characterId}` },
          { global: 'zevi-armor-circles', specific: `zevi-armor-circles-${characterId}` },
          { global: 'zevi-minor-damage-value', specific: `zevi-minor-damage-value-${characterId}` },
          { global: 'zevi-major-damage-value', specific: `zevi-major-damage-value-${characterId}` },
          { global: 'zevi-active-armor-count', specific: `zevi-active-armor-count-${characterId}` },
          { global: 'zevi-total-armor-circles', specific: `zevi-total-armor-circles-${characterId}` },
          { global: 'zevi-evasion', specific: `zevi-evasion-${characterId}` }
      ];
      
      // Load each piece of character-specific data
      dataMapping.forEach(({ global, specific }) => {
          const data = localStorage.getItem(specific);
          if (data) {
              localStorage.setItem(global, data);
              console.log(`Loaded ${global} from ${specific}`);
          } else {
              localStorage.removeItem(global);
              console.log(`No data for ${global} - cleared global key`);
          }
      });
      
      // Load HP/Stress state
      const hpStressState = localStorage.getItem(`zevi-hp-stress-state-${characterId}`);
      if (hpStressState) {
          // This will be handled by restoreAllCharacterSystems
          console.log('HP/Stress state found for character');
      }
      
      // Load Active Weapons/Armor state
      const activeWeaponsArmorState = localStorage.getItem(`zevi-active-weapons-armor-${characterId}`);
      if (activeWeaponsArmorState) {
          // This will be handled by restoreAllCharacterSystems
          console.log('Active Weapons/Armor state found for character');
      }
  }

  // Restore all character systems after loading data
  restoreAllCharacterSystems(characterId) {
      console.log('Restoring all character systems...');
      
      // Restore HP/Stress state
      const hpStressState = localStorage.getItem(`zevi-hp-stress-state-${characterId}`);
      if (hpStressState) {
          this.restoreHPStressState(hpStressState);
      }
      
      // Restore Active Weapons/Armor state
      const activeWeaponsArmorState = localStorage.getItem(`zevi-active-weapons-armor-${characterId}`);
      if (activeWeaponsArmorState) {
          this.restoreActiveWeaponsArmorState(activeWeaponsArmorState);
      }
      
      // Trigger system reinitializations if available
      setTimeout(() => {
          // Reinitialize HP/Stress system
          if (window.initializeHPStress && typeof window.initializeHPStress === 'function') {
              console.log('Reinitializing HP/Stress system');
              window.initializeHPStress();
          }
          
          // Reinitialize Hope system
          if (window.initializeHope && typeof window.initializeHope === 'function') {
              console.log('Reinitializing Hope system');
              window.initializeHope();
          }
          
          // Reinitialize Equipment system
          if (window.initializeEquipment && typeof window.initializeEquipment === 'function') {
              console.log('Reinitializing Equipment system');
              window.initializeEquipment();
          }
          
          // Reinitialize other systems as needed
          console.log('All character systems restored');
      }, 200);
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

      // Character image - IMPORTANT: Always update the character object with current imageUrl
      const charImage = document.getElementById('charImage');
      const charPlaceholder = document.getElementById('charPlaceholder');
      
      console.log('Character image URL:', character.imageUrl);
      
      if (character.imageUrl && charImage) {
          charImage.src = character.imageUrl;
          charImage.style.display = 'block';
          if (charPlaceholder) {
              charPlaceholder.style.display = 'none';
          }
          console.log('Character image set successfully');
      } else if (charImage && charPlaceholder) {
          charImage.style.display = 'none';
          charPlaceholder.style.display = 'flex';
          console.log('No character image - showing placeholder');
      }

      // HP and Stress values will be handled by their respective initialization functions
      // Hope value will be handled by hope initialization function

      console.log('UI fields populated successfully');
  }

  // Restore HP/Stress state from saved data
  restoreHPStressState(hpStressStateJson) {
      if (!hpStressStateJson) return;
      
      try {
          console.log('Restoring HP/Stress state...');
          const state = JSON.parse(hpStressStateJson);
          
          // Restore HP pips
          if (state.hp) {
              const hpTracker = document.getElementById('hp-tracker');
              if (hpTracker) {
                  const hpPips = hpTracker.querySelectorAll('.hp-pip');
                  hpPips.forEach((pip, index) => {
                      if (index < state.hp.current) {
                          pip.classList.add('filled');
                      } else {
                          pip.classList.remove('filled');
                      }
                  });
                  console.log('HP state restored:', state.hp.current, '/', state.hp.max);
              }
          }

          // Restore Stress pips
          if (state.stress) {
              const stressTracker = document.getElementById('stress-tracker');
              if (stressTracker) {
                  const stressPips = stressTracker.querySelectorAll('.stress-pip');
                  stressPips.forEach((pip, index) => {
                      if (index < state.stress.current) {
                          pip.classList.add('filled');
                      } else {
                          pip.classList.remove('filled');
                      }
                  });
                  console.log('Stress state restored:', state.stress.current, '/', state.stress.max);
              }
          }

          // Restore damage values
          if (state.damage) {
              const minorDamageInput = document.getElementById('minor-damage-value');
              const majorDamageInput = document.getElementById('major-damage-value');
              
              if (minorDamageInput) {
                  minorDamageInput.value = state.damage.minor || 0;
              }
              if (majorDamageInput) {
                  majorDamageInput.value = state.damage.major || 0;
              }
              
              console.log('Damage values restored:', state.damage);
          }

      } catch (error) {
          console.error('Error restoring HP/Stress state:', error);
      }
  }

  // Restore Active Weapons/Armor state from saved data
  restoreActiveWeaponsArmorState(weaponsArmorStateJson) {
      if (!weaponsArmorStateJson) return;
      
      try {
          console.log('Restoring Active Weapons/Armor state...');
          const state = JSON.parse(weaponsArmorStateJson);
          
          // This is a complex restoration since it depends on the specific UI structure
          // For now, just log what we would restore
          console.log('Weapons data to restore:', state.weapons);
          console.log('Armor data to restore:', state.armor);
          
          // TODO: Implement specific restoration based on how the active weapons/armor UI works
          // This would require understanding the exact structure of these sections
          
      } catch (error) {
          console.error('Error restoring Active Weapons/Armor state:', error);
      }
  }

  // Save current character data to character-specific storage
  saveCharacterData(character) {
      try {
          const characterId = character.id;
          console.log('Saving character data for:', characterId);

          // Define all data that should be saved to character-specific storage
          const dataMapping = [
              // Core character data
              { global: 'zevi-equipment', specific: `zevi-equipment-${characterId}` },
              { global: 'zevi-journal', specific: `zevi-journal-${characterId}` },
              { global: 'zevi-journal-entries', specific: `zevi-journal-entries-${characterId}` },
              { global: 'zevi-experiences', specific: `zevi-experiences-${characterId}` },
              { global: 'zevi-hope', specific: `zevi-hope-${characterId}` },
              { global: 'zevi-max-hope', specific: `zevi-max-hope-${characterId}` },
              { global: 'zevi-downtime', specific: `zevi-downtime-${characterId}` },
              { global: 'zevi-projects', specific: `zevi-projects-${characterId}` },
              { global: 'zevi-character-details', specific: `zevi-character-details-${characterId}` },
              
              // HP/Stress/Armor system data
              { global: 'zevi-hp-circles', specific: `zevi-hp-circles-${characterId}` },
              { global: 'zevi-stress-circles', specific: `zevi-stress-circles-${characterId}` },
              { global: 'zevi-armor-circles', specific: `zevi-armor-circles-${characterId}` },
              { global: 'zevi-minor-damage-value', specific: `zevi-minor-damage-value-${characterId}` },
              { global: 'zevi-major-damage-value', specific: `zevi-major-damage-value-${characterId}` },
              { global: 'zevi-active-armor-count', specific: `zevi-active-armor-count-${characterId}` },
              { global: 'zevi-total-armor-circles', specific: `zevi-total-armor-circles-${characterId}` },
              { global: 'zevi-evasion', specific: `zevi-evasion-${characterId}` }
          ];

          // Save each piece of data
          dataMapping.forEach(({ global, specific }) => {
              const data = localStorage.getItem(global);
              if (data) {
                  localStorage.setItem(specific, data);
                  console.log(`Saved ${global} to ${specific}`);
              }
          });

          // IMPORTANT: Also capture and save current UI states
          const hpStressState = this.captureHPStressState();
          const activeWeaponsArmorState = this.captureActiveWeaponsArmorState();

          if (hpStressState) {
              localStorage.setItem(`zevi-hp-stress-state-${characterId}`, JSON.stringify(hpStressState));
              console.log('Saved HP/Stress state for character');
          }

          if (activeWeaponsArmorState) {
              localStorage.setItem(`zevi-active-weapons-armor-${characterId}`, JSON.stringify(activeWeaponsArmorState));
              console.log('Saved Active Weapons/Armor state for character');
          }

          // Update character metadata
          this.updateCharacterMetadata(characterId, {
              lastModified: new Date().toISOString()
          });

          console.log('Character data saved successfully');
          return true;
      } catch (error) {
          console.error('Error saving character data:', error);
          return false;
      }
  }

  // Capture current HP/Stress state from the UI
  captureHPStressState() {
      try {
          const hpTracker = document.getElementById('hp-tracker');
          const stressTracker = document.getElementById('stress-tracker');
          
          let hpState = { current: 0, max: 0 };
          let stressState = { current: 0, max: 0 };

          if (hpTracker) {
              const hpFilled = hpTracker.querySelectorAll('.hp-pip.filled').length;
              const hpTotal = hpTracker.querySelectorAll('.hp-pip').length;
              hpState = { current: hpFilled, max: hpTotal };
          }

          if (stressTracker) {
              const stressFilled = stressTracker.querySelectorAll('.stress-pip.filled').length;
              const stressTotal = stressTracker.querySelectorAll('.stress-pip').length;
              stressState = { current: stressFilled, max: stressTotal };
          }

          // Also capture damage values if they exist
          const minorDamage = document.getElementById('minor-damage-value')?.value || 0;
          const majorDamage = document.getElementById('major-damage-value')?.value || 0;

          return {
              hp: hpState,
              stress: stressState,
              damage: {
                  minor: parseInt(minorDamage) || 0,
                  major: parseInt(majorDamage) || 0
              },
              timestamp: Date.now()
          };
      } catch (error) {
          console.error('Error capturing HP/Stress state:', error);
          return null;
      }
  }

  // Capture current Active Weapons/Armor state from the UI
  captureActiveWeaponsArmorState() {
      try {
          // Look for active weapons section
          const activeWeaponsSection = document.getElementById('active-weapons-section') || 
                                     document.querySelector('.active-weapons') ||
                                     document.querySelector('[data-section="active-weapons"]');
          
          // Look for armor section
          const armorSection = document.getElementById('armor-section') ||
                             document.querySelector('.armor-section') ||
                             document.querySelector('[data-section="armor"]');

          let weaponsData = null;
          let armorData = null;

          // Capture weapons data
          if (activeWeaponsSection) {
              const weaponElements = activeWeaponsSection.querySelectorAll('.weapon-item, .active-weapon');
              weaponsData = Array.from(weaponElements).map(el => {
                  return {
                      name: el.querySelector('.weapon-name, .item-name')?.textContent || '',
                      type: el.querySelector('.weapon-type')?.textContent || '',
                      dice: el.querySelector('.weapon-dice, .dice-roll')?.textContent || '',
                      ability: el.querySelector('.weapon-ability, .ability')?.textContent || ''
                  };
              });
          }

          // Capture armor data
          if (armorSection) {
              const armorElements = armorSection.querySelectorAll('.armor-item, .active-armor');
              armorData = Array.from(armorElements).map(el => {
                  return {
                      name: el.querySelector('.armor-name, .item-name')?.textContent || '',
                      type: el.querySelector('.armor-type')?.textContent || '',
                      protection: el.querySelector('.armor-protection, .protection')?.textContent || ''
                  };
              });
          }

          return {
              weapons: weaponsData,
              armor: armorData,
              timestamp: Date.now()
          };
      } catch (error) {
          console.error('Error capturing Active Weapons/Armor state:', error);
          return null;
      }
  }

  // Clear character-specific storage
  clearCharacterStorage(character) {
      try {
          const characterId = character.id;
          
          // Clear all character-specific storage keys
          const characterKeys = [
              `zevi-equipment-${characterId}`,
              `zevi-journal-${characterId}`,
              `zevi-journal-entries-${characterId}`,
              `zevi-experiences-${characterId}`,
              `zevi-hope-${characterId}`,
              `zevi-max-hope-${characterId}`,
              `zevi-downtime-${characterId}`,
              `zevi-projects-${characterId}`,
              `zevi-character-details-${characterId}`,
              `zevi-hp-circles-${characterId}`,
              `zevi-stress-circles-${characterId}`,
              `zevi-armor-circles-${characterId}`,
              `zevi-minor-damage-value-${characterId}`,
              `zevi-major-damage-value-${characterId}`,
              `zevi-active-armor-count-${characterId}`,
              `zevi-total-armor-circles-${characterId}`,
              `zevi-evasion-${characterId}`,
              `zevi-hp-stress-state-${characterId}`,
              `zevi-active-weapons-armor-${characterId}`
          ];
          
          characterKeys.forEach(key => {
              localStorage.removeItem(key);
          });
          
          console.log('Character-specific storage cleared for:', characterId);
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
  console.log('=== CREATE NEW CHARACTER: Starting fresh character creation ===');
  
  // Create a new character entry
  const newCharacter = characterManager.createCharacter({
      name: 'New Character',
      subtitle: '',
      level: 1
  });
  
  console.log('New character created:', newCharacter.name, 'ID:', newCharacter.id);
  
  // The proxy system will automatically handle data isolation
  // when we switch to the new character context
  
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
