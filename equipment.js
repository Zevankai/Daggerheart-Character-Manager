// ===== EQUIPMENT MODULE =====
// This module handles all equipment-related functionality including:
// 1. Equipment overview with equipped items and gold count
// 2. Weapons, armor, clothing, and jewelry management
// 3. Consumables (potions, canisters, food) management
// 4. Quest items management
// 5. Gold tracking system with coins, pouches, chests, and banks
// 6. Integration with Active Weapons and Armor sections

console.log('Equipment.js file loaded successfully');



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
    selectedTags: [],
    // Bag selection
    selectedBag: 'Standard Backpack'
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

const bagTypes = {
    'Standard Backpack': {
        capacity: 30,
        consumableSlots: 3,
        bonus: null
    },
    'Adventurer\'s Backpack': {
        capacity: 45,
        consumableSlots: 2,
        bonus: null
    },
    'Warrior\'s Backpack': {
        capacity: 26,
        consumableSlots: 6,
        bonus: '+1 to Finesse rolls in combat'
    },
    'Arcane Satchel': {
        capacity: 22,
        consumableSlots: 8,
        bonus: '+1 to Instinct rolls outside of combat'
    },
    'Tinker\'s Pack': {
        capacity: 20,
        consumableSlots: 12,
        bonus: '+2 to Finesse rolls when crafting'
    }
};

// ===== UTILITY FUNCTIONS =====
function calculateEncumbrance() {
    let totalWeight = 0;
    
    // Calculate weight of UNEQUIPPED items only
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
    const selectedBag = bagTypes[equipmentData.selectedBag] || bagTypes['Standard Backpack'];
    return calculateEncumbrance() > selectedBag.capacity;
}

function getMaxCapacity() {
    const selectedBag = bagTypes[equipmentData.selectedBag] || bagTypes['Standard Backpack'];
    return selectedBag.capacity;
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
    console.log('renderEquipmentOverview called');
    const equipmentTabContent = document.getElementById('equipment-tab-content');
    console.log('equipmentTabContent element:', equipmentTabContent);
    
    if (!equipmentTabContent) {
        console.error('Equipment tab content element not found!');
        return;
    }
    
    const encumbrance = calculateEncumbrance();
    const isOverEncumbered = isEncumbered();
    console.log('Encumbrance calculated:', encumbrance, 'Over encumbered:', isOverEncumbered);
    
    try {
        const overviewContent = renderOverviewContent();
        console.log('Overview content generated:', overviewContent ? 'success' : 'failed');
        
        equipmentTabContent.innerHTML = `
            <div class="equipment-container">
                <div class="equipment-header">
                    <h2>Equipment Overview</h2>
                    ${isOverEncumbered ? '<div class="encumbrance-warning">⚠️ ENCUMBERED - Carrying too much weight!</div>' : ''}
                                    <div class="encumbrance-display">
                    <span class="encumbrance-text">Encumbrance: ${encumbrance}/${getMaxCapacity()} units</span>
                    <div class="encumbrance-bar">
                        <div class="encumbrance-fill" style="width: ${Math.min((encumbrance / getMaxCapacity()) * 100, 100)}%"></div>
                    </div>
                </div>
                <div class="bag-selector">
                    <label for="bag-select">Bag Type:</label>
                    <select id="bag-select" onchange="changeBagType(this.value)">
                        ${Object.keys(bagTypes).map(bagName => 
                            `<option value="${bagName}" ${equipmentData.selectedBag === bagName ? 'selected' : ''}>${bagName}</option>`
                        ).join('')}
                    </select>
                    <div class="bag-info">
                        <span class="bag-capacity">Capacity: ${getMaxCapacity()} units</span>
                        <span class="bag-consumables">Belt Slots: ${bagTypes[equipmentData.selectedBag].consumableSlots}</span>
                        ${bagTypes[equipmentData.selectedBag].bonus ? `<span class="bag-bonus">${bagTypes[equipmentData.selectedBag].bonus}</span>` : ''}
                    </div>
                </div>
                    <div class="equipment-nav">
                        <button class="equipment-nav-btn active" data-section="overview">Overview</button>
                        <button class="equipment-nav-btn" data-section="inventory">Inventory</button>
                        <button class="equipment-nav-btn" data-section="gold">Gold Tracker</button>
                    </div>
                </div>
                
                <div id="equipment-content">
                    ${overviewContent}
                </div>
            </div>
        `;
        console.log('Equipment HTML set successfully');
    } catch (error) {
        console.error('Error rendering equipment overview:', error);
        equipmentTabContent.innerHTML = `
            <div class="equipment-container">
                <h2>Equipment System</h2>
                <p>Error loading equipment. Check console for details.</p>
                <p>Error: ${error.message}</p>
            </div>
        `;
    }
    
    // Add navigation listeners
    document.querySelectorAll('.equipment-nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const section = e.target.dataset.section;
            switchEquipmentSection(section);
        });
    });
}

function renderOverviewContent() {
    console.log('renderOverviewContent called');
    
    // Safety checks
    if (!equipmentData || !equipmentData.equipped || !equipmentData.gold) {
        console.error('Equipment data is not properly initialized');
        return '<div><p>Equipment data not loaded properly</p></div>';
    }
    
    const equipped = equipmentData.equipped;
    const gold = equipmentData.gold;
    
    console.log('Equipped items:', equipped);
    console.log('Gold data:', gold);
    
    return `
        <div class="overview-section">
            <div class="equipped-items-container">
                <h3>Currently Equipped</h3>
                <div class="equipped-grid">
                    <!-- Combat Equipment -->
                    <div class="equipment-category">
                        <h4>⚔️ Combat</h4>
                        <div class="equipment-slots">
                            <div class="equipment-slot ${equipped.primaryWeapon ? 'filled' : 'empty'}" data-slot="primaryWeapon">
                                <div class="slot-label">Primary Weapon</div>
                                <div class="slot-content">
                                    ${equipped.primaryWeapon ? 
                                        `<div class="equipped-item-name">${equipped.primaryWeapon.name}</div>
                                         <button class="unequip-btn" onclick="unequipSpecificItem('primaryWeapon')">×</button>` :
                                        '<div class="empty-slot">Drop weapon here</div>'
                                    }
                                </div>
                            </div>
                            <div class="equipment-slot ${equipped.secondaryWeapon ? 'filled' : 'empty'}" data-slot="secondaryWeapon">
                                <div class="slot-label">Secondary Weapon</div>
                                <div class="slot-content">
                                    ${equipped.secondaryWeapon ? 
                                        `<div class="equipped-item-name">${equipped.secondaryWeapon.name}</div>
                                         <button class="unequip-btn" onclick="unequipSpecificItem('secondaryWeapon')">×</button>` :
                                        '<div class="empty-slot">Drop weapon here</div>'
                                    }
                                </div>
                            </div>
                            <div class="equipment-slot ${equipped.armor ? 'filled' : 'empty'}" data-slot="armor">
                                <div class="slot-label">Armor</div>
                                <div class="slot-content">
                                    ${equipped.armor ? 
                                        `<div class="equipped-item-name">${equipped.armor.name}</div>
                                         <button class="unequip-btn" onclick="unequipSpecificItem('armor')">×</button>` :
                                        '<div class="empty-slot">Drop armor here</div>'
                                    }
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Attire -->
                    <div class="equipment-category">
                        <h4>👕 Attire</h4>
                        <div class="equipment-slots">
                            <div class="equipment-slot ${equipped.clothing ? 'filled' : 'empty'}" data-slot="clothing">
                                <div class="slot-label">Clothing</div>
                                <div class="slot-content">
                                    ${equipped.clothing ? 
                                        `<div class="equipped-item-name">${equipped.clothing.name}</div>
                                         <button class="unequip-btn" onclick="unequipSpecificItem('clothing')">×</button>` :
                                        '<div class="empty-slot">Drop clothing here</div>'
                                    }
                                </div>
                            </div>
                            <div class="jewelry-container">
                                <div class="slot-label">💍 Jewelry (${equipped.jewelry.filter(j => j).length}/3)</div>
                                <div class="jewelry-slots">
                                    ${equipped.jewelry.map((item, i) => `
                                        <div class="equipment-slot jewelry-slot ${item ? 'filled' : 'empty'}" data-slot="jewelry" data-index="${i}">
                                            <div class="slot-content">
                                                ${item ? 
                                                    `<div class="equipped-item-name">${item.name}</div>
                                                     <button class="unequip-btn" onclick="unequipJewelry(${i})">×</button>` :
                                                    '<div class="empty-slot">Empty</div>'
                                                }
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Belt Items -->
                    <div class="equipment-category">
                        <h4>🎒 Belt & Consumables</h4>
                        <div class="belt-container">
                            <div class="slot-label">Belt Items (${equipped.belt.filter(b => b).length}/${bagTypes[equipmentData.selectedBag].consumableSlots})</div>
                            <div class="belt-slots">
                                ${equipped.belt.map((item, i) => `
                                    <div class="equipment-slot belt-slot ${item ? 'filled' : 'empty'}" data-slot="belt" data-index="${i}">
                                        <div class="slot-content">
                                            ${item ? 
                                                `<div class="equipped-item-name">${item.name}</div>
                                                 <div class="item-type">${item.type}</div>
                                                 <button class="unequip-btn" onclick="unequipBeltItem(${i})">×</button>` :
                                                '<div class="empty-slot">Empty</div>'
                                            }
                                        </div>
                                    </div>
                                `).join('')}
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

function renderCompactItemCard(item, category, index) {
    const isEquipped = isItemEquipped(item, item.type);
    const weight = encumbranceWeights[item.type] || 1;
    
    return `
        <div class="item-card compact ${isEquipped ? 'equipped' : ''}" data-item-id="${item.id}">
            <div class="item-header">
                <h5 class="item-name">${item.name}</h5>
                <span class="item-weight">${weight}u</span>
                ${isEquipped ? '<span class="equipped-indicator">✓</span>' : ''}
            </div>
            <div class="item-type">${item.type}</div>
            ${item.description ? `<div class="item-description">${item.description}</div>` : ''}
            ${item.tags && item.tags.length > 0 ? `<div class="item-tags">${item.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>` : ''}
            <div class="item-actions">
                ${isEquipped ? 
                    `<button class="equip-btn unequip" onclick="unequipItem('${item.type}', ${index})">Unequip</button>` :
                    `<button class="equip-btn" onclick="equipItem('${item.type}', ${index})">Equip</button>`
                }
                <button class="edit-btn" onclick="editItem('${category}', ${index})">Edit</button>
                <button class="drop-btn" onclick="dropItem('${category}', ${index})">Drop</button>
                <button class="sell-btn" onclick="sellItem('${category}', ${index})">Sell</button>
            </div>
        </div>
    `;
}

// Search and filter functions
function updateSearch(searchTerm) {
    equipmentData.searchTerm = searchTerm;
    saveEquipmentData();
    if (document.querySelector('.inventory-section')) {
        document.querySelector('.inventory-content').innerHTML = renderInventoryCategories();
    }
}

function updateCategoryFilter(category) {
    equipmentData.selectedCategory = category;
    saveEquipmentData();
    if (document.querySelector('.inventory-section')) {
        document.querySelector('.inventory-content').innerHTML = renderInventoryCategories();
    }
}

// New unequip functions for the improved interface
function unequipSpecificItem(slot) {
    if (equipmentData.equipped[slot]) {
        equipmentData.equipped[slot] = null;
        saveEquipmentData();
        updateActiveWeaponsAndArmor();
        updateEncumbranceDisplay();
        
        // Refresh overview
        const activeSection = document.querySelector('.equipment-nav-btn.active').dataset.section;
        if (activeSection === 'overview') {
            switchEquipmentSection('overview');
        }
    }
}

function unequipJewelry(index) {
    if (equipmentData.equipped.jewelry[index]) {
        equipmentData.equipped.jewelry[index] = null;
        saveEquipmentData();
        updateActiveWeaponsAndArmor();
        updateEncumbranceDisplay();
        
        // Refresh overview
        const activeSection = document.querySelector('.equipment-nav-btn.active').dataset.section;
        if (activeSection === 'overview') {
            switchEquipmentSection('overview');
        }
    }
}

function unequipBeltItem(index) {
    if (equipmentData.equipped.belt[index]) {
        equipmentData.equipped.belt[index] = null;
        saveEquipmentData();
        updateActiveWeaponsAndArmor();
        updateEncumbranceDisplay();
        
        // Refresh overview
        const activeSection = document.querySelector('.equipment-nav-btn.active').dataset.section;
        if (activeSection === 'overview') {
            switchEquipmentSection('overview');
        }
    }
}

function changeBagType(bagName) {
    const oldBag = bagTypes[equipmentData.selectedBag];
    const newBag = bagTypes[bagName];
    
    // If new bag has fewer belt slots, unequip excess items
    if (newBag.consumableSlots < oldBag.consumableSlots) {
        for (let i = newBag.consumableSlots; i < equipmentData.equipped.belt.length; i++) {
            equipmentData.equipped.belt[i] = null;
        }
    }
    
    // Resize belt array to match new bag's consumable slots
    equipmentData.equipped.belt = Array(newBag.consumableSlots).fill(null);
    
    // Copy over existing items up to the new limit
    const currentBelt = equipmentData.equipped.belt.slice();
    for (let i = 0; i < Math.min(newBag.consumableSlots, currentBelt.length); i++) {
        equipmentData.equipped.belt[i] = currentBelt[i];
    }
    
    equipmentData.selectedBag = bagName;
    saveEquipmentData();
    updateEncumbranceDisplay();
    
    // Update bag info display
    updateBagInfo();
    
    // Refresh overview
    const activeSection = document.querySelector('.equipment-nav-btn.active').dataset.section;
    switchEquipmentSection(activeSection);
}

function updateBagInfo() {
    const bagInfo = document.querySelector('.bag-info');
    if (bagInfo) {
        const selectedBag = bagTypes[equipmentData.selectedBag];
        bagInfo.innerHTML = `
            <span class="bag-capacity">Capacity: ${selectedBag.capacity} units</span>
            <span class="bag-consumables">Belt Slots: ${selectedBag.consumableSlots}</span>
            ${selectedBag.bonus ? `<span class="bag-bonus">${selectedBag.bonus}</span>` : ''}
        `;
    }
}

function dropItem(category, index) {
    if (confirm('Are you sure you want to drop this item? It will be lost forever.')) {
        const item = equipmentData.inventory[category][index];
        
        // Auto-unequip the item if it's equipped
        if (isItemEquipped(item, item.type)) {
            const equipped = equipmentData.equipped;
            
            if (item.type === 'weapon') {
                if (equipped.primaryWeapon && equipped.primaryWeapon.id === item.id) {
                    equipped.primaryWeapon = null;
                }
                if (equipped.secondaryWeapon && equipped.secondaryWeapon.id === item.id) {
                    equipped.secondaryWeapon = null;
                }
            } else if (item.type === 'armor') {
                equipped.armor = null;
            } else if (item.type === 'clothing') {
                equipped.clothing = null;
            } else if (item.type === 'jewelry') {
                const slotIndex = equipped.jewelry.findIndex(slot => slot && slot.id === item.id);
                if (slotIndex !== -1) {
                    equipped.jewelry[slotIndex] = null;
                }
            } else {
                // For belt items
                const slotIndex = equipped.belt.findIndex(slot => slot && slot.id === item.id);
                if (slotIndex !== -1) {
                    equipped.belt[slotIndex] = null;
                }
            }
        }
        
        // Remove from inventory
        equipmentData.inventory[category].splice(index, 1);
        saveEquipmentData();
        updateActiveWeaponsAndArmor();
        updateEncumbranceDisplay();
        
        // Refresh current section
        const activeSection = document.querySelector('.equipment-nav-btn.active').dataset.section;
        switchEquipmentSection(activeSection);
    }
}

function sellItem(category, index) {
    const item = equipmentData.inventory[category][index];
    const goldAmount = prompt(`How much gold did you sell "${item.name}" for?`, '1');
    
    if (goldAmount !== null && !isNaN(goldAmount) && parseInt(goldAmount) >= 0) {
        const gold = parseInt(goldAmount);
        
        // Auto-unequip the item if it's equipped
        if (isItemEquipped(item, item.type)) {
            const equipped = equipmentData.equipped;
            
            if (item.type === 'weapon') {
                if (equipped.primaryWeapon && equipped.primaryWeapon.id === item.id) {
                    equipped.primaryWeapon = null;
                }
                if (equipped.secondaryWeapon && equipped.secondaryWeapon.id === item.id) {
                    equipped.secondaryWeapon = null;
                }
            } else if (item.type === 'armor') {
                equipped.armor = null;
            } else if (item.type === 'clothing') {
                equipped.clothing = null;
            } else if (item.type === 'jewelry') {
                const slotIndex = equipped.jewelry.findIndex(slot => slot && slot.id === item.id);
                if (slotIndex !== -1) {
                    equipped.jewelry[slotIndex] = null;
                }
            } else {
                // For belt items
                const slotIndex = equipped.belt.findIndex(slot => slot && slot.id === item.id);
                if (slotIndex !== -1) {
                    equipped.belt[slotIndex] = null;
                }
            }
        }
        
        // Add gold to inventory
        let currentGold = equipmentData.gold.coins + gold;
        
        // Convert coins to pouches/chests as needed
        equipmentData.gold.coins = currentGold % 10;
        const extraPouches = Math.floor(currentGold / 10);
        
        let totalPouches = equipmentData.gold.pouches + extraPouches;
        equipmentData.gold.pouches = totalPouches % 10;
        const extraChests = Math.floor(totalPouches / 10);
        
        equipmentData.gold.chest = Math.min(1, equipmentData.gold.chest + extraChests);
        
        // Remove from inventory
        equipmentData.inventory[category].splice(index, 1);
        saveEquipmentData();
        updateActiveWeaponsAndArmor();
        updateEncumbranceDisplay();
        
        // Refresh current section
        const activeSection = document.querySelector('.equipment-nav-btn.active').dataset.section;
        switchEquipmentSection(activeSection);
        
        alert(`Sold "${item.name}" for ${gold} gold!`);
    }
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
        let canClick = true;
        
        // Special logic for 10th circle (index 9)
        if (i === 9) {
            if (type === 'coins') {
                // 10th coin can only be clicked if pouches are full (10)
                canClick = equipmentData.gold.pouches >= 10;
            } else if (type === 'pouches') {
                // 10th pouch can only be clicked if chest is full (1)
                canClick = equipmentData.gold.chest >= 1;
            }
        }
        
        const clickHandler = canClick ? `onclick="setGoldAmount('${type}', ${i + 1})"` : '';
        const disabledClass = !canClick && i === 9 ? ' disabled' : '';
        
        circles += `<div class="gold-circle ${isActive ? 'active' : ''}${disabledClass}" ${clickHandler}></div>`;
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
                            `<option value="${type}" ${type === defaultType ? 'selected' : ''}>${type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}</option>`
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
                
                <div class="form-group">
                    <label for="item-tags">Tags (optional):</label>
                    <div class="tags-selection">
                        ${additionalTags.map(tag => `
                            <label class="tag-checkbox">
                                <input type="checkbox" value="${tag}"> ${tag}
                            </label>
                        `).join('')}
                    </div>
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
    
    // Get selected tags
    const tagCheckboxes = document.querySelectorAll('.tag-checkbox input:checked');
    const tags = Array.from(tagCheckboxes).map(cb => cb.value);
    
    const newItem = {
        name,
        type,
        description: description || null,
        features: features || null,
        diceRoll: diceRoll || null,
        ability: ability || null,
        tags: tags.length > 0 ? tags : null,
        id: Date.now() // Simple ID generation
    };
    
    // Add to appropriate category
    const category = getItemCategory(type);
    if (!equipmentData.inventory[category]) {
        equipmentData.inventory[category] = [];
    }
    equipmentData.inventory[category].push(newItem);
    saveEquipmentData();
    
    // Refresh current section and update encumbrance
    const activeSection = document.querySelector('.equipment-nav-btn.active').dataset.section;
    switchEquipmentSection(activeSection);
    
    // Update encumbrance display
    updateEncumbranceDisplay();
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
        return equipped.clothing && equipped.clothing.id === item.id;
    } else if (type === 'jewelry') {
        return equipped.jewelry.some(slot => slot && slot.id === item.id);
    } else {
        // For consumables, quest items, etc. - check belt slots
        return equipped.belt.some(slot => slot && slot.id === item.id);
    }
    
    return false;
}

function unequipItem(type, index) {
    // Find the item in the appropriate category
    const category = getItemCategory(type);
    const item = equipmentData.inventory[category][index];
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
        equipped.clothing = null;
    } else if (type === 'jewelry') {
        const slotIndex = equipped.jewelry.findIndex(slot => slot && slot.id === item.id);
        if (slotIndex !== -1) {
            equipped.jewelry[slotIndex] = null;
        }
    } else {
        // For all other items (consumables, quest items, etc.) - check belt slots
        const slotIndex = equipped.belt.findIndex(slot => slot && slot.id === item.id);
        if (slotIndex !== -1) {
            equipped.belt[slotIndex] = null;
        }
    }
    
    saveEquipmentData();
    updateActiveWeaponsAndArmor();
    updateEncumbranceDisplay();
    
    // Refresh current section and overview
    const activeSection = document.querySelector('.equipment-nav-btn.active').dataset.section;
    switchEquipmentSection(activeSection);
}

function equipItem(type, index) {
    // Find the item in the appropriate category
    const category = getItemCategory(type);
    const item = equipmentData.inventory[category][index];
    
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
    } else if (type === 'armor') {
        // Check if armor slot is already occupied
        if (equipmentData.equipped.armor) {
            alert('You already have armor equipped. Unequip it first.');
            return;
        }
        equipmentData.equipped.armor = item;
    } else if (type === 'clothing') {
        // Check if clothing slot is already occupied
        if (equipmentData.equipped.clothing) {
            alert('You already have clothing equipped. Unequip it first.');
            return;
        }
        equipmentData.equipped.clothing = item;
    } else {
        // For all other items (consumables, quest items, etc.) - use belt slots
        const emptySlot = equipmentData.equipped.belt.findIndex(slot => !slot);
        if (emptySlot !== -1) {
            equipmentData.equipped.belt[emptySlot] = item;
        } else {
            alert('All belt slots are full. Unequip an item first.');
            return;
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

function editItem(category, index) {
    const item = equipmentData.inventory[category][index];
    
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
    updateEncumbranceDisplay();
    
    // Refresh current section
    const activeSection = document.querySelector('.equipment-nav-btn.active').dataset.section;
    switchEquipmentSection(activeSection);
        
        closeModal(modal.querySelector('.cancel-btn'));
    });
}

function deleteItem(category, index) {
    if (confirm('Are you sure you want to delete this item?')) {
        const item = equipmentData.inventory[category][index];
        
        // Auto-unequip the item if it's equipped
        if (isItemEquipped(item, item.type)) {
            const equipped = equipmentData.equipped;
            
            if (item.type === 'weapon') {
                if (equipped.primaryWeapon && equipped.primaryWeapon.id === item.id) {
                    equipped.primaryWeapon = null;
                }
                if (equipped.secondaryWeapon && equipped.secondaryWeapon.id === item.id) {
                    equipped.secondaryWeapon = null;
                }
            } else if (item.type === 'armor') {
                equipped.armor = null;
            } else if (item.type === 'clothing') {
                equipped.clothing = null;
            } else if (item.type === 'jewelry') {
                const slotIndex = equipped.jewelry.findIndex(slot => slot && slot.id === item.id);
                if (slotIndex !== -1) {
                    equipped.jewelry[slotIndex] = null;
                }
            } else {
                // For belt items
                const slotIndex = equipped.belt.findIndex(slot => slot && slot.id === item.id);
                if (slotIndex !== -1) {
                    equipped.belt[slotIndex] = null;
                }
            }
        }
        
        // Remove from inventory
        equipmentData.inventory[category].splice(index, 1);
        saveEquipmentData();
        updateActiveWeaponsAndArmor();
        updateEncumbranceDisplay();
        
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
        // Only auto-convert if pouches can still be filled
        if (equipmentData.gold.pouches < 10) {
            equipmentData.gold.coins = 0;
            equipmentData.gold.pouches = Math.min(equipmentData.gold.pouches + 1, 10);
        }
        // If pouches are full, allow 10th coin to stay
    }
    
    if (type === 'pouches' && equipmentData.gold.pouches >= 10) {
        // Only auto-convert if chest can still be filled
        if (equipmentData.gold.chest < 1) {
            equipmentData.gold.pouches = 0;
            equipmentData.gold.chest = 1;
        }
        // If chest is full, allow 10th pouch to stay
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
    
    // Update encumbrance warning
    updateEncumbranceWarning();
}

function updateEncumbranceWarning() {
    const mainWarning = document.getElementById('encumbrance-warning-main');
    if (mainWarning) {
        if (isEncumbered()) {
            mainWarning.style.display = 'block';
        } else {
            mainWarning.style.display = 'none';
        }
    }
}

function updateEncumbranceDisplay() {
    // Update the encumbrance bar and text in the equipment tab
    const encumbranceText = document.querySelector('.encumbrance-text');
    const encumbranceFill = document.querySelector('.encumbrance-fill');
    const encumbranceWarning = document.querySelector('.encumbrance-warning');
    
    if (encumbranceText && encumbranceFill) {
        const encumbrance = calculateEncumbrance();
        const maxCapacity = getMaxCapacity();
        const isOverEncumbered = isEncumbered();
        
        encumbranceText.textContent = `Encumbrance: ${encumbrance}/${maxCapacity} units`;
        encumbranceFill.style.width = `${Math.min((encumbrance / maxCapacity) * 100, 100)}%`;
        
        if (encumbranceWarning) {
            encumbranceWarning.style.display = isOverEncumbered ? 'block' : 'none';
        }
    }
    
    // Also update the main warning
    updateEncumbranceWarning();
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
        const weapon = equipmentData.equipped.primaryWeapon;
        weaponsHTML += `
            <div class="active-weapon">
                <h4>Primary: ${weapon.name}</h4>
                ${weapon.features ? `<p>Features: ${weapon.features}</p>` : ''}
                ${weapon.diceRoll ? `<p>Dice Roll: ${weapon.diceRoll}</p>` : ''}
                ${weapon.ability ? `<p>Attribute: ${weapon.ability}</p>` : ''}
            </div>
        `;
    }
    
    if (equipmentData.equipped.secondaryWeapon) {
        const weapon = equipmentData.equipped.secondaryWeapon;
        weaponsHTML += `
            <div class="active-weapon">
                <h4>Secondary: ${weapon.name}</h4>
                ${weapon.features ? `<p>Features: ${weapon.features}</p>` : ''}
                ${weapon.diceRoll ? `<p>Dice Roll: ${weapon.diceRoll}</p>` : ''}
                ${weapon.ability ? `<p>Attribute: ${weapon.ability}</p>` : ''}
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
    
    // Update equipped armor and clothing display, leaving armor circles intact
    let equippedHTML = '';
    
    if (equipmentData.equipped.armor) {
        const armor = equipmentData.equipped.armor;
        equippedHTML += `
            <div class="equipped-armor-info">
                <h4>Armor: ${armor.name}</h4>
                ${armor.features ? `<p>Features: ${armor.features}</p>` : ''}
                ${armor.ability ? `<p>Attribute: ${armor.ability}</p>` : ''}
            </div>
        `;
    }
    
    if (equipmentData.equipped.clothing) {
        const clothing = equipmentData.equipped.clothing;
        equippedHTML += `
            <div class="equipped-armor-info">
                <h4>Clothing: ${clothing.name}</h4>
                ${clothing.features ? `<p>Features: ${clothing.features}</p>` : ''}
                ${clothing.ability ? `<p>Attribute: ${clothing.ability}</p>` : ''}
            </div>
        `;
    }
    
    equippedArmorDiv.innerHTML = equippedHTML;
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
    console.log('Loading equipment data...');
    const saved = localStorage.getItem('zevi-equipment');
    console.log('Saved data from localStorage:', saved);
    
    if (saved) {
        try {
            const parsedData = JSON.parse(saved);
            console.log('Parsed saved data:', parsedData);
            equipmentData = { ...equipmentData, ...parsedData };
            console.log('Equipment data after merge:', equipmentData);
        } catch (error) {
            console.error('Error parsing saved equipment data:', error);
        }
    } else {
        console.log('No saved equipment data found, using defaults');
    }
    
    // Ensure all required properties exist (for backward compatibility)
    if (!equipmentData.equipped) {
        equipmentData.equipped = {};
    }
    
    // Reset equipped items to ensure clean state
    equipmentData.equipped = {
        primaryWeapon: null,
        secondaryWeapon: null,
        armor: null,
        clothing: null,
        jewelry: [null, null, null],
        belt: [null, null, null, null, null]
    };
    
    // Clear any old inventory data to start fresh
    equipmentData.inventory = {
        'Gear': [],
        'Utility': [],
        'Quest': [],
        'Crafting': [],
        'Personal': []
    };
    
    // Ensure inventory categories exist
    if (!equipmentData.inventory) {
        equipmentData.inventory = {};
    }
    const requiredCategories = ['Gear', 'Utility', 'Quest', 'Crafting', 'Personal'];
    requiredCategories.forEach(category => {
        if (!equipmentData.inventory[category]) {
            equipmentData.inventory[category] = [];
        }
    });
    
    // Ensure gold data exists
    if (!equipmentData.gold) {
        equipmentData.gold = {
            coins: 0,
            pouches: 0,
            chest: 0,
            equippedPouches: 0,
            banks: []
        };
    }
    
    console.log('Equipment data after ensuring required properties:', equipmentData);
}

// ===== INITIALIZATION =====
function initializeEquipment() {
    console.log('Initializing equipment system...');
    
    const equipmentTabContent = document.getElementById('equipment-tab-content');
    if (!equipmentTabContent) {
        console.error('Equipment tab content element not found!');
        return;
    }
    
    try {
        // Load equipment data
        loadEquipmentData();
        console.log('Equipment data loaded:', equipmentData);
        
        // Render the equipment overview
        renderEquipmentOverview();
        console.log('Equipment overview rendered successfully');
        
        // Update active weapons and armor
        updateActiveWeaponsAndArmor();
        console.log('Equipment initialization complete');
        
    } catch (error) {
        console.error('Error during equipment initialization:', error);
        equipmentTabContent.innerHTML = `
            <div style="padding: 20px; text-align: center;">
                <h2 style="color: var(--accent-color);">Equipment System Error</h2>
                <p>There was an error loading the equipment system:</p>
                <p style="color: #ff6464; font-family: monospace;">${error.message}</p>
                <p>Check the console for more details.</p>
                <button onclick="window.initializeEquipment()">Retry</button>
            </div>
        `;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, scheduling equipment initialization...');
    setTimeout(() => {
        console.log('About to initialize equipment...');
        initializeEquipment();
    }, 150);
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
window.updateSearch = updateSearch;
window.updateCategoryFilter = updateCategoryFilter;
window.unequipSpecificItem = unequipSpecificItem;
window.unequipJewelry = unequipJewelry;
window.unequipBeltItem = unequipBeltItem;
window.changeBagType = changeBagType;
window.updateBagInfo = updateBagInfo;
window.dropItem = dropItem;
window.sellItem = sellItem;
window.initializeEquipment = initializeEquipment;