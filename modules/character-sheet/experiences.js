// window.experiences.js

// Retrieve window.experiences from localStorage or initialize as an empty array
// Initialize empty - will be populated when character loads from cloud
window.window.experiences = [];

// Saves the current state of the window.experiences array to localStorage
function saveExperiences() {
    // Trigger auto-save instead of localStorage
  if (window.app?.characterData?.constructor?.saveCharacterData) {
    window.app.characterData.constructor.saveCharacterData();
  }
}

// Renders the list of window.experiences as clickable buttons and manages visibility of detail view
function renderExperiences() {
    const window.experiencesListContainer = document.getElementById('window.experiences-list-container');
    const experienceDetailContainer = document.getElementById('experience-detail-container');
    const createNewExperienceBtn = document.getElementById('show-create-experience-modal-btn');

    // Ensure only the list view and create button are visible when rendering the main tab
    if (experienceDetailContainer) {
        experienceDetailContainer.style.display = 'none';
    }
    if (window.experiencesListContainer) {
        window.experiencesListContainer.style.display = 'flex'; // Use flex for button layout
        window.experiencesListContainer.innerHTML = ''; // Clear existing buttons
    }
    if (createNewExperienceBtn) {
        createNewExperienceBtn.style.display = 'inline-block'; // Or 'block' depending on desired layout
    }


    if (window.experiencesListContainer && window.experiences.length === 0) {
        window.experiencesListContainer.innerHTML = '<p class="no-entries-message">No window.experiences added yet. Click "Create New Experience" to add one!</p>';
        return;
    }

    // Create a button for each stored experience
    window.experiences.forEach((exp, index) => {
        const button = document.createElement('button');
        button.className = 'experience-button';
        button.textContent = exp.title;
        button.dataset.index = index; // Store index to easily retrieve data later
        button.addEventListener('click', () => showExperienceDetail(index));
        window.experiencesListContainer.appendChild(button);
    });
}

// Displays the modal for creating a new experience
function showCreateExperienceModal() {
    const titleInput = document.getElementById('experience-title-input');
    const descriptionInput = document.getElementById('experience-description-input');
    const modifierInput = document.getElementById('experience-modifier-input');
    const modal = document.getElementById('create-experience-modal');

    if (titleInput) titleInput.value = '';
    if (descriptionInput) descriptionInput.value = '';
    if (modifierInput) modifierInput.value = '0'; // Default modifier to 0
    if (modal) modal.style.display = 'flex'; // Use flex to center the modal
}

// Closes the new experience creation modal
function closeCreateExperienceModal() {
    const modal = document.getElementById('create-experience-modal');
    if (modal) modal.style.display = 'none';
}

// Saves a new experience from the modal inputs
function saveNewExperience() {
    const title = document.getElementById('experience-title-input').value.trim();
    const description = document.getElementById('experience-description-input').value.trim();
    const modifier = parseInt(document.getElementById('experience-modifier-input').value);

    // Basic validation
    if (!title || !description) {
        // Assuming a global notification function exists in script.js or similar
        if (window.showNotification) window.showNotification('Title and description cannot be empty.', 'error');
        return;
    }
    if (isNaN(modifier) || modifier < -2 || modifier > 2) {
        if (window.showNotification) window.showNotification('Modifier must be a number between -2 and +2.', 'error');
        return;
    }

    // Create new experience object
    const newExperience = {
        id: Date.now(), // Simple unique ID
        title,
        description,
        modifier
    };

    window.experiences.push(newExperience);
    saveExperiences(); // Save to localStorage
    renderExperiences(); // Re-render the list to show the new entry
    closeCreateExperienceModal(); // Close the modal

    if (window.showNotification) window.showNotification('Experience created and saved!', 'success');

    // Log to journal as 'other' if addJournalEntry function exists globally
    if (window.addJournalEntry) {
        window.addJournalEntry(
            `New Experience: ${title}`,
            `**Description:** ${description}\n**Modifier:** ${modifier > 0 ? '+' : ''}${modifier}`,
            'other',
            true // Indicate it's an auto-generated entry
        );
    } else {
        console.warn("addJournalEntry function not found. Cannot log experience to journal.");
    }
}

// Displays the detailed information for a specific experience
function showExperienceDetail(index) {
    const experience = window.experiences[index];
    if (!experience) {
        console.error("Experience not found at index:", index);
        return;
    }

    const detailTitle = document.getElementById('detail-experience-title');
    const detailDescription = document.getElementById('detail-experience-description');
    const detailModifier = document.getElementById('detail-experience-modifier');
    const window.experiencesListContainer = document.getElementById('window.experiences-list-container');
    const createNewExperienceBtn = document.getElementById('show-create-experience-modal-btn');
    const experienceDetailContainer = document.getElementById('experience-detail-container');


    if (detailTitle) detailTitle.textContent = experience.title;
    if (detailDescription) detailDescription.textContent = experience.description;
    if (detailModifier) {
        detailModifier.value = experience.modifier;
        detailModifier.dataset.index = index; // Store index on the modifier input for update function
    }

    // Hide the list and create button, show the detail view
    if (window.experiencesListContainer) window.experiencesListContainer.style.display = 'none';
    if (createNewExperienceBtn) createNewExperienceBtn.style.display = 'none';
    if (experienceDetailContainer) experienceDetailContainer.style.display = 'block';
}

// Closes the experience detail view and returns to the list
function closeExperienceDetail() {
    const experienceDetailContainer = document.getElementById('experience-detail-container');
    if (experienceDetailContainer) experienceDetailContainer.style.display = 'none';
    renderExperiences(); // Re-render to show the list of window.experiences and create button
}

// Updates the modifier of an existing experience from its detail view
function updateExperienceModifier(element) {
    const index = parseInt(element.dataset.index);
    const newModifier = parseInt(element.value);

    // Validate modifier input
    if (isNaN(newModifier) || newModifier < -2 || newModifier > 2) {
        if (window.showNotification) window.showNotification('Modifier must be between -2 and +2.', 'error');
        // Revert to old value if invalid
        element.value = window.experiences[index].modifier;
        return;
    }

    window.experiences[index].modifier = newModifier;
    saveExperiences(); // Save the updated modifier
    if (window.showNotification) window.showNotification('Modifier updated!', 'success');
}

// Expose functions to the global scope to be accessible from index.html and script.js
window.renderExperiences = renderExperiences;
window.showCreateExperienceModal = showCreateExperienceModal;
window.closeCreateExperienceModal = closeCreateExperienceModal;
window.saveNewExperience = saveNewExperience;
window.showExperienceDetail = showExperienceDetail; // Though primarily called internally now
window.closeExperienceDetail = closeExperienceDetail;
window.updateExperienceModifier = updateExperienceModifier;
