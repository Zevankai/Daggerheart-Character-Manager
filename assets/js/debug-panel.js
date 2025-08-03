// Visual Debug Panel for Mobile Debugging
class DebugPanel {
  constructor() {
    this.createDebugPanel();
    this.isVisible = false;
  }

  createDebugPanel() {
    // Create debug panel container
    const debugPanel = document.createElement('div');
    debugPanel.id = 'debug-panel';
    debugPanel.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      width: 300px;
      max-height: 400px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 15px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 12px;
      z-index: 10000;
      overflow-y: auto;
      display: none;
      border: 2px solid #333;
    `;

    // Create toggle button
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'debug-toggle';
    toggleBtn.textContent = '🐛 Debug';
    toggleBtn.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: #007bff;
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 12px;
      z-index: 10001;
      cursor: pointer;
    `;

    // Create content area
    const content = document.createElement('div');
    content.id = 'debug-content';
    content.innerHTML = `
      <h4 style="margin: 0 0 10px 0; color: #ffd700;">🔧 Debug Panel</h4>
      <div id="debug-status" style="margin-bottom: 10px;">
        <strong>Status:</strong> <span id="status-text">Ready</span>
      </div>
      <div id="debug-logs" style="max-height: 200px; overflow-y: auto; background: rgba(255,255,255,0.1); padding: 8px; border-radius: 4px;">
        <div style="color: #ccc;">No logs yet...</div>
      </div>
      <div style="margin-top: 10px;">
        <button id="clear-logs" style="background: #dc3545; color: white; border: none; padding: 4px 8px; border-radius: 3px; font-size: 10px; margin-right: 5px;">Clear Logs</button>
        <button id="test-save" style="background: #28a745; color: white; border: none; padding: 4px 8px; border-radius: 3px; font-size: 10px;">Test Save</button>
      </div>
    `;

    debugPanel.appendChild(content);
    document.body.appendChild(debugPanel);
    document.body.appendChild(toggleBtn);

    // Bind events
    toggleBtn.addEventListener('click', () => this.toggle());
    document.getElementById('clear-logs').addEventListener('click', () => this.clearLogs());
    document.getElementById('test-save').addEventListener('click', () => this.testSave());
  }

  toggle() {
    const panel = document.getElementById('debug-panel');
    const btn = document.getElementById('debug-toggle');
    
    if (this.isVisible) {
      panel.style.display = 'none';
      btn.textContent = '🐛 Debug';
    } else {
      panel.style.display = 'block';
      btn.textContent = '❌ Close';
    }
    
    this.isVisible = !this.isVisible;
  }

  log(message, type = 'info') {
    const logsContainer = document.getElementById('debug-logs');
    const timestamp = new Date().toLocaleTimeString();
    
    let color = '#fff';
    let icon = 'ℹ️';
    
    switch (type) {
      case 'success':
        color = '#28a745';
        icon = '✅';
        break;
      case 'error':
        color = '#dc3545';
        icon = '❌';
        break;
      case 'warning':
        color = '#ffc107';
        icon = '⚠️';
        break;
      case 'api':
        color = '#17a2b8';
        icon = '🌐';
        break;
    }
    
    const logEntry = document.createElement('div');
    logEntry.style.cssText = `margin-bottom: 5px; color: ${color}; font-size: 11px;`;
    logEntry.innerHTML = `<span style="color: #888;">[${timestamp}]</span> ${icon} ${message}`;
    
    logsContainer.appendChild(logEntry);
    logsContainer.scrollTop = logsContainer.scrollHeight;
  }

  updateStatus(status, color = '#fff') {
    const statusText = document.getElementById('status-text');
    statusText.textContent = status;
    statusText.style.color = color;
  }

  clearLogs() {
    const logsContainer = document.getElementById('debug-logs');
    logsContainer.innerHTML = '<div style="color: #ccc;">Logs cleared...</div>';
  }

  async testSave() {
    this.log('🧪 Starting save test...', 'info');
    
    // Check if user is logged in
    if (!window.zeviAPI || !window.zeviAPI.isLoggedIn()) {
      this.log('❌ User not logged in', 'error');
      this.updateStatus('Not logged in', '#dc3545');
      return;
    }
    
    this.log('✅ User is logged in', 'success');
    
    // Get current character ID
    const currentCharacterId = window.app?.characterData?.getCurrentCharacterId();
    if (!currentCharacterId) {
      this.log('❌ No current character ID found', 'error');
      this.updateStatus('No character ID', '#dc3545');
      return;
    }
    
    this.log(`📋 Current character ID: ${currentCharacterId}`, 'info');
    
    // Collect character data
    let characterData = null;
    if (window.app?.autoSave?.collectCurrentCharacterData) {
      characterData = window.app.autoSave.collectCurrentCharacterData();
      this.log('✅ Character data collected', 'success');
    } else {
      this.log('❌ Cannot collect character data', 'error');
      this.updateStatus('Data collection failed', '#dc3545');
      return;
    }
    
    // Try to save
    try {
      this.log('💾 Attempting to save...', 'api');
      this.updateStatus('Saving...', '#ffc107');
      
      const result = await window.app.characterData.saveCharacterData(currentCharacterId, characterData);
      
      if (result) {
        this.log('✅ Save successful!', 'success');
        this.updateStatus('Save successful!', '#28a745');
      } else {
        this.log('❌ Save returned false', 'error');
        this.updateStatus('Save failed', '#dc3545');
      }
    } catch (error) {
      this.log(`❌ Save error: ${error.message}`, 'error');
      this.updateStatus('Save error', '#dc3545');
    }
  }
}

// Create global debug panel instance
window.debugPanel = new DebugPanel();

// Override console methods to also log to debug panel
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

console.log = function(...args) {
  originalLog.apply(console, args);
  if (window.debugPanel) {
    window.debugPanel.log(args.join(' '), 'info');
  }
};

console.error = function(...args) {
  originalError.apply(console, args);
  if (window.debugPanel) {
    window.debugPanel.log(args.join(' '), 'error');
  }
};

console.warn = function(...args) {
  originalWarn.apply(console, args);
  if (window.debugPanel) {
    window.debugPanel.log(args.join(' '), 'warning');
  }
};