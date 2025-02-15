const CONFIG = {
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    
    PLAYER: {
        SPEED: 5,
        SIZE: 32,
        MAX_HEALTH: 100,
        BASE_DAMAGE: 10,
        INVULNERABILITY_TIME: 1000,
        DAMAGE_REDUCTION: 0.1 // Reduce incoming damage by 90%
    },
    
    ENEMIES: {
        SPAWN_RATE: 1000, // ms between spawns
        TYPES: [
            {
                name: 'Angry Tomato',
                health: 30,
                damage: 10,
                speed: 2,
                size: 32,
                xpValue: 5
            },
            {
                name: 'Raging Broccoli',
                health: 45,
                damage: 15,
                speed: 1.5,
                size: 32,
                xpValue: 8
            },
            {
                name: 'Mad Steak',
                health: 60,
                damage: 20,
                speed: 1,
                size: 40,
                xpValue: 12
            },
            {
                name: 'Evil Carrot',
                health: 35,
                damage: 12,
                speed: 2.5,
                size: 32,
                xpValue: 7
            },
            {
                name: 'Angry Pizza',
                health: 50,
                damage: 18,
                speed: 1.8,
                size: 36,
                xpValue: 10
            },
            {
                name: 'Evil Burger',
                health: 70,
                damage: 22,
                speed: 1.2,
                size: 36,
                xpValue: 15
            },
            {
                name: 'Wicked Sushi',
                health: 25,
                damage: 15,
                speed: 3,
                size: 32,
                xpValue: 8
            },
            {
                name: 'Demonic Donut',
                health: 40,
                damage: 12,
                speed: 2.2,
                size: 32,
                xpValue: 9
            }
        ]
    },
    
    WEAPONS: [
        {
            name: 'Lemon Squirt',
            description: 'Basic rapid-fire citrus shots',
            projectileSpeed: 8,
            damage: 10,
            fireRate: 400,
            range: 400,
            color: '#ffeb3b',
            effectScale: 1.0
        },
        {
            name: 'Acid Spray',
            description: 'Wide spread of corrosive shots',
            projectileSpeed: 7,
            damage: 8,
            fireRate: 500,
            range: 300,
            spread: 3,
            color: '#7fff00',
            effectScale: 0.8
        },
        {
            name: 'Citrus Shield',
            description: 'Orbiting protective lemons',
            projectileSpeed: 0,
            damage: 15,
            fireRate: 100,
            range: 50,
            isShield: true,
            orbitalCount: 4,
            color: '#ffd700',
            effectScale: 1.2
        },
        {
            name: 'Seed Shot',
            damage: 25,
            projectileSpeed: 10,
            fireRate: 800,
            range: 400
        },
        {
            name: 'Citrus Burst',
            damage: 30,
            projectileSpeed: 12,
            fireRate: 1000,
            range: 350,
            spread: 3 // Number of projectiles in burst
        },
        {
            name: 'Lemon Ring',
            damage: 20,
            projectileSpeed: 6,
            fireRate: 2000,
            range: 250,
            isOrbital: true // Circles around player
        },
        {
            name: 'Juice Stream',
            damage: 8,
            projectileSpeed: 15,
            fireRate: 100,
            range: 200,
            isPiercing: true
        },
        {
            name: 'Zesty Chain',
            damage: 12,
            projectileSpeed: 8,
            fireRate: 300,
            range: 300,
            chainCount: 3,
            chainRange: 100
        }
    ],
    
    POWERUPS: [
        {
            name: 'Sugar Rush',
            effect: 'speed',
            value: 1.3,
            duration: 0,
            description: 'Permanent 30% speed boost',
            visualEffect: {
                trail: true,
                color: '#ff69b4',
                particles: 'sparkle'
            }
        },
        {
            name: 'Vitamin C Boost',
            effect: 'damage',
            value: 1.25,
            duration: 0,
            description: 'Permanent 25% damage increase',
            visualEffect: {
                glow: true,
                color: '#ffa500',
                intensity: 1.2
            }
        },
        {
            name: 'Juice Shield',
            effect: 'shield',
            value: 50,
            duration: 10000,
            description: 'Protective juice barrier',
            visualEffect: {
                shield: true,
                color: '#4169e1',
                pulseRate: 1.5
            }
        },
        {
            name: 'Health Boost',
            effect: 'health',
            value: 20
        },
        {
            name: 'Health Regen',
            effect: 'regen',
            value: 0.5, // Health per second
            duration: 30000 // 30 seconds
        },
        {
            name: 'Damage Field',
            effect: 'field',
            value: 15, // Damage per second to nearby enemies
            radius: 100,
            duration: 15000
        },
        {
            name: 'Rapid Fire',
            effect: 'fireRate',
            value: 0.5, // Reduces fire rate by 50%
            duration: 20000
        }
    ],
    
    XP: {
        BASE_NEXT_LEVEL: 100,
        LEVEL_MULTIPLIER: 1.2
    },

    EFFECTS: {
        EXPLOSION_PARTICLES: 12,
        DEATH_PARTICLES: 20,
        LEVEL_UP_PARTICLES: 30
    },

    WAVES: {
        DURATION: 60000, // 60 seconds per wave
        BOSS_EVERY: 5, // Boss every 5 waves
        BOSSES: [
            {
                name: 'King Burger',
                sprite: 'kingBurger',
                health: 500,
                damage: 30,
                speed: 0.8,
                size: 64,
                xpValue: 100,
                attacks: ['summonFries', 'beefBarrage']
            },
            {
                name: 'Pizza Overlord',
                sprite: 'pizzaLord',
                health: 600,
                damage: 25,
                speed: 1,
                size: 64,
                xpValue: 120,
                attacks: ['pepperoniStorm', 'cheeseBeam']
            }
        ]
    }
}; 