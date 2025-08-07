// --- JOURNAL LOGIC ---
window.window.journalEntries = [];
let currentFilterCategory = 'all'; // Default filter category

function loadJournalEntries() {
    // Load from localStorage
    // Initialize empty - will be populated when character loads from cloud
window.journalEntries = [];
}

function saveJournalEntries() {
    // Save to localStorage
    // Trigger auto-save instead of localStorage
  if (window.app?.characterData?.constructor?.saveCharacterData) {
    window.app.characterData.constructor.saveCharacterData();
  }
}

function renderJournalEntries() {
    // Load entries first
    loadJournalEntries();
    
    const journalListDiv = document.getElementById('journal-entries-list');
    const journalDetailDiv = document.getElementById('journal-entry-detail');
    const addEntryButton = document.querySelector('#journal-tab-content > .button');
    const categoryButtons = document.querySelector('.journal-category-buttons');

    // Ensure list and controls are visible, and detail is hidden when rendering the main list
    if (journalListDiv) journalListDiv.style.display = 'block';
    if (journalDetailDiv) journalDetailDiv.style.display = 'none';
    if (addEntryButton) addEntryButton.style.display = 'inline-block';
    if (categoryButtons) categoryButtons.style.display = 'flex';

    journalListDiv.innerHTML = '';

    const filteredEntries = window.journalEntries.filter(entry => {
        if (currentFilterCategory === 'all') {
            return true;
        }
        return entry.category === currentFilterCategory;
    }).sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date, most recent first

    if (filteredEntries.length === 0) {
        journalListDiv.innerHTML = '<p class="no-entries-message">No journal entries for this category yet.</p>';
        return;
    }

    filteredEntries.forEach((entry, index) => {
        const entryItem = document.createElement('div');
        entryItem.className = 'journal-entry-item';
        // Using data-id to link to the original index in the unfiltered array
        // This is safer if we modify the filtered array later (e.g., sorting, deleting)
        const originalIndex = window.journalEntries.findIndex(e => e.id === entry.id);
        entryItem.setAttribute('data-index', originalIndex);

        // Safely display content, stripping HTML for the preview
        const previewContent = typeof entry.content === 'string'
            ? entry.content.replace(/<[^>]*>?/gm, '').substring(0, 100)
            : 'Click for details...'; // Fallback for complex content

        entryItem.innerHTML = `
            <h4>${entry.title}</h4>
            <p>${previewContent}${typeof entry.content === 'string' && entry.content.length > 100 ? '...' : ''}</p>
            <div class="entry-meta">
                <span>${new Date(entry.date).toLocaleDateString()}</span>
                <span>Category: ${entry.category.charAt(0).toUpperCase() + entry.category.slice(1)}</span>
            </div>
        `;
        entryItem.addEventListener('click', () => showJournalEntryDetail(originalIndex));
        journalListDiv.appendChild(entryItem);
    });
}

function showJournalEntryDetail(index) {
    const entry = window.journalEntries[index];
    if (!entry) return;

    document.getElementById('journal-detail-title').textContent = entry.title;
    document.getElementById('journal-detail-date').textContent = new Date(entry.date).toLocaleDateString();
    document.getElementById('journal-detail-category').textContent = `Category: ${entry.category.charAt(0).toUpperCase() + entry.category.slice(1)}`;

    // Use innerHTML for rich content, but be cautious with user-generated content
    document.getElementById('journal-detail-content').innerHTML = entry.content;

    document.getElementById('journal-entries-list').style.display = 'none';
    document.querySelector('.journal-category-buttons').style.display = 'none';
    document.querySelector('#journal-tab-content > .button').style.display = 'none'; // Hide "Add New Entry" button
    document.getElementById('journal-entry-detail').style.display = 'block';
}

function closeJournalDetail() {
    document.getElementById('journal-entry-detail').style.display = 'none';
    document.getElementById('journal-entries-list').style.display = 'block';
    document.querySelector('.journal-category-buttons').style.display = 'flex';
    document.querySelector('#journal-tab-content > .button').style.display = 'inline-block'; // Show "Add New Entry" button
    renderJournalEntries(); // Re-render to ensure current filter is applied
}

function showJournalEntryModal() {
    document.getElementById('journal-entry-title-input').value = '';
    document.getElementById('journal-entry-category-select').value = 'other';
    document.getElementById('journal-entry-content-input').value = '';
    document.getElementById('journal-entry-modal').style.display = 'flex';
}

function closeJournalEntryModal() {
    document.getElementById('journal-entry-modal').style.display = 'none';
}

/**
 * Adds a new entry to the journal.
 * @param {string} title - The title of the journal entry.
 * @param {string} content - The main content of the entry (can contain HTML for experiences).
 * @param {string} category - The category of the entry (e.g., 'downtime', 'combat', 'other').
 * @param {boolean} [isAutoGenerated=false] - True if the entry was generated by the system (e.g., from experiences.js), false otherwise.
 */
function addJournalEntry(title, content, category, isAutoGenerated = false) {
    const newEntry = {
        id: Date.now(), // Unique ID for each entry
        title: title,
        content: content,
        category: category,
        date: new Date().toISOString(), // Store as ISO string for easy sorting
        isAutoGenerated: isAutoGenerated // To distinguish from manual entries if needed
    };
    window.journalEntries.push(newEntry);
    saveJournalEntries();
    // Only re-render if the journal tab is currently active or if it's not an auto-generated entry
    // to avoid unnecessary re-renders when experiences are added in the background.
    if (!isAutoGenerated || document.getElementById('journal-tab-content').classList.contains('active')) {
        renderJournalEntries();
    }
    if (!isAutoGenerated && window.showNotification) {
        // Only show notification for manually added entries
        window.showNotification('Journal entry saved!', 'success');
    }
}

function saveJournalEntry() {
    const titleInput = document.getElementById('journal-entry-title-input');
    const categorySelect = document.getElementById('journal-entry-category-select');
    const contentInput = document.getElementById('journal-entry-content-input');

    const title = titleInput.value.trim();
    const category = categorySelect.value;
    const content = contentInput.value.trim();

    if (!title || !content) {
        if (window.showNotification) window.showNotification('Title and content cannot be empty.', 'error');
        return;
    }

    addJournalEntry(title, content, category);
    closeJournalEntryModal();
}

function filterJournalEntries(category) {
    currentFilterCategory = category;
    document.querySelectorAll('.journal-category-buttons .button').forEach(button => {
        if (button.dataset.journalCategory === category) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
    renderJournalEntries();
}

// Initial render and event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Check if the journal tab is the active one on load, if so, render entries
    if (document.getElementById('journal-tab-content').classList.contains('active')) {
        renderJournalEntries();
    }

    // Event listener for category filter buttons
    document.querySelectorAll('.journal-category-buttons .button').forEach(button => {
        button.addEventListener('click', () => {
            filterJournalEntries(button.dataset.journalCategory);
        });
    });

    // Close journal entry modal on overlay click
    const journalEntryModal = document.getElementById('journal-entry-modal');
    if (journalEntryModal) {
        journalEntryModal.addEventListener('click', (e) => {
            if (e.target.id === 'journal-entry-modal') {
                closeJournalEntryModal();
            }
        });
    }

    // Close modal on Escape key if it's open
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && journalEntryModal && journalEntryModal.style.display === 'flex') {
            closeJournalEntryModal();
        }
    });
});


// Expose functions to global scope
window.showJournalEntryModal = showJournalEntryModal;
window.closeJournalEntryModal = closeJournalEntryModal;
window.saveJournalEntry = saveJournalEntry;
window.addJournalEntry = addJournalEntry; // Expose for experiences.js to use
window.closeJournalDetail = closeJournalDetail;
window.filterJournalEntries = filterJournalEntries; // Expose for category buttons
