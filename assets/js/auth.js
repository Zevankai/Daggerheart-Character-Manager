// Authentication UI and Management
class ZeviAuth {
  constructor() {
    this.currentUser = null;
    this.api = window.zeviAPI;
    this.init();
  }

  init() {
    this.createAuthUI();
    this.createUserMenu();
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

  createUserMenu() {
    // Create user menu HTML and inject it into the header
    const userMenuHTML = `
      <div id="user-menu" class="user-menu" style="display: none;">
        <span id="username-display">User</span>
        <div class="user-menu-dropdown">
          <button onclick="window.zeviAuth.showCharacterList()">My Characters</button>
          <button onclick="window.zeviAuth.logout()">Logout</button>
        </div>
      </div>
    `;
    
    // Add user menu styles if not already added
    if (!document.getElementById('user-menu-styles')) {
      const userMenuStyles = `
        <style id="user-menu-styles">
          .user-menu {
            position: relative;
            display: inline-block;
            cursor: pointer;
            color: var(--text-color);
            font-size: 14px;
            margin-top: 10px;
          }
          
          .user-menu:hover .user-menu-dropdown {
            display: block;
          }
          
          .user-menu-dropdown {
            display: none;
            position: absolute;
            right: 0;
            top: 100%;
            background: var(--glass-bg);
            border: 1px solid var(--glass-border);
            border-radius: 5px;
            padding: 10px;
            min-width: 150px;
            z-index: 1000;
          }
          
          .user-menu-dropdown button {
            display: block;
            width: 100%;
            padding: 8px 12px;
            margin: 2px 0;
            background: none;
            border: 1px solid var(--glass-border);
            color: var(--text-color);
            cursor: pointer;
            border-radius: 3px;
            font-size: 12px;
          }
          
          .user-menu-dropdown button:hover {
            background: var(--glass-border);
          }
        </style>
      `;
      document.head.insertAdjacentHTML('beforeend', userMenuStyles);
    }
    
    // Inject user menu into header container
    const userMenuContainer = document.getElementById('user-menu-container');
    if (userMenuContainer) {
      userMenuContainer.innerHTML = userMenuHTML;
    }
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
        // Show character sheet after login
        if (document.querySelector('.glass')) {
          document.querySelector('.glass').style.display = 'block';
        }
        // Initialize the character sheet if not already done
        if (typeof initializeIndexPage === 'function') {
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
}

// Initialize auth system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.zeviAuth = new ZeviAuth();
});