#pragma once
#include <SFML/Graphics.hpp>
#include "Config.h"
#include "Projectile.h"
#include <memory>
#include <vector>

class Player;

class Weapon {
public:
    Weapon(const CONFIG::WEAPONS::WeaponData& data, Player* owner);
    
    void update(float deltaTime);
    void fire(const sf::Vector2f& targetPos);
    std::shared_ptr<Projectile> createProjectile(const sf::Vector2f& targetPos);
    void clearProjectiles();
    const std::vector<std::shared_ptr<Projectile>>& getProjectiles() const { return projectiles; }

    float getDamage() const { return currentDamage; }
    float getRange() const { return range; }
    float getFireRate() const { return fireRate; }
    bool isReady() const;
    bool isPiercing() const { return piercing; }
    bool isOrbital() const { return orbital; }
    bool isShield() const { return shield; }

    // Add damage multiplier methods
    void setDamageMultiplier(float value) {
        damageMultiplier = value;
        currentDamage = damage * damageMultiplier;
    }

    void setProjectileSpeedMultiplier(float value) {
        projectileSpeedMultiplier = value;
    }

private:
    std::string name;
    Player* owner;
    float damage;            // Base damage
    float currentDamage;     // Damage after multiplier
    float damageMultiplier = 1.0f;
    float range;
    float fireRate;
    float projectileSpeed;
    float projectileSpeedMultiplier = 1.0f;
    sf::Color color;
    float effectScale;
    bool spread;
    bool shield;
    bool piercing;
    bool orbital;
    int orbitalCount;
    int chainCount;
    sf::Clock lastFireClock;
    std::vector<std::shared_ptr<Projectile>> projectiles;

    void createOrbitalProjectiles();
    void createShieldProjectiles();
    void updateOrbitalProjectiles(float deltaTime);
}; 