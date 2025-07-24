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

// Notification function, exposed globally as it's used by downtime and projects
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

// Main functions for rest initiation and confirmation
function startRest(type) {
    currentRestType = type;
    document.getElementById('rest-type-selector').style.display = 'none';

    const optionsList = document.getElementById('rest-options-list');
    optionsList.innerHTML = '';
    
    restOptions[type].forEach(opt => {
        let optionHtml = '';
        if (opt.id === 'project' && type === 'long') {
            optionHtml = `
                <div class="rest-option">
                    <input type="checkbox" id="opt-${opt.id}" name="rest-choice" value="${opt.id}">
                    <label for="opt-${opt.id}">
                        ${opt.text}
                        <select id="project-selection-for-rest" style="margin-left: 10px; padding: 5px; border-radius: 5px; background: rgba(255,255,255,0.1); color: #000 !important; border: 1px solid rgba(255,255,255,0.2);">
                            </select>
                    </label>
                </div>
            `;
        } else {
            optionHtml = `
                <div class="rest-option">
                    <input type="checkbox" id="opt-${opt.id}" name="rest-choice" value="${opt.id}">
                    <label for="opt-${opt.id}">${opt.text}</label>
                </div>
            `;
        }
        optionsList.innerHTML += optionHtml;
    });

    // Populate project dropdown only for long rests
    if (type === 'long') {
        populateProjectDropdown();
    }

    document.querySelectorAll('input[name="rest-choice"]').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const checkedCount = document.querySelectorAll('input[name="rest-choice"]:checked').length;
            if (checkedCount > MAX_CHOICES) {
                checkbox.checked = false;
                showNotification(`You can only choose ${MAX_CHOICES} options.`, 'error');
            } else {
                document.getElementById('downtime-notification-area').style.display = 'none';
            }
        });
    });

    document.getElementById('rest-title').textContent = type === 'short' ? 'Short Rest Options' : 'Long Rest Options';
    document.getElementById('gm-notification').innerHTML = type === 'short'
        ? 'On a short rest, the GM gains <strong>1d4 Fear.</strong>'
        : 'On a long rest, the GM gains Fear equal to <strong>1d4 + the number of PCs</strong>, and can advance a countdown.';

    document.getElementById('long-rest-projects-container').style.display = type === 'long' ? 'block' : 'none';
    document.getElementById('rest-options-container').style.display = 'block';
    document.getElementById('rest-summary-area').style.display = 'none';
    showNotification('Select your rest options.', 'info');
}

function populateProjectDropdown() {
    const select = document.getElementById('project-selection-for-rest');
    if (!select) return; // Exit if not in long rest mode

    select.innerHTML = '<option value="">Select Project</option>'; // Default option
    if (projects.length === 0) {
        select.innerHTML = '<option value="">No Projects Available</option>';
        select.disabled = true;
        // Optionally disable the checkbox if no projects
        const projectCheckbox = document.getElementById('opt-project');
        if (projectCheckbox) projectCheckbox.disabled = true;
        return;
    } else {
        select.disabled = false;
        const projectCheckbox = document.getElementById('opt-project');
        if (projectCheckbox) projectCheckbox.disabled = false;
    }

    projects.forEach((project, index) => {
        const option = document.createElement('option');
        option.value = index; // Store index to easily retrieve the project object
        option.textContent = project.name;
        select.appendChild(option);
    });
}


function confirmRest() {
    const choices = Array.from(document.querySelectorAll('input[name="rest-choice"]:checked')).map(cb => cb.value);
    if (choices.length !== MAX_CHOICES) {
        showNotification(`Please select exactly ${MAX_CHOICES} options.`, 'error');
        return;
    }

    const tier = getTier();
    let summaryLog = [];

    choices.forEach(choice => {
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
                const armorCircles = document.querySelectorAll('#armor-tracker .circle');
                let activatedCount = 0;
                for (let i = 0; i < armorCircles.length && activatedCount < total; i++) {
                    if (!armorCircles[i].classList.contains('active')) {
                        armorCircles[i].classList.add('active');
                        activatedCount++;
                    }
                }
                resultText = `🛡️ Armor: Dice Roll (${d4Roll}) + Tier (${tier}) = <strong>${total}</strong> slots repaired.`;
            } else if (choice === 'prepare') {
                const hopeCircles = document.querySelectorAll('#hope-tracker .circle');
                let gainedHope = false;
                for (const circle of hopeCircles) {
                    if (!circle.classList.contains('active')) {
                        circle.classList.add('active');
                        gainedHope = true;
                        break;
                    }
                }
                resultText = `✨ Prepared: <strong>Gained Hope.</strong>`;
            }
            summaryLog.push(`<li>${resultText}</li>`);
        } else { // Long Rest
            if (choice === 'wounds') {
                window.hpCircles.forEach(c => c.active = false);
                window.saveHPState();
                window.renderHPCircles();
                summaryLog.push('<li>🩹 HP: <strong>All HP</strong> cleared.</li>');
            } else if (choice === 'stress') {
                window.stressCircles.forEach(c => c.active = false);
                window.saveStressState();
                window.renderStressCircles();
                summaryLog.push('<li>😌 Stress: <strong>All Stress</strong> cleared.</li>');
            } else if (choice === 'armor') {
                document.querySelectorAll('#armor-tracker .circle').forEach(slot => slot.classList.add('active'));
                summaryLog.push('<li>🛡️ Armor: <strong>All armor slots</strong> repaired.</li>');
            } else if (choice === 'prepare') {
                const hopeCircles = document.querySelectorAll('#hope-tracker .circle');
                let gainedHope = false;
                for (const circle of hopeCircles) {
                    if (!circle.classList.contains('active')) {
                        circle.classList.add('active');
                        gainedHope = true;
                        break;
                    }
                }
                summaryLog.push(`<li>✨ Prepared: <strong>Gained Hope.</strong></li>`);
            } else if (choice === 'project') {
                const projectSelect = document.getElementById('project-selection-for-rest');
                const selectedProjectIndex = projectSelect.value;

                if (selectedProjectIndex === "" || projects.length === 0) {
                    showNotification('Please select a project to advance, or uncheck the project option.', 'error');
                    // Prevent rest confirmation if project option is checked but no project is selected
                    document.querySelector('#rest-options-container .button:nth-of-type(1)').style.display = 'inline-block';
                    document.querySelector('#rest-options-container .button:nth-of-type(2)').style.display = 'inline-block';
                    return;
                }

                const project = projects[selectedProjectIndex];
                if (project.progress < project.segments) {
                    project.progress++; // Advance progress by one segment
                    saveProjects(); // Save the updated project progress
                    const projectName = project.name;
                    const newProgress = `${project.progress}/${project.segments}`;
                    summaryLog.push(`<li>🛠️ Project: Advanced "<strong>${projectName}</strong>" to <strong>${newProgress}</strong>.</li>`);
                    // Call renderProjects to update the visual representation immediately
                    renderProjects();
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
                    summaryLog.push(`<li>🛠️ Project: "<strong>${project.name}</strong>" is already completed.</li>`);
                    showNotification(`Project "${project.name}" is already completed!`, 'info');
                }
            }
        }
    });

    const summaryList = document.getElementById('rest-summary-list');
    summaryList.innerHTML = summaryLog.join('');
    document.getElementById('rest-summary-area').style.display = 'block';

    document.getElementById('rest-options-list').style.display = 'none';
    document.getElementById('long-rest-projects-container').style.display = 'none';
    document.getElementById('gm-notification').style.display = 'none';
    
    // Hide confirm and cancel buttons while summary is displayed
    document.querySelector('#rest-options-container .button:nth-of-type(1)').style.display = 'none'; // Confirm button
    document.querySelector('#rest-options-container .button:nth-of-type(2)').style.display = 'none'; // Cancel button

    showNotification('Review your rest results below, then click "Okay" to acknowledge.', 'success');

    // Save the rest summary to the journal (if there are other rest choices besides just project)
    // Only save if there's actual content beyond just the project log if project was selected
    const restSummaryTitle = `${currentRestType.charAt(0).toUpperCase() + currentRestType.slice(1)} Rest Summary`;
    const restSummaryContent = `<h4>Rest Outcomes:</h4><ul>${summaryLog.join('')}</ul>`;

    // Only add a journal entry for the rest summary if it's not empty, and if the project entry wasn't the sole entry.
    // The explicit project advancement entry is handled above if project was chosen.
    const isProjectOnlyChoice = choices.length === 1 && choices[0] === 'project';

    if (summaryLog.length > 0 && !isProjectOnlyChoice) {
        if (window.addJournalEntry) {
            window.addJournalEntry(restSummaryTitle, restSummaryContent, 'downtime', true);
        }
    }
}

function acknowledgeRest() {
    resetDowntimeView();
}


// Resets the UI of the downtime tab
function resetDowntimeView() {
    document.getElementById('rest-options-container').style.display = 'none';
    document.getElementById('rest-summary-area').style.display = 'none';
    document.getElementById('downtime-notification-area').style.display = 'none';
    document.getElementById('rest-type-selector').style.display = 'block';

    document.getElementById('rest-options-list').style.display = 'flex';
    document.getElementById('gm-notification').style.display = 'block';
    
    // Show confirm and cancel buttons again
    document.querySelector('#rest-options-container .button:nth-of-type(1)').style.display = 'inline-block';
    document.querySelector('#rest-options-container .button:nth-of-type(2)').style.display = 'inline-block';


    currentRestType = '';

    document.querySelectorAll('input[name="rest-choice"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    // Ensure projects are rendered if they were hidden by a rest cycle
    renderProjects();
}


// --- PROJECT MANAGEMENT LOGIC ---
let projects = JSON.parse(localStorage.getItem('zevi-projects')) || [];


function saveProjects() {
    localStorage.setItem('zevi-projects', JSON.stringify(projects));
}


function renderProjects() {
    const projectListDiv = document.getElementById('project-list');
    projectListDiv.innerHTML = '';
    if (projects.length === 0) {
        projectListDiv.innerHTML = '<p style="text-align: center; opacity: 0.7;">No long-term projects yet. Click "＋ New Project" to add one!</p>';
        return;
    }

    projects.forEach((project, index) => {
        const projectItem = document.createElement('div');
        projectItem.className = 'project-item';
        projectItem.innerHTML = `
            <div class="project-header">
                <div class="project-info">
                    <input type="text" value="${project.name}" onchange="window.updateProjectName(${index}, this.value)">
                </div>
                <button class="delete-project-btn" onclick="window.deleteProject(${index})">✕</button>
            </div>
            <div class="progress-clock">
                ${Array.from({ length: project.segments }).map((_, i) => `
                    <div
                        class="progress-segment ${i < project.progress ? 'active' : ''}"
                        onclick="window.updateProjectProgress(${index}, ${i + 1})"
                    ></div>
                `).join('')}
            </div>
        `;
        projectListDiv.appendChild(projectItem);
    });
    populateProjectDropdown(); // Re-populate dropdown when projects change
}


function updateProjectName(index, newName) {
    projects[index].name = newName;
    saveProjects();
    showNotification('Project name updated!', 'success');
    populateProjectDropdown(); // Update dropdown if project name changes
}


function updateProjectProgress(index, segment) {
    const project = projects[index];
    const oldProgress = project.progress;
    if (segment === oldProgress && segment > 0) {
        project.progress = segment - 1; // Unfill a segment
    } else {
        project.progress = segment; // Fill up to this segment
    }
    saveProjects();
    renderProjects();
    if (project.progress === project.segments && oldProgress < project.segments) { // Only trigger if just completed
        showNotification(`Project "${project.name}" completed!`, 'success');
        if (window.addJournalEntry) {
            window.addJournalEntry(
                `Project Completed: ${project.name}`,
                `The long-term project "${project.name}" has been successfully completed!`,
                'downtime',
                true
            );
        }
    } else if (project.progress !== project.segments && oldProgress === project.segments) {
        // If a completed project is now un-completed
        showNotification(`Project "${project.name}" is no longer completed.`, 'info');
    }
     // Journal entry for any manual progress change outside of rest confirmation
     // This prevents duplicate entries if it's already logged by confirmRest
    const optProjectCheckbox = document.getElementById('opt-project');
    const isPartOfRestConfirm = optProjectCheckbox && optProjectCheckbox.checked && currentRestType === 'long';

    if (window.addJournalEntry && !isPartOfRestConfirm) {
        window.addJournalEntry(
            `Project Progress: ${project.name}`,
            `Manually advanced "${project.name}" to ${project.progress}/${project.segments}.`,
            'downtime',
            false // Not auto-generated by a rest action, but manual click
        );
    }
}


function deleteProject(index) {
    if (confirm(`Are you sure you want to delete project "${projects[index].name}"?`)) {
        projects.splice(index, 1);
        saveProjects();
        renderProjects();
        showNotification('Project deleted!', 'success');
    }
}


function showProjectModal() {
    document.getElementById('project-name-input').value = '';
    document.getElementById('project-segments-input').value = '4';
    document.getElementById('project-modal').style.display = 'flex';
}


function closeProjectModal() {
    document.getElementById('project-modal').style.display = 'none';
}


function createProject() {
    const nameInput = document.getElementById('project-name-input');
    const segmentsInput = document.getElementById('project-segments-input');
    const projectName = nameInput.value.trim();
    const projectSegments = parseInt(segmentsInput.value);

    if (!projectName) {
        showNotification('Project name cannot be empty.', 'error');
        return;
    }
    if (isNaN(projectSegments) || projectSegments < 1 || projectSegments > 12) {
        showNotification('Segments must be a number between 1 and 12.', 'error');
        return;
    }

    projects.push({
        id: Date.now(), // Give new projects an ID
        name: projectName,
        segments: projectSegments,
        progress: 0
    });
    saveProjects();
    renderProjects(); // This will also re-populate the dropdown
    closeProjectModal();
    showNotification(`Project "${projectName}" created!`, 'success');
}


// Event Listeners for the Project Modal within downtime.js
document.addEventListener('DOMContentLoaded', () => {
    // Only add listeners if the elements exist (i.e., we are on the downtime tab)
    const addProjectBtn = document.getElementById('add-project-btn');
    if (addProjectBtn) {
        addProjectBtn.addEventListener('click', showProjectModal);
    }

    const projectModal = document.getElementById('project-modal');
    if (projectModal) {
        projectModal.addEventListener('click', (e) => {
            if (e.target.id === 'project-modal') {
                closeProjectModal();
            }
        });
    }

    const projectNameInput = document.getElementById('project-name-input');
    if (projectNameInput) {
        projectNameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                createProject();
            }
        });
    }

    // Close modal on Escape key if it's open
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && projectModal && projectModal.style.display === 'flex') {
            closeProjectModal();
        }
    });

    // Initial render of projects when downtime.js loads (might be before tab is visible)
    renderProjects();
});


// Expose functions to the global scope for access from HTML and script.js
window.startRest = startRest;
window.confirmRest = confirmRest;
window.acknowledgeRest = acknowledgeRest;
window.resetDowntimeView = resetDowntimeView;
window.showProjectModal = showProjectModal;
window.closeProjectModal = closeProjectModal;
window.createProject = createProject;
window.updateProjectName = updateProjectName; // For inline onchange in project items
window.updateProjectProgress = updateProjectProgress; // For inline onclick in project segments
window.deleteProject = deleteProject; // For inline onclick on delete button
window.showNotification = showNotification; // Used by both downtime and project logic, exposed
