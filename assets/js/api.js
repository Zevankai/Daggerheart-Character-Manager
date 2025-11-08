// Simple API Client - No Authentication
// Handles basic character listing and management without login
class ZeviAPI {
  constructor() {
    this.baseURL = this.getBaseURL();
  }

  getBaseURL() {
    // In production, this will be your Vercel domain
    // In development, it might be localhost:3000 or your dev server

    // Check if we're running with vercel dev
    if (window.location.port === '3000') {
      return window.location.origin;
    }

    // Check if we're running with servor or other dev server
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      // If running servor, we need to use the vercel dev server
      // You might need to run 'npm run dev' in a separate terminal
      console.log('Development mode detected. Make sure to run "npm run dev" for API.');
      return 'http://localhost:3000';
    }

    return window.location.origin;
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}/api${endpoint}`;

    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    console.log(`API Request: ${options.method || 'GET'} ${url}`);

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error: ${response.status} ${response.statusText}`);
        console.error('Response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text();
      }
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // === CHARACTER METHODS ===

  async getCharacters() {
    return await this.makeRequest('/characters');
  }

  async getCharacter(id) {
    return await this.makeRequest(`/characters/${id}`);
  }

  async getActiveCharacter() {
    return await this.makeRequest('/characters?action=active');
  }

  async createCharacter(name, characterData = {}) {
    return await this.makeRequest('/characters', {
      method: 'POST',
      body: JSON.stringify({ name, characterData, setAsActive: true }),
    });
  }

  async saveCharacter(characterId, characterData) {
    return await this.makeRequest(`/characters/${characterId}`, {
      method: 'PUT',
      body: JSON.stringify({ characterData }),
    });
  }

  async deleteCharacter(id) {
    return await this.makeRequest(`/characters/${id}`, {
      method: 'DELETE',
    });
  }
}

// Create global instance
window.zeviAPI = new ZeviAPI();
