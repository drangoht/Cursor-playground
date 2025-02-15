#pragma once
#include <SFML/Graphics.hpp>
#include "Config.h"

class Projectile {
public:
    Projectile(const sf::Vector2f& position, const sf::Vector2f& velocity,
               float damage = 1.f, const sf::Color& color = sf::Color::White,
               bool piercing = false);
               
    bool update(float deltaTime);
    void draw(sf::RenderWindow& window);
    void setPosition(const sf::Vector2f& newPos);
    
    sf::Vector2f getPosition() const { return position; }
    float getDamage() const { return damage; }
    bool isPiercing() const { return piercing; }
    float getSize() const { return shape.getRadius() * 2.f; }
    sf::Color getColor() const { return shape.getFillColor(); }

private:
    sf::Vector2f position;
    sf::Vector2f velocity;
    sf::CircleShape shape;
    float damage;
    bool piercing;
    float lifetime = 0.f;
    static constexpr float MAX_LIFETIME = 5.f;
}; 