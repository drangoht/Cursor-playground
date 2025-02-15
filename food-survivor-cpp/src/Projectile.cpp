#include "Projectile.h"
#include "Config.h"

Projectile::Projectile(const sf::Vector2f& position, const sf::Vector2f& velocity,
                       float damage, const sf::Color& color, bool piercing) :
    position(position),
    velocity(velocity),
    damage(damage),
    piercing(piercing)
{
    shape.setRadius(6.f);
    shape.setOrigin(6.f, 6.f);
    shape.setPosition(position);
    shape.setFillColor(color);
    
    // Add glow effect
    shape.setOutlineThickness(2.f);
    shape.setOutlineColor(sf::Color(color.r, color.g, color.b, 128));
}

bool Projectile::update(float deltaTime) {
    lifetime += deltaTime;
    if (lifetime >= MAX_LIFETIME) {
        return true;  // Destroy projectile
    }
    
    position += velocity * deltaTime;
    shape.setPosition(position);
    
    // Check if out of bounds
    return position.x < -50.f || position.x > CONFIG::WINDOW_WIDTH + 50.f ||
           position.y < -50.f || position.y > CONFIG::WINDOW_HEIGHT + 50.f;
}

void Projectile::draw(sf::RenderWindow& window) {
    window.draw(shape);
}

void Projectile::setPosition(const sf::Vector2f& newPos) {
    position = newPos;
    shape.setPosition(position);
} 