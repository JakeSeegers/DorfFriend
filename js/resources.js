// Resource management system (food, water, gold deposits)

function initFoodAndWaterSources() {
    // Create initial food sources (berry bushes)
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
    
    // Create initial water sources (springs)
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

function updateFoodAndWaterSources() {
    // Regrow food sources over time
    game.foodSources.forEach(source => {
        if (source.amount < source.maxAmount) {
            source.regrowTimer++;
            if (source.regrowTimer > 90) {
                source.amount = Math.min(source.maxAmount, source.amount + 3);
                source.regrowTimer = 0;
            }
        }
    });
    
    // Refill water sources over time
    game.waterSources.forEach(source => {
        if (source.amount < source.maxAmount) {
            source.regrowTimer++;
            if (source.regrowTimer > 60) {
                source.amount = Math.min(source.maxAmount, source.amount + 4);
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
                amount: 25,
                maxAmount: 50,
                regrowTimer: 0,
                type: 'berries'
            });
            addLog('🍓 New berry bush has grown!', false);
        }
        
        if (game.waterSources.length < 2) {
            game.waterSources.push({
                x: Math.random() * (canvas.width - 100) + 50,
                y: Math.random() * (canvas.height - 100) + 50,
                amount: 40,
                maxAmount: 80,
                regrowTimer: 0,
                type: 'spring'
            });
            addLog('💧 New water spring has appeared!', false);
        }
    }
}

function drawFoodSource(source) {
    // Draw berry bush
    ctx.fillStyle = source.amount > 15 ? '#228B22' : '#8B4513';
    ctx.beginPath();
    ctx.arc(source.x, source.y, 12, 0, Math.PI * 2);
    ctx.fill();
    
    if (source.amount > 8) {
        // Draw berries
        for (let i = 0; i < Math.min(8, Math.floor(source.amount / 4)); i++) {
            const angle = (i / 8) * Math.PI * 2;
            const berryX = source.x + Math.cos(angle) * 8;
            const berryY = source.y + Math.sin(angle) * 8;
            
            ctx.fillStyle = '#DC143C';
            ctx.beginPath();
            ctx.arc(berryX, berryY, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Amount indicator
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🍓' + Math.floor(source.amount), source.x, source.y - 18);
    ctx.textAlign = 'left';
}

function drawWaterSource(source) {
    // Draw spring/water
    ctx.fillStyle = source.amount > 30 ? '#1E90FF' : '#4682B4';
    ctx.beginPath();
    ctx.arc(source.x, source.y, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // Add sparkle effect for water
    for (let i = 0; i < 4; i++) {
        const angle = game.time * 0.05 + i * (Math.PI / 2);
        const sparkleX = source.x + Math.cos(angle) * 12;
        const sparkleY = source.y + Math.sin(angle) * 12;
        
        ctx.fillStyle = 'rgba(173, 216, 230, 0.8)';
        ctx.fillRect(sparkleX, sparkleY, 2, 2);
    }
    
    // Amount indicator
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('💧' + Math.floor(source.amount), source.x, source.y - 20);
    ctx.textAlign = 'left';
}

function drawGoldDeposit(deposit) {
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 10;
    
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(deposit.x, deposit.y, 8 + Math.sin(game.time * 0.1) * 2, 0, Math.PI * 2);
    ctx.fill();
    
    for (let i = 0; i < 3; i++) {
        const angle = game.time * 0.05 + i * (Math.PI * 2 / 3);
        const sparkleX = deposit.x + Math.cos(angle) * 15;
        const sparkleY = deposit.y + Math.sin(angle) * 15;
        
        ctx.fillStyle = 'rgba(255, 215, 0, 0.7)';
        ctx.fillRect(sparkleX, sparkleY, 2, 2);
    }
    
    ctx.shadowBlur = 0;
    
    ctx.fillStyle = '#FFD700';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(Math.floor(deposit.gold), deposit.x, deposit.y - 15);
    ctx.textAlign = 'left';
}