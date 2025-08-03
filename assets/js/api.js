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

    console.log('🌐 API Request:', {
      url,
      method: config.method || 'GET',
      headers: config.headers,
      body: config.body ? JSON.parse(config.body) : undefined
    });

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      console.log('📡 API Response:', {
        status: response.status,
        ok: response.ok,
        data
      });

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

  async createCharacter(name, characterData = {}) {
    console.log('📝 API createCharacter called with:', { name, characterData });
    console.trace('📍 Character creation called from:');
    
    return await this.makeRequest('/characters', {
      method: 'POST',
      body: JSON.stringify({ name, characterData }),
    });
  }

  async updateCharacter(id, updates) {
    console.log('🔄 API updateCharacter called with:', { id, updates });
    try {
      const result = await this.makeRequest(`/characters/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      console.log('✅ API updateCharacter success:', result);
      return result;
    } catch (error) {
      console.error('❌ API updateCharacter failed:', error);
      throw error;
    }
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

  // Auto-save functionality
  async autoSaveCharacter(id, characterData) {
    try {
      return await this.updateCharacter(id, { characterData });
    } catch (error) {
      console.warn('Auto-save failed:', error);
      // Fall back to localStorage for offline functionality
      localStorage.setItem(`zevi-character-backup-${id}`, JSON.stringify(characterData));
      throw error;
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
        key.startsWith('zevi-') && !key.includes('auth-token') && !key.includes('current-user')
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

      const newCharacter = await this.createCharacter(characterName, characterData);

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
}

// Create global API instance
window.zeviAPI = new ZeviAPI();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ZeviAPI;
}