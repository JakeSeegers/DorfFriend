// Add to js/rendering.js - replace the drawColonyCenter function

function drawColonyCenter() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Draw colony center area
    ctx.fillStyle = 'rgba(255, 215, 0, 0.1)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 50, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw fitness indicators if available
    if (game.populationFitness) {
        const adults = game.dworfs.filter(d => d.isAdult);
        const males = adults.filter(d => d.gender === 'male');
        
        if (males.length > 0) {
            // Fitness visualization parameters
            const barWidth = 60;
            const barHeight = 12;
            const spacing = 18;
            const startY = centerY - 40;
            
            const maxFitness = Math.max(
                game.populationFitness.orange,
                game.populationFitness.blue,
                game.populationFitness.yellow
            );
            
            if (maxFitness > 0) {
                // Orange fitness bar
                const orangeWidth = (game.populationFitness.orange / maxFitness) * barWidth;
                const orangeIntensity = Math.min(1, game.populationFitness.orange / 2);
                
                ctx.fillStyle = `rgba(255, 102, 0, ${0.3 + orangeIntensity * 0.5})`;
                ctx.fillRect(centerX - 30, startY, orangeWidth, barHeight);
                ctx.strokeStyle = '#FF6600';
                ctx.lineWidth = 2;
                ctx.strokeRect(centerX - 30, startY, barWidth, barHeight);
                
                // Orange strategy count and fitness
                const orangeCount = males.filter(m => m.reproductionStrategy === 'orange').length;
                ctx.fillStyle = '#FF6600';
                ctx.font = 'bold 11px Arial';
                ctx.textAlign = 'left';
                ctx.fillText(`🟠${orangeCount} (${game.populationFitness.orange.toFixed(2)})`, centerX - 28, startY - 3);
                
                // Blue fitness bar
                const blueWidth = (game.populationFitness.blue / maxFitness) * barWidth;
                const blueIntensity = Math.min(1, game.populationFitness.blue / 2);
                
                ctx.fillStyle = `rgba(0, 102, 255, ${0.3 + blueIntensity * 0.5})`;
                ctx.fillRect(centerX - 30, startY + spacing, blueWidth, barHeight);
                ctx.strokeStyle = '#0066FF';
                ctx.strokeRect(centerX - 30, startY + spacing, barWidth, barHeight);
                
                const blueCount = males.filter(m => m.reproductionStrategy === 'blue').length;
                ctx.fillStyle = '#0066FF';
                ctx.fillText(`🔵${blueCount} (${game.populationFitness.blue.toFixed(2)})`, centerX - 28, startY + spacing - 3);
                
                // Yellow fitness bar
                const yellowWidth = (game.populationFitness.yellow / maxFitness) * barWidth;
                const yellowIntensity = Math.min(1, game.populationFitness.yellow / 2);
                
                ctx.fillStyle = `rgba(255, 255, 0, ${0.3 + yellowIntensity * 0.5})`;
                ctx.fillRect(centerX - 30, startY + spacing * 2, yellowWidth, barHeight);
                ctx.strokeStyle = '#FFFF00';
                ctx.strokeRect(centerX - 30, startY + spacing * 2, barWidth, barHeight);
                
                const yellowCount = males.filter(m => m.reproductionStrategy === 'yellow').length;
                ctx.fillStyle = '#FFFF00';
                ctx.fillText(`🟡${yellowCount} (${game.populationFitness.yellow.toFixed(2)})`, centerX - 28, startY + spacing * 2 - 3);
                
                // Dominant strategy indicator
                const dominantFitness = Math.max(
                    game.populationFitness.orange,
                    game.populationFitness.blue,
                    game.populationFitness.yellow
                );
                
                let dominantStrategy = '';
                let dominantColor = '#FFFFFF';
                
                if (dominantFitness > 1.2) {
                    if (game.populationFitness.orange === dominantFitness) {
                        dominantStrategy = 'ORANGE DOMINANT';
                        dominantColor = '#FF6600';
                    } else if (game.populationFitness.blue === dominantFitness) {
                        dominantStrategy = 'BLUE DOMINANT';
                        dominantColor = '#0066FF';
                    } else {
                        dominantStrategy = 'YELLOW DOMINANT';
                        dominantColor = '#FFFF00';
                    }
                } else {
                    dominantStrategy = 'BALANCED';
                    dominantColor = '#4ECDC4';
                }
                
                // Draw dominance indicator
                ctx.fillStyle = dominantColor;
                ctx.font = 'bold 10px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(dominantStrategy, centerX, startY + spacing * 3 + 8);
                
                // Draw population pressure indicator
                const totalAdults = adults.length;
                const carryingCapacity = 15;
                const pressureLevel = totalAdults / carryingCapacity;
                
                let pressureText = '';
                let pressureColor = '#4CAF50';
                
                if (pressureLevel > 0.9) {
                    pressureText = 'OVERCROWDED';
                    pressureColor = '#FF4444';
                } else if (pressureLevel > 0.7) {
                    pressureText = 'HIGH DENSITY';
                    pressureColor = '#FF9800';
                } else if (totalAdults < 3) {
                    pressureText = 'RECOVERY MODE';
                    pressureColor = '#4ECDC4';
                } else {
                    pressureText = `${totalAdults}/${carryingCapacity}`;
                    pressureColor = '#4CAF50';
                }
                
                ctx.fillStyle = pressureColor;
                ctx.font = '9px Arial';
                ctx.fillText(pressureText, centerX, startY + spacing * 3 + 20);
                
                // Reset text alignment
                ctx.textAlign = 'left';
            }
        }
    }
}

// Enhanced territory visualization in dwarf drawing
// Add this to the Dworf.drawTerritorialIndicators() method:

drawTerritorialIndicators() {
    // Draw territory boundaries for orange males (enhanced)
    if (this.gender === 'male' && 
        this.reproductionStrategy === 'orange' && 
        this.territory) {
        
        // Get current fitness to determine territory visibility
        const fitness = game.populationFitness ? game.populationFitness.orange : 1;
        const alpha = Math.min(0.6, 0.2 + fitness * 0.3);
        
        // Pulsing effect based on fitness level
        const pulseIntensity = Math.sin(game.time * 0.05) * 0.3 + 0.7;
        const territoryAlpha = alpha * pulseIntensity;
        
        ctx.strokeStyle = `rgba(255, 102, 0, ${territoryAlpha})`;
        ctx.lineWidth = fitness > 1.3 ? 3 : 2; // Thicker line for high fitness
        ctx.setLineDash([8, 4]);
        ctx.beginPath();
        ctx.arc(this.territory.x, this.territory.y, this.territory.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
    }
    
    // Draw mate guarding indicator for blue males (enhanced)
    if (this.gender === 'male' && 
        this.reproductionStrategy === 'blue' && 
        this.guardedMate) {
        
        const fitness = game.populationFitness ? game.populationFitness.blue : 1;
        const alpha = Math.min(0.8, 0.3 + fitness * 0.4);
        
        ctx.strokeStyle = `rgba(0, 102, 255, ${alpha})`;
        ctx.lineWidth = fitness > 1.2 ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.guardedMate.x, this.guardedMate.y);
        ctx.stroke();
        
        // Draw guard radius
        if (fitness > 1.1) {
            ctx.strokeStyle = `rgba(0, 102, 255, ${alpha * 0.3})`;
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 8]);
            ctx.beginPath();
            ctx.arc(this.guardedMate.x, this.guardedMate.y, 60, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }
    
    // Draw sneaking indicator for yellow males
    if (this.gender === 'male' && 
        this.reproductionStrategy === 'yellow' && 
        this.task === 'reproducing') {
        
        const fitness = game.populationFitness ? game.populationFitness.yellow : 1;
        
        // Stealth shimmer effect
        const shimmer = Math.sin(game.time * 0.2) * 0.4 + 0.6;
        ctx.shadowColor = `rgba(255, 255, 0, ${shimmer * fitness})`;
        ctx.shadowBlur = 8 + fitness * 4;
        
        // Draw small stealth indicator
        ctx.fillStyle = `rgba(255, 255, 0, ${0.4 + fitness * 0.3})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y - 25, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
    }
}

// Mating success visual feedback
// Add this method to the Dworf class:

drawMatingAttempt(success, partnerName) {
    // Create visual feedback for mating attempts
    const indicator = {
        x: this.x,
        y: this.y - 30,
        timer: 120,
        success: success,
        partner: partnerName,
        strategy: this.reproductionStrategy
    };
    
    // Add to a global array for rendering
    if (!game.matingIndicators) game.matingIndicators = [];
    game.matingIndicators.push(indicator);
}

// Add this to the main renderGame function in js/rendering.js:
function renderMatingIndicators() {
    if (!game.matingIndicators) return;
    
    game.matingIndicators.forEach((indicator, index) => {
        indicator.timer--;
        
        const alpha = indicator.timer / 120;
        const y = indicator.y - (120 - indicator.timer) * 0.5;
        
        if (indicator.success) {
            ctx.fillStyle = `rgba(255, 105, 180, ${alpha})`;
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('💕', indicator.x, y);
        } else {
            ctx.fillStyle = `rgba(255, 68, 68, ${alpha})`;
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('💔', indicator.x, y);
        }
        
        if (indicator.timer <= 0) {
            game.matingIndicators.splice(index, 1);
        }
    });
    
    ctx.textAlign = 'left';
}

// Call renderMatingIndicators() at the end of renderGame()
function renderGame() {
    drawBackground();
    drawStars();
    drawColonyCenter(); // Now shows fitness bars!
    
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
    
    // Draw fitness-related overlays
    renderMatingIndicators();
    
    drawRocketConstruction();
}
