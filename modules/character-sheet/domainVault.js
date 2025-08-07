// domainVault.js - Domain Vault tab functionality

console.log('🎴 DomainVault.js loaded successfully!');

// Retrieve domain vault data from localStorage or initialize with defaults
// window.domainVaultData will be initialized below
try {
    // Initialize with defaults - will be populated when character loads from cloud
const savedData = null; // Don't load from localStorage
    if (savedData) {
        window.domainVaultData = JSON.parse(savedData);
        console.log('Loaded domain vault data. Cards count:', window.domainVaultData.cards?.length || 0);
    } else {
        window.domainVaultData = {
            cards: [],
            equippedCards: [null, null, null, null, null] // 5 equipped slots
        };
        console.log('Initialized new domain vault data');
    }
} catch (error) {
    console.error('Error loading domain vault data:', error);
    window.domainVaultData = {
        cards: [],
        equippedCards: [null, null, null, null, null] // 5 equipped slots
    };
    console.log('Reset domain vault data due to error');
}

// Ensure equipped cards array always has exactly 5 slots
if (!window.domainVaultData.equippedCards || window.domainVaultData.equippedCards.length !== 5) {
    window.domainVaultData.equippedCards = [null, null, null, null, null];
    // Trigger auto-save instead of localStorage
    if (window.app?.characterData?.constructor?.saveCharacterData) {
      window.app.characterData.constructor.saveCharacterData();
    }
}

// Card types available for selection
const CARD_TYPES = ['grimoire', 'ability', 'spell'];

// Default card color
const DEFAULT_COLOR = '#3498db';

// Save domain vault data to localStorage
function saveDomainVaultData() {
    try {
        const dataString = JSON.stringify(window.domainVaultData);
        // Trigger auto-save instead of localStorage
        if (window.app?.characterData?.constructor?.saveCharacterData) {
          window.app.characterData.constructor.saveCharacterData();
        }
    } catch (error) {
        console.error('Error saving domain vault data:', error);
    }
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
    console.log('initializeDomainVault called');
    const domainVaultContent = document.getElementById('domain-vault-tab-content');
    
    if (!domainVaultContent) {
        console.error('Domain Vault tab content not found');
        return;
    }
    
    // Only render if not already rendered
    if (!domainVaultContent.querySelector('.domain-vault-container')) {
        try {
            console.log('Rendering domain vault interface');
            renderDomainVault();
        } catch (error) {
            console.error('Error rendering Domain Vault:', error);
            return;
        }
    }
    
    // Always set up event listeners (in case they were lost)
    try {
        console.log('Setting up event listeners');
        setupEventListeners();
        setupDomainChangeListeners();
    } catch (error) {
        console.error('Error setting up event listeners:', error);
    }
}

// Render the complete Domain Vault interface
function renderDomainVault() {
    console.log('renderDomainVault called');
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
                    <button class="button primary-btn" id="create-card-btn" onclick="console.log('Button clicked!'); console.log('showCreateCardModal function:', typeof showCreateCardModal); if(typeof showCreateCardModal === 'function') { showCreateCardModal(); } else { console.error('showCreateCardModal is not a function!'); }">Create New Card</button>
                </div>
                

                
                <div class="cards-grid" id="cards-grid">
                    ${renderCards()}
                </div>
                
                <!-- Delete Cards Section -->
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                    <button class="button danger-btn" id="delete-cards-btn" style="background: #e74c3c; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 14px;">
                        Delete Cards
                    </button>
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
                            <input type="file" id="card-image" accept="image/*" style="width: 100%; padding: 8px; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; background: rgba(255, 255, 255, 0.1); color: var(--text-color); backdrop-filter: blur(10px); font-size: 0.8rem; margin-bottom: 8px;">
                            <div id="image-crop-container" style="display: none; margin-bottom: 8px;">
                                <label style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--text-color); font-size: 0.9rem;">Position Image (drag to crop)</label>
                                <div id="crop-preview" style="width: 100%; height: 120px; border: 2px solid rgba(255, 255, 255, 0.3); border-radius: 8px; overflow: hidden; position: relative; cursor: move; background: #f0f0f0;">
                                    <img id="crop-image" style="position: absolute; max-width: none; max-height: none; user-select: none; pointer-events: none;">
                                </div>
                                <div style="margin-top: 5px; font-size: 0.8rem; color: rgba(255, 255, 255, 0.7);">Drag the image to position it within the card area</div>
                            </div>
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
                            <input type="file" id="edit-card-image" accept="image/*" style="width: 100%; padding: 8px; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; background: rgba(255, 255, 255, 0.1); color: var(--text-color); backdrop-filter: blur(10px); font-size: 0.8rem; margin-bottom: 8px;">
                            <div id="edit-current-image" style="margin-bottom: 8px; font-size: 0.8rem; color: rgba(255, 255, 255, 0.7);"></div>
                            <div id="edit-image-crop-container" style="display: none; margin-bottom: 8px;">
                                <label style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--text-color); font-size: 0.9rem;">Position Image (drag to crop)</label>
                                <div id="edit-crop-preview" style="width: 100%; height: 120px; border: 2px solid rgba(255, 255, 255, 0.3); border-radius: 8px; overflow: hidden; position: relative; cursor: move; background: #f0f0f0;">
                                    <img id="edit-crop-image" style="position: absolute; max-width: none; max-height: none; user-select: none; pointer-events: none;">
                                </div>
                                <div style="margin-top: 5px; font-size: 0.8rem; color: rgba(255, 255, 255, 0.7);">Drag the image to position it within the card area</div>
                            </div>
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

        <!-- Delete Cards Modal -->
        <div id="delete-cards-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 10000; align-items: center; justify-content: center;">
            <div style="background: var(--glass-background-color); backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 12px; padding: 20px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto; color: var(--text-color);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 10px;">
                    <h3 style="margin: 0; color: var(--text-color);">Delete Cards</h3>
                    <button type="button" onclick="closeDeleteCardsModal()" style="background: none; border: none; color: var(--text-color); font-size: 20px; cursor: pointer; padding: 5px; border-radius: 50%; width: 30px; height: 30px;">×</button>
                </div>
                <div>
                    <p style="margin-bottom: 20px; color: rgba(255, 255, 255, 0.8);">Select the cards you want to delete. This action cannot be undone.</p>
                    <div id="delete-cards-list" style="max-height: 400px; overflow-y: auto; margin-bottom: 20px;">
                        <!-- Cards will be populated here -->
                    </div>
                    <div style="display: flex; gap: 10px; justify-content: flex-end; padding-top: 15px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                        <button onclick="confirmDeleteCards()" id="confirm-delete-btn" style="background: #e74c3c; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; opacity: 0.5; pointer-events: none;">Delete Selected (0)</button>
                        <button onclick="closeDeleteCardsModal()" style="background: rgba(255, 255, 255, 0.1); color: var(--text-color); border: 1px solid rgba(255, 255, 255, 0.2); padding: 10px 20px; border-radius: 6px; cursor: pointer;">Cancel</button>
                    </div>
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
    return window.domainVaultData.equippedCards.map((cardId, index) => {
        const card = cardId ? window.domainVaultData.cards.find(c => c.id === cardId) : null;
        return `
            <div class="equipped-slot" data-slot-index="${index}">
                ${card ? renderCard(card, true) : '<div class="empty-equipped-slot">Empty Slot</div>'}
            </div>
        `;
    }).join('');
}

// Render all cards in the collection
function renderCards() {
    if (window.domainVaultData.cards.length === 0) {
        return '<div class="no-cards-message">No cards created yet. Click "Create New Card" to get started!</div>';
    }

    return window.domainVaultData.cards.map(card => {
        const isEquipped = window.domainVaultData.equippedCards.includes(card.id);
        return `<div class="card-wrapper ${isEquipped ? 'equipped' : ''}">${renderCard(card, false)}</div>`;
    }).join('');
}

// Render individual card
function renderCard(card, isEquipped = false) {
    let imageHtml = '';
    if (card.image) {
        if (card.cropData && card.cropData.width > 0 && card.cropData.height > 0) {
            // Use crop data to position the image
            const { x, y, width, height } = card.cropData;
            
            // Create a container with the image positioned using CSS transforms
            // The crop data represents the visible portion of the image as percentages
            imageHtml = `
                <div class="card-image" style="overflow: hidden; position: relative;">
                    <img src="${card.image}" style="
                        width: ${100 / width}%;
                        height: ${100 / height}%;
                        position: absolute;
                        left: ${-x * (100 / width)}%;
                        top: ${-y * (100 / height)}%;
                        object-fit: cover;
                    ">
                </div>
            `;
        } else {
            // Default to cover behavior for backward compatibility
            imageHtml = `<div class="card-image" style="background-image: url('${card.image}'); background-size: cover; background-position: center; background-repeat: no-repeat;"></div>`;
        }
    }
    
    
    return `
        <div class="domain-card ${isEquipped ? 'equipped' : ''}" 
             data-card-id="${card.id}" 
             style="background-color: ${card.color}; border: 2px solid rgba(255, 255, 255, 0.3);">
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
    
    // Ensure slot index is valid (0-4 only)
    if (slotIndex < 0 || slotIndex > 4) {
        cardElement.remove();
        return;
    }
    
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
    
    window.domainVaultData.equippedCards = newOrder;
    saveDomainVaultData();
    renderEquippedSlots();
}

// Handle card unequipping via drag and drop
function handleCardUnequip(evt) {
    const cardElement = evt.item;
    const cardId = cardElement.querySelector('.domain-card').dataset.cardId;
    
    // Remove from equipped cards
    const equippedIndex = window.domainVaultData.equippedCards.indexOf(cardId);
    if (equippedIndex !== -1) {
        window.domainVaultData.equippedCards[equippedIndex] = null;
        saveDomainVaultData();
    }
    
    // Remove the dragged element
    cardElement.remove();
    
    // Re-render both sections
    document.getElementById('equipped-slots').innerHTML = renderEquippedSlots();
    document.getElementById('cards-grid').innerHTML = renderCards();
    initializeDragAndDrop();
    setupEventListeners();
}

// Equip card to specific slot
function equipCardToSlot(cardId, slotIndex) {
    // Validate slot index (must be 0-4)
    if (slotIndex < 0 || slotIndex > 4) {
        console.warn('Invalid slot index:', slotIndex);
        return;
    }
    
    // Check if card is already equipped
    const currentEquippedIndex = window.domainVaultData.equippedCards.indexOf(cardId);
    if (currentEquippedIndex !== -1) {
        // Move from current slot to new slot
        window.domainVaultData.equippedCards[currentEquippedIndex] = null;
    }
    
    // If slot is occupied, unequip the current card
    if (window.domainVaultData.equippedCards[slotIndex]) {
        window.domainVaultData.equippedCards[slotIndex] = null;
    }
    
    // Equip the new card
    window.domainVaultData.equippedCards[slotIndex] = cardId;
    saveDomainVaultData();
    
    // Re-render both sections
    document.getElementById('equipped-slots').innerHTML = renderEquippedSlots();
    document.getElementById('cards-grid').innerHTML = renderCards();
    initializeDragAndDrop();
    setupEventListeners();
}

// Quick equip card to first available slot
function quickEquipCard(cardId) {
    const firstEmptySlot = window.domainVaultData.equippedCards.findIndex(slot => slot === null);
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
    const equippedIndex = window.domainVaultData.equippedCards.indexOf(cardId);
    if (equippedIndex !== -1) {
        window.domainVaultData.equippedCards[equippedIndex] = null;
        saveDomainVaultData();
        
        // Re-render both sections
        document.getElementById('equipped-slots').innerHTML = renderEquippedSlots();
        document.getElementById('cards-grid').innerHTML = renderCards();
        initializeDragAndDrop();
        setupEventListeners();
    }
}

// Setup event listeners
function setupEventListeners() {
    console.log('Setting up domain vault event listeners');
    // Create card button
    const createCardBtn = document.getElementById('create-card-btn');
    console.log('Create card button:', createCardBtn);
    if (createCardBtn) {
        // Remove any existing listeners to avoid duplicates
        createCardBtn.removeEventListener('click', showCreateCardModal);
        createCardBtn.addEventListener('click', showCreateCardModal);
        console.log('Event listener added to create card button');
    } else {
        console.error('Create card button not found!');
    }
    
    // Delete cards button
    const deleteCardsBtn = document.getElementById('delete-cards-btn');
    if (deleteCardsBtn) {
        // Remove any existing listeners to avoid duplicates
        deleteCardsBtn.removeEventListener('click', showDeleteCardsModal);
        deleteCardsBtn.addEventListener('click', showDeleteCardsModal);
    }
    
    // Initialize image cropping interfaces
    if (document.getElementById('card-image')) {
        window.createCardCropFunction = initializeImageCropping('card-image', 'image-crop-container', 'crop-image', 'crop-preview');
    }
    
    if (document.getElementById('edit-card-image')) {
        window.editCardCropFunction = initializeImageCropping('edit-card-image', 'edit-image-crop-container', 'edit-crop-image', 'edit-crop-preview');
    }
}



// Show create card modal
function showCreateCardModal() {
    console.log('showCreateCardModal called');
    const modal = document.getElementById('create-card-modal');
    console.log('Modal element:', modal);
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
        console.log('Modal should now be visible');
    } else {
        console.error('Create card modal not found!');
    }
}

// Close create card modal
function closeCreateCardModal() {
    const modal = document.getElementById('create-card-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Handle image upload with automatic compression
function handleImageUpload(file) {
    return new Promise((resolve) => {
        if (!file) {
            resolve(null);
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const originalImage = e.target.result;
            
            // Create a temporary image to get dimensions
            const img = new Image();
            img.onload = function() {
                // Calculate optimal dimensions (max 800px width/height)
                let newWidth = img.width;
                let newHeight = img.height;
                const maxSize = 800;
                
                if (newWidth > maxSize || newHeight > maxSize) {
                    if (newWidth > newHeight) {
                        newHeight = (newHeight * maxSize) / newWidth;
                        newWidth = maxSize;
                    } else {
                        newWidth = (newWidth * maxSize) / newHeight;
                        newHeight = maxSize;
                    }
                }
                
                // Create canvas for compression
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = newWidth;
                canvas.height = newHeight;
                
                // Draw and compress image
                ctx.drawImage(img, 0, 0, newWidth, newHeight);
                const compressedImage = canvas.toDataURL('image/jpeg', 0.8); // 80% quality
                
                resolve(compressedImage);
            };
            img.src = originalImage;
        };
        reader.readAsDataURL(file);
    });
}

// Initialize image cropping interface
function initializeImageCropping(imageInputId, containerId, imageId, previewId) {
    const imageInput = document.getElementById(imageInputId);
    const container = document.getElementById(containerId);
    const image = document.getElementById(imageId);
    const preview = document.getElementById(previewId);
    
    if (!imageInput || !container || !image || !preview) return;
    
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;
    
    imageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                image.src = event.target.result;
                image.onload = function() {
                    // Show the cropping interface
                    container.style.display = 'block';
                    
                    // Scale image to fit nicely in preview
                    const previewRect = preview.getBoundingClientRect();
                    const imgAspect = image.naturalWidth / image.naturalHeight;
                    const previewAspect = previewRect.width / previewRect.height;
                    
                    if (imgAspect > previewAspect) {
                        // Image is wider - fit to height and allow horizontal scrolling
                        image.style.height = previewRect.height + 'px';
                        image.style.width = 'auto';
                    } else {
                        // Image is taller - fit to width and allow vertical scrolling
                        image.style.width = previewRect.width + 'px';
                        image.style.height = 'auto';
                    }
                    
                    // Center the image initially
                    const imgRect = image.getBoundingClientRect();
                    currentX = (previewRect.width - imgRect.width) / 2;
                    currentY = (previewRect.height - imgRect.height) / 2;
                    updateImagePosition();
                };
            };
            reader.readAsDataURL(file);
        } else {
            container.style.display = 'none';
        }
    });
    
    // Mouse drag functionality
    preview.addEventListener('mousedown', function(e) {
        isDragging = true;
        startX = e.clientX - currentX;
        startY = e.clientY - currentY;
        preview.style.cursor = 'grabbing';
    });
    
    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        
        currentX = e.clientX - startX;
        currentY = e.clientY - startY;
        updateImagePosition();
    });
    
    document.addEventListener('mouseup', function() {
        if (isDragging) {
            isDragging = false;
            preview.style.cursor = 'move';
        }
    });
    
    // Touch support for mobile
    preview.addEventListener('touchstart', function(e) {
        isDragging = true;
        const touch = e.touches[0];
        startX = touch.clientX - currentX;
        startY = touch.clientY - currentY;
        e.preventDefault();
    });
    
    document.addEventListener('touchmove', function(e) {
        if (!isDragging) return;
        
        const touch = e.touches[0];
        currentX = touch.clientX - startX;
        currentY = touch.clientY - startY;
        updateImagePosition();
        e.preventDefault();
    });
    
    document.addEventListener('touchend', function() {
        isDragging = false;
    });
    
    function updateImagePosition() {
        // Constrain the image position so it can't be dragged completely out of view
        const previewRect = preview.getBoundingClientRect();
        const imgRect = image.getBoundingClientRect();
        
        // Ensure at least some part of the image is always visible
        const minX = previewRect.width - imgRect.width;
        const maxX = 0;
        const minY = previewRect.height - imgRect.height;
        const maxY = 0;
        
        currentX = Math.max(minX, Math.min(maxX, currentX));
        currentY = Math.max(minY, Math.min(maxY, currentY));
        
        image.style.left = currentX + 'px';
        image.style.top = currentY + 'px';
    }
    
    // Return function to get crop data
    return function getCropData() {
        if (!image.src) return null;
        
        const previewRect = preview.getBoundingClientRect();
        const imgRect = image.getBoundingClientRect();
        
        // Calculate what portion of the image is visible in the preview area
        const visibleLeft = Math.max(0, -currentX);
        const visibleTop = Math.max(0, -currentY);
        const visibleRight = Math.min(imgRect.width, previewRect.width - currentX);
        const visibleBottom = Math.min(imgRect.height, previewRect.height - currentY);
        
        // Convert to percentages of the original image dimensions
        // We need to account for the scaling factor between displayed and natural dimensions
        const scaleX = image.naturalWidth / imgRect.width;
        const scaleY = image.naturalHeight / imgRect.height;
        
        const cropX = (visibleLeft * scaleX) / image.naturalWidth;
        const cropY = (visibleTop * scaleY) / image.naturalHeight;
        const cropWidth = ((visibleRight - visibleLeft) * scaleX) / image.naturalWidth;
        const cropHeight = ((visibleBottom - visibleTop) * scaleY) / image.naturalHeight;
        
        return {
            x: cropX,
            y: cropY,
            width: cropWidth,
            height: cropHeight
        };
    };
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

    // Handle image upload and crop data
    const image = await handleImageUpload(imageFile);
    const cropData = window.createCardCropFunction ? window.createCardCropFunction() : null;

    // Clean up crop data - only keep if it's meaningful
    let cleanCropData = null;
    if (cropData && cropData.width > 0 && cropData.height > 0 && 
        (cropData.x > 0 || cropData.y > 0 || cropData.width < 1 || cropData.height < 1)) {
        cleanCropData = cropData;
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
        color,
        image,
        cropData: cleanCropData
    };

    window.domainVaultData.cards.push(newCard);
    saveDomainVaultData();
    
    // Re-render cards
    document.getElementById('cards-grid').innerHTML = renderCards();
    initializeDragAndDrop();
    setupEventListeners();
    
    closeCreateCardModal();
    
    if (window.showNotification) {
        window.showNotification('Card created successfully!', 'success');
    }
}

let editingCardId = null;

// Edit card
function editCard(cardId) {
    const card = window.domainVaultData.cards.find(c => c.id === cardId);
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

    const cardIndex = window.domainVaultData.cards.findIndex(c => c.id === editingCardId);
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
    const image = newImage || window.domainVaultData.cards[cardIndex].image;
    
    // Get crop data (keep existing if no new image)
    const newCropData = window.editCardCropFunction ? window.editCardCropFunction() : null;
    const cropData = newImage ? newCropData : window.domainVaultData.cards[cardIndex].cropData;
    
    // Clean up crop data - only keep if it's meaningful
    let cleanCropData = null;
    if (cropData && cropData.width > 0 && cropData.height > 0 && 
        (cropData.x > 0 || cropData.y > 0 || cropData.width < 1 || cropData.height < 1)) {
        cleanCropData = cropData;
    }

    // Update card
    window.domainVaultData.cards[cardIndex] = {
        ...window.domainVaultData.cards[cardIndex],
        name,
        description,
        domain,
        level,
        recallCost,
        type,
        color,
        image,
        cropData: cleanCropData
    };

    saveDomainVaultData();
    
    // Re-render both sections
    document.getElementById('equipped-slots').innerHTML = renderEquippedSlots();
    document.getElementById('cards-grid').innerHTML = renderCards();
    initializeDragAndDrop();
    setupEventListeners();
    
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
    window.domainVaultData.cards = window.domainVaultData.cards.filter(c => c.id !== editingCardId);
    
    // Remove from equipped cards if equipped
    const equippedIndex = window.domainVaultData.equippedCards.indexOf(editingCardId);
    if (equippedIndex !== -1) {
        window.domainVaultData.equippedCards[equippedIndex] = null;
    }

    saveDomainVaultData();
    
    // Re-render both sections
    document.getElementById('equipped-slots').innerHTML = renderEquippedSlots();
    document.getElementById('cards-grid').innerHTML = renderCards();
    initializeDragAndDrop();
    setupEventListeners();
    
    closeEditCardModal();
    
    if (window.showNotification) {
        window.showNotification('Card deleted successfully!', 'success');
    }
}

// Expand card to full view
function expandCard(cardId) {
    const card = window.domainVaultData.cards.find(c => c.id === cardId);
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
        background: ${card.color};
        border: 3px solid rgba(255, 255, 255, 0.4);
        border-radius: 16px;
        padding: 30px;
        max-width: 500px;
        width: 90%;
        color: var(--text-color);
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        word-wrap: break-word;
        hyphens: auto;
    `;

    let expandedImageHtml = '';
    if (card.image) {
        if (card.cropData && card.cropData.width > 0 && card.cropData.height > 0) {
            // Use crop data to position the image
            const { x, y, width, height } = card.cropData;
            
            // Create a container with the image positioned using CSS transforms
            // The crop data represents the visible portion of the image as percentages
            expandedImageHtml = `
                <div style="width: 100%; height: 200px; overflow: hidden; position: relative; border-radius: 12px; margin-bottom: 20px;">
                    <img src="${card.image}" style="
                        width: ${100 / width}%;
                        height: ${100 / height}%;
                        position: absolute;
                        left: ${-x * (100 / width)}%;
                        top: ${-y * (100 / height)}%;
                        object-fit: cover;
                    ">
                </div>
            `;
        } else {
            // Default to cover behavior for backward compatibility
            expandedImageHtml = `<div style="width: 100%; height: 200px; background-image: url('${card.image}'); background-size: cover; background-position: center; background-repeat: no-repeat; border-radius: 12px; margin-bottom: 20px;"></div>`;
        }
    }

    expandedCard.innerHTML = `
        <div style="text-align: center; margin-bottom: 15px; color: rgba(255, 255, 255, 0.9); font-size: 0.9rem; font-weight: bold;">Click anywhere to close</div>
        ${expandedImageHtml}
        <div style="background: rgba(255, 255, 255, 0.95); border-radius: 12px; padding: 25px; box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; gap: 15px;">
                <h2 style="margin: 0; color: #2c3e50; font-size: 1.8rem; flex: 1;">${card.name}</h2>
                <div style="background: ${card.type === 'grimoire' ? '#9b59b6' : card.type === 'ability' ? '#3498db' : '#e74c3c'}; color: white; padding: 8px 16px; border-radius: 8px; font-size: 0.9rem; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">${card.type}</div>
            </div>
            <div style="margin-bottom: 20px;">
                <div style="color: #8e44ad; font-size: 1.1rem; font-weight: bold; margin-bottom: 10px;">${card.domain}</div>
                <div style="display: flex; gap: 20px; font-size: 1rem;">
                    <span style="background: rgba(0, 0, 0, 0.1); color: #333; padding: 6px 12px; border-radius: 6px;">Level ${card.level}</span>
                    <span style="background: rgba(0, 0, 0, 0.1); color: #333; padding: 6px 12px; border-radius: 6px;">Cost: ${card.recallCost}</span>
                </div>
            </div>
            <div style="color: #444; font-size: 1.1rem; line-height: 1.6; word-wrap: break-word; white-space: pre-wrap; hyphens: auto; overflow-wrap: break-word;">${card.description}</div>
        </div>
    `;

    expandedCard.addEventListener('click', () => {
        overlay.remove();
    });

    overlay.appendChild(expandedCard);
    document.body.appendChild(overlay);

    // Check if card height exceeds viewport and adjust if needed
    requestAnimationFrame(() => {
        const cardHeight = expandedCard.offsetHeight;
        const viewportHeight = window.innerHeight;
        const maxCardHeight = viewportHeight * 0.95; // 95% of viewport height
        
        if (cardHeight > maxCardHeight) {
            expandedCard.style.maxHeight = maxCardHeight + 'px';
            expandedCard.style.overflowY = 'auto';
        }
    });

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
window.updateDomainVaultFromHeader = updateDomainVaultFromHeader;
window.setupGlobalDomainChangeListeners = setupGlobalDomainChangeListeners;

window.expandCard = expandCard;

// Delete cards functions
window.showDeleteCardsModal = showDeleteCardsModal;
window.closeDeleteCardsModal = closeDeleteCardsModal;
window.toggleCardSelection = toggleCardSelection;
window.confirmDeleteCards = confirmDeleteCards;



// Set up listeners for domain changes in the header
function setupDomainChangeListeners() {
    const domainBadges = document.querySelectorAll('.name-box .domain-badge');
    
    domainBadges.forEach(badge => {
        // Remove existing listeners to prevent duplicates
        badge.removeEventListener('input', updateDomainVaultFromHeader);
        badge.removeEventListener('blur', updateDomainVaultFromHeader);
        
        // Listen for input events on contenteditable elements
        badge.addEventListener('input', updateDomainVaultFromHeader);
        badge.addEventListener('blur', updateDomainVaultFromHeader);
        badge.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                badge.blur();
            }
        });
    });
}

// Delete Cards functionality
let selectedCardsForDeletion = new Set();

// Show delete cards modal
function showDeleteCardsModal() {
    const modal = document.getElementById('delete-cards-modal');
    const cardsList = document.getElementById('delete-cards-list');
    
    if (!modal || !cardsList) return;
    
    // Reset selection
    selectedCardsForDeletion.clear();
    
    // Populate cards list
    cardsList.innerHTML = window.domainVaultData.cards.map(card => `
        <div style="display: flex; align-items: center; padding: 10px; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 6px; margin-bottom: 8px; background: rgba(255, 255, 255, 0.05);">
            <input type="checkbox" id="delete-${card.id}" style="margin-right: 12px; transform: scale(1.2);" onchange="toggleCardSelection('${card.id}')">
            <div style="flex: 1;">
                <div style="font-weight: bold; color: var(--text-color);">${card.name}</div>
                <div style="font-size: 0.9rem; color: rgba(255, 255, 255, 0.7);">${card.domain} • Lv.${card.level} • ${card.type}</div>
            </div>
            <div style="width: 40px; height: 40px; border-radius: 6px; background-color: ${card.color}; border: 2px solid rgba(255, 255, 255, 0.3);"></div>
        </div>
    `).join('');
    
    // Update confirm button
    updateConfirmDeleteButton();
    
    modal.style.display = 'flex';
}

// Close delete cards modal
function closeDeleteCardsModal() {
    const modal = document.getElementById('delete-cards-modal');
    if (modal) {
        modal.style.display = 'none';
        selectedCardsForDeletion.clear();
    }
}

// Toggle card selection for deletion
function toggleCardSelection(cardId) {
    if (selectedCardsForDeletion.has(cardId)) {
        selectedCardsForDeletion.delete(cardId);
    } else {
        selectedCardsForDeletion.add(cardId);
    }
    updateConfirmDeleteButton();
}

// Update confirm delete button state
function updateConfirmDeleteButton() {
    const confirmBtn = document.getElementById('confirm-delete-btn');
    if (confirmBtn) {
        const count = selectedCardsForDeletion.size;
        confirmBtn.textContent = `Delete Selected (${count})`;
        confirmBtn.style.opacity = count > 0 ? '1' : '0.5';
        confirmBtn.style.pointerEvents = count > 0 ? 'auto' : 'none';
    }
}

// Confirm and execute card deletion
function confirmDeleteCards() {
    if (selectedCardsForDeletion.size === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedCardsForDeletion.size} card(s)? This action cannot be undone.`)) {
        // Remove cards from collection
        window.domainVaultData.cards = window.domainVaultData.cards.filter(card => !selectedCardsForDeletion.has(card.id));
        
        // Replace deleted equipped cards with null to preserve slot positions
        window.domainVaultData.equippedCards = window.domainVaultData.equippedCards.map(cardId => 
            selectedCardsForDeletion.has(cardId) ? null : cardId
        );
        
        // Save changes
        saveDomainVaultData();
        
        // Re-render everything
        document.getElementById('equipped-slots').innerHTML = renderEquippedSlots();
        document.getElementById('cards-grid').innerHTML = renderCards();
        initializeDragAndDrop();
        setupEventListeners();
        
        // Close modal
        closeDeleteCardsModal();
        
        // Show notification
        if (window.showNotification) {
            window.showNotification(`Successfully deleted ${selectedCardsForDeletion.size} card(s)!`, 'success');
        }
    }
}

// Set up global domain change listeners (called on page load)
function setupGlobalDomainChangeListeners() {
    // Set up listeners immediately if DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupDomainChangeListeners);
    } else {
        setupDomainChangeListeners();
    }
    
    // Also set up listeners when the domain vault tab is shown
    const domainVaultTab = document.querySelector('[data-target="domain-vault-tab-content"]');
    if (domainVaultTab) {
        domainVaultTab.addEventListener('click', () => {
            // Small delay to ensure the tab content is rendered
            setTimeout(setupDomainChangeListeners, 100);
        });
    }
}

// Update domain vault when header domains change
function updateDomainVaultFromHeader() {
    const domainVaultContent = document.getElementById('domain-vault-tab-content');
    if (!domainVaultContent) return;
    
    const domainVaultContainer = domainVaultContent.querySelector('.domain-vault-container');
    if (!domainVaultContainer) return;
    
    const domains = getDomainNames();
    
    // Update the domain display in the header
    const domainDisplay = domainVaultContainer.querySelector('.domain-display');
    if (domainDisplay) {
        domainDisplay.innerHTML = `
            <span class="domain-name">${domains.domain1}</span>
            <span class="domain-separator">||</span>
            <span class="domain-name">${domains.domain2}</span>
        `;
    }
    
    // Update domain options in create card modal
    const createDomainSelect = document.getElementById('card-domain');
    if (createDomainSelect) {
        createDomainSelect.innerHTML = `
            <option value="${domains.domain1}">${domains.domain1}</option>
            <option value="${domains.domain2}">${domains.domain2}</option>
        `;
    }
    
    // Update domain options in edit card modal
    const editDomainSelect = document.getElementById('edit-card-domain');
    if (editDomainSelect) {
        editDomainSelect.innerHTML = `
            <option value="${domains.domain1}">${domains.domain1}</option>
            <option value="${domains.domain2}">${domains.domain2}</option>
        `;
    }
}

// Domain Vault will be initialized by the main tab switching logic in script.js

// Domain Vault initialization - cleaned up and production ready

// Set up global domain change listeners
setupGlobalDomainChangeListeners();