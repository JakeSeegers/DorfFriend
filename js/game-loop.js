// Main game loop and update logic

function initDworfs() {
    for (let i = 0; i < 3; i++) {
        game.dworfs.push(new Dworf(
            canvas.width / 2 + (i - 1) * 40,
            canvas.height / 2
        ));
    }
}

function updateGame() {
    // Simplified gold generation - no more machines
    game.goldPerSecond = 1 + (game.buildings.length * 0.8);
    
    if (game.time % 60 === 0) {
        game.gold += game.goldPerSecond;
    }
    
    // Update food and water sources
    updateFoodAndWaterSources();
    
    // Update negative buildings
    updateNegativeBuildings();
    
    // Add new dwarfs when colony grows
    if (game.buildings.length > game.dworfs.length && game.time % 900 === 0) {
        const newX = Math.max(50, Math.min(canvas.width - 50, canvas.width / 2 + Math.random() * 100 - 50));
        const newY = Math.max(50, Math.min(canvas.height - 50, canvas.height / 2));
        game.dworfs.push(new Dworf(newX, newY));
        addLog('👤 New Dworf joined the colony!');
    }
    
    // Check milestones
    checkMilestones();
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
}

function gameLoop() {
    // Update all dwarfs
    game.dworfs.forEach(function(dworf) {
        dworf.update();
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