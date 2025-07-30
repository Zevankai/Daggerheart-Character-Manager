// domainVault.js - Domain Vault tab functionality

// Retrieve domain vault data from localStorage or initialize with defaults
let domainVaultData = JSON.parse(localStorage.getItem('zevi-domain-vault')) || {
    cards: [],
    equippedCards: [null, null, null, null, null] // 5 equipped slots
};

// Card types available for selection
const CARD_TYPES = ['grimoire', 'ability', 'spell'];

// Default card color
const DEFAULT_COLOR = '#3498db';

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
    const domainVaultContent = document.getElementById('domain-vault-tab-content');
    
    if (!domainVaultContent) {
        console.error('Domain Vault tab content not found');
        return;
    }
    
    // Only initialize if not already initialized
    if (!domainVaultContent.querySelector('.domain-vault-container')) {
        try {
            renderDomainVault();
            setupEventListeners();
        } catch (error) {
            console.error('Error initializing Domain Vault:', error);
        }
    }
}

// Render the complete Domain Vault interface
function renderDomainVault() {
    const domainVaultContent = document.getElementById('domain-vault-tab-content');
    if (!domainVaultContent) {
        console.error('Domain vault content element not found');
        return;
    }

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
                    <button class="button" onclick="window.testSimpleModal()" style="margin-left: 10px;">Test Modal</button>
                </div>
                <div class="cards-grid" id="cards-grid">
                    ${renderCards()}
                </div>
            </div>
        </div>

        <!-- Create Card Modal -->
        <div id="create-card-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 10000; align-items: center; justify-content: center;">
            <div style="background: var(--glass-background-color); backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 12px; padding: 20px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto; color: var(--text-color);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 10px;">
                    <h3 style="margin: 0; color: var(--text-color);">Create New Card</h3>
                    <button type="button" onclick="closeCreateCardModal()" style="background: none; border: none; color: var(--text-color); font-size: 20px; cursor: pointer; padding: 5px; border-radius: 50%; width: 30px; height: 30px;">×</button>
                </div>
                <div>
                    <div style="margin-bottom: 15px;">
                        <label for="card-name" style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--text-color);">Card Name</label>
                        <input type="text" id="card-name" placeholder="Enter card name" style="width: 100%; padding: 10px; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; background: rgba(255, 255, 255, 0.1); color: var(--text-color); backdrop-filter: blur(10px);">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label for="card-description" style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--text-color);">Description</label>
                        <textarea id="card-description" placeholder="Describe the card's effect or ability" rows="3" style="width: 100%; padding: 10px; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; background: rgba(255, 255, 255, 0.1); color: var(--text-color); backdrop-filter: blur(10px); resize: vertical;"></textarea>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                        <div>
                            <label for="card-domain" style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--text-color);">Primary Domain</label>
                            <select id="card-domain" style="width: 100%; padding: 10px; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; background: rgba(255, 255, 255, 0.1); color: var(--text-color); backdrop-filter: blur(10px);">
                                <option value="${domains.domain1}">${domains.domain1}</option>
                                <option value="${domains.domain2}">${domains.domain2}</option>
                            </select>
                        </div>
                        <div>
                            <label for="card-level" style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--text-color);">Level</label>
                            <input type="number" id="card-level" min="1" max="10" value="1" style="width: 100%; padding: 10px; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; background: rgba(255, 255, 255, 0.1); color: var(--text-color); backdrop-filter: blur(10px);">
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                        <div>
                            <label for="card-recall-cost" style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--text-color);">Recall Cost</label>
                            <input type="number" id="card-recall-cost" min="0" max="10" value="1" style="width: 100%; padding: 10px; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; background: rgba(255, 255, 255, 0.1); color: var(--text-color); backdrop-filter: blur(10px);">
                        </div>
                        <div>
                            <label for="card-type" style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--text-color);">Card Type</label>
                            <select id="card-type" style="width: 100%; padding: 10px; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; background: rgba(255, 255, 255, 0.1); color: var(--text-color); backdrop-filter: blur(10px);">
                                ${CARD_TYPES.map(type => `<option value="${type}">${type.charAt(0).toUpperCase() + type.slice(1)}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                        <div>
                            <label for="card-color" style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--text-color);">Card Color</label>
                            <input type="color" id="card-color" value="${DEFAULT_COLOR}" style="width: 60px; height: 40px; padding: 0; border: 2px solid rgba(255, 255, 255, 0.2); border-radius: 8px; cursor: pointer; background: none;">
                        </div>
                        <div>
                            <label for="card-image" style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--text-color);">Card Image</label>
                            <input type="file" id="card-image" accept="image/*" style="width: 100%; padding: 8px; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; background: rgba(255, 255, 255, 0.1); color: var(--text-color); backdrop-filter: blur(10px); font-size: 0.8rem;">
                        </div>
                    </div>
                </div>
                <div style="display: flex; gap: 10px; justify-content: flex-end; padding-top: 15px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                    <button onclick="saveNewCard()" style="background: var(--accent-color); color: #000; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold;">Create Card</button>
                    <button onclick="closeCreateCardModal()" style="background: rgba(255, 255, 255, 0.1); color: var(--text-color); border: 1px solid rgba(255, 255, 255, 0.2); padding: 10px 20px; border-radius: 6px; cursor: pointer;">Cancel</button>
                </div>
            </div>
        </div>

        <!-- Edit Card Modal -->
        <div id="edit-card-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 10000; align-items: center; justify-content: center;">
            <div style="background: var(--glass-background-color); backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 12px; padding: 20px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto; color: var(--text-color);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 10px;">
                    <h3 style="margin: 0; color: var(--text-color);">Edit Card</h3>
                    <button type="button" onclick="closeEditCardModal()" style="background: none; border: none; color: var(--text-color); font-size: 20px; cursor: pointer; padding: 5px; border-radius: 50%; width: 30px; height: 30px;">×</button>
                </div>
                <div>
                    <div style="margin-bottom: 15px;">
                        <label for="edit-card-name" style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--text-color);">Card Name</label>
                        <input type="text" id="edit-card-name" placeholder="Enter card name" style="width: 100%; padding: 10px; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; background: rgba(255, 255, 255, 0.1); color: var(--text-color); backdrop-filter: blur(10px);">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label for="edit-card-description" style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--text-color);">Description</label>
                        <textarea id="edit-card-description" placeholder="Describe the card's effect or ability" rows="3" style="width: 100%; padding: 10px; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; background: rgba(255, 255, 255, 0.1); color: var(--text-color); backdrop-filter: blur(10px); resize: vertical;"></textarea>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                        <div>
                            <label for="edit-card-domain" style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--text-color);">Primary Domain</label>
                            <select id="edit-card-domain" style="width: 100%; padding: 10px; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; background: rgba(255, 255, 255, 0.1); color: var(--text-color); backdrop-filter: blur(10px);">
                                <option value="${domains.domain1}">${domains.domain1}</option>
                                <option value="${domains.domain2}">${domains.domain2}</option>
                            </select>
                        </div>
                        <div>
                            <label for="edit-card-level" style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--text-color);">Level</label>
                            <input type="number" id="edit-card-level" min="1" max="10" value="1" style="width: 100%; padding: 10px; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; background: rgba(255, 255, 255, 0.1); color: var(--text-color); backdrop-filter: blur(10px);">
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                        <div>
                            <label for="edit-card-recall-cost" style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--text-color);">Recall Cost</label>
                            <input type="number" id="edit-card-recall-cost" min="0" max="10" value="1" style="width: 100%; padding: 10px; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; background: rgba(255, 255, 255, 0.1); color: var(--text-color); backdrop-filter: blur(10px);">
                        </div>
                        <div>
                            <label for="edit-card-type" style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--text-color);">Card Type</label>
                            <select id="edit-card-type" style="width: 100%; padding: 10px; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; background: rgba(255, 255, 255, 0.1); color: var(--text-color); backdrop-filter: blur(10px);">
                                ${CARD_TYPES.map(type => `<option value="${type}">${type.charAt(0).toUpperCase() + type.slice(1)}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                        <div>
                            <label for="edit-card-color" style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--text-color);">Card Color</label>
                            <input type="color" id="edit-card-color" value="${DEFAULT_COLOR}" style="width: 60px; height: 40px; padding: 0; border: 2px solid rgba(255, 255, 255, 0.2); border-radius: 8px; cursor: pointer; background: none;">
                        </div>
                        <div>
                            <label for="edit-card-image" style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--text-color);">Card Image</label>
                            <input type="file" id="edit-card-image" accept="image/*" style="width: 100%; padding: 8px; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; background: rgba(255, 255, 255, 0.1); color: var(--text-color); backdrop-filter: blur(10px); font-size: 0.8rem;">
                            <div id="edit-current-image" style="margin-top: 5px; font-size: 0.8rem; color: rgba(255, 255, 255, 0.7);"></div>
                        </div>
                    </div>
                </div>
                <div style="display: flex; gap: 10px; justify-content: flex-end; padding-top: 15px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                    <button onclick="saveEditedCard()" style="background: var(--accent-color); color: #000; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold;">Save Changes</button>
                    <button onclick="deleteCard()" style="background: #e74c3c; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold;">Delete Card</button>
                    <button onclick="closeEditCardModal()" style="background: rgba(255, 255, 255, 0.1); color: var(--text-color); border: 1px solid rgba(255, 255, 255, 0.2); padding: 10px 20px; border-radius: 6px; cursor: pointer;">Cancel</button>
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
    const imageHtml = card.image ? `<div class="card-image" style="background-image: url('${card.image}');"></div>` : '';
    
    return `
        <div class="domain-card ${isEquipped ? 'equipped' : ''}" 
             data-card-id="${card.id}" 
             style="border-left: 4px solid ${card.color};">
            <button class="card-expand-btn" onclick="expandCard('${card.id}')" title="Expand card">↗</button>
            ${imageHtml}
            <div class="card-content">
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
                        <button class="card-action-btn unequip-btn" onclick="unequipCard('${card.id}')" title="Unequip card">↓</button>
                    </div>
                `}
            </div>
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
    const modal = document.getElementById('create-card-modal');
    if (modal) {
        // Reset form
        const nameInput = document.getElementById('card-name');
        const descInput = document.getElementById('card-description');
        const levelInput = document.getElementById('card-level');
        const costInput = document.getElementById('card-recall-cost');
        const typeInput = document.getElementById('card-type');
        const colorInput = document.getElementById('card-color');
        
        if (nameInput) nameInput.value = '';
        if (descInput) descInput.value = '';
        if (levelInput) levelInput.value = '1';
        if (costInput) costInput.value = '1';
        if (typeInput) typeInput.value = 'ability';
        if (colorInput) colorInput.value = DEFAULT_COLOR;
        
        modal.style.display = 'flex';
    }
}

// Close create card modal
function closeCreateCardModal() {
    const modal = document.getElementById('create-card-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Handle image upload
function handleImageUpload(file) {
    return new Promise((resolve) => {
        if (!file) {
            resolve(null);
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            resolve(e.target.result);
        };
        reader.readAsDataURL(file);
    });
}

// Save new card
async function saveNewCard() {
    const name = document.getElementById('card-name').value.trim();
    const description = document.getElementById('card-description').value.trim();
    const domain = document.getElementById('card-domain').value;
    const level = parseInt(document.getElementById('card-level').value);
    const recallCost = parseInt(document.getElementById('card-recall-cost').value);
    const type = document.getElementById('card-type').value;
    const color = document.getElementById('card-color').value;
    const imageFile = document.getElementById('card-image').files[0];

    // Validation
    if (!name || !description) {
        if (window.showNotification) {
            window.showNotification('Name and description are required.', 'error');
        }
        return;
    }

    // Handle image upload
    const image = await handleImageUpload(imageFile);

    // Create new card
    const newCard = {
        id: generateCardId(),
        name,
        description,
        domain,
        level,
        recallCost,
        type,
        color,
        image
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
    document.getElementById('edit-card-color').value = card.color;
    
    // Show current image info
    const currentImageDiv = document.getElementById('edit-current-image');
    if (currentImageDiv) {
        if (card.image) {
            currentImageDiv.innerHTML = 'Current image: <span style="color: var(--accent-color);">Uploaded</span>';
        } else {
            currentImageDiv.innerHTML = 'No image uploaded';
        }
    }
    
    // Show modal
    document.getElementById('edit-card-modal').style.display = 'flex';
}

// Close edit card modal
function closeEditCardModal() {
    document.getElementById('edit-card-modal').style.display = 'none';
    editingCardId = null;
}

// Save edited card
async function saveEditedCard() {
    if (!editingCardId) return;

    const cardIndex = domainVaultData.cards.findIndex(c => c.id === editingCardId);
    if (cardIndex === -1) return;

    const name = document.getElementById('edit-card-name').value.trim();
    const description = document.getElementById('edit-card-description').value.trim();
    const domain = document.getElementById('edit-card-domain').value;
    const level = parseInt(document.getElementById('edit-card-level').value);
    const recallCost = parseInt(document.getElementById('edit-card-recall-cost').value);
    const type = document.getElementById('edit-card-type').value;
    const color = document.getElementById('edit-card-color').value;
    const imageFile = document.getElementById('edit-card-image').files[0];

    // Validation
    if (!name || !description) {
        if (window.showNotification) {
            window.showNotification('Name and description are required.', 'error');
        }
        return;
    }

    // Handle image upload (keep existing image if no new one is uploaded)
    const newImage = await handleImageUpload(imageFile);
    const image = newImage || domainVaultData.cards[cardIndex].image;

    // Update card
    domainVaultData.cards[cardIndex] = {
        ...domainVaultData.cards[cardIndex],
        name,
        description,
        domain,
        level,
        recallCost,
        type,
        color,
        image
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

// Expand card to full view
function expandCard(cardId) {
    const card = domainVaultData.cards.find(c => c.id === cardId);
    if (!card) return;

    // Create expanded card overlay
    const overlay = document.createElement('div');
    overlay.id = 'expanded-card-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 20000;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(5px);
        -webkit-backdrop-filter: blur(5px);
    `;

    const expandedCard = document.createElement('div');
    expandedCard.style.cssText = `
        background: var(--glass-background-color);
        backdrop-filter: blur(15px);
        -webkit-backdrop-filter: blur(15px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-left: 8px solid ${card.color};
        border-radius: 16px;
        padding: 30px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        color: var(--text-color);
        cursor: pointer;
        transition: all 0.3s ease;
    `;

    const imageHtml = card.image ? 
        `<div style="width: 100%; height: 200px; background-image: url('${card.image}'); background-size: cover; background-position: center; border-radius: 12px; margin-bottom: 20px;"></div>` : '';

    expandedCard.innerHTML = `
        <div style="text-align: center; margin-bottom: 10px; color: rgba(255, 255, 255, 0.7); font-size: 0.9rem;">Click anywhere to close</div>
        ${imageHtml}
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; gap: 15px;">
            <h2 style="margin: 0; color: var(--text-color); font-size: 1.8rem; flex: 1;">${card.name}</h2>
            <div style="background: ${card.type === 'grimoire' ? '#9b59b6' : card.type === 'ability' ? '#3498db' : '#e74c3c'}; color: white; padding: 8px 16px; border-radius: 8px; font-size: 0.9rem; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">${card.type}</div>
        </div>
        <div style="margin-bottom: 20px;">
            <div style="color: var(--accent-color); font-size: 1.1rem; font-weight: bold; margin-bottom: 10px;">${card.domain}</div>
            <div style="display: flex; gap: 20px; font-size: 1rem;">
                <span style="background: rgba(255, 255, 255, 0.1); padding: 6px 12px; border-radius: 6px;">Level ${card.level}</span>
                <span style="background: rgba(255, 255, 255, 0.1); padding: 6px 12px; border-radius: 6px;">Cost: ${card.recallCost}</span>
            </div>
        </div>
        <div style="color: rgba(255, 255, 255, 0.9); font-size: 1.1rem; line-height: 1.6;">${card.description}</div>
    `;

    expandedCard.addEventListener('click', () => {
        overlay.remove();
    });

    overlay.appendChild(expandedCard);
    document.body.appendChild(overlay);

    // Animate in
    requestAnimationFrame(() => {
        overlay.style.opacity = '0';
        overlay.style.transform = 'scale(0.9)';
        requestAnimationFrame(() => {
            overlay.style.transition = 'all 0.3s ease';
            overlay.style.opacity = '1';
            overlay.style.transform = 'scale(1)';
        });
    });
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
window.expandCard = expandCard;

// Domain Vault will be initialized by the main tab switching logic in script.js

// Domain Vault initialization - cleaned up and production ready