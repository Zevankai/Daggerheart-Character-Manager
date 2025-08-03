// Authentication UI and Management
class ZeviAuth {
  constructor() {
    this.currentUser = null;
    this.api = window.zeviAPI;
    this.init();
  }

  init() {
    this.createAuthUI();
    this.bindEvents();
    this.setupCharactersTab();
    this.setupSettingsTab();
    this.checkAuthStatus();
  }

  createAuthUI() {
    // Create auth modal HTML
    const authModalHTML = `
      <div id="zevi-auth-modal" class="auth-modal" style="display: none;">
        <div class="auth-modal-content glass" data-color-target="auth-modal">
          <div class="auth-header">
            <h2 id="auth-title">Welcome to Zevi Character Sheets</h2>
            <button class="auth-close" id="auth-close-btn">&times;</button>
          </div>
          
          <div class="auth-tabs">
            <button class="auth-tab active" data-tab="login">Login</button>
            <button class="auth-tab" data-tab="register">Register</button>
          </div>

          <div id="auth-login" class="auth-form active">
            <form id="login-form">
              <div class="auth-field">
                <label for="login-email">Email:</label>
                <input type="email" id="login-email" required>
              </div>
              <div class="auth-field">
                <label for="login-password">Password:</label>
                <input type="password" id="login-password" required>
              </div>
              <button type="submit" class="auth-btn">Login</button>
              <div class="auth-links">
                <a href="#" id="forgot-password-link">Forgot Password?</a>
              </div>
            </form>
          </div>

          <div id="auth-forgot" class="auth-form">
            <form id="forgot-form">
              <div class="auth-field">
                <label for="forgot-email">Email:</label>
                <input type="email" id="forgot-email" required>
              </div>
              <button type="submit" class="auth-btn">Send Reset Link</button>
              <div class="auth-links">
                <a href="#" id="back-to-login-link">Back to Login</a>
              </div>
            </form>
          </div>

          <div id="auth-reset" class="auth-form">
            <form id="reset-form">
              <div class="auth-field">
                <label for="reset-password">New Password:</label>
                <input type="password" id="reset-password" required minlength="6">
              </div>
              <div class="auth-field">
                <label for="reset-confirm">Confirm Password:</label>
                <input type="password" id="reset-confirm" required minlength="6">
              </div>
              <button type="submit" class="auth-btn">Reset Password</button>
            </form>
          </div>

          <div id="auth-register" class="auth-form">
            <form id="register-form">
              <div class="auth-field">
                <label for="register-username">Username:</label>
                <input type="text" id="register-username" required minlength="3">
              </div>
              <div class="auth-field">
                <label for="register-email">Email:</label>
                <input type="email" id="register-email" required>
              </div>
              <div class="auth-field">
                <label for="register-password">Password:</label>
                <input type="password" id="register-password" required minlength="6">
              </div>
              <div class="auth-field">
                <label for="register-confirm">Confirm Password:</label>
                <input type="password" id="register-confirm" required minlength="6">
              </div>
              <button type="submit" class="auth-btn">Register</button>
            </form>
          </div>

          <div id="auth-error" class="auth-error" style="display: none;"></div>
          <div id="auth-success" class="auth-success" style="display: none;"></div>
        </div>
      </div>


    `;

    // Add to body
    document.body.insertAdjacentHTML('beforeend', authModalHTML);

    // Add styles
    const authStyles = `
      <style>
        .auth-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 10000;
        }

        .auth-modal-content {
          max-width: 400px;
          width: 90%;
          padding: 2rem;
          border-radius: 10px;
          position: relative;
        }

        .auth-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .auth-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: var(--text-color);
        }

        .auth-tabs {
          display: flex;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }

        .auth-tab {
          flex: 1;
          padding: 0.5rem;
          background: none;
          border: none;
          color: var(--text-color);
          cursor: pointer;
          opacity: 0.6;
          transition: opacity 0.3s;
        }

        .auth-tab.active {
          opacity: 1;
          border-bottom: 2px solid var(--accent-color);
        }

        .auth-form {
          display: none;
        }

        .auth-form.active {
          display: block;
        }

        .auth-field {
          margin-bottom: 1rem;
        }

        .auth-field label {
          display: block;
          margin-bottom: 0.5rem;
          color: var(--text-color);
        }

        .auth-field input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 5px;
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-color);
          box-sizing: border-box;
        }

        .auth-btn {
          width: 100%;
          padding: 0.75rem;
          background: var(--accent-color);
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 1rem;
          margin-top: 1rem;
        }

        .auth-btn:hover {
          opacity: 0.8;
        }

        .auth-error, .auth-success {
          padding: 0.75rem;
          border-radius: 5px;
          margin-top: 1rem;
          text-align: center;
        }

        .auth-error {
          background: rgba(220, 53, 69, 0.2);
          color: #dc3545;
          border: 1px solid #dc3545;
        }

        .auth-success {
          background: rgba(40, 167, 69, 0.2);
          color: #28a745;
          border: 1px solid #28a745;
        }



        .auth-links {
          text-align: center;
          margin-top: 1rem;
        }

        .auth-links a {
          color: var(--accent-color);
          text-decoration: none;
          font-size: 0.9rem;
        }

        .auth-links a:hover {
          text-decoration: underline;
        }
      </style>
    `;

    document.head.insertAdjacentHTML('beforeend', authStyles);
  }



  bindEvents() {
    // Modal controls
    document.getElementById('auth-close-btn').addEventListener('click', () => this.hideAuthModal());
    
    // Tab switching
    document.querySelectorAll('.auth-tab').forEach(tab => {
      tab.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
    });

    // Form submissions
    document.getElementById('login-form').addEventListener('submit', (e) => this.handleLogin(e));
    document.getElementById('register-form').addEventListener('submit', (e) => this.handleRegister(e));
    document.getElementById('forgot-form').addEventListener('submit', (e) => this.handleForgotPassword(e));
    document.getElementById('reset-form').addEventListener('submit', (e) => this.handleResetPassword(e));

    // Auth links
    document.getElementById('forgot-password-link').addEventListener('click', (e) => {
      e.preventDefault();
      this.switchTab('forgot');
    });
    document.getElementById('back-to-login-link').addEventListener('click', (e) => {
      e.preventDefault();
      this.switchTab('login');
    });

    // User menu events are handled via inline onclick handlers

    // Show auth on character save attempt if not logged in
    document.addEventListener('click', (e) => {
      if (e.target.textContent?.includes('💾') || e.target.closest('[onclick*="save"]')) {
        if (!this.api.isLoggedIn()) {
          this.showAuthModal();
        }
      }
      
      // Initialize characters tab when clicked
      if (e.target.dataset?.target === 'characters-tab-content') {
        if (this.api.isLoggedIn()) {
          setTimeout(async () => {
            await this.initializeCharactersTab();
            // Always update current character display when opening characters tab
            await this.updateCurrentCharacterDisplay();
          }, 100);
        }
      }
    });
  }

  switchTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    const tabButton = document.querySelector(`[data-tab="${tab}"]`);
    if (tabButton) {
      tabButton.classList.add('active');
    }

    // Update forms
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    const targetForm = document.getElementById(`auth-${tab}`);
    if (targetForm) {
      targetForm.classList.add('active');
    }

    this.clearMessages();
  }

  showAuthModal() {
    document.getElementById('zevi-auth-modal').style.display = 'flex';
  }

  hideAuthModal() {
    document.getElementById('zevi-auth-modal').style.display = 'none';
    this.clearMessages();
  }

  showMessage(message, type = 'error') {
    this.clearMessages();
    const element = document.getElementById(`auth-${type}`);
    element.textContent = message;
    element.style.display = 'block';
  }

  clearMessages() {
    document.getElementById('auth-error').style.display = 'none';
    document.getElementById('auth-success').style.display = 'none';
  }

  async handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
      const response = await this.api.login(email, password);
      this.currentUser = response.user;
      localStorage.setItem('zevi-current-user', JSON.stringify(response.user));
      
      this.showMessage('Login successful!', 'success');
      setTimeout(() => {
        this.hideAuthModal();
        this.updateUIForLoggedInUser();
        // Show character sheet after login
        if (document.querySelector('.glass')) {
          document.querySelector('.glass').style.display = 'block';
        }
        // Initialize the character sheet if not already done
        if (typeof initializeIndexPage === 'function') {
          console.log('🔄 Initializing index page after login...');
          initializeIndexPage();
        }
      }, 1000);
      
    } catch (error) {
      this.showMessage(error.message);
    }
  }

  async handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirm = document.getElementById('register-confirm').value;

    if (password !== confirm) {
      this.showMessage('Passwords do not match');
      return;
    }

    try {
      await this.api.register(email, password, username);
      this.showMessage('Registration successful! Please log in.', 'success');
      setTimeout(() => {
        this.switchTab('login');
      }, 1500);
      
    } catch (error) {
      this.showMessage(error.message);
    }
  }

  logout() {
    this.api.logout();
    this.currentUser = null;
    localStorage.removeItem('zevi-current-user');
    this.updateUIForLoggedOutUser();
    // Hide character sheet and show login modal
    if (document.querySelector('.glass')) {
      document.querySelector('.glass').style.display = 'none';
    }
    this.showAuthModal();
  }

  checkAuthStatus() {
    // Always clear local character data on startup
    this.clearAllLocalCharacterData();
    
    if (this.api.isLoggedIn()) {
      const userData = localStorage.getItem('zevi-current-user');
      if (userData) {
        this.currentUser = JSON.parse(userData);
        this.updateUIForLoggedInUser();
      }
    } else {
      this.updateUIForLoggedOutUser();
    }
    
    // Check for password reset token in URL
    this.checkForPasswordReset();
  }

  checkForPasswordReset() {
    const urlParams = new URLSearchParams(window.location.search);
    const resetToken = urlParams.get('reset');
    
    if (resetToken) {
      // Store token and show reset form
      this.resetToken = resetToken;
      this.showAuthModal();
      this.switchTab('reset');
      
      // Remove token from URL for security
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }

  updateUIForLoggedInUser() {
    document.getElementById('user-menu').style.display = 'block';
    document.getElementById('username-display').textContent = this.currentUser?.username || 'User';
    
    // Update save buttons to indicate cloud saving
    document.querySelectorAll('button').forEach(btn => {
      if (btn.textContent.includes('💾')) {
        btn.textContent = btn.textContent.replace('💾', '☁️💾');
        btn.title = 'Save to Cloud';
      }
    });
  }

  updateUIForLoggedOutUser() {
    // Update save buttons to indicate local saving
    document.querySelectorAll('button').forEach(btn => {
      if (btn.textContent.includes('☁️💾')) {
        btn.textContent = btn.textContent.replace('☁️💾', '💾');
        btn.title = 'Save Locally (Login for Cloud Save)';
      }
    });
  }





  async handleForgotPassword(e) {
    e.preventDefault();
    
    const email = document.getElementById('forgot-email').value;

    try {
      const response = await this.api.forgotPassword(email);
      this.showMessage(response.message, 'success');
      
      // In development, show the reset token
      if (response.resetToken) {
        setTimeout(() => {
          this.showMessage(`Reset link: ${response.resetUrl}`, 'success');
        }, 2000);
      }
      
    } catch (error) {
      this.showMessage(error.message);
    }
  }

  async handleResetPassword(e) {
    e.preventDefault();
    
    const password = document.getElementById('reset-password').value;
    const confirm = document.getElementById('reset-confirm').value;

    if (password !== confirm) {
      this.showMessage('Passwords do not match');
      return;
    }

    if (!this.resetToken) {
      this.showMessage('Invalid reset token');
      return;
    }

    try {
      const response = await this.api.resetPassword(this.resetToken, password);
      this.showMessage(response.message, 'success');
      
      // Clear the token and switch to login
      this.resetToken = null;
      setTimeout(() => {
        this.switchTab('login');
      }, 2000);
      
    } catch (error) {
      this.showMessage(error.message);
    }
  }

  async showCharacterList() {
    try {
      const response = await this.api.getCharacters();
      const characters = response.characters;
      
      let listHTML = '<h3>Your Characters:</h3>';
      if (characters.length === 0) {
        listHTML += '<p>No characters found. Create your first character!</p>';
      } else {
        characters.forEach(char => {
          listHTML += `
            <div style="margin: 0.5rem 0; padding: 0.5rem; border: 1px solid rgba(255,255,255,0.3); border-radius: 5px;">
              <strong>${char.name}</strong><br>
              <small>Created: ${new Date(char.created_at).toLocaleDateString()}</small><br>
              <small>Updated: ${new Date(char.updated_at).toLocaleDateString()}</small>
              ${char.is_shared ? '<span style="color: #28a745;">🔗 Shared</span>' : ''}
            </div>
          `;
        });
      }
      
      alert(listHTML); // Simple for now - could be made into a modal
    } catch (error) {
      alert(`Failed to load characters: ${error.message}`);
    }
  }

  setupCharactersTab() {
    // Characters tab functionality will be set up when needed
    this.charactersTabInitialized = false;
  }

  setupSettingsTab() {
    // Add logout button event listener
    document.addEventListener('click', (e) => {
      if (e.target.id === 'logoutBtn') {
        this.logout();
      }
    });
    
    // Set a flag to track manual vs automatic character creation
    this.preventAutoCharacterCreation = true;
  }

  clearAllLocalCharacterData() {
    console.log('🧹 Starting aggressive local data cleanup...');
    
    const keysToRemove = [];
    const protectedKeys = [
      'zevi-auth-token',
      'zevi-current-user', 
      'zevi-theme',
      'zevi-custom-accent-base',
      'zevi-custom-accent-light', 
      'zevi-custom-accent-dark',
      'zevi-glass-color',
      'zevi-glass-opacity',
      'zevi-background-image'
    ];
    
    // Get all localStorage keys
    const allKeys = Object.keys(localStorage);
    console.log('📋 All localStorage keys:', allKeys);
    
    // Find all character-related localStorage keys
    allKeys.forEach(key => {
      if (key.startsWith('zevi-')) {
        // Keep only protected keys
        if (!protectedKeys.includes(key) && !key.startsWith('zevi-color-')) {
          keysToRemove.push(key);
        }
      }
      
      // Also remove any keys that contain character identifiers
      if (key.includes('char_') || key.includes('character-') || key.includes('backup-')) {
        keysToRemove.push(key);
      }
    });
    
    // Remove the keys
    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.warn('Failed to remove key:', key, e);
      }
    });
    
    console.log('🗑️ Cleared local character data keys:', keysToRemove);
    
    // Also clear any migration flags or temporary data
    sessionStorage.clear();
    
    console.log('✅ Aggressive cleanup complete');
  }

  switchToCharactersTab() {
    // Switch to characters tab
    const charactersTab = document.querySelector('[data-target="characters-tab-content"]');
    if (charactersTab) {
      charactersTab.click();
      this.initializeCharactersTab();
    }
  }

  async initializeCharactersTab() {
    if (this.charactersTabInitialized) return;
    
    this.charactersTabInitialized = true;
    
    // Set up event listeners
    document.getElementById('createNewCharacterBtn')?.addEventListener('click', () => {
      this.createNewCharacter();
    });
    

    
    // Update current character display
    await this.updateCurrentCharacterDisplay();
    
    // Load characters
    await this.loadCharactersList();
  }

  async createNewCharacter(isManual = true) {
    try {
      if (isManual) {
        console.log('🚀 Manually creating new character...');
      } else {
        console.log('🤖 Automatically creating new character...');
        if (this.preventAutoCharacterCreation) {
          console.log('🚫 Auto-character creation prevented');
          return;
        }
      }
      
      // Create new character via API
      const characterData = this.getDefaultCharacterData();
      
      const response = await this.api.createCharacter('New Character', characterData);
      console.log('✅ New character created:', response);
      
      // Reload the characters list
      await this.loadCharactersList();
      
      // Set as current character and switch to it if manual creation
      if (isManual) {
        // Make sure we set this as the current character
        localStorage.setItem('zevi-current-character-id', response.character.id.toString());
        if (window.app?.characterData?.setCurrentCharacterId) {
          window.app.characterData.setCurrentCharacterId(response.character.id.toString());
        }
        
        await this.loadCharacter(response.character.id);
      }
      
    } catch (error) {
      console.error('❌ Create character error:', error);
      if (isManual) {
        alert(`Failed to create character: ${error.message}`);
      }
    }
  }

  getDefaultCharacterData() {
    return {
      name: 'New Character',
      level: 1,
      ancestry: '',
      class: '',
      subclass: '',
      domains: ['', ''],
      attributes: {
        agility: 0,
        strength: 0,
        finesse: 0,
        instinct: 0,
        presence: 0,
        knowledge: 0
      },
      hope: 5,
      armor: 10,
      hitPoints: { current: 15, max: 15 },
      stress: { current: 0, max: 10 },
      evasion: 10,
      createdAt: new Date().toISOString()
    };
  }

  async loadCharactersList() {
    const loadingElement = document.getElementById('characters-loading');
    const emptyElement = document.getElementById('characters-empty');
    const gridElement = document.getElementById('character-grid');
    const importBtn = document.getElementById('importLocalDataBtn');
    
    // Show loading
    loadingElement.style.display = 'flex';
    emptyElement.style.display = 'none';
    gridElement.style.display = 'none';
    
    try {
      const response = await this.api.getCharacters();
      const characters = response.characters || [];
      

      
      loadingElement.style.display = 'none';
      
      if (characters.length === 0) {
        emptyElement.style.display = 'flex';
      } else {
        gridElement.style.display = 'grid';
        this.renderCharacterGrid(characters);
        
        // Also update current character display when we load the list
        await this.updateCurrentCharacterDisplay();
      }
      
    } catch (error) {
      loadingElement.style.display = 'none';
      emptyElement.style.display = 'flex';
      console.error('Failed to load characters:', error);
    }
  }



  renderCharacterGrid(characters) {
    const grid = document.getElementById('character-grid');
    // Try both methods to get current character ID
    let currentCharacterId = window.app?.characterData?.getCurrentCharacterId();
    if (!currentCharacterId) {
      currentCharacterId = localStorage.getItem('zevi-current-character-id');
    }
    
    grid.innerHTML = characters.map(char => {
      const isCurrentChar = char.id.toString() === currentCharacterId;
      const charData = char.character_data || {};
      const avatar = charData.name ? charData.name.charAt(0).toUpperCase() : '?';
      const subtitle = [charData.ancestry, charData.class, charData.subclass].filter(Boolean).join(' ');
      
      return `
        <div class="character-card ${isCurrentChar ? 'current' : ''}" data-character-id="${char.id}">
          <div class="character-header">
            <div class="character-avatar">${avatar}</div>
            <div class="character-info">
              <h3>${charData.name || 'Unnamed Character'}</h3>
              <p>${subtitle || 'No class info'}</p>
            </div>
          </div>
          
          <div class="character-meta">
            <span>Level ${charData.level || 1}</span>
            <span>${new Date(char.created_at).toLocaleDateString()}</span>
          </div>
          
          <div class="character-actions">
            <button class="character-action-btn load" onclick="window.zeviAuth.loadCharacter(${char.id})">
              📂 Load
            </button>
            <button class="character-action-btn" onclick="window.zeviAuth.duplicateCharacter(${char.id})">
              📋 Copy
            </button>
            <button class="character-action-btn" onclick="window.zeviAuth.shareCharacter(${char.id})">
              🔗 Share
            </button>
            <button class="character-action-btn delete" onclick="window.zeviAuth.deleteCharacter(${char.id})">
              🗑️ Delete
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  async loadCharacter(characterId) {
    try {
      // Fetch character data from API
      const response = await this.api.getCharacter(characterId);
      const character = response.character;
      
      // Load character data into the application
      if (window.app && window.app.characterData) {
        // Make sure we set this as the current character first
        localStorage.setItem('zevi-current-character-id', characterId.toString());
        if (window.app.characterData.setCurrentCharacterId) {
          window.app.characterData.setCurrentCharacterId(characterId.toString());
        }
        
        // Use the app controller's switch to character method
        await window.app.switchToCharacter(characterId.toString());
        
        // Switch back to main character sheet view (away from characters tab)
        const downtimeTab = document.querySelector('[data-target="downtime-tab-content"]');
        if (downtimeTab) {
          downtimeTab.click();
        }
        
        // Update the current character display
        await this.updateCurrentCharacterDisplay();
      }
      
    } catch (error) {
      alert(`Failed to load character: ${error.message}`);
    }
  }

  async duplicateCharacter(characterId) {
    try {
      const response = await this.api.getCharacter(characterId);
      const originalChar = response.character;
      
      const duplicatedChar = {
        name: `${originalChar.character_data.name || 'Character'} (Copy)`,
        character_data: { ...originalChar.character_data, createdAt: new Date().toISOString() }
      };
      
      await this.api.createCharacter(duplicatedChar);
      await this.loadCharactersList();
      
    } catch (error) {
      alert(`Failed to duplicate character: ${error.message}`);
    }
  }

  async shareCharacter(characterId) {
    try {
      const response = await this.api.shareCharacter(characterId);
      const shareUrl = `${window.location.origin}?share=${response.shareToken}`;
      
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert(`Share link copied to clipboard!\n\n${shareUrl}`);
      }).catch(() => {
        alert(`Share link:\n\n${shareUrl}`);
      });
      
    } catch (error) {
      alert(`Failed to create share link: ${error.message}`);
    }
  }

  async deleteCharacter(characterId) {
    if (!confirm('Are you sure you want to delete this character? This action cannot be undone.')) {
      return;
    }
    
    try {
      await this.api.deleteCharacter(characterId);
      await this.loadCharactersList();
      
    } catch (error) {
      alert(`Failed to delete character: ${error.message}`);
    }
  }

  async updateCurrentCharacterDisplay() {
    const currentCharacterSection = document.getElementById('current-character-section');
    const debugInfo = document.getElementById('debug-info');
    
    if (!currentCharacterSection) {
      return;
    }
    
    // Show status
    if (debugInfo) debugInfo.textContent = 'Status: Getting current character ID...';
    
    // Try multiple ways to get current character ID
    let currentCharacterId = null;
    
    // Method 1: From app.characterData
    if (window.app?.characterData?.getCurrentCharacterId) {
      currentCharacterId = window.app.characterData.getCurrentCharacterId();
    }
    
    // Method 2: From localStorage directly
    if (!currentCharacterId) {
      currentCharacterId = localStorage.getItem('zevi-current-character-id');
    }
    
    if (debugInfo) debugInfo.textContent = `Status: Current ID = ${currentCharacterId || 'none'}`;
    
    if (!currentCharacterId) {
      // Show "no character" state
      document.getElementById('current-character-name').textContent = 'No Character Loaded';
      document.getElementById('current-character-details').textContent = 'Create a character to get started';
      document.getElementById('current-character-avatar').textContent = '?';
      document.getElementById('current-character-level').textContent = 'Level -';
      document.getElementById('current-character-last-saved').textContent = 'Not saved';
      if (debugInfo) debugInfo.textContent = 'Status: No current character set';
      return;
    }
    
    try {
      if (debugInfo) debugInfo.textContent = `Status: Fetching character ${currentCharacterId}...`;
      
      // Try to get current character from server
      const response = await this.api.getCharacter(currentCharacterId);
      const character = response.character;
      const characterData = character.character_data || {};
      
      if (debugInfo) debugInfo.textContent = `Status: Loaded ${characterData.name || 'Unnamed'}`;
      
      // Update display
      const avatar = characterData.name ? characterData.name.charAt(0).toUpperCase() : '?';
      document.getElementById('current-character-avatar').textContent = avatar;
      document.getElementById('current-character-name').textContent = characterData.name || 'Unnamed Character';
      
      const subtitle = [characterData.ancestry, characterData.class, characterData.subclass].filter(Boolean).join(' ');
      document.getElementById('current-character-details').textContent = subtitle || 'No class info';
      document.getElementById('current-character-level').textContent = `Level ${characterData.level || 1}`;
      
      const lastSaved = character.updated_at ? 
        new Date(character.updated_at).toLocaleDateString() : 'Never';
      document.getElementById('current-character-last-saved').textContent = `Last saved: ${lastSaved}`;
      
    } catch (error) {
      if (debugInfo) debugInfo.textContent = `Status: Error loading character - ${error.message}`;
      
      // Show error state but keep the character ID info
      document.getElementById('current-character-name').textContent = 'Character Load Error';
      document.getElementById('current-character-details').textContent = 'Could not load character data';
      document.getElementById('current-character-avatar').textContent = '⚠️';
    }
  }

  updateUIForLoggedInUser() {
    // Update account info in settings
    const accountInfo = document.getElementById('account-info');
    if (accountInfo) {
      accountInfo.innerHTML = `
        <p><strong>Username:</strong> <span>${this.currentUser?.username || 'Unknown'}</span></p>
        <p><strong>Email:</strong> <span>${this.currentUser?.email || 'Unknown'}</span></p>
        <p><strong>Member since:</strong> <span>${this.currentUser?.created_at ? new Date(this.currentUser.created_at).toLocaleDateString() : 'Unknown'}</span></p>
      `;
    }
    
    // Update save buttons to indicate cloud saving
    document.querySelectorAll('button').forEach(btn => {
      if (btn.textContent.includes('💾')) {
        btn.textContent = btn.textContent.replace('💾', '☁️💾');
        btn.title = 'Save to Cloud';
      }
    });
  }
}

// Initialize auth system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.zeviAuth = new ZeviAuth();
});