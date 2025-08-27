// Main game loop and update logic - FIXED VERSION

function initDworfs() {
    // FIXED: Use Dwarf instead of Dworf
    for (let i = 0; i < 3; i++) {
        game.dworfs.push(new Dwarf(
            canvas.width / 2 + (i - 1) * 40,
            canvas.height / 2
        ));
    }
}

function updateGame() {
    // Validate gold integrity periodically
    if (game.time % 300 === 0) {
        validateGoldIntegrity();
    }
    
    // Update resources
    updateFoodAndWaterSources();
    updateGoldDeposits(); // ADD THIS LINE
    
    // Update negative buildings
    updateNegativeBuildings();
    
    // Reduced new dwarf arrivals (5x less frequent)
    if (game.buildings.length > game.dworfs.length && game.time % 1500 === 0 && Math.random() < 0.2) {
        const newX = Math.max(50, Math.min(canvas.width - 50, canvas.width / 2 + Math.random() * 100 - 50));
        const newY = Math.max(50, Math.min(canvas.height - 50, canvas.height / 2));
        // FIXED: Use Dwarf instead of Dworf
        game.dworfs.push(new Dwarf(newX, newY));
        addLog('👤 New Dwarf joined the colony!'); // FIXED: Dwarf not Dworf
    }
    
    // Check milestones
    checkMilestones();
    
    // Calculate gold per second (for display only)
    if (game.time % 60 === 0) {
        const currentGold = game.gold;
        game.goldPerSecond = Math.max(0, (currentGold - (game.lastGoldCheck || 0)) / 1); // Per second
        game.lastGoldCheck = currentGold;
    }
}

function checkMilestones() {
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
        }, 3000);
    }
}

function gameLoop() {
    // Update all dwarfs (FIXED: consistent naming)
    game.dworfs.forEach(function(dwarf) {
        dwarf.update();
    });
    
    // Render everything
    renderGame();
    
    // Update game state and UI
    updateGame();
    updateUI();
    updateStability();
    
    game.time++;
    
    requestAnimationFrame(gameLoop);
}

// Emergency reset function (for debugging)
function resetGame() {
    game.gold = 0;
    game.dworfs = [];
    game.buildings = [];
    game.negativeBuildings = [];
    game.goldDeposits = [];
    game.foodSources = [];
    game.waterSources = [];
    game.time = 0;
    game.rocketParts = { ...ROCKET_PARTS_CONFIG };
    
    // Reinitialize
    initDworfs();
    initFoodAndWaterSources();
    initializeGoldDeposits();
    
    addLog('🔄 Game reset successfully!', true);
}

// Make reset function available globally for debugging
window.resetGame = resetGame;
