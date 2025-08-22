// UI management and logging system

function addLog(message, important, type) {
    const logDiv = document.getElementById('log');
    const entry = document.createElement('div');
    
    if (important) {
        entry.className = 'log-entry important';
    } else if (type === 'disaster') {
        entry.className = 'log-entry disaster';
    } else {
        entry.className = 'log-entry';
    }
    
    entry.textContent = '[' + Math.floor(game.time / 60) + 's] ' + message;
    logDiv.appendChild(entry);
    logDiv.scrollTop = logDiv.scrollHeight;
    
    while (logDiv.children.length > 22) {
        logDiv.removeChild(logDiv.children[1]);
    }
}

function updateUI() {
    document.getElementById('goldCount').textContent = Math.floor(game.gold);
    document.getElementById('dworfsCount').textContent = game.dworfs.length;
    
    // Calculate average needs across all dwarfs
    if (game.dworfs.length > 0) {
        const totals = {
            hunger: 0, thirst: 0, rest: 0, joy: 0, coffee: 0, cleanliness: 0
        };
        
        game.dworfs.forEach(dwarf => {
            totals.hunger += dwarf.hunger;
            totals.thirst += dwarf.thirst;
            totals.rest += dwarf.rest;
            totals.joy += dwarf.joy;
            totals.coffee += dwarf.coffee;
            totals.cleanliness += dwarf.cleanliness;
        });
        
        const count = game.dworfs.length;
        const averages = {
            hunger: totals.hunger / count,
            thirst: totals.thirst / count,
            rest: totals.rest / count,
            joy: totals.joy / count,
            coffee: totals.coffee / count,
            cleanliness: totals.cleanliness / count
        };
        
        // Update UI elements with color coding
        function updateNeedDisplay(elementId, value, criticalThreshold = 15, lowThreshold = 30) {
            const element = document.getElementById(elementId);
            element.textContent = Math.floor(value);
            
            if (value < criticalThreshold) {
                element.style.color = '#FF4444';
            } else if (value < lowThreshold) {
                element.style.color = '#FF9800';
            } else {
                element.style.color = '#4CAF50';
            }
        }
        
        updateNeedDisplay('avgHunger', averages.hunger, 15, 35);
        updateNeedDisplay('avgThirst', averages.thirst, 10, 30);
        updateNeedDisplay('avgRest', averages.rest, 10, 30);
        updateNeedDisplay('avgJoy', averages.joy, 10, 30);
        updateNeedDisplay('avgCoffee', averages.coffee, 5, 25);
        updateNeedDisplay('avgClean', averages.cleanliness, 15, 35);
    }
    
    // Count different types of buildings
    const regularBuildings = game.buildings.filter(b => b.type !== 'amenity').length;
    const amenityBuildings = game.buildings.filter(b => b.type === 'amenity').length;
    const negativeBuildings = game.negativeBuildings.length;
    
    let buildingText = regularBuildings.toString();
    if (amenityBuildings > 0) buildingText += ` (+${amenityBuildings} 🏠)`;
    if (negativeBuildings > 0) buildingText += ` (+${negativeBuildings} ⚠️)`;
    
    document.getElementById('machinesCount').textContent = amenityBuildings;
    document.getElementById('buildingsCount').textContent = buildingText;
    document.getElementById('goldPerSec').textContent = game.goldPerSecond.toFixed(1);
    
    updateRocketProgress();
}

function updateRocketProgress() {
    const totalParts = Object.keys(game.rocketParts).length;
    let completedParts = 0;
    for (let part in game.rocketParts) {
        if (game.rocketParts[part].built) completedParts++;
    }
    const overallProgress = (completedParts / totalParts) * 100;
    
    document.getElementById('overallProgress').style.width = overallProgress + '%';
    
    let progressText = 'Planning phase...';
    if (overallProgress === 100) progressText = '🚀 READY FOR LAUNCH!';
    else if (overallProgress > 80) progressText = 'Final assembly...';
    else if (overallProgress > 60) progressText = 'Major construction...';
    else if (overallProgress > 40) progressText = 'Building components...';
    else if (overallProgress > 20) progressText = 'Foundation work...';
    else if (overallProgress > 0) progressText = 'Starting construction...';
    
    document.getElementById('progressText').textContent = progressText;
    
    const partNames = ['engine', 'fuel', 'hull', 'navigation', 'launchpad'];
    const partIcons = ['🔥', '⛽', '🛡️', '📡', '🗏️'];
    
    for (let i = 0; i < partNames.length; i++) {
        const partName = partNames[i];
        const partData = game.rocketParts[partName];
        const element = document.getElementById(partName);
        const icon = partIcons[i];
        const capitalName = partName.charAt(0).toUpperCase() + partName.slice(1);
        
        if (partData.built) {
            element.className = 'rocket-part completed';
            element.textContent = icon + ' ' + capitalName + ': ✅ Complete';
        } else if (partData.building) {
            element.className = 'rocket-part building';
            element.textContent = icon + ' ' + capitalName + ': 🔨 Building... ' + Math.floor(partData.progress * 100) + '%';
        } else if (game.gold >= partData.cost) {
            element.className = 'rocket-part';
            element.textContent = icon + ' ' + capitalName + ': 💰 Ready to build (' + partData.cost + ' gold)';
        } else {
            element.className = 'rocket-part';
            element.textContent = icon + ' ' + capitalName + ': ⏳ Need ' + partData.cost + ' gold';
        }
    }
}