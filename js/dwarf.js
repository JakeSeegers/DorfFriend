// Complete Dwarf class implementation

class Dwarf {
    constructor(x, y, name = null, isAdult = true) {
        this.x = x;
        this.y = y;
        this.name = name || this.generateName();
        this.isAdult = isAdult;
        this.gender = Math.random() < 0.5 ? 'male' : 'female';
        
        // Basic needs
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
        
        // Reproduction system
        this.reproductionStrategy = this.gender === 'male' ? 
            ['orange', 'blue', 'yellow'][Math.floor(Math.random() * 3)] : null;
        this.isPregnant = false;
        this.pregnancyTimer = 0;
        this.maturityTimer = isAdult ? 0 : Math.random() * 1800;
        this.reproductionCooldown = 0;
        
        // Work and behavior
        this.task = 'idle';
        this.workTimer = 0;
        this.efficiency = 0.8 + Math.random() * 0.4;
        this.targetX = x;
        this.targetY = y;
        this.speed = 0.5 + Math.random() * 0.5;
        
        // Special states
        this.rocketPart = null;
        this.amenityType = null;
        this.negativeType = null;
        this.territoryX = x;
        this.territoryY = y;
        this.guardedFemale = null;
        
        // Visual
        this.direction = Math.random() * Math.PI * 2;
        this.animPhase = Math.random() * Math.PI * 2;
    }
    
    generateName() {
        const names = ['Gimli', 'Thorin', 'Balin', 'Dwalin', 'Fili', 'Kili', 
                      'Gloin', 'Oin', 'Ori', 'Nori', 'Dori', 'Bifur', 'Bofur', 'Bombur',
                      'Grilda', 'Vera', 'Nala', 'Breta', 'Kira', 'Mira'];
        return names[Math.floor(Math.random() * names.length)] + '_' + Math.floor(Math.random() * 100);
    }
    
    update() {
        // Age and maturity
        if (!this.isAdult) {
            this.maturityTimer++;
            if (this.maturityTimer >= 1800) {
                this.isAdult = true;
                addLog(`👤 ${this.name} has reached maturity!`, true);
            }
        }
        
        // Pregnancy
        if (this.isPregnant) {
            this.pregnancyTimer++;
            if (this.pregnancyTimer >= 3600) {
                this.giveBirth();
            }
        }
        
        // Cooldowns
        if (this.reproductionCooldown > 0) this.reproductionCooldown--;
        
        // Needs decay (much slower now)
        if (game.time % 4 === 0) {
            this.hunger = Math.max(0, this.hunger - 0.08);
            this.thirst = Math.max(0, this.thirst - 0.12);
            this.rest = Math.max(0, this.rest - 0.06);
            this.joy = Math.max(0, this.joy - 0.04);
            this.coffee = Math.max(0, this.coffee - 0.03);
            this.cleanliness = Math.max(0, this.cleanliness - 0.05);
        }
        
        // Task management
        this.updateTask();
        this.executeTask();
        this.move();
        
        this.animPhase += 0.1;
    }
    
    updateTask() {
        if (this.workTimer > 0) {
            this.workTimer--;
            return; // Continue current task
        }
        
        // Priority system
        const newTask = this.chooseBestTask();
        if (newTask !== this.task) {
            this.task = newTask;
            this.setTaskTarget();
        }
    }
    
    chooseBestTask() {
        if (!this.isAdult) return 'idle';
        
        // Critical survival needs
        if (this.hunger < 15 || this.thirst < 10) {
            return this.hunger < this.thirst ? 'seeking_food' : 'seeking_water';
        }
        
        // Rocket construction (if affordable)
        const rocketPart = this.shouldBuildRocket(game.gold);
        if (rocketPart) {
            this.startRocketConstruction(rocketPart);
            return 'building_rocket';
        }
        
        // Infrastructure needs
        if (this.shouldBuildInfrastructure()) {
            const buildingType = this.chooseBuildingType();
            this.startInfrastructureConstruction(buildingType);
            return buildingType === 'building' ? 'building_structure' : 'building_amenity';
        }
        
        // Amenity seeking
        const neededAmenity = this.getNeededAmenity();
        if (neededAmenity) return neededAmenity;
        
        // Mining
        if (game.goldDeposits.length > 0) return 'mining';
        
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
    
    startRocketConstruction(part) {
        if (!part || !this.isAdult) return;
        
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
    
    shouldBuildInfrastructure() {
        const averageNeeds = this.calculateAverageNeeds();
        return (averageNeeds.rest < 40 && game.gold >= 120) ||
               (averageNeeds.joy < 30 && game.gold >= 140) ||
               (game.buildings.length < game.dworfs.length && game.gold >= 100);
    }
    
    chooseBuildingType() {
        const averageNeeds = this.calculateAverageNeeds();
        
        if (averageNeeds.rest < 40 && game.gold >= 120) return 'house';
        if (averageNeeds.coffee < 30 && game.gold >= 130) return 'coffee_shop';
        if (averageNeeds.joy < 30 && game.gold >= 140) return 'inn';
        if (averageNeeds.cleanliness < 35 && game.gold >= 150) return 'spa';
        
        return 'building';
    }
    
    startInfrastructureConstruction(type) {
        if (!this.isAdult) return;
        
        if (type === 'building') {
            if (game.gold >= 100) {
                game.gold -= 100;
                this.task = 'building_structure';
                this.workTimer = 400;
                this.targetX = Math.random() * (canvas.width - 100) + 50;
                this.targetY = Math.random() * (canvas.height - 100) + 50;
            }
        } else if (BUILDING_COSTS[type]) {
            const cost = BUILDING_COSTS[type];
            if (game.gold >= cost) {
                game.gold -= cost;
                this.task = 'building_amenity';
                this.amenityType = type;
                this.workTimer = 450;
                this.targetX = Math.random() * (canvas.width - 100) + 50;
                this.targetY = Math.random() * (canvas.height - 100) + 50;
                
                addLog(`🏠 ${this.name} building ${BUILDING_NAMES[type]}!`, true);
            }
        }
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
        if (this.rest < 20) return 'seeking_rest';
        if (this.joy < 15) return 'seeking_joy';
        if (this.coffee < 10) return 'seeking_coffee';
        if (this.cleanliness < 20) return 'seeking_cleanliness';
        return null;
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
                this.buildStructure();
                break;
            case 'seeking_rest':
            case 'seeking_joy':
            case 'seeking_coffee':
            case 'seeking_cleanliness':
                this.useAmenity();
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
                this.hunger = Math.min(100, this.hunger + consumed * 3);
                nearbyFood.amount -= consumed;
                this.task = 'idle';
            }
        } else if (nearbyFood) {
            this.targetX = nearbyFood.x;
            this.targetY = nearbyFood.y;
        }
    }
    
    seekWater() {
        const nearbyWater = this.findNearestResource(game.waterSources);
        if (nearbyWater && this.distanceTo(nearbyWater) < 30) {
            if (nearbyWater.amount > 8) {
                const consumed = Math.min(20, nearbyWater.amount);
                this.thirst = Math.min(100, this.thirst + consumed * 3);
                nearbyWater.amount -= consumed;
                this.task = 'idle';
            }
        } else if (nearbyWater) {
            this.targetX = nearbyWater.x;
            this.targetY = nearbyWater.y;
        }
    }
    
    mineGold() {
        const nearbyDeposit = this.findNearestResource(game.goldDeposits);
        if (nearbyDeposit && this.distanceTo(nearbyDeposit) < 25) {
            const mined = Math.min(2 * this.efficiency, nearbyDeposit.gold);
            game.gold += mined;
            nearbyDeposit.gold -= mined;
            
            if (nearbyDeposit.gold <= 0) {
                const index = game.goldDeposits.indexOf(nearbyDeposit);
                game.goldDeposits.splice(index, 1);
                this.task = 'idle';
            }
        } else if (nearbyDeposit) {
            this.targetX = nearbyDeposit.x;
            this.targetY = nearbyDeposit.y;
        }
    }
    
    buildRocket() {
        if (this.distanceTo({x: this.targetX, y: this.targetY}) < 30) {
            const part = game.rocketParts[this.rocketPart];
            if (part && part.building) {
                part.progress += 0.01 * this.efficiency;
                if (part.progress >= 1) {
                    part.built = true;
                    part.building = false;
                    addLog(`🚀 ${this.rocketPart} completed by ${this.name}!`, true, 'success');
                    this.task = 'idle';
                }
            }
        }
    }
    
    buildStructure() {
        if (this.distanceTo({x: this.targetX, y: this.targetY}) < 30) {
            // Building animation/progress would go here
            if (this.workTimer <= 0) {
                if (this.task === 'building_amenity') {
                    game.buildings.push({
                        x: this.targetX,
                        y: this.targetY,
                        type: 'amenity',
                        amenityType: this.amenityType
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
        switch (type) {
            case 'house':
                this.rest = Math.min(100, this.rest + 40);
                break;
            case 'inn':
                this.joy = Math.min(100, this.joy + 35);
                break;
            case 'coffee_shop':
                this.coffee = Math.min(100, this.coffee + 45);
                break;
            case 'spa':
                this.cleanliness = Math.min(100, this.cleanliness + 50);
                break;
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
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
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
        ctx.save();
        
        // Main body
        if (this.isAdult) {
            ctx.fillStyle = this.gender === 'male' ? '#4A90E2' : '#E24A90';
        } else {
            ctx.fillStyle = '#FFB6C1'; // Pink for children
        }
        
        const bodySize = this.isAdult ? 8 : 5;
        ctx.fillRect(this.x - bodySize, this.y - bodySize, bodySize * 2, bodySize * 2);
        
        // Personality hat
        const hatColor = this.getPersonalityColor();
        ctx.fillStyle = hatColor;
        ctx.fillRect(this.x - 6, this.y - bodySize - 4, 12, 4);
        
        // Gender indicator
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
        
        // Pregnancy glow
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
        
        // Maturity bar for children
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
        ctx.textAlign = 'left';
        
        ctx.restore();
    }
    
    drawNeedBars() {
        const barWidth = 12;
        const barHeight = 2;
        const startY = this.y - 20;
        
        // Hunger (red)
        ctx.fillStyle = '#FF4444';
        ctx.fillRect(this.x - barWidth/2, startY, barWidth * (this.hunger / 100), barHeight);
        
        // Thirst (blue)
        ctx.fillStyle = '#4444FF';
        ctx.fillRect(this.x - barWidth/2, startY + 3, barWidth * (this.thirst / 100), barHeight);
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

// Legacy alias for compatibility
window.Dworf = Dwarf;
