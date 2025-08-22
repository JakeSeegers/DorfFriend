// Motion detection and stability system
let isTracking = false;
let stabilityLevel = 100;
let motionFlash = 0;
let lastMotionIntensity = 0;
let lastMotionDetected = 0;

// Accelerometer variables
let isAccelerometerEnabled = false;
let currentAccelX = 0;
let currentAccelY = 0;
let currentAccelZ = 9.8;

function handleMotionDamage(intensity) {
    lastMotionIntensity = intensity;
    lastMotionDetected = Date.now();
    
    if (intensity > 10.0) {
        motionFlash = 20;
        stabilityLevel = Math.max(0, stabilityLevel - (intensity * 3));
        
        addLog('📳 Motion detected! Intensity: ' + intensity.toFixed(2), true, 'disaster');
        
        if (Math.random() < 0.1) {
            destroyRandomThing();
        }
    }
}

function handleAccelerometerMotion(event) {
    const accel = event.accelerationIncludingGravity;
    if (accel) {
        const x = accel.x || 0;
        const y = accel.y || 0;
        const z = accel.z || 0;
        
        currentAccelX = x;
        currentAccelY = y;
        currentAccelZ = z;
        
        const intensity = Math.sqrt(x * x + y * y + z * z);
        handleMotionDamage(intensity);
    }
}

function handleAccelerometerOrientation(event) {
    const alpha = event.alpha || 0;
    const beta = event.beta || 0;
    const gamma = event.gamma || 0;
    
    const orientationIntensity = Math.sqrt(alpha * alpha + beta * beta + gamma * gamma) * 0.01;
    
    if (orientationIntensity > 0.1) {
        handleMotionDamage(orientationIntensity);
    }
}

function destroyRandomThing() {
    const targets = [];
    
    if (game.dworfs.length > 1) targets.push('dwarf');
    if (game.machines.length > 0) targets.push('machine');
    if (game.buildings.length > 0) targets.push('building');
    if (game.negativeBuildings.length > 0) targets.push('negative_building');
    if (game.goldDeposits.length > 0) targets.push('deposit');
    if (game.foodSources.length > 1) targets.push('food');
    if (game.waterSources.length > 1) targets.push('water');
    
    if (targets.length === 0) return false;
    
    const target = targets[Math.floor(Math.random() * targets.length)];
    
    switch (target) {
        case 'dwarf':
            if (game.dworfs.length > 1) {
                // Neurotic dwarfs are more likely to be affected by motion stress
                let mostVulnerable = game.dworfs[0];
                let highestVulnerability = 0;
                
                game.dworfs.forEach(dwarf => {
                    const vulnerability = dwarf.personality.neuroticism + 
                                         (100 - Math.min(dwarf.hunger, dwarf.thirst));
                    if (vulnerability > highestVulnerability) {
                        highestVulnerability = vulnerability;
                        mostVulnerable = dwarf;
                    }
                });
                
                const index = game.dworfs.indexOf(mostVulnerable);
                if (index > 0) {
                    const removedDwarf = game.dworfs.splice(index, 1)[0];
                    addLog('💀 ' + removedDwarf.name + ' was overwhelmed by the chaos!', true, 'disaster');
                    return true;
                }
            }
            break;
        case 'machine':
            if (game.machines.length > 0) {
                game.machines.pop();
                addLog('⚙️ A machine was destroyed by instability!', false, 'disaster');
                return true;
            }
            break;
        case 'building':
            if (game.buildings.length > 0) {
                game.buildings.pop();
                addLog('🏠 A building collapsed from instability!', false, 'disaster');
                return true;
            }
            break;
        case 'negative_building':
            if (game.negativeBuildings.length > 0) {
                const destroyed = game.negativeBuildings.pop();
                const buildingNames = {
                    'gold_mutation_chamber': 'Gold Mutation Chamber',
                    'motion_alarm_tower': 'Motion Alarm Tower',
                    'party_pavilion': 'Party Pavilion',
                    'unsafe_mining_rig': 'Unsafe Mining Rig',
                    'personal_gold_vault': 'Personal Gold Vault'
                };
                addLog('💥 ' + buildingNames[destroyed.type] + ' was destroyed by instability!', true);
                return true;
            }
            break;
        case 'deposit':
            if (game.goldDeposits.length > 0) {
                game.goldDeposits.pop();
                addLog('✨ A gold deposit was scattered by motion!', false, 'disaster');
                return true;
            }
            break;
        case 'food':
            if (game.foodSources.length > 1) {
                game.foodSources.pop();
                addLog('🍓 Berry bush destroyed by instability!', false, 'disaster');
                return true;
            }
            break;
        case 'water':
            if (game.waterSources.length > 1) {
                game.waterSources.pop();
                addLog('💧 Water spring dried up from the chaos!', false, 'disaster');
                return true;
            }
            break;
    }
    return false;
}

async function requestPermissioniOS() {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        try {
            const permission = await DeviceOrientationEvent.requestPermission();
            return permission === 'granted';
        } catch (error) {
            console.error('Error requesting permission:', error);
            return false;
        }
    }
    return true;
}

async function enableAccelerometer() {
    const statusDiv = document.getElementById('motionStatus');
    statusDiv.textContent = '🔄 Requesting permissions...';
    
    try {
        const hasPermission = await requestPermissioniOS();
        
        if (!hasPermission) {
            statusDiv.textContent = '❌ Permission denied. Enable in Safari settings.';
            statusDiv.className = 'motion-status inactive';
            return;
        }
        
        if (!window.DeviceMotionEvent && !window.DeviceOrientationEvent) {
            statusDiv.textContent = '❌ Motion sensors not supported on this device.';
            statusDiv.className = 'motion-status inactive';
            return;
        }
        
        if (window.DeviceMotionEvent) {
            window.addEventListener('devicemotion', handleAccelerometerMotion);
        }
        
        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', handleAccelerometerOrientation);
        }
        
        isAccelerometerEnabled = true;
        isTracking = true;
        statusDiv.textContent = '✅ Motion detection active - Keep device steady!';
        statusDiv.className = 'motion-status active';
        
        addLog('✅ Motion detection enabled automatically!', true);
        addLog('⚠️ Keep device steady to protect your colony!', true);
        
    } catch (error) {
        console.error('Error enabling accelerometer:', error);
        statusDiv.textContent = '❌ Failed to enable motion detection. Try refreshing.';
        statusDiv.className = 'motion-status inactive';
    }
}

function updateStability() {
    if (isTracking) {
        stabilityLevel = Math.min(100, stabilityLevel + 0.05);
    }
    
    if (motionFlash > 0) motionFlash--;
    
    const stabilityBar = document.getElementById('stabilityBar');
    const stabilityText = document.getElementById('stabilityText');
    
    stabilityBar.style.width = stabilityLevel + '%';
    
    const motionText = 'Motion: ' + lastMotionIntensity.toFixed(1);
    
    if (stabilityLevel > 75) {
        stabilityBar.className = 'stability-bar stability-high';
        stabilityText.textContent = 'Stable (' + motionText + ')';
    } else if (stabilityLevel > 50) {
        stabilityBar.className = 'stability-bar stability-medium';
        stabilityText.textContent = 'Unstable (' + motionText + ')';
    } else if (stabilityLevel > 25) {
        stabilityBar.className = 'stability-bar stability-low';
        stabilityText.textContent = 'Dangerous (' + motionText + ')';
    } else {
        stabilityBar.className = 'stability-bar stability-critical';
        stabilityText.textContent = 'Critical! (' + motionText + ')';
    }
}