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
    'Quest': ['npc-item', 'evidence', 'magical'],
    'Crafting': ['materials', 'components'],
    'Personal': ['personal', 'literature', 'clothing', 'jewelry'] // Items can be manually relocated here
};

const itemTypes = [
    'weapon', 'armor', 'clothing', 'jewelry', 'potion', 'flask', 'ammunition',
    'adventure', 'tool', 'food', 'map', 'camp',
    'npc-item', 'evidence', 'magical',
    'materials', 'components', 'personal', 'literature', 'custom'
];

const additionalTags = [
    'Rare', 'Tradable', 'Personal', 'Custom', 'Valuable', 'Consumable', 'Magical', 'Cursed'
];

const encumbranceWeights = {
    'weapon': 3,
    'armor': 10,
    'clothing': 2,
    'jewelry': 1,
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
    'personal': 1,
    'custom': 1
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
    
    // Sum up the current weight of all items
    // Equipped items have currentWeight set to 0, unequipped items have their original weight
    Object.values(equipmentData.inventory).forEach(categoryItems => {
        categoryItems.forEach(item => {
            // Use currentWeight if available, otherwise fall back to original system for old items
            const weight = item.currentWeight !== undefined ? item.currentWeight : 
                          (!isItemEquipped(item, item.type) ? (encumbranceWeights[item.type] || 1) : 0);
            totalWeight += weight;
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
    
    // Check if backpack system is enabled
    const backpackEnabled = window.backpackSystemEnabled !== false; // Default to true if not set
    
    const encumbrance = calculateEncumbrance();
    const isOverEncumbered = isEncumbered();
    console.log('Encumbrance calculated:', encumbrance, 'Over encumbered:', isOverEncumbered);
    console.log('Backpack system enabled:', backpackEnabled);
    console.log('Equipment data loaded:', !!equipmentData.inventory);
    console.log('Selected bag:', equipmentData.selectedBag);
    
    try {
        const overviewContent = renderOverviewContent();
        console.log('Overview content generated:', overviewContent ? 'success' : 'failed');
        
        equipmentTabContent.innerHTML = `
            <div class="equipment-container">
                <div class="equipment-header">
                    <h2>Equipment Overview</h2>
                    ${backpackEnabled && isOverEncumbered ? '<div class="encumbrance-warning">⚠️ ENCUMBERED - Carrying too much weight!</div>' : ''}
                    ${backpackEnabled ? `
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
                    </div>` : ''}
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
    
    // Check if backpack system is enabled
    const backpackEnabled = window.backpackSystemEnabled !== false;
    
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
                                        `${generateItemDetailsHTML(equipped.primaryWeapon)}
                                         <button class="unequip-btn" onclick="unequipSpecificItem('primaryWeapon')">×</button>` :
                                        '<div class="empty-slot">Drop weapon here</div>'
                                    }
                                </div>
                            </div>
                            <div class="equipment-slot ${equipped.secondaryWeapon ? 'filled' : 'empty'}" data-slot="secondaryWeapon">
                                <div class="slot-label">Secondary Weapon</div>
                                <div class="slot-content">
                                    ${equipped.secondaryWeapon ? 
                                        `${generateItemDetailsHTML(equipped.secondaryWeapon)}
                                         <button class="unequip-btn" onclick="unequipSpecificItem('secondaryWeapon')">×</button>` :
                                        '<div class="empty-slot">Drop weapon here</div>'
                                    }
                                </div>
                            </div>
                            <div class="equipment-slot ${equipped.armor ? 'filled' : 'empty'}" data-slot="armor">
                                <div class="slot-label">Armor</div>
                                <div class="slot-content">
                                    ${equipped.armor ? 
                                        `${generateItemDetailsHTML(equipped.armor)}
                                         <button class="unequip-btn" onclick="unequipSpecificItem('armor')">×</button>` :
                                        '<div class="empty-slot">Drop armor here</div>'
                                    }
                                </div>
                            </div>
                        </div>
                    </div>

                    ${backpackEnabled ? `
                    <!-- Attire -->
                    <div class="equipment-category">
                        <h4>👕 Attire</h4>
                        <div class="equipment-slots">
                            <div class="equipment-slot ${equipped.clothing ? 'filled' : 'empty'}" data-slot="clothing">
                                <div class="slot-label">Clothing</div>
                                <div class="slot-content">
                                    ${equipped.clothing ? 
                                        `${generateItemDetailsHTML(equipped.clothing)}
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
                                                    `${generateItemDetailsHTML(item)}
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
                                                `${generateItemDetailsHTML(item)}
                                                 <button class="unequip-btn" onclick="unequipBeltItem(${i})">×</button>` :
                                                '<div class="empty-slot">Empty</div>'
                                            }
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>` : ''}
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
                        filteredItems.map((item) => {
                            // Find the actual inventory index for this item
                            const actualIndex = items.findIndex(inventoryItem => inventoryItem.id === item.id);
                            return renderCompactItemCard(item, category, actualIndex);
                        }).join('') :
                        '<div class="no-items">No items in this category</div>'
                    }
                </div>
            </div>
        `;
    }).join('');
}

function renderCompactItemCard(item, category, index) {
    const isEquipped = isItemEquipped(item, item.type);
    // Use currentWeight if available, otherwise fall back to original system
    const weight = item.currentWeight !== undefined ? item.currentWeight : (encumbranceWeights[item.type] || 1);
    

    
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
    // Check if an add item modal is already open
    const existingModal = document.querySelector('.modal.add-item-modal');
    if (existingModal) {
        return; // Don't create another modal
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal add-item-modal';
    modal.innerHTML = `
        <div class="modal-content glassmorphic">
            <div class="modal-header">
                <h3>✨ Add New Item</h3>
                <button type="button" class="modal-close-btn" onclick="closeModal(this)" title="Close">×</button>
            </div>
            
            <div class="modal-body scrollable">
                <form id="add-item-form" class="add-item-form">
                <div class="form-row">
                                         <div class="form-group">
                         <label for="item-type">
                             <span class="label-icon">🏷️</span>
                             Item Type
                         </label>
                         <select id="item-type" required onchange="handleItemTypeChange()">
                             ${itemTypes.map(type => 
                                 `<option value="${type}" ${type === defaultType ? 'selected' : ''}>${type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}</option>`
                             ).join('')}
                         </select>
                         <div id="custom-type-container" style="display: none; margin-top: 10px;">
                             <label for="custom-item-type">
                                 <span class="label-icon">✏️</span>
                                 Custom Type Name
                             </label>
                             <input type="text" id="custom-item-type" placeholder="e.g., Scroll, Trinket, Gadget">
                             <div class="custom-type-info">
                                 <small>Custom items will be equipped in the Belt & Consumables section</small>
                             </div>
                         </div>
                     </div>
                    
                    <div class="form-group">
                        <label for="item-name">
                            <span class="label-icon">📝</span>
                            Name <span class="required">*</span>
                        </label>
                        <input type="text" id="item-name" required placeholder="Enter item name">
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="item-description">
                        <span class="label-icon">📋</span>
                        Description
                    </label>
                    <textarea id="item-description" rows="3" placeholder="Describe the item's appearance and basic properties..."></textarea>
                </div>
                
                <div class="form-group">
                    <label for="item-features">
                        <span class="label-icon">⚡</span>
                        Features & Abilities
                    </label>
                    <textarea id="item-features" rows="2" placeholder="Special abilities, magical properties, or unique features..."></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="item-dice">
                            <span class="label-icon">🎲</span>
                            Dice Roll
                        </label>
                        <input type="text" id="item-dice" placeholder="e.g., 1d6, 2d8+3">
                    </div>
                    
                    <div class="form-group">
                        <label for="item-ability">
                            <span class="label-icon">💪</span>
                            Associated Ability
                        </label>
                        <select id="item-ability">
                            <option value="">None</option>
                            ${abilities.map(ability => 
                                `<option value="${ability}">${ability}</option>`
                            ).join('')}
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="item-tags">
                        <span class="label-icon">🏆</span>
                        Tags
                    </label>
                    <div class="tags-selection enhanced">
                        ${additionalTags.map(tag => `
                            <label class="tag-checkbox enhanced">
                                <input type="checkbox" value="${tag}">
                                <span class="checkmark"></span>
                                <span class="tag-text">${tag}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
                
                <div class="modal-buttons enhanced">
                    <button type="submit" class="confirm-btn add-item-btn">
                        <span class="btn-icon">✅</span>
                        Add Item
                    </button>
                    <button type="button" class="cancel-btn" onclick="closeModal(this)">
                        <span class="btn-icon">❌</span>
                        Cancel
                    </button>
                </div>
            </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    
    // Add smooth entrance animation
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    // Focus on the name input for better UX
    setTimeout(() => {
        const nameInput = document.getElementById('item-name');
        if (nameInput) nameInput.focus();
    }, 100);
    
    document.getElementById('add-item-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const success = addNewItem();
        if (success) {
            // Add success animation
            const addBtn = modal.querySelector('.add-item-btn');
            addBtn.innerHTML = '<span class="btn-icon">✅</span> Added!';
            addBtn.style.background = 'rgba(76, 175, 80, 0.3)';
            addBtn.style.borderColor = 'rgba(76, 175, 80, 0.6)';
            addBtn.style.color = '#4CAF50';
            
            setTimeout(() => {
                closeModalWithAnimation(modal);
            }, 800);
        }
    });
    
    // Handle escape key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeModalWithAnimation(modal);
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

function closeModalWithAnimation(modal) {
    modal.classList.remove('show');
    setTimeout(() => {
        if (modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
    }, 300);
}

function handleItemTypeChange() {
    const typeSelect = document.getElementById('item-type');
    const customContainer = document.getElementById('custom-type-container');
    const customInput = document.getElementById('custom-item-type');
    
    if (typeSelect.value === 'custom') {
        customContainer.style.display = 'block';
        customContainer.classList.remove('hide');
        customContainer.classList.add('show');
        customInput.required = true;
        // Focus on custom input for better UX
        setTimeout(() => customInput.focus(), 100);
    } else {
        customContainer.classList.remove('show');
        customContainer.classList.add('hide');
        customInput.required = false;
        customInput.value = ''; // Clear the input
        // Hide after animation completes
        setTimeout(() => {
            if (customContainer.classList.contains('hide')) {
                customContainer.style.display = 'none';
                customContainer.classList.remove('hide');
            }
        }, 300);
    }
}

function addNewItem() {
    try {
        let type = document.getElementById('item-type').value;
        const name = document.getElementById('item-name').value.trim();
        const description = document.getElementById('item-description').value.trim();
        const features = document.getElementById('item-features').value.trim();
        const diceRoll = document.getElementById('item-dice').value.trim();
        const ability = document.getElementById('item-ability').value;
        
        // Handle custom type
        if (type === 'custom') {
            const customType = document.getElementById('custom-item-type').value.trim();
            if (!customType) {
                showFieldError('custom-item-type', 'Custom type name is required');
                return false;
            }
            if (customType.length > 30) {
                showFieldError('custom-item-type', 'Custom type must be 30 characters or less');
                return false;
            }
            // Validate custom type doesn't conflict with existing types
            const normalizedCustomType = customType.toLowerCase().replace(/\s+/g, '-');
            if (itemTypes.includes(normalizedCustomType)) {
                showFieldError('custom-item-type', 'This type already exists. Please choose a different name.');
                return false;
            }
            type = normalizedCustomType;
        }
        
        // Validation
        if (!name) {
            showFieldError('item-name', 'Name is required');
            return false;
        }
        
        if (name.length > 50) {
            showFieldError('item-name', 'Name must be 50 characters or less');
            return false;
        }
        
                 // Get selected tags
        const tagCheckboxes = document.querySelectorAll('.tag-checkbox.enhanced input:checked');
        const tags = Array.from(tagCheckboxes).map(cb => cb.value);
        
        // Get the weight for this item type
        const originalWeight = encumbranceWeights[type] || 1;
        
        const newItem = {
            name,
            type,
            description: description || null,
            features: features || null,
            diceRoll: diceRoll || null,
            ability: ability || null,
            tags: tags.length > 0 ? tags : null,
            id: Date.now(), // Simple ID generation
            originalWeight: originalWeight,
            currentWeight: originalWeight
        };
        
        // Add to appropriate category
        let category = getItemCategory(type);
        
        // Custom types go to Personal category
        if (type !== 'custom' && !itemTypes.includes(type)) {
            category = 'Personal';
        }
        
        if (!equipmentData.inventory[category]) {
            equipmentData.inventory[category] = [];
        }
        equipmentData.inventory[category].push(newItem);
        saveEquipmentData();
        
        // Refresh current section and update encumbrance
        const activeSection = document.querySelector('.equipment-nav-btn.active')?.dataset.section || 'overview';
        switchEquipmentSection(activeSection);
        
        // Update encumbrance display
        updateEncumbranceDisplay();
        
        // Show success notification
        if (window.showNotification && typeof window.showNotification === 'function') {
            window.showNotification(`"${name}" added successfully!`, 'success');
        }
        
        return true;
    } catch (error) {
        console.error('Error adding new item:', error);
        if (window.showNotification && typeof window.showNotification === 'function') {
            window.showNotification('Error adding item. Please try again.', 'error');
        }
        return false;
    }
}

function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    
    // Remove existing error
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    
    // Add error styling
    field.style.borderColor = '#ff6464';
    field.style.background = 'rgba(255, 100, 100, 0.1)';
    
    // Add error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        color: #ff6464;
        font-size: 0.8rem;
        margin-top: 5px;
        animation: slideIn 0.3s ease;
    `;
    
    field.parentNode.appendChild(errorDiv);
    
    // Focus the field
    field.focus();
    
    // Remove error styling when user starts typing
    const clearError = () => {
        field.style.borderColor = '';
        field.style.background = '';
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
        field.removeEventListener('input', clearError);
    };
    
    field.addEventListener('input', clearError);
    
    // Auto-remove error after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            clearError();
        }
    }, 5000);
}

function generateItemDetailsHTML(item) {
    if (!item) return '';
    
    let detailsHTML = `<div class="equipped-item-name">${item.name}</div>`;
    
    if (item.type) {
        detailsHTML += `<div class="item-type">Type: ${item.type.charAt(0).toUpperCase() + item.type.slice(1).replace('-', ' ')}</div>`;
    }
    
    if (item.description) {
        detailsHTML += `<div class="item-description">${item.description}</div>`;
    }
    
    if (item.features) {
        detailsHTML += `<div class="item-features">Features: ${item.features}</div>`;
    }
    
    if (item.diceRoll) {
        detailsHTML += `<div class="item-dice">Dice: ${item.diceRoll}</div>`;
    }
    
    if (item.ability) {
        detailsHTML += `<div class="item-ability">Ability: ${item.ability}</div>`;
    }
    
    if (item.tags && item.tags.length > 0) {
        detailsHTML += `<div class="item-tags">Tags: ${item.tags.join(', ')}</div>`;
    }
    
    return detailsHTML;
}

function isItemEquipped(item, type) {
    const equipped = equipmentData.equipped;
    
    if (!item || !item.id) {
        return false;
    }
    
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
        // For consumables, quest items, custom types, etc. - check belt slots
        return equipped.belt.some(slot => slot && slot.id === item.id);
    }
}



function unequipItem(type, index) {
    // Find the item in the appropriate category
    const category = getItemCategory(type);
    const item = equipmentData.inventory[category][index];
    
    if (!item) {
        console.error(`Item not found at ${category}[${index}]`);
        return;
    }
    
    // Unequip the item
    const equipped = equipmentData.equipped;
    
    // Remove item from equipped slots
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
        // For all other items (consumables, quest items, etc.) - check belt slots
        const slotIndex = equipped.belt.findIndex(slot => slot && slot.id === item.id);
        if (slotIndex !== -1) {
            equipped.belt[slotIndex] = null;
        }
    }
    
    // Restore original weight when unequipped (initialize weight properties if needed)
    if (item.currentWeight === undefined) {
        item.originalWeight = encumbranceWeights[item.type] || 1;
        item.currentWeight = 0; // It was equipped, so current weight was 0
    }
    item.currentWeight = item.originalWeight;
    
    // Save data first
    saveEquipmentData();
    
    // Update displays
    updateActiveWeaponsAndArmor();
    updateEncumbranceDisplay();
    
    // Force refresh of the current section to show updated weights
    const activeSection = document.querySelector('.equipment-nav-btn.active').dataset.section;
    if (activeSection === 'inventory') {
        // Force a complete re-render of the inventory section
        document.getElementById('equipment-content').innerHTML = renderInventorySection();
    } else {
        switchEquipmentSection(activeSection);
    }
}



function equipItem(type, index) {
    // Find the item in the appropriate category
    const category = getItemCategory(type);
    const item = equipmentData.inventory[category][index];
    
    if (!item) {
        console.error(`Item not found at ${category}[${index}]`);
        return;
    }
    
    // Check if item is already equipped
    if (isItemEquipped(item, type)) {
        alert('This item is already equipped!');
        return;
    }
    
    // Equip the item
    if (item.type === 'weapon') {
        // Show weapon slot selection
        showWeaponSlotModal(item);
        return; // showWeaponSlotModal handles the rest
    } else if (item.type === 'jewelry') {
        // Find empty jewelry slot
        const emptySlot = equipmentData.equipped.jewelry.findIndex(slot => !slot);
        if (emptySlot !== -1) {
            equipmentData.equipped.jewelry[emptySlot] = item;
        } else {
            alert('All jewelry slots are full. Unequip an item first.');
            return;
        }
    } else if (item.type === 'armor') {
        // Check if armor slot is already occupied
        if (equipmentData.equipped.armor) {
            alert('You already have armor equipped. Unequip it first.');
            return;
        }
        equipmentData.equipped.armor = item;
    } else if (item.type === 'clothing') {
        // Check if clothing slot is already occupied
        if (equipmentData.equipped.clothing) {
            alert('You already have clothing equipped. Unequip it first.');
            return;
        }
        equipmentData.equipped.clothing = item;
    } else {
        // For all other items (consumables, quest items, custom types, etc.) - use belt slots
        const emptySlot = equipmentData.equipped.belt.findIndex(slot => !slot);
        if (emptySlot !== -1) {
            equipmentData.equipped.belt[emptySlot] = item;
        } else {
            alert('All belt slots are full. Unequip an item first.');
            return;
        }
    }
    
    // Set item weight to 0 when equipped (initialize weight properties if needed)
    if (item.currentWeight === undefined) {
        item.originalWeight = encumbranceWeights[item.type] || 1;
        item.currentWeight = item.originalWeight;
    }
    item.currentWeight = 0;
    
    // Save data first
    saveEquipmentData();
    
    // Update displays
    updateActiveWeaponsAndArmor();
    updateEncumbranceDisplay();
    
    // Force refresh of the current section to show updated weights
    const activeSection = document.querySelector('.equipment-nav-btn.active').dataset.section;
    if (activeSection === 'inventory') {
        // Force a complete re-render of the inventory section
        document.getElementById('equipment-content').innerHTML = renderInventorySection();
    } else {
        switchEquipmentSection(activeSection);
    }
}

function showWeaponSlotModal(weapon) {
    // Check if a weapon slot modal is already open
    const existingModal = document.querySelector('.modal.weapon-slot-modal');
    if (existingModal) {
        return; // Don't create another modal
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal weapon-slot-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Equip Weapon: ${weapon.name}</h3>
            <p>Choose weapon slot:</p>
            <div class="modal-buttons">
                <button onclick="equipWeaponToSlot('primaryWeapon', '${weapon.id}'); closeModal(this)" class="confirm-btn">Primary Weapon</button>
                <button onclick="equipWeaponToSlot('secondaryWeapon', '${weapon.id}'); closeModal(this)" class="confirm-btn">Secondary Weapon</button>
                <button onclick="closeModal(this)" class="cancel-btn">Cancel</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

function equipWeaponToSlot(slot, weaponId) {
    // Convert weaponId to number if it's a string (from onclick handler)
    const numericWeaponId = typeof weaponId === 'string' ? parseInt(weaponId) : weaponId;
    
    // Find the actual weapon in inventory by ID
    let weapon = null;
    for (const [category, items] of Object.entries(equipmentData.inventory)) {
        const foundWeapon = items.find(item => item.id === numericWeaponId);
        if (foundWeapon) {
            weapon = foundWeapon;
            break;
        }
    }
    
    if (!weapon) {
        console.error(`Weapon with ID ${weaponId} not found in inventory`);
        alert('Weapon not found!');
        return;
    }
    
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
    
    // Set weapon weight to 0 when equipped (initialize weight properties if needed)
    if (weapon.currentWeight === undefined) {
        weapon.originalWeight = encumbranceWeights[weapon.type] || 1;
        weapon.currentWeight = weapon.originalWeight;
    }
    weapon.currentWeight = 0;
    
    // Save data first
    saveEquipmentData();
    
    // Update displays
    updateActiveWeaponsAndArmor();
    updateEncumbranceDisplay();
    
    // Force refresh of the current section to show updated weights
    const activeSection = document.querySelector('.equipment-nav-btn.active').dataset.section;
    if (activeSection === 'inventory') {
        // Force a complete re-render of the inventory section
        document.getElementById('equipment-content').innerHTML = renderInventorySection();
    } else {
        switchEquipmentSection(activeSection);
    }
}

function editItem(category, index) {
    const item = equipmentData.inventory[category][index];
    
    // Check if an edit item modal is already open
    const existingModal = document.querySelector('.modal.edit-item-modal');
    if (existingModal) {
        return; // Don't create another modal
    }
    
    // Show edit modal with pre-filled values
    const modal = document.createElement('div');
    modal.className = 'modal edit-item-modal';
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
        
        // Handle automatic conversions
        if (type === 'coins' && equipmentData.gold.coins === 10) {
            // Always try to auto-convert, but only if pouches can be filled
            if (equipmentData.gold.pouches < 10) {
                equipmentData.gold.coins = 0;
                equipmentData.gold.pouches = Math.min(equipmentData.gold.pouches + 1, 10);
            }
            // If pouches are full (10/10), allow 10th coin to stay filled
        }
        
        if (type === 'pouches' && equipmentData.gold.pouches === 10) {
            // Always try to auto-convert, but only if chest can be filled
            if (equipmentData.gold.chest < 1) {
                equipmentData.gold.pouches = 0;
                equipmentData.gold.chest = 1;
            }
            // If chest is full (1/1), allow 10th pouch to stay filled
        }
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
        // Check if backpack system is enabled
        const backpackEnabled = window.backpackSystemEnabled !== false;
        
        if (backpackEnabled && isEncumbered()) {
            mainWarning.style.display = 'block';
        } else {
            mainWarning.style.display = 'none';
        }
    }
}

function updateEncumbranceDisplay() {
    // Add a small delay to ensure DOM and state are synchronized
    setTimeout(() => {
        doUpdateEncumbranceDisplay();
    }, 10);
}

function doUpdateEncumbranceDisplay() {
    // Check if backpack system is enabled
    const backpackEnabled = window.backpackSystemEnabled !== false;
    
    if (!backpackEnabled) {
        // If backpack system is disabled, hide all encumbrance displays
        const encumbranceText = document.querySelector('.encumbrance-text');
        const encumbranceFill = document.querySelector('.encumbrance-fill');
        const encumbranceWarning = document.querySelector('.encumbrance-warning');
        
        if (encumbranceText) encumbranceText.style.display = 'none';
        if (encumbranceFill) encumbranceFill.style.display = 'none';
        if (encumbranceWarning) encumbranceWarning.style.display = 'none';
        return;
    }
    
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
        // Check if it's the enhanced add item modal
        if (modal.classList.contains('add-item-modal')) {
            closeModalWithAnimation(modal);
        } else {
            // For other modals, use immediate removal
            modal.remove();
        }
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
            
            // Sync equipped items with inventory to ensure object references match
            syncEquippedItemReferences();
            
            // Initialize weight properties for existing items that don't have them
            initializeItemWeights();
        } catch (error) {
            console.error('Error parsing saved equipment data:', error);
        }
    } else {
        console.log('No saved equipment data found, using defaults');
    }
}

function syncEquippedItemReferences() {
    
    // Create a map of all inventory items by ID for quick lookup
    const itemMap = new Map();
    Object.values(equipmentData.inventory).forEach(categoryItems => {
        categoryItems.forEach(item => {
            if (item && item.id) {
                itemMap.set(item.id, item);
            }
        });
    });
    
    // Sync equipped items
    const equipped = equipmentData.equipped;
    let syncedCount = 0;
    
    // Sync weapons
    if (equipped.primaryWeapon && equipped.primaryWeapon.id) {
        const inventoryItem = itemMap.get(equipped.primaryWeapon.id);
        if (inventoryItem) {
            equipped.primaryWeapon = inventoryItem;
            syncedCount++;
        } else {
            console.warn(`Primary weapon not found in inventory: ${equipped.primaryWeapon.name}`);
            equipped.primaryWeapon = null;
        }
    }
    
    if (equipped.secondaryWeapon && equipped.secondaryWeapon.id) {
        const inventoryItem = itemMap.get(equipped.secondaryWeapon.id);
        if (inventoryItem) {
            equipped.secondaryWeapon = inventoryItem;
            syncedCount++;
        } else {
            console.warn(`Secondary weapon not found in inventory: ${equipped.secondaryWeapon.name}`);
            equipped.secondaryWeapon = null;
        }
    }
    
    // Sync armor
    if (equipped.armor && equipped.armor.id) {
        const inventoryItem = itemMap.get(equipped.armor.id);
        if (inventoryItem) {
            equipped.armor = inventoryItem;
            syncedCount++;
        } else {
            console.warn(`Armor not found in inventory: ${equipped.armor.name}`);
            equipped.armor = null;
        }
    }
    
    // Sync clothing
    if (equipped.clothing && equipped.clothing.id) {
        const inventoryItem = itemMap.get(equipped.clothing.id);
        if (inventoryItem) {
            equipped.clothing = inventoryItem;
            syncedCount++;
        } else {
            console.warn(`Clothing not found in inventory: ${equipped.clothing.name}`);
            equipped.clothing = null;
        }
    }
    
    // Sync jewelry
    equipped.jewelry = equipped.jewelry.map((jewelryItem, index) => {
        if (jewelryItem && jewelryItem.id) {
            const inventoryItem = itemMap.get(jewelryItem.id);
            if (inventoryItem) {
                syncedCount++;
                return inventoryItem;
            } else {
                console.warn(`Jewelry not found in inventory: ${jewelryItem.name}`);
                return null;
            }
        }
        return null;
    });
    
    // Sync belt items
    equipped.belt = equipped.belt.map((beltItem, index) => {
        if (beltItem && beltItem.id) {
            const inventoryItem = itemMap.get(beltItem.id);
            if (inventoryItem) {
                syncedCount++;
                return inventoryItem;
            } else {
                console.warn(`Belt item not found in inventory: ${beltItem.name}`);
                return null;
            }
        }
        return null;
    });
    
    if (syncedCount > 0) {
        console.log(`Equipment sync: ${syncedCount} equipped items synced`);
    }
}

function initializeItemWeights() {
    let itemsUpdated = 0;
    
    // Go through all items and initialize weight properties if they don't exist
    Object.values(equipmentData.inventory).forEach(categoryItems => {
        categoryItems.forEach(item => {
            if (item.currentWeight === undefined) {
                const originalWeight = encumbranceWeights[item.type] || 1;
                item.originalWeight = originalWeight;
                
                // Set current weight based on whether the item is equipped
                if (isItemEquipped(item, item.type)) {
                    item.currentWeight = 0; // Equipped items have 0 weight
                } else {
                    item.currentWeight = originalWeight; // Unequipped items have original weight
                }
                
                itemsUpdated++;
            }
        });
    });
    
    if (itemsUpdated > 0) {
        console.log(`Weight initialization: ${itemsUpdated} items updated with weight properties`);
    }
}

function initializeEquipmentData() {
    // Ensure all required properties exist (for backward compatibility)
    if (!equipmentData.equipped) {
        equipmentData.equipped = {
            primaryWeapon: null,
            secondaryWeapon: null,
            armor: null,
            clothing: null,
            jewelry: [null, null, null],
            belt: [null, null, null, null, null]
        };
    }
    
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
    
    // Ensure selectedBag exists
    if (!equipmentData.selectedBag) {
        equipmentData.selectedBag = 'Standard Backpack';
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
        // Initialize and load equipment data
        initializeEquipmentData();
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
window.handleItemTypeChange = handleItemTypeChange;
window.generateItemDetailsHTML = generateItemDetailsHTML;
window.initializeEquipment = initializeEquipment;
window.renderEquipmentOverview = renderEquipmentOverview;
