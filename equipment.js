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
    // Equipped items
    equipped: {
        primaryWeapon: null,
        secondaryWeapon: null,
        armor: null,
        clothes: null,
        jewelry: [null, null, null], // 3 slots
        potions: [null, null, null, null, null], // 5 slots
        canister: null,
        food: [null, null], // 2 slots
        questItems: [null, null] // 2 slots
    },
    // All items inventory
    inventory: {
        weapons: [],
        armor: [],
        clothing: [],
        jewelry: [],
        potions: [],
        canisters: [],
        food: [],
        questItems: [],
        other: []
    },
    // Gold tracking
    gold: {
        coins: 0, // 0-10
        pouches: 0, // 0-10
        chest: 0, // 0-1
        equippedPouches: 0, // 0-2 (equipped on person)
        banks: [] // Array of {location: string, chests: number}
    }
};

// ===== ITEM TYPES AND ABILITIES =====
const itemTypes = [
    'weapon', 'armor', 'clothing', 'jewelry', 
    'potion', 'canister', 'food', 'quest', 'other'
];

const abilities = [
    'Agility', 'Strength', 'Finesse', 
    'Instinct', 'Presence', 'Knowledge'
];

// ===== EQUIPMENT OVERVIEW =====
function renderEquipmentOverview() {
    const equipmentTabContent = document.getElementById('equipment-tab-content');
    
    equipmentTabContent.innerHTML = `
        <div class="equipment-container">
            <div class="equipment-header">
                <h2>Equipment Overview</h2>
                <div class="equipment-nav">
                    <button class="equipment-nav-btn active" data-section="overview">Overview</button>
                    <button class="equipment-nav-btn" data-section="gear">Gear & Weapons</button>
                    <button class="equipment-nav-btn" data-section="consumables">Consumables</button>
                    <button class="equipment-nav-btn" data-section="quest">Quest Items</button>
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
            <div class="equipped-items">
                <h3>Currently Equipped</h3>
                
                <div class="equipped-grid">
                    <div class="equipped-category">
                        <h4>Combat</h4>
                        <div class="equipped-slot">
                            <label>Primary Weapon:</label>
                            <span class="equipped-item">${equipped.primaryWeapon ? equipped.primaryWeapon.name : 'None'}</span>
                        </div>
                        <div class="equipped-slot">
                            <label>Secondary Weapon:</label>
                            <span class="equipped-item">${equipped.secondaryWeapon ? equipped.secondaryWeapon.name : 'None'}</span>
                        </div>
                        <div class="equipped-slot">
                            <label>Armor:</label>
                            <span class="equipped-item">${equipped.armor ? equipped.armor.name : 'None'}</span>
                        </div>
                    </div>
                    
                    <div class="equipped-category">
                        <h4>Attire</h4>
                        <div class="equipped-slot">
                            <label>Clothes:</label>
                            <span class="equipped-item">${equipped.clothes ? equipped.clothes.name : 'None'}</span>
                        </div>
                        <div class="equipped-slot">
                            <label>Jewelry:</label>
                            <div class="jewelry-slots">
                                ${equipped.jewelry.map((item, i) => 
                                    `<span class="equipped-item small">${item ? item.name : `Slot ${i+1}: Empty`}</span>`
                                ).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <div class="equipped-category">
                        <h4>Consumables</h4>
                        <div class="equipped-slot">
                            <label>Potions (${equipped.potions.filter(p => p).length}/5):</label>
                            <div class="consumable-slots">
                                ${equipped.potions.map((item, i) => 
                                    item ? `<span class="equipped-item small">${item.name}</span>` : ''
                                ).join('') || '<span class="equipped-item">None</span>'}
                            </div>
                        </div>
                        <div class="equipped-slot">
                            <label>Canister:</label>
                            <span class="equipped-item">${equipped.canister ? equipped.canister.name : 'None'}</span>
                        </div>
                        <div class="equipped-slot">
                            <label>Food (${equipped.food.filter(f => f).length}/2):</label>
                            <div class="consumable-slots">
                                ${equipped.food.map((item, i) => 
                                    item ? `<span class="equipped-item small">${item.name}</span>` : ''
                                ).join('') || '<span class="equipped-item">None</span>'}
                            </div>
                        </div>
                    </div>
                    
                    <div class="equipped-category">
                        <h4>Quest Items</h4>
                        <div class="equipped-slot">
                            <label>Quest Items (${equipped.questItems.filter(q => q).length}/2):</label>
                            <div class="quest-slots">
                                ${equipped.questItems.map((item, i) => 
                                    item ? `<span class="equipped-item small">${item.name}</span>` : `<span class="equipped-item small">Slot ${i+1}: Empty</span>`
                                ).join('')}
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

// ===== GEAR & WEAPONS SECTION =====
function renderGearSection() {
    return `
        <div class="gear-section">
            <div class="section-header">
                <h3>Gear, Weapons & Clothing</h3>
                <button class="add-item-btn" onclick="showAddItemModal('weapon')">+ Add Item</button>
            </div>
            
            <div class="gear-categories">
                <div class="gear-category">
                    <h4>Weapons</h4>
                    <div class="items-grid" id="weapons-grid">
                        ${renderItemsGrid(equipmentData.inventory.weapons, 'weapon')}
                    </div>
                </div>
                
                <div class="gear-category">
                    <h4>Armor</h4>
                    <div class="items-grid" id="armor-grid">
                        ${renderItemsGrid(equipmentData.inventory.armor, 'armor')}
                    </div>
                </div>
                
                <div class="gear-category">
                    <h4>Clothing</h4>
                    <div class="items-grid" id="clothing-grid">
                        ${renderItemsGrid(equipmentData.inventory.clothing, 'clothing')}
                    </div>
                </div>
                
                <div class="gear-category">
                    <h4>Jewelry</h4>
                    <div class="items-grid" id="jewelry-grid">
                        ${renderItemsGrid(equipmentData.inventory.jewelry, 'jewelry')}
                    </div>
                </div>
            </div>
        </div>
    `;
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
        case 'gear':
            contentDiv.innerHTML = renderGearSection();
            break;
        case 'consumables':
            contentDiv.innerHTML = renderConsumablesSection();
            break;
        case 'quest':
            contentDiv.innerHTML = renderQuestSection();
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
    if (activeSection === 'overview') {
        switchEquipmentSection('overview');
    }
}

function equipItem(type, index) {
    const inventoryKey = type === 'weapon' ? 'weapons' : 
                        type === 'armor' ? 'armor' :
                        type === 'clothing' ? 'clothing' :
                        type === 'jewelry' ? 'jewelry' :
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
    if (activeSection === 'overview') {
        switchEquipmentSection('overview');
    }
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
    
    const weaponsContainer = activeWeaponsSection.querySelector('.weapons-container') || 
                           activeWeaponsSection.querySelector('div') ||
                           activeWeaponsSection;
    
    let weaponsHTML = '<h3>Active Weapons</h3>';
    
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
        weaponsHTML += '<p>No weapons equipped</p>';
    }
    
    weaponsContainer.innerHTML = weaponsHTML;
}

function updateActiveArmorDisplay() {
    const activeArmorSection = document.querySelector('[data-color-target="armor-section"]');
    if (!activeArmorSection) return;
    
    const armorContainer = activeArmorSection.querySelector('.armor-container') || 
                          activeArmorSection.querySelector('div') ||
                          activeArmorSection;
    
    let armorHTML = '<h3>Armor</h3>';
    
    if (equipmentData.equipped.armor) {
        armorHTML += `
            <div class="active-armor">
                <h4>${equipmentData.equipped.armor.name}</h4>
                ${equipmentData.equipped.armor.features ? `<p>Features: ${equipmentData.equipped.armor.features}</p>` : ''}
                ${equipmentData.equipped.armor.ability ? `<p>Ability: ${equipmentData.equipped.armor.ability}</p>` : ''}
            </div>
        `;
    } else {
        armorHTML += '<p>No armor equipped</p>';
    }
    
    armorContainer.innerHTML = armorHTML;
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