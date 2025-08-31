// Main game loop and update logic - COMPLETE VERSION WITH BUILDING FIXES

function initDworfs() {
    // Create initial dwarfs using the Dwarf class
    for (let i = 0; i < 3; i++) {
        game.dworfs.push(new Dworf(
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
    
    // FIXED: More building-friendly new dwarf arrivals
    // Reduced frequency but better conditions for growth
    const adultDwarfs = game.dworfs.filter(d => d.isAdult).length;
    const totalBuildings = game.buildings.length;
    
    // Only spawn new dwarfs if there are enough buildings and occasionally
    if (totalBuildings >= adultDwarfs && 
        game.time % 2400 === 0 && 
        Math.random() < 0.12) {
        
        const newX = Math.max(50, Math.min(canvas.width - 50, canvas.width / 2 + Math.random() * 100 - 50));
        const newY = Math.max(50, Math.min(canvas.height - 50, canvas.height / 2));
        
        // Create new dwarf
        game.dworfs.push(new Dwarf(newX, newY));
        addLog('👤 New dwarf joined the colony seeking work!', false);
    }
    
    // ENHANCED: Building milestone checks
    checkBuildingMilestones();
    
    // Check for game milestones
    checkMilestones();
    
    // Calculate gold per second for display
    if (game.time % 60 === 0) {
        const currentGold = game.gold;
        game.goldPerSecond = Math.max(0, (currentGold - (game.lastGoldCheck || 0)) / 1);
        game.lastGoldCheck = currentGold;
    }
    
    // Spawn new gold deposits occasionally - more frequent when buildings exist
    const depositSpawnRate = totalBuildings > 5 ? 0.4 : 0.3;
    if (game.time % 900 === 0 && Math.random() < depositSpawnRate) {
        if (typeof createGoldDeposit === 'function') {
            createGoldDeposit();
        }
    }
    
    // ENHANCED: Check colony happiness and building effectiveness
    if (game.time % 600 === 0) {
        checkColonyWellbeing();
    }
}

// NEW: Enhanced building milestone system
function checkBuildingMilestones() {
    const regularBuildings = game.buildings.filter(b => b.type !== 'amenity').length;
    const amenityBuildings = game.buildings.filter(b => b.type === 'amenity').length;
    const adultDwarfs = game.dwarfs.filter(d => d.isAdult).length;
    
    // Building efficiency milestones
    if (amenityBuildings >= 3 && !game.milestones.threeAmenities) {
        game.milestones.threeAmenities = true;
        addLog('🏘️ Colony has 3+ amenity buildings! Dwarfs are happier!', true, 'success');
    }
    
    if (amenityBuildings >= adultDwarfs && !game.milestones.amenityPerDwarf) {
        game.milestones.amenityPerDwarf = true;
        addLog('🏡 Every adult dwarf has an amenity building! Maximum comfort!', true, 'success');
    }
    
    // Construction speed bonuses
    if (game.buildings.length >= 5 && !game.milestones.fiveBuildings) {
        game.milestones.fiveBuildings = true;
        addLog('🏗️ 5 buildings complete! Construction efficiency improved!', true, 'success');
        
        // Boost construction speed for all dwarfs
        game.dworfs.forEach(dwarf => {
            if (dwarf.personality.conscientiousness > 50) {
                dwarf.efficiency *= 1.1;
            }
        });
    }
}

// NEW: Check overall colony wellbeing and building effectiveness
function checkColonyWellbeing() {
    if (game.dworfs.length === 0) return;
    
    // Calculate average needs satisfaction
    let totalSatisfaction = 0;
    let criticalNeedsCount = 0;
    
    game.dworfs.forEach(dwarf => {
        const needs = [dwarf.hunger, dwarf.thirst, dwarf.rest, dwarf.joy, dwarf.coffee, dwarf.cleanliness];
        const avgNeed = needs.reduce((sum, need) => sum + need, 0) / needs.length;
        totalSatisfaction += avgNeed;
        
        // Count critical needs
        if (dwarf.hunger < 20 || dwarf.thirst < 15) criticalNeedsCount++;
    });
    
    const colonySatisfaction = totalSatisfaction / game.dworfs.length;
    const amenityBuildings = game.buildings.filter(b => b.type === 'amenity').length;
    
    // Positive feedback for well-managed colonies
    if (colonySatisfaction > 70 && amenityBuildings >= 3) {
        if (Math.random() < 0.3) {
            addLog('😊 Colony morale is high! Dwarfs work more efficiently!', false, 'success');
            
            // Temporary efficiency boost
            game.dworfs.forEach(dwarf => {
                if (dwarf.isAdult) {
                    dwarf.efficiency *= 1.05;
                }
            });
        }
    }
    
    // Warnings for poorly managed colonies
    if (criticalNeedsCount > game.dworfs.length / 2) {
        addLog('⚠️ Many dwarfs have critical needs! Build more amenities!', false, 'disaster');
    } else if (colonySatisfaction < 40) {
        addLog('😟 Colony satisfaction is low. Consider building amenities.', false, 'disaster');
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
        addLog('🛏️ First amenity building completed! Comfort improved!', true);
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

// Enhanced food and water initialization
function initFoodAndWaterSources() {
    if (!canvas) return;
    
    // Ensure arrays exist
    if (!game.foodSources) game.foodSources = [];
    if (!game.waterSources) game.waterSources = [];
    
    // Create MORE initial food sources for better building support
    if (game.foodSources.length === 0) {
        for (let i = 0; i < 6; i++) { // INCREASED from 5 to 6
            game.foodSources.push({
                x: Math.random() * (canvas.width - 100) + 50,
                y: Math.random() * (canvas.height - 100) + 50,
                amount: 80 + Math.random() * 80, // INCREASED amounts
                maxAmount: 150, // INCREASED max amounts
                regrowTimer: 0,
                type: 'berries'
            });
        }
    }
    
    // Create MORE initial water sources
    if (game.waterSources.length === 0) {
        for (let i = 0; i < 5; i++) { // INCREASED from 4 to 5
            game.waterSources.push({
                x: Math.random() * (canvas.width - 100) + 50,
                y: Math.random() * (canvas.height - 100) + 50,
                amount: 120 + Math.random() * 100, // INCREASED amounts
                maxAmount: 250, // INCREASED max amounts
                regrowTimer: 0,
                type: 'spring'
            });
        }
    }
}

// Enhanced resource update with better regeneration
function updateFoodAndWaterSources() {
    if (!game.foodSources) game.foodSources = [];
    if (!game.waterSources) game.waterSources = [];
    
    // FASTER regrowth for food sources
    game.foodSources.forEach(source => {
        if (source.amount < source.maxAmount) {
            source.regrowTimer++;
            if (source.regrowTimer > 45) { // FASTER regrowth
                source.amount = Math.min(source.maxAmount, source.amount + 6); // MORE regeneration
                source.regrowTimer = 0;
            }
        }
    });
    
    // FASTER refill for water sources  
    game.waterSources.forEach(source => {
        if (source.amount < source.maxAmount) {
            source.regrowTimer++;
            if (source.regrowTimer > 30) { // FASTER refill
                source.amount = Math.min(source.maxAmount, source.amount + 8); // MORE regeneration
                source.regrowTimer = 0;
            }
        }
    });
    
    // More frequently spawn new sources if there are too few
    if (game.time % 1200 === 0) { // More frequent checks
        if (game.foodSources.length < 4) {
            game.foodSources.push({
                x: Math.random() * (canvas.width - 100) + 50,
                y: Math.random() * (canvas.height - 100) + 50,
                amount: 40,
                maxAmount: 80,
                regrowTimer: 0,
                type: 'berries'
            });
            addLog('🍓 New berry bush has grown!', false);
        }
        
        if (game.waterSources.length < 3) {
            game.waterSources.push({
                x: Math.random() * (canvas.width - 100) + 50,
                y: Math.random() * (canvas.height - 100) + 50,
                amount: 60,
                maxAmount: 120,
                regrowTimer: 0,
                type: 'spring'
            });
            addLog('💧 New water spring has appeared!', false);
        }
    }
}

// Initialize gold deposits with better distribution
function initializeGoldDeposits() {
    if (!canvas) return;
    if (!game.goldDeposits) game.goldDeposits = [];
    
    // Create MORE initial gold deposits to support building
    for (let i = 0; i < 5; i++) { // INCREASED from 4 to 5
        game.goldDeposits.push({
            x: Math.random() * (canvas.width - 100) + 50,
            y: Math.random() * (canvas.height - 100) + 50,
            gold: 20 + Math.random() * 30, // INCREASED amounts
            discovered: false
        });
    }
}

// Create individual gold deposit with better amounts
function createGoldDeposit() {
    if (!canvas || !game.goldDeposits) return null;
    
    const deposit = {
        x: Math.random() * (canvas.width - 100) + 50,
        y: Math.random() * (canvas.height - 100) + 50,
        gold: 18 + Math.random() * 32, // INCREASED gold amounts
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
        rocketComplete: false,
        // New building milestones
        threeAmenities: false,
        amenityPerDwarf: false,
        fiveBuildings: false
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
