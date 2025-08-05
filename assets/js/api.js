// API Client for Zevi Character Sheet
class ZeviAPI {
  constructor() {
    this.baseURL = this.getBaseURL();
    this.token = localStorage.getItem('zevi-auth-token');
  }

  getBaseURL() {
    // In production, this will be your Vercel domain
    // In development, it might be localhost:3000 or your dev server
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:3000';
    }
    return window.location.origin;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('zevi-auth-token', token);
    } else {
      localStorage.removeItem('zevi-auth-token');
    }
  }

  getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}/api${endpoint}`;
    
    const config = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          this.setToken(null);
          throw new Error('Authentication required. Please log in again.');
        }
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async register(email, password, username) {
    return await this.makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, username }),
    });
  }

  async login(email, password) {
    const response = await this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async forgotPassword(email) {
    return await this.makeRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token, password) {
    return await this.makeRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  }

  logout() {
    this.setToken(null);
    // Clear any cached user data
    localStorage.removeItem('zevi-current-user');
    localStorage.removeItem('zevi-current-character-id');
  }

  isLoggedIn() {
    return !!this.token;
  }

  // Character methods
  async getCharacters() {
    return await this.makeRequest('/characters');
  }

  async getCharacter(id) {
    return await this.makeRequest(`/characters/${id}`);
  }

  async createCharacter(name, characterData = {}, setAsActive = true) {
    console.log('📝 API createCharacter called with:', { name, characterData, setAsActive });
    
    return await this.makeRequest('/characters', {
      method: 'POST',
      body: JSON.stringify({ name, characterData, setAsActive }),
    });
  }

  async updateCharacter(id, updates) {
    return await this.makeRequest(`/characters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteCharacter(id) {
    return await this.makeRequest(`/characters/${id}`, {
      method: 'DELETE',
    });
  }

  async shareCharacter(id, isShared) {
    return await this.makeRequest(`/characters/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ isShared }),
    });
  }

  async getSharedCharacter(token) {
    return await this.makeRequest(`/characters/shared/${token}`);
  }

  // Active character management
  async getActiveCharacter() {
    return await this.makeRequest('/characters?action=active');
  }

  async setActiveCharacter(characterId) {
    return await this.makeRequest('/characters', {
      method: 'POST',
      body: JSON.stringify({ characterId, setActive: true }),
    });
  }

  // Auto-save functionality
  async autoSaveCharacter(characterId, characterData) {
    try {
      console.log('🔄 Auto-saving character:', characterId);
      
      const response = await this.makeRequest('/characters', {
        method: 'POST',
        body: JSON.stringify({ characterId, characterData }),
      });
      
      console.log('✅ Auto-save successful:', response);
      return response;
    } catch (error) {
      console.warn('Auto-save failed:', error);
      // Fall back to localStorage for offline functionality
      const backupKey = `zevi-character-backup-${characterId}`;
      localStorage.setItem(backupKey, JSON.stringify({
        characterData,
        timestamp: new Date().toISOString(),
        saved: false
      }));
      console.log('💾 Saved to localStorage backup');
      throw error;
    }
  }

  // Manual save (uses update endpoint)
  async saveCharacter(characterId, characterData, characterName = null) {
    try {
      console.log('💾 Manually saving character:', characterId);
      
      const updates = { characterData };
      if (characterName) {
        updates.name = characterName;
      }
      
      const response = await this.updateCharacter(characterId, updates);
      console.log('✅ Manual save successful:', response);
      
      // Clear any backup since we saved successfully
      localStorage.removeItem(`zevi-character-backup-${characterId}`);
      
      return response;
    } catch (error) {
      console.error('Manual save failed:', error);
      throw error;
    }
  }

  // Backup management
  async syncBackups() {
    if (!this.isLoggedIn()) return;
    
    const backupKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('zevi-character-backup-')
    );
    
    for (const key of backupKeys) {
      try {
        const backup = JSON.parse(localStorage.getItem(key));
        const characterId = key.replace('zevi-character-backup-', '');
        
        if (!backup.saved) {
          await this.autoSaveCharacter(characterId, backup.characterData);
          localStorage.removeItem(key);
          console.log('✅ Synced backup for character:', characterId);
        }
      } catch (error) {
        console.warn('Failed to sync backup:', key, error);
      }
    }
  }

  // Migration helper - convert localStorage data to API
  async migrateLocalStorageData() {
    if (!this.isLoggedIn()) {
      throw new Error('Must be logged in to migrate data');
    }

    try {
      // Check if there's any localStorage character data
      const localStorageKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('zevi-') && 
        !key.includes('auth-token') && 
        !key.includes('current-user') &&
        !key.includes('backup-') &&
        !key.includes('theme') &&
        !key.includes('color') &&
        !key.includes('glass') &&
        !key.includes('background')
      );

      if (localStorageKeys.length === 0) {
        return { migrated: 0, message: 'No local data found to migrate' };
      }

      // Collect all localStorage data
      const characterData = {};
      localStorageKeys.forEach(key => {
        try {
          const value = localStorage.getItem(key);
          if (value) {
            characterData[key] = value;
          }
        } catch (e) {
          console.warn(`Failed to read localStorage key: ${key}`, e);
        }
      });

      // Create a new character with the migrated data
      const characterName = characterData['zevi-character-name'] || 
                           JSON.parse(characterData['zevi-character-details'] || '{}').personal?.name ||
                           'Imported Character';

      const newCharacter = await this.createCharacter(characterName, characterData, true);

      // Clear localStorage after successful migration
      localStorageKeys.forEach(key => localStorage.removeItem(key));

      return { 
        migrated: 1, 
        character: newCharacter.character,
        message: 'Local data successfully migrated to cloud storage' 
      };
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }

  // Testing methods for verifying database saves
  async testDatabaseConnection() {
    try {
      const response = await this.makeRequest('/characters?action=test-connection');
      return response;
    } catch (error) {
      console.error('Database test failed:', error);
      throw error;
    }
  }

  async testCharacterSave(testData = {}) {
    try {
      const response = await this.makeRequest('/characters?action=test-save', {
        method: 'POST',
        body: JSON.stringify({ testData })
      });
      return response;
    } catch (error) {
      console.error('Character save test failed:', error);
      throw error;
    }
  }

  async testUserCharacters() {
    try {
      const response = await this.makeRequest('/characters?action=test-characters');
      return response;
    } catch (error) {
      console.error('User characters test failed:', error);
      throw error;
    }
  }

  async testDatabaseSchema() {
    try {
      const response = await this.makeRequest('/characters?action=test-schema');
      return response;
    } catch (error) {
      console.error('Database schema test failed:', error);
      throw error;
    }
  }

  // Database migration
  async runDatabaseMigration() {
    try {
      const response = await this.makeRequest('/migrate-db', {
        method: 'POST'
      });
      return response;
    } catch (error) {
      console.error('Database migration failed:', error);
      throw error;
    }
  }

  async getCharacterSaveHistory(characterId) {
    try {
      const response = await this.makeRequest(`/characters/${characterId}/saves`);
      return response;
    } catch (error) {
      console.error('Failed to get save history:', error);
      throw error;
    }
  }
}

// Create global API instance
window.zeviAPI = new ZeviAPI();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ZeviAPI;
}