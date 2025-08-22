// Global game state management
const game = {
    gold: 0,
    goldPerSecond: 1,
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