// experiences.js - Experiences tab functionality

console.log('📚 Experiences.js loaded successfully!');

// Simple render function that creates basic content
function renderExperiences() {
    console.log('renderExperiences called');
    const experiencesContainer = document.getElementById('experiences-list-container');
    
    if (!experiencesContainer) {
        console.error('Experiences container not found');
        return;
    }
    
    experiencesContainer.innerHTML = `
        <div class="experiences-placeholder">
            <h4>Your Experiences</h4>
            <p>Experience tracking functionality is being restored...</p>
            <div class="experience-categories">
                <div class="category">
                    <h5>Skills & Abilities</h5>
                    <p>No skill experiences recorded yet.</p>
                </div>
                <div class="category">
                    <h5>Adventures & Quests</h5>
                    <p>No adventure experiences recorded yet.</p>
                </div>
                <div class="category">
                    <h5>Social Encounters</h5>
                    <p>No social experiences recorded yet.</p>
                </div>
            </div>
        </div>
    `;
    console.log('✅ Experiences placeholder rendered');
}

// Export the function
window.renderExperiences = renderExperiences;

console.log('📚 Experiences module ready');
