import { createSection } from './utils.js'; // Assuming you have a utility to create sections

export function initializeArmorSection(parentContainerId) {
    const armorSection = createSection('armor-section', 'Armor');

    armorSection.innerHTML = `
        <div class="section-content">
            <div class="trackers-wrapper">
                <button class="tracker-btn" data-type="armor" data-action="decrement">-</button>
                <div class="trackers" id="armor-circles">
                    </div>
                <button class="tracker-btn" data-type="armor" data-action="increment">+</button>
            </div>
            <div class="divider"></div>
            <h3>Active Armor</h3>
            <div id="active-armor-display">
                <p class="no-entries-message">No active armor equipped.</p>
                </div>
        </div>
    `;

    document.getElementById(parentContainerId).appendChild(armorSection);

    renderArmorCircles();
    setupArmorCircleListeners();
    setupArmorTrackerButtons();
}

function renderArmorCircles() {
    const armorCirclesContainer = document.getElementById('armor-tracker');
    if (!armorCirclesContainer) return; // Exit if the element doesn't exist yet
    
    armorCirclesContainer.innerHTML = ''; // Clear existing circles

    // Get total number of armor circles and active count from global variables
    let totalArmorCircles = window.totalArmorCircles || 4;
    let activeArmorCount = window.activeArmorCount || 0;
    
    // Ensure values are within reasonable bounds
    totalArmorCircles = Math.max(1, Math.min(totalArmorCircles, 10));
    activeArmorCount = Math.max(0, Math.min(activeArmorCount, totalArmorCircles));

    for (let i = 0; i < totalArmorCircles; i++) {
        const circle = document.createElement('div');
        circle.classList.add('hp-circle'); // Use hp-circle base class for styling
        circle.classList.add('armor-circle'); // Add armor-specific class for identification
        if (i < activeArmorCount) {
            circle.classList.add('active');
        }
        circle.dataset.index = i;
        
        // Add click listener to toggle armor state
        circle.addEventListener('click', () => {
            const clickedIndex = parseInt(circle.dataset.index);
            let targetActiveCount;

            const isClickedCircleActive = circle.classList.contains('active');

            if (isClickedCircleActive) {
                targetActiveCount = clickedIndex;
            } else {
                targetActiveCount = clickedIndex + 1;
            }

            // Update active count and save
            // Trigger auto-save instead of localStorage
    if (window.app?.characterData?.constructor?.saveCharacterData) {
      window.app.characterData.constructor.saveCharacterData();
    }
            renderArmorCircles(); // Re-render to update UI
        });
        
        armorCirclesContainer.appendChild(circle);
    }
}

function setupArmorCircleListeners() {
    // Circle listeners are now handled in renderArmorCircles()
    // This function is kept for compatibility but no longer needed
}

function setupArmorTrackerButtons() {
    const addArmorBtn = document.querySelector('.add-armor');
    const removeArmorBtn = document.querySelector('.remove-armor');
    
    if (addArmorBtn) {
        addArmorBtn.addEventListener('click', () => {
            let totalArmorCircles = window.totalArmorCircles || 4;
            totalArmorCircles++;
            totalArmorCircles = Math.max(1, Math.min(totalArmorCircles, 10)); // Min 1, Max 10
            window.totalArmorCircles = totalArmorCircles;
            // Trigger auto-save instead of localStorage
            if (window.app?.characterData?.constructor?.saveCharacterData) {
              window.app.characterData.constructor.saveCharacterData();
            }
            renderArmorCircles();
        });
    }
    
    if (removeArmorBtn) {
        removeArmorBtn.addEventListener('click', () => {
            let totalArmorCircles = window.totalArmorCircles || 4;
            let activeArmorCount = window.activeArmorCount || 0;
            
            totalArmorCircles--;
            // If we remove circles, make sure active count doesn't exceed total
            if (activeArmorCount > totalArmorCircles) {
                activeArmorCount = Math.max(0, totalArmorCircles);
                window.activeArmorCount = activeArmorCount;
            }
            
            totalArmorCircles = Math.max(1, Math.min(totalArmorCircles, 10)); // Min 1, Max 10
            window.totalArmorCircles = totalArmorCircles;
            // Trigger auto-save instead of localStorage
            if (window.app?.characterData?.constructor?.saveCharacterData) {
              window.app.characterData.constructor.saveCharacterData();
            }
            renderArmorCircles();
        });
    }
}

// Dummy function for importing active armor - will be implemented later
export function updateActiveArmorDisplay(armorItem) {
    const activeArmorDisplay = document.getElementById('active-armor-display');
    if (armorItem) {
        activeArmorDisplay.innerHTML = `
            <h4>${armorItem.name}</h4>
            <p>${armorItem.description}</p>
            <p><strong>Effect:</strong> ${armorItem.effect}</p>
        `;
    } else {
        activeArmorDisplay.innerHTML = `<p class="no-entries-message">No active armor equipped.</p>`;
    }
}
