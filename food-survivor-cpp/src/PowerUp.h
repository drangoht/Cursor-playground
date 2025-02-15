#pragma once
#include <SFML/Graphics.hpp>
#include "Config.h"

class PowerUp {
public:
    PowerUp(const CONFIG::POWERUPS::PowerupData& data, const sf::Vector2f& position);
    void update(float deltaTime);
    void draw(sf::RenderWindow& window);
    bool isColliding(const sf::Vector2f& point, float radius);
    const CONFIG::POWERUPS::PowerupData& getData() const { return data; }

private:
    CONFIG::POWERUPS::PowerupData data;
    sf::Vector2f position;
    sf::CircleShape shape;
    float floatOffset = 0;
    float floatSpeed = 3.0f;
}; 