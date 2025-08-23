// Complete dwarf.js with ALL original features restored and syntax fixed
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
        
        // FIXED: Proper gender and age system
        this.gender = Math.random() < 0.5 ? 'male' : 'female';
        this.age = 0; // Age in game ticks
        this.maturityAge = 1800 + Math.random() * 1200; // 30-50 seconds to mature
        this.isAdult = false;
        
        // FIXED: Reproduction strategy only for males
        if (this.gender === 'male') {
            const strategies = ['orange', 'blue', 'yellow'];
            this.reproductionStrategy = strategies[Math.floor(Math.random() * strategies.length)];
        } else {
            this.reproductionStrategy = 'female';
        }
        
        // FIXED: Proper reproduction timers and state
        this.reproductionTimer = 0; // Cooldown between attempts
        this.reproductionCooldown = 7200; // 2 minutes minimum between pregnancies
        this.isPregnant = false;
        this.pregnancyTimer = 0;
        this.pregnancyDuration = 1800; // 30 seconds pregnancy
        this.partner = null;
        this.territory = null; // For orange males
        this.guardedMate = null; // For blue males
        this.guardedBy = null; // For females being guarded
        this.lastReproductionAttempt = 0;
        
        // Big Five personality traits (0-100 scale)
        this.personality = {
            openness: Math.random() * 100,
            conscientiousness: Math.random() * 100,
            extraversion: Math.random() * 100,
            agreeableness: Math.random() * 100,
            neuroticism: Math.random() * 100
        };

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
        // Age the dwarf
        this.age++;
        if (!this.isAdult && this.age >= this.maturityAge) {
            this.isAdult = true;
            addLog(this.name + ' has reached maturity! (' + this.gender + (this.gender === 'male' ? ', ' + this.reproductionStrategy : '') + ')', false, 'success');
        }
        
        // Handle pregnancy for females
        if (this.isPregnant) {
            this.pregnancyTimer--;
            if (this.pregnancyTimer <= 0) {
                this.giveBirth();
            }
        }
        
        // Reduce reproduction cooldown
        if (this.reproductionTimer > 0) {
            this.reproductionTimer--;
        }
        
        this.updateSparkles();
        this.updateSurvivalNeeds();
        this.applyPersonalityBehavior();
        
        // FIXED: Proper behavioral conflicts based on strategy
        if (this.isAdult) {
            this.updateReproductiveBehavior();
        }
        
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
    
    // FIXED: Proper reproductive behavior with conflicts
    updateReproductiveBehavior() {
        if (!this.isAdult || this.isPregnant) return;
        
        // Only check reproduction occasionally (much less frequent)
        if (Math.random() < 0.001) { // 0.1% chance per frame instead of every frame
            if (this.gender === 'male') {
                this.updateMaleBehavior();
            } else {
                this.updateFemaleBehavior();
            }
        }
        
        // Handle territorial and social conflicts
        this.handleSocialConflicts();
    }
    
    // FIXED: Male behavior based on strategy
    updateMaleBehavior() {
        const nearbyDwarfs = game.dworfs.filter(d => 
            d !== this && 
            d.isAdult &&
            Math.sqrt((d.x - this.x) ** 2 + (d.y - this.y) ** 2) < 120
        );
        
        switch (this.reproductionStrategy) {
            case 'orange':
                this.orangeMaleBehavior(nearbyDwarfs);
                break;
            case 'blue':
                this.blueMaleBehavior(nearbyDwarfs);
                break;
            case 'yellow':
                this.yellowMaleBehavior(nearbyDwarfs);
                break;
        }
    }
    
    // Orange males: Aggressive and territorial
    orangeMaleBehavior(nearbyDwarfs) {
        // Establish territory if don't have one
        if (!this.territory) {
            this.territory = {
                x: this.x,
                y: this.y,
                radius: 80 + Math.random() * 40
            };
            if (Math.random() < 0.3) {
                addLog('🟠 ' + this.name + ' established a territory!', false);
            }
        }
        
        // Chase away other males from territory
        const malesInTerritory = nearbyDwarfs.filter(d => 
            d.gender === 'male' && 
            d !== this &&
            Math.sqrt((d.x - this.territory.x) ** 2 + (d.y - this.territory.y) ** 2) < this.territory.radius
        );
        
        if (malesInTerritory.length > 0) {
            const intruder = malesInTerritory[0];
            this.chaseMale(intruder);
            return;
        }
        
        // Look for females in territory
        const femalesInTerritory = nearbyDwarfs.filter(d => 
            d.gender === 'female' && 
            !d.isPregnant &&
            d.reproductionTimer <= 0 &&
            Math.sqrt((d.x - this.territory.x) ** 2 + (d.y - this.territory.y) ** 2) < this.territory.radius
        );
        
        if (femalesInTerritory.length > 0 && this.reproductionTimer <= 0) {
            const female = femalesInTerritory[0];
            this.attemptMating(female);
        }
    }
    
    // Blue males: Cooperative and mate-guarding
    blueMaleBehavior(nearbyDwarfs) {
        // Look for a mate to guard
        if (!this.guardedMate || !this.guardedMate.isAdult || this.guardedMate.isPregnant) {
            const availableFemales = nearbyDwarfs.filter(d => 
                d.gender === 'female' && 
                !d.isPregnant &&
                d.reproductionTimer <= 0 &&
                !d.guardedBy
            );
            
            if (availableFemales.length > 0) {
                // Release previous mate if any
                if (this.guardedMate) {
                    this.guardedMate.guardedBy = null;
                }
                
                this.guardedMate = availableFemales[0];
                this.guardedMate.guardedBy = this;
                if (Math.random() < 0.3) {
                    addLog('🔵 ' + this.name + ' is now guarding ' + this.guardedMate.name, false);
                }
            }
        }
        
        // Guard mate from other males
        if (this.guardedMate) {
            const threateningMales = nearbyDwarfs.filter(d => 
                d.gender === 'male' && 
                d !== this &&
                Math.sqrt((d.x - this.guardedMate.x) ** 2 + (d.y - this.guardedMate.y) ** 2) < 60
            );
            
            if (threateningMales.length > 0) {
                // Move towards mate to guard her
                this.targetX = this.guardedMate.x;
                this.targetY = this.guardedMate.y;
                
                // Chase away threats
                const threat = threateningMales[0];
                this.chaseMale(threat);
                return;
            }
            
            // Attempt mating with guarded mate
            if (this.reproductionTimer <= 0) {
                this.attemptMating(this.guardedMate);
            }
        }
    }
    
    // Yellow males: Sneaky and opportunistic
    yellowMaleBehavior(nearbyDwarfs) {
        // Look for unguarded females or sneak around territories
        const potentialMates = nearbyDwarfs.filter(d => 
            d.gender === 'female' && 
            !d.isPregnant &&
            d.reproductionTimer <= 0
        );
        
        const guardedFemales = potentialMates.filter(f => f.guardedBy);
        const unguardedFemales = potentialMates.filter(f => !f.guardedBy);
        
        // Try to sneak mate with guarded females (risky but rewarding)
        if (guardedFemales.length > 0 && Math.random() < 0.3 && this.reproductionTimer <= 0) {
            const target = guardedFemales[0];
            const guard = target.guardedBy;
            
            // Check if guard is distracted or far away
            const guardDistance = Math.sqrt((guard.x - target.x) ** 2 + (guard.y - target.y) ** 2);
            if (guardDistance > 40) {
                this.attemptSneakyMating(target);
                return;
            }
        }
        
        // Mate with unguarded females
        if (unguardedFemales.length > 0 && this.reproductionTimer <= 0) {
            const female = unguardedFemales[0];
            this.attemptMating(female);
        }
    }
    
    // Female behavior - choose mates based on strategy and circumstances
    updateFemaleBehavior() {
        if (this.reproductionTimer > 0 || this.isPregnant) return;
        
        const nearbyMales = game.dworfs.filter(d => 
            d.gender === 'male' && 
            d.isAdult &&
            d.reproductionTimer <= 0 &&
            Math.sqrt((d.x - this.x) ** 2 + (d.y - this.y) ** 2) < 100
        );
        
        if (nearbyMales.length === 0) return;
        
        // Female choice based on male strategies and local conditions
        let preferredMale = null;
        let maxScore = 0;
        
        nearbyMales.forEach(male => {
            let score = 0;
            
            switch (male.reproductionStrategy) {
                case 'orange':
                    // Prefer territorial males when resources are scarce
                    if (game.goldDeposits.length < 2) score += 30;
                    if (male.territory) score += 20;
                    score += 10; // Base attractiveness
                    break;
                case 'blue':
                    // Prefer cooperative males when stability is low
                    if (stabilityLevel < 50) score += 25;
                    if (male.guardedMate === this) score += 15;
                    score += 15; // Base attractiveness
                    break;
                case 'yellow':
                    // Prefer sneaky males when population is dense
                    if (game.dworfs.length > 5) score += 20;
                    score += 5; // Lower base attractiveness
                    break;
            }
            
            // Personality compatibility
            if (Math.abs(this.personality.agreeableness - male.personality.agreeableness) < 30) score += 10;
            
            if (score > maxScore) {
                maxScore = score;
                preferredMale = male;
            }
        });
        
        // Sometimes accept mating attempts
        if (preferredMale && Math.random() < 0.1) {
            this.acceptMating(preferredMale);
        }
    }
    
    // Handle social conflicts between males
    handleSocialConflicts() {
        if (this.gender !== 'male' || !this.isAdult) return;
        
        const nearbyMales = game.dworfs.filter(d => 
            d.gender === 'male' && 
            d.isAdult &&
            d !== this &&
            Math.sqrt((d.x - this.x) ** 2 + (d.y - this.y) ** 2) < 80
        );
        
        nearbyMales.forEach(otherMale => {
            // Orange vs Blue conflict
            if (this.reproductionStrategy === 'orange' && otherMale.reproductionStrategy === 'blue') {
                if (Math.random() < 0.02) {
                    this.dominateMale(otherMale);
                }
            }
            
            // Blue vs Yellow conflict  
            if (this.reproductionStrategy === 'blue' && otherMale.reproductionStrategy === 'yellow') {
                if (Math.random() < 0.02) {
                    this.dominateMale(otherMale);
                }
            }
            
            // Yellow vs Orange conflict
            if (this.reproductionStrategy === 'yellow' && otherMale.reproductionStrategy === 'orange') {
                if (Math.random() < 0.02) {
                    this.avoidMale(otherMale);
                }
            }
        });
    }
    
    // Mating attempt methods
    attemptMating(female) {
        if (!female || female.isPregnant || female.reproductionTimer > 0) return;
        
        // Success rates based on strategy interactions
        let successRate = 0.1; // Base rate
        
        if (this.reproductionStrategy === 'orange') successRate = 0.3;
        else if (this.reproductionStrategy === 'blue') successRate = 0.25;
        else if (this.reproductionStrategy === 'yellow') successRate = 0.15;
        
        if (Math.random() < successRate) {
            this.successfulMating(female);
        } else {
            this.reproductionTimer = 600; // Short cooldown after failure
        }
    }
    
    attemptSneakyMating(guardedFemale) {
        const guard = guardedFemale.guardedBy;
        
        if (Math.random() < 0.2) { // Lower success but possible
            this.successfulMating(guardedFemale);
            addLog('🟡 ' + this.name + ' successfully sneaked past ' + guard.name + '!', false);
        } else {
            // Get caught!
            this.reproductionTimer = 1200;
            this.task = 'fleeing';
            this.workTimer = 300;
            addLog('🟡 ' + this.name + ' was caught sneaking by ' + guard.name + '!', false, 'disaster');
        }
    }
    
    acceptMating(male) {
        if (Math.random() < 0.5) {
            male.successfulMating(this);
        }
    }
    
    successfulMating(female) {
        female.isPregnant = true;
        female.pregnancyTimer = female.pregnancyDuration;
        female.partner = this;
        female.reproductionTimer = female.reproductionCooldown;
        this.reproductionTimer = this.reproductionCooldown;
        
        addLog('💕 ' + this.name + ' (' + this.reproductionStrategy + ') mated with ' + female.name, false, 'success');
    }
    
    giveBirth() {
        const baby = new Dworf(this.x + (Math.random() - 0.5) * 30, this.y + (Math.random() - 0.5) * 30);
        
        // Inherit traits from parents
        if (this.partner) {
            // Mix personality traits
            Object.keys(baby.personality).forEach(trait => {
                baby.personality[trait] = (this.personality[trait] + this.partner.personality[trait]) / 2 + (Math.random() - 0.5) * 40;
                baby.personality[trait] = Math.max(0, Math.min(100, baby.personality[trait]));
            });
            
            // Inherit reproduction strategy (males only)
            if (baby.gender === 'male') {
                if (Math.random() < 0.1) {
                    // 10% mutation rate
                    const strategies = ['orange', 'blue', 'yellow'];
                    baby.reproductionStrategy = strategies[Math.floor(Math.random() * strategies.length)];
                } else {
                    // Inherit from male parent
                    baby.reproductionStrategy = this.partner.reproductionStrategy;
                }
            }
        }
        
        game.dworfs.push(baby);
        this.isPregnant = false;
        this.partner = null;
        
        // Release from guarding if being guarded
        if (this.guardedBy) {
            this.guardedBy.guardedMate = null;
            this.guardedBy = null;
        }
        
        addLog('👶 ' + baby.name + ' was born! (' + baby.gender + (baby.gender === 'male' ? ', ' + baby.reproductionStrategy : '') + ')', true, 'success');
    }
    
    // Combat and social dominance methods
    chaseMale(target) {
        this.task = 'chasing';
        this.target = target;
        this.targetX = target.x;
        this.targetY = target.y;
        this.workTimer = 200;
        
        // Make target flee
        target.task = 'fleeing';
        target.workTimer = 300;
        target.targetX = target.x + (target.x - this.x) * 2;
        target.targetY = target.y + (target.y - this.y) * 2;
        
        if (Math.random() < 0.1) {
            addLog(this.reproductionStrategy + ' male ' + this.name + ' chased away ' + target.name, false);
        }
    }
    
    dominateMale(target) {
        target.efficiency *= 0.8;
        target.workTimer += 200;
        
        // Territory takeover for orange males
        if (this.reproductionStrategy === 'orange' && target.territory) {
            this.territory = target.territory;
            target.territory = null;
            addLog('🟠 ' + this.name + ' dominated ' + target.name + ' and took their territory!', false, 'disaster');
        }
        
        if (Math.random() < 0.1) {
            addLog(this.name + ' dominated ' + target.name + '!', false, 'disaster');
        }
    }
    
    avoidMale(dominant) {
        this.targetX = this.x + (this.x - dominant.x);
        this.targetY = this.y + (this.y - dominant.y);
        
        if (Math.random() < 0.05) {
            addLog('🟡 ' + this.name + ' avoided confrontation with ' + dominant.name, false);
        }
    }
    
    // Check if dwarf is in a special state that shouldn't be interrupted
    isInSpecialState() {
        const specialStates = [
            'lazy_break', 'panicking', 'confused', 'recovering', 
            'avoiding_conflict', 'nervous_breakdown', 'work_refusal', 'forced_party',
            'reproducing', 'chasing', 'fleeing', 'mating'
        ];
        return specialStates.includes(this.task);
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
            
            // NEGATIVE BUILDING CHECK - for problematic personalities
            const negativeType = this.shouldBuildNegativeBuilding(game.gold);
            if (negativeType) {
                taskOptions.push({
                    task: 'build_negative',
                    priority: TASK_PRIORITIES.INFRASTRUCTURE - 5, // Slightly lower than normal buildings
                    reason: 'Negative building urge: ' + negativeType,
                    data: negativeType
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
        
        // Execute the chosen task
        this.executeChosenTask(chosenTask);
    }
    
    // NEW: Check if dwarf should build negative buildings based on personality
    shouldBuildNegativeBuilding(gold) {
        if (!this.isAdult) return false;
        
        // Greedy dwarfs with low agreeableness want personal vaults
        if (this.personality.agreeableness < 20 && this.personality.conscientiousness > 60 && gold >= 300) {
            const existingVaults = game.negativeBuildings.filter(b => b.type === 'personal_gold_vault' && b.owner === this.name);
            if (existingVaults.length === 0) {
                return 'personal_gold_vault';
            }
        }
        
        // Paranoid/neurotic dwarfs want motion alarms
        if (this.personality.neuroticism > 75 && this.personality.conscientiousness > 50 && gold >= 250) {
            const existingAlarms = game.negativeBuildings.filter(b => b.type === 'motion_alarm_tower');
            if (existingAlarms.length === 0) {
                return 'motion_alarm_tower';
            }
        }
        
        // Extraverted but disagreeable dwarfs want party pavilions
        if (this.personality.extraversion > 70 && this.personality.agreeableness < 30 && gold >= 400) {
            const existingPavilions = game.negativeBuildings.filter(b => b.type === 'party_pavilion');
            if (existingPavilions.length === 0) {
                return 'party_pavilion';
            }
        }
        
        // Open but unconscientious dwarfs build unsafe mining rigs
        if (this.personality.openness > 60 && this.personality.conscientiousness < 30 && gold >= 200) {
            const existingRigs = game.negativeBuildings.filter(b => b.type === 'unsafe_mining_rig');
            if (existingRigs.length < 2) {
                return 'unsafe_mining_rig';
            }
        }
        
        // Highly open dwarfs might build gold mutation chambers
        if (this.personality.openness > 80 && this.personality.neuroticism > 60 && gold >= 350) {
            const existingChambers = game.negativeBuildings.filter(b => b.type === 'gold_mutation_chamber');
            if (existingChambers.length === 0) {
                return 'gold_mutation_chamber';
            }
        }
        
        return false;
    }
    
    // Execute the task chosen by the priority system - SPAM REDUCED
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
            case 'build_negative':
                this.startNegativeBuildingConstruction(chosenTask.data);
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
        
        // REDUCED: Debug logging only occasionally and for important decisions
        if (Math.random() < 0.005 && chosenTask.task !== 'idle' && chosenTask.task !== 'mining') {
            addLog(this.name + ' chose: ' + chosenTask.reason, false);
        }
    }
    
    // NEW: Start construction of negative buildings
    startNegativeBuildingConstruction(type) {
        if (!this.isAdult) return;
        
        const costs = {
            'gold_mutation_chamber': 350,
            'motion_alarm_tower': 250,
            'party_pavilion': 400,
            'unsafe_mining_rig': 200,
            'personal_gold_vault': 300
        };
        
        if (game.gold >= costs[type]) {
            this.task = 'building_negative';
            this.negativeType = type;
            this.workTimer = 600;
            this.targetX = Math.random() * (canvas.width - 100) + 50;
            this.targetY = Math.random() * (canvas.height - 100) + 50;
            
            game.gold -= costs[type];
            
            const messages = {
                'gold_mutation_chamber': this.name + ' is building a "research facility"...',
                'motion_alarm_tower': this.name + ' is installing a "safety system"...',
                'party_pavilion': this.name + ' is constructing a "team building space"...',
                'unsafe_mining_rig': this.name + ' is rushing to build mining equipment...',
                'personal_gold_vault': this.name + ' is securing a "savings account"...'
            };
            
            addLog('⚠️ ' + messages[type], true, 'disaster');
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
    
    // SPAM REDUCED: Less frequent "couldn't find" messages
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
            // REDUCED: Only occasionally log when can't find food
            if (Math.random() < 0.01) {
                addLog(this.name + ' couldn\'t find any sustenance sources!', false, 'disaster');
            }
        }
    }
    
    // SPAM REDUCED: Less frequent "feels refreshed" messages
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
            // REDUCED: Only log satisfaction message rarely
            if (Math.random() < 0.02) {
                addLog(this.name + ' feels refreshed and ready to work!', false);
            }
        }
    }
    
    // ENHANCED: Complex personality effects that can cause major disruptions
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
        
        // NEW: Additional complex personality behaviors
        
        // Lazy dwarf behavior - unconscientious dwarfs take breaks
        if (this.personality.conscientiousness < 25 && Math.random() < 0.005 && this.task !== 'lazy_break') {
            this.task = 'lazy_break';
            this.workTimer = 300 + Math.random() * 300;
            if (Math.random() < 0.1) {
                addLog(this.name + ' decided to take a break from work...', false);
            }
        }
        
        // Neurotic breakdown under stress
        if (this.personality.neuroticism > 85 && (this.hunger < 20 || this.thirst < 20 || stabilityLevel < 30)) {
            if (Math.random() < 0.002) {
                this.task = 'nervous_breakdown';
                this.workTimer = 600;
                this.efficiency *= 0.1;
                addLog(this.name + ' is having a nervous breakdown!', true, 'disaster');
            }
        }
        
        // Disagreeable dwarfs refuse orders
        if (this.personality.agreeableness < 20 && Math.random() < 0.001) {
            this.task = 'work_refusal';
            this.workTimer = 200;
            if (Math.random() < 0.1) {
                addLog(this.name + ' refuses to follow colony priorities!', false, 'disaster');
            }
        }
        
        // Open but chaotic dwarfs get confused
        if (this.personality.openness > 70 && this.personality.conscientiousness < 30) {
            if (Math.random() < 0.003) {
                this.task = 'confused';
                this.workTimer = 180;
                this.targetX = Math.random() * canvas.width;
                this.targetY = Math.random() * canvas.height;
                if (Math.random() < 0.1) {
                    addLog(this.name + ' got distracted and confused!', false);
                }
            }
        }
        
        // Extroverted but disagreeable dwarfs cause conflicts
        if (this.personality.extraversion > 60 && this.personality.agreeableness < 30) {
            if (Math.random() < 0.001) {
                const nearby = game.dworfs.filter(d => 
                    d !== this && Math.sqrt((d.x - this.x) ** 2 + (d.y - this.y) ** 2) < 100
                );
                if (nearby.length > 0) {
                    this.task = 'avoiding_conflict';
                    this.workTimer = 150;
                    if (Math.random() < 0.1) {
                        addLog(this.name + ' is causing social tension!', false, 'disaster');
                    }
                }
            }
        }
        
        // Contamination behavior for very disagreeable dwarfs
        if (this.personality.agreeableness < 15 && this.personality.conscientiousness < 20) {
            if (Math.random() < 0.0005) {
                // Contaminate food sources
                if (game.foodSources.length > 0 && Math.random() < 0.5) {
                    const source = game.foodSources[Math.floor(Math.random() * game.foodSources.length)];
                    source.amount = Math.max(0, source.amount - 10);
                    addLog(this.name + ' contaminated food supplies!', true, 'disaster');
                }
                // Contaminate water sources  
                if (game.waterSources.length > 0 && Math.random() < 0.5) {
                    const source = game.waterSources[Math.floor(Math.random() * game.waterSources.length)];
                    source.amount = Math.max(0, source.amount - 15);
                    addLog(this.name + ' polluted water supplies!', true, 'disaster');
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
                default: urgency = 5;
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
    
    // SPAM REDUCED: Much less frequent amenity satisfaction messages
    useAmenity(building) {
        // Much more effective amenities
        switch (building.amenityType) {
            case 'house':
                this.rest = Math.min(100, this.rest + 40);
                if (Math.random() < 0.05) addLog(this.name + ' feels well-rested after sleeping!', false);
                break;
            case 'inn':
                this.joy = Math.min(100, this.joy + 30);
                this.social = Math.min(100, this.social + 20);
                if (Math.random() < 0.05) addLog(this.name + ' had a great time at the inn!', false);
                break;
                
            case 'museum':
                this.art = Math.min(100, this.art + 25);
                this.wisdom = Math.min(100, this.wisdom + 15);
                if (Math.random() < 0.05) addLog(this.name + ' was inspired by beautiful art!', false);
                break;
            case 'coffee_shop':
                this.coffee = Math.min(100, this.coffee + 50);
                this.joy = Math.min(100, this.joy + 15);
                if (Math.random() < 0.05) addLog(this.name + ' feels energized after coffee!', false);
                break;
            case 'library':
                this.wisdom = Math.min(100, this.wisdom + 35);
                this.rest = Math.min(100, this.rest + 10);
                if (Math.random() < 0.05) addLog(this.name + ' learned something new!', false);
                break;
            case 'gym':
                this.exercise = Math.min(100, this.exercise + 45);
                this.rest = Math.max(0, this.rest - 8);
                if (Math.random() < 0.05) addLog(this.name + ' had a good workout!', false);
                break;
            case 'community_center':
                this.social = Math.min(100, this.social + 40);
                this.joy = Math.min(100, this.joy + 20);
                if (Math.random() < 0.05) addLog(this.name + ' made new friends!', false);
                break;
            case 'spa':
                this.cleanliness = Math.min(100, this.cleanliness + 60);
                this.rest = Math.min(100, this.rest + 20);
                this.joy = Math.min(100, this.joy + 15);
                if (Math.random() < 0.05) addLog(this.name + ' feels squeaky clean and relaxed!', false);
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
        // Only adults should build rockets
        if (!this.isAdult) return false;
        
        for (let part in game.rocketParts) {
            const data = game.rocketParts[part];
            if (!data.built && !data.building && gold >= data.cost) {
                return part;
            }
        }
        return false;
    }
    
    shouldBuildInfrastructure(gold) {
        // Only adults should build infrastructure
        if (!this.isAdult) return false;
        
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
        if (part && this.isAdult) {
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
        if (!this.isAdult) return;
        
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
                
            // NEW: Reproductive behavior states
            case 'chasing':
                this.workTimer--;
                if (this.target) {
                    // Keep chasing the target
                    this.targetX = this.target.x;
                    this.targetY = this.target.y;
                    
                    // Stop chasing after timer runs out
                    if (this.workTimer <= 0) {
                        this.task = 'idle';
                        this.target = null;
                    }
                } else {
                    this.task = 'idle';
                }
                break;
                
            case 'fleeing':
                this.workTimer--;
                // Keep running away
                if (this.workTimer <= 0) {
                    this.task = 'idle';
                }
                break;
                
            case 'mating':
                this.workTimer--;
                if (this.workTimer <= 0) {
                    this.task = 'idle';
                }
                break;
                
            case 'lazy_break':
            case 'panicking':
            case 'confused':
            case 'recovering':
            case 'avoiding_conflict':
            case 'nervous_breakdown':
            case 'work_refusal':
            case 'forced_party':
            case 'reproducing': // Keep for compatibility but less used now
                this.workTimer--;
                if (this.workTimer <= 0) {
                    if (this.task === 'reproducing') {
                        // Legacy reproduction handling
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
    
    // Legacy method for compatibility
    createNewDwarf() {
        const baby = new Dworf(this.x + (Math.random() - 0.5) * 40, this.y + (Math.random() - 0.5) * 40);
        game.dworfs.push(baby);
        addLog('👶 A new dwarf, ' + baby.name + ', has been born! (' + baby.gender + (baby.gender === 'male' ? ', ' + baby.reproductionStrategy : '') + ')', true, 'success');
        this.task = 'idle';
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
        
        // Draw sparkles
        self.sparkles.forEach(function(sparkle) {
            ctx.fillStyle = 'rgba(255, 215, 0, ' + (sparkle.life / 20) + ')';
            ctx.fillRect(sparkle.x, sparkle.y, 2, 2);
        });
        
        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(self.x - 6, self.y + 8, 12, 4);
        
        // Change dwarf color based on health and age
        let dwarfColor = self.color;
        
        // Age-based color adjustments
        if (!self.isAdult) {
            dwarfColor = '#FFB6C1'; // Pink for children
        } else if (self.hunger < 20 || self.thirst < 20) {
            dwarfColor = '#8B4513';
        } else if (self.hunger < 5 || self.thirst < 5) {
            dwarfColor = '#696969';
        }
        
        // Pregnancy glow for females
        if (self.isPregnant) {
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = 15;
        }
        
        // Body (scaled for children)
        const bodyScale = self.isAdult ? 1 : 0.7;
        const bodyWidth = 12 * bodyScale;
        const bodyHeight = 16 * bodyScale;
        
        ctx.fillStyle = dwarfColor;
        ctx.fillRect(self.x - bodyWidth/2, self.y - bodyHeight/2, bodyWidth, bodyHeight);
        
        // Head (scaled for children)
        const headRadius = 6 * bodyScale;
        ctx.fillStyle = '#FFDBAC';
        ctx.beginPath();
        ctx.arc(self.x, self.y - 10 * bodyScale, headRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes
        const eyeOffset = 2 * bodyScale;
        const eyeY = self.y - 12 * bodyScale;
        ctx.fillStyle = '#000';
        ctx.fillRect(self.x - eyeOffset, eyeY, 1, 1);
        ctx.fillRect(self.x + eyeOffset - 1, eyeY, 1, 1);
        
        // Reset shadow
        ctx.shadowBlur = 0;
        
        // Hat with gender and strategy indicators
        this.drawHat();
        
        // Draw status bars
        this.drawStatusBars();
        
        // Draw task indicators
        this.drawTaskIndicators();
        
        // Draw gold carried
        if (self.goldCarried > 0) {
            ctx.fillStyle = '#FFD700';
            ctx.font = '10px Arial';
            ctx.fillText('+' + Math.floor(self.goldCarried), self.x - 8, self.y - 35);
        }
        
        // Draw personality and behavioral indicators
        this.drawPersonalityIndicators();
        
        // Draw territorial boundaries for orange males
        this.drawTerritorialIndicators();
    }
    
    drawHat() {
        const bodyScale = this.isAdult ? 1 : 0.7;
        const hatY = this.y - 17 * bodyScale;
        const hatWidth = 14 * bodyScale;
        const hatHeight = 5 * bodyScale;
        
        // Hat color reflects personality (dominant trait)
        let hatColor = '#8B0000';
        const personality = this.personality;
        const maxTrait = Math.max(personality.openness, personality.conscientiousness, 
                                 personality.extraversion, personality.agreeableness, personality.neuroticism);
        if (maxTrait === personality.openness) hatColor = '#9370DB';
        else if (maxTrait === personality.conscientiousness) hatColor = '#008B8B';
        else if (maxTrait === personality.extraversion) hatColor = '#FFD700';
        else if (maxTrait === personality.agreeableness) hatColor = '#32CD32';
        else if (maxTrait === personality.neuroticism) hatColor = '#FF4500';
        
        ctx.fillStyle = hatColor;
        ctx.fillRect(this.x - hatWidth/2, hatY, hatWidth, hatHeight);
        
        // Gender indicator on left side of hat
        ctx.fillStyle = this.gender === 'male' ? '#4169E1' : '#FF69B4';
        ctx.beginPath();
        ctx.arc(this.x - 4 * bodyScale, hatY + 2, 2 * bodyScale, 0, Math.PI * 2);
        ctx.fill();
        
        // Reproduction strategy indicator on right side (males only)
        if (this.gender === 'male' && this.reproductionStrategy && this.reproductionStrategy !== 'female') {
            let strategyColor = '#FFD700';
            if (this.reproductionStrategy === 'orange') strategyColor = '#FF6600';
            else if (this.reproductionStrategy === 'blue') strategyColor = '#0066FF';
            else if (this.reproductionStrategy === 'yellow') strategyColor = '#FFFF00';
            
            ctx.fillStyle = strategyColor;
            ctx.beginPath();
            ctx.arc(this.x + 4 * bodyScale, hatY + 2, 2 * bodyScale, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Age indicator (small line for adults, no line for children)
        if (this.isAdult) {
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(this.x - 2, hatY + hatHeight + 1);
            ctx.lineTo(this.x + 2, hatY + hatHeight + 1);
            ctx.stroke();
        }
    }
    
    drawStatusBars() {
        const bodyScale = this.isAdult ? 1 : 0.7;
        let barY = this.y - 22 * bodyScale;
        
        // Pregnancy indicator for pregnant females
        if (this.isPregnant) {
            const pregnancyProgress = 1 - (this.pregnancyTimer / this.pregnancyDuration);
            ctx.fillStyle = '#FF69B4';
            ctx.fillRect(this.x - 8, barY, 16 * pregnancyProgress, 2);
            ctx.strokeStyle = '#FFFFFF';
            ctx.strokeRect(this.x - 8, barY, 16, 2);
            barY -= 3;
        }
        
        // Maturity indicator for children
        if (!this.isAdult) {
            const maturityProgress = this.age / this.maturityAge;
            ctx.fillStyle = '#90EE90';
            ctx.fillRect(this.x - 8, barY, 16 * maturityProgress, 2);
            ctx.strokeStyle = '#FFFFFF';
            ctx.strokeRect(this.x - 8, barY, 16, 2);
            barY -= 3;
        }
        
        // Draw hunger bar (red) - only show when getting low
        if (this.hunger < 30) {
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(this.x - 8, barY, (this.hunger / 100) * 16, 2);
            ctx.strokeStyle = '#FFFFFF';
            ctx.strokeRect(this.x - 8, barY, 16, 2);
            barY -= 3;
        }
        
        // Draw thirst bar (blue) - only show when getting low
        if (this.thirst < 30) {
            ctx.fillStyle = '#0066FF';
            ctx.fillRect(this.x - 8, barY, (this.thirst / 100) * 16, 2);
            ctx.strokeStyle = '#FFFFFF';
            ctx.strokeRect(this.x - 8, barY, 16, 2);
        }
    }
    
    drawTaskIndicators() {
        const self = this;
        let indicator = '';
        let color = '#FFFFFF';
        
        switch (self.task) {
            case 'mining':
                // Draw pickaxe
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(self.x + 8, self.y - 5, 8, 2);
                ctx.fillStyle = '#C0C0C0';
                ctx.fillRect(self.x + 14, self.y - 8, 3, 8);
                return;
                
            case 'chasing':
                indicator = '⚔️'; color = '#FF4444';
                break;
            case 'fleeing':
                indicator = '💨'; color = '#FFB347';
                break;
            case 'mating':
            case 'reproducing':
                indicator = '💕'; color = '#FF69B4';
                break;
            case 'seeking_sustenance':
                indicator = '🍞💧'; color = '#FF6B6B';
                break;
            case 'lazy_break':
                indicator = '😴'; color = '#8B4513';
                break;
            case 'panicking':
                const shakeX = (Math.random() - 0.5) * 4;
                const shakeY = (Math.random() - 0.5) * 4;
                indicator = '😰'; color = '#FF4444';
                ctx.save();
                ctx.translate(shakeX, shakeY);
                break;
            case 'confused':
                indicator = '❓'; color = '#FFB347';
                break;
            case 'recovering':
                indicator = '🤕'; color = '#FF6B6B';
                break;
            case 'seeking_amenities':
                indicator = '🏠'; color = '#4ECDC4';
                break;
            case 'nervous_breakdown':
                indicator = '💀'; color = '#8B0000';
                break;
            case 'work_refusal':
                indicator = '🚫'; color = '#FF4444';
                break;
            case 'avoiding_conflict':
                indicator = '🏃'; color = '#FFB347';
                break;
            default:
                return;
        }
        
        if (indicator) {
            ctx.fillStyle = color;
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(indicator, self.x, self.y - 30);
            ctx.textAlign = 'left';
            
            if (self.task === 'panicking') {
                ctx.restore();
            }
        }
    }
    
    drawTerritorialIndicators() {
        // Draw territory boundaries for orange males
        if (this.gender === 'male' && 
            this.reproductionStrategy === 'orange' && 
            this.territory && 
            Math.random() < 0.1) { // Only occasionally visible
            
            ctx.strokeStyle = 'rgba(255, 102, 0, 0.3)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.arc(this.territory.x, this.territory.y, this.territory.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }
        
        // Draw mate guarding indicator for blue males
        if (this.gender === 'male' && 
            this.reproductionStrategy === 'blue' && 
            this.guardedMate) {
            
            ctx.strokeStyle = 'rgba(0, 102, 255, 0.5)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.guardedMate.x, this.guardedMate.y);
            ctx.stroke();
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
