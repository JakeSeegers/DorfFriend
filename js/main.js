// Main initialization and event handlers

function initializeGame() {
    initializeCanvas();
    resizeCanvas();
    
    // Initialize game components
    setTimeout(() => {
        initDworfs();
        initFoodAndWaterSources();
        
        // Add initial log messages
        addInitialLogs();
        
        // Show personality info for starting dwarfs
        setTimeout(() => {
            showStartingDwarfPersonalities();
        }, 2000);
    }, 100);
    
    // Auto-enable motion detection after a short delay
    setTimeout(() => {
        enableAccelerometer();
    }, 1500);
    
    // Start the game loop
    gameLoop();
}

function addInitialLogs() {
    addLog('🌟 Fragile Dworf colony started!');
    addLog('🎯 Goal: Build a rocket to reach outer space!');
    addLog('⚠️ Warning: This colony is sensitive to movement...');
    addLog('🔧 MAJOR REBALANCE: Need consumption rates reduced by 75%!', true);
    addLog('🍗 MUCH MORE FILLING: Food/water now restores 3x more!', true);
    addLog('🏠 FASTER HEALING: Amenities now restore 2-3x more per use!', true);
    addLog('⚡ PRIORITY SYSTEM: Dwarfs now make smart decisions about tasks!', true);
    addLog('📋 Task Priority: 1.Survival → 2.Rocket → 3.Infrastructure → 4.Amenities → 5.Mining', false);
    addLog('💧 More initial resources and faster regeneration!', false);
    addLog('🍓💧 Dwarfs can gather food from berry bushes and water from springs!', false);
    addLog('🏠 NEW: Dwarfs need rest, joy, coffee, cleanliness and more to function!', true);
    addLog('⚖️ BALANCED: Survival needs (food/water) prioritized over luxury needs!', true);
    addLog('🗏️ Build amenities when colony averages get low: Houses, Inns, Coffee Shops, Spas, etc.', false);
    addLog('🎭 Watch for personality problems: 😴=Lazy 😰=Panic ❓=Confused 🤕=Injured 🏃=Fleeing 💀=Breakdown 🚫=Refusing 🕺=Forced Party 🏠=Seeking Amenities', false);
    addLog('⚠️ Poor personalities can destroy buildings, steal gold, contaminate resources!', false);
    addLog('🔧 FIXED: No more exponential gold bug!', true);
    addLog('😈 NEW: Dwarfs with extreme personalities may build harmful buildings!', true);
    addLog('✅ IMPROVED: Reduced negative effects from missing amenities!', true);
    addLog('🗏️ Dwarfs are now more proactive about building needed facilities!', true);
    addLog('🧭 FIXED: Dwarfs no longer get stuck when hungry/thirsty!', true);
    addLog('🎯 They now make smart decisions about which need to address first!', false);
    addLog('⚖️ BALANCED: Reduced hunger/thirst drain rates by 75%!', true);
    addLog('🌱 Food/water sources now regenerate 3x faster!', false);
    addLog('🍽️ Dwarfs get 3x more sustenance per use - much less seeking!', false);
    addLog('🗏️ PROACTIVE: Dwarfs now build amenities when needs drop below 40!', true);
    addLog('💰 PRIORITY: Houses → Coffee Shops → Other Amenities → Basic Buildings!', false);
    addLog('❌ REMOVED: Stupid gold-generating machines - no more clutter!', true);
}

function showStartingDwarfPersonalities() {
    game.dworfs.forEach((dwarf, i) => {
        const traits = [];
        if (dwarf.personality.openness > 70) traits.push('creative');
        if (dwarf.personality.conscientiousness > 70) traits.push('hardworking');
        if (dwarf.personality.extraversion > 70) traits.push('social');
        if (dwarf.personality.agreeableness > 70) traits.push('generous');
        if (dwarf.personality.neuroticism > 70) traits.push('anxious');
        
        if (traits.length > 0) {
            addLog(`👤 ${dwarf.name} is ${traits.join(' and ')}`, false);
        }
    });
    addLog('💡 Hat colors show personality: Purple=Creative, Teal=Organized, Gold=Social, Green=Kind, Orange=Anxious', false);
    addLog('🍞💧 Watch red/blue bars above dwarfs for hunger/thirst!', false);
}

// Event listeners
window.addEventListener('load', function() {
    initializeGame();
});

// Handle orientation changes
window.addEventListener('orientationchange', function() {
    setTimeout(resizeCanvas, 100);
});

window.addEventListener('resize', function() {
    setTimeout(resizeCanvas, 100);
});