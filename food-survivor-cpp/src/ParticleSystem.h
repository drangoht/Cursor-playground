#pragma once
#include <SFML/Graphics.hpp>
#include <vector>
#include <memory>
#include "Config.h"

class Particle {
public:
    Particle() = default;
    Particle(const sf::Vector2f& pos, const sf::Vector2f& vel, const sf::Color& col, float life);
    bool update(float deltaTime);
    void draw(sf::RenderWindow& window);
    void setSize(float newSize) { size = newSize; }

    // Make these public for easier access
    sf::Vector2f position;
    sf::Vector2f velocity;
    sf::Color color;
    float lifetime;
    float maxLifetime;
    float size;
    std::string text;  // For XP numbers
};

class ParticleSystem {
public:
    void update(float deltaTime);
    void draw(sf::RenderWindow& window);
    void createExplosion(const sf::Vector2f& position, const sf::Color& color, float size = 30.f);
    void createHitEffect(const sf::Vector2f& position, const sf::Color& color, float size = 10.f);
    void createXPEffect(const sf::Vector2f& position, float amount);
    void createLevelUpEffect(const sf::Vector2f& position);

private:
    std::vector<Particle> particles;
}; 