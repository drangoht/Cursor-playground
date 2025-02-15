#pragma once
#include <SFML/Graphics.hpp>
#include "Config.h"
#include "Weapon.h"
#include <vector>
#include <memory>

class Player {
public:
    Player(const sf::Vector2f& position);
    void update(float deltaTime);
    void draw(sf::RenderWindow& window);
    int getLevel() const { return level; }
    sf::Vector2f getPosition() const { return position; }
    float getSize() const { return size; }
    float getHealth() const { return health; }
    void takeDamage(float amount);
    void move(const bool* keys, float deltaTime);
    void addXP(float amount);
    void levelUp();
    void addWeapon(const CONFIG::WEAPONS::WeaponData& weaponData);
    const std::vector<std::shared_ptr<Weapon>>& getWeapons() const { return weapons; }
    float getXP() const { return xp; }
    float getNextLevelXP() const { return nextLevelXp; }
    void setSpeedMultiplier(float value) { 
        speedMultiplier = value; 
        speed = CONFIG::PLAYER::SPEED * speedMultiplier;
    }
    void setDamageMultiplier(float value) { 
        damageMultiplier = value;
        for (auto& weapon : weapons) {
            weapon->setDamageMultiplier(value);
        }
    }
    void increaseMaxHealth(float percentage) {
        maxHealth *= (1.0f + percentage/100.f);
        health = maxHealth;  // Heal to new max
    }
    void setProjectileSpeedMultiplier(float value) {
        projectileSpeedMultiplier = value;
        for (auto& weapon : weapons) {
            weapon->setProjectileSpeedMultiplier(value);
        }
    }

private:
    sf::Vector2f position;
    sf::CircleShape shape;
    sf::CircleShape leafShape;
    float size;
    float speed;
    float health;
    float maxHealth;
    int level = 1;
    float xp = 0;
    float nextLevelXp;
    std::vector<std::shared_ptr<Weapon>> weapons;
    static inline sf::Clock gameClock;  // For animation timing
    float speedMultiplier = 1.0f;
    float damageMultiplier = 1.0f;
    float projectileSpeedMultiplier = 1.0f;
}; 