// ===== SETTINGS MODULE =====
// This module handles all settings-related functionality including:
// 1. Accent color customization
// 2. Glassmorphic background tint customization  
// 3. Character data deletion
// 4. Account deletion

console.log('🔍 GLASSMORPHIC DEBUG: settings.js file loaded and executing!');

// ===== ACCENT COLOR THEME MANAGEMENT =====
function initializeAccentColorPicker() {
  console.log('🎨 initializeAccentColorPicker() called');
  
  const accentColorPicker = document.getElementById('accentColorPicker');
  const accentColorPreview = document.getElementById('accentColorPreview');
  const resetAccentBtn = document.getElementById('resetAccentColor');
  
  console.log('🎨 Accent color elements found:', {
    accentColorPicker: !!accentColorPicker,
    accentColorPreview: !!accentColorPreview,
    resetAccentBtn: !!resetAccentBtn
  });
  
  if (!accentColorPicker || !accentColorPreview || !resetAccentBtn) {
    console.error('🚨 Accent color picker elements not found - accent controls will not work!');
    return;
  }
  
  // Load current accent color - prioritize saved custom color
  const savedAccentBase = localStorage.getItem('zevi-custom-accent-base');
  let hexColor;
  
  if (savedAccentBase) {
      hexColor = savedAccentBase;
  } else {
      // Get current computed accent color
      const root = document.documentElement;
      const currentAccentColor = getComputedStyle(root).getPropertyValue('--accent-color').trim();
      
      // Convert RGB to hex if needed
      if (currentAccentColor.startsWith('rgb')) {
          hexColor = rgbToHex(currentAccentColor);
      } else {
          hexColor = currentAccentColor;
      }
  }
  
  accentColorPicker.value = hexColor;
  accentColorPreview.style.backgroundColor = hexColor;
  
  // Handle color change
  accentColorPicker.addEventListener('input', (event) => {
      console.log('🎨 Accent color picker changed!', event.target.value);
      const newColor = event.target.value;
      changeAccentColor(newColor);
      accentColorPreview.style.backgroundColor = newColor;
  });
  
  // Handle reset to default
  resetAccentBtn.addEventListener('click', () => {
      console.log('🎨 Accent color reset clicked!');
      const defaultColor = '#ffd700'; // Default yellow
      changeAccentColor(defaultColor);
      accentColorPicker.value = defaultColor;
      accentColorPreview.style.backgroundColor = defaultColor;
  });
  
  console.log('🎨 Accent color event listeners attached successfully!');
}

function changeAccentColor(newColor) {
  const root = document.documentElement;
  const currentTheme = document.body.getAttribute('data-theme');
  
  // Calculate a darker version for light theme
  const darkerColor = adjustColorBrightness(newColor, -0.3);
  
  // Set the accent color based on current theme
  const finalColor = (currentTheme === 'light') ? darkerColor : newColor;
  root.style.setProperty('--accent-color', finalColor);
  
  // Update transparent versions of the accent color
  updateAccentColorTransparencies(finalColor);
  
  // Save colors for theme switching
  if (currentTheme === 'light') {
      localStorage.setItem('zevi-custom-accent-light', darkerColor);
  } else {
      localStorage.setItem('zevi-custom-accent-dark', newColor);
  }
  
  // Save the base color for future theme switches
  localStorage.setItem('zevi-custom-accent-base', newColor);
}

function updateAccentColorTransparencies(accentColor) {
  const root = document.documentElement;
  const rgb = hexToRgb(accentColor);
  
  // Update transparent versions
  root.style.setProperty('--accent-color-50', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`);
  root.style.setProperty('--accent-color-70', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)`);
  root.style.setProperty('--accent-color-80', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`);
}

// ===== GLASSMORPHIC BACKGROUND OPACITY MANAGEMENT =====
function initializeGlassOpacitySlider() {
  console.log('🌈 initializeGlassOpacitySlider() called');
  
  const glassOpacitySlider = document.getElementById('glassOpacitySlider');
  const glassOpacityValue = document.getElementById('glassOpacityValue');
  
  console.log('🌈 Glass elements found:', {
    glassOpacitySlider: !!glassOpacitySlider,
    glassOpacityValue: !!glassOpacityValue
  });
  
  // Check if elements exist
  if (!glassOpacitySlider || !glassOpacityValue) {
      console.error('🚨 Glass opacity slider elements not found - glassmorphic controls will not work!');
      return;
  }
  
  // Load saved opacity value
  let savedGlassOpacity;
  if (window.app?.characterData?.getCharacterSpecificValue) {
      savedGlassOpacity = window.app.characterData.getCharacterSpecificValue('zevi-glass-opacity');
  } else {
      savedGlassOpacity = localStorage.getItem('zevi-glass-opacity');
  }
  
  // Use saved opacity or default to 10%
  let currentOpacity = savedGlassOpacity ? parseFloat(savedGlassOpacity) : 10;
  
  // Set initial values (fixed white color)
  glassOpacitySlider.value = currentOpacity;
  glassOpacityValue.textContent = Math.round(currentOpacity) + '%';
  
  // Apply the current values
  changeGlassBackgroundOpacity(currentOpacity);
  
  // Handle opacity change
  glassOpacitySlider.addEventListener('input', (event) => {
      console.log('🌈 Glass opacity slider changed!', event.target.value);
      const opacity = parseFloat(event.target.value);
      glassOpacityValue.textContent = Math.round(opacity) + '%';
      changeGlassBackgroundOpacity(opacity);
  });
  
  console.log('🌈 Glass opacity slider initialized successfully!');
}

// Simple function to change glass opacity (fixed white color)
function changeGlassBackgroundOpacity(opacity) {
  try {
    console.log('🌈 changeGlassBackgroundOpacity called:', opacity);
    
    const root = document.documentElement;
    
    // Fixed white color with variable opacity
    const opacityDecimal = opacity / 100;
    const rgbaColor = `rgba(255, 255, 255, ${opacityDecimal})`;
    
    console.log('🌈 Setting CSS variable --glass-background-color to:', rgbaColor);
    
    root.style.setProperty('--glass-background-color', rgbaColor);
    
    // Verify it was applied
    const appliedColor = getComputedStyle(root).getPropertyValue('--glass-background-color').trim();
    console.log('🌈 CSS variable is now:', appliedColor);
    
    // Save to character-specific storage
    if (window.app?.characterData?.setCharacterSpecificValue) {
        window.app.characterData.setCharacterSpecificValue('zevi-glass-color', '#ffffff');
        window.app.characterData.setCharacterSpecificValue('zevi-glass-opacity', opacity.toString());
        console.log('🌈 Saved to character-specific storage');
    } else {
        localStorage.setItem('zevi-glass-color', '#ffffff');
        localStorage.setItem('zevi-glass-opacity', opacity.toString());
        console.log('🌈 Saved to localStorage');
    }
  } catch (error) {
    console.error('Error changing glass background opacity:', error);
  }
}

function changeGlassBackgroundColor(hexColor, opacity) {
  try {
    console.log('🌈 changeGlassBackgroundColor called:', { hexColor, opacity });
    
    const root = document.documentElement;
    const rgb = hexToRgb(hexColor);
    
    if (!rgb || typeof rgb.r === 'undefined') {
      console.error('Invalid hex color:', hexColor);
      return;
    }
    
    const newRgbaColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
    console.log('🌈 Setting CSS variable --glass-background-color to:', newRgbaColor);
    
    root.style.setProperty('--glass-background-color', newRgbaColor);
    
    // Verify the CSS variable was set
    const setColor = getComputedStyle(root).getPropertyValue('--glass-background-color').trim();
    console.log('🌈 CSS variable is now:', setColor);
    
    // Save to character-specific storage if available
    if (window.app?.characterData?.setCharacterSpecificValue) {
        window.app.characterData.setCharacterSpecificValue('zevi-glass-color', hexColor);
        window.app.characterData.setCharacterSpecificValue('zevi-glass-opacity', opacity.toString());
        console.log('🌈 Saved to character-specific storage');
    } else {
        localStorage.setItem('zevi-glass-color', hexColor);
        localStorage.setItem('zevi-glass-opacity', opacity.toString());
        console.log('🌈 Saved to localStorage');
    }
  } catch (error) {
    console.error('Error changing glass background color:', error);
  }
}

function updateGlassPreview(hexColor, opacity) {
  try {
    const glassColorPreview = document.getElementById('glassColorPreview');
    if (!glassColorPreview) {
      console.error('Glass color preview element not found');
      return;
    }
    
    const rgb = hexToRgb(hexColor);
    if (!rgb || typeof rgb.r === 'undefined') {
      console.error('Invalid hex color for preview:', hexColor);
      return;
    }
    
    const previewColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
    glassColorPreview.style.backgroundColor = previewColor;
    glassColorPreview.style.border = '1px solid rgba(255, 255, 255, 0.2)';
    glassColorPreview.style.backdropFilter = 'blur(15px)';
    glassColorPreview.style.webkitBackdropFilter = 'blur(15px)';
    glassColorPreview.style.borderRadius = '4px';
    glassColorPreview.style.width = '40px';
    glassColorPreview.style.height = '40px';
  } catch (error) {
    console.error('Error updating glass preview:', error);
  }
}

// ===== CHARACTER DELETION =====
function initializeCharacterDeletion() {
  const deleteCharBtn = document.getElementById('deleteCharacterBtn');
  const confirmCharDeleteBtn = document.getElementById('confirmCharacterDelete');
  const cancelCharDeleteBtn = document.getElementById('cancelCharacterDelete');
  const charDeleteModal = document.getElementById('characterDeleteModal');
  
  if (deleteCharBtn) {
    deleteCharBtn.addEventListener('click', () => {
        showCharacterDeleteModal();
    });
  }
  
    if (confirmCharDeleteBtn) {
    confirmCharDeleteBtn.addEventListener('click', () => {
        deleteCharacterData();
        hideCharacterDeleteModal();
    });
  }
   
  if (cancelCharDeleteBtn) {
    cancelCharDeleteBtn.addEventListener('click', () => {
        hideCharacterDeleteModal();
    });
  }
  
  // Close modal when clicking outside
  charDeleteModal.addEventListener('click', (event) => {
      if (event.target === charDeleteModal) {
          hideCharacterDeleteModal();
      }
  });
}

function showCharacterDeleteModal() {
  const modal = document.getElementById('characterDeleteModal');
  modal.style.display = 'flex';
}

function hideCharacterDeleteModal() {
  const modal = document.getElementById('characterDeleteModal');
  modal.style.display = 'none';
}

function deleteCharacterData() {
  // Check if using character management system
  const currentCharacterId = localStorage.getItem('zevi-current-character-id');
  if (currentCharacterId && window.characterManager) {
      showNotification('Use the Character Selection (👥) button to manage characters properly.', 'warning');
      return;
  }
  
  // Get all localStorage keys that start with 'zevi-' but exclude settings
  const keysToDelete = [];
  for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('zevi-') && !key.includes('custom-accent') && !key.includes('glass-') && key !== 'zevi-theme') {
          keysToDelete.push(key);
      }
  }
  
  // Delete character-specific data
  keysToDelete.forEach(key => localStorage.removeItem(key));
  
  // Reset the character sheet to default state
  resetCharacterSheet();
  
  // Generate a new character code for the fresh character
  generateNewCharacterCode();
  
  // Show success message
  showNotification('Character data deleted successfully!', 'success');
}

function resetCharacterSheet() {
  // Reset character name and details
  document.querySelector('.character-name-editor').textContent = 'Character Name';
  document.querySelector('.name-box .subtitle').textContent = 'Community Ancestry Class (Subclass)';
  document.querySelector('#charLevel').textContent = '5';
  
  // Reset domain badges
  const domainBadges = document.querySelectorAll('.domain-badge');
  domainBadges[0].textContent = 'Domain 1';
  domainBadges[1].textContent = 'Domain 2';
  
  // Reset character image
  const charImage = document.getElementById('charImage');
  const charPlaceholder = document.getElementById('charPlaceholder');
  charImage.src = '';
  charImage.style.display = 'none';
  charPlaceholder.style.display = 'block';
  
  // Reset all editable content to defaults
  document.querySelectorAll('[contenteditable="true"]').forEach(element => {
      if (element.classList.contains('subtitle')) {
          element.textContent = 'Community Ancestry Class (Subclass)';
      } else if (element.classList.contains('domain-badge')) {
          // Already handled above
      } else if (element.id === 'charLevel') {
          element.textContent = '5';
      } else {
          element.textContent = '';
      }
  });
  
  // Reset all input fields
  document.querySelectorAll('input[type="text"], input[type="number"], textarea').forEach(input => {
      if (input.id === 'evasionValue') {
          input.value = '10'; // Reset evasion to default
      } else {
          input.value = '';
      }
  });
}

// ===== ACCOUNT DELETION =====
function initializeAccountDeletion() {
  const deleteAccountBtn = document.getElementById('deleteAccountBtn');
  const confirmAccountDeleteBtn = document.getElementById('confirmAccountDelete');
  const cancelAccountDeleteBtn = document.getElementById('cancelAccountDelete');
  const accountDeleteModal = document.getElementById('accountDeleteModal');
  
  deleteAccountBtn.addEventListener('click', () => {
      showAccountDeleteModal();
  });
  
  confirmAccountDeleteBtn.addEventListener('click', () => {
      deleteAccountData();
      hideAccountDeleteModal();
  });
  
  cancelAccountDeleteBtn.addEventListener('click', () => {
      hideAccountDeleteModal();
  });
  
  // Close modal when clicking outside
  accountDeleteModal.addEventListener('click', (event) => {
      if (event.target === accountDeleteModal) {
          hideAccountDeleteModal();
      }
  });
}

function showAccountDeleteModal() {
  const modal = document.getElementById('accountDeleteModal');
  modal.style.display = 'flex';
}

function hideAccountDeleteModal() {
  const modal = document.getElementById('accountDeleteModal');
  modal.style.display = 'none';
}

async function deleteAccountData() {
  try {
    // If user is logged in, delete account from server
    if (window.zeviAPI && window.zeviAPI.isLoggedIn()) {
      // First delete all characters
      const response = await window.zeviAPI.getCharacters();
      const characters = response.characters || [];
      
      for (const character of characters) {
        await window.zeviAPI.deleteCharacter(character.id);
      }
      
      // Then logout the user
      window.zeviAuth.logout();
      
      showNotification('Account and all character data deleted from server successfully!', 'success');
    } else {
      // Just clear local data if not logged in
      localStorage.clear();
      resetToDefaults();
      showNotification('Local account data cleared successfully!', 'success');
    }
  } catch (error) {
    console.error('Error deleting account:', error);
    showNotification('Error deleting account: ' + error.message, 'error');
  }
}

function resetToDefaults() {
  // Reset theme to default
  const root = document.documentElement;
  root.style.setProperty('--text-color', '#fff');
  root.style.setProperty('--accent-color', '#ffd700');
  root.style.setProperty('--glass-background-color', 'rgba(255, 255, 255, 0.1)');
  root.style.setProperty('--char-image-border-color', 'rgba(255, 255, 255, 0.12)');
  document.body.setAttribute('data-theme', 'dark');
  
  // Reset character sheet
  resetCharacterSheet();
  
  // Reset all section colors to default
  document.querySelectorAll('[data-color-target]').forEach(element => {
      element.style.backgroundColor = '';
  });
  
  // Reload the page to ensure everything is reset
  setTimeout(() => {
      location.reload();
  }, 2000);
}

// ===== UTILITY FUNCTIONS =====
function adjustColorBrightness(hexColor, percent) {
  const rgb = hexToRgb(hexColor);
  const adjust = (color) => {
      const adjusted = Math.round(color * (1 + percent));
      return Math.max(0, Math.min(255, adjusted));
  };
  
  const newR = adjust(rgb.r);
  const newG = adjust(rgb.g);
  const newB = adjust(rgb.b);
  
  return "#" + ((1 << 24) + (newR << 16) + (newG << 8) + newB).toString(16).slice(1);
}

function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  // Style the notification
  Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      backgroundColor: type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3',
      color: 'white',
      padding: '15px 20px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      zIndex: '10000',
      fontSize: '14px',
      maxWidth: '300px',
      opacity: '0',
      transform: 'translateX(100%)',
      transition: 'all 0.3s ease'
  });
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(0)';
  }, 10);
  
  // Remove after 4 seconds
  setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
          if (notification.parentNode) {
              notification.parentNode.removeChild(notification);
          }
      }, 300);
  }, 4000);
}

// ===== CHARACTER CODE MANAGEMENT =====
function initializeCharacterCode() {
  const characterCodeDisplay = document.getElementById('characterCodeDisplay');
  const copyCodeBtn = document.getElementById('copyCodeBtn');
  const generateCodeBtn = document.getElementById('generateCodeBtn');
  const importCodeBtn = document.getElementById('importCodeBtn');
  
  // Load saved character code or generate a new one
  const savedCode = localStorage.getItem('zevi-character-code');
  if (savedCode) {
      characterCodeDisplay.value = savedCode;
  } else {
      generateNewCharacterCode();
  }
  
  // Copy code to clipboard
  copyCodeBtn.addEventListener('click', () => {
      copyCharacterCode();
  });
  
  // Generate new code
  generateCodeBtn.addEventListener('click', () => {
      if (confirm('Generate a new character code? This will create a fresh code based on your current character data.')) {
          generateNewCharacterCode();
      }
  });
  
  // Import character
  importCodeBtn.addEventListener('click', () => {
      importCharacterFromCode();
  });
  
  // Set up automatic code regeneration on character changes
  setupCharacterChangeMonitoring();
}

function setupCharacterChangeMonitoring() {
  // Auto-regenerate code when character data changes significantly
  const autoRegenCode = () => {
      setTimeout(() => {
          const currentData = gatherCharacterData();
          const savedDataSnapshot = localStorage.getItem('zevi-character-data-snapshot');
          
          if (savedDataSnapshot) {
              const savedData = JSON.parse(savedDataSnapshot);
              if (JSON.stringify(currentData) !== JSON.stringify(savedData)) {
                  generateNewCharacterCode();
              }
          }
      }, 1000); // Delay to avoid excessive regeneration
  };
  
  // Monitor name changes
  const nameInput = document.querySelector('.character-name-editor');
  if (nameInput) {
      nameInput.addEventListener('blur', autoRegenCode);
  }
  
  // Monitor attribute changes
  const attributeInputs = document.querySelectorAll('.attribute-value');
  attributeInputs.forEach(input => {
      input.addEventListener('blur', autoRegenCode);
  });
  
  // Monitor level changes
  const charLevel = document.getElementById('charLevel');
  if (charLevel) {
      charLevel.addEventListener('blur', autoRegenCode);
  }
  
  // Monitor domain changes
  const domainBadges = document.querySelectorAll('.domain-badge');
  domainBadges.forEach(badge => {
      badge.addEventListener('blur', autoRegenCode);
  });
}

function generateNewCharacterCode() {
  // Generate a character code based on current character data
  const characterData = gatherCharacterData();
  const code = generateCodeFromData(characterData);
  
  const characterCodeDisplay = document.getElementById('characterCodeDisplay');
  characterCodeDisplay.value = code;
  localStorage.setItem('zevi-character-code', code);
  localStorage.setItem('zevi-character-data-snapshot', JSON.stringify(characterData));
  
  showNotification('New character code generated!', 'success');
}

function gatherCharacterData() {
  // Gather key character data for code generation
  const data = {};
  
  // Character basic info
  const nameInput = document.querySelector('.character-name-editor');
  if (nameInput) data.name = nameInput.textContent;
  
  const subtitle = document.querySelector('.name-box .subtitle');
  if (subtitle) data.subtitle = subtitle.textContent;
  
  const charLevel = document.getElementById('charLevel');
  if (charLevel) data.level = charLevel.textContent;
  
  // Domain badges
  const domainBadges = document.querySelectorAll('.domain-badge');
  data.domains = Array.from(domainBadges).map(badge => badge.textContent);
  
  // Attribute values
  const attributeInputs = document.querySelectorAll('.attribute-value');
  data.attributes = Array.from(attributeInputs).map(input => input.value || '0');
  
  // HP and Stress
  const hpInput = document.querySelector('input[placeholder="Max HP"]');
  if (hpInput) data.maxHp = hpInput.value;
  
  const stressInput = document.querySelector('input[placeholder="Max Stress"]');
  if (stressInput) data.maxStress = stressInput.value;
  
  // Evasion
  const evasionInput = document.getElementById('evasionValue');
  if (evasionInput) data.evasion = evasionInput.value;
  
  return data;
}

function generateCodeFromData(data) {
  // Create a deterministic hash from character data
  const dataString = JSON.stringify(data);
  let hash = 0;
  
  for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Convert to base36 and take first 7 characters, make uppercase
  const code = Math.abs(hash).toString(36).toUpperCase().substring(0, 7);
  
  // Pad with random characters if too short
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let finalCode = code;
  while (finalCode.length < 7) {
      finalCode += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return finalCode;
}

function copyCharacterCode() {
  const characterCodeDisplay = document.getElementById('characterCodeDisplay');
  
  if (navigator.clipboard && window.isSecureContext) {
      // Use modern clipboard API
      navigator.clipboard.writeText(characterCodeDisplay.value).then(() => {
          showNotification('Character code copied to clipboard!', 'success');
      }).catch(() => {
          fallbackCopyToClipboard(characterCodeDisplay.value);
      });
  } else {
      // Fallback for older browsers
      fallbackCopyToClipboard(characterCodeDisplay.value);
  }
}

function fallbackCopyToClipboard(text) {
  const characterCodeDisplay = document.getElementById('characterCodeDisplay');
  characterCodeDisplay.select();
  characterCodeDisplay.setSelectionRange(0, 99999); // For mobile devices
  
  try {
      document.execCommand('copy');
      showNotification('Character code copied to clipboard!', 'success');
  } catch (err) {
      showNotification('Failed to copy code. Please select and copy manually.', 'error');
  }
}

function importCharacterFromCode() {
  const modal = document.getElementById('characterImportModal');
  const confirmBtn = document.getElementById('confirmCharacterImport');
  const cancelBtn = document.getElementById('cancelCharacterImport');
  const importInput = document.getElementById('importCodeInput');
  
  // Show modal
  modal.style.display = 'flex';
  importInput.value = '';
  importInput.focus();
  
  // Handle confirm
  const handleConfirm = () => {
      const code = importInput.value.trim().toUpperCase();
      if (!code) {
          showNotification('Please enter a character code.', 'error');
          return;
      }
      
      // For now, just show a message that this feature is coming soon
      // In a full implementation, this would decode the character data and apply it
      showNotification('Character import feature coming soon! Code: ' + code, 'info');
      
      modal.style.display = 'none';
      cleanup();
  };
  
  // Handle cancel
  const handleCancel = () => {
      modal.style.display = 'none';
      cleanup();
  };
  
  // Handle click outside modal
  const handleOutsideClick = (event) => {
      if (event.target === modal) {
          modal.style.display = 'none';
          cleanup();
      }
  };
  
  // Handle Enter key
  const handleKeyPress = (event) => {
      if (event.key === 'Enter') {
          handleConfirm();
      } else if (event.key === 'Escape') {
          handleCancel();
      }
  };
  
  // Cleanup function
  const cleanup = () => {
      confirmBtn.removeEventListener('click', handleConfirm);
      cancelBtn.removeEventListener('click', handleCancel);
      modal.removeEventListener('click', handleOutsideClick);
      importInput.removeEventListener('keypress', handleKeyPress);
  };
  
  // Add event listeners
  confirmBtn.addEventListener('click', handleConfirm);
  cancelBtn.addEventListener('click', handleCancel);
  modal.addEventListener('click', handleOutsideClick);
  importInput.addEventListener('keypress', handleKeyPress);
}

// ===== BACKPACK & ENCUMBRANCE TOGGLE =====
function initializeBackpackToggle() {
  const backpackToggle = document.getElementById('backpackToggle');
  
  if (!backpackToggle) {
    console.error('Backpack toggle element not found');
    return;
  }
  
  // Load saved setting from character-specific storage
  let isEnabled = true; // Default to enabled
  if (window.app?.characterData?.getCharacterSpecificValue) {
    const savedSetting = window.app.characterData.getCharacterSpecificValue('zevi-backpack-enabled');
    isEnabled = savedSetting !== null ? savedSetting === 'true' : true;
  }
  
  backpackToggle.checked = isEnabled;
  applyBackpackToggle(isEnabled);
  
  // Handle toggle change
  backpackToggle.addEventListener('change', (event) => {
    const enabled = event.target.checked;
    
    // Save to character-specific storage and trigger auto-save
    if (window.app?.characterData?.setCharacterSpecificValue) {
      window.app.characterData.setCharacterSpecificValue('zevi-backpack-enabled', enabled.toString());
    }
    
    // Trigger auto-save to persist to database
    }
    
    applyBackpackToggle(enabled);
    showNotification(
      enabled ? 'Backpack & encumbrance system enabled!' : 'Backpack & encumbrance system disabled!',
      'success'
    );
  });
}

function applyBackpackToggle(enabled) {
  // Set a global flag for other modules to check
  window.backpackSystemEnabled = enabled;
  
  // Apply CSS class to control visibility
  const body = document.body;
  if (enabled) {
    body.classList.remove('backpack-disabled');
  } else {
    body.classList.add('backpack-disabled');
  }
  
  // Hide/show encumbrance warning in main header
  const mainWarning = document.getElementById('encumbrance-warning-main');
  if (mainWarning) {
    mainWarning.style.display = enabled ? '' : 'none';
  }
  
  // Refresh equipment tab if it's currently active
  const equipmentTab = document.getElementById('equipment-tab-content');
  if (equipmentTab && equipmentTab.classList.contains('active')) {
    // Re-render equipment if the module is available
    if (window.renderEquipmentOverview && typeof window.renderEquipmentOverview === 'function') {
      window.renderEquipmentOverview();
    }
  }
}

// ===== INITIALIZATION =====
function initializeSettings() {
  console.log('⚙️ initializeSettings() called');
  
  initializeAccentColorPicker();
  initializeGlassOpacitySlider();
  initializeCharacterCode();
  initializeBackpackToggle();
  initializeCharacterDeletion();
  initializeAccountDeletion();
  
  // Apply saved custom colors on load
  applySavedCustomColors();
  
  console.log('⚙️ initializeSettings() completed');
}

function applySavedCustomColors() {
  const root = document.documentElement;
  const currentTheme = document.body.getAttribute('data-theme') || 'dark';
  
  // Apply saved accent color
  const savedAccentBase = localStorage.getItem('zevi-custom-accent-base');
  if (savedAccentBase) {
      const savedAccentLight = localStorage.getItem('zevi-custom-accent-light');
      const savedAccentDark = localStorage.getItem('zevi-custom-accent-dark');
      
      let finalAccentColor;
      if (currentTheme === 'light' && savedAccentLight) {
          finalAccentColor = savedAccentLight;
          root.style.setProperty('--accent-color', savedAccentLight);
      } else if (currentTheme === 'dark' && savedAccentDark) {
          finalAccentColor = savedAccentDark;
          root.style.setProperty('--accent-color', savedAccentDark);
      }
      
      // Update transparent versions if we have a final color
      if (finalAccentColor) {
          updateAccentColorTransparencies(finalAccentColor);
      }
  } else {
      // No custom colors saved, use defaults and set up transparent versions
      const defaultColor = currentTheme === 'light' ? '#b8860b' : '#ffd700';
      root.style.setProperty('--accent-color', defaultColor);
      updateAccentColorTransparencies(defaultColor);
  }
  
  // Apply saved glass color
  const savedGlassColor = localStorage.getItem('zevi-glass-color');
  const savedGlassOpacity = localStorage.getItem('zevi-glass-opacity');
  if (savedGlassColor && savedGlassOpacity) {
      const rgb = hexToRgb(savedGlassColor);
      const newRgbaColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${savedGlassOpacity})`;
      root.style.setProperty('--glass-background-color', newRgbaColor);
  }
  
  // Apply saved backpack setting
  const savedBackpackSetting = localStorage.getItem('zevi-backpack-enabled');
  if (savedBackpackSetting !== null) {
      const isEnabled = savedBackpackSetting === 'true';
      window.backpackSystemEnabled = isEnabled;
      applyBackpackToggle(isEnabled);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Small delay to ensure other scripts have loaded and theme is set
  setTimeout(initializeSettings, 200);
});

// Export functions for global access
window.changeAccentColor = changeAccentColor;
window.updateAccentColorTransparencies = updateAccentColorTransparencies;
window.changeGlassBackgroundColor = changeGlassBackgroundColor;
window.generateNewCharacterCode = generateNewCharacterCode;
window.copyCharacterCode = copyCharacterCode;
window.importCharacterFromCode = importCharacterFromCode;
window.applyBackpackToggle = applyBackpackToggle;
window.deleteCharacterData = deleteCharacterData;
window.deleteAccountData = deleteAccountData;
window.initializeSettings = initializeSettings;
