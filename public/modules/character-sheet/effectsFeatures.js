// Effects & Features Module
// Manages character features and effects cards with different types and highlighting

// Card types for Effects & Features
const FEATURE_CARD_TYPES = ['Hope', 'Class', 'Subclass', 'Ancestry', 'Community'];

// Default color for feature cards
const DEFAULT_FEATURE_COLOR = '#6c5ce7';

// Initialize effects and features data structure
window.window.effectsFeaturesData = {
    cards: [],
    highlightedCards: [] // Array of card IDs that are highlighted (max 5)
};

// Load effects and features data from localStorage
try {
    // Initialize with defaults - will be populated when character loads from cloud  
const savedData = null; // Don't load from localStorage
    if (savedData) {
        window.effectsFeaturesData = JSON.parse(savedData);
    }
} catch (error) {
    console.error('Error loading effects and features data:', error);
    window.effectsFeaturesData = { cards: [], highlightedCards: [] };
}

// Save effects and features data to localStorage
function saveEffectsFeaturesData() {
    try {
        const dataString = JSON.stringify(window.effectsFeaturesData);
        // Trigger auto-save instead of localStorage
  }
    } catch (error) {
        console.error('Error saving effects and features data:', error);
    }
}

// Generate unique ID for feature cards
function generateFeatureCardId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}

// Initialize Effects & Features tab
function initializeEffectsFeatures() {
    const tabContent = document.getElementById('effects-features-tab-content');
    if (tabContent) {
        tabContent.innerHTML = renderEffectsFeatures();
        setupEventListeners();
    }
}

// Render the Effects & Features tab content
function renderEffectsFeatures() {
    return `
        <div class="effects-features-container">
            <div class="effects-features-header">
                <h3>Effects & Features</h3>
                <button class="button primary-btn" id="create-feature-btn">Create New Feature</button>
            </div>
            
            <!-- Highlighted Cards Section -->
            <div class="highlighted-cards-section" id="highlighted-cards-section" style="margin-bottom: 30px; ${window.effectsFeaturesData.highlightedCards.length > 0 ? '' : 'display: none;'}">
                <h4 style="color: var(--accent-color); margin-bottom: 15px;">Highlighted Features</h4>
                <div class="highlighted-cards-grid" id="highlighted-cards-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
                    ${renderHighlightedCards()}
                </div>
            </div>
            
            <!-- Cards by Type -->
            <div class="feature-cards-by-type">
                ${FEATURE_CARD_TYPES.map(type => renderCardsByType(type)).join('')}
            </div>
        </div>

        <!-- Create Feature Modal -->
        <div id="create-feature-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 10000; align-items: center; justify-content: center;">
            <div style="background: var(--glass-background-color); backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 12px; padding: 20px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto; color: var(--text-color);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 10px;">
                    <h3 style="margin: 0; color: var(--text-color);">Create New Feature</h3>
                    <button type="button" onclick="closeCreateFeatureModal()" style="background: none; border: none; color: var(--text-color); font-size: 20px; cursor: pointer; padding: 5px; border-radius: 50%; width: 30px; height: 30px;">×</button>
                </div>
                <div>
                    <div style="margin-bottom: 15px;">
                        <label for="feature-name" style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--text-color);">Feature Name</label>
                        <input type="text" id="feature-name" placeholder="Enter feature name" style="width: 100%; padding: 10px; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; background: rgba(255, 255, 255, 0.1); color: var(--text-color); backdrop-filter: blur(10px);">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label for="feature-description" style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--text-color);">Description</label>
                        <textarea id="feature-description" placeholder="Describe the feature's effect or ability" rows="3" style="width: 100%; padding: 10px; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; background: rgba(255, 255, 255, 0.1); color: var(--text-color); backdrop-filter: blur(10px); resize: vertical;"></textarea>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label for="feature-type" style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--text-color);">Feature Type</label>
                        <select id="feature-type" style="width: 100%; padding: 10px; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; background: rgba(255, 255, 255, 0.1); color: var(--text-color); backdrop-filter: blur(10px);">
                            ${FEATURE_CARD_TYPES.map(type => `<option value="${type}">${type}</option>`).join('')}
                        </select>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                        <div>
                            <label for="feature-color" style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--text-color);">Card Color</label>
                            <input type="color" id="feature-color" value="${DEFAULT_FEATURE_COLOR}" style="width: 60px; height: 40px; padding: 0; border: 2px solid rgba(255, 255, 255, 0.2); border-radius: 8px; cursor: pointer; background: none;">
                        </div>
                        <div>
                            <label for="feature-image" style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--text-color);">Feature Image (Optional)</label>
                            <input type="file" id="feature-image" accept="image/*" style="width: 100%; padding: 8px; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; background: rgba(255, 255, 255, 0.1); color: var(--text-color); backdrop-filter: blur(10px); font-size: 0.8rem;">
                        </div>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label for="feature-tokens" style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--text-color);">Fillable Tokens (Optional)</label>
                        <textarea id="feature-tokens" placeholder="Enter token names separated by commas (e.g., Uses, Charges, Duration)" rows="2" style="width: 100%; padding: 10px; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; background: rgba(255, 255, 255, 0.1); color: var(--text-color); backdrop-filter: blur(10px); resize: vertical;"></textarea>
                    </div>
                </div>
                <div style="display: flex; gap: 10px; justify-content: flex-end; padding-top: 15px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                    <button onclick="saveNewFeature()" style="background: var(--accent-color); color: #000; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold;">Create Feature</button>
                    <button onclick="closeCreateFeatureModal()" style="background: rgba(255, 255, 255, 0.1); color: var(--text-color); border: 1px solid rgba(255, 255, 255, 0.2); padding: 10px 20px; border-radius: 6px; cursor: pointer;">Cancel</button>
                </div>
            </div>
        </div>

        <!-- Edit Feature Modal -->
        <div id="edit-feature-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 10000; align-items: center; justify-content: center;">
            <div style="background: var(--glass-background-color); backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 12px; padding: 20px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto; color: var(--text-color);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 10px;">
                    <h3 style="margin: 0; color: var(--text-color);">Edit Feature</h3>
                    <button type="button" onclick="closeEditFeatureModal()" style="background: none; border: none; color: var(--text-color); font-size: 20px; cursor: pointer; padding: 5px; border-radius: 50%; width: 30px; height: 30px;">×</button>
                </div>
                <div>
                    <div style="margin-bottom: 15px;">
                        <label for="edit-feature-name" style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--text-color);">Feature Name</label>
                        <input type="text" id="edit-feature-name" placeholder="Enter feature name" style="width: 100%; padding: 10px; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; background: rgba(255, 255, 255, 0.1); color: var(--text-color); backdrop-filter: blur(10px);">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label for="edit-feature-description" style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--text-color);">Description</label>
                        <textarea id="edit-feature-description" placeholder="Describe the feature's effect or ability" rows="3" style="width: 100%; padding: 10px; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; background: rgba(255, 255, 255, 0.1); color: var(--text-color); backdrop-filter: blur(10px); resize: vertical;"></textarea>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label for="edit-feature-type" style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--text-color);">Feature Type</label>
                        <select id="edit-feature-type" style="width: 100%; padding: 10px; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; background: rgba(255, 255, 255, 0.1); color: var(--text-color); backdrop-filter: blur(10px);">
                            ${FEATURE_CARD_TYPES.map(type => `<option value="${type}">${type}</option>`).join('')}
                        </select>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                        <div>
                            <label for="edit-feature-color" style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--text-color);">Card Color</label>
                            <input type="color" id="edit-feature-color" value="${DEFAULT_FEATURE_COLOR}" style="width: 60px; height: 40px; padding: 0; border: 2px solid rgba(255, 255, 255, 0.2); border-radius: 8px; cursor: pointer; background: none;">
                        </div>
                        <div>
                            <label for="edit-feature-image" style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--text-color);">Feature Image (Optional)</label>
                            <input type="file" id="edit-feature-image" accept="image/*" style="width: 100%; padding: 8px; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; background: rgba(255, 255, 255, 0.1); color: var(--text-color); backdrop-filter: blur(10px); font-size: 0.8rem;">
                        </div>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label for="edit-feature-tokens" style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--text-color);">Fillable Tokens (Optional)</label>
                        <textarea id="edit-feature-tokens" placeholder="Enter token names separated by commas (e.g., Uses, Charges, Duration)" rows="2" style="width: 100%; padding: 10px; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; background: rgba(255, 255, 255, 0.1); color: var(--text-color); backdrop-filter: blur(10px); resize: vertical;"></textarea>
                    </div>
                </div>
                <div style="display: flex; gap: 10px; justify-content: flex-end; padding-top: 15px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                    <button onclick="saveEditedFeature()" style="background: var(--accent-color); color: #000; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold;">Save Changes</button>
                    <button onclick="deleteFeature()" style="background: #e74c3c; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold;">Delete Feature</button>
                    <button onclick="closeEditFeatureModal()" style="background: rgba(255, 255, 255, 0.1); color: var(--text-color); border: 1px solid rgba(255, 255, 255, 0.2); padding: 10px 20px; border-radius: 6px; cursor: pointer;">Cancel</button>
                </div>
            </div>
        </div>
    `;
}

// Render highlighted cards section
function renderHighlightedCards() {
    return window.effectsFeaturesData.highlightedCards.map(cardId => {
        const card = window.effectsFeaturesData.cards.find(c => c.id === cardId);
        if (!card) return '';
        return renderFeatureCard(card, true);
    }).join('');
}

// Render cards by type
function renderCardsByType(type) {
    const cardsOfType = window.effectsFeaturesData.cards.filter(card => card.type === type);
    if (cardsOfType.length === 0) return '';
    
    return `
        <div class="feature-type-section" style="margin-bottom: 30px;">
            <h4 style="color: var(--text-color); margin-bottom: 15px; padding-bottom: 5px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">${type}</h4>
            <div class="feature-cards-grid" data-type="${type}" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px;">
                ${cardsOfType.map(card => renderFeatureCard(card, false)).join('')}
            </div>
        </div>
    `;
}

// Render individual feature card
function renderFeatureCard(card, isHighlighted = false) {
    const isHighlightedClass = isHighlighted ? 'highlighted' : '';
    const highlightStyle = isHighlighted ? 'border: 3px solid var(--accent-color); box-shadow: 0 0 15px rgba(255, 193, 7, 0.5);' : '';
    
    let imageHtml = '';
    if (card.image) {
        imageHtml = `<div class="feature-image" style="background-image: url('${card.image}'); background-size: cover; background-position: center; background-repeat: no-repeat; height: 120px; border-radius: 8px; margin-bottom: 10px;"></div>`;
    }
    
    let tokensHtml = '';
    if (card.tokens && card.tokens.length > 0) {
        tokensHtml = `
            <div class="feature-tokens" style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                ${card.tokens.map(token => `
                    <div class="token-item" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                        <span style="font-size: 0.8rem; color: rgba(255, 255, 255, 0.8);">${token.name}:</span>
                        <input type="text" value="${token.value || ''}" placeholder="0" 
                               style="width: 40px; padding: 2px 5px; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 3px; background: rgba(255, 255, 255, 0.1); color: var(--text-color); font-size: 0.8rem; text-align: center;"
                               onchange="updateTokenValue('${card.id}', '${token.name}', this.value)">
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    return `
        <div class="feature-card ${isHighlightedClass}" 
             data-card-id="${card.id}" 
             data-type="${card.type}"
             style="background-color: ${card.color}; border: 2px solid rgba(255, 255, 255, 0.3); border-radius: 8px; padding: 15px; cursor: move; resize: both; overflow: auto; min-width: 200px; min-height: 150px; ${highlightStyle}">
            <div class="feature-card-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                <div class="feature-name" style="font-weight: bold; color: var(--text-color); font-size: 1.1rem; margin-right: 10px;">${card.name}</div>
                <div class="feature-actions" style="display: flex; gap: 5px;">
                    <button class="feature-action-btn highlight-btn" onclick="toggleHighlight('${card.id}')" title="${isHighlighted ? 'Remove highlight' : 'Highlight card'}" style="background: ${isHighlighted ? 'var(--accent-color)' : 'rgba(255, 255, 255, 0.2)'}; color: ${isHighlighted ? '#000' : 'var(--text-color)'}; border: none; padding: 3px 6px; border-radius: 3px; font-size: 0.7rem; cursor: pointer;">${isHighlighted ? '★' : '☆'}</button>
                    <button class="feature-action-btn edit-btn" onclick="editFeature('${card.id}')" title="Edit feature" style="background: rgba(255, 255, 255, 0.2); color: var(--text-color); border: none; padding: 3px 6px; border-radius: 3px; font-size: 0.7rem; cursor: pointer;">✎</button>
                </div>
            </div>
            <div class="feature-type-badge" style="background: rgba(255, 255, 255, 0.2); color: var(--text-color); padding: 2px 8px; border-radius: 12px; font-size: 0.7rem; display: inline-block; margin-bottom: 10px;">${card.type}</div>
            ${imageHtml}
            <div class="feature-description" style="color: var(--text-color); font-size: 0.9rem; line-height: 1.4; margin-bottom: 10px;">${card.description}</div>
            ${tokensHtml}
        </div>
    `;
}

// Set up event listeners
function setupEventListeners() {
    // Create feature button
    const createFeatureBtn = document.getElementById('create-feature-btn');
    if (createFeatureBtn) {
        createFeatureBtn.removeEventListener('click', showCreateFeatureModal);
        createFeatureBtn.addEventListener('click', showCreateFeatureModal);
    }
    
    // Initialize drag and drop for feature cards
    initializeFeatureDragAndDrop();
}

// Initialize drag and drop functionality for feature cards
function initializeFeatureDragAndDrop() {
    // Make feature cards draggable and resizable
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        makeCardDraggable(card);
        makeCardResizable(card);
    });
}

// Make a card draggable
function makeCardDraggable(card) {
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    card.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    function dragStart(e) {
        if (e.target.closest('.feature-action-btn')) return; // Don't drag when clicking buttons
        
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
        
        if (e.target === card) {
            isDragging = true;
        }
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            xOffset = currentX;
            yOffset = currentY;
            
            setTranslate(currentX, currentY, card);
        }
    }

    function dragEnd(e) {
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
    }

    function setTranslate(xPos, yPos, el) {
        el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
    }
}

// Make a card resizable
function makeCardResizable(card) {
    const resizer = document.createElement('div');
    resizer.style.cssText = `
        position: absolute;
        bottom: 0;
        right: 0;
        width: 10px;
        height: 10px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 0 0 8px 0;
        cursor: se-resize;
        z-index: 10;
    `;
    card.appendChild(resizer);
    card.style.position = 'relative';

    let isResizing = false;
    let startWidth, startHeight, startX, startY;

    resizer.addEventListener('mousedown', startResize);
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResize);

    function startResize(e) {
        isResizing = true;
        startWidth = card.offsetWidth;
        startHeight = card.offsetHeight;
        startX = e.clientX;
        startY = e.clientY;
        e.preventDefault();
    }

    function resize(e) {
        if (!isResizing) return;
        
        const width = startWidth + (e.clientX - startX);
        const height = startHeight + (e.clientY - startY);
        
        card.style.width = Math.max(200, width) + 'px';
        card.style.height = Math.max(150, height) + 'px';
    }

    function stopResize() {
        isResizing = false;
    }
}

// Show create feature modal
function showCreateFeatureModal() {
    const modal = document.getElementById('create-feature-modal');
    if (modal) {
        // Reset form
        const nameInput = document.getElementById('feature-name');
        const descInput = document.getElementById('feature-description');
        const typeInput = document.getElementById('feature-type');
        const colorInput = document.getElementById('feature-color');
        const imageInput = document.getElementById('feature-image');
        const tokensInput = document.getElementById('feature-tokens');
        
        if (nameInput) nameInput.value = '';
        if (descInput) descInput.value = '';
        if (typeInput) typeInput.value = FEATURE_CARD_TYPES[0];
        if (colorInput) colorInput.value = DEFAULT_FEATURE_COLOR;
        if (imageInput) imageInput.value = '';
        if (tokensInput) tokensInput.value = '';
        
        modal.style.display = 'flex';
    }
}

// Close create feature modal
function closeCreateFeatureModal() {
    const modal = document.getElementById('create-feature-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Handle image upload with automatic compression
function handleFeatureImageUpload(file) {
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

// Save new feature
async function saveNewFeature() {
    const name = document.getElementById('feature-name').value.trim();
    const description = document.getElementById('feature-description').value.trim();
    const type = document.getElementById('feature-type').value;
    const color = document.getElementById('feature-color').value;
    const imageFile = document.getElementById('feature-image').files[0];
    const tokensText = document.getElementById('feature-tokens').value.trim();

    // Validation
    if (!name || !description) {
        if (window.showNotification) {
            window.showNotification('Name and description are required.', 'error');
        }
        return;
    }

    // Handle image upload
    const image = await handleFeatureImageUpload(imageFile);
    
    // Parse tokens
    let tokens = [];
    if (tokensText) {
        tokens = tokensText.split(',').map(token => ({
            name: token.trim(),
            value: ''
        }));
    }

    // Create new feature
    const newFeature = {
        id: generateFeatureCardId(),
        name,
        description,
        type,
        color,
        image,
        tokens
    };

    window.effectsFeaturesData.cards.push(newFeature);
    saveEffectsFeaturesData();
    
    // Re-render
    const tabContent = document.getElementById('effects-features-tab-content');
    if (tabContent) {
        tabContent.innerHTML = renderEffectsFeatures();
        setupEventListeners();
    }
    
    closeCreateFeatureModal();
    
    if (window.showNotification) {
        window.showNotification('Feature created successfully!', 'success');
    }
}

// Edit feature
let editingFeatureId = null;

function editFeature(featureId) {
    const feature = window.effectsFeaturesData.cards.find(c => c.id === featureId);
    if (!feature) return;

    editingFeatureId = featureId;
    
    // Populate edit form
    document.getElementById('edit-feature-name').value = feature.name;
    document.getElementById('edit-feature-description').value = feature.description;
    document.getElementById('edit-feature-type').value = feature.type;
    document.getElementById('edit-feature-color').value = feature.color;
    document.getElementById('edit-feature-tokens').value = feature.tokens ? feature.tokens.map(t => t.name).join(', ') : '';
    
    // Show modal
    document.getElementById('edit-feature-modal').style.display = 'flex';
}

// Close edit feature modal
function closeEditFeatureModal() {
    document.getElementById('edit-feature-modal').style.display = 'none';
    editingFeatureId = null;
}

// Save edited feature
async function saveEditedFeature() {
    if (!editingFeatureId) return;

    const featureIndex = window.effectsFeaturesData.cards.findIndex(c => c.id === editingFeatureId);
    if (featureIndex === -1) return;

    const name = document.getElementById('edit-feature-name').value.trim();
    const description = document.getElementById('edit-feature-description').value.trim();
    const type = document.getElementById('edit-feature-type').value;
    const color = document.getElementById('edit-feature-color').value;
    const imageFile = document.getElementById('edit-feature-image').files[0];
    const tokensText = document.getElementById('edit-feature-tokens').value.trim();

    // Validation
    if (!name || !description) {
        if (window.showNotification) {
            window.showNotification('Name and description are required.', 'error');
        }
        return;
    }

    // Handle image upload (keep existing image if no new one is uploaded)
    const newImage = await handleFeatureImageUpload(imageFile);
    const image = newImage || window.effectsFeaturesData.cards[featureIndex].image;
    
    // Parse tokens
    let tokens = [];
    if (tokensText) {
        tokens = tokensText.split(',').map(token => ({
            name: token.trim(),
            value: ''
        }));
    }

    // Update feature
    window.effectsFeaturesData.cards[featureIndex] = {
        ...window.effectsFeaturesData.cards[featureIndex],
        name,
        description,
        type,
        color,
        image,
        tokens
    };

    saveEffectsFeaturesData();
    
    // Re-render
    const tabContent = document.getElementById('effects-features-tab-content');
    if (tabContent) {
        tabContent.innerHTML = renderEffectsFeatures();
        setupEventListeners();
    }
    
    closeEditFeatureModal();
    
    if (window.showNotification) {
        window.showNotification('Feature updated successfully!', 'success');
    }
}

// Delete feature
function deleteFeature() {
    if (!editingFeatureId) return;

    if (confirm('Are you sure you want to delete this feature? This action cannot be undone.')) {
        // Remove from cards
        window.effectsFeaturesData.cards = window.effectsFeaturesData.cards.filter(c => c.id !== editingFeatureId);
        
        // Remove from highlighted cards
        window.effectsFeaturesData.highlightedCards = window.effectsFeaturesData.highlightedCards.filter(id => id !== editingFeatureId);
        
        saveEffectsFeaturesData();
        
        // Re-render
        const tabContent = document.getElementById('effects-features-tab-content');
        if (tabContent) {
            tabContent.innerHTML = renderEffectsFeatures();
            setupEventListeners();
        }
        
        closeEditFeatureModal();
        
        if (window.showNotification) {
            window.showNotification('Feature deleted successfully!', 'success');
        }
    }
}

// Toggle highlight for a card
function toggleHighlight(cardId) {
    const isHighlighted = window.effectsFeaturesData.highlightedCards.includes(cardId);
    
    if (isHighlighted) {
        // Remove highlight
        window.effectsFeaturesData.highlightedCards = window.effectsFeaturesData.highlightedCards.filter(id => id !== cardId);
    } else {
        // Add highlight (max 5)
        if (window.effectsFeaturesData.highlightedCards.length >= 5) {
            if (window.showNotification) {
                window.showNotification('You can only highlight up to 5 cards. Remove a highlight first.', 'error');
            }
            return;
        }
        window.effectsFeaturesData.highlightedCards.push(cardId);
    }
    
    saveEffectsFeaturesData();
    
    // Re-render
    const tabContent = document.getElementById('effects-features-tab-content');
    if (tabContent) {
        tabContent.innerHTML = renderEffectsFeatures();
        setupEventListeners();
    }
}

// Update token value
function updateTokenValue(cardId, tokenName, value) {
    const card = window.effectsFeaturesData.cards.find(c => c.id === cardId);
    if (!card || !card.tokens) return;
    
    const token = card.tokens.find(t => t.name === tokenName);
    if (token) {
        token.value = value;
        saveEffectsFeaturesData();
    }
}

// Make functions globally available
window.initializeEffectsFeatures = initializeEffectsFeatures;
window.showCreateFeatureModal = showCreateFeatureModal;
window.closeCreateFeatureModal = closeCreateFeatureModal;
window.saveNewFeature = saveNewFeature;
window.editFeature = editFeature;
window.closeEditFeatureModal = closeEditFeatureModal;
window.saveEditedFeature = saveEditedFeature;
window.deleteFeature = deleteFeature;
window.toggleHighlight = toggleHighlight;
window.updateTokenValue = updateTokenValue;