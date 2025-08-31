// Complete Dwarf class with FIXED building system - ALL original features preserved

class Dwarf {
    constructor(x, y, name = null, isAdult = true) {
        this.x = x;
        this.y = y;
        this.name = name || this.generateName();
        this.isAdult = isAdult;
        this.gender = Math.random() < 0.5 ? 'male' : 'female';
        
        // Basic needs - balanced rates
        this.hunger = 80 + Math.random() * 20;
        this.thirst = 80 + Math.random() * 20;
        this.rest = 70 + Math.random() * 30;
        this.joy = 60 + Math.random() * 40;
        this.coffee = 50 + Math.random() * 50;
        this.cleanliness = 70 + Math.random() * 30;
        
        // Personality traits (Big Five model)
        this.personality = {
            openness: Math.random() * 100,
            conscientiousness: Math.random() * 100,
            extraversion: Math.random() * 100,
            agreeableness: Math.random() * 100,
            neuroticism: Math.random() * 100
        };
        
        // Reproduction system with mating strategies
        this.reproductionStrategy = this.gender === 'male' ? 
            ['orange', 'blue', 'yellow'][Math.floor(Math.random() * 3)] : null;
        this.isPregnant = false;
        this.pregnancyTimer = 0;
        this.maturityTimer = isAdult ? 0 : Math.random() * 1800;
        this.reproductionCooldown = 0;
        this.territoryX = x;
        this.territoryY = y;
        this.guardedFemale = null;
        this.mateSeekingTimer = 0;
        
        // Work and behavior
        this.task = 'idle';
        this.workTimer = 0;
        this.efficiency = 0.8 + Math.random() * 0.4;
        this.targetX = x;
        this.targetY = y;
        this.speed = 0.5 + Math.random() * 0.5;
        
        // Special construction states
        this.rocketPart = null;
        this.amenityType = null;
        this.negativeType = null;
        
        // Personality states
        this.panicLevel = 0;
        this.confusionLevel = 0;
        this.lastTaskFailed = false;
        this.personalityState = 'normal';
        
        // Visual and animation
        this.direction = Math.random() * Math.PI * 2;
        this.animPhase = Math.random() * Math.PI * 2;
        this.lastDecisionLog = '';
        
        // Decision making cooldowns
        this.lastTaskChange = 0;
        this.taskConsistency = 0;
    }
    
    generateName() {
        const names = [
            'Gimli', 'Thorin', 'Balin', 'Dwalin', 'Fili', 'Kili', 
            'Gloin', 'Oin', 'Ori', 'Nori', 'Dori', 'Bifur', 'Bofur', 'Bombur',
            'Grilda', 'Vera', 'Nala', 'Breta', 'Kira', 'Mira', 'Dara', 'Lila'
        ];
        return names[Math.floor(Math.random() * names.length)] + '_' + Math.floor(Math.random() * 100);
    }
    
    update() {
        // Age and maturity system
        if (!this.isAdult) {
            this.maturityTimer++;
            if (this.maturityTimer >= 1800) {
                this.isAdult = true;
                addLog(`👤 ${this.name} has reached maturity!`, true);
            }
        }
        
        // Pregnancy system
        if (this.isPregnant) {
            this.pregnancyTimer++;
            if (this.pregnancyTimer >= 3600) { // 1 minute pregnancy
                this.giveBirth();
            }
        }
        
        // Cooldowns
        if (this.reproductionCooldown > 0) this.reproductionCooldown--;
        if (this.mateSeekingTimer > 0) this.mateSeekingTimer--;
        if (this.workTimer > 0) this.workTimer--;
        
        // Needs decay - much slower rates as requested
        if (game.time % 4 === 0) {
            this.hunger = Math.max(0, this.hunger - 0.06);
            this.thirst = Math.max(0, this.thirst - 0.08);
            this.rest = Math.max(0, this.rest - 0.04);
            this.joy = Math.max(0, this.joy - 0.03);
            this.coffee = Math.max(0, this.coffee - 0.025);
            this.cleanliness = Math.max(0, this.cleanliness - 0.035);
        }
        
        // Personality state updates
        this.updatePersonalityState();
        
        // Reproduction behavior for adults
        if (this.isAdult && this.reproductionCooldown <= 0) {
            this.updateReproductionBehavior();
        }
        
        // Task management with priority system
        this.updateTask();
        this.executeTask();
        this.move();
        
        this.animPhase += 0.1;
    }
    
    updatePersonalityState() {
        // Handle panic and confusion
        if (this.panicLevel > 0) this.panicLevel = Math.max(0, this.panicLevel - 1);
        if (this.confusionLevel > 0) this.confusionLevel = Math.max(0, this.confusionLevel - 1);
        
        // Motion-induced panic
        if (lastMotionDetected > 0 && (Date.now() - lastMotionDetected) < 2000) {
            if (this.personality.neuroticism > 60 && Math.random() < 0.1) {
                this.panicLevel = Math.min(100, this.panicLevel + 5);
                if (this.panicLevel > 50 && this.personalityState !== 'panicking') {
                    this.personalityState = 'panicking';
                    this.task = 'panicking';
                    this.workTimer = 120;
                }
            }
        }
        
        // Personality-based state changes
        if (this.personalityState === 'normal') {
            if (this.personality.neuroticism > 80 && Math.random() < 0.001) {
                this.personalityState = 'anxious';
            } else if (this.personality.conscientiousness < 20 && Math.random() < 0.0008) {
                this.personalityState = 'lazy';
            } else if (this.personality.openness > 85 && Math.random() < 0.0005) {
                this.personalityState = 'creative_burst';
            }
        } else {
            // Recovery from personality states
            if (Math.random() < 0.01) {
                this.personalityState = 'normal';
            }
        }
    }
    
    updateReproductionBehavior() {
        if (!this.isAdult || this.reproductionCooldown > 0) return;
        
        if (this.gender === 'male' && this.mateSeekingTimer <= 0) {
            this.seekMating();
        } else if (this.gender === 'female' && !this.isPregnant) {
            this.evaluateMales();
        }
    }
    
    seekMating() {
        const availableFemales = game.dworfs.filter(d => 
            d.isAdult && d.gender === 'female' && !d.isPregnant && d.reproductionCooldown <= 0
        );
        
        if (availableFemales.length === 0) return;
        
        const target = availableFemales[Math.floor(Math.random() * availableFemales.length)];
        
        switch (this.reproductionStrategy) {
            case 'orange': // Territorial
                this.establishTerritory(target);
                break;
            case 'blue': // Cooperative/Guard
                this.guardFemale(target);
                break;
            case 'yellow': // Sneaky
                this.sneakyMating(target);
                break;
        }
    }
    
    establishTerritory(female) {
        // Orange males establish territories around females
        const distance = this.distanceTo(female);
        if (distance < 80) {
            this.territoryX = female.x;
            this.territoryY = female.y;
            
            // Chase away other males
            const competitors = game.dworfs.filter(d => 
                d.gender === 'male' && d !== this && d.distanceTo(female) < 60
            );
            
            competitors.forEach(competitor => {
                if (Math.random() < 0.1) {
                    competitor.task = 'fleeing';
                    competitor.workTimer = 180;
                    competitor.targetX = this.x < competitor.x ? canvas.width : 0;
                    competitor.targetY = this.y < competitor.y ? canvas.height : 0;
                }
            });
            
            // Attempt mating if close enough
            if (distance < 25 && Math.random() < 0.02) {
                this.attemptMating(female);
            }
        }
        
        this.mateSeekingTimer = 300; // 5 second cooldown
    }
    
    guardFemale(female) {
        // Blue males guard specific females
        this.guardedFemale = female;
        this.targetX = female.x + Math.random() * 40 - 20;
        this.targetY = female.y + Math.random() * 40 - 20;
        
        const distance = this.distanceTo(female);
        if (distance < 30 && Math.random() < 0.015) {
            this.attemptMating(female);
        }
        
        this.mateSeekingTimer = 240; // 4 second cooldown
    }
    
    sneakyMating(female) {
        // Yellow males use stealth and opportunism
        const distance = this.distanceTo(female);
        
        // Check if other males are guarding/near this female
        const guardsNearby = game.dworfs.filter(d => 
            d.gender === 'male' && d !== this && d.distanceTo(female) < 50
        ).length > 0;
        
        if (!guardsNearby && distance < 35) {
            // Quick opportunistic mating attempt
            if (Math.random() < 0.025) {
                this.attemptMating(female);
            }
        } else if (guardsNearby) {
            // Wait and watch from distance
            this.targetX = female.x + Math.random() * 100 - 50;
            this.targetY = female.y + Math.random() * 100 - 50;
        }
        
        this.mateSeekingTimer = 180; // 3 second cooldown
    }
    
    evaluateMales() {
        if (this.isPregnant) return;
        
        const nearbyMales = game.dworfs.filter(d => 
            d.isAdult && d.gender === 'male' && d.distanceTo(this) < 40
        );
        
        if (nearbyMales.length > 0) {
            // Females have preferences based on personality
            const preferred = this.selectPreferredMale(nearbyMales);
            if (preferred && Math.random() < 0.008) {
                this.acceptMating(preferred);
            }
        }
    }
    
    selectPreferredMale(males) {
        // Female mate selection based on personality and male strategy
        let scored = males.map(male => ({
            male: male,
            score: this.scoreMate(male)
        }));
        
        scored.sort((a, b) => b.score - a.score);
        return scored.length > 0 ? scored[0].male : null;
    }
    
    scoreMate(male) {
        let score = 50; // Base score
        
        // Strategy preferences
        if (this.personality.agreeableness > 60) {
            // Agreeable females prefer cooperative blues
            if (male.reproductionStrategy === 'blue') score += 30;
            if (male.reproductionStrategy === 'orange') score -= 10;
        }
        
        if (this.personality.openness > 70) {
            // Open females might prefer sneaky yellows
            if (male.reproductionStrategy === 'yellow') score += 20;
        }
        
        if (this.personality.neuroticism < 40) {
            // Calm females can handle territorial oranges
            if (male.reproductionStrategy === 'orange') score += 25;
        }
        
        return score + Math.random() * 20; // Add randomness
    }
    
    attemptMating(female) {
        if (female.reproductionCooldown > 0 || female.isPregnant) return false;
        
        const success = Math.random() < 0.7; // 70% success rate
        if (success) {
            female.isPregnant = true;
            female.pregnancyTimer = 0;
            female.reproductionCooldown = 7200; // 2 minute cooldown
            this.reproductionCooldown = 3600; // 1 minute male cooldown
            
            addLog(`💕 ${this.name} (${this.reproductionStrategy}) and ${female.name} are expecting!`, true, 'success');
            return true;
        }
        return false;
    }
    
    acceptMating(male) {
        return male.attemptMating(this);
    }
    
    updateTask() {
        if (this.workTimer > 0) return; // Continue current task
        
        // Handle special personality states
        if (this.personalityState === 'panicking' && this.panicLevel > 30) {
            this.task = 'panicking';
            this.workTimer = 60;
            return;
        }
        
        if (this.personalityState === 'lazy' && Math.random() < 0.3) {
            this.task = 'idle';
            this.workTimer = 120;
            return;
        }
        
        // Smart task prioritization
        const newTask = this.chooseBestTask();
        if (newTask !== this.task) {
            this.task = newTask;
            this.lastTaskChange = game.time;
            this.setTaskTarget();
        }
    }
    
    chooseBestTask() {
        if (!this.isAdult) return 'idle';
        
        // PRIORITY 1: Critical survival needs
        if (this.hunger < 15 || this.thirst < 10) {
            return this.hunger < this.thirst ? 'seeking_food' : 'seeking_water';
        }
        
        // PRIORITY 2: Rocket construction (if affordable and adult)
        const rocketPart = this.shouldBuildRocket(game.gold);
        if (rocketPart) {
            return 'rocket_construction';
        }
        
        // PRIORITY 3: Infrastructure building - FIXED LOGIC HERE
        if (this.shouldBuildInfrastructure()) {
            return 'infrastructure_construction';
        }
        
        // PRIORITY 4: Amenity seeking for low needs
        const neededAmenity = this.getNeededAmenity();
        if (neededAmenity) return neededAmenity;
        
        // PRIORITY 5: Mining for gold
        if (game.goldDeposits && game.goldDeposits.length > 0) {
            return 'mining';
        }
        
        // PRIORITY 6: Negative personality building (rare)
        if (this.shouldBuildNegativeBuilding()) {
            return 'negative_construction';
        }
        
        return 'idle';
    }
    
    shouldBuildRocket(gold) {
        if (!this.isAdult) return false;
        
        for (let part in game.rocketParts) {
            const data = game.rocketParts[part];
            if (!data.built && !data.building && gold >= data.cost) {
                return part;
            }
        }
        return false;
    }
    
    // FIXED: Much more permissive building logic
    shouldBuildInfrastructure() {
        if (!this.isAdult) return false;
        
        const adultDwarfs = game.dworfs.filter(d => d.isAdult).length;
        const totalBuildings = game.buildings.length;
        const amenityBuildings = game.buildings.filter(b => b.type === 'amenity').length;
        
        // FIXED: Allow 2-3 buildings per adult dwarf (much more permissive)
        const maxBuildings = adultDwarfs * 3;
        const maxAmenities = adultDwarfs * 2;
        
        const averageNeeds = this.calculateAverageNeeds();
        
        // PRIORITY 1: Essential amenities when colony needs are low
        if (amenityBuildings < maxAmenities) {
            if (averageNeeds.rest < 50 && game.gold >= 80) return 'house'; // LOWERED from 120 to 80
            if (averageNeeds.coffee < 40 && game.gold >= 90) return 'coffee_shop'; // LOWERED from 130 to 90
            if (averageNeeds.joy < 40 && game.gold >= 100) return 'inn'; // LOWERED from 140 to 100
            if (averageNeeds.cleanliness < 45 && game.gold >= 110) return 'spa'; // LOWERED from 150 to 110
        }
        
        // PRIORITY 2: Basic buildings if we need more infrastructure
        if (totalBuildings < maxBuildings && game.gold >= 80) { // LOWERED from 100 to 80
            return 'building';
        }
        
        // PRIORITY 3: Luxury amenities if we have plenty of gold
        if (game.gold >= 140 && amenityBuildings < maxAmenities) {
            if (averageNeeds.joy < 60) return 'community_center';
            if (averageNeeds.rest < 70) return 'gym';
            if (game.dworfs.some(d => d.personality.openness > 70)) return 'museum';
            if (game.dworfs.some(d => d.personality.openness > 60)) return 'library';
        }
        
        return false;
    }
    
    shouldBuildNegativeBuilding() {
        if (!this.isAdult) return false;
        
        // Only if dwarf has extreme negative personality traits
        const isExtreme = this.personality.neuroticism > 85 || 
                         this.personality.agreeableness < 15 ||
                         this.personality.conscientiousness < 10;
        
        return isExtreme && Math.random() < 0.001 && game.gold >= 150; // LOWERED from 200 to 150
    }
    
    calculateAverageNeeds() {
        if (game.dworfs.length === 0) return { rest: 100, joy: 100, coffee: 100, cleanliness: 100 };
        
        const totals = { rest: 0, joy: 0, coffee: 0, cleanliness: 0 };
        game.dworfs.forEach(dwarf => {
            totals.rest += dwarf.rest;
            totals.joy += dwarf.joy;
            totals.coffee += dwarf.coffee;
            totals.cleanliness += dwarf.cleanliness;
        });
        
        const count = game.dworfs.length;
        return {
            rest: totals.rest / count,
            joy: totals.joy / count,
            coffee: totals.coffee / count,
            cleanliness: totals.cleanliness / count
        };
    }
    
    getNeededAmenity() {
        // Only seek amenities when really needed - LOWERED THRESHOLDS
        if (this.rest < 25) return 'seeking_rest'; // Was 20
        if (this.joy < 20) return 'seeking_joy'; // Was 15
        if (this.coffee < 15) return 'seeking_coffee'; // Was 10
        if (this.cleanliness < 25) return 'seeking_cleanliness'; // Was 20
        return null;
    }
    
    setTaskTarget() {
        switch (this.task) {
            case 'rocket_construction':
                this.startRocketConstruction();
                break;
            case 'infrastructure_construction':
                this.startInfrastructureConstruction();
                break;
            case 'negative_construction':
                this.startNegativeBuildingConstruction();
                break;
        }
    }
    
    startRocketConstruction() {
        const part = this.shouldBuildRocket(game.gold);
        if (!part) return;
        
        const partData = game.rocketParts[part];
        const cost = partData.cost;
        
        if (game.gold >= cost && !partData.building && !partData.built) {
            partData.building = true;
            game.gold -= cost;
            
            this.task = 'building_rocket';
            this.workTimer = 600;
            this.rocketPart = part;
            this.targetX = canvas.width / 2;
            this.targetY = 100;
            
            addLog(`🚀 ${this.name} starting ${part} construction!`, true);
        }
    }
    
    startInfrastructureConstruction() {
        const averageNeeds = this.calculateAverageNeeds();
        let buildingType = null;
        let cost = 0;
        
        // FIXED: Lowered costs and smarter prioritization
        if (averageNeeds.rest < 50 && game.gold >= 80) {
            buildingType = 'house';
            cost = 80; // LOWERED from 120
        } else if (averageNeeds.coffee < 40 && game.gold >= 90) {
            buildingType = 'coffee_shop';
            cost = 90; // LOWERED from 130
        } else if (averageNeeds.joy < 40 && game.gold >= 100) {
            buildingType = 'inn';
            cost = 100; // LOWERED from 140
        } else if (averageNeeds.cleanliness < 45 && game.gold >= 110) {
            buildingType = 'spa';
            cost = 110; // LOWERED from 150
        } else if (game.gold >= 140) {
            // Luxury amenities
            if (game.gold >= 140) buildingType = 'community_center', cost = 140; // LOWERED from 160
            else if (game.gold >= 140) buildingType = 'gym', cost = 140; // LOWERED from 180
            else if (game.gold >= 140) buildingType = 'museum', cost = 140; // LOWERED from 200
            else if (game.gold >= 140) buildingType = 'library', cost = 140; // LOWERED from 170
        } else if (game.gold >= 80) {
            buildingType = 'building';
            cost = 80; // LOWERED from 100
        }
        
        if (buildingType && game.gold >= cost) {
            game.gold -= cost;
            
            if (buildingType === 'building') {
                this.task = 'building_structure';
                this.workTimer = 400;
            } else {
                this.task = 'building_amenity';
                this.amenityType = buildingType;
                this.workTimer = 450;
                addLog(`🏠 ${this.name} building ${BUILDING_NAMES[buildingType] || buildingType}!`, true);
            }
            
            this.targetX = Math.random() * (canvas.width - 100) + 50;
            this.targetY = Math.random() * (canvas.height - 100) + 50;
        }
    }
    
    startNegativeBuildingConstruction() {
        const negativeTypes = ['gold_mutation_chamber', 'motion_alarm_tower', 'party_pavilion', 'unsafe_mining_rig', 'personal_gold_vault'];
        const type = negativeTypes[Math.floor(Math.random() * negativeTypes.length)];
        
        // FIXED: Lowered costs for negative buildings
        const costs = {
            'gold_mutation_chamber': 250, // LOWERED from 350
            'motion_alarm_tower': 180,    // LOWERED from 250
            'party_pavilion': 300,        // LOWERED from 400
            'unsafe_mining_rig': 150,     // LOWERED from 200
            'personal_gold_vault': 220    // LOWERED from 300
        };
        
        const cost = costs[type];
        if (game.gold >= cost) {
            game.gold -= cost;
            this.task = 'building_negative';
            this.negativeType = type;
            this.workTimer = 600;
            this.targetX = Math.random() * (canvas.width - 100) + 50;
            this.targetY = Math.random() * (canvas.height - 100) + 50;
            
            addLog(`⚠️ ${this.name} building something suspicious...`, true, 'disaster');
        }
    }
    
    executeTask() {
        switch (this.task) {
            case 'seeking_food':
                this.seekFood();
                break;
            case 'seeking_water':
                this.seekWater();
                break;
            case 'mining':
                this.mineGold();
                break;
            case 'building_rocket':
                this.buildRocket();
                break;
            case 'building_structure':
            case 'building_amenity':
            case 'building_negative':
                this.buildStructure();
                break;
            case 'seeking_rest':
            case 'seeking_joy':
            case 'seeking_coffee':
            case 'seeking_cleanliness':
                this.useAmenity();
                break;
            case 'panicking':
                this.panic();
                break;
            case 'fleeing':
                // Just move toward target, workTimer will expire
                break;
            default:
                this.wander();
        }
    }
    
    seekFood() {
        const nearbyFood = this.findNearestResource(game.foodSources);
        if (nearbyFood && this.distanceTo(nearbyFood) < 30) {
            if (nearbyFood.amount > 5) {
                const consumed = Math.min(15, nearbyFood.amount);
                this.hunger = Math.min(100, this.hunger + consumed * 3); // 3x more filling!
                nearbyFood.amount -= consumed;
                this.task = 'idle';
                this.workTimer = 30;
                
                if (Math.random() < 0.1) {
                    addLog(`🍓 ${this.name} feels satisfied after eating berries`, false);
                }
            }
        } else if (nearbyFood) {
            this.targetX = nearbyFood.x;
            this.targetY = nearbyFood.y;
        } else {
            this.task = 'idle'; // No food available
        }
    }
    
    seekWater() {
        const nearbyWater = this.findNearestResource(game.waterSources);
        if (nearbyWater && this.distanceTo(nearbyWater) < 30) {
            if (nearbyWater.amount > 8) {
                const consumed = Math.min(20, nearbyWater.amount);
                this.thirst = Math.min(100, this.thirst + consumed * 3); // 3x more filling!
                nearbyWater.amount -= consumed;
                this.task = 'idle';
                this.workTimer = 30;
                
                if (Math.random() < 0.1) {
                    addLog(`💧 ${this.name} feels refreshed after drinking`, false);
                }
            }
        } else if (nearbyWater) {
            this.targetX = nearbyWater.x;
            this.targetY = nearbyWater.y;
        } else {
            this.task = 'idle'; // No water available
        }
    }
    
    mineGold() {
        const nearbyDeposit = this.findNearestResource(game.goldDeposits);
        if (nearbyDeposit && this.distanceTo(nearbyDeposit) < 25) {
            const mined = Math.min(2 * this.efficiency, nearbyDeposit.gold);
            game.gold = (game.gold || 0) + mined;
            nearbyDeposit.gold -= mined;
            
            if (nearbyDeposit.gold <= 0) {
                const index = game.goldDeposits.indexOf(nearbyDeposit);
                game.goldDeposits.splice(index, 1);
                this.task = 'idle';
            }
        } else if (nearbyDeposit) {
            this.targetX = nearbyDeposit.x;
            this.targetY = nearbyDeposit.y;
        } else {
            this.task = 'idle';
        }
    }
    
    buildRocket() {
        if (this.distanceTo({x: this.targetX, y: this.targetY}) < 30) {
            const part = game.rocketParts[this.rocketPart];
            if (part && part.building) {
                part.progress = (part.progress || 0) + 0.01 * this.efficiency;
                if (part.progress >= 1) {
                    part.built = true;
                    part.building = false;
                    addLog(`🚀 ${this.rocketPart.toUpperCase()} completed by ${this.name}!`, true, 'success');
                    this.task = 'idle';
                }
            }
        }
    }
    
    buildStructure() {
        if (this.distanceTo({x: this.targetX, y: this.targetY}) < 30) {
            if (this.workTimer <= 0) {
                if (this.task === 'building_amenity') {
                    game.buildings.push({
                        x: this.targetX,
                        y: this.targetY,
                        type: 'amenity',
                        amenityType: this.amenityType
                    });
                } else if (this.task === 'building_negative') {
                    game.negativeBuildings.push({
                        x: this.targetX,
                        y: this.targetY,
                        type: this.negativeType,
                        timer: 0
                    });
                } else {
                    game.buildings.push({
                        x: this.targetX,
                        y: this.targetY,
                        type: 'building'
                    });
                }
                this.task = 'idle';
            }
        }
    }
    
    useAmenity() {
        const amenityType = this.getAmenityTypeForTask();
        const suitableBuildings = game.buildings.filter(b => 
            b.type === 'amenity' && b.amenityType === amenityType
        );
        
        if (suitableBuildings.length > 0) {
            const nearest = this.findNearestResource(suitableBuildings);
            if (this.distanceTo(nearest) < 35) {
                this.useAmenityBuilding(amenityType);
                this.task = 'idle';
                this.workTimer = 60;
            } else {
                this.targetX = nearest.x;
                this.targetY = nearest.y;
            }
        } else {
            this.task = 'idle'; // No suitable amenity available
        }
    }
    
    getAmenityTypeForTask() {
        switch (this.task) {
            case 'seeking_rest': return 'house';
            case 'seeking_joy': return 'inn';
            case 'seeking_coffee': return 'coffee_shop';
            case 'seeking_cleanliness': return 'spa';
            default: return 'house';
        }
    }
    
    useAmenityBuilding(type) {
        // 2-3x more effective as requested
        switch (type) {
            case 'house':
                this.rest = Math.min(100, this.rest + 50);
                break;
            case 'inn':
                this.joy = Math.min(100, this.joy + 45);
                break;
            case 'coffee_shop':
                this.coffee = Math.min(100, this.coffee + 60);
                break;
            case 'spa':
                this.cleanliness = Math.min(100, this.cleanliness + 65);
                break;
            case 'gym':
                this.rest = Math.min(100, this.rest + 30);
                break;
            case 'library':
                this.joy = Math.min(100, this.joy + 35);
                break;
            case 'museum':
                this.joy = Math.min(100, this.joy + 40);
                break;
            case 'community_center':
                this.joy = Math.min(100, this.joy + 30);
                this.cleanliness = Math.min(100, this.cleanliness + 20);
                break;
        }
    }
    
    panic() {
        // Panicking dwarfs move erratically
        this.targetX = this.x + Math.random() * 100 - 50;
        this.targetY = this.y + Math.random() * 100 - 50;
        
        // Keep in bounds
        this.targetX = Math.max(50, Math.min(canvas.width - 50, this.targetX));
        this.targetY = Math.max(50, Math.min(canvas.height - 50, this.targetY));
        
        if (this.workTimer <= 0) {
            this.personalityState = 'normal';
            this.panicLevel = 0;
            this.task = 'idle';
        }
    }
    
    wander() {
        if (Math.random() < 0.02) {
            this.targetX = Math.random() * canvas.width;
            this.targetY = Math.random() * canvas.height;
        }
    }
    
    move() {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 5) {
            let moveSpeed = this.speed;
            
            // Modify speed based on state
            if (this.task === 'panicking') moveSpeed *= 2;
            if (this.task === 'fleeing') moveSpeed *= 1.5;
            if (this.personalityState === 'lazy') moveSpeed *= 0.5;
            
            this.x += (dx / distance) * moveSpeed;
            this.y += (dy / distance) * moveSpeed;
            this.direction = Math.atan2(dy, dx);
        }
        
        // Keep in bounds
        this.x = Math.max(20, Math.min(canvas.width - 20, this.x));
        this.y = Math.max(20, Math.min(canvas.height - 20, this.y));
    }
    
    findNearestResource(resources) {
        if (!resources || resources.length === 0) return null;
        
        let nearest = resources[0];
        let minDistance = this.distanceTo(nearest);
        
        for (let resource of resources) {
            const distance = this.distanceTo(resource);
            if (distance < minDistance) {
                nearest = resource;
                minDistance = distance;
            }
        }
        
        return nearest;
    }
    
    distanceTo(target) {
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    giveBirth() {
        this.isPregnant = false;
        this.pregnancyTimer = 0;
        this.reproductionCooldown = 7200; // 2 minute cooldown
        
        const baby = new Dwarf(
            this.x + Math.random() * 40 - 20,
            this.y + Math.random() * 40 - 20,
            null,
            false // isAdult = false
        );
        
        game.dworfs.push(baby);
        addLog(`👶 ${this.name} gave birth to ${baby.name}!`, true, 'success');
    }
    
    draw() {
        if (!ctx) return;
        
        ctx.save();
        
        // Territory visualization for orange males
        if (this.isAdult && this.gender === 'male' && this.reproductionStrategy === 'orange') {
            ctx.strokeStyle = 'rgba(255, 102, 0, 0.3)';
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.arc(this.territoryX, this.territoryY, 40, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }
        
        // Guard lines for blue males
        if (this.isAdult && this.gender === 'male' && this.reproductionStrategy === 'blue' && this.guardedFemale) {
            ctx.strokeStyle = 'rgba(0, 102, 255, 0.4)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.guardedFemale.x, this.guardedFemale.y);
            ctx.stroke();
            ctx.lineWidth = 1;
        }
        
        // Main body with gender colors
        if (this.isAdult) {
            ctx.fillStyle = this.gender === 'male' ? '#4A90E2' : '#E24A90';
        } else {
            ctx.fillStyle = '#FFB6C1'; // Pink for children
        }
        
        const bodySize = this.isAdult ? 8 : 5;
        
        // Add personality state visual effects
        if (this.personalityState === 'panicking') {
            ctx.shadowColor = '#FF0000';
            ctx.shadowBlur = 10;
        } else if (this.personalityState === 'creative_burst') {
            ctx.shadowColor = '#FF00FF';
            ctx.shadowBlur = 5;
        }
        
        ctx.fillRect(this.x - bodySize, this.y - bodySize, bodySize * 2, bodySize * 2);
        ctx.shadowBlur = 0;
        
        // Personality hat color
        const hatColor = this.getPersonalityColor();
        ctx.fillStyle = hatColor;
        ctx.fillRect(this.x - 6, this.y - bodySize - 4, 12, 4);
        
        // Gender indicator dot
        ctx.fillStyle = this.gender === 'male' ? '#0066FF' : '#FF69B4';
        ctx.beginPath();
        ctx.arc(this.x - 10, this.y - 10, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Strategy indicator for adult males
        if (this.isAdult && this.gender === 'male') {
            const strategyColors = {
                'orange': '#FF6600',
                'blue': '#0066FF', 
                'yellow': '#FFFF00'
            };
            ctx.fillStyle = strategyColors[this.reproductionStrategy];
            ctx.beginPath();
            ctx.arc(this.x + 10, this.y - 10, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Pregnancy glow and progress
        if (this.isPregnant) {
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = 15;
            ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, bodySize + 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            
            // Pregnancy progress bar
            const progressWidth = 20;
            const progress = this.pregnancyTimer / 3600;
            ctx.fillStyle = 'rgba(255, 20, 147, 0.7)';
            ctx.fillRect(this.x - progressWidth/2, this.y + bodySize + 5, progressWidth * progress, 3);
        }
        
        // Maturity progress for children
        if (!this.isAdult) {
            const progressWidth = 16;
            const progress = this.maturityTimer / 1800;
            ctx.fillStyle = 'rgba(50, 205, 50, 0.7)';
            ctx.fillRect(this.x - progressWidth/2, this.y + bodySize + 5, progressWidth * progress, 2);
        }
        
        // Need bars
        this.drawNeedBars();
        
        // Name
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.name, this.x, this.y - bodySize - 8);
        
        // Task indicator emoji
        const taskEmojis = {
            'panicking': '😰',
            'fleeing': '🏃',
            'building_rocket': '🚀',
            'mining': '⛏️',
            'seeking_food': '🍓',
            'seeking_water': '💧',
            'seeking_rest': '😴',
            'seeking_joy': '😊',
            'seeking_coffee': '☕'
        };
        
        if (taskEmojis[this.task]) {
            ctx.fillText(taskEmojis[this.task], this.x, this.y + bodySize + 15);
        }
        
        ctx.textAlign = 'left';
        ctx.restore();
    }
    
    drawNeedBars() {
        const barWidth = 12;
        const barHeight = 2;
        const startY = this.y - 20;
        
        // Hunger (red)
        ctx.fillStyle = this.hunger < 20 ? '#FF0000' : '#FF4444';
        ctx.fillRect(this.x - barWidth/2, startY, barWidth * (this.hunger / 100), barHeight);
        
        // Thirst (blue)
        ctx.fillStyle = this.thirst < 15 ? '#0000FF' : '#4444FF';
        ctx.fillRect(this.x - barWidth/2, startY + 3, barWidth * (this.thirst / 100), barHeight);
        
        // Show other needs if low
        if (this.rest < 25) {
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(this.x - barWidth/2, startY + 6, barWidth * (this.rest / 100), 1);
        }
        
        if (this.coffee < 20) {
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(this.x - barWidth/2, startY + 8, barWidth * (this.coffee / 100), 1);
        }
    }
    
    getPersonalityColor() {
        if (this.personality.openness > 70) return '#8A2BE2'; // Purple - creative
        if (this.personality.conscientiousness > 70) return '#20B2AA'; // Teal - organized
        if (this.personality.extraversion > 70) return '#FFD700'; // Gold - social
        if (this.personality.agreeableness > 70) return '#32CD32'; // Green - kind
        if (this.personality.neuroticism > 70) return '#FF6347'; // Orange - anxious
        return '#708090'; // Default gray
    }
}

// Legacy compatibility
window.Dworf = Dwarf;
