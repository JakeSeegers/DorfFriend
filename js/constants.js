// Game constants and configuration
const TASK_PRIORITIES = {
    // SURVIVAL (highest priority)
    'CRITICAL_SURVIVAL': 100,    // Hunger/thirst below critical thresholds
    'BASIC_SURVIVAL': 90,        // Hunger/thirst getting low
    
    // RECOVERY & SPECIAL STATES
    'RECOVERY_STATES': 80,       // Recovering, panicking, confused, etc.
    
    // ROCKET CONSTRUCTION (main objective)
    'ROCKET_BUILDING': 70,       // Building rocket parts when affordable
    
    // INFRASTRUCTURE (colony development)
    'INFRASTRUCTURE': 60,        // Building houses, amenities, etc.
    
    // AMENITY SEEKING (comfort)
    'AMENITY_SEEKING': 50,       // Seeking rest, joy, coffee, etc.
    
    // MINING (resource gathering)
    'MINING': 40,               // Mining gold deposits
    
    // IDLE (default)
    'IDLE': 0                   // Wandering around
};

// Dwarf names for random generation
const DWARF_NAMES = [
    'Gimli', 'Thorin', 'Balin', 'Dwalin', 'Fili', 'Kili', 
    'Gloin', 'Oin', 'Ori', 'Nori', 'Dori', 'Bifur', 'Bofur', 'Bombur'
];

// Building costs and names
const BUILDING_COSTS = {
    'house': 120, 'spa': 150, 'coffee_shop': 130, 'inn': 140,
    'community_center': 160, 'gym': 180, 'museum': 200, 'library': 170
};

const BUILDING_NAMES = {
    'house': 'Rest House', 'spa': 'Spa & Bathhouse', 'coffee_shop': 'Coffee Shop', 
    'inn': 'Joy Inn', 'community_center': 'Community Center', 'gym': 'Fitness Gym',
    'museum': 'Art Museum', 'library': 'Wisdom Library'
};

// Rocket part configurations
const ROCKET_PARTS_CONFIG = {
    engine: { cost: 1000, built: false, building: false, progress: 0 },
    fuel: { cost: 2500, built: false, building: false, progress: 0 },
    hull: { cost: 5000, built: false, building: false, progress: 0 },
    navigation: { cost: 8000, built: false, building: false, progress: 0 },
    launchpad: { cost: 15000, built: false, building: false, progress: 0 }
};