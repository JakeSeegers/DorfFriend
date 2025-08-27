// Main initialization - FIXED VERSION

function initializeGame() {
    initializeCanvas();
    resizeCanvas();
    
    // Initialize game components with error handling
    setTimeout(() => {
        try {
            initDworfs();
            initFoodAndWaterSources();
            
            // Initialize gold deposits if the function exists
            if (typeof initializeGoldDeposits === 'function') {
                initializeGoldDeposits();
            }
            
            addInitialLogs();
            
            setTimeout(() => {
                showStartingDwarfPersonalities();
            }, 2000);
            
        } catch (error) {
            console.error('Error initializing game:', error);
            addLog('⚠️ Game initialization had some issues, but continuing...', true, 'disaster');
        }
    }, 100);
    
    // Auto-enable motion detection
    setTimeout(() => {
        if (typeof enableAccelerometer === 'function') {
            enableAccelerometer();
        }
    }, 1500);
    
    // Start the game loop
    gameLoop();
}

function addInitialLogs() {
    addLog('🌟 Fragile Dwarf Colony started!');
    addLog('🎯 Goal: Build a rocket to reach outer space!');
    addLog('⚠️ Warning: This colony is sensitive to movement...');
    addLog('🔧 FIXED: Critical errors resolved!', true);
    addLog('⚡ Dwarfs will mine gold and work toward their rocket!', true);
    addLog('🍞💧 Watch the red/blue bars for hunger/thirst levels!', false);
}

function showStartingDwarfPersonalities() {
    if (!game.dworfs) return;
    
    game.dworfs.forEach((dwarf, i) => {
        if (dwarf.personality) {
            const traits = [];
            if (dwarf.personality.openness > 70) traits.push('creative');
            if (dwarf.personality.conscientiousness > 70) traits.push('hardworking');
            if (dwarf.personality.extraversion > 70) traits.push('social');
            if (dwarf.personality.agreeableness > 70) traits.push('generous');
            if (dwarf.personality.neuroticism > 70) traits.push('anxious');
            
            if (traits.length > 0) {
                addLog(`👤 ${dwarf.name} is ${traits.join(' and ')} (${dwarf.gender})`, false);
            }
        }
    });
}

// Event listeners
window.addEventListener('load', function() {
    initializeGame();
});

window.addEventListener('orientationchange', function() {
    setTimeout(resizeCanvas, 100);
});

window.addEventListener('resize', function() {
    setTimeout(resizeCanvas, 100);
});
