// Example: Complete replacement for the Dwarf class methods as specified

class Dwarf {
    constructor(name, isAdult) {
        this.name = name;
        this.isAdult = isAdult;
        // Other initialization...
    }

    // Should the dwarf build a rocket part?
    shouldBuildRocket(gold) {
        if (!this.isAdult) return false;
        
        for (let part in game.rocketParts) {
            const data = game.rocketParts[part];
            // FIXED: Also check that no one else is already building it
            if (!data.built && !data.building && gold >= data.cost) {
                return part;
            }
        }
        return false;
    }

    // Start rocket construction if possible
    startRocketConstruction(part) {
        if (!part || !this.isAdult) return;
        
        const partData = game.rocketParts[part];
        const cost = partData.cost;
        
        // ATOMIC CHECK: Verify gold AND that no one else started building
        if (game.gold >= cost && !partData.building && !partData.built) {
            // Immediately mark as building to prevent others from starting
            partData.building = true;
            game.gold -= cost;
            
            this.task = 'building_rocket';
            this.workTimer = 600;
            this.rocketPart = part;
            this.targetX = canvas.width / 2;
            this.targetY = 100;
            
            addLog('🚀 ' + this.name + ' starting ' + part + ' construction!', true);
        } else {
            // Can't afford it or someone else is building it
            this.task = 'idle';
            if (Math.random() < 0.05 && game.gold < cost) {
                addLog('💰 ' + this.name + ' cannot afford ' + part, false);
            }
        }
    }

    // Start infrastructure construction if possible
    startInfrastructureConstruction(type) {
        if (!this.isAdult) return;
        
        if (type === 'building') {
            // ATOMIC CHECK AND SPEND
            if (game.gold >= 100) {
                game.gold -= 100;
                this.task = 'building_structure';
                this.workTimer = 400;
                this.targetX = Math.random() * (canvas.width - 100) + 50;
                this.targetY = Math.random() * (canvas.height - 100) + 50;
            } else {
                this.task = 'idle';
            }
        } else if (type && BUILDING_COSTS[type]) {
            const cost = BUILDING_COSTS[type];
            
            // ATOMIC CHECK AND SPEND
            if (game.gold >= cost) {
                game.gold -= cost;
                this.task = 'building_amenity';
                this.amenityType = type;
                this.workTimer = 450;
                this.targetX = Math.random() * (canvas.width - 100) + 50;
                this.targetY = Math.random() * (canvas.height - 100) + 50;
                
                addLog('🏠 ' + this.name + ' building ' + BUILDING_NAMES[type] + '!', true);
            } else {
                this.task = 'idle';
            }
        }
    }

    // Start negative building construction if possible
    startNegativeBuildingConstruction(type) {
        if (!this.isAdult) return;
        
        const costs = {
            'gold_mutation_chamber': 350,
            'motion_alarm_tower': 250,
            'party_pavilion': 400,
            'unsafe_mining_rig': 200,
            'personal_gold_vault': 300
        };
        
        const cost = costs[type];
        if (!cost) return;
        
        // ATOMIC CHECK AND SPEND
        if (game.gold >= cost) {
            game.gold -= cost;
            this.task = 'building_negative';
            this.negativeType = type;
            this.workTimer = 600;
            this.targetX = Math.random() * (canvas.width - 100) + 50;
            this.targetY = Math.random() * (canvas.height - 100) + 50;
            
            const messages = {
                'gold_mutation_chamber': this.name + ' building "research facility"!',
                'motion_alarm_tower': this.name + ' installing "safety system"!',
                'party_pavilion': this.name + ' constructing "team building space"!',
                'unsafe_mining_rig': this.name + ' rushing mining equipment!',
                'personal_gold_vault': this.name + ' securing "savings account"!'
            };
            
            addLog('⚠️ ' + messages[type], true, 'disaster');
        } else {
            this.task = 'idle';
        }
    }

    // ... other Dwarf methods and logic ...
}