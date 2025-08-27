// UI management and logging system with spam reduction

// Message tracking for spam reduction
const messageTracker = {
    recentMessages: new Map(), // Map of message -> {count, element, timestamp, type}
    duplicateWindow: 5000, // 5 seconds window for duplicate detection
    
    // Clean old messages from tracker
    cleanup() {
        const now = Date.now();
        for (let [message, data] of this.recentMessages) {
            if (now - data.timestamp > this.duplicateWindow) {
                this.recentMessages.delete(message);
            }
        }
    },
    
    // Check if message is a duplicate and should be grouped
    isDuplicate(message) {
        this.cleanup();
        return this.recentMessages.has(message);
    },
    
    // Update existing message counter
    updateCounter(message) {
        const data = this.recentMessages.get(message);
        if (data) {
            data.count++;
            data.timestamp = Date.now(); // Reset timer
            
            // Update the display
            const timeStr = '[' + Math.floor(game.time / 60) + 's]';
            data.element.textContent = `${timeStr} ${message} (x${data.count})`;
            
            // Add pulsing effect for active spam
            data.element.classList.add('spam-counter');
            setTimeout(() => {
                if (data.element) data.element.classList.remove('spam-counter');
            }, 300);
            
            return true;
        }
        return false;
    },
    
    // Add new message to tracker
    addMessage(message, element, type) {
        this.recentMessages.set(message, {
            count: 1,
            element: element,
            timestamp: Date.now(),
            type: type || 'normal'
        });
    },
    
    // Check if a message should be suppressed (for very frequent messages)
    shouldSuppress(message) {
        // Suppress very frequent low-importance messages
        const suppressPatterns = [
            /chose: Need amenity:/,
            /chose: Mine for gold/,
            /chose: Nothing urgent/,
            /feels refreshed and ready to work/,
            /couldn't find any sustenance/
        ];
        
        return suppressPatterns.some(pattern => pattern.test(message));
    }
};

function addLog(message, important, type) {
    const logDiv = document.getElementById('log');
    
    // Clean the message for duplicate detection (remove timestamp and dwarf names for better grouping)
    const cleanMessage = message.replace(/^[A-Za-z_0-9]+\s+(chose:|is|feels|couldn't|needs|had|learned|made|was)/, 'Dwarf $1');
    
    // Check if this is a duplicate message within the time window
    if (!important && messageTracker.isDuplicate(cleanMessage)) {
        // Update existing counter instead of adding new message
        if (messageTracker.updateCounter(cleanMessage)) {
            return; // Successfully updated counter, don't add new message
        }
    }
    
    // Check if message should be suppressed for being too spammy
    if (!important && messageTracker.shouldSuppress(message)) {
        // Only log every 5th occurrence of these messages
        const suppressKey = cleanMessage + '_suppress';
        if (!window.suppressCounts) window.suppressCounts = {};
        window.suppressCounts[suppressKey] = (window.suppressCounts[suppressKey] || 0) + 1;
        
        if (window.suppressCounts[suppressKey] % 5 !== 0) {
            return; // Skip this message
        }
        
        // Modify message to show it's been suppressed
        message += ` (${window.suppressCounts[suppressKey]} total)`;
    }
    
    // Create new log entry
    const entry = document.createElement('div');
    
    if (important) {
        entry.className = 'log-entry important';
    } else if (type === 'disaster') {
        entry.className = 'log-entry disaster';
    } else if (type === 'success') {
        entry.className = 'log-entry success';
    } else {
        entry.className = 'log-entry';
    }
    
    const timeStr = '[' + Math.floor(game.time / 60) + 's]';
    entry.textContent = timeStr + ' ' + message;
    
    // Add to DOM
    logDiv.appendChild(entry);
    logDiv.scrollTop = logDiv.scrollHeight;
    
    // Track this message for future duplicate detection (only for non-important messages)
    if (!important) {
        messageTracker.addMessage(cleanMessage, entry, type);
    }
    
    // Clean up old entries (keep last 25)
    while (logDiv.children.length > 25) {
        const removedElement = logDiv.children[1];
        
        // Remove from message tracker if it's being deleted
        for (let [msg, data] of messageTracker.recentMessages) {
            if (data.element === removedElement) {
                messageTracker.recentMessages.delete(msg);
                break;
            }
        }
        
        logDiv.removeChild(removedElement);
    }
}

// Enhanced updateUI function with demographics and spam reduction
function updateUI() {
    document.getElementById('goldCount').textContent = Math.floor(game.gold);
    
    // Enhanced population demographics display
    const adults = game.dworfs.filter(d => d.isAdult);
    const children = game.dworfs.filter(d => !d.isAdult);
    const males = adults.filter(d => d.gender === 'male');
    const females = adults.filter(d => d.gender === 'female');
    const pregnant = females.filter(f => f.isPregnant);
    
    // Strategy breakdown for adult males
    const orangeMales = males.filter(m => m.reproductionStrategy === 'orange').length;
    const blueMales = males.filter(m => m.reproductionStrategy === 'blue').length;
    const yellowMales = males.filter(m => m.reproductionStrategy === 'yellow').length;
    
    // Build population string
    let populationText = game.dworfs.length.toString();
    if (adults.length > 0) {
        populationText += ` (${adults.length}👥`;
        if (children.length > 0) populationText += `, ${children.length}👶`;
        if (pregnant.length > 0) populationText += `, ${pregnant.length}🤱`;
        populationText += ')';
    }
    
    // Add strategy breakdown if there are adult males
    if (males.length > 0) {
        populationText += ` [🟠${orangeMales} 🔵${blueMales} 🟡${yellowMales}]`;
    }
    
    document.getElementById('dworfsCount').textContent = populationText;
    
    // Calculate average needs across all dwarfs
    if (game.dworfs.length > 0) {
        const totals = {
            hunger: 0, thirst: 0, rest: 0, joy: 0, coffee: 0, cleanliness: 0
        };
        
        // Also track how many dwarfs have critical needs
        const criticalCounts = {
            hunger: 0, thirst: 0, rest: 0, joy: 0, coffee: 0, cleanliness: 0
        };
        
        game.dworfs.forEach(dwarf => {
            totals.hunger += dwarf.hunger;
            totals.thirst += dwarf.thirst;
            totals.rest += dwarf.rest;
            totals.joy += dwarf.joy;
            totals.coffee += dwarf.coffee;
            totals.cleanliness += dwarf.cleanliness;
            
            // Count critical needs
            if (dwarf.hunger < 15) criticalCounts.hunger++;
            if (dwarf.thirst < 15) criticalCounts.thirst++;
            if (dwarf.rest < 15) criticalCounts.rest++;
            if (dwarf.joy < 15) criticalCounts.joy++;
            if (dwarf.coffee < 10) criticalCounts.coffee++;
            if (dwarf.cleanliness < 15) criticalCounts.cleanliness++;
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
        
        // Enhanced UI display with critical counts
        function updateNeedDisplay(elementId, value, criticalCount, criticalThreshold = 15, lowThreshold = 30) {
            const element = document.getElementById(elementId);
            let displayText = Math.floor(value).toString();
            
            // Add critical count if there are dwarfs with critical needs
            if (criticalCount > 0) {
                displayText += ` (${criticalCount}⚠️)`;
            }
            
            element.textContent = displayText;
            
            if (value < criticalThreshold || criticalCount > 0) {
                element.style.color = '#FF4444';
            } else if (value < lowThreshold) {
                element.style.color = '#FF9800';
            } else {
                element.style.color = '#4CAF50';
            }
        }
        
        updateNeedDisplay('avgHunger', averages.hunger, criticalCounts.hunger, 15, 35);
        updateNeedDisplay('avgThirst', averages.thirst, criticalCounts.thirst, 10, 30);
        updateNeedDisplay('avgRest', averages.rest, criticalCounts.rest, 10, 30);
        updateNeedDisplay('avgJoy', averages.joy, criticalCounts.joy, 10, 30);
        updateNeedDisplay('avgCoffee', averages.coffee, criticalCounts.coffee, 5, 25);
        updateNeedDisplay('avgClean', averages.cleanliness, criticalCounts.cleanliness, 15, 35);
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
