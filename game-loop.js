// ... Other code above ...

function updateGame() {
    // ... existing update logic ...

    // Prevent gold corruption
    if (game.gold < 0) {
        console.error('Negative gold detected:', game.gold);
        addLog('⚠️ Gold went negative! Resetting to 0.', true, 'disaster');
        game.gold = 0;
    }
}

// ... Other code below ...