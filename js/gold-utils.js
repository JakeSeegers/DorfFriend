// Gold utility functions and management

// Create gold deposits randomly around the map
function createGoldDeposit() {
    const deposit = {
        x: Math.random() * (canvas.width - 100) + 50,
        y: Math.random() * (canvas.height - 100) + 50,
        gold: 15 + Math.random() * 25,
        discovered: false
    };
    
    game.goldDeposits.push(deposit);
    return deposit;
}

// Spawn new gold deposits periodically
function spawnGoldDeposits() {
    if (game.goldDeposits.length < 3 && Math.random() < 0.02) {
        createGoldDeposit();
        if (Math.random() < 0.3) {
            addLog('✨ New gold deposit discovered!', false);
        }
    }
}

// Initialize starting gold deposits
function initializeGoldDeposits() {
    for (let i = 0; i < 4; i++) {
        createGoldDeposit();
    }
}

// Clean up empty deposits
function cleanupEmptyDeposits() {
    game.goldDeposits = game.goldDeposits.filter(deposit => deposit.gold > 0.1);
}

// Calculate total available gold in all deposits
function getTotalAvailableGold() {
    return game.goldDeposits.reduce((total, deposit) => total + deposit.gold, 0);
}

// Update gold deposits (called in game loop)
function updateGoldDeposits() {
    spawnGoldDeposits();
    cleanupEmptyDeposits();
}

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createGoldDeposit,
        spawnGoldDeposits,
        initializeGoldDeposits,
        cleanupEmptyDeposits,
        getTotalAvailableGold,
        updateGoldDeposits
    };
}
