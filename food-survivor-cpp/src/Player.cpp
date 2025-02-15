#include "Player.h"
#include <cmath>
#include <algorithm>

Player::Player(const sf::Vector2f& position) : 
    position(position),
    size(CONFIG::PLAYER::SIZE),
    speed(CONFIG::PLAYER::SPEED),
    health(CONFIG::PLAYER::MAX_HEALTH),
    maxHealth(CONFIG::PLAYER::MAX_HEALTH),
    nextLevelXp(CONFIG::XP::BASE_NEXT_LEVEL),
    xp(0.f),  // Initialize XP to 0
    level(1)  // Start at level 1
{
    // Initialize main lemon shape
    shape.setRadius(size/2);
    shape.setOrigin(size/2, size/2);
    shape.setPosition(position);
    shape.setFillColor(sf::Color(255, 233, 0));  // Bright lemon yellow
    shape.setOutlineThickness(2.f);
    shape.setOutlineColor(sf::Color(220, 200, 0));  // Darker yellow for outline
    
    // Initialize leaf
    leafShape.setRadius(size/4);
    leafShape.setOrigin(size/4, size/4);
    leafShape.setPosition(position.x, position.y - size/2);
    leafShape.setFillColor(sf::Color(50, 180, 50));  // Green
    leafShape.setScale(1.0f, 0.5f);  // Make it oval-shaped
    leafShape.setRotation(45.f);  // Tilt the leaf

    // Add default weapon
    addWeapon(CONFIG::WEAPONS::TYPES[0]);
}

void Player::addXP(float amount) {
    xp += amount;
    if (xp >= nextLevelXp) {
        levelUp();
    }
}

void Player::levelUp() {
    level++;
    xp -= nextLevelXp;  // Subtract the XP needed for this level
    nextLevelXp *= CONFIG::XP::LEVEL_MULTIPLIER;  // Increase XP needed for next level
    health = maxHealth; // Heal on level up
    
    // Play level up sound
    // TODO: Add sound system reference
    
    // Show level up menu
    // This will be handled by Game class
}

void Player::addWeapon(const CONFIG::WEAPONS::WeaponData& weaponData) {
    weapons.push_back(std::make_shared<Weapon>(weaponData, this));
}

void Player::update(float deltaTime) {
    // Handle movement
    float dx = 0.f;
    float dy = 0.f;
    
    if (sf::Keyboard::isKeyPressed(sf::Keyboard::A) || sf::Keyboard::isKeyPressed(sf::Keyboard::Left)) dx -= 1.f;
    if (sf::Keyboard::isKeyPressed(sf::Keyboard::D) || sf::Keyboard::isKeyPressed(sf::Keyboard::Right)) dx += 1.f;
    if (sf::Keyboard::isKeyPressed(sf::Keyboard::W) || sf::Keyboard::isKeyPressed(sf::Keyboard::Up)) dy -= 1.f;
    if (sf::Keyboard::isKeyPressed(sf::Keyboard::S) || sf::Keyboard::isKeyPressed(sf::Keyboard::Down)) dy += 1.f;
    
    // Normalize diagonal movement
    if (dx != 0.f && dy != 0.f) {
        float length = std::hypot(dx, dy);
        dx /= length;
        dy /= length;
    }
    
    // Apply movement
    position.x += dx * speed * deltaTime;
    position.y += dy * speed * deltaTime;
    
    // Keep player in bounds
    position.x = std::clamp(position.x, 0.f, float(CONFIG::WINDOW_WIDTH - size));
    position.y = std::clamp(position.y, 0.f, float(CONFIG::WINDOW_HEIGHT - size));
    
    // Update shape positions
    shape.setPosition(position);
    leafShape.setPosition(position.x, position.y - size/2);
    
    // Add a slight wobble effect during movement
    if (dx != 0.f || dy != 0.f) {
        float wobble = std::sin(gameClock.getElapsedTime().asSeconds() * 10.f) * 3.f;
        shape.setRotation(wobble);
        leafShape.setRotation(45.f + wobble);
    }
    
    // Update weapons
    for (auto& weapon : weapons) {
        weapon->update(deltaTime);
    }
}

void Player::draw(sf::RenderWindow& window) {
    // Draw main lemon body
    window.draw(shape);
    
    // Draw leaf
    leafShape.setPosition(position.x, position.y - size/2);
    window.draw(leafShape);
}

void Player::takeDamage(float amount) {
    health = std::max(0.f, health - amount);
}

void Player::move(const bool* keys, float deltaTime) {
    float dx = 0.f;
    float dy = 0.f;
    
    if (keys[sf::Keyboard::A]) dx -= 1.f;
    if (keys[sf::Keyboard::D]) dx += 1.f;
    if (keys[sf::Keyboard::W]) dy -= 1.f;
    if (keys[sf::Keyboard::S]) dy += 1.f;
    
    // Normalize diagonal movement
    if (dx != 0.f && dy != 0.f) {
        float length = std::hypot(dx, dy);
        dx /= length;
        dy /= length;
    }
    
    // Apply movement
    position.x += dx * speed * deltaTime;
    position.y += dy * speed * deltaTime;
    
    // Keep player in bounds
    position.x = std::clamp(position.x, 0.f, float(CONFIG::WINDOW_WIDTH - size));
    position.y = std::clamp(position.y, 0.f, float(CONFIG::WINDOW_HEIGHT - size));
    
    // Update shape position
    shape.setPosition(position);
} 