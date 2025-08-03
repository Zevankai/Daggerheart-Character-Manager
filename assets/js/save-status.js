// Save Status Indicator for Mobile Users
class SaveStatusIndicator {
  constructor() {
    this.createStatusIndicator();
    this.lastSaveTime = null;
  }

  createStatusIndicator() {
    // Create status indicator
    const statusIndicator = document.createElement('div');
    statusIndicator.id = 'save-status-indicator';
    statusIndicator.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px 20px;
      border-radius: 25px;
      font-size: 14px;
      font-weight: bold;
      z-index: 9999;
      display: none;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;

    statusIndicator.innerHTML = `
      <span id="save-status-icon">💾</span>
      <span id="save-status-text">Ready to save</span>
    `;

    document.body.appendChild(statusIndicator);
  }

  show(message, type = 'info', duration = 3000) {
    const indicator = document.getElementById('save-status-indicator');
    const icon = document.getElementById('save-status-icon');
    const text = document.getElementById('save-status-text');

    // Set icon and color based on type
    let iconText = '💾';
    let backgroundColor = 'rgba(0, 0, 0, 0.8)';
    let textColor = 'white';

    switch (type) {
      case 'success':
        iconText = '✅';
        backgroundColor = 'rgba(40, 167, 69, 0.9)';
        break;
      case 'error':
        iconText = '❌';
        backgroundColor = 'rgba(220, 53, 69, 0.9)';
        break;
      case 'saving':
        iconText = '⏳';
        backgroundColor = 'rgba(255, 193, 7, 0.9)';
        textColor = 'black';
        break;
      case 'warning':
        iconText = '⚠️';
        backgroundColor = 'rgba(255, 193, 7, 0.9)';
        textColor = 'black';
        break;
    }

    icon.textContent = iconText;
    text.textContent = message;
    indicator.style.backgroundColor = backgroundColor;
    indicator.style.color = textColor;
    indicator.style.display = 'block';

    // Auto-hide after duration (except for saving state)
    if (type !== 'saving') {
      setTimeout(() => {
        this.hide();
      }, duration);
    }

    // Update last save time for success
    if (type === 'success') {
      this.lastSaveTime = new Date();
    }
  }

  hide() {
    const indicator = document.getElementById('save-status-indicator');
    indicator.style.display = 'none';
  }

  showSaving() {
    this.show('Saving...', 'saving');
  }

  showSuccess() {
    this.show('Saved successfully!', 'success');
  }

  showError(message) {
    this.show(`Save failed: ${message}`, 'error');
  }

  showWarning(message) {
    this.show(message, 'warning');
  }

  getLastSaveTime() {
    return this.lastSaveTime;
  }

  formatLastSaveTime() {
    if (!this.lastSaveTime) {
      return 'Never';
    }
    return this.lastSaveTime.toLocaleTimeString();
  }
}

// Create global save status indicator
window.saveStatus = new SaveStatusIndicator();

// Override the save function to show status
const originalSaveCharacterData = window.app?.characterData?.saveCharacterData;
if (window.app?.characterData) {
  const originalSave = window.app.characterData.saveCharacterData;
  window.app.characterData.saveCharacterData = async function(characterId, data) {
    try {
      window.saveStatus.showSaving();
      const result = await originalSave.call(this, characterId, data);
      
      if (result) {
        window.saveStatus.showSuccess();
      } else {
        window.saveStatus.showError('Unknown error');
      }
      
      return result;
    } catch (error) {
      window.saveStatus.showError(error.message);
      throw error;
    }
  };
}

// Add save status to the page
document.addEventListener('DOMContentLoaded', () => {
  // Add a small save info display
  const saveInfo = document.createElement('div');
  saveInfo.id = 'save-info-display';
  saveInfo.style.cssText = `
    position: fixed;
    top: 10px;
    left: 10px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
    z-index: 9998;
    font-family: monospace;
  `;
  
  saveInfo.innerHTML = `
    <div>💾 Save Status</div>
    <div id="last-save-time">Last save: Never</div>
  `;
  
  document.body.appendChild(saveInfo);
  
  // Update last save time periodically
  setInterval(() => {
    const lastSaveElement = document.getElementById('last-save-time');
    if (lastSaveElement) {
      lastSaveElement.textContent = `Last save: ${window.saveStatus.formatLastSaveTime()}`;
    }
  }, 1000);
});