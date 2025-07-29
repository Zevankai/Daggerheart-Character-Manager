// Script to completely clear all character data
console.log('=== CLEARING ALL CHARACTER DATA ===');

// Get all localStorage keys
const allKeys = Object.keys(localStorage);
console.log('Found', allKeys.length, 'localStorage keys');

// Remove all character-related data
let removedCount = 0;
allKeys.forEach(key => {
    if (key.startsWith('zevi-') || key.startsWith('simple-character-')) {
        console.log('Removing:', key);
        localStorage.removeItem(key);
        removedCount++;
    }
});

console.log('Removed', removedCount, 'character data keys');
console.log('=== CLEANUP COMPLETE ===');

// Reload the page to ensure clean state
setTimeout(() => {
    console.log('Reloading page...');
    window.location.reload();
}, 1000);