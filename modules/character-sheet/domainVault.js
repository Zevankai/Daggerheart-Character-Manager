// domainVault.js - Domain Vault tab functionality

// Retrieve domain vault data from localStorage or initialize with defaults
let domainVaultData = JSON.parse(localStorage.getItem('zevi-domain-vault')) || {
    cards: [],
    equippedCards: [null, null, null, null, null] // 5 equipped slots
};

// Card types available for selection
const CARD_TYPES = ['grimoire', 'ability', 'spell'];

// Default card colors
const DEFAULT_COLORS = [
    '#3498db', // Blue
    '#e74c3c', // Red
    '#2ecc71', // Green
    '#f39c12', // Orange
    '#9b59b6', // Purple
    '#1abc9c', // Teal
    '#e67e22', // Dark Orange
    '#34495e'  // Dark Gray
];

// Save domain vault data to localStorage
function saveDomainVaultData() {
    localStorage.setItem('zevi-domain-vault', JSON.stringify(domainVaultData));
}

// Generate unique ID for cards
function generateCardId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}

// Get domain names from the header
function getDomainNames() {
    const domainBadges = document.querySelectorAll('.domain-badge');
    return {
        domain1: domainBadges[0]?.textContent.trim() || 'Domain 1',
        domain2: domainBadges[1]?.textContent.trim() || 'Domain 2'
    };
}

// Initialize Domain Vault tab
function initializeDomainVault() {
    console.log('Initializing Domain Vault...');
    const domainVaultContent = document.getElementById('domain-vault-tab-content');
    if (!domainVaultContent) {
        console.warn('Domain Vault tab content not found');
        return;
    }
    
    // Only initialize if not already initialized
    if (!domainVaultContent.querySelector('.domain-vault-container')) {
        renderDomainVault();
        setupEventListeners();
        console.log('Domain Vault initialized successfully');
    } else {
        console.log('Domain Vault already initialized');
    }
}

// Render the complete Domain Vault interface
function renderDomainVault() {
    const domainVaultContent = document.getElementById('domain-vault-tab-content');
    if (!domainVaultContent) return;

    const domains = getDomainNames();
    
    domainVaultContent.innerHTML = `
        <div class="domain-vault-container">
            <!-- Domain Header -->
            <div class="domain-header">
                <h2>Domain Vault</h2>
                <div class="domain-display">
                    <span class="domain-name">${domains.domain1}</span>
                    <span class="domain-separator">||</span>
                    <span class="domain-name">${domains.domain2}</span>
                </div>
            </div>

            <!-- Equipped Cards Section -->
            <div class="equipped-cards-section">
                <h3>Equipped Cards</h3>
                <div class="equipped-slots" id="equipped-slots">
                    ${renderEquippedSlots()}
                </div>
            </div>

            <!-- Card Management Section -->
            <div class="card-management-section">
                <div class="card-management-header">
                    <h3>Card Collection</h3>
                    <button class="button primary-btn" id="create-card-btn">Create New Card</button>
                </div>
                <div class="cards-grid" id="cards-grid">
                    ${renderCards()}
                </div>
            </div>
        </div>

        <!-- Create Card Modal -->
        <div id="create-card-modal" class="domain-vault-modal-overlay" style="display: none;">
            <div class="modal">
                <div class="modal-header">
                    <h3>Create New Card</h3>
                    <button type="button" class="modal-close-btn" onclick="closeCreateCardModal()">×</button>
                </div>
                <div class="modal-content">
                    <div class="form-group">
                        <label for="card-name">Card Name</label>
                        <input type="text" id="card-name" placeholder="Enter card name">
                    </div>
                    <div class="form-group">
                        <label for="card-description">Description</label>
                        <textarea id="card-description" placeholder="Describe the card's effect or ability" rows="3"></textarea>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="card-domain">Primary Domain</label>
                            <select id="card-domain">
                                <option value="${domains.domain1}">${domains.domain1}</option>
                                <option value="${domains.domain2}">${domains.domain2}</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="card-level">Level</label>
                            <input type="number" id="card-level" min="1" max="10" value="1">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="card-recall-cost">Recall Cost</label>
                            <input type="number" id="card-recall-cost" min="0" max="10" value="1">
                        </div>
                        <div class="form-group">
                            <label for="card-type">Card Type</label>
                            <select id="card-type">
                                ${CARD_TYPES.map(type => `<option value="${type}">${type.charAt(0).toUpperCase() + type.slice(1)}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Card Color</label>
                        <div class="color-picker-grid">
                            ${DEFAULT_COLORS.map((color, index) => `
                                <button type="button" class="color-option ${index === 0 ? 'selected' : ''}" 
                                        data-color="${color}" style="background-color: ${color}"></button>
                            `).join('')}
                        </div>
                    </div>
                </div>
                <div class="modal-buttons">
                    <button class="button primary-btn" onclick="saveNewCard()">Create Card</button>
                    <button class="button" onclick="closeCreateCardModal()">Cancel</button>
                </div>
            </div>
        </div>

        <!-- Edit Card Modal -->
        <div id="edit-card-modal" class="domain-vault-modal-overlay" style="display: none;">
            <div class="modal">
                <div class="modal-header">
                    <h3>Edit Card</h3>
                    <button type="button" class="modal-close-btn" onclick="closeEditCardModal()">×</button>
                </div>
                <div class="modal-content">
                    <!-- Same form structure as create modal -->
                    <div class="form-group">
                        <label for="edit-card-name">Card Name</label>
                        <input type="text" id="edit-card-name" placeholder="Enter card name">
                    </div>
                    <div class="form-group">
                        <label for="edit-card-description">Description</label>
                        <textarea id="edit-card-description" placeholder="Describe the card's effect or ability" rows="3"></textarea>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="edit-card-domain">Primary Domain</label>
                            <select id="edit-card-domain">
                                <option value="${domains.domain1}">${domains.domain1}</option>
                                <option value="${domains.domain2}">${domains.domain2}</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="edit-card-level">Level</label>
                            <input type="number" id="edit-card-level" min="1" max="10" value="1">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="edit-card-recall-cost">Recall Cost</label>
                            <input type="number" id="edit-card-recall-cost" min="0" max="10" value="1">
                        </div>
                        <div class="form-group">
                            <label for="edit-card-type">Card Type</label>
                            <select id="edit-card-type">
                                ${CARD_TYPES.map(type => `<option value="${type}">${type.charAt(0).toUpperCase() + type.slice(1)}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Card Color</label>
                        <div class="color-picker-grid" id="edit-color-picker-grid">
                            ${DEFAULT_COLORS.map(color => `
                                <button type="button" class="color-option" 
                                        data-color="${color}" style="background-color: ${color}"></button>
                            `).join('')}
                        </div>
                    </div>
                </div>
                <div class="modal-buttons">
                    <button class="button primary-btn" onclick="saveEditedCard()">Save Changes</button>
                    <button class="button danger-btn" onclick="deleteCard()">Delete Card</button>
                    <button class="button" onclick="closeEditCardModal()">Cancel</button>
                </div>
            </div>
        </div>
    `;

    // Initialize drag and drop after rendering
    initializeDragAndDrop();
}

// Render equipped card slots
function renderEquippedSlots() {
    return domainVaultData.equippedCards.map((cardId, index) => {
        const card = cardId ? domainVaultData.cards.find(c => c.id === cardId) : null;
        return `
            <div class="equipped-slot" data-slot-index="${index}">
                ${card ? renderCard(card, true) : '<div class="empty-equipped-slot">Empty Slot</div>'}
            </div>
        `;
    }).join('');
}

// Render all cards in the collection
function renderCards() {
    if (domainVaultData.cards.length === 0) {
        return '<div class="no-cards-message">No cards created yet. Click "Create New Card" to get started!</div>';
    }

    return domainVaultData.cards.map(card => {
        const isEquipped = domainVaultData.equippedCards.includes(card.id);
        return `<div class="card-wrapper ${isEquipped ? 'equipped' : ''}">${renderCard(card, false)}</div>`;
    }).join('');
}

// Render individual card
function renderCard(card, isEquipped = false) {
    return `
        <div class="domain-card ${isEquipped ? 'equipped' : ''}" 
             data-card-id="${card.id}" 
             style="border-left: 4px solid ${card.color};">
            <div class="card-header">
                <div class="card-name">${card.name}</div>
                <div class="card-type-badge card-type-${card.type}">${card.type}</div>
            </div>
            <div class="card-info">
                <div class="card-domain">${card.domain}</div>
                <div class="card-stats">
                    <span class="card-level">Lv.${card.level}</span>
                    <span class="card-recall">Cost: ${card.recallCost}</span>
                </div>
            </div>
            <div class="card-description">${card.description}</div>
            ${!isEquipped ? `
                <div class="card-actions">
                    <button class="card-action-btn edit-btn" onclick="editCard('${card.id}')">Edit</button>
                    <button class="card-action-btn equip-btn" onclick="quickEquipCard('${card.id}')">Equip</button>
                </div>
            ` : `
                <div class="card-actions">
                    <button class="card-action-btn unequip-btn" onclick="unequipCard('${card.id}')">Unequip</button>
                </div>
            `}
        </div>
    `;
}

// Initialize drag and drop functionality
function initializeDragAndDrop() {
    const cardsGrid = document.getElementById('cards-grid');
    const equippedSlots = document.getElementById('equipped-slots');

    if (cardsGrid) {
        new Sortable(cardsGrid, {
            group: {
                name: 'cards',
                pull: 'clone',
                put: false
            },
            sort: false,
            animation: 150,
            ghostClass: 'card-ghost',
            chosenClass: 'card-chosen',
            dragClass: 'card-drag'
        });
    }

    if (equippedSlots) {
        new Sortable(equippedSlots, {
            group: {
                name: 'cards',
                pull: true,
                put: true
            },
            animation: 150,
            ghostClass: 'card-ghost',
            chosenClass: 'card-chosen',
            dragClass: 'card-drag',
            onAdd: function(evt) {
                handleCardEquip(evt);
            },
            onUpdate: function(evt) {
                handleEquippedCardReorder(evt);
            },
            onRemove: function(evt) {
                handleCardUnequip(evt);
            }
        });
    }
}

// Handle card equipping via drag and drop
function handleCardEquip(evt) {
    const cardElement = evt.item;
    const cardId = cardElement.querySelector('.domain-card').dataset.cardId;
    const slotIndex = parseInt(evt.to.dataset.slotIndex || evt.newIndex);
    
    // Remove the dragged element (it's a clone)
    cardElement.remove();
    
    // Equip the card
    equipCardToSlot(cardId, slotIndex);
}

// Handle reordering of equipped cards
function handleEquippedCardReorder(evt) {
    const newOrder = Array.from(evt.to.children).map((slot, index) => {
        const cardElement = slot.querySelector('.domain-card');
        return cardElement ? cardElement.dataset.cardId : null;
    });
    
    domainVaultData.equippedCards = newOrder;
    saveDomainVaultData();
    renderEquippedSlots();
}

// Handle card unequipping via drag and drop
function handleCardUnequip(evt) {
    const cardElement = evt.item;
    const cardId = cardElement.querySelector('.domain-card').dataset.cardId;
    
    // Remove from equipped cards
    const equippedIndex = domainVaultData.equippedCards.indexOf(cardId);
    if (equippedIndex !== -1) {
        domainVaultData.equippedCards[equippedIndex] = null;
        saveDomainVaultData();
    }
    
    // Remove the dragged element
    cardElement.remove();
    
    // Re-render both sections
    document.getElementById('equipped-slots').innerHTML = renderEquippedSlots();
    document.getElementById('cards-grid').innerHTML = renderCards();
    initializeDragAndDrop();
}

// Equip card to specific slot
function equipCardToSlot(cardId, slotIndex) {
    // Check if card is already equipped
    const currentEquippedIndex = domainVaultData.equippedCards.indexOf(cardId);
    if (currentEquippedIndex !== -1) {
        // Move from current slot to new slot
        domainVaultData.equippedCards[currentEquippedIndex] = null;
    }
    
    // If slot is occupied, unequip the current card
    if (domainVaultData.equippedCards[slotIndex]) {
        domainVaultData.equippedCards[slotIndex] = null;
    }
    
    // Equip the new card
    domainVaultData.equippedCards[slotIndex] = cardId;
    saveDomainVaultData();
    
    // Re-render both sections
    document.getElementById('equipped-slots').innerHTML = renderEquippedSlots();
    document.getElementById('cards-grid').innerHTML = renderCards();
    initializeDragAndDrop();
}

// Quick equip card to first available slot
function quickEquipCard(cardId) {
    const firstEmptySlot = domainVaultData.equippedCards.findIndex(slot => slot === null);
    if (firstEmptySlot !== -1) {
        equipCardToSlot(cardId, firstEmptySlot);
    } else {
        // No empty slots, show notification
        if (window.showNotification) {
            window.showNotification('All equipment slots are full. Drag a card to replace an equipped card.', 'warning');
        }
    }
}

// Unequip card
function unequipCard(cardId) {
    const equippedIndex = domainVaultData.equippedCards.indexOf(cardId);
    if (equippedIndex !== -1) {
        domainVaultData.equippedCards[equippedIndex] = null;
        saveDomainVaultData();
        
        // Re-render both sections
        document.getElementById('equipped-slots').innerHTML = renderEquippedSlots();
        document.getElementById('cards-grid').innerHTML = renderCards();
        initializeDragAndDrop();
    }
}

// Setup event listeners
function setupEventListeners() {
    // Create card button
    const createCardBtn = document.getElementById('create-card-btn');
    if (createCardBtn) {
        // Remove any existing listeners to avoid duplicates
        createCardBtn.removeEventListener('click', showCreateCardModal);
        createCardBtn.addEventListener('click', showCreateCardModal);
    }

    // Color picker event listeners - use event delegation on the domain vault container
    const domainVaultContainer = document.querySelector('.domain-vault-container');
    if (domainVaultContainer) {
        domainVaultContainer.addEventListener('click', function(e) {
            if (e.target.classList.contains('color-option')) {
                // Remove selected class from siblings
                e.target.parentNode.querySelectorAll('.color-option').forEach(btn => {
                    btn.classList.remove('selected');
                });
                // Add selected class to clicked option
                e.target.classList.add('selected');
            }
        });
    }
}

// Show create card modal
function showCreateCardModal() {
    console.log('showCreateCardModal called');
    const modal = document.getElementById('create-card-modal');
    console.log('Modal element found:', modal);
    
    if (modal) {
        // Reset form
        const nameInput = document.getElementById('card-name');
        const descInput = document.getElementById('card-description');
        const levelInput = document.getElementById('card-level');
        const costInput = document.getElementById('card-recall-cost');
        const typeInput = document.getElementById('card-type');
        
        console.log('Form inputs found:', { nameInput, descInput, levelInput, costInput, typeInput });
        
        if (nameInput) nameInput.value = '';
        if (descInput) descInput.value = '';
        if (levelInput) levelInput.value = '1';
        if (costInput) costInput.value = '1';
        if (typeInput) typeInput.value = 'ability';
        
        // Reset color selection
        const colorOptions = document.querySelectorAll('#create-card-modal .color-option');
        console.log('Color options found:', colorOptions.length);
        colorOptions.forEach((btn, index) => {
            btn.classList.toggle('selected', index === 0);
        });
        
        console.log('Setting modal display to flex');
        modal.style.display = 'flex';
        console.log('Modal display style set to:', modal.style.display);
    } else {
        console.error('Modal element not found!');
    }
}

// Close create card modal
function closeCreateCardModal() {
    const modal = document.getElementById('create-card-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Save new card
function saveNewCard() {
    const name = document.getElementById('card-name').value.trim();
    const description = document.getElementById('card-description').value.trim();
    const domain = document.getElementById('card-domain').value;
    const level = parseInt(document.getElementById('card-level').value);
    const recallCost = parseInt(document.getElementById('card-recall-cost').value);
    const type = document.getElementById('card-type').value;
    const selectedColor = document.querySelector('#create-card-modal .color-option.selected');
    const color = selectedColor ? selectedColor.dataset.color : DEFAULT_COLORS[0];

    // Validation
    if (!name || !description) {
        if (window.showNotification) {
            window.showNotification('Name and description are required.', 'error');
        }
        return;
    }

    // Create new card
    const newCard = {
        id: generateCardId(),
        name,
        description,
        domain,
        level,
        recallCost,
        type,
        color
    };

    domainVaultData.cards.push(newCard);
    saveDomainVaultData();
    
    // Re-render cards
    document.getElementById('cards-grid').innerHTML = renderCards();
    initializeDragAndDrop();
    
    closeCreateCardModal();
    
    if (window.showNotification) {
        window.showNotification('Card created successfully!', 'success');
    }
}

let editingCardId = null;

// Edit card
function editCard(cardId) {
    const card = domainVaultData.cards.find(c => c.id === cardId);
    if (!card) return;

    editingCardId = cardId;
    
    // Populate edit form
    document.getElementById('edit-card-name').value = card.name;
    document.getElementById('edit-card-description').value = card.description;
    document.getElementById('edit-card-domain').value = card.domain;
    document.getElementById('edit-card-level').value = card.level;
    document.getElementById('edit-card-recall-cost').value = card.recallCost;
    document.getElementById('edit-card-type').value = card.type;
    
    // Set color selection
    document.querySelectorAll('#edit-card-modal .color-option').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.color === card.color);
    });
    
    // Show modal
    document.getElementById('edit-card-modal').style.display = 'flex';
}

// Close edit card modal
function closeEditCardModal() {
    document.getElementById('edit-card-modal').style.display = 'none';
    editingCardId = null;
}

// Save edited card
function saveEditedCard() {
    if (!editingCardId) return;

    const cardIndex = domainVaultData.cards.findIndex(c => c.id === editingCardId);
    if (cardIndex === -1) return;

    const name = document.getElementById('edit-card-name').value.trim();
    const description = document.getElementById('edit-card-description').value.trim();
    const domain = document.getElementById('edit-card-domain').value;
    const level = parseInt(document.getElementById('edit-card-level').value);
    const recallCost = parseInt(document.getElementById('edit-card-recall-cost').value);
    const type = document.getElementById('edit-card-type').value;
    const selectedColor = document.querySelector('#edit-card-modal .color-option.selected');
    const color = selectedColor ? selectedColor.dataset.color : DEFAULT_COLORS[0];

    // Validation
    if (!name || !description) {
        if (window.showNotification) {
            window.showNotification('Name and description are required.', 'error');
        }
        return;
    }

    // Update card
    domainVaultData.cards[cardIndex] = {
        ...domainVaultData.cards[cardIndex],
        name,
        description,
        domain,
        level,
        recallCost,
        type,
        color
    };

    saveDomainVaultData();
    
    // Re-render both sections
    document.getElementById('equipped-slots').innerHTML = renderEquippedSlots();
    document.getElementById('cards-grid').innerHTML = renderCards();
    initializeDragAndDrop();
    
    closeEditCardModal();
    
    if (window.showNotification) {
        window.showNotification('Card updated successfully!', 'success');
    }
}

// Delete card
function deleteCard() {
    if (!editingCardId) return;

    if (!confirm('Are you sure you want to delete this card? This action cannot be undone.')) {
        return;
    }

    // Remove from cards array
    domainVaultData.cards = domainVaultData.cards.filter(c => c.id !== editingCardId);
    
    // Remove from equipped cards if equipped
    const equippedIndex = domainVaultData.equippedCards.indexOf(editingCardId);
    if (equippedIndex !== -1) {
        domainVaultData.equippedCards[equippedIndex] = null;
    }

    saveDomainVaultData();
    
    // Re-render both sections
    document.getElementById('equipped-slots').innerHTML = renderEquippedSlots();
    document.getElementById('cards-grid').innerHTML = renderCards();
    initializeDragAndDrop();
    
    closeEditCardModal();
    
    if (window.showNotification) {
        window.showNotification('Card deleted successfully!', 'success');
    }
}

// Make functions globally available
window.showCreateCardModal = showCreateCardModal;
window.closeCreateCardModal = closeCreateCardModal;
window.saveNewCard = saveNewCard;
window.editCard = editCard;
window.closeEditCardModal = closeEditCardModal;
window.saveEditedCard = saveEditedCard;
window.deleteCard = deleteCard;
window.quickEquipCard = quickEquipCard;
window.unequipCard = unequipCard;
window.initializeDomainVault = initializeDomainVault;

// Domain Vault will be initialized by the main tab switching logic in script.js