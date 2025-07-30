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
    addDebugMessage('=== INITIALIZING DOMAIN VAULT ===');
    const domainVaultContent = document.getElementById('domain-vault-tab-content');
    addDebugMessage('Domain vault content element: ' + (domainVaultContent ? 'FOUND' : 'NOT FOUND'));
    
    if (!domainVaultContent) {
        addDebugMessage('ERROR: Domain Vault tab content not found');
        return;
    }
    
    addDebugMessage('Current content length: ' + domainVaultContent.innerHTML.length);
    
    // TEMPORARY: Simple test to see if function is called
    domainVaultContent.innerHTML = '<h2 style="color: green;">Domain Vault is Working!</h2><p>Function was called successfully at ' + new Date().toLocaleTimeString() + '</p><p>Debug info will appear in top-right corner.</p>';
    addDebugMessage('Set simple test content - SUCCESS!');
    
    // Only initialize if not already initialized
    // if (!domainVaultContent.querySelector('.domain-vault-container')) {
    //     console.log('Rendering Domain Vault...');
    //     try {
    //         renderDomainVault();
    //         setupEventListeners();
    //         console.log('Domain Vault initialized successfully');
    //     } catch (error) {
    //         console.error('Error initializing Domain Vault:', error);
    //     }
    // } else {
    //     console.log('Domain Vault already initialized');
    // }
}

// Render the complete Domain Vault interface
function renderDomainVault() {
    console.log('renderDomainVault called');
    const domainVaultContent = document.getElementById('domain-vault-tab-content');
    if (!domainVaultContent) {
        console.error('Domain vault content element not found');
        return;
    }

    console.log('About to get domain names...');
    const domains = getDomainNames();
    console.log('Domains found:', domains);
    
    console.log('About to set innerHTML...');
    
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
                    <button class="button" onclick="window.testSimpleModal()" style="margin-left: 10px;">Test Modal</button>
                </div>
                <div class="cards-grid" id="cards-grid">
                    ${renderCards()}
                </div>
            </div>
        </div>

        <!-- Create Card Modal -->
        <div id="create-card-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 10000; align-items: center; justify-content: center;">
            <div style="background: white; color: black; padding: 20px; border-radius: 8px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #ccc; padding-bottom: 10px;">
                    <h3 style="margin: 0; color: black;">Create New Card</h3>
                    <button type="button" onclick="closeCreateCardModal()" style="background: none; border: none; font-size: 20px; cursor: pointer; color: black;">×</button>
                </div>
                <div>
                    <div style="margin-bottom: 15px;">
                        <label for="card-name" style="display: block; margin-bottom: 5px; font-weight: bold; color: black;">Card Name</label>
                        <input type="text" id="card-name" placeholder="Enter card name" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label for="card-description" style="display: block; margin-bottom: 5px; font-weight: bold; color: black;">Description</label>
                        <textarea id="card-description" placeholder="Describe the card's effect or ability" rows="3" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"></textarea>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                        <div>
                            <label for="card-domain" style="display: block; margin-bottom: 5px; font-weight: bold; color: black;">Primary Domain</label>
                            <select id="card-domain" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                                <option value="${domains.domain1}">${domains.domain1}</option>
                                <option value="${domains.domain2}">${domains.domain2}</option>
                            </select>
                        </div>
                        <div>
                            <label for="card-level" style="display: block; margin-bottom: 5px; font-weight: bold; color: black;">Level</label>
                            <input type="number" id="card-level" min="1" max="10" value="1" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                        <div>
                            <label for="card-recall-cost" style="display: block; margin-bottom: 5px; font-weight: bold; color: black;">Recall Cost</label>
                            <input type="number" id="card-recall-cost" min="0" max="10" value="1" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                        </div>
                        <div>
                            <label for="card-type" style="display: block; margin-bottom: 5px; font-weight: bold; color: black;">Card Type</label>
                            <select id="card-type" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                                ${CARD_TYPES.map(type => `<option value="${type}">${type.charAt(0).toUpperCase() + type.slice(1)}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: black;">Card Color</label>
                        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; max-width: 200px;">
                            ${DEFAULT_COLORS.map((color, index) => `
                                <button type="button" class="color-option ${index === 0 ? 'selected' : ''}" 
                                        data-color="${color}" style="width: 40px; height: 40px; border: 2px solid ${index === 0 ? '#ffd700' : 'transparent'}; border-radius: 8px; cursor: pointer; background-color: ${color}"></button>
                            `).join('')}
                        </div>
                    </div>
                </div>
                <div style="display: flex; gap: 10px; justify-content: flex-end; padding-top: 15px; border-top: 1px solid #ccc;">
                    <button onclick="saveNewCard()" style="background: #ffd700; color: black; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-weight: bold;">Create Card</button>
                    <button onclick="closeCreateCardModal()" style="background: #ccc; color: black; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">Cancel</button>
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

    console.log('Domain Vault HTML rendered');
    
    // Check if modal was created
    const modal = document.getElementById('create-card-modal');
    console.log('Modal created successfully:', !!modal);

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

// Test function to create a simple modal
function testSimpleModal() {
    console.log('Testing simple modal...');
    
    // Remove any existing test modal
    const existingTest = document.getElementById('test-modal');
    if (existingTest) existingTest.remove();
    
    // Create a simple test modal
    const testModal = document.createElement('div');
    testModal.id = 'test-modal';
    testModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    const testContent = document.createElement('div');
    testContent.style.cssText = `
        background: white;
        padding: 20px;
        border-radius: 8px;
        color: black;
        max-width: 400px;
    `;
    testContent.innerHTML = `
        <h3>Test Modal</h3>
        <p>If you can see this, basic modal functionality works!</p>
        <button onclick="document.getElementById('test-modal').remove()">Close</button>
    `;
    
    testModal.appendChild(testContent);
    document.body.appendChild(testModal);
    
    console.log('Test modal created and added to body');
}

// Show create card modal
function showCreateCardModal() {
    console.log('=== CREATE CARD MODAL DEBUG ===');
    console.log('showCreateCardModal called');
    
    // Check if Domain Vault is initialized
    const domainVaultContainer = document.querySelector('.domain-vault-container');
    console.log('Domain Vault container exists:', !!domainVaultContainer);
    
    const modal = document.getElementById('create-card-modal');
    console.log('Modal element found:', !!modal);
    console.log('Modal element:', modal);
    
    if (modal) {
        console.log('Modal current style:', modal.style.cssText);
        console.log('Modal computed style display:', window.getComputedStyle(modal).display);
        
        // Check modal structure
        const modalContent = modal.querySelector('.modal');
        console.log('Modal content found:', !!modalContent);
        
        if (modalContent) {
            console.log('Modal content computed style:', window.getComputedStyle(modalContent).display);
        }
        
        // Try to show modal
        console.log('Setting modal display to flex');
        modal.style.display = 'flex';
        
        // Force modal content to be visible with inline styles
        const modalContent = modal.querySelector('.modal');
        if (modalContent) {
            modalContent.style.display = 'block';
            modalContent.style.background = 'rgba(255, 255, 255, 0.95)';
            modalContent.style.color = '#333';
            modalContent.style.visibility = 'visible';
            modalContent.style.opacity = '1';
            console.log('Applied inline styles to modal content');
        }
        
        console.log('Modal style after setting:', modal.style.cssText);
        console.log('Modal computed style after setting:', window.getComputedStyle(modal).display);
        
        // Reset form if elements exist
        const nameInput = document.getElementById('card-name');
        const descInput = document.getElementById('card-description');
        const levelInput = document.getElementById('card-level');
        const costInput = document.getElementById('card-recall-cost');
        const typeInput = document.getElementById('card-type');
        
        console.log('Form elements found:', {
            name: !!nameInput,
            desc: !!descInput,
            level: !!levelInput,
            cost: !!costInput,
            type: !!typeInput
        });
        
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
        
    } else {
        console.error('Modal element not found!');
        console.log('Available elements with "modal" in ID:');
        document.querySelectorAll('[id*="modal"]').forEach(el => {
            console.log(`- ${el.id}:`, el);
        });
    }
    console.log('=== END DEBUG ===');
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
window.testSimpleModal = testSimpleModal;
window.addDebugMessage = addDebugMessage;

// Domain Vault will be initialized by the main tab switching logic in script.js

// Add visible debugging to the page
function addDebugMessage(message) {
    let debugDiv = document.getElementById('domain-vault-debug');
    if (!debugDiv) {
        debugDiv = document.createElement('div');
        debugDiv.id = 'domain-vault-debug';
        debugDiv.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-size: 12px;
            max-width: 300px;
            z-index: 9999;
            font-family: monospace;
        `;
        document.body.appendChild(debugDiv);
    }
    const timestamp = new Date().toLocaleTimeString();
    debugDiv.innerHTML += `<div>[${timestamp}] ${message}</div>`;
    debugDiv.scrollTop = debugDiv.scrollHeight;
}

addDebugMessage('domainVault.js loaded successfully');
addDebugMessage('initializeDomainVault function: ' + (typeof initializeDomainVault));

// Emergency fallback - if tab switching doesn't work, try direct initialization
setTimeout(() => {
    addDebugMessage('Checking if Domain Vault needs emergency initialization...');
    const domainVaultContent = document.getElementById('domain-vault-tab-content');
    if (domainVaultContent && domainVaultContent.innerHTML.includes('Content for Domain Vault will go here')) {
        addDebugMessage('Domain Vault not initialized, attempting emergency initialization...');
        if (typeof initializeDomainVault === 'function') {
            initializeDomainVault();
        }
    } else {
        addDebugMessage('Domain Vault appears to be initialized or content changed');
    }
}, 2000);