#pragma once
#include <SFML/Graphics.hpp>
#include "Config.h"

class Player;  // Forward declaration

class Enemy {
public:
    Enemy(const sf::Vector2f& position, const CONFIG::ENEMIES::EnemyData& data, Player* targetPlayer);
    void update(float deltaTime);
    void draw(sf::RenderWindow& window);
    sf::Vector2f getPosition() const { return position; }
    float getSize() const { return size; }
    float getDamage() const { return damage; }
    float getHealth() const { return health; }
    float getMaxHealth() const { return maxHealth; }
    sf::Color getColor() const { return shape.getFillColor(); }
    int getXPValue() const { return xpValue; }
    bool takeDamage(float amount);
    void pause();
    void resume();
    bool isPausing() const { return isPaused; }

protected:
    sf::Vector2f position;
    sf::ConvexShape shape;
    float size;
    float speed;
    float health;
    float maxHealth;
    float damage;
    int xpValue;
    Player* player;  // Reference to player
    float rotationSpeed;  // Add rotation for some enemies
    bool isPaused = false;

private:
    void initializeShape(const CONFIG::ENEMIES::EnemyData& data);
}; 