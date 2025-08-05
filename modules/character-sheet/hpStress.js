// hpStress.js

// --- HP & STRESS TRACKER LOGIC ---
// These are global variables and functions that main script.js and downtime.js need to access
// Initialize with defaults - will be populated when character loads from cloud
let hpCircles = Array(4).fill({ active: true }); // Default HP circles active
let stressCircles = Array(4).fill({ active: false });
let armorCircles = Array(4).fill({ active: false });

function saveHPState() {
    // Trigger auto-save instead of localStorage
  if (window.app?.characterData?.constructor?.saveCharacterData) {
    window.app.characterData.constructor.saveCharacterData();
  }
}

function saveStressState() {
    // Trigger auto-save instead of localStorage
  if (window.app?.characterData?.constructor?.saveCharacterData) {
    window.app.characterData.constructor.saveCharacterData();
  }
}

function renderHPCircles() {
    const hpTrackerDiv = document.getElementById('hp-tracker');
    if (!hpTrackerDiv) return; // Exit if the element doesn't exist yet

    hpTrackerDiv.innerHTML = '';

    hpCircles.forEach((circleState, index) => {
        const circle = document.createElement('div');
        circle.className = `hp-circle ${circleState.active ? 'active' : ''}`;
        circle.dataset.index = index;
        circle.addEventListener('click', (event) => {
            const clickedIndex = parseInt(event.target.dataset.index);
            let targetActiveCount;

            const isClickedCircleActive = hpCircles[clickedIndex].active;

            if (isClickedCircleActive) {
                targetActiveCount = clickedIndex;
            } else {
                targetActiveCount = clickedIndex + 1;
            }

            hpCircles.forEach((c, i) => {
                c.active = (i < targetActiveCount);
            });
            saveHPState();
            renderHPCircles(); // Re-render to update UI
        });
        hpTrackerDiv.appendChild(circle);
    });
}

function renderStressCircles() {
    const stressTrackerDiv = document.getElementById('stress-tracker');
    if (!stressTrackerDiv) return; // Exit if the element doesn't exist yet

    stressTrackerDiv.innerHTML = ''; // Clear existing circles

    // Find the parent .trackers-wrapper
    const trackersWrapper = stressTrackerDiv.closest('.trackers-wrapper');
    if (!trackersWrapper) return;

    // Check if the label already exists to prevent duplication
    let stressLabel = trackersWrapper.querySelector('.tracker-label.stress');
    if (!stressLabel) {
        stressLabel = document.createElement('span');
        stressLabel.className = 'tracker-label stress'; // Add 'stress' for specific styling if needed
        // Original line: stressLabel.textContent = 'Stress'; // This line was responsible for the text
        stressLabel.textContent = ''; // <--- MODIFIED: Setting text content to an empty string
        // Insert the label right after the remove button, but before the stressTrackerDiv
        const removeButton = trackersWrapper.querySelector('.remove-stress');
        if (removeButton) {
            removeButton.after(stressLabel);
        } else {
            // Fallback: prepend to wrapper if button not found (less ideal, but safe)
            trackersWrapper.prepend(stressLabel);
        }
    }


    stressCircles.forEach((circleState, index) => {
        const circle = document.createElement('div');
        circle.className = `stress-circle ${circleState.active ? 'active' : ''}`;
        circle.dataset.index = index;
        circle.addEventListener('click', (event) => {
            const clickedIndex = parseInt(event.target.dataset.index);
            let targetActiveCount;

            const isClickedCircleActive = stressCircles[clickedIndex].active;

            if (isClickedCircleActive) {
                targetActiveCount = clickedIndex;
            } else {
                targetActiveCount = clickedIndex + 1;
            }

            stressCircles.forEach((c, i) => {
                c.active = (i < targetActiveCount);
            });
            saveStressState();
            renderStressCircles(); // Re-render to update UI
        });
        stressTrackerDiv.appendChild(circle);
    });
}

function addCircle(type) {
    if (type === 'hp') {
        hpCircles.push({ active: false });
        saveHPState();
        renderHPCircles();
    } else if (type === 'stress') {
        stressCircles.push({ active: false });
        saveStressState();
        renderStressCircles();
    }
}

function removeCircle(type) {
    if (type === 'hp' && hpCircles.length > 1) {
        hpCircles.pop();
        saveHPState();
        renderHPCircles();
    } else if (type === 'stress' && stressCircles.length > 1) {
        stressCircles.pop();
        saveStressState();
        renderStressCircles();
    }
}

// --- NEW DAMAGE BUTTON LOGIC ---
// Renamed to 'takeDamage' to clarify it fills circles (takes damage)
function takeDamage(amount) {
    let currentlyFilledHPCount = hpCircles.filter(c => c.active).length;
    // Calculate new count, ensuring it doesn't exceed total circles
    let newFilledHPCount = Math.min(hpCircles.length, currentlyFilledHPCount + amount);

    hpCircles.forEach((c, i) => {
        c.active = (i < newFilledHPCount);
    });
    saveHPState();
    renderHPCircles();
}

// Function to handle the number input for damage values
// This function is re-added to save the value to localStorage,
// even though the buttons don't use it directly anymore.
function updateDamageValue(element, type) {
    let value = parseInt(element.value);
    if (isNaN(value)) {
        value = 0; // Default to 0 if input is empty or invalid
    }
          // Trigger auto-save instead of localStorage
      if (window.app?.characterData?.constructor?.saveCharacterData) {
        window.app.characterData.constructor.saveCharacterData();
      }
}

// Function to load damage values on page load
// This function is re-added to populate the input fields.
function loadDamageValues() {
    const minorDamageInput = document.getElementById('minor-damage-value');
    const majorDamageInput = document.getElementById('major-damage-value');
    // Removed severeDamageInput as its element is no longer in HTML

    // Set defaults - will be overridden when character loads from cloud
    if (minorDamageInput && !minorDamageInput.value) {
        minorDamageInput.value = '1';
    }
    if (majorDamageInput && !majorDamageInput.value) {
        majorDamageInput.value = '2';
    }
    // No longer loading severeDamageInput
}


// Event Listeners for HP/Stress add/remove buttons, triggered on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.add-hp')?.addEventListener('click', () => addCircle('hp'));
    document.querySelector('.remove-hp')?.addEventListener('click', () => removeCircle('hp'));
    document.querySelector('.add-stress')?.addEventListener('click', () => addCircle('stress'));
    document.querySelector('.remove-stress')?.addEventListener('click', () => removeCircle('stress'));

    // Armor tracker event listeners
    document.querySelector('.add-armor')?.addEventListener('click', addArmorCircle);
    document.querySelector('.remove-armor')?.addEventListener('click', removeArmorCircle);

    // NEW: Add event listeners for damage buttons to take fixed amounts of damage
    document.getElementById('minor-damage-btn')?.addEventListener('click', () => {
        takeDamage(1); // Fill 1 circle for minor damage, ignoring input field
    });

    document.getElementById('major-damage-btn')?.addEventListener('click', () => {
        takeDamage(2); // Fill 2 circles for major damage, ignoring input field
    });

    document.getElementById('severe-damage-btn')?.addEventListener('click', () => {
        takeDamage(3); // Fill 3 circles for severe damage, ignoring input field
    });

    // Initial rendering for HP and Stress circles
    // Only render if CharacterStateManager is not available (fallback mode)
    if (!window.CharacterStateManager) {
        renderHPCircles();
        renderStressCircles(); // This will now also create the label
        renderArmorCircles(); // Initial render for armor circles
    }
    loadDamageValues(); // Load saved damage values for the inputs
});


// Expose these for downtime.js and main script.js to access
window.hpCircles = hpCircles;
window.stressCircles = stressCircles;
window.saveHPState = saveHPState;
window.saveStressState = saveStressState;
window.renderHPCircles = renderHPCircles;
window.renderStressCircles = renderStressCircles;
window.addCircle = addCircle; // Expose if HTML uses onclick directly
window.removeCircle = removeCircle; // Expose if HTML uses onclick directly
window.takeDamage = takeDamage; // Expose the new takeDamage function
// Re-expose updateDamageValue since we're putting the inputs back
window.updateDamageValue = updateDamageValue;
// Expose armor functions
window.armorCircles = armorCircles;
window.saveArmorState = saveArmorState;
window.renderArmorCircles = renderArmorCircles;
window.addArmorCircle = addArmorCircle;
window.removeArmorCircle = removeArmorCircle;

function saveArmorState() {
          // Trigger auto-save instead of localStorage
      if (window.app?.characterData?.constructor?.saveCharacterData) {
        window.app.characterData.constructor.saveCharacterData();
      }
}

function renderArmorCircles() {
    const armorTrackerDiv = document.getElementById('armor-tracker');
    if (!armorTrackerDiv) return; // Exit if the element doesn't exist yet

    armorTrackerDiv.innerHTML = '';

    armorCircles.forEach((circleState, index) => {
        const circle = document.createElement('div');
        circle.className = `hp-circle armor-circle ${circleState.active ? 'active' : ''}`;
        circle.dataset.index = index;
        circle.addEventListener('click', (event) => {
            const clickedIndex = parseInt(event.target.dataset.index);
            
            // Toggle the clicked circle and all circles after it
            const isClickedCircleActive = armorCircles[clickedIndex].active;
            
            if (isClickedCircleActive) {
                // If clicking an active circle, deactivate it and all after it
                armorCircles.forEach((c, i) => {
                    if (i >= clickedIndex) {
                        c.active = false;
                    }
                });
            } else {
                // If clicking an inactive circle, activate it and all before it
                armorCircles.forEach((c, i) => {
                    c.active = (i <= clickedIndex);
                });
            }
            
            saveArmorState();
            renderArmorCircles(); // Re-render to update UI
        });
        armorTrackerDiv.appendChild(circle);
    });
}

function addArmorCircle() {
    armorCircles.push({ active: false });
    saveArmorState();
    renderArmorCircles();
}

function removeArmorCircle() {
    if (armorCircles.length > 1) {
        armorCircles.pop();
        saveArmorState();
        renderArmorCircles();
    }
}
