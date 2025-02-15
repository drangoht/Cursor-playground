#include "Enemy.h"
#include "Player.h"
#include <cmath>

// Define PI if we can't use std::numbers
constexpr float PI = 3.14159265358979323846f;

Enemy::Enemy(const sf::Vector2f& position, const CONFIG::ENEMIES::EnemyData& data, Player* targetPlayer) :
    position(position),
    size(data.size),
    speed(data.speed),
    health(data.health),
    maxHealth(data.health),
    damage(data.damage),
    xpValue(data.xpValue),
    player(targetPlayer),
    rotationSpeed((rand() % 100 - 50) * 0.5f)  // Random rotation speed
{
    initializeShape(data);
}

void Enemy::initializeShape(const CONFIG::ENEMIES::EnemyData& data) {
    if (data.points <= 4) {
        // For simple shapes (triangle, square)
        shape.setPointCount(data.points);
        float radius = size / 2;
        
        for (int i = 0; i < data.points; ++i) {
            float angle = (i * 2 * PI / data.points) + (data.rotation * PI / 180.f);
            float x = radius * std::cos(angle);
            float y = radius * std::sin(angle);
            shape.setPoint(i, sf::Vector2f(x, y));
        }
    } else {
        // For circular shapes (fruits)
        shape.setPointCount(data.points);
        float radius = size / 2;
        
        for (int i = 0; i < data.points; ++i) {
            float angle = i * 2 * PI / data.points;
            float r = radius * (1.0f + 0.1f * std::sin(angle * 3)); // Slightly uneven for organic look
            float x = r * std::cos(angle);
            float y = r * std::sin(angle);
            shape.setPoint(i, sf::Vector2f(x, y));
        }
    }
    
    shape.setOrigin(size/2, size/2);
    shape.setPosition(position);
    shape.setFillColor(data.color);
    shape.setOutlineThickness(2.f);
    shape.setOutlineColor(data.outlineColor);
}

void Enemy::update(float deltaTime) {
    if (isPaused) return;  // Don't update if paused
    
    // Get direction to player
    sf::Vector2f playerPos = player->getPosition();
    sf::Vector2f direction = playerPos - position;
    
    // Normalize direction
    float length = std::hypot(direction.x, direction.y);
    if (length > 0) {
        direction.x /= length;
        direction.y /= length;
    }
    
    // Move towards player
    position += direction * speed * deltaTime;
    
    // Update shape position and rotation
    shape.setPosition(position);
    shape.rotate(rotationSpeed * deltaTime);
}

void Enemy::draw(sf::RenderWindow& window) {
    window.draw(shape);
}

bool Enemy::takeDamage(float amount) {
    health -= amount;
    return health <= 0;
}

void Enemy::pause() {
    isPaused = true;
}

void Enemy::resume() {
    isPaused = false;
} 