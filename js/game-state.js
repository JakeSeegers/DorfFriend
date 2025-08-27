// Global game state management
const game = {
    gold: 0,
    goldPerSecond: 0,
    dworfs: [],
    machines: [],
    buildings: [],
    negativeBuildings: [], // Negative personality-driven buildings
    goldDeposits: [],
    foodSources: [],  // Food sources
    waterSources: [], // Water sources
    time: 0,
    rocketParts: { ...ROCKET_PARTS_CONFIG },
    milestones: {
        firstAmenity: false,
        firstBuilding: false,
        hundredGold: false,
        thousandGold: false,
        tenThousandGold: false
    }
};

// Canvas and context references
let canvas, ctx;

// Initialize canvas references
function initializeCanvas() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
}

// Auto-resize canvas for mobile
function resizeCanvas() {
    if (!canvas) return;
    
    const container = document.getElementById('gameContainer');
    const containerWidth = container.clientWidth;
    
    // Make it twice as wide and three times taller as requested
    canvas.width = Math.min(containerWidth - 6, 800);  // Twice as wide (was ~400)
    canvas.height = Math.min(window.innerHeight * 0.75, 1200);  // Much taller (was ~300)
    
    canvas.style.width = canvas.width + 'px';
    canvas.style.height = canvas.height + 'px';
}

// --- Utilities for safe gold management ---

// Safe gold spending function
function safeSpendGold(amount, description) {
    if (game.gold >= amount) {
        game.gold -= amount;
        return true; // Success
    } else {
        console.warn(`Cannot spend ${amount} gold for ${description}. Only ${game.gold} available.`);
        return false; // Failed
    }
}

// Safe gold adding function (prevents NaN)
function safeAddGold(amount, description) {
    if (typeof amount === 'number' && !isNaN(amount) && amount >= 0) {
        game.gold += amount;
        return true;
    } else {
        console.warn(`Invalid gold amount: ${amount} for ${description}`);
        return false;
    }
}

// Emergency gold validation (call this in game loop occasionally)
function validateGoldIntegrity() {
    if (typeof game.gold !== 'number' || isNaN(game.gold)) {
        console.error('Gold corrupted! Resetting to 0');
        game.gold = 0;
    } else if (game.gold < 0) {
        console.error(`Negative gold detected: ${game.gold}! Resetting to 0`);
        if (typeof addLog === 'function') {
            addLog('⚠️ Gold corruption detected and fixed!', true, 'disaster');
        }
        game.gold = 0;
    }
}
