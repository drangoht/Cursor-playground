#pragma once
#include <SFML/Graphics.hpp>
#include <array>
#include <string>

enum class GameState {
    Menu,
    Playing,
    Paused,
    LevelUp,
    GameOver
};

namespace CONFIG {
    constexpr int WINDOW_WIDTH = 800;
    constexpr int WINDOW_HEIGHT = 600;
    
    namespace PLAYER {
        constexpr float SPEED = 300.f;
        constexpr float SIZE = 32.f;
        constexpr float MAX_HEALTH = 100.f;
        constexpr float BASE_DAMAGE = 10.f;
        constexpr float INVULNERABILITY_TIME = 1.0f;
        constexpr float DAMAGE_REDUCTION = 0.1f;
    }

    namespace WEAPONS {
        struct WeaponData {
            std::string name;
            std::string description;
            float projectileSpeed;
            float damage;
            float fireRate;
            float range;
            sf::Color color;
            float effectScale;
            bool spread{false};
            bool isShield{false};
            bool isPiercing{false};
            bool isChain{false};
            int orbitalCount{0};
            int chainCount{0};
        };

        const std::array<WeaponData, 3> TYPES = {{
            {
                "Lemon Squirt",
                "Basic rapid-fire citrus shots",
                400.f,  // speed
                10.f,   // damage
                0.4f,   // fireRate
                400.f,  // range
                sf::Color(255, 235, 59),
                1.0f    // effectScale
            },
            {
                "Acid Spray",
                "Wide spread of corrosive shots",
                350.f,
                8.f,
                0.5f,
                300.f,
                sf::Color(127, 255, 0),
                0.8f,
                true    // spread
            },
            {
                "Citrus Shield",
                "Orbiting protective lemons",
                0.f,
                15.f,
                0.1f,
                50.f,
                sf::Color(255, 215, 0),
                1.2f,
                false,  // spread
                true,   // isShield
                false,  // isPiercing
                false,  // isChain
                4      // orbitalCount
            }
        }};
    }

    namespace ENEMIES {
        struct EnemyData {
            std::string name;
            float health;
            float damage;
            float speed;
            float size;
            int xpValue;
            sf::Color color;
            sf::Color outlineColor;  // Add outline color
            int points;  // Number of points for shape (3=triangle, 4=square, etc.)
            float rotation;  // Initial rotation
        };

        constexpr float SPAWN_RATE = 1.0f;  // One enemy per second

        const std::array<EnemyData, 8> TYPES = {{
            {
                "Angry Tomato",
                30.f,   // health
                10.f,   // damage
                120.f,  // speed
                32.f,   // size
                5,      // xp
                sf::Color(220, 20, 20),  // Red
                sf::Color(180, 0, 0),    // Dark red outline
                20,     // Circular
                0.f     // No rotation
            },
            {
                "Raging Broccoli",
                45.f,
                15.f,
                90.f,
                32.f,
                8,
                sf::Color(34, 139, 34),  // Forest green
                sf::Color(0, 100, 0),    // Dark green
                3,      // Triangle (tree-like)
                180.f   // Point up
            },
            {
                "Evil Carrot",
                35.f,
                12.f,
                100.f,
                36.f,
                6,
                sf::Color(255, 140, 0),  // Orange
                sf::Color(200, 100, 0),  // Dark orange
                3,      // Triangle
                0.f     // Point down
            },
            {
                "Wicked Watermelon",
                60.f,
                20.f,
                70.f,
                40.f,
                10,
                sf::Color(220, 20, 60),  // Crimson
                sf::Color(0, 100, 0),    // Dark green outline
                20,     // Circular
                0.f
            },
            {
                "Brutal Banana",
                25.f,
                8.f,
                140.f,
                28.f,
                4,
                sf::Color(255, 255, 0),  // Yellow
                sf::Color(200, 200, 0),  // Dark yellow
                4,      // Diamond shape
                45.f    // Rotated to look like banana
            }
            // ... add more enemy types as needed
        }};
    }

    namespace POWERUPS {
        struct PowerupData {
            std::string name;
            std::string effect;
            float value;
            std::string description;
        };

        const std::array<PowerupData, 6> TYPES = {{
            {
                "Citrus Armor",
                "armor",
                25.f,
                "Increase max health by 25%"
            },
            {
                "Sugar Rush",
                "speed",
                1.3f,
                "Increase movement speed by 30%"
            },
            {
                "Vitamin C Boost",
                "damage",
                1.25f,
                "Increase damage by 25%"
            },
            {
                "Quick Squeeze",
                "bullet_speed",
                1.3f,
                "Increase projectile speed by 30%"
            },
            {
                "Acid Spray",
                "new_weapon",
                0.f,
                "Add spread shot weapon"
            },
            {
                "Citrus Shield",
                "new_weapon",
                0.f,
                "Add orbital shield weapon"
            }
        }};
    }

    namespace XP {
        constexpr float BASE_NEXT_LEVEL = 100.f;  // XP needed for first level
        constexpr float LEVEL_MULTIPLIER = 1.4f;   // Each level needs 40% more XP
        
        // XP rewards for different enemy types
        namespace REWARDS {
            constexpr int BASIC = 5;      // Basic enemies (tomato)
            constexpr int MEDIUM = 8;     // Medium enemies (broccoli)
            constexpr int LARGE = 12;     // Large enemies (watermelon)
            constexpr int BOSS = 50;      // Boss enemies (not implemented yet)
        }
    }

    namespace EFFECTS {
        constexpr int EXPLOSION_PARTICLES = 12;
        constexpr int DEATH_PARTICLES = 20;
        constexpr int LEVEL_UP_PARTICLES = 30;
        
        namespace COLORS {
            const sf::Color XP_COLOR(100, 200, 255);      // Light blue
            const sf::Color LEVEL_UP_COLOR(255, 215, 0);  // Gold
        }
    }
} 