// hope.js

// --- HOPE TRACKER FUNCTIONS ---
const minHopeCircles = 0; // Minimum total hope circles allowed
const globalMaxHopeCircles = 10; // Absolute maximum total hope circles allowed (e.g., to prevent excessive growth)

function renderHopeCircles() {
    const hopeTracker = document.getElementById('hope-tracker');
    if (!hopeTracker) {
        console.warn('Hope tracker element not found. Cannot render circles.');
        return;
    }
    hopeTracker.innerHTML = ''; // Clear existing circles

    let currentHope = parseInt(localStorage.getItem('zevi-hope')) || 0;
    // Get the current maximum number of circles for Hope from localStorage, default to 6
    let currentMaxHope = parseInt(localStorage.getItem('zevi-max-hope')) || 6;

    // Ensure currentMaxHope stays within global limits
    if (currentMaxHope < minHopeCircles) currentMaxHope = minHopeCircles;
    if (currentMaxHope > globalMaxHopeCircles) currentMaxHope = globalMaxHopeCircles;

    // Cap currentHope at the currentMaxHope
    if (currentHope > currentMaxHope) currentHope = currentMaxHope;
    if (currentHope < 0) currentHope = 0; // Prevent negative hope

    // Trigger auto-save instead of localStorage
    if (window.app?.characterData?.constructor?.saveCharacterData) {
        window.app.characterData.constructor.saveCharacterData();
    }

    // Create circles up to the currentMaxHope
    for (let i = 0; i < currentMaxHope; i++) {
        const circle = document.createElement('div');
        circle.classList.add('hp-circle', 'hope-circle'); // Use hp-circle for base styles, hope-circle for color
        if (i < currentHope) {
            circle.classList.add('active');
        }
        circle.dataset.index = i; // Store index for individual circle tracking
        hopeTracker.appendChild(circle);

        // Add click listener to individual circles to set hope
        circle.addEventListener('click', () => {
            let newHope = parseInt(circle.dataset.index) + 1;
            // If clicking on an active circle that is currently the highest active, decrement it
            if (circle.classList.contains('active') && newHope === currentHope) {
                newHope--;
            }
            updateActiveHope(newHope); // Call updateActiveHope for internal changes
        });
    }
}

// Function to update the number of ACTIVE hope circles
function updateActiveHope(value) {
    let currentMaxHope = parseInt(localStorage.getItem('zevi-max-hope')) || 6;
    let newHope = value;
    if (newHope > currentMaxHope) newHope = currentMaxHope; // Ensure it doesn't exceed current max circles
    if (newHope < 0) newHope = 0; // Ensure it doesn't go below zero

            // Trigger auto-save instead of localStorage
        if (window.app?.characterData?.constructor?.saveCharacterData) {
            window.app.characterData.constructor.saveCharacterData();
        }
    renderHopeCircles(); // Re-render to reflect changes
}

// Function to update the TOTAL number of hope circles
function updateMaxHopeCircles(change) {
    let currentMaxHope = parseInt(localStorage.getItem('zevi-max-hope')) || 6;
    let newMaxHope = currentMaxHope + change;

    // Apply global limits
    if (newMaxHope < minHopeCircles) newMaxHope = minHopeCircles;
    if (newMaxHope > globalMaxHopeCircles) newMaxHope = globalMaxHopeCircles;

            // Trigger auto-save instead of localStorage
        if (window.app?.characterData?.constructor?.saveCharacterData) {
            window.app.characterData.constructor.saveCharacterData();
        }
    renderHopeCircles(); // Re-render to reflect changes in total circles
}


// Expose functions to the global scope if needed for HTML or other scripts
window.renderHopeCircles = renderHopeCircles;
window.updateActiveHope = updateActiveHope;
window.updateMaxHopeCircles = updateMaxHopeCircles;


// Initialize hope circles and attach button listeners when hope.js is loaded
document.addEventListener('DOMContentLoaded', () => {
    renderHopeCircles(); // Initial render based on stored values

    const hopeIncrementBtn = document.getElementById('hope-increment');
    const hopeDecrementBtn = document.getElementById('hope-decrement');

    if (hopeIncrementBtn) {
        hopeIncrementBtn.addEventListener('click', () => {
            updateMaxHopeCircles(1); // Add one total circle
        });
    }

    if (hopeDecrementBtn) {
        hopeDecrementBtn.addEventListener('click', () => {
            updateMaxHopeCircles(-1); // Remove one total circle
        });
    }
});
