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

      <!-- User menu for logged-in users -->
      <div id="user-menu" class="user-menu" style="display: none;">
        <div class="user-info">
          <span id="username-display"></span>
          <button id="logout-btn" class="logout-btn">Logout</button>
        </div>
        <div class="character-management">
          <button id="character-list-btn" class="char-mgmt-btn">My Characters</button>
          <button id="migration-btn" class="char-mgmt-btn">Import Local Data</button>
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

        .user-menu {
          position: fixed;
          top: 20px;
          right: 20px;
          background: rgba(0, 0, 0, 0.8);
          padding: 1rem;
          border-radius: 10px;
          z-index: 1000;
          color: white;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .logout-btn, .char-mgmt-btn {
          background: var(--accent-color);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 5px;
          cursor: pointer;
          margin: 0.25rem;
        }

        .char-mgmt-btn {
          display: block;
          width: 100%;
          margin-bottom: 0.5rem;
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

    // User menu
    document.getElementById('logout-btn').addEventListener('click', () => this.logout());
    document.getElementById('character-list-btn').addEventListener('click', () => this.showCharacterList());
    document.getElementById('migration-btn').addEventListener('click', () => this.migrateLocalData());

    // Show auth on character save attempt if not logged in
    document.addEventListener('click', (e) => {
      if (e.target.textContent?.includes('💾') || e.target.closest('[onclick*="save"]')) {
        if (!this.api.isLoggedIn()) {
          this.showAuthModal();
        }
      }
    });
  }

  switchTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

    // Update forms
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    document.getElementById(`auth-${tab}`).classList.add('active');

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
        this.checkForMigration();
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
  }

  checkAuthStatus() {
    if (this.api.isLoggedIn()) {
      const userData = localStorage.getItem('zevi-current-user');
      if (userData) {
        this.currentUser = JSON.parse(userData);
        this.updateUIForLoggedInUser();
        this.checkForMigration();
      }
    } else {
      this.updateUIForLoggedOutUser();
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
    document.getElementById('user-menu').style.display = 'none';
    
    // Update save buttons to indicate local saving
    document.querySelectorAll('button').forEach(btn => {
      if (btn.textContent.includes('☁️💾')) {
        btn.textContent = btn.textContent.replace('☁️💾', '💾');
        btn.title = 'Save Locally (Login for Cloud Save)';
      }
    });
  }

  async checkForMigration() {
    // Check if there's local data that could be migrated
    const localKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('zevi-') && 
      !key.includes('auth-token') && 
      !key.includes('current-user') &&
      !key.includes('character-backup')
    );

    if (localKeys.length > 0) {
      const migrate = confirm('We found local character data. Would you like to import it to your cloud account?');
      if (migrate) {
        this.migrateLocalData();
      }
    }
  }

  async migrateLocalData() {
    try {
      const result = await this.api.migrateLocalStorageData();
      alert(result.message);
      if (result.migrated > 0) {
        // Refresh the page to load the migrated character
        window.location.reload();
      }
    } catch (error) {
      alert(`Migration failed: ${error.message}`);
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
}

// Initialize auth system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.zeviAuth = new ZeviAuth();
});