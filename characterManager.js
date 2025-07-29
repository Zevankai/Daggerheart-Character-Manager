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

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.characterManager) {
            window.characterManager.loadCharacters();
        }
    }, 1500); // Load after core system
});
