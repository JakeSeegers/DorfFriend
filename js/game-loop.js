// Main game loop and update logic - COMPLETE VERSION

function initDworfs() {
    // Create initial dwarfs using the Dwarf class
    for (let i = 0; i < 3; i++) {
        game.dworfs.push(new Dwarf(
            canvas.width / 2 + (i - 1) * 40,
            canvas.height / 2
        ));
    }
    
    addLog('🌟 Three dwarfs have arrived to start the colony!', true);
}

function updateGame() {
    // Validate gold integrity periodically to prevent corruption
    if (game.time % 300 === 0) {
        validateGoldIntegrity();
    }
    
    // Update all resource systems
    updateFoodAndWaterSources();
    
    // Update gold deposits if the function exists
    if (typeof updateGoldDeposits === 'function') {
        updateGoldDeposits();
    }
    
    // Update negative buildings if the function exists  
    if (typeof updateNegativeBuildings === 'function') {
        updateNegativeBuildings();
    }
    
    // Reduced new dwarf arrivals (much less frequent than before)
    if (game.buildings.length > game.dworfs.length && game.time % 1800 === 0 && Math.random() < 0.15) {
        const newX = Math.max(50, Math.min(canvas.width - 50, canvas.width / 2 + Math.random() * 100 - 50));
        const newY = Math.max(50, Math.min(canvas.height - 50, canvas.height / 2));
        
        // Create new dwarf
        game.dworfs.push(new Dwarf(newX, newY));
        addLog('👤 New dwarf joined the colony!', false);
    }
    
    // Check for game milestones
    checkMilestones();
    
    // Calculate gold per second for display
    if (game.time % 60 === 0) {
        const currentGold = game.gold;
        game.goldPerSecond = Math.max(0, (currentGold - (game.lastGoldCheck || 0)) / 1);
        game.lastGoldCheck = currentGold;
    }
    
    // Spawn new gold deposits occasionally
    if (game.time % 900 === 0 && Math.random() < 0.3) {
        if (typeof createGoldDeposit === 'function') {
            createGoldDeposit();
        }
    }
}

function checkMilestones() {
    // Gold milestones
    if (!game.milestones.hundredGold && game.gold >= 100) {
        game.milestones.hundredGold = true;
        addLog('💰 First 100 gold collected!', true);
    }
    if (!game.milestones.thousandGold && game.gold >= 1000) {
        game.milestones.thousandGold = true;
        addLog('💎 1000 gold milestone reached!', true);
    }
    if (!game.milestones.tenThousandGold && game.gold >= 10000) {
        game.milestones.tenThousandGold = true;
        addLog('🏆 10,000 gold! Colony is thriving!', true);
    }
    
    // Building milestones
    if (!game.milestones.firstBuilding && game.buildings.length >= 1) {
        game.milestones.firstBuilding = true;
        addLog('🏠 First building constructed!', true);
    }
    
    if (!game.milestones.firstAmenity && game.buildings.filter(b => b.type === 'amenity').length >= 1) {
        game.milestones.firstAmenity = true;
        addLog('🛏️ First amenity building completed!', true);
    }
    
    // Population milestones
    if (game.dworfs.length >= 10 && !game.milestones.tenDwarfs) {
        game.milestones.tenDwarfs = true;
        addLog('👥 Colony has grown to 10 dwarfs!', true);
    }
    
    // Rocket completion check
    let allPartsBuilt = true;
    for (let part in game.rocketParts) {
        if (!game.rocketParts[part].built) {
            allPartsBuilt = false;
            break;
        }
    }
    
    if (allPartsBuilt && !game.milestones.rocketComplete) {
        game.milestones.rocketComplete = true;
        addLog('🚀 ROCKET COMPLETED! Your dwarfs can escape to space!', true, 'success');
        addLog('🎉 VICTORY! The Fragile Dwarf Colony has achieved its goal!', true, 'success');
        
        // Victory celebration
        setTimeout(() => {
            addLog('👽 The dwarfs blast off into the cosmos, leaving their fragile world behind...', true, 'success');
            addLog('✨ Thanks for playing! Your colony succeeded against all odds!', true, 'success');
        }, 3000);
    }
}

function gameLoop() {
    // Update all dwarfs
    if (game.dworfs && game.dworfs.length > 0) {
        game.dworfs.forEach(function(dwarf) {
            if (dwarf && typeof dwarf.update === 'function') {
                dwarf.update();
            }
        });
    }
    
    // Render everything
    if (typeof renderGame === 'function') {
        renderGame();
    }
    
    // Update game state and UI
    updateGame();
    
    if (typeof updateUI === 'function') {
        updateUI();
    }
    
    if (typeof updateStability === 'function') {
        updateStability();
    }
    
    // Increment game time
    game.time++;
    
    // Continue the loop
    requestAnimationFrame(gameLoop);
}

// Backup food and water initialization if the main function doesn't exist
function initFoodAndWaterSources() {
    if (!canvas) return;
    
    // Ensure arrays exist
    if (!game.foodSources) game.foodSources = [];
    if (!game.waterSources) game.waterSources = [];
    
    // Create initial food sources (berry bushes) if none exist
    if (game.foodSources.length === 0) {
        for (let i = 0; i < 5; i++) {
            game.foodSources.push({
                x: Math.random() * (canvas.width - 100) + 50,
                y: Math.random() * (canvas.height - 100) + 50,
                amount: 60 + Math.random() * 60,
                maxAmount: 120,
                regrowTimer: 0,
                type: 'berries'
            });
        }
    }
    
    // Create initial water sources (springs) if none exist
    if (game.waterSources.length === 0) {
        for (let i = 0; i < 4; i++) {
            game.waterSources.push({
                x: Math.random() * (canvas.width - 100) + 50,
                y: Math.random() * (canvas.height - 100) + 50,
                amount: 100 + Math.random() * 80,
                maxAmount: 200,
                regrowTimer: 0,
                type: 'spring'
            });
        }
    }
}

// Backup resource update function if the main one doesn't exist
function updateFoodAndWaterSources() {
    if (!game.foodSources) game.foodSources = [];
    if (!game.waterSources) game.waterSources = [];
    
    // Regrow food sources over time (faster as requested)
    game.foodSources.forEach(source => {
        if (source.amount < source.maxAmount) {
            source.regrowTimer++;
            if (source.regrowTimer > 60) { // 3x faster regrowth
                source.amount = Math.min(source.maxAmount, source.amount + 5);
                source.regrowTimer = 0;
            }
        }
    });
    
    // Refill water sources over time (faster as requested)  
    game.waterSources.forEach(source => {
        if (source.amount < source.maxAmount) {
            source.regrowTimer++;
            if (source.regrowTimer > 40) { // 3x faster refill
                source.amount = Math.min(source.maxAmount, source.amount + 6);
                source.regrowTimer = 0;
            }
        }
    });
    
    // Occasionally spawn new sources if there are too few
    if (game.time % 1800 === 0) {
        if (game.foodSources.length < 3) {
            game.foodSources.push({
                x: Math.random() * (canvas.width - 100) + 50,
                y: Math.random() * (canvas.height - 100) + 50,
                amount: 30,
                maxAmount: 60,
                regrowTimer: 0,
                type: 'berries'
            });
            addLog('🍓 New berry bush has grown!', false);
        }
        
        if (game.waterSources.length < 2) {
            game.waterSources.push({
                x: Math.random() * (canvas.width - 100) + 50,
                y: Math.random() * (canvas.height - 100) + 50,
                amount: 50,
                maxAmount: 100,
                regrowTimer: 0,
                type: 'spring'
            });
            addLog('💧 New water spring has appeared!', false);
        }
    }
}

// Initialize gold deposits if the function doesn't exist elsewhere
function initializeGoldDeposits() {
    if (!canvas) return;
    if (!game.goldDeposits) game.goldDeposits = [];
    
    // Create initial gold deposits
    for (let i = 0; i < 4; i++) {
        game.goldDeposits.push({
            x: Math.random() * (canvas.width - 100) + 50,
            y: Math.random() * (canvas.height - 100) + 50,
            gold: 15 + Math.random() * 25,
            discovered: false
        });
    }
}

// Create individual gold deposit 
function createGoldDeposit() {
    if (!canvas || !game.goldDeposits) return null;
    
    const deposit = {
        x: Math.random() * (canvas.width - 100) + 50,
        y: Math.random() * (canvas.height - 100) + 50,
        gold: 15 + Math.random() * 25,
        discovered: false
    };
    
    game.goldDeposits.push(deposit);
    return deposit;
}

// Emergency reset function for debugging
function resetGame() {
    console.log('Resetting game...');
    
    // Reset game state
    game.gold = 0;
    game.dworfs = [];
    game.buildings = [];
    game.negativeBuildings = [];
    game.goldDeposits = [];
    game.foodSources = [];
    game.waterSources = [];
    game.time = 0;
    game.rocketParts = { ...ROCKET_PARTS_CONFIG };
    game.milestones = {
        firstAmenity: false,
        firstBuilding: false,
        hundredGold: false,
        thousandGold: false,
        tenThousandGold: false,
        tenDwarfs: false,
        rocketComplete: false
    };
    
    // Reinitialize everything
    if (canvas) {
        initDworfs();
        initFoodAndWaterSources();
        initializeGoldDeposits();
    }
    
    addLog('🔄 Game reset successfully!', true);
}

// Make functions available globally
window.gameLoop = gameLoop;
window.initDworfs = initDworfs;
window.resetGame = resetGame;
window.updateGame = updateGame;
window.checkMilestones = checkMilestones;
window.initFoodAndWaterSources = initFoodAndWaterSources;
window.updateFoodAndWaterSources = updateFoodAndWaterSources;
window.initializeGoldDeposits = initializeGoldDeposits;
window.createGoldDeposit = createGoldDeposit;
