// Main rendering system

function drawBackground() {
    ctx.fillStyle = '#0f0f23';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (motionFlash > 0) {
        ctx.fillStyle = 'rgba(255, 0, 0, ' + (motionFlash / 40) + ')';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    if (isTracking && (Date.now() - lastMotionDetected) < 1000) {
        ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
        ctx.fillRect(0, 0, canvas.width, 5);
        ctx.fillRect(0, canvas.height - 5, canvas.width, 5);
    }
    
    if (isTracking) {
        const pulseAlpha = Math.sin(game.time * 0.1) * 0.3 + 0.3;
        ctx.fillStyle = 'rgba(0, 255, 0, ' + pulseAlpha + ')';
        ctx.fillRect(canvas.width - 20, 10, 10, 10);
    }
}

function drawStars() {
    for (let i = 0; i < 30; i++) {
        const x = (game.time * 0.01 + i * 123) % canvas.width;
        const y = (game.time * 0.005 + i * 456) % canvas.height;
        const brightness = Math.sin(game.time * 0.01 + i) * 0.5 + 0.5;
        ctx.fillStyle = 'rgba(255, 255, 255, ' + (brightness * 0.8) + ')';
        ctx.fillRect(x, y, 1, 1);
    }
}

function drawColonyCenter() {
    ctx.fillStyle = 'rgba(255, 215, 0, 0.1)';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 50, 0, Math.PI * 2);
    ctx.fill();
}

function drawRocketConstruction() {
    let anyBuilding = false;
    for (let part in game.rocketParts) {
        if (game.rocketParts[part].building || game.rocketParts[part].built) {
            anyBuilding = true;
            break;
        }
    }
    
    if (anyBuilding) {
        const rocketX = canvas.width / 2 - 30;
        const rocketY = 70;
        ctx.strokeStyle = '#FF6B6B';
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(rocketX, rocketY, 60, 60);
        ctx.setLineDash([]);
        
        ctx.fillStyle = '#FF6B6B';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🚀 ROCKET', canvas.width / 2, 60);
        ctx.textAlign = 'left';
    }
}

function renderGame() {
    drawBackground();
    drawStars();
    drawColonyCenter();
    
    // Draw all game objects
    game.goldDeposits.forEach(drawGoldDeposit);
    game.foodSources.forEach(drawFoodSource);
    game.waterSources.forEach(drawWaterSource);
    game.buildings.forEach(drawBuilding);
    game.negativeBuildings.forEach(drawNegativeBuilding);
    
    // Draw dwarfs
    game.dworfs.forEach(function(dworf) {
        dworf.draw();
    });
    
    drawRocketConstruction();
}