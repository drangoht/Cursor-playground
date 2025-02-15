#include "PowerUp.h"
#include <cmath>
#include <numbers>

PowerUp::PowerUp(const CONFIG::POWERUPS::PowerupData& data, const sf::Vector2f& position) :
    data(data),
    position(position)
{
    shape.setRadius(16.f);
    shape.setPosition(position);
    shape.setFillColor(data.visualEffect.color);
    shape.setOrigin(16.f, 16.f);
}

void PowerUp::update(float deltaTime) {
    // Float animation
    floatOffset = std::sin(floatSpeed * gameClock.getElapsedTime().asSeconds()) * 5.f;
    shape.setPosition(position.x, position.y + floatOffset);

    // Visual effects
    if (data.visualEffect.glow) {
        float glowIntensity = (std::sin(gameClock.getElapsedTime().asSeconds() * 4.f) + 1.f) * 0.5f;
        shape.setOutlineColor(sf::Color(
            data.visualEffect.color.r,
            data.visualEffect.color.g,
            data.visualEffect.color.b,
            static_cast<sf::Uint8>(255 * glowIntensity)
        ));
        shape.setOutlineThickness(4.f);
    }
}

void PowerUp::draw(sf::RenderWindow& window) {
    window.draw(shape);
}

bool PowerUp::isColliding(const sf::Vector2f& point, float radius) {
    sf::Vector2f diff = point - position;
    return std::hypot(diff.x, diff.y) < (radius + shape.getRadius());
} 