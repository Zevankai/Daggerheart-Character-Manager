// --- DOWNTIME LOGIC ---
let currentRestType = '';
const MAX_CHOICES = 2;

const restOptions = {
    short: [
        { id: 'wounds', text: '<strong>Tend to Wounds:</strong> Clear 1d4 + tier HP.' },
        { id: 'stress', text: '<strong>Clear Stress:</strong> Clear 1d4 + tier Stress.' },
        { id: 'armor', text: '<strong>Repair Armor:</strong> Clear 1d4 + tier Armor Slots.' },
        { id: 'prepare', text: '<strong>Prepare:</strong> Gain 1 Hope (or 2 if with others).' }
    ],
    long: [
        { id: 'wounds', text: '<strong>Tend to Wounds:</strong> Clear all HP.' },
        { id: 'stress', text: '<strong>Clear Stress:</strong> Clear all Stress.' },
        { id: 'armor', text: '<strong>Repair Armor:</strong> Clear all Armor Slots.' },
        { id: 'prepare', text: '<strong>Prepare:</strong> Gain 1 Hope (or 2 if with others).' },
        // Project option is now handled with a dropdown
        { id: 'project', text: '<strong>Project:</strong> Advance a long-term project.' } // Keep text for the label
    ]
};

// Notification function, exposed globally as it's used by downtime and window.projects
function showNotification(message, type = 'error') {
    const notificationArea = document.getElementById('downtime-notification-area');
    notificationArea.textContent = message;
    notificationArea.className = `notification-area ${type}`;
    notificationArea.style.display = 'block';

    if (type === 'success') {
        setTimeout(() => {
            notificationArea.style.display = 'none';
        }, 3000);
    }
}

function getTier() {
    const level = parseInt(document.getElementById('charLevel').textContent) || 1;
    if (level === 1) return 1;
    if (level >= 2 && level <= 4) return 2;
    if (level >= 5 && level <= 7) return 3;
    if (level >= 8 && level <= 10) return 4;
    return 1;
}

function rollD4() {
    return Math.floor(Math.random() * 4) + 1;
}

// Variables to track prepare choices and rest state
let pendingPrepareChoices = [];
let currentRestSummaryLog = [];
let currentRestChoices = [];
let selectedProjectForRest = null;

// Helper function to show prepare choice modal
function showPrepareChoiceModal() {
    document.getElementById('prepare-choice-modal').style.display = 'flex';
}

// Helper function to handle prepare choice with party member selection
function handlePrepareWithParty(isWithParty) {
    const hopeGained = isWithParty ? 2 : 1;
    
    // Get current hope and add the gained amount
    // Get current hope from global variable (set by character reset/load)
  const currentHope = window.currentHope || 0;
    const newHope = currentHope + hopeGained;
    
    // Use the proper hope update function
    if (window.updateActiveHope) {
        window.updateActiveHope(newHope);
    }
    
    const resultText = `✨ Prepared: <strong>Gained ${hopeGained} Hope</strong>${isWithParty ? ' (with party member)' : ''}.`;
    currentRestSummaryLog.push(`<li>${resultText}</li>`);
    
    // Hide the modal
    document.getElementById('prepare-choice-modal').style.display = 'none';
    
    // Remove one pending prepare choice
    pendingPrepareChoices.pop();
    
    // If there are more prepare choices, show the modal again
    if (pendingPrepareChoices.length > 0) {
        showPrepareChoiceModal();
    } else {
        // All prepare choices handled, show the summary
        showRestSummary();
    }
}

// Function to show the rest summary
function showRestSummary() {
    const summaryList = document.getElementById('rest-summary-list');
    summaryList.innerHTML = currentRestSummaryLog.join('');
    document.getElementById('rest-summary-area').style.display = 'block';

    document.getElementById('rest-options-list').style.display = 'none';
    document.getElementById('long-rest-window.projects-container').style.display = 'none';
    document.getElementById('gm-notification').style.display = 'none';
    
    // Hide confirm and cancel buttons while summary is displayed
    document.querySelector('#rest-options-container .button:nth-of-type(1)').style.display = 'none'; // Confirm button
    document.querySelector('#rest-options-container .button:nth-of-type(2)').style.display = 'none'; // Cancel button

    showNotification('Review your rest results below, then click "Okay" to acknowledge.', 'success');

    // Save the rest summary to the journal (if there are other rest choices besides just project)
    // Only save if there's actual content beyond just the project log if project was selected
    const restSummaryTitle = `${currentRestType.charAt(0).toUpperCase() + currentRestType.slice(1)} Rest Summary`;
    const restSummaryContent = `<h4>Rest Outcomes:</h4><ul>${currentRestSummaryLog.join('')}</ul>`;

    // Only add a journal entry for the rest summary if it's not empty, and if the project entry wasn't the sole entry.
    // The explicit project advancement entry is handled above if project was chosen.
    const isProjectOnlyChoice = currentRestChoices.length === 1 && currentRestChoices[0] === 'project';

    if (currentRestSummaryLog.length > 0 && !isProjectOnlyChoice) {
        if (window.addJournalEntry) {
            window.addJournalEntry(restSummaryTitle, restSummaryContent, 'downtime', true);
        }
    }
}

// Main functions for rest initiation and confirmation
function startRest(type) {
    currentRestType = type;
    document.getElementById('rest-type-selector').style.display = 'none';

    const optionsList = document.getElementById('rest-options-list');
    optionsList.innerHTML = '';
    
    restOptions[type].forEach(opt => {
        const optionHtml = `
            <div class="rest-option">
                <input type="checkbox" id="opt-${opt.id}" name="rest-choice" value="${opt.id}">
                <label for="opt-${opt.id}">${opt.text}</label>
            </div>
        `;
        optionsList.innerHTML += optionHtml;
    });

    document.querySelectorAll('input[name="rest-choice"]').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const checkedCount = document.querySelectorAll('input[name="rest-choice"]:checked').length;
            if (checkedCount > MAX_CHOICES) {
                checkbox.checked = false;
                showNotification(`You can only choose ${MAX_CHOICES} options.`, 'error');
            } else {
                document.getElementById('downtime-notification-area').style.display = 'none';
            }
            
            // Show/hide project section based on project checkbox for long rests
            if (checkbox.value === 'project' && type === 'long') {
                const projectContainer = document.getElementById('long-rest-window.projects-container');
                if (checkbox.checked) {
                    projectContainer.style.display = 'block';
                    hideProjectViews(); // Reset project views when shown
                } else {
                    projectContainer.style.display = 'none';
                    selectedProjectForRest = null; // Clear selection
                }
            }
        });
    });

    document.getElementById('rest-title').textContent = type === 'short' ? 'Short Rest Options' : 'Long Rest Options';
    document.getElementById('gm-notification').innerHTML = type === 'short'
        ? 'On a short rest, the GM gains <strong>1d4 Fear.</strong>'
        : 'On a long rest, the GM gains Fear equal to <strong>1d4 + the number of PCs</strong>, and can advance a countdown.';

    document.getElementById('long-rest-window.projects-container').style.display = type === 'long' ? 'block' : 'none';
    document.getElementById('rest-options-container').style.display = 'block';
    document.getElementById('rest-summary-area').style.display = 'none';
    showNotification('Select your rest options.', 'info');
}

// New project management functions for rest interface
function hideProjectViews() {
    document.getElementById('completed-window.projects-view').style.display = 'none';
    document.getElementById('active-window.projects-view').style.display = 'none';
    document.getElementById('create-project-view').style.display = 'none';
    document.getElementById('selected-project-info').style.display = 'none';
    selectedProjectForRest = null;
}

function showCompletedProjects() {
    hideProjectViews();
    const completedProjects = window.projects.filter(p => p.progress >= p.segments);
    const completedProjectsList = document.getElementById('completed-window.projects-list');
    
    if (completedProjects.length === 0) {
        completedProjectsList.innerHTML = '<p style="text-align: center; opacity: 0.7;">No completed window.projects yet.</p>';
    } else {
        completedProjectsList.innerHTML = completedProjects.map(project => `
            <div class="project-item completed">
                <div class="project-header">
                    <div class="project-info">
                        <strong>${project.name}</strong> (Completed)
                    </div>
                </div>
                <div class="progress-clock">
                    ${Array.from({ length: project.segments }).map(() => `
                        <div class="progress-segment active"></div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }
    
    document.getElementById('completed-window.projects-view').style.display = 'block';
}

function showActiveProjects() {
    hideProjectViews();
    const activeProjects = window.projects.filter(p => p.progress < p.segments);
    const activeProjectsList = document.getElementById('active-window.projects-list');
    
    if (activeProjects.length === 0) {
        activeProjectsList.innerHTML = '<p style="text-align: center; opacity: 0.7;">No active window.projects. Create a new project to get started!</p>';
    } else {
        activeProjectsList.innerHTML = activeProjects.map(project => `
            <div class="project-item selectable" onclick="window.selectProjectForRest(${project.id})">
                <div class="project-header">
                    <div class="project-info">
                        <strong>${project.name}</strong> (${project.progress}/${project.segments})
                    </div>
                </div>
                <div class="progress-clock">
                    ${Array.from({ length: project.segments }).map((_, i) => `
                        <div class="progress-segment ${i < project.progress ? 'active' : ''}"></div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }
    
    document.getElementById('active-window.projects-view').style.display = 'block';
}

function selectProjectForRest(projectId) {
    const project = window.projects.find(p => p.id === projectId);
    if (project) {
        selectedProjectForRest = project;
        document.getElementById('selected-project-name').textContent = project.name;
        document.getElementById('selected-project-info').style.display = 'block';
        
        // Update visual selection
        document.querySelectorAll('.project-item.selectable').forEach(item => {
            item.classList.remove('selected');
        });
        event.target.closest('.project-item').classList.add('selected');
    }
}

function showCreateNewProject() {
    hideProjectViews();
    document.getElementById('new-project-name').value = '';
    document.getElementById('new-project-segments').value = '4';
    document.getElementById('create-project-view').style.display = 'block';
}

function createNewProject() {
    const name = document.getElementById('new-project-name').value.trim();
    const segments = parseInt(document.getElementById('new-project-segments').value);
    
    if (!name) {
        showNotification('Project name cannot be empty.', 'error');
        return;
    }
    
    if (isNaN(segments) || segments < 1 || segments > 12) {
        showNotification('Segments must be a number between 1 and 12.', 'error');
        return;
    }
    
    const newProject = {
        id: Date.now(),
        name: name,
        segments: segments,
        progress: 0
    };
    
    window.projects.push(newProject);
    saveProjects();
    showNotification(`Project "${name}" created successfully!`, 'success');
    hideProjectViews();
}


function confirmRest() {
    const choices = Array.from(document.querySelectorAll('input[name="rest-choice"]:checked')).map(cb => cb.value);
    if (choices.length !== MAX_CHOICES) {
        showNotification(`Please select exactly ${MAX_CHOICES} options.`, 'error');
        return;
    }

    // Reset state variables
    currentRestSummaryLog = [];
    pendingPrepareChoices = [];
    currentRestChoices = choices;

    const tier = getTier();

    // First, handle all non-prepare choices
    choices.forEach(choice => {
        if (choice === 'prepare') {
            pendingPrepareChoices.push(choice);
            return; // Skip prepare for now, handle separately
        }

        if (currentRestType === 'short') {
            const d4Roll = rollD4();
            const total = d4Roll + tier;
            let resultText = '';
            if (choice === 'wounds') {
                const currentlyActiveHPCount = window.hpCircles.filter(c => c.active).length;
                const newActiveHPCount = Math.max(0, currentlyActiveHPCount - total);

                window.hpCircles.forEach((c, i) => {
                    c.active = (i < newActiveHPCount);
                });
                window.saveHPState();
                window.renderHPCircles();
                resultText = `🩹 HP: Dice Roll (${d4Roll}) + Tier (${tier}) = <strong>${total}</strong> recovered.`;
            } else if (choice === 'stress') {
                const currentlyActiveStressCount = window.stressCircles.filter(c => c.active).length;
                const newActiveStressCount = Math.max(0, currentlyActiveStressCount - total);

                window.stressCircles.forEach((c, i) => {
                    c.active = (i < newActiveStressCount);
                });
                window.saveStressState();
                window.renderStressCircles();
                resultText = `😌 Stress: Dice Roll (${d4Roll}) + Tier (${tier}) = <strong>${total}</strong> recovered.`;
            } else if (choice === 'armor') {
                // For short rest armor repair: remove filled circles (make them unfilled)
                let repairedCount = 0;
                if (window.armorCircles && window.saveArmorState && window.renderArmorCircles) {
                    // Count how many active circles we have before repair
                    const activeCount = window.armorCircles.filter(c => c.active).length;
                    // Start from the end to remove the rightmost filled circles first
                    for (let i = window.armorCircles.length - 1; i >= 0 && repairedCount < total && repairedCount < activeCount; i--) {
                        if (window.armorCircles[i].active) {
                            window.armorCircles[i].active = false;
                            repairedCount++;
                        }
                    }
                    window.saveArmorState();
                    window.renderArmorCircles();
                } else {
                    // Fallback to DOM manipulation if the proper functions aren't available
                    const armorCircles = document.querySelectorAll('#armor-tracker .circle');
                    const activeCircles = Array.from(armorCircles).filter(c => c.classList.contains('active'));
                    for (let i = armorCircles.length - 1; i >= 0 && repairedCount < total && repairedCount < activeCircles.length; i--) {
                        if (armorCircles[i].classList.contains('active')) {
                            armorCircles[i].classList.remove('active');
                            repairedCount++;
                        }
                    }
                }
                resultText = `🛡️ Armor: Dice Roll (${d4Roll}) + Tier (${tier}) = <strong>${repairedCount}</strong> slots repaired.`;
            }
            currentRestSummaryLog.push(`<li>${resultText}</li>`);
        } else { // Long Rest
            if (choice === 'wounds') {
                window.hpCircles.forEach(c => c.active = false);
                window.saveHPState();
                window.renderHPCircles();
                currentRestSummaryLog.push('<li>🩹 HP: <strong>All HP</strong> cleared.</li>');
            } else if (choice === 'stress') {
                window.stressCircles.forEach(c => c.active = false);
                window.saveStressState();
                window.renderStressCircles();
                currentRestSummaryLog.push('<li>😌 Stress: <strong>All Stress</strong> cleared.</li>');
            } else if (choice === 'armor') {
                // For long rest armor repair: clear all filled circles
                let repairedCount = 0;
                if (window.armorCircles && window.saveArmorState && window.renderArmorCircles) {
                    repairedCount = window.armorCircles.filter(c => c.active).length; // Count active before clearing
                    window.armorCircles.forEach(circle => circle.active = false);
                    window.saveArmorState();
                    window.renderArmorCircles();
                } else {
                    // Fallback to DOM manipulation if the proper functions aren't available
                    const armorCircles = document.querySelectorAll('#armor-tracker .circle');
                    repairedCount = Array.from(armorCircles).filter(c => c.classList.contains('active')).length;
                    armorCircles.forEach(slot => slot.classList.remove('active'));
                }
                currentRestSummaryLog.push(`<li>🛡️ Armor: <strong>${repairedCount > 0 ? 'All' : 'No'} armor slots</strong> repaired.</li>`);
            } else if (choice === 'project') {
                if (!selectedProjectForRest) {
                    showNotification('Please select a project to advance from the Long-Term Projects section, or uncheck the project option.', 'error');
                    return;
                }

                const projectIndex = window.projects.findIndex(p => p.id === selectedProjectForRest.id);
                if (projectIndex === -1) {
                    showNotification('Selected project not found.', 'error');
                    return;
                }

                const project = window.projects[projectIndex];
                if (project.progress < project.segments) {
                    project.progress++; // Advance progress by one segment
                    saveProjects(); // Save the updated project progress
                    const projectName = project.name;
                    const newProgress = `${project.progress}/${project.segments}`;
                    currentRestSummaryLog.push(`<li>🛠️ Project: Advanced "<strong>${projectName}</strong>" to <strong>${newProgress}</strong>.</li>`);
                    
                    // Also add a separate journal entry for the project advancement
                    if (window.addJournalEntry) {
                        window.addJournalEntry(
                            `Project Advanced: ${projectName}`,
                            `Advanced "${projectName}" to ${newProgress} during a long rest.`,
                            'downtime',
                            true // isAutoGenerated
                        );
                    }

                } else {
                    currentRestSummaryLog.push(`<li>🛠️ Project: "<strong>${project.name}</strong>" is already completed.</li>`);
                    showNotification(`Project "${project.name}" is already completed!`, 'info');
                }
            }
        }
    });

    // If there are prepare choices, show the modal, otherwise show summary directly
    if (pendingPrepareChoices.length > 0) {
        showPrepareChoiceModal();
    } else {
        showRestSummary();
    }
}

function acknowledgeRest() {
    // Reset state variables
    currentRestSummaryLog = [];
    pendingPrepareChoices = [];
    currentRestChoices = [];
    resetDowntimeView();
}


// Resets the UI of the downtime tab
function resetDowntimeView() {
    document.getElementById('rest-options-container').style.display = 'none';
    document.getElementById('rest-summary-area').style.display = 'none';
    document.getElementById('downtime-notification-area').style.display = 'none';
    document.getElementById('prepare-choice-modal').style.display = 'none'; // Hide prepare modal
    document.getElementById('rest-type-selector').style.display = 'block';

    document.getElementById('rest-options-list').style.display = 'flex';
    document.getElementById('gm-notification').style.display = 'block';
    
    // Show confirm and cancel buttons again
    document.querySelector('#rest-options-container .button:nth-of-type(1)').style.display = 'inline-block';
    document.querySelector('#rest-options-container .button:nth-of-type(2)').style.display = 'inline-block';

    currentRestType = '';
    selectedProjectForRest = null;

    document.querySelectorAll('input[name="rest-choice"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Hide project views and reset selection
    hideProjectViews();
}


// --- PROJECT MANAGEMENT LOGIC ---
  // Initialize empty - will be populated when character loads from cloud
  window.window.projects = [];

// Migrate existing window.projects to ensure they have IDs
window.projects.forEach(project => {
    if (!project.id) {
        project.id = Date.now() + Math.random(); // Ensure unique IDs
    }
});
if (window.projects.length > 0) {
    saveProjects(); // Save migrated window.projects
}


function saveProjects() {
    // Trigger auto-save instead of localStorage
    if (window.app?.characterData?.constructor?.saveCharacterData) {
      window.app.characterData.constructor.saveCharacterData();
    }
}


// This function is no longer used in the rest interface but kept for compatibility
function renderProjects() {
    // This function is deprecated in favor of the new project view system
    // but kept for any external references
}


// Old project functions removed - now using the new rest-specific project interface


// Expose functions to the global scope for access from HTML and script.js
window.startRest = startRest;
window.confirmRest = confirmRest;
window.acknowledgeRest = acknowledgeRest;
window.resetDowntimeView = resetDowntimeView;
window.handlePrepareWithParty = handlePrepareWithParty; // For prepare choice modal
window.showCompletedProjects = showCompletedProjects; // New project interface
window.showActiveProjects = showActiveProjects; // New project interface
window.showCreateNewProject = showCreateNewProject; // New project interface
window.createNewProject = createNewProject; // New project interface
window.selectProjectForRest = selectProjectForRest; // New project interface
window.hideProjectViews = hideProjectViews; // New project interface
window.showNotification = showNotification; // Used by both downtime and project logic, exposed
