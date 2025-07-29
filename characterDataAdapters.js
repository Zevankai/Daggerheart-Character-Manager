/**
 * Character Data Adapters
 * These functions integrate existing systems with the new CharacterDataStore
 * ensuring all character data is properly isolated
 */

// Journal System Adapter
class JournalAdapter {
    static getEntries() {
        if (window.characterDataStore) {
            const data = window.characterDataStore.getCurrentCharacterData();
            return data ? data.journal.entries : [];
        }
        // Fallback to old system
        return JSON.parse(localStorage.getItem('zevi-journal-entries')) || [];
    }
    
    static saveEntries(entries) {
        if (window.characterDataStore) {
            return window.characterDataStore.updateCurrentCharacterData({
                journal: { entries: entries }
            });
        }
        // Fallback to old system
        localStorage.setItem('zevi-journal-entries', JSON.stringify(entries));
        return true;
    }
    
    static addEntry(entry) {
        const entries = this.getEntries();
        entries.push({
            ...entry,
            id: Date.now().toString(),
            timestamp: new Date().toISOString()
        });
        return this.saveEntries(entries);
    }
}

// Details System Adapter
class DetailsAdapter {
    static getDetails() {
        if (window.characterDataStore) {
            const data = window.characterDataStore.getCurrentCharacterData();
            return data ? data.details : {
                background: '',
                personality: '',
                connections: '',
                notes: ''
            };
        }
        // Fallback to old system
        return JSON.parse(localStorage.getItem('zevi-character-details')) || {
            background: '',
            personality: '',
            connections: '',
            notes: ''
        };
    }
    
    static saveDetails(details) {
        if (window.characterDataStore) {
            return window.characterDataStore.updateCurrentCharacterData({
                details: details
            });
        }
        // Fallback to old system
        localStorage.setItem('zevi-character-details', JSON.stringify(details));
        return true;
    }
}

// Equipment System Adapter
class EquipmentAdapter {
    static getEquipment() {
        if (window.characterDataStore) {
            const data = window.characterDataStore.getCurrentCharacterData();
            return data ? data.equipment : {
                backpackType: 'None',
                backpackEnabled: true,
                items: [],
                activeWeapons: [],
                activeArmor: []
            };
        }
        // Fallback to old system
        return JSON.parse(localStorage.getItem('zevi-equipment')) || {
            backpackType: 'None',
            backpackEnabled: true,
            items: [],
            activeWeapons: [],
            activeArmor: []
        };
    }
    
    static saveEquipment(equipment) {
        if (window.characterDataStore) {
            return window.characterDataStore.updateCurrentCharacterData({
                equipment: equipment
            });
        }
        // Fallback to old system
        localStorage.setItem('zevi-equipment', JSON.stringify(equipment));
        return true;
    }
}

// Experiences System Adapter
class ExperiencesAdapter {
    static getExperiences() {
        if (window.characterDataStore) {
            const data = window.characterDataStore.getCurrentCharacterData();
            return data ? data.experiences : [];
        }
        // Fallback to old system
        return JSON.parse(localStorage.getItem('zevi-experiences')) || [];
    }
    
    static saveExperiences(experiences) {
        if (window.characterDataStore) {
            return window.characterDataStore.updateCurrentCharacterData({
                experiences: experiences
            });
        }
        // Fallback to old system
        localStorage.setItem('zevi-experiences', JSON.stringify(experiences));
        return true;
    }
}

// Hope System Adapter
class HopeAdapter {
    static getHope() {
        if (window.characterDataStore) {
            const data = window.characterDataStore.getCurrentCharacterData();
            return data ? data.hope : { current: 0, max: 6 };
        }
        // Fallback to old system
        return {
            current: parseInt(localStorage.getItem('zevi-hope')) || 0,
            max: parseInt(localStorage.getItem('zevi-max-hope')) || 6
        };
    }
    
    static saveHope(hope) {
        if (window.characterDataStore) {
            return window.characterDataStore.updateCurrentCharacterData({
                hope: hope
            });
        }
        // Fallback to old system
        localStorage.setItem('zevi-hope', hope.current.toString());
        localStorage.setItem('zevi-max-hope', hope.max.toString());
        return true;
    }
}

// Downtime System Adapter
class DowntimeAdapter {
    static getProjects() {
        if (window.characterDataStore) {
            const data = window.characterDataStore.getCurrentCharacterData();
            return data ? data.downtime.projects : [];
        }
        // Fallback to old system
        return JSON.parse(localStorage.getItem('zevi-projects')) || [];
    }
    
    static saveProjects(projects) {
        if (window.characterDataStore) {
            const currentData = window.characterDataStore.getCurrentCharacterData();
            const downtime = currentData ? currentData.downtime : { projects: [], activities: [] };
            downtime.projects = projects;
            
            return window.characterDataStore.updateCurrentCharacterData({
                downtime: downtime
            });
        }
        // Fallback to old system
        localStorage.setItem('zevi-projects', JSON.stringify(projects));
        return true;
    }
}

// Combat Stats Adapter
class CombatStatsAdapter {
    static getHP() {
        if (window.characterDataStore) {
            const data = window.characterDataStore.getCurrentCharacterData();
            return data ? data.hp : { current: 4, max: 4, circles: [] };
        }
        // Fallback to old system
        return {
            circles: JSON.parse(localStorage.getItem('zevi-hp-circles')) || [],
            current: 4,
            max: 4
        };
    }
    
    static saveHP(hp) {
        if (window.characterDataStore) {
            return window.characterDataStore.updateCurrentCharacterData({
                hp: hp
            });
        }
        // Fallback to old system
        localStorage.setItem('zevi-hp-circles', JSON.stringify(hp.circles));
        return true;
    }
    
    static getStress() {
        if (window.characterDataStore) {
            const data = window.characterDataStore.getCurrentCharacterData();
            return data ? data.stress : { current: 0, max: 4, circles: [] };
        }
        // Fallback to old system
        return {
            circles: JSON.parse(localStorage.getItem('zevi-stress-circles')) || [],
            current: 0,
            max: 4
        };
    }
    
    static saveStress(stress) {
        if (window.characterDataStore) {
            return window.characterDataStore.updateCurrentCharacterData({
                stress: stress
            });
        }
        // Fallback to old system
        localStorage.setItem('zevi-stress-circles', JSON.stringify(stress.circles));
        return true;
    }
    
    static getArmor() {
        if (window.characterDataStore) {
            const data = window.characterDataStore.getCurrentCharacterData();
            return data ? data.armor : { current: 0, max: 4, circles: [], activeCount: 0, totalCircles: 4 };
        }
        // Fallback to old system
        return {
            circles: JSON.parse(localStorage.getItem('zevi-armor-circles')) || [],
            activeCount: parseInt(localStorage.getItem('zevi-active-armor-count')) || 0,
            totalCircles: parseInt(localStorage.getItem('zevi-total-armor-circles')) || 4,
            current: 0,
            max: 4
        };
    }
    
    static saveArmor(armor) {
        if (window.characterDataStore) {
            return window.characterDataStore.updateCurrentCharacterData({
                armor: armor
            });
        }
        // Fallback to old system
        localStorage.setItem('zevi-armor-circles', JSON.stringify(armor.circles));
        localStorage.setItem('zevi-active-armor-count', armor.activeCount.toString());
        localStorage.setItem('zevi-total-armor-circles', armor.totalCircles.toString());
        return true;
    }
    
    static getDamage() {
        if (window.characterDataStore) {
            const data = window.characterDataStore.getCurrentCharacterData();
            return data ? data.damage : { minor: 1, major: 2 };
        }
        // Fallback to old system
        return {
            minor: parseInt(localStorage.getItem('zevi-minor-damage-value')) || 1,
            major: parseInt(localStorage.getItem('zevi-major-damage-value')) || 2
        };
    }
    
    static saveDamage(damage) {
        if (window.characterDataStore) {
            return window.characterDataStore.updateCurrentCharacterData({
                damage: damage
            });
        }
        // Fallback to old system
        localStorage.setItem('zevi-minor-damage-value', damage.minor.toString());
        localStorage.setItem('zevi-major-damage-value', damage.major.toString());
        return true;
    }
}

// Make adapters globally available
window.JournalAdapter = JournalAdapter;
window.DetailsAdapter = DetailsAdapter;
window.EquipmentAdapter = EquipmentAdapter;
window.ExperiencesAdapter = ExperiencesAdapter;
window.HopeAdapter = HopeAdapter;
window.DowntimeAdapter = DowntimeAdapter;
window.CombatStatsAdapter = CombatStatsAdapter;

console.log('Character Data Adapters loaded');