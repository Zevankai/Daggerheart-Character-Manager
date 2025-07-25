// ===== EQUIPMENT MODULE =====
// This module handles all equipment-related functionality including:
// 1. Equipment overview with equipped items and gold count
// 2. Weapons, armor, clothing, and jewelry management
// 3. Consumables (potions, canisters, food) management
// 4. Quest items management
// 5. Gold tracking system with coins, pouches, chests, and banks
// 6. Integration with Active Weapons and Armor sections

// ===== EQUIPMENT DATA STRUCTURE =====
let equipmentData = {
    // Equipped items (visual slots on character silhouette)
    equipped: {
        primaryWeapon: null,    // Left hand
        secondaryWeapon: null,  // Right hand
        armor: null,            // Head/torso
        clothing: null,         // Chest
        jewelry: [null, null, null], // Neck area (3 slots)
        belt: [null, null, null, null, null], // Waist area - consumables/quest items (5 slots)
    },
    // All items inventory organized by category
    inventory: {
        'Gear': [],
        'Utility': [],
        'Quest': [],
        'Crafting': [],
        'Personal': []
    },
    // Gold tracking
    gold: {
        coins: 0, // 0-10
        pouches: 0, // 0-10
        chest: 0, // 0-1
        equippedPouches: 0, // 0-2 (equipped on person)
        banks: [] // Array of {location: string, chests: number}
    },
    // Search and filter state
    searchTerm: '',
    selectedCategory: 'All',
    selectedTags: []
};

// ===== ITEM TYPES AND CATEGORIES =====
const itemCategories = {
    'Gear': ['weapon', 'armor', 'potion', 'flask', 'ammunition'],
    'Utility': ['adventure', 'tool', 'food', 'map', 'camp'],
    'Quest': ['npc-item', 'evidence', 'literature', 'magical'],
    'Crafting': ['materials', 'components'],
    'Personal': ['personal'] // Items can be manually relocated here
};

const itemTypes = [
    'weapon', 'armor', 'potion', 'flask', 'ammunition',
    'adventure', 'tool', 'food', 'map', 'camp',
    'npc-item', 'evidence', 'literature', 'magical',
    'materials', 'components', 'personal'
];

const additionalTags = [
    'Rare', 'Tradable', 'Personal', 'Custom', 'Valuable', 'Consumable', 'Magical', 'Cursed'
];

const encumbranceWeights = {
    'weapon': 3,
    'armor': 10,
    'clothing': 3,
    'camp': 2,
    'potion': 1,
    'flask': 1,
    'ammunition': 1,
    'adventure': 1,
    'tool': 1,
    'food': 1,
    'map': 1,
    'npc-item': 1,
    'evidence': 1,
    'literature': 1,
    'magical': 1,
    'materials': 1,
    'components': 1,
    'personal': 1
};

const abilities = [
    'Agility', 'Strength', 'Finesse', 
    'Instinct', 'Presence', 'Knowledge'
];

// ===== UTILITY FUNCTIONS =====
function calculateEncumbrance() {
    let totalWeight = 0;
    
    // Calculate equipped items weight
    const equipped = equipmentData.equipped;
    if (equipped.primaryWeapon) totalWeight += encumbranceWeights[equipped.primaryWeapon.type] || 1;
    if (equipped.secondaryWeapon) totalWeight += encumbranceWeights[equipped.secondaryWeapon.type] || 1;
    if (equipped.armor) totalWeight += encumbranceWeights[equipped.armor.type] || 1;
    if (equipped.clothing) totalWeight += encumbranceWeights[equipped.clothing.type] || 1;
    
    equipped.jewelry.forEach(item => {
        if (item) totalWeight += 1; // Jewelry is always 1 unit
    });
    
    equipped.belt.forEach(item => {
        if (item) totalWeight += encumbranceWeights[item.type] || 1;
    });
    
    // Calculate carried (unequipped) items weight
    Object.values(equipmentData.inventory).forEach(categoryItems => {
        categoryItems.forEach(item => {
            if (!isItemEquipped(item, item.type)) {
                totalWeight += encumbranceWeights[item.type] || 1;
            }
        });
    });
    
    return totalWeight;
}

function isEncumbered() {
    return calculateEncumbrance() > 30;
}

function getItemCategory(itemType) {
    for (const [category, types] of Object.entries(itemCategories)) {
        if (types.includes(itemType)) {
            return category;
        }
    }
    return 'Personal'; // Default category
}

function getAllItems() {
    let allItems = [];
    Object.values(equipmentData.inventory).forEach(categoryItems => {
        allItems = allItems.concat(categoryItems);
    });
    return allItems;
}

function searchItems(searchTerm, category = 'All', tags = []) {
    let items = getAllItems();
    
    // Filter by search term
    if (searchTerm) {
        items = items.filter(item => 
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (item.features && item.features.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }
    
    // Filter by category
    if (category !== 'All') {
        items = items.filter(item => getItemCategory(item.type) === category);
    }
    
    // Filter by tags
    if (tags.length > 0) {
        items = items.filter(item => 
            item.tags && tags.every(tag => item.tags.includes(tag))
        );
    }
    
    return items;
}

// ===== EQUIPMENT OVERVIEW =====
function renderEquipmentOverview() {
    const equipmentTabContent = document.getElementById('equipment-tab-content');
    
    const encumbrance = calculateEncumbrance();
    const isOverEncumbered = isEncumbered();
    
    equipmentTabContent.innerHTML = `
        <div class="equipment-container">
            <div class="equipment-header">
                <h2>Equipment Overview</h2>
                ${isOverEncumbered ? '<div class="encumbrance-warning">⚠️ ENCUMBERED - Carrying too much weight!</div>' : ''}
                <div class="encumbrance-display">
                    <span class="encumbrance-text">Encumbrance: ${encumbrance}/30 units</span>
                    <div class="encumbrance-bar">
                        <div class="encumbrance-fill" style="width: ${Math.min((encumbrance / 30) * 100, 100)}%"></div>
                    </div>
                </div>
                <div class="equipment-nav">
                    <button class="equipment-nav-btn active" data-section="overview">Overview</button>
                    <button class="equipment-nav-btn" data-section="inventory">Inventory</button>
                    <button class="equipment-nav-btn" data-section="gold">Gold Tracker</button>
                </div>
            </div>
            
            <div id="equipment-content">
                ${renderOverviewContent()}
            </div>
        </div>
    `;
    
    // Add navigation listeners
    document.querySelectorAll('.equipment-nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const section = e.target.dataset.section;
            switchEquipmentSection(section);
        });
    });
}

function renderOverviewContent() {
    const equipped = equipmentData.equipped;
    const gold = equipmentData.gold;
    
    return `
        <div class="overview-section">
            <div class="character-silhouette-container">
                <h3>Currently Equipped</h3>
                <div class="character-silhouette">
                    <!-- Character outline -->
                    <svg viewBox="0 0 200 300" class="character-svg">
                        <!-- Head -->
                        <circle cx="100" cy="40" r="25" fill="none" stroke="var(--text-color)" stroke-width="2" opacity="0.3"/>
                        <!-- Armor slot (head/helmet) -->
                        <circle cx="100" cy="40" r="30" fill="${equipped.armor ? 'var(--accent-color)' : 'none'}" 
                                stroke="var(--accent-color)" stroke-width="2" opacity="${equipped.armor ? '0.7' : '0.3'}" 
                                class="equipment-slot" data-slot="armor"/>
                        
                        <!-- Body -->
                        <rect x="75" y="65" width="50" height="80" rx="10" fill="none" stroke="var(--text-color)" stroke-width="2" opacity="0.3"/>
                        <!-- Clothing slot (chest) -->
                        <rect x="80" y="70" width="40" height="30" rx="5" fill="${equipped.clothing ? 'var(--accent-color)' : 'none'}" 
                              stroke="var(--accent-color)" stroke-width="2" opacity="${equipped.clothing ? '0.7' : '0.3'}" 
                              class="equipment-slot" data-slot="clothing"/>
                        
                        <!-- Jewelry slots (neck area) -->
                        <circle cx="85" cy="55" r="4" fill="${equipped.jewelry[0] ? 'var(--accent-color)' : 'none'}" 
                                stroke="var(--accent-color)" stroke-width="1" opacity="${equipped.jewelry[0] ? '0.8' : '0.3'}" 
                                class="equipment-slot jewelry-slot" data-slot="jewelry" data-index="0"/>
                        <circle cx="100" cy="50" r="4" fill="${equipped.jewelry[1] ? 'var(--accent-color)' : 'none'}" 
                                stroke="var(--accent-color)" stroke-width="1" opacity="${equipped.jewelry[1] ? '0.8' : '0.3'}" 
                                class="equipment-slot jewelry-slot" data-slot="jewelry" data-index="1"/>
                        <circle cx="115" cy="55" r="4" fill="${equipped.jewelry[2] ? 'var(--accent-color)' : 'none'}" 
                                stroke="var(--accent-color)" stroke-width="1" opacity="${equipped.jewelry[2] ? '0.8' : '0.3'}" 
                                class="equipment-slot jewelry-slot" data-slot="jewelry" data-index="2"/>
                        
                        <!-- Arms -->
                        <rect x="45" y="70" width="20" height="50" rx="10" fill="none" stroke="var(--text-color)" stroke-width="2" opacity="0.3"/>
                        <rect x="135" y="70" width="20" height="50" rx="10" fill="none" stroke="var(--text-color)" stroke-width="2" opacity="0.3"/>
                        
                        <!-- Weapon slots (hands) -->
                        <circle cx="40" cy="125" r="8" fill="${equipped.primaryWeapon ? 'var(--accent-color)' : 'none'}" 
                                stroke="var(--accent-color)" stroke-width="2" opacity="${equipped.primaryWeapon ? '0.8' : '0.3'}" 
                                class="equipment-slot" data-slot="primaryWeapon"/>
                        <circle cx="160" cy="125" r="8" fill="${equipped.secondaryWeapon ? 'var(--accent-color)' : 'none'}" 
                                stroke="var(--accent-color)" stroke-width="2" opacity="${equipped.secondaryWeapon ? '0.8' : '0.3'}" 
                                class="equipment-slot" data-slot="secondaryWeapon"/>
                        
                        <!-- Belt area (consumables/quest items) -->
                        <rect x="70" y="140" width="60" height="10" rx="5" fill="none" stroke="var(--text-color)" stroke-width="1" opacity="0.3"/>
                        ${equipped.belt.map((item, i) => `
                            <rect x="${75 + (i * 10)}" y="142" width="8" height="6" rx="2" 
                                  fill="${item ? 'var(--accent-color)' : 'none'}" 
                                  stroke="var(--accent-color)" stroke-width="1" 
                                  opacity="${item ? '0.8' : '0.3'}" 
                                  class="equipment-slot belt-slot" data-slot="belt" data-index="${i}"/>
                        `).join('')}
                        
                        <!-- Legs -->
                        <rect x="80" y="150" width="15" height="60" rx="7" fill="none" stroke="var(--text-color)" stroke-width="2" opacity="0.3"/>
                        <rect x="105" y="150" width="15" height="60" rx="7" fill="none" stroke="var(--text-color)" stroke-width="2" opacity="0.3"/>
                    </svg>
                    
                    <!-- Equipment details -->
                    <div class="equipment-details">
                        <div class="equipment-slot-info">
                            <h4>Primary Weapon</h4>
                            <span>${equipped.primaryWeapon ? equipped.primaryWeapon.name : 'Empty'}</span>
                        </div>
                        <div class="equipment-slot-info">
                            <h4>Secondary Weapon</h4>
                            <span>${equipped.secondaryWeapon ? equipped.secondaryWeapon.name : 'Empty'}</span>
                        </div>
                        <div class="equipment-slot-info">
                            <h4>Armor</h4>
                            <span>${equipped.armor ? equipped.armor.name : 'Empty'}</span>
                        </div>
                        <div class="equipment-slot-info">
                            <h4>Clothing</h4>
                            <span>${equipped.clothing ? equipped.clothing.name : 'Empty'}</span>
                        </div>
                        <div class="equipment-slot-info">
                            <h4>Jewelry</h4>
                            <div class="jewelry-list">
                                ${equipped.jewelry.map((item, i) => 
                                    `<span class="jewelry-item">${item ? item.name : `Slot ${i+1}: Empty`}</span>`
                                ).join('')}
                            </div>
                        </div>
                        <div class="equipment-slot-info">
                            <h4>Belt Items</h4>
                            <div class="belt-list">
                                ${equipped.belt.map((item, i) => 
                                    item ? `<span class="belt-item">${item.name}</span>` : ''
                                ).join('') || '<span class="belt-item">No items</span>'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="gold-summary">
                <h3>Gold Summary</h3>
                <div class="gold-display">
                    <div class="gold-amount">
                        <span class="gold-icon">💰</span>
                        <span class="gold-text">
                            ${gold.chest ? '1 Chest + ' : ''}${gold.pouches} Pouches + ${gold.coins} Coins
                        </span>
                    </div>
                    <div class="gold-equipped">
                        <span class="equipped-gold">Equipped: ${gold.equippedPouches} Pouches</span>
                    </div>
                    ${gold.banks.length > 0 ? `
                        <div class="gold-banks">
                            <span class="bank-gold">Banks: ${gold.banks.reduce((total, bank) => total + bank.chests, 0)} Chests</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

// ===== INVENTORY SECTION =====
function renderInventorySection() {
    return `
        <div class="inventory-section">
            <div class="inventory-header">
                <div class="search-controls">
                    <input type="text" id="item-search" placeholder="Search items..." 
                           value="${equipmentData.searchTerm}" onchange="updateSearch(this.value)">
                    <select id="category-filter" onchange="updateCategoryFilter(this.value)">
                        <option value="All">All Categories</option>
                        ${Object.keys(itemCategories).map(category => 
                            `<option value="${category}" ${equipmentData.selectedCategory === category ? 'selected' : ''}>${category}</option>`
                        ).join('')}
                    </select>
                    <button class="add-item-btn" onclick="showAddItemModal()">+ Add Item</button>
                </div>
            </div>
            
            <div class="inventory-content">
                ${renderInventoryCategories()}
            </div>
        </div>
    `;
}

function renderInventoryCategories() {
    const categories = equipmentData.selectedCategory === 'All' ? 
        Object.keys(itemCategories) : [equipmentData.selectedCategory];
    
    return categories.map(category => {
        const items = equipmentData.inventory[category] || [];
        const filteredItems = equipmentData.searchTerm ? 
            items.filter(item => 
                item.name.toLowerCase().includes(equipmentData.searchTerm.toLowerCase()) ||
                (item.description && item.description.toLowerCase().includes(equipmentData.searchTerm.toLowerCase())) ||
                (item.features && item.features.toLowerCase().includes(equipmentData.searchTerm.toLowerCase()))
            ) : items;
        
        return `
            <div class="inventory-category">
                <h4>${category} (${filteredItems.length})</h4>
                <div class="items-grid compact">
                    ${filteredItems.length > 0 ? 
                        filteredItems.map((item, index) => renderCompactItemCard(item, category, index)).join('') :
                        '<div class="no-items">No items in this category</div>'
                    }
                </div>
            </div>
        `;
    }).join('');
}

// ===== CONSUMABLES SECTION =====
function renderConsumablesSection() {
    return `
        <div class="consumables-section">
            <div class="section-header">
                <h3>Consumables</h3>
                <button class="add-item-btn" onclick="showAddItemModal('potion')">+ Add Item</button>
            </div>
            
            <div class="consumables-categories">
                <div class="consumable-category">
                    <h4>Potions</h4>
                    <div class="items-grid" id="potions-grid">
                        ${renderItemsGrid(equipmentData.inventory.potions, 'potion')}
                    </div>
                </div>
                
                <div class="consumable-category">
                    <h4>Canisters</h4>
                    <div class="items-grid" id="canisters-grid">
                        ${renderItemsGrid(equipmentData.inventory.canisters, 'canister')}
                    </div>
                </div>
                
                <div class="consumable-category">
                    <h4>Food</h4>
                    <div class="items-grid" id="food-grid">
                        ${renderItemsGrid(equipmentData.inventory.food, 'food')}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ===== QUEST ITEMS SECTION =====
function renderQuestSection() {
    return `
        <div class="quest-section">
            <div class="section-header">
                <h3>Quest Items</h3>
                <button class="add-item-btn" onclick="showAddItemModal('quest')">+ Add Quest Item</button>
            </div>
            
            <div class="quest-items">
                <div class="items-grid" id="quest-grid">
                    ${renderItemsGrid(equipmentData.inventory.questItems, 'quest')}
                </div>
            </div>
        </div>
    `;
}

// ===== GOLD TRACKER SECTION =====
function renderGoldSection() {
    const gold = equipmentData.gold;
    
    return `
        <div class="gold-section">
            <h3>Gold Tracker</h3>
            
            <div class="gold-tracker">
                <div class="gold-category">
                    <h4>Coins (${gold.coins}/10)</h4>
                    <div class="gold-circles">
                        ${renderGoldCircles('coins', gold.coins, 10)}
                    </div>
                </div>
                
                <div class="gold-category">
                    <h4>Pouches (${gold.pouches}/10)</h4>
                    <div class="gold-circles">
                        ${renderGoldCircles('pouches', gold.pouches, 10)}
                    </div>
                    <div class="equipped-pouches">
                        <label>Equipped Pouches (${gold.equippedPouches}/2):</label>
                        <div class="equipped-pouch-controls">
                            <button onclick="adjustEquippedPouches(-1)" ${gold.equippedPouches === 0 ? 'disabled' : ''}>-</button>
                            <span>${gold.equippedPouches}</span>
                            <button onclick="adjustEquippedPouches(1)" ${gold.equippedPouches >= 2 || gold.equippedPouches >= gold.pouches ? 'disabled' : ''}>+</button>
                        </div>
                    </div>
                </div>
                
                <div class="gold-category">
                    <h4>Chest (${gold.chest}/1)</h4>
                    <div class="gold-circles">
                        ${renderGoldCircles('chest', gold.chest, 1)}
                    </div>
                </div>
                
                <div class="gold-category">
                    <h4>Banks</h4>
                    <div class="banks-container">
                        ${gold.banks.map((bank, index) => `
                            <div class="bank-entry">
                                <input type="text" value="${bank.location}" onchange="updateBankLocation(${index}, this.value)" placeholder="Bank location">
                                <div class="bank-chests">
                                    <span>${bank.chests} Chests</span>
                                    <button onclick="adjustBankChests(${index}, -1)" ${bank.chests === 0 ? 'disabled' : ''}>-</button>
                                    <button onclick="adjustBankChests(${index}, 1)">+</button>
                                    <button onclick="removeBank(${index})" class="remove-btn">✕</button>
                                </div>
                            </div>
                        `).join('')}
                        <button onclick="addBank()" class="add-bank-btn">+ Add Bank</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ===== UTILITY FUNCTIONS =====
function renderItemsGrid(items, type) {
    if (!items || items.length === 0) {
        return '<div class="no-items">No items yet</div>';
    }
    
    return items.map((item, index) => {
        const isEquipped = isItemEquipped(item, type);
        const equipBtnText = isEquipped ? 'Unequip' : 'Equip';
        const cardClass = isEquipped ? 'item-card equipped' : 'item-card';
        
        return `
            <div class="${cardClass}">
                <div class="item-header">
                    <h5>${item.name}${isEquipped ? ' <span class="equipped-indicator">✓ Equipped</span>' : ''}</h5>
                    <div class="item-actions">
                        <button onclick="${isEquipped ? `unequipItem('${type}', ${index})` : `equipItem('${type}', ${index})`}" class="equip-btn ${isEquipped ? 'unequip' : ''}">${equipBtnText}</button>
                        <button onclick="editItem('${type}', ${index})" class="edit-btn">Edit</button>
                        <button onclick="deleteItem('${type}', ${index})" class="delete-btn">✕</button>
                    </div>
                </div>
                ${item.description ? `<p class="item-description">${item.description}</p>` : ''}
                ${item.features ? `<p class="item-features"><strong>Features:</strong> ${item.features}</p>` : ''}
                ${item.diceRoll ? `<p class="item-dice"><strong>Dice:</strong> ${item.diceRoll}</p>` : ''}
                ${item.ability ? `<p class="item-ability"><strong>Ability:</strong> ${item.ability}</p>` : ''}
            </div>
        `;
    }).join('');
}

function renderGoldCircles(type, current, max) {
    let circles = '';
    for (let i = 0; i < max; i++) {
        const isActive = i < current;
        circles += `<div class="gold-circle ${isActive ? 'active' : ''}" onclick="setGoldAmount('${type}', ${i + 1})"></div>`;
    }
    return circles;
}

// ===== NAVIGATION =====
function switchEquipmentSection(section) {
    // Update nav buttons
    document.querySelectorAll('.equipment-nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-section="${section}"]`).classList.add('active');
    
    // Update content
    const contentDiv = document.getElementById('equipment-content');
    switch(section) {
        case 'overview':
            contentDiv.innerHTML = renderOverviewContent();
            break;
        case 'inventory':
            contentDiv.innerHTML = renderInventorySection();
            break;
        case 'gold':
            contentDiv.innerHTML = renderGoldSection();
            break;
    }
}

// ===== ITEM MANAGEMENT =====
function showAddItemModal(defaultType = 'weapon') {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Add New Item</h3>
            <form id="add-item-form">
                <div class="form-group">
                    <label for="item-type">Item Type:</label>
                    <select id="item-type" required>
                        ${itemTypes.map(type => 
                            `<option value="${type}" ${type === defaultType ? 'selected' : ''}>${type.charAt(0).toUpperCase() + type.slice(1)}</option>`
                        ).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="item-name">Name:</label>
                    <input type="text" id="item-name" required>
                </div>
                
                <div class="form-group">
                    <label for="item-description">Description (optional):</label>
                    <textarea id="item-description" rows="3"></textarea>
                </div>
                
                <div class="form-group">
                    <label for="item-features">Features (optional):</label>
                    <textarea id="item-features" rows="2"></textarea>
                </div>
                
                <div class="form-group">
                    <label for="item-dice">Dice Roll (optional):</label>
                    <input type="text" id="item-dice" placeholder="e.g., 1d6, 2d8+3">
                </div>
                
                <div class="form-group">
                    <label for="item-ability">Associated Ability (optional):</label>
                    <select id="item-ability">
                        <option value="">None</option>
                        ${abilities.map(ability => 
                            `<option value="${ability}">${ability}</option>`
                        ).join('')}
                    </select>
                </div>
                
                <div class="modal-buttons">
                    <button type="submit" class="confirm-btn">Add Item</button>
                    <button type="button" class="cancel-btn" onclick="closeModal(this)">Cancel</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    
    document.getElementById('add-item-form').addEventListener('submit', (e) => {
        e.preventDefault();
        addNewItem();
        closeModal(modal.querySelector('.cancel-btn'));
    });
}

function addNewItem() {
    const type = document.getElementById('item-type').value;
    const name = document.getElementById('item-name').value;
    const description = document.getElementById('item-description').value;
    const features = document.getElementById('item-features').value;
    const diceRoll = document.getElementById('item-dice').value;
    const ability = document.getElementById('item-ability').value;
    
    const newItem = {
        name,
        description: description || null,
        features: features || null,
        diceRoll: diceRoll || null,
        ability: ability || null,
        id: Date.now() // Simple ID generation
    };
    
    // Add to appropriate inventory
    const inventoryKey = type === 'weapon' ? 'weapons' : 
                        type === 'armor' ? 'armor' :
                        type === 'clothing' ? 'clothing' :
                        type === 'jewelry' ? 'jewelry' :
                        type === 'gear' ? 'gear' :
                        type === 'potion' ? 'potions' :
                        type === 'canister' ? 'canisters' :
                        type === 'food' ? 'food' :
                        type === 'quest' ? 'questItems' : 'other';
    
    equipmentData.inventory[inventoryKey].push(newItem);
    saveEquipmentData();
    
    // Refresh current section
    const activeSection = document.querySelector('.equipment-nav-btn.active').dataset.section;
    switchEquipmentSection(activeSection);
}

function isItemEquipped(item, type) {
    const equipped = equipmentData.equipped;
    
    // Check if item is equipped by comparing IDs
    if (type === 'weapon') {
        return (equipped.primaryWeapon && equipped.primaryWeapon.id === item.id) ||
               (equipped.secondaryWeapon && equipped.secondaryWeapon.id === item.id);
    } else if (type === 'armor') {
        return equipped.armor && equipped.armor.id === item.id;
    } else if (type === 'clothing') {
        return equipped.clothes && equipped.clothes.id === item.id;
    } else if (type === 'canister') {
        return equipped.canister && equipped.canister.id === item.id;
    } else if (type === 'jewelry') {
        return equipped.jewelry.some(slot => slot && slot.id === item.id);
    } else if (type === 'gear') {
        return equipped.gear.some(slot => slot && slot.id === item.id);
    } else if (type === 'potion') {
        return equipped.potions.some(slot => slot && slot.id === item.id);
    } else if (type === 'food') {
        return equipped.food.some(slot => slot && slot.id === item.id);
    } else if (type === 'quest') {
        return equipped.questItems.some(slot => slot && slot.id === item.id);
    }
    
    return false;
}

function unequipItem(type, index) {
    const inventoryKey = type === 'weapon' ? 'weapons' : 
                        type === 'armor' ? 'armor' :
                        type === 'clothing' ? 'clothing' :
                        type === 'jewelry' ? 'jewelry' :
                        type === 'gear' ? 'gear' :
                        type === 'potion' ? 'potions' :
                        type === 'canister' ? 'canisters' :
                        type === 'food' ? 'food' :
                        type === 'quest' ? 'questItems' : 'other';
    
    const item = equipmentData.inventory[inventoryKey][index];
    const equipped = equipmentData.equipped;
    
    // Remove item from equipped slots
    if (type === 'weapon') {
        if (equipped.primaryWeapon && equipped.primaryWeapon.id === item.id) {
            equipped.primaryWeapon = null;
        }
        if (equipped.secondaryWeapon && equipped.secondaryWeapon.id === item.id) {
            equipped.secondaryWeapon = null;
        }
    } else if (type === 'armor') {
        equipped.armor = null;
    } else if (type === 'clothing') {
        equipped.clothes = null;
    } else if (type === 'canister') {
        equipped.canister = null;
    } else if (type === 'jewelry') {
        const slotIndex = equipped.jewelry.findIndex(slot => slot && slot.id === item.id);
        if (slotIndex !== -1) {
            equipped.jewelry[slotIndex] = null;
        }
    } else if (type === 'gear') {
        const slotIndex = equipped.gear.findIndex(slot => slot && slot.id === item.id);
        if (slotIndex !== -1) {
            equipped.gear[slotIndex] = null;
        }
    } else if (type === 'potion') {
        const slotIndex = equipped.potions.findIndex(slot => slot && slot.id === item.id);
        if (slotIndex !== -1) {
            equipped.potions[slotIndex] = null;
        }
    } else if (type === 'food') {
        const slotIndex = equipped.food.findIndex(slot => slot && slot.id === item.id);
        if (slotIndex !== -1) {
            equipped.food[slotIndex] = null;
        }
    } else if (type === 'quest') {
        const slotIndex = equipped.questItems.findIndex(slot => slot && slot.id === item.id);
        if (slotIndex !== -1) {
            equipped.questItems[slotIndex] = null;
        }
    }
    
    saveEquipmentData();
    updateActiveWeaponsAndArmor();
    
    // Refresh current section and overview
    const activeSection = document.querySelector('.equipment-nav-btn.active').dataset.section;
    switchEquipmentSection(activeSection);
}

function equipItem(type, index) {
    const inventoryKey = type === 'weapon' ? 'weapons' : 
                        type === 'armor' ? 'armor' :
                        type === 'clothing' ? 'clothing' :
                        type === 'jewelry' ? 'jewelry' :
                        type === 'gear' ? 'gear' :
                        type === 'potion' ? 'potions' :
                        type === 'canister' ? 'canisters' :
                        type === 'food' ? 'food' :
                        type === 'quest' ? 'questItems' : 'other';
    
    const item = equipmentData.inventory[inventoryKey][index];
    
    // Check if item is already equipped
    if (isItemEquipped(item, type)) {
        alert('This item is already equipped!');
        return;
    }
    
    if (type === 'weapon') {
        // Show weapon slot selection
        showWeaponSlotModal(item);
    } else if (type === 'jewelry') {
        // Find empty jewelry slot
        const emptySlot = equipmentData.equipped.jewelry.findIndex(slot => !slot);
        if (emptySlot !== -1) {
            equipmentData.equipped.jewelry[emptySlot] = item;
        } else {
            alert('All jewelry slots are full. Unequip an item first.');
            return;
        }
    } else if (type === 'gear') {
        // Find empty gear slot
        const emptySlot = equipmentData.equipped.gear.findIndex(slot => !slot);
        if (emptySlot !== -1) {
            equipmentData.equipped.gear[emptySlot] = item;
        } else {
            alert('All gear slots are full. Unequip an item first.');
            return;
        }
    } else if (type === 'potion') {
        // Find empty potion slot
        const emptySlot = equipmentData.equipped.potions.findIndex(slot => !slot);
        if (emptySlot !== -1) {
            equipmentData.equipped.potions[emptySlot] = item;
        } else {
            alert('All potion slots are full. Unequip an item first.');
            return;
        }
    } else if (type === 'food') {
        // Find empty food slot
        const emptySlot = equipmentData.equipped.food.findIndex(slot => !slot);
        if (emptySlot !== -1) {
            equipmentData.equipped.food[emptySlot] = item;
        } else {
            alert('All food slots are full. Unequip an item first.');
            return;
        }
    } else if (type === 'quest') {
        // Find empty quest slot
        const emptySlot = equipmentData.equipped.questItems.findIndex(slot => !slot);
        if (emptySlot !== -1) {
            equipmentData.equipped.questItems[emptySlot] = item;
        } else {
            alert('All quest item slots are full. Unequip an item first.');
            return;
        }
    } else {
        // Single slot items
        const slotKey = type === 'armor' ? 'armor' :
                       type === 'clothing' ? 'clothes' :
                       type === 'canister' ? 'canister' : null;
        
        if (slotKey) {
            // Check if slot is already occupied
            if (equipmentData.equipped[slotKey]) {
                alert(`You already have ${type} equipped. Unequip it first.`);
                return;
            }
            equipmentData.equipped[slotKey] = item;
        }
    }
    
    saveEquipmentData();
    updateActiveWeaponsAndArmor();
    
    // Refresh current section and overview
    const activeSection = document.querySelector('.equipment-nav-btn.active').dataset.section;
    switchEquipmentSection(activeSection);
}

function showWeaponSlotModal(weapon) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Equip Weapon: ${weapon.name}</h3>
            <p>Choose weapon slot:</p>
            <div class="modal-buttons">
                <button onclick="equipWeaponToSlot('primaryWeapon', ${JSON.stringify(weapon).replace(/"/g, '&quot;')}); closeModal(this)" class="confirm-btn">Primary Weapon</button>
                <button onclick="equipWeaponToSlot('secondaryWeapon', ${JSON.stringify(weapon).replace(/"/g, '&quot;')}); closeModal(this)" class="confirm-btn">Secondary Weapon</button>
                <button onclick="closeModal(this)" class="cancel-btn">Cancel</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

function equipWeaponToSlot(slot, weapon) {
    // Check if weapon is already equipped in any slot
    if (isItemEquipped(weapon, 'weapon')) {
        alert('This weapon is already equipped!');
        return;
    }
    
    // Check if slot is already occupied
    if (equipmentData.equipped[slot]) {
        alert(`You already have a ${slot.replace('Weapon', ' weapon')} equipped. Unequip it first.`);
        return;
    }
    
    equipmentData.equipped[slot] = weapon;
    saveEquipmentData();
    updateActiveWeaponsAndArmor();
    
    // Refresh current section and overview
    const activeSection = document.querySelector('.equipment-nav-btn.active').dataset.section;
    switchEquipmentSection(activeSection);
    if (activeSection === 'overview') {
        switchEquipmentSection('overview');
    }
}

function editItem(type, index) {
    const inventoryKey = type === 'weapon' ? 'weapons' : 
                        type === 'armor' ? 'armor' :
                        type === 'clothing' ? 'clothing' :
                        type === 'jewelry' ? 'jewelry' :
                        type === 'gear' ? 'gear' :
                        type === 'potion' ? 'potions' :
                        type === 'canister' ? 'canisters' :
                        type === 'food' ? 'food' :
                        type === 'quest' ? 'questItems' : 'other';
    
    const item = equipmentData.inventory[inventoryKey][index];
    
    // Show edit modal with pre-filled values
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Edit Item: ${item.name}</h3>
            <form id="edit-item-form">
                <div class="form-group">
                    <label for="edit-item-name">Name:</label>
                    <input type="text" id="edit-item-name" value="${item.name}" required>
                </div>
                
                <div class="form-group">
                    <label for="edit-item-description">Description (optional):</label>
                    <textarea id="edit-item-description" rows="3">${item.description || ''}</textarea>
                </div>
                
                <div class="form-group">
                    <label for="edit-item-features">Features (optional):</label>
                    <textarea id="edit-item-features" rows="2">${item.features || ''}</textarea>
                </div>
                
                <div class="form-group">
                    <label for="edit-item-dice">Dice Roll (optional):</label>
                    <input type="text" id="edit-item-dice" value="${item.diceRoll || ''}" placeholder="e.g., 1d6, 2d8+3">
                </div>
                
                <div class="form-group">
                    <label for="edit-item-ability">Associated Ability (optional):</label>
                    <select id="edit-item-ability">
                        <option value="">None</option>
                        ${abilities.map(ability => 
                            `<option value="${ability}" ${item.ability === ability ? 'selected' : ''}>${ability}</option>`
                        ).join('')}
                    </select>
                </div>
                
                <div class="modal-buttons">
                    <button type="submit" class="confirm-btn">Save Changes</button>
                    <button type="button" class="cancel-btn" onclick="closeModal(this)">Cancel</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    
    document.getElementById('edit-item-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Update item with new values
        item.name = document.getElementById('edit-item-name').value;
        item.description = document.getElementById('edit-item-description').value || null;
        item.features = document.getElementById('edit-item-features').value || null;
        item.diceRoll = document.getElementById('edit-item-dice').value || null;
        item.ability = document.getElementById('edit-item-ability').value || null;
        
        saveEquipmentData();
        updateActiveWeaponsAndArmor();
        
        // Refresh current section
        const activeSection = document.querySelector('.equipment-nav-btn.active').dataset.section;
        switchEquipmentSection(activeSection);
        
        closeModal(modal.querySelector('.cancel-btn'));
    });
}

function deleteItem(type, index) {
    if (confirm('Are you sure you want to delete this item?')) {
        const inventoryKey = type === 'weapon' ? 'weapons' : 
                            type === 'armor' ? 'armor' :
                            type === 'clothing' ? 'clothing' :
                            type === 'jewelry' ? 'jewelry' :
                            type === 'gear' ? 'gear' :
                            type === 'potion' ? 'potions' :
                            type === 'canister' ? 'canisters' :
                            type === 'food' ? 'food' :
                            type === 'quest' ? 'questItems' : 'other';
        
        equipmentData.inventory[inventoryKey].splice(index, 1);
        saveEquipmentData();
        
        // Refresh current section
        const activeSection = document.querySelector('.equipment-nav-btn.active').dataset.section;
        switchEquipmentSection(activeSection);
    }
}

// ===== GOLD MANAGEMENT =====
function setGoldAmount(type, amount) {
    const currentAmount = equipmentData.gold[type];
    
    if (amount <= currentAmount) {
        // Decreasing
        equipmentData.gold[type] = amount - 1;
    } else {
        // Increasing
        equipmentData.gold[type] = amount;
    }
    
    // Handle automatic conversions
    if (type === 'coins' && equipmentData.gold.coins >= 10) {
        equipmentData.gold.coins = 0;
        equipmentData.gold.pouches = Math.min(equipmentData.gold.pouches + 1, 10);
    }
    
    if (type === 'pouches' && equipmentData.gold.pouches >= 10) {
        equipmentData.gold.pouches = 0;
        equipmentData.gold.chest = 1;
    }
    
    // Adjust equipped pouches if necessary
    if (equipmentData.gold.equippedPouches > equipmentData.gold.pouches) {
        equipmentData.gold.equippedPouches = equipmentData.gold.pouches;
    }
    
    saveEquipmentData();
    switchEquipmentSection('gold'); // Refresh gold section
}

function adjustEquippedPouches(change) {
    const newAmount = equipmentData.gold.equippedPouches + change;
    if (newAmount >= 0 && newAmount <= 2 && newAmount <= equipmentData.gold.pouches) {
        equipmentData.gold.equippedPouches = newAmount;
        saveEquipmentData();
        switchEquipmentSection('gold');
    }
}

function addBank() {
    equipmentData.gold.banks.push({
        location: '',
        chests: 0
    });
    saveEquipmentData();
    switchEquipmentSection('gold');
}

function removeBank(index) {
    equipmentData.gold.banks.splice(index, 1);
    saveEquipmentData();
    switchEquipmentSection('gold');
}

function updateBankLocation(index, location) {
    equipmentData.gold.banks[index].location = location;
    saveEquipmentData();
}

function adjustBankChests(index, change) {
    const newAmount = equipmentData.gold.banks[index].chests + change;
    if (newAmount >= 0) {
        equipmentData.gold.banks[index].chests = newAmount;
        saveEquipmentData();
        switchEquipmentSection('gold');
    }
}

// ===== INTEGRATION WITH ACTIVE WEAPONS/ARMOR =====
function updateActiveWeaponsAndArmor() {
    // Update Active Weapons section
    updateActiveWeaponsDisplay();
    
    // Update Armor section
    updateActiveArmorDisplay();
}

function updateActiveWeaponsDisplay() {
    const activeWeaponsSection = document.querySelector('[data-color-target="active-weapons"]');
    if (!activeWeaponsSection) return;
    
    // Find or create the equipped weapons display area
    let equippedWeaponsDiv = activeWeaponsSection.querySelector('.equipped-weapons-display');
    if (!equippedWeaponsDiv) {
        equippedWeaponsDiv = document.createElement('div');
        equippedWeaponsDiv.className = 'equipped-weapons-display';
        
        // Find the h3 and insert after it, or append to section
        const h3 = activeWeaponsSection.querySelector('h3');
        if (h3) {
            h3.insertAdjacentElement('afterend', equippedWeaponsDiv);
        } else {
            activeWeaponsSection.appendChild(equippedWeaponsDiv);
        }
    }
    
    let weaponsHTML = '';
    
    if (equipmentData.equipped.primaryWeapon) {
        weaponsHTML += `
            <div class="active-weapon">
                <h4>Primary: ${equipmentData.equipped.primaryWeapon.name}</h4>
                ${equipmentData.equipped.primaryWeapon.diceRoll ? `<p>Damage: ${equipmentData.equipped.primaryWeapon.diceRoll}</p>` : ''}
                ${equipmentData.equipped.primaryWeapon.ability ? `<p>Ability: ${equipmentData.equipped.primaryWeapon.ability}</p>` : ''}
            </div>
        `;
    }
    
    if (equipmentData.equipped.secondaryWeapon) {
        weaponsHTML += `
            <div class="active-weapon">
                <h4>Secondary: ${equipmentData.equipped.secondaryWeapon.name}</h4>
                ${equipmentData.equipped.secondaryWeapon.diceRoll ? `<p>Damage: ${equipmentData.equipped.secondaryWeapon.diceRoll}</p>` : ''}
                ${equipmentData.equipped.secondaryWeapon.ability ? `<p>Ability: ${equipmentData.equipped.secondaryWeapon.ability}</p>` : ''}
            </div>
        `;
    }
    
    if (!equipmentData.equipped.primaryWeapon && !equipmentData.equipped.secondaryWeapon) {
        weaponsHTML += '<p class="no-equipped-weapons">No weapons equipped</p>';
    }
    
    equippedWeaponsDiv.innerHTML = weaponsHTML;
}

function updateActiveArmorDisplay() {
    const activeArmorSection = document.querySelector('[data-color-target="armor-section"]');
    if (!activeArmorSection) return;
    
    // Find or create the equipped armor display area
    let equippedArmorDiv = activeArmorSection.querySelector('.equipped-armor-display');
    if (!equippedArmorDiv) {
        equippedArmorDiv = document.createElement('div');
        equippedArmorDiv.className = 'equipped-armor-display';
        activeArmorSection.appendChild(equippedArmorDiv);
    }
    
    // Update only the equipped armor display, leaving armor circles intact
    if (equipmentData.equipped.armor) {
        equippedArmorDiv.innerHTML = `
            <div class="equipped-armor-info">
                <h4>Equipped: ${equipmentData.equipped.armor.name}</h4>
                ${equipmentData.equipped.armor.features ? `<p>Features: ${equipmentData.equipped.armor.features}</p>` : ''}
                ${equipmentData.equipped.armor.ability ? `<p>Ability: ${equipmentData.equipped.armor.ability}</p>` : ''}
            </div>
        `;
    } else {
        equippedArmorDiv.innerHTML = '<p class="no-equipped-armor">No armor equipped</p>';
    }
}

// ===== UTILITY FUNCTIONS =====
function closeModal(button) {
    const modal = button.closest('.modal');
    if (modal) {
        modal.remove();
    }
}

function saveEquipmentData() {
    localStorage.setItem('zevi-equipment', JSON.stringify(equipmentData));
}

function loadEquipmentData() {
    const saved = localStorage.getItem('zevi-equipment');
    if (saved) {
        equipmentData = { ...equipmentData, ...JSON.parse(saved) };
    }
}

// ===== INITIALIZATION =====
function initializeEquipment() {
    loadEquipmentData();
    renderEquipmentOverview();
    updateActiveWeaponsAndArmor();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initializeEquipment, 150);
});

// Export functions for global access
window.showAddItemModal = showAddItemModal;
window.equipItem = equipItem;
window.unequipItem = unequipItem;
window.equipWeaponToSlot = equipWeaponToSlot;
window.editItem = editItem;
window.deleteItem = deleteItem;
window.setGoldAmount = setGoldAmount;
window.adjustEquippedPouches = adjustEquippedPouches;
window.addBank = addBank;
window.removeBank = removeBank;
window.updateBankLocation = updateBankLocation;
window.adjustBankChests = adjustBankChests;
window.closeModal = closeModal;
window.initializeEquipment = initializeEquipment;