// Dwarf class and behavior system
class Dworf {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.targetX = x;
        this.targetY = y;
        this.speed = 0.8 + Math.random() * 0.4;
        this.task = 'exploring';
        this.workTimer = 0;
        this.target = null;
        this.color = 'hsl(' + (Math.random() * 60 + 20) + ', 70%, 60%)';
        this.goldCarried = 0;
        this.baseEfficiency = 0.8 + Math.random() * 0.4;
        this.efficiency = this.baseEfficiency;
        this.sparkles = [];
        
        // Big Five personality traits (0-100 scale)
        this.personality = {
            openness: Math.random() * 100,
            conscientiousness: Math.random() * 100,
            extraversion: Math.random() * 100,
            agreeableness: Math.random() * 100,
            neuroticism: Math.random() * 100
        };
        
        // Lizard reproductive strategies
        const strategies = ['orange', 'blue', 'yellow'];
        this.reproductionStrategy = strategies[Math.floor(Math.random() * strategies.length)];
        this.reproductionTimer = 0; // Timer to control reproduction attempts
        this.reproductionPartner = null; // Track reproduction partner

        // Survival needs (0-100 scale, start well-fed)
        this.hunger = 80 + Math.random() * 20;
        this.thirst = 80 + Math.random() * 20;
        
        // Comprehensive need system
        this.rest = 70 + Math.random() * 30;
        this.joy = 60 + Math.random() * 40;
        this.art = 50 + Math.random() * 50;
        this.coffee = 40 + Math.random() * 60;
        this.wisdom = 30 + Math.random() * 70;
        this.exercise = 60 + Math.random() * 40;
        this.social = 50 + Math.random() * 50;
        this.cleanliness = 70 + Math.random() * 30;
        
        // Much slower consumption rates
        this.hungerRate = 0.0015 + (this.personality.neuroticism / 50000);
        this.thirstRate = 0.002 + (this.personality.extraversion / 80000);
        this.restRate = 0.003 + (this.personality.conscientiousness / 40000);
        // Luxury needs: Much slower consumption
        this.joyRate = 0.0008 + (this.personality.neuroticism / 40000);
        this.artRate = 0.0004 + (this.personality.openness / 80000);
        this.coffeeRate = 0.002 + (this.personality.conscientiousness / 60000);
        this.wisdomRate = 0.0003 + (this.personality.openness / 100000);
        this.exerciseRate = 0.0006 + ((100 - this.personality.conscientiousness) / 80000);
        this.socialRate = 0.0006 + (this.personality.extraversion / 60000);
        this.cleanlinessRate = 0.0008 + (this.personality.conscientiousness / 80000);
        
        // Generate a unique name
        this.name = DWARF_NAMES[Math.floor(Math.random() * DWARF_NAMES.length)] + '_' + Math.floor(Math.random() * 100);
    }
    
    update() {
        this.updateSparkles();
        this.updateSurvivalNeeds();
        this.applyPersonalityBehavior();
        this.checkReproduction(); // New check for reproduction opportunities
        
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 3) {
            const healthModifier = this.getHealthModifier();
            this.x += (dx / distance) * this.speed * healthModifier;
            this.y += (dy / distance) * this.speed * healthModifier;
        } else {
            this.handleTask();
        }
        
        // Keep dwarfs within canvas bounds
        this.x = Math.max(20, Math.min(canvas.width - 20, this.x));
        this.y = Math.max(20, Math.min(canvas.height - 20, this.y));
        
        this.targetX = Math.max(20, Math.min(canvas.width - 20, this.targetX));
        this.targetY = Math.max(20, Math.min(canvas.height - 20, this.targetY));
        
        // Use priority system to decide when to find new tasks
        if ((this.task === 'idle' || (this.task === 'exploring' && Math.random() < 0.01)) && 
            !this.isInSpecialState()) {
            this.evaluateTaskPriorities();
        }
    }
    
    // Check if dwarf is in a special state that shouldn't be interrupted
    isInSpecialState() {
        const specialStates = [
            'lazy_break', 'panicking', 'confused', 'recovering', 
            'avoiding_conflict', 'nervous_breakdown', 'work_refusal', 'forced_party',
            'reproducing' // New special state for reproduction
        ];
        return specialStates.includes(this.task);
    }
    
    // FIXED: Enhanced reproduction system with proper lizard rules
    checkReproduction() {
        if (this.reproductionTimer > 0) {
            this.reproductionTimer--;
            return;
        }

        // Only attempt reproduction if not in survival mode
        if (this.hunger < 30 || this.thirst < 30) return;

        const nearbyDwarfs = game.dworfs.filter(d => 
            d !== this && 
            d.task !== 'reproducing' && // Don't interrupt others already reproducing
            Math.sqrt((d.x - this.x) ** 2 + (d.y - this.y) ** 2) < 80 // Slightly larger range
        );

        if (nearbyDwarfs.length > 0) {
            const partner = nearbyDwarfs[Math.floor(Math.random() * nearbyDwarfs.length)];
            
            // Check if we can reproduce with this partner
            if (this.canReproduceWith(partner)) {
                // Look for a house first (preferred)
                const emptyHouses = game.buildings.filter(b => 
                    b.type === 'amenity' && 
                    b.amenityType === 'house' && 
                    !b.occupied
                );

                let targetX, targetY;
                
                if (emptyHouses.length > 0) {
                    // Use house if available
                    const house = emptyHouses[0];
                    house.occupied = true;
                    targetX = house.x;
                    targetY = house.y;
                    addLog(this.name + ' and ' + partner.name + ' are starting a family in a house!', false);
                } else if (game.buildings.length > 0) {
                    // Use any building as backup
                    const anyBuilding = game.buildings[Math.floor(Math.random() * game.buildings.length)];
                    targetX = anyBuilding.x + (Math.random() - 0.5) * 60;
                    targetY = anyBuilding.y + (Math.random() - 0.5) * 60;
                    addLog(this.name + ' and ' + partner.name + ' found a cozy spot near a building!', false);
                } else {
                    // Last resort: find a quiet corner
                    targetX = Math.random() * (canvas.width - 100) + 50;
                    targetY = Math.random() * (canvas.height - 100) + 50;
                    addLog(this.name + ' and ' + partner.name + ' found a quiet spot in the wilderness!', false);
                }
                
                // Set both dwarfs to reproducing state
                this.task = 'reproducing';
                this.targetX = targetX;
                this.targetY = targetY;
                this.workTimer = 300; // Reduced from implied longer time
                this.reproductionPartner = partner.name;
                
                partner.task = 'reproducing';
                partner.targetX = targetX;
                partner.targetY = targetY;
                partner.workTimer = 300;
                partner.reproductionPartner = this.name;
                
                // Shorter cooldown
                this.reproductionTimer = 600; // Reduced from 1000
                partner.reproductionTimer = 600;
            }
        }
    }

    // FIXED: Enhanced lizard reproductive strategies
    canReproduceWith(partner) {
        // Enhanced lizard reproductive strategies
        const thisStrategy = this.reproductionStrategy;
        const partnerStrategy = partner.reproductionStrategy;
        
        // Orange males (aggressive, territorial) - can reproduce with multiple strategies
        if (thisStrategy === 'orange') {
            if (partnerStrategy === 'yellow') return Math.random() < 0.8; // High success with sneaky yellow
            if (partnerStrategy === 'blue') return Math.random() < 0.3;   // Lower success, blue guards mate
            if (partnerStrategy === 'orange') return Math.random() < 0.1; // Rare, both aggressive
            return false;
        }
        
        // Yellow males (sneaky, mimic females) - very adaptable
        if (thisStrategy === 'yellow') {
            if (partnerStrategy === 'orange') return Math.random() < 0.8; // High success, can sneak past
            if (partnerStrategy === 'blue') return Math.random() < 0.6;   // Good success, sneaky approach
            if (partnerStrategy === 'yellow') return Math.random() < 0.4; // Moderate success
            return false;
        }
        
        // Blue males (guarding, selective) - most restrictive but stable
        if (thisStrategy === 'blue') {
            if (partnerStrategy === 'orange') return Math.random() < 0.2; // Low success, orange too aggressive
            if (partnerStrategy === 'yellow') return Math.random() < 0.5; // Moderate success
            if (partnerStrategy === 'blue') return Math.random() < 0.7;   // High success with fellow guarders
            return false;
        }
        
        return false;
    }

    // FIXED: Enhanced offspring creation with trait inheritance
    createNewDwarf() {
        // Create new dwarf with mixed traits from parents
        const newDwarf = new Dworf(this.x + (Math.random() - 0.5) * 40, this.y + (Math.random() - 0.5) * 40);
        
        // Find the partner
        const partner = game.dworfs.find(d => d.name === this.reproductionPartner);
        if (partner) {
            // Mix personality traits from both parents
            newDwarf.personality.openness = (this.personality.openness + partner.personality.openness) / 2 + (Math.random() - 0.5) * 40;
            newDwarf.personality.conscientiousness = (this.personality.conscientiousness + partner.personality.conscientiousness) / 2 + (Math.random() - 0.5) * 40;
            newDwarf.personality.extraversion = (this.personality.extraversion + partner.personality.extraversion) / 2 + (Math.random() - 0.5) * 40;
            newDwarf.personality.agreeableness = (this.personality.agreeableness + partner.personality.agreeableness) / 2 + (Math.random() - 0.5) * 40;
            newDwarf.personality.neuroticism = (this.personality.neuroticism + partner.personality.neuroticism) / 2 + (Math.random() - 0.5) * 40;
            
            // Clamp values to 0-100
            Object.keys(newDwarf.personality).forEach(trait => {
                newDwarf.personality[trait] = Math.max(0, Math.min(100, newDwarf.personality[trait]));
            });
            
            // Inherit reproduction strategy from one parent (with slight mutation chance)
            if (Math.random() < 0.1) {
                // 10% mutation rate
                const strategies = ['orange', 'blue', 'yellow'];
                newDwarf.reproductionStrategy = strategies[Math.floor(Math.random() * strategies.length)];
            } else {
                // Inherit from random parent
                newDwarf.reproductionStrategy = Math.random() < 0.5 ? this.reproductionStrategy : partner.reproductionStrategy;
            }
            
            partner.task = 'idle';
            partner.reproductionPartner = null;
        }
        
        game.dworfs.push(newDwarf);
        addLog('👶 A new dwarf, ' + newDwarf.name + ', has been born! Strategy: ' + newDwarf.reproductionStrategy, true, 'success');
        
        // Free up house if used
        const house = game.buildings.find(b => b.x === this.targetX && b.y === this.targetY && b.occupied);
        if (house) house.occupied = false;
        
        this.task = 'idle';
        this.reproductionPartner = null;
    }

    // Evaluate all possible tasks by priority and choose the most important
    evaluateTaskPriorities() {
        const taskOptions = [];
        // 1. CRITICAL SURVIVAL CHECK
        if (this.hunger < 5 || this.thirst < 5) {
            taskOptions.push({
                task: 'seeking_sustenance',
                priority: TASK_PRIORITIES.CRITICAL_SURVIVAL,
                reason: 'Critical hunger/thirst'
            });
        }
        // 2. BASIC SURVIVAL CHECK
        else if (this.hunger < 15 || this.thirst < 15) {
            taskOptions.push({
                task: 'seeking_sustenance',
                priority: TASK_PRIORITIES.BASIC_SURVIVAL,
                reason: 'Low hunger/thirst'
            });
        }
        
        // 3. ROCKET BUILDING CHECK (if survival needs are met)
        if (this.hunger > 20 && this.thirst > 20) {
            const rocketPart = this.shouldBuildRocket(game.gold);
            if (rocketPart) {
                taskOptions.push({
                    task: 'build_rocket',
                    priority: TASK_PRIORITIES.ROCKET_BUILDING,
                    reason: 'Rocket part available: ' + rocketPart,
                    data: rocketPart
                });
            }
            
            // 4. INFRASTRUCTURE BUILDING CHECK
            const infraType = this.shouldBuildInfrastructure(game.gold);
            if (infraType) {
                taskOptions.push({
                    task: 'build_infrastructure',
                    priority: TASK_PRIORITIES.INFRASTRUCTURE,
                    reason: 'Infrastructure needed: ' + infraType,
                    data: infraType
                });
            }
            
            // 5. AMENITY SEEKING CHECK
            const criticalAmenityNeed = this.evaluateAmenityNeeds();
            if (criticalAmenityNeed) {
                taskOptions.push({
                    task: 'seeking_amenities',
                    priority: TASK_PRIORITIES.AMENITY_SEEKING,
                    reason: 'Need amenity: ' + criticalAmenityNeed
                });
            }
            
            // 6. MINING CHECK (default productive task)
            taskOptions.push({
                task: 'mining',
                priority: TASK_PRIORITIES.MINING,
                reason: 'Mine for gold'
            });
        }
        
        // 7. IDLE (fallback)
        taskOptions.push({
            task: 'idle',
            priority: TASK_PRIORITIES.IDLE,
            reason: 'Nothing urgent to do'
        });
        // Choose the highest priority task
        taskOptions.sort((a, b) => b.priority - a.priority);
        const chosenTask = taskOptions[0];
        
        // Debug: occasionally log task decisions
        if (Math.random() < 0.02) {
            addLog(this.name + ' chose: ' + chosenTask.reason, false);
        }
        
        // Execute the chosen task
        this.executeChosenTask(chosenTask);
    }
    
    // Execute the task chosen by the priority system
    executeChosenTask(chosenTask) {
        switch (chosenTask.task) {
            case 'seeking_sustenance':
                this.task = 'seeking_sustenance';
                break;
                
            case 'build_rocket':
                this.startRocketConstruction(chosenTask.data);
                break;
            case 'build_infrastructure':
                this.startInfrastructureConstruction(chosenTask.data);
                break;
            case 'seeking_amenities':
                this.task = 'seeking_amenities';
                break;
                
            case 'mining':
                this.findGoldDeposit();
                break;
            case 'idle':
            default:
                this.task = 'idle';
                this.targetX = Math.random() * (canvas.width - 100) + 50;
                this.targetY = Math.random() * (canvas.height - 100) + 50;
                break;
        }
    }
    
    // Evaluate which amenity needs are critical
    evaluateAmenityNeeds() {
        const needs = [
            { name: 'rest', value: this.rest, threshold: 20 },
            { name: 'joy', value: this.joy, threshold: 15 },
            { name: 'coffee', value: this.coffee, threshold: 10 },
            { name: 'cleanliness', value: this.cleanliness, threshold: 15 },
            { name: 'social', value: this.social, threshold: 15 },
            { name: 'exercise', value: this.exercise, threshold: 15 },
            { name: 'art', value: this.art, threshold: 10 },
            { name: 'wisdom', value: this.wisdom, threshold: 10 }
        ];
        // Find the most critical need
        const criticalNeeds = needs.filter(need => need.value < need.threshold);
        if (criticalNeeds.length > 0) {
            criticalNeeds.sort((a, b) => a.value - b.value);
            return criticalNeeds[0].name;
        }
        
        return null;
    }
    
    updateSurvivalNeeds() {
        // Decrease all needs over time
        this.hunger = Math.max(0, this.hunger - this.hungerRate);
        this.thirst = Math.max(0, this.thirst - this.thirstRate);
        this.rest = Math.max(0, this.rest - this.restRate);
        this.joy = Math.max(0, this.joy - this.joyRate);
        this.art = Math.max(0, this.art - this.artRate);
        this.coffee = Math.max(0, this.coffee - this.coffeeRate);
        this.wisdom = Math.max(0, this.wisdom - this.wisdomRate);
        this.exercise = Math.max(0, this.exercise - this.exerciseRate);
        this.social = Math.max(0, this.social - this.socialRate);
        this.cleanliness = Math.max(0, this.cleanliness - this.cleanlinessRate);
        // Warning messages for critically low needs
        if (this.hunger < 10 && Math.random() < 0.002) {
            addLog(this.name + ' is getting very hungry!', false, 'disaster');
        }
        if (this.thirst < 10 && Math.random() < 0.002) {
            addLog(this.name + ' needs water urgently!', false, 'disaster');
        }
        if (this.rest < 5 && Math.random() < 0.002) {
            addLog(this.name + ' is exhausted and needs sleep!', false, 'disaster');
        }
        
        // Handle seeking sustenance task with improved decision-making
        if (this.task === 'seeking_sustenance') {
            this.handleSustenanceSeeking();
        }
        
        // Handle seeking amenities task
        if (this.task === 'seeking_amenities') {
            // Double-check that survival needs aren't critical
            if (this.hunger < 5 || this.thirst < 5) {
                this.task = 'seeking_sustenance';
            } else {
                this.seekNearestAmenity();
            }
        }
        
        this.handlePersonalityEffects();
    }
    
    handleSustenanceSeeking() {
        let nearestSource = null;
        let minDist = Infinity;
        let sourceType = null;
        
        // Calculate urgency scores for each need
        const hungerUrgency = Math.max(0, 100 - this.hunger) * 1.2;
        const thirstUrgency = Math.max(0, 100 - this.thirst);
        
        // Decide which need to prioritize
        let priorityNeed = 'hunger';
        if (thirstUrgency > hungerUrgency * 1.1) {
            priorityNeed = 'thirst';
        } else if (Math.abs(thirstUrgency - hungerUrgency) < 10) {
            priorityNeed = Math.random() < 0.6 ? 'hunger' : 'thirst';
        }
        
        // Look for the priority source first
        if (priorityNeed === 'food' || priorityNeed === 'hunger') {
            game.foodSources.forEach(source => {
                const dist = Math.sqrt((this.x - source.x) ** 2 + (this.y - source.y) ** 2);
                if (dist < minDist) {
                    minDist = dist;
                    nearestSource = source;
                    sourceType = 'food';
                }
            });
        } else {
            game.waterSources.forEach(source => {
                const dist = Math.sqrt((this.x - source.x) ** 2 + (this.y - source.y) ** 2);
                if (dist < minDist) {
                    minDist = dist;
                    nearestSource = source;
                    sourceType = 'water';
                }
            });
        }
        
        // If no priority source found, check the other type
        if (!nearestSource) {
            if (priorityNeed === 'food' || priorityNeed === 'hunger') {
                game.waterSources.forEach(source => {
                    const dist = Math.sqrt((this.x - source.x) ** 2 + (this.y - source.y) ** 2);
                    if (dist < minDist) {
                        minDist = dist;
                        nearestSource = source;
                        sourceType = 'water';
                    }
                });
            } else {
                game.foodSources.forEach(source => {
                    const dist = Math.sqrt((this.x - source.x) ** 2 + (this.y - source.y) ** 2);
                    if (dist < minDist) {
                        minDist = dist;
                        nearestSource = source;
                        sourceType = 'food';
                    }
                });
            }
        }
        
        // Also check buildings as final backup
        if (!nearestSource) {
            game.buildings.forEach(building => {
                const dist = Math.sqrt((this.x - building.x) ** 2 + (this.y - building.y) ** 2);
                if (dist < minDist) {
                    minDist = dist;
                    nearestSource = building;
                    sourceType = 'building';
                }
            });
        }
        
        if (nearestSource) {
            this.targetX = nearestSource.x;
            this.targetY = nearestSource.y;
            
            if (minDist < 30) {
                this.consumeResource(nearestSource, sourceType);
            }
        } else {
            this.task = 'idle';
            if (Math.random() < 0.05) {
                addLog(this.name + ' couldn\'t find any sustenance sources!', false, 'disaster');
            }
        }
    }
    
    consumeResource(source, sourceType) {
        if (sourceType === 'food') {
            this.hunger = Math.min(100, this.hunger + 25);
            if (source.amount) {
                source.amount--;
                if (source.amount <= 0) {
                    const index = game.foodSources.indexOf(source);
                    if (index > -1) game.foodSources.splice(index, 1);
                }
            }
        } else if (sourceType === 'water') {
            this.thirst = Math.min(100, this.thirst + 35);
            if (source.amount) {
                source.amount--;
                if (source.amount <= 0) {
                    const index = game.waterSources.indexOf(source);
                    if (index > -1) game.waterSources.splice(index, 1);
                }
            }
        } else if (sourceType === 'building') {
            this.hunger = Math.min(100, this.hunger + 10);
            this.thirst = Math.min(100, this.thirst + 10);
        }
        
        // Stop seeking when reasonably satisfied
        if (this.hunger > 40 && this.thirst > 40) {
            this.task = 'idle';
            if (Math.random() < 0.1) {
                addLog(this.name + ' feels refreshed and ready to work!', false);
            }
        }
    }
    
    handlePersonalityEffects() {
        // COMPOUND EFFECTS - Multiple poor traits create worse outcomes
        if (this.personality.conscientiousness < 30 && this.personality.neuroticism > 70) {
            if (stabilityLevel < 50 && Math.random() < 0.002) {
                if (game.machines.length > 0 && Math.random() < 0.5) {
                    game.machines.pop();
                    addLog(this.name + ' accidentally destroyed a machine while panicking!', true, 'disaster');
                } else if (game.buildings.length > 0) {
                    game.buildings.pop();
                    addLog(this.name + ' clumsily damaged a building during stress!', true, 'disaster');
                }
            }
        }
        
        if (this.personality.agreeableness < 25 && this.personality.neuroticism > 75) {
            if (stabilityLevel < 40 && Math.random() < 0.001) {
                const otherDwarfs = game.dworfs.filter(d => d !== this);
                if (otherDwarfs.length > 0) {
                    const target = otherDwarfs[Math.floor(Math.random() * otherDwarfs.length)];
                    target.efficiency *= 0.3;
                    target.workTimer += 200;
                    addLog(this.name + ' lashed out and sabotaged ' + target.name + '\'s work!', true, 'disaster');
                }
            }
        }
    }
    
    applyPersonalityBehavior() {
        // Reset efficiency to base value first, then apply modifiers
        this.efficiency = this.baseEfficiency;
        // Apply conscientiousness modifier
        this.efficiency *= (0.5 + this.personality.conscientiousness / 200);
        // Neurotic dwarfs are more affected by colony instability
        if (stabilityLevel < 50 && this.personality.neuroticism > 70) {
            this.efficiency *= 0.7;
            if (Math.random() < 0.05) {
                addLog(this.name + ' is stressed by the instability!', false, 'disaster');
            }
        }
        
        // Extraverted dwarfs work better near others
        const nearbyDwarfs = game.dworfs.filter(d => 
            d !== this && Math.sqrt((d.x - this.x) ** 2 + (d.y - this.y) ** 2) < 100
        ).length;
        if (this.personality.extraversion > 60) {
            this.efficiency *= (1 + nearbyDwarfs * 0.1);
        } else if (this.personality.extraversion < 40) {
            this.efficiency *= (1 - nearbyDwarfs * 0.05);
        }
        
        // Open dwarfs discover new deposits more often
        if (this.personality.openness > 70 && Math.random() < 0.02) {
            if (game.goldDeposits.length < 3) {
                game.goldDeposits.push({
                    x: Math.random() * (canvas.width - 100) + 50,
                    y: Math.random() * (canvas.height - 100) + 50,
                    gold: 30 + Math.random() * 70
                });
                addLog(this.name + ' discovered a new gold deposit!', true);
            }
        }
    }
    
    getHealthModifier() {
        // Separate essential vs luxury needs for more balanced penalties
        const essentialNeeds = [this.hunger, this.thirst, this.rest];
        const luxuryNeeds = [this.art, this.coffee, this.wisdom, this.exercise, this.social, this.cleanliness, this.joy];
        // Count critical essential needs
        const criticalEssential = essentialNeeds.filter(need => need < 10).length;
        const criticalLuxury = luxuryNeeds.filter(need => need < 5).length;
        
        let modifier = 1.0;
        // ESSENTIAL NEEDS: Severe penalties for survival needs
        if (criticalEssential >= 2) modifier *= 0.4;
        else if (criticalEssential >= 1) modifier *= 0.7;
        
        // LUXURY NEEDS: Milder penalties
        if (criticalLuxury >= 5) modifier *= 0.95;
        else if (criticalLuxury >= 7) modifier *= 0.90;
        
        // Specific penalties for the most important needs
        if (this.hunger < 5) modifier *= 0.6;
        if (this.thirst < 5) modifier *= 0.5;
        if (this.rest < 3) modifier *= 0.7;
        // Luxury needs have smaller individual impact
        if (this.coffee < 3 && this.personality.conscientiousness > 70) modifier *= 0.97;
        if (this.joy < 3) modifier *= 0.98;
        if (this.cleanliness < 3) modifier *= 0.99;
        
        return Math.max(0.3, modifier);
    }
    
    seekNearestAmenity() {
        // Find the most needed amenity building
        let bestBuilding = null;
        let bestUrgency = 0;
        let minDistance = Infinity;
        
        const amenityBuildings = game.buildings.filter(b => b.type === 'amenity');
        if (amenityBuildings.length === 0) {
            this.task = 'idle';
            return;
        }
        
        amenityBuildings.forEach(building => {
            const dist = Math.sqrt((this.x - building.x) ** 2 + (this.y - building.y) ** 2);
            let urgency = 0;
            
            // Calculate urgency based on building type and dwarf needs
            switch (building.amenityType) {
                case 'house': urgency = Math.max(0, 30 - this.rest); break;
                case 'inn': urgency = Math.max(0, 25 - this.joy); break;
                case 'museum': urgency = Math.max(0, 20 - this.art); break;
                case 'coffee_shop': urgency = Math.max(0, 25 - this.coffee); break;
                case 'library': urgency = Math.max(0, 20 - this.wisdom); break;
                case 'gym': urgency = Math.max(0, 25 - this.exercise); break;
                case 'community_center': urgency = Math.max(0, 25 - this.social); break;
                case 'spa': urgency = Math.max(0, 30 - this.cleanliness); break;
                default: urgency = 0;
            }
            
            // Prefer closer buildings with high urgency
            const score = urgency * 100 / (dist + 1);
            if (score > bestUrgency) {
                bestUrgency = score;
                bestBuilding = building;
                minDistance = dist;
            }
        });
        
        if (bestBuilding) {
            this.targetX = bestBuilding.x;
            this.targetY = bestBuilding.y;
            
            if (minDistance < 30) {
                this.useAmenity(bestBuilding);
            }
        } else {
            this.task = 'idle';
        }
    }
    
    useAmenity(building) {
        // Much more effective amenities
        switch (building.amenityType) {
            case 'house':
                this.rest = Math.min(100, this.rest + 40);
                if (Math.random() < 0.1) addLog(this.name + ' feels well-rested after sleeping!', false);
                break;
            case 'inn':
                this.joy = Math.min(100, this.joy + 30);
                this.social = Math.min(100, this.social + 20);
                if (Math.random() < 0.1) addLog(this.name + ' had a great time at the inn!', false);
                break;
                
            case 'museum':
                this.art = Math.min(100, this.art + 25);
                this.wisdom = Math.min(100, this.wisdom + 15);
                if (Math.random() < 0.1) addLog(this.name + ' was inspired by beautiful art!', false);
                break;
            case 'coffee_shop':
                this.coffee = Math.min(100, this.coffee + 50);
                this.joy = Math.min(100, this.joy + 15);
                if (Math.random() < 0.1) addLog(this.name + ' feels energized after coffee!', false);
                break;
            case 'library':
                this.wisdom = Math.min(100, this.wisdom + 35);
                this.rest = Math.min(100, this.rest + 10);
                if (Math.random() < 0.1) addLog(this.name + ' learned something new!', false);
                break;
            case 'gym':
                this.exercise = Math.min(100, this.exercise + 45);
                this.rest = Math.max(0, this.rest - 8);
                if (Math.random() < 0.1) addLog(this.name + ' had a good workout!', false);
                break;
            case 'community_center':
                this.social = Math.min(100, this.social + 40);
                this.joy = Math.min(100, this.joy + 20);
                if (Math.random() < 0.1) addLog(this.name + ' made new friends!', false);
                break;
            case 'spa':
                this.cleanliness = Math.min(100, this.cleanliness + 60);
                this.rest = Math.min(100, this.rest + 20);
                this.joy = Math.min(100, this.joy + 15);
                if (Math.random() < 0.1) addLog(this.name + ' feels squeaky clean and relaxed!', false);
                break;
        }
        
        // Check if needs are satisfied enough to return to work
        const criticalNeeds = [
            this.hunger < 8, this.thirst < 8, this.rest < 8, 
            this.joy < 8, this.coffee < 5, this.cleanliness < 8
        ].filter(Boolean).length;
        if (criticalNeeds <= 0) {
            this.task = 'idle';
        }
    }
    
    updateSparkles() {
        this.sparkles = this.sparkles.filter(sparkle => {
            sparkle.life--;
            sparkle.y -= 1;
            return sparkle.life > 0;
        });
        if (this.goldCarried > 0 && Math.random() < 0.3) {
            this.sparkles.push({
                x: this.x + (Math.random() - 0.5) * 20,
                y: this.y + (Math.random() - 0.5) * 20,
                life: 20
            });
        }
    }
    
    shouldBuildRocket(gold) {
        for (let part in game.rocketParts) {
            const data = game.rocketParts[part];
            if (!data.built && !data.building && gold >= data.cost) {
                return part;
            }
        }
        return false;
    }
    
    shouldBuildInfrastructure(gold) {
        // Focus on useful buildings, not machines
        const buildingRatio = game.buildings.length / game.dworfs.length;
        // PRIORITY 1: Houses for rest (most important)
        if (gold >= 100 && buildingRatio < 0.8) {
            const restHouses = game.buildings.filter(b => b.type === 'amenity' && b.amenityType === 'house').length;
            const neededHouses = Math.ceil(game.dworfs.length / 2);
            if (restHouses < neededHouses) {
                return 'house';
            }
        }
        
        // PRIORITY 2: Coffee shops
        if (gold >= 120 && buildingRatio < 1.0) {
            const coffeeShops = game.buildings.filter(b => b.type === 'amenity' && b.amenityType === 'coffee_shop').length;
            const neededCoffee = Math.ceil(game.dworfs.length / 3);
            if (coffeeShops < neededCoffee) {
                return 'coffee_shop';
            }
        }
        
        // PRIORITY 3: Other amenities based on colony needs
        if (gold >= 100 && game.dworfs.length > 0) {
            const colonyAverages = this.calculateColonyAverages();
            const demandThreshold = 40;
            
            if (colonyAverages.joy < demandThreshold && gold >= 140) {
                const inns = game.buildings.filter(b => b.type === 'amenity' && b.amenityType === 'inn').length;
                if (inns < Math.ceil(game.dworfs.length / 4)) return 'inn';
            }
            
            if (colonyAverages.cleanliness < demandThreshold && gold >= 150) {
                const spas = game.buildings.filter(b => b.type === 'amenity' && b.amenityType === 'spa').length;
                if (spas < Math.ceil(game.dworfs.length / 4)) return 'spa';
            }
            
            if (colonyAverages.social < demandThreshold && gold >= 160) {
                const centers = game.buildings.filter(b => b.type === 'amenity' && b.amenityType === 'community_center').length;
                if (centers < Math.ceil(game.dworfs.length / 4)) return 'community_center';
            }
        }
        
        // PRIORITY 4: Basic buildings only if we have enough amenities
        if (gold >= 80 && buildingRatio < 0.6 && game.buildings.filter(b => b.type === 'amenity').length >= 2) {
            return 'building';
        }
        
        return false;
    }
    
    calculateColonyAverages() {
        if (game.dworfs.length === 0) return {};
        const totals = {
            hunger: 0, thirst: 0, rest: 0, joy: 0, art: 0, 
            coffee: 0, wisdom: 0, exercise: 0, social: 0, cleanliness: 0
        };
        game.dworfs.forEach(dwarf => {
            totals.hunger += dwarf.hunger;
            totals.thirst += dwarf.thirst;
            totals.rest += dwarf.rest;
            totals.joy += dwarf.joy;
            totals.art += dwarf.art;
            totals.coffee += dwarf.coffee;
            totals.wisdom += dwarf.wisdom;
            totals.exercise += dwarf.exercise;
            totals.social += dwarf.social;
            totals.cleanliness += dwarf.cleanliness;
        });
        const count = game.dworfs.length;
        return {
            hunger: totals.hunger / count,
            thirst: totals.thirst / count,
            rest: totals.rest / count,
            joy: totals.joy / count,
            art: totals.art / count,
            coffee: totals.coffee / count,
            wisdom: totals.wisdom / count,
            exercise: totals.exercise / count,
            social: totals.social / count,
            cleanliness: totals.cleanliness / count
        };
    }
    
    startRocketConstruction(part) {
        if (part) {
            this.task = 'building_rocket';
            this.workTimer = 600;
            this.rocketPart = part;
            this.targetX = canvas.width / 2;
            this.targetY = 100;
            
            game.rocketParts[part].building = true;
            game.gold -= game.rocketParts[part].cost;
            addLog('🚀 Starting ' + part + ' construction!', true);
        }
    }
    
    startInfrastructureConstruction(type) {
        if (type === 'building') {
            this.task = 'building_structure';
            this.workTimer = 400;
            this.targetX = Math.random() * (canvas.width - 100) + 50;
            this.targetY = Math.random() * (canvas.height - 100) + 50;
            game.gold -= 100;
        } else if (type && ['house', 'inn', 'museum', 'coffee_shop', 'library', 'gym', 'community_center', 'spa'].includes(type)) {
            this.task = 'building_amenity';
            this.amenityType = type;
            this.workTimer = 450;
            this.targetX = Math.random() * (canvas.width - 100) + 50;
            this.targetY = Math.random() * (canvas.height - 100) + 50;
            
            game.gold -= BUILDING_COSTS[type];
            addLog('🗏️ ' + this.name + ' is building a ' + BUILDING_NAMES[type] + ' for the colony!', true);
        }
    }
    
    findGoldDeposit() {
        if (game.goldDeposits.length === 0) {
            game.goldDeposits.push({
                x: Math.random() * (canvas.width - 100) + 50,
                y: Math.random() * (canvas.height - 100) + 50,
                gold: 50 + Math.random() * 100
            });
        }
        
        let nearest = game.goldDeposits[0];
        let minDist = Infinity;
        
        for (let i = 0; i < game.goldDeposits.length; i++) {
            const deposit = game.goldDeposits[i];
            const dist = Math.sqrt((this.x - deposit.x) * (this.x - deposit.x) + (this.y - deposit.y) * (this.y - deposit.y));
            if (dist < minDist) {
                minDist = dist;
                nearest = deposit;
            }
        }
        
        this.task = 'mining';
        this.target = nearest;
        this.targetX = nearest.x;
        this.targetY = nearest.y;
        this.workTimer = 60;
    }
    
    handleTask() {
        const healthModifier = this.getHealthModifier();
        const personalityWorkModifier = this.getPersonalityWorkModifier();
        
        switch (this.task) {
            case 'mining':
                this.workTimer--;
                if (this.workTimer <= 0) {
                    if (this.target && this.target.gold > 0) {
                        let mineAmount = Math.min(5, this.target.gold);
                        mineAmount *= healthModifier * personalityWorkModifier;
                        
                        this.target.gold -= mineAmount;
                        this.goldCarried += mineAmount;
                        if (this.target.gold <= 0) {
                            const index = game.goldDeposits.indexOf(this.target);
                            if (index > -1) game.goldDeposits.splice(index, 1);
                        }
                    }
                    
                    this.task = 'returning';
                    this.targetX = canvas.width / 2;
                    this.targetY = canvas.height / 2;
                    this.workTimer = 60;
                }
                break;
                
            case 'returning':
                if (this.goldCarried > 0) {
                    let goldToAdd = this.goldCarried * this.efficiency;
                    if (this.personality.agreeableness > 70) {
                        goldToAdd *= 1.2;
                        if (Math.random() < 0.05) {
                            addLog(this.name + ' generously shared extra resources!', false);
                        }
                    } else if (this.personality.agreeableness < 30) {
                        const stolenAmount = goldToAdd * 0.3;
                        goldToAdd *= 0.7;
                        
                        if (Math.random() < 0.1) {
                            addLog(this.name + ' secretly kept ' + Math.floor(stolenAmount) + ' gold!', false, 'disaster');
                        }
                    }
                    
                    // Personal Gold Vault steals from other dwarfs
                    const personalVaults = game.negativeBuildings.filter(b => b.type === 'personal_gold_vault');
                    if (personalVaults.length > 0) {
                        personalVaults.forEach(vault => {
                            if (vault.owner !== this.name) {
                                const stolen = goldToAdd * 0.2;
                                goldToAdd *= 0.8;
                                if (Math.random() < 0.1) {
                                    addLog('💰 ' + vault.owner + '\'s vault stole ' + Math.floor(stolen) + ' gold from ' + this.name + '!', false, 'disaster');
                                }
                            }
                        });
                    }
                    
                    game.gold += goldToAdd;
                    this.goldCarried = 0;
                }
                this.task = 'idle';
                break;
                
            case 'lazy_break':
            case 'panicking':
            case 'confused':
            case 'recovering':
            case 'avoiding_conflict':
            case 'nervous_breakdown':
            case 'work_refusal':
            case 'forced_party':
            case 'reproducing': // Handle the new reproducing state
                this.workTimer--;
                if (this.workTimer <= 0) {
                    if (this.task === 'reproducing') {
                        this.createNewDwarf();
                    } else {
                        this.task = 'idle';
                    }
                }
                break;
                
            case 'building_structure':
                this.workTimer--;
                if (this.personality.conscientiousness > 60) {
                    this.workTimer -= 0.5;
                }
                
                if (this.workTimer <= 0) {
                    game.buildings.push({
                        x: this.targetX,
                        y: this.targetY,
                        type: Math.random() < 0.5 ? 'house' : 'lab'
                    });
                    this.task = 'idle';
                    if (!game.milestones.firstBuilding) {
                        game.milestones.firstBuilding = true;
                        addLog('🏠 First city building completed by ' + this.name + '!', true);
                    }
                }
                break;
                
            case 'building_negative':
                this.workTimer--;
                if (this.personality.conscientiousness > 60) {
                    this.workTimer -= 0.5;
                }
                
                if (this.workTimer <= 0) {
                    game.negativeBuildings.push({
                        x: this.targetX,
                        y: this.targetY,
                        type: this.negativeType,
                        owner: this.name,
                        timer: 0
                    });
                    this.task = 'idle';
                    
                    const messages = {
                        'gold_mutation_chamber': this.name + ' completed their "research facility"!',
                        'motion_alarm_tower': this.name + ' finished their "safety system"!',
                        'party_pavilion': this.name + ' built a place for "team building"!',
                        'unsafe_mining_rig': this.name + ' rushed their mining equipment!',
                        'personal_gold_vault': this.name + ' secured their "savings account"!'
                    };
                    
                    addLog('💀 ' + messages[this.negativeType], true, 'disaster');
                }
                break;
                
            case 'building_rocket':
                this.workTimer--;
                const part = game.rocketParts[this.rocketPart];
                
                let workSpeed = 1;
                if (this.personality.conscientiousness > 70) workSpeed += 0.5;
                if (this.personality.openness > 70) workSpeed += 0.3;
                
                this.workTimer -= (workSpeed - 1);
                part.progress = 1 - (this.workTimer / 600);
                if (this.workTimer <= 0) {
                    part.built = true;
                    part.building = false;
                    part.progress = 1;
                    this.task = 'idle';
                    addLog('✅ ' + this.rocketPart + ' completed by ' + this.name + '!', true);
                    let allComplete = true;
                    for (let p in game.rocketParts) {
                        if (!game.rocketParts[p].built) {
                            allComplete = false;
                            break;
                        }
                    }
                    
                    if (allComplete) {
                        addLog('🎊 ROCKET COMPLETE! READY FOR LAUNCH!', true);
                        setTimeout(function() {
                            addLog('🚀 LAUNCHING TO OUTER SPACE!', true);
                        }, 2000);
                    }
                }
                break;
                
            case 'building_amenity':
                this.workTimer--;
                if (this.personality.conscientiousness > 60) {
                    this.workTimer -= 0.5;
                }
                
                if (this.workTimer <= 0) {
                    game.buildings.push({
                        x: this.targetX,
                        y: this.targetY,
                        type: 'amenity',
                        amenityType: this.amenityType
                    });
                    this.task = 'idle';
                    
                    addLog('✅ ' + BUILDING_NAMES[this.amenityType] + ' completed by ' + this.name + '!', true);
                }
                break;
        }
    }
    
    getPersonalityWorkModifier() {
        let modifier = 0.7 + (this.personality.conscientiousness / 200);
        if (stabilityLevel < 50) {
            modifier *= (1 - this.personality.neuroticism / 300);
        }
        
        return modifier;
    }
    
    draw() {
        const self = this;
        self.sparkles.forEach(function(sparkle) {
            ctx.fillStyle = 'rgba(255, 215, 0, ' + (sparkle.life / 20) + ')';
            ctx.fillRect(sparkle.x, sparkle.y, 2, 2);
        });
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(self.x - 6, self.y + 8, 12, 4);
        // Change dwarf color based on health
        let dwarfColor = self.color;
        if (self.hunger < 20 || self.thirst < 20) {
            dwarfColor = '#8B4513';
        }
        if (self.hunger < 5 || self.thirst < 5) {
            dwarfColor = '#696969';
        }
        
        ctx.fillStyle = dwarfColor;
        ctx.fillRect(self.x - 6, self.y - 8, 12, 16);
        
        ctx.fillStyle = '#FFDBAC';
        ctx.beginPath();
        ctx.arc(self.x, self.y - 10, 6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#000';
        ctx.fillRect(self.x - 2, self.y - 12, 1, 1);
        ctx.fillRect(self.x + 1, self.y - 12, 1, 1);
        // Hat color reflects personality (dominant trait)
        let hatColor = '#8B0000';
        const personality = self.personality;
        const maxTrait = Math.max(personality.openness, personality.conscientiousness, 
                                 personality.extraversion, personality.agreeableness, personality.neuroticism);
        if (maxTrait === personality.openness) hatColor = '#9370DB';
        else if (maxTrait === personality.conscientiousness) hatColor = '#008B8B';
        else if (maxTrait === personality.extraversion) hatColor = '#FFD700';
        else if (maxTrait === personality.agreeableness) hatColor = '#32CD32';
        else if (maxTrait === personality.neuroticism) hatColor = '#FF4500';
        
        ctx.fillStyle = hatColor;
        ctx.fillRect(self.x - 7, self.y - 17, 14, 5);
        
        // Show reproduction strategy as colored dot on hat
        let strategyColor = '#FFD700'; // Default yellow
        if (this.reproductionStrategy === 'orange') strategyColor = '#FF6600';
        else if (this.reproductionStrategy === 'blue') strategyColor = '#0066FF';
        else if (this.reproductionStrategy === 'yellow') strategyColor = '#FFFF00';
        
        ctx.fillStyle = strategyColor;
        ctx.beginPath();
        ctx.arc(self.x, self.y - 17, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw hunger bar (red) - only show when getting low
        if (self.hunger < 30) {
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(self.x - 8, self.y - 22, (self.hunger / 100) * 16, 2);
            ctx.strokeStyle = '#FFFFFF';
            ctx.strokeRect(self.x - 8, self.y - 22, 16, 2);
        }
        
        // Draw thirst bar (blue) - only show when getting low
        if (self.thirst < 30) {
            ctx.fillStyle = '#0066FF';
            ctx.fillRect(self.x - 8, self.y - 25, (self.thirst / 100) * 16, 2);
            ctx.strokeStyle = '#FFFFFF';
            ctx.strokeRect(self.x - 8, self.y - 25, 16, 2);
        }
        
        this.drawTaskIndicators();
        if (self.goldCarried > 0) {
            ctx.fillStyle = '#FFD700';
            ctx.font = '10px Arial';
            ctx.fillText('+' + Math.floor(self.goldCarried), self.x - 8, self.y - 35);
        }
        
        this.drawPersonalityIndicators();
    }
    
    drawTaskIndicators() {
        const self = this;
        switch (self.task) {
            case 'mining':
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(self.x + 8, self.y - 5, 8, 2);
                ctx.fillStyle = '#C0C0C0';
                ctx.fillRect(self.x + 14, self.y - 8, 3, 8);
                break;
            case 'building_machine':
            case 'building_structure':
            case 'building_rocket':
            case 'building_negative':
            case 'building_amenity':
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(self.x + 6, self.y - 6, 6, 2);
                ctx.fillStyle = '#696969';
                ctx.fillRect(self.x + 10, self.y - 8, 4, 6);
                if (self.workTimer > 0) {
                    const maxTimer = self.task === 'building_rocket' ? 600 : 
                                   self.task === 'building_machine' ? 300 : 
                                   self.task === 'building_negative' ? 350 : 
                                   self.task === 'building_amenity' ? 450 : 400;
                    const progress = 1 - (self.workTimer / maxTimer);
                    let progressColor = '#FFD700';
                    if (self.task === 'building_negative') progressColor = '#FF4444';
                    if (self.task === 'building_amenity') progressColor = '#4ECDC4';
                    
                    ctx.fillStyle = progressColor;
                    ctx.fillRect(self.x - 10, self.y - 30, 20 * progress, 3);
                }
                break;
            case 'seeking_sustenance':
                ctx.fillStyle = '#FF6B6B';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('🍞💧', self.x, self.y - 30);
                ctx.textAlign = 'left';
                break;
            case 'lazy_break':
                ctx.fillStyle = '#8B4513';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('😴', self.x, self.y - 30);
                ctx.textAlign = 'left';
                break;
            case 'panicking':
                const shakeX = (Math.random() - 0.5) * 4;
                const shakeY = (Math.random() - 0.5) * 4;
                ctx.fillStyle = '#FF4444';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('😰', self.x + shakeX, self.y - 30 + shakeY);
                ctx.textAlign = 'left';
                break;
            case 'confused':
                ctx.fillStyle = '#FFB347';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('❓', self.x, self.y - 30);
                ctx.textAlign = 'left';
                break;
            case 'recovering':
                ctx.fillStyle = '#FF6B6B';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('🤕', self.x, self.y - 30);
                ctx.textAlign = 'left';
                break;
            case 'avoiding_conflict':
                ctx.fillStyle = '#FFA500';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('🏃', self.x, self.y - 30);
                ctx.textAlign = 'left';
                break;
            case 'nervous_breakdown':
                const bigShakeX = (Math.random() - 0.5) * 8;
                const bigShakeY = (Math.random() - 0.5) * 8;
                ctx.fillStyle = '#8B0000';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('💀', self.x + bigShakeX, self.y - 30 + bigShakeY);
                ctx.textAlign = 'left';
                break;
            case 'work_refusal':
                ctx.fillStyle = '#8B0000';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('🚫', self.x, self.y - 30);
                ctx.textAlign = 'left';
                break;
            case 'forced_party':
                ctx.fillStyle = '#FF69B4';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('🕺', self.x, self.y - 30);
                ctx.textAlign = 'left';
                break;
            case 'seeking_amenities':
                ctx.fillStyle = '#4ECDC4';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('🏠', self.x, self.y - 30);
                ctx.textAlign = 'left';
                break;
            case 'reproducing':
                ctx.fillStyle = '#FF69B4';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('💕', self.x, self.y - 30);
                ctx.textAlign = 'left';
                break;
        }
    }
    
    drawPersonalityIndicators() {
        const self = this;
        if (self.personality.neuroticism > 80 && stabilityLevel < 50) {
            ctx.fillStyle = '#FF4444';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('😰', self.x, self.y - 40);
            ctx.textAlign = 'left';
        } else if (self.personality.agreeableness < 25 && Math.random() < 0.1) {
            ctx.fillStyle = '#FF6B6B';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('😠', self.x, self.y - 40);
            ctx.textAlign = 'left';
        } else if (self.personality.conscientiousness < 25 && self.task !== 'lazy_break' && Math.random() < 0.05) {
            ctx.fillStyle = '#FFA500';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('🤷', self.x, self.y - 40);
            ctx.textAlign = 'left';
        }
    }
}
