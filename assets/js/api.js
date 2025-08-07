// Simple API Client - NO SAVE FUNCTIONALITY
// Only handles authentication and basic character listing
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
      
      if (!response.ok) {
        const errorText = await response.text();
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

  // === AUTHENTICATION METHODS ===
  
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

  async register(email, password, username) {
    const response = await this.makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, username }),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async logout() {
    this.setToken(null);
    // Also remove current character
    localStorage.removeItem('zevi-current-character-id');
    localStorage.removeItem('zevi-current-user');
  }

  async getCurrentUser() {
    return await this.makeRequest('/auth/me');
  }

  isLoggedIn() {
    return !!this.token;
  }

  // === BASIC CHARACTER METHODS (READ ONLY) ===
  
  async getCharacters() {
    return await this.makeRequest('/characters');
  }

  async getCharacter(id) {
    return await this.makeRequest(`/characters/${id}`);
  }

  async getActiveCharacter() {
    return await this.makeRequest('/characters?action=active');
  }
}

// Create global instance
window.zeviAPI = new ZeviAPI();