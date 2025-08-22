// Building system and negative buildings

function drawMachine(machine) {
    ctx.fillStyle = '#696969';
    ctx.fillRect(machine.x - 12, machine.y - 8, 24, 16);
    
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(machine.x - 3, machine.y - 20, 6, 12);
    
    const rotation = game.time * 0.1;
    ctx.save();
    ctx.translate(machine.x, machine.y - 14);
    ctx.rotate(rotation);
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(-2, -8, 4, 16);
    ctx.fillRect(-8, -2, 16, 4);
    ctx.restore();
    
    if (Math.random() < 0.5) {
        ctx.fillStyle = 'rgba(255, 215, 0, 0.6)';
        ctx.fillRect(machine.x + Math.random() * 6 - 3, machine.y - 30, 1, 1);
    }
}

function drawBuilding(building) {
    if (building.type === 'amenity') {
        drawAmenityBuilding(building);
    } else if (building.type === 'house') {
        drawHouseBuilding(building);
    } else {
        drawLabBuilding(building);
    }
}

function drawAmenityBuilding(building) {
    switch (building.amenityType) {
        case 'house':
            // Cozy house for rest
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(building.x - 15, building.y - 12, 30, 20);
            ctx.fillStyle = '#CD853F';
            ctx.beginPath();
            ctx.moveTo(building.x - 18, building.y - 12);
            ctx.lineTo(building.x, building.y - 25);
            ctx.lineTo(building.x + 18, building.y - 12);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#FFFF00';
            ctx.fillRect(building.x - 8, building.y - 8, 6, 6);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '8px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('🛏️', building.x, building.y - 15);
            ctx.textAlign = 'left';
            break;
            
        case 'inn':
            // Cheerful inn for joy
            ctx.fillStyle = '#FF6347';
            ctx.fillRect(building.x - 18, building.y - 15, 36, 25);
            ctx.fillStyle = '#32CD32';
            ctx.beginPath();
            ctx.moveTo(building.x - 20, building.y - 15);
            ctx.lineTo(building.x, building.y - 30);
            ctx.lineTo(building.x + 20, building.y - 15);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '8px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('🍺', building.x, building.y - 20);
            ctx.textAlign = 'left';
            break;
            
        case 'museum':
            // Elegant museum for art
            ctx.fillStyle = '#F5F5DC';
            ctx.fillRect(building.x - 20, building.y - 18, 40, 28);
            ctx.fillStyle = '#696969';
            for (let i = 0; i < 4; i++) {
                ctx.fillRect(building.x - 15 + i * 8, building.y - 18, 2, 28);
            }
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '8px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('🎨', building.x, building.y - 25);
            ctx.textAlign = 'left';
            break;
            
        case 'coffee_shop':
            // Cozy coffee shop
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(building.x - 16, building.y - 14, 32, 24);
            ctx.fillStyle = '#FFE4B5';
            ctx.fillRect(building.x - 8, building.y - 10, 6, 6);
            ctx.fillRect(building.x + 2, building.y - 10, 6, 6);
            // Steam effect
            if (Math.random() < 0.3) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                ctx.fillRect(building.x + Math.random() * 6 - 3, building.y - 25, 1, 5);
            }
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '8px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('☕', building.x, building.y - 20);
            ctx.textAlign = 'left';
            break;
            
        case 'library':
            // Scholarly library
            ctx.fillStyle = '#800080';
            ctx.fillRect(building.x - 18, building.y - 16, 36, 26);
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(building.x - 12, building.y - 12, 4, 12);
            ctx.fillRect(building.x - 4, building.y - 12, 4, 12);
            ctx.fillRect(building.x + 4, building.y - 12, 4, 12);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '8px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('📚', building.x, building.y - 22);
            ctx.textAlign = 'left';
            break;
            
        case 'gym':
            // Athletic gym
            ctx.fillStyle = '#2F4F4F';
            ctx.fillRect(building.x - 18, building.y - 16, 36, 26);
            ctx.fillStyle = '#C0C0C0';
            ctx.fillRect(building.x - 8, building.y - 8, 16, 4);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '8px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('💪', building.x, building.y - 22);
            ctx.textAlign = 'left';
            break;
            
        case 'community_center':
            // Social community center
            ctx.fillStyle = '#20B2AA';
            ctx.fillRect(building.x - 20, building.y - 18, 40, 28);
            ctx.fillStyle = '#FFFF00';
            ctx.beginPath();
            ctx.arc(building.x, building.y - 25, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '8px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('👥', building.x, building.y - 30);
            ctx.textAlign = 'left';
            break;
            
        case 'spa':
            // Relaxing spa
            ctx.fillStyle = '#E6E6FA';
            ctx.fillRect(building.x - 18, building.y - 16, 36, 26);
            ctx.fillStyle = '#87CEEB';
            ctx.beginPath();
            ctx.arc(building.x, building.y - 8, 8, 0, Math.PI * 2);
            ctx.fill();
            // Bubble effects
            for (let i = 0; i < 3; i++) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.beginPath();
                ctx.arc(building.x + (i - 1) * 6, building.y - 8, 2, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '8px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('🛁', building.x, building.y - 22);
            ctx.textAlign = 'left';
            break;
    }
}

function drawHouseBuilding(building) {
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(building.x - 15, building.y - 12, 30, 20);
    
    ctx.fillStyle = '#CD853F';
    ctx.beginPath();
    ctx.moveTo(building.x - 18, building.y - 12);
    ctx.lineTo(building.x, building.y - 25);
    ctx.lineTo(building.x + 18, building.y - 12);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(building.x - 8, building.y - 8, 6, 6);
    ctx.fillRect(building.x + 2, building.y - 8, 6, 6);
}

function drawLabBuilding(building) {
    ctx.fillStyle = '#4682B4';
    ctx.fillRect(building.x - 15, building.y - 15, 30, 25);
    
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(building.x - 1, building.y - 30, 2, 15);
    
    if (Math.floor(game.time * 0.1) % 2) {
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(building.x, building.y - 30, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawNegativeBuilding(building) {
    switch (building.type) {
        case 'gold_mutation_chamber':
            // Purple experimental lab
            ctx.fillStyle = '#8B008B';
            ctx.fillRect(building.x - 15, building.y - 15, 30, 25);
            
            // Sparkly effects
            for (let i = 0; i < 3; i++) {
                const sparkleX = building.x + (Math.random() - 0.5) * 30;
                const sparkleY = building.y + (Math.random() - 0.5) * 25;
                ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
                ctx.fillRect(sparkleX, sparkleY, 2, 2);
            }
            
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('🧪', building.x, building.y - 20);
            ctx.textAlign = 'left';
            break;
            
        case 'motion_alarm_tower':
            // Red alarm tower
            ctx.fillStyle = '#8B0000';
            ctx.fillRect(building.x - 8, building.y - 25, 16, 35);
            
            // Flashing effect during motion
            if (lastMotionDetected > 0 && (Date.now() - lastMotionDetected) < 2000) {
                ctx.fillStyle = '#FF0000';
                ctx.beginPath();
                ctx.arc(building.x, building.y - 30, 8, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('🚨', building.x, building.y - 35);
            ctx.textAlign = 'left';
            break;
            
        case 'party_pavilion':
            // Disco building
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(building.x - 20, building.y - 15, 40, 25);
            
            // Disco ball effect
            const discoPhase = Math.sin(game.time * 0.2) * 0.5 + 0.5;
            ctx.fillStyle = `rgba(255, 0, 255, ${discoPhase})`;
            ctx.beginPath();
            ctx.arc(building.x, building.y - 20, 6, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('🕺', building.x, building.y - 25);
            ctx.textAlign = 'left';
            break;
            
        case 'unsafe_mining_rig':
            // Rickety, smoking building
            ctx.fillStyle = '#654321';
            ctx.fillRect(building.x - 18, building.y - 12, 36, 20);
            
            // Smoke effect
            if (Math.random() < 0.3) {
                ctx.fillStyle = 'rgba(128, 128, 128, 0.6)';
                ctx.fillRect(building.x + Math.random() * 10 - 5, building.y - 30, 2, 8);
            }
            
            // Warning signs
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(building.x - 10, building.y - 8, 8, 6);
            
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('⚠️', building.x, building.y - 25);
            ctx.textAlign = 'left';
            break;
            
        case 'personal_gold_vault':
            // Heavily fortified selfish vault
            ctx.fillStyle = '#2F4F4F';
            ctx.fillRect(building.x - 18, building.y - 18, 36, 28);
            
            // Gold glow
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = 10;
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(building.x - 8, building.y - 8, 16, 8);
            ctx.shadowBlur = 0;
            
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '8px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('MINE', building.x, building.y - 25);
            ctx.fillText('💰', building.x, building.y - 15);
            ctx.textAlign = 'left';
            break;
    }
}

function updateNegativeBuildings() {
    game.negativeBuildings.forEach(building => {
        building.timer++;
        
        switch (building.type) {
            case 'gold_mutation_chamber':
                // Drains 2-5 gold every 3 seconds
                if (building.timer % 180 === 0) {
                    const goldLoss = 2 + Math.random() * 3;
                    game.gold = Math.max(0, game.gold - goldLoss);
                    if (Math.random() < 0.3) {
                        addLog('🧪 Gold Mutation Chamber consumed ' + Math.floor(goldLoss) + ' gold for "research"!', false, 'disaster');
                    }
                }
                break;
                
            case 'motion_alarm_tower':
                // Makes all dwarfs panic when motion detected
                if (lastMotionDetected > 0 && (Date.now() - lastMotionDetected) < 1000) {
                    game.dworfs.forEach(dwarf => {
                        if (dwarf.task !== 'panicking' && Math.random() < 0.7) {
                            dwarf.task = 'panicking';
                            dwarf.workTimer = 120;
                        }
                    });
                }
                break;
                
            case 'party_pavilion':
                // Forces all dwarfs to party every 2 minutes for 30 seconds
                if (building.timer % 7200 === 0) {
                    game.dworfs.forEach(dwarf => {
                        dwarf.task = 'forced_party';
                        dwarf.workTimer = 1800;
                    });
                    addLog('🕺 MANDATORY PARTY TIME! All dwarfs must dance!', true, 'disaster');
                }
                break;
                
            case 'unsafe_mining_rig':
                // 10% chance per minute to injure a random dwarf
                if (building.timer % 3600 === 0 && Math.random() < 0.1) {
                    const victim = game.dworfs[Math.floor(Math.random() * game.dworfs.length)];
                    victim.efficiency *= 0.5;
                    victim.task = 'recovering';
                    victim.workTimer = 3600;
                    addLog('🤕 ' + victim.name + ' was injured by the unsafe mining rig!', true, 'disaster');
                }
                break;
                
            case 'personal_gold_vault':
                // Steals 20% of all gold earned (handled in returning task)
                break;
        }
    });
}