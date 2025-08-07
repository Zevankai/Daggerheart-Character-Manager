// details.js

// Character details structure
window.window.characterDetails = {
  personal: {
      pronouns: '',
      nicknames: '',
      personality: '',
      moralCompass: ''
  },
  physical: {
      eyeColor: '',
      height: '',
      build: '',
      hairColor: '',
      skinTone: '',
      distinguishingFeatures: ''
  }
};

// Load character details from localStorage
function loadCharacterDetails() {
  // Load from localStorage
  // Initialize with defaults - will be populated when character loads from cloud
  // window.characterDetails already has default structure
}

// Saves the current state of character details
function saveCharacterDetails() {
  // Save to localStorage
  // Trigger auto-save instead of localStorage
  }
}

// Initializes the details tab with input fields and loads saved data
function initializeDetailsTab() {
  // Load character details first
  loadCharacterDetails();
  
  const detailsTabContent = document.getElementById('details-tab-content');
  
  detailsTabContent.innerHTML = `
      <div class="details-container">
          <div class="details-section">
              <h3>Personal Descriptions</h3>
              <div class="detail-field">
                  <label for="pronouns-input">Pronouns:</label>
                  <input type="text" id="pronouns-input" placeholder="they/them, she/her, he/him, etc." value="${window.characterDetails.personal.pronouns}">
              </div>
              <div class="detail-field">
                  <label for="nicknames-input">Nicknames:</label>
                  <input type="text" id="nicknames-input" placeholder="Known aliases, pet names, titles..." value="${window.characterDetails.personal.nicknames}">
              </div>
              <div class="detail-field">
                  <label for="personality-input">Personality & Behavior:</label>
                  <textarea id="personality-input" rows="4" placeholder="Describe personality traits, mannerisms, habits, quirks...">${window.characterDetails.personal.personality}</textarea>
              </div>
              <div class="detail-field">
                  <label for="moral-compass-input">Moral Compass:</label>
                  <textarea id="moral-compass-input" rows="3" placeholder="Values, beliefs, ethical stance, what drives them...">${window.characterDetails.personal.moralCompass}</textarea>
              </div>
          </div>
          
          <div class="details-section">
              <h3>Physical Descriptions</h3>
              <div class="detail-field">
                  <label for="eye-color-input">Eye Color:</label>
                  <input type="text" id="eye-color-input" placeholder="Brown, blue, hazel, heterochromia, etc." value="${window.characterDetails.physical.eyeColor}">
              </div>
              <div class="detail-field">
                  <label for="height-input">Height:</label>
                  <input type="text" id="height-input" placeholder="5'6\", tall, short, average, etc." value="${window.characterDetails.physical.height}">
              </div>
              <div class="detail-field">
                  <label for="build-input">Build:</label>
                  <input type="text" id="build-input" placeholder="Athletic, slender, stocky, muscular, etc." value="${window.characterDetails.physical.build}">
              </div>
              <div class="detail-field">
                  <label for="hair-color-input">Hair Color:</label>
                  <input type="text" id="hair-color-input" placeholder="Black, blonde, dyed purple, bald, etc." value="${window.characterDetails.physical.hairColor}">
              </div>
              <div class="detail-field">
                  <label for="skin-tone-input">Skin Tone:</label>
                  <input type="text" id="skin-tone-input" placeholder="Pale, olive, dark, freckled, etc." value="${window.characterDetails.physical.skinTone}">
              </div>
              <div class="detail-field">
                  <label for="distinguishing-features-input">Distinguishing Features:</label>
                  <textarea id="distinguishing-features-input" rows="3" placeholder="Scars, tattoos, birthmarks, unique features...">${window.characterDetails.physical.distinguishingFeatures}</textarea>
              </div>
          </div>
          
          <div class="details-actions">
              <button id="save-details-btn" class="button">Save Details</button>
              <button id="clear-details-btn" class="button secondary">Clear All</button>
          </div>
      </div>
  `;
  
  // Add event listeners for saving data
  setupDetailsEventListeners();
}

// Sets up event listeners for the details form
function setupDetailsEventListeners() {
  // Auto-save on input changes
  const inputs = document.querySelectorAll('#details-tab-content input, #details-tab-content textarea');
  inputs.forEach(input => {
      input.addEventListener('input', () => {
          updateCharacterDetails();
          saveCharacterDetails();
      });
  });
  
  // Save button
  const saveBtn = document.getElementById('save-details-btn');
  if (saveBtn) {
      saveBtn.addEventListener('click', () => {
          updateCharacterDetails();
          saveCharacterDetails();
          showSaveConfirmation();
      });
  }
  
  // Clear button
  const clearBtn = document.getElementById('clear-details-btn');
  if (clearBtn) {
      clearBtn.addEventListener('click', () => {
          if (confirm('Are you sure you want to clear all details? This action cannot be undone.')) {
              clearAllDetails();
          }
      });
  }
}

// Updates the window.characterDetails object with current form values
function updateCharacterDetails() {
  window.characterDetails.personal.pronouns = document.getElementById('pronouns-input')?.value || '';
  window.characterDetails.personal.nicknames = document.getElementById('nicknames-input')?.value || '';
  window.characterDetails.personal.personality = document.getElementById('personality-input')?.value || '';
  window.characterDetails.personal.moralCompass = document.getElementById('moral-compass-input')?.value || '';
  
  window.characterDetails.physical.eyeColor = document.getElementById('eye-color-input')?.value || '';
  window.characterDetails.physical.height = document.getElementById('height-input')?.value || '';
  window.characterDetails.physical.build = document.getElementById('build-input')?.value || '';
  window.characterDetails.physical.hairColor = document.getElementById('hair-color-input')?.value || '';
  window.characterDetails.physical.skinTone = document.getElementById('skin-tone-input')?.value || '';
  window.characterDetails.physical.distinguishingFeatures = document.getElementById('distinguishing-features-input')?.value || '';
}

// Clears all details and resets the form
function clearAllDetails() {
  window.characterDetails = {
      personal: {
          pronouns: '',
          nicknames: '',
          personality: '',
          moralCompass: ''
      },
      physical: {
          eyeColor: '',
          height: '',
          build: '',
          hairColor: '',
          skinTone: '',
          distinguishingFeatures: ''
      }
  };
  
  saveCharacterDetails();
  initializeDetailsTab(); // Refresh the form
  showClearConfirmation();
}

// Shows a brief confirmation message when details are saved
function showSaveConfirmation() {
  const saveBtn = document.getElementById('save-details-btn');
  if (saveBtn) {
      const originalText = saveBtn.textContent;
      saveBtn.textContent = 'Saved!';
      saveBtn.style.backgroundColor = '#4CAF50';
      
      setTimeout(() => {
          saveBtn.textContent = originalText;
          saveBtn.style.backgroundColor = '';
      }, 1500);
  }
}

// Shows a brief confirmation message when details are cleared
function showClearConfirmation() {
  const clearBtn = document.getElementById('clear-details-btn');
  if (clearBtn) {
      const originalText = clearBtn.textContent;
      clearBtn.textContent = 'Cleared!';
      clearBtn.style.backgroundColor = '#f44336';
      
      setTimeout(() => {
          clearBtn.textContent = originalText;
          clearBtn.style.backgroundColor = '';
      }, 1500);
  }
}

// Exports character details for backup/sharing
function exportCharacterDetails() {
  return JSON.stringify(window.characterDetails, null, 2);
}

// Imports character details from JSON string
function importCharacterDetails(jsonString) {
  try {
      const importedDetails = JSON.parse(jsonString);
      
      // Validate structure
      if (importedDetails.personal && importedDetails.physical) {
          window.characterDetails = importedDetails;
          saveCharacterDetails();
          initializeDetailsTab();
          return true;
      } else {
          console.error('Invalid details format');
          return false;
      }
  } catch (error) {
      console.error('Error importing details:', error);
      return false;
  }
}

// Initialize the details tab when the page loads
document.addEventListener('DOMContentLoaded', () => {
  // Wait a bit to ensure the tab system is ready
  setTimeout(() => {
      initializeDetailsTab();
  }, 100);
});

// Make functions available globally for potential external use
window.initializeDetailsTab = initializeDetailsTab;
window.exportCharacterDetails = exportCharacterDetails;
window.importCharacterDetails = importCharacterDetails;
