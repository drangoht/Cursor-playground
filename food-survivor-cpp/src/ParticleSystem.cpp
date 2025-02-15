#include "ParticleSystem.h"
#include <cmath>
#include <memory>
#include <algorithm>

constexpr float PI = 3.14159265358979323846f;

Particle::Particle(const sf::Vector2f& pos, const sf::Vector2f& vel, const sf::Color& col, float life) :
    position(pos),
    velocity(vel),
    color(col),
    lifetime(life),
    maxLifetime(life),
    size(3.f)
{
}

bool Particle::update(float deltaTime) {
    position += velocity * deltaTime;
    lifetime -= deltaTime;
    return lifetime > 0;
}

void Particle::draw(sf::RenderWindow& window) {
    float alpha = (lifetime / maxLifetime) * 255;
    
    if (!text.empty()) {
        // Draw text particle
        sf::Text textShape;
        textShape.setString(text);
        textShape.setPosition(position);
        textShape.setFillColor(sf::Color(color.r, color.g, color.b, static_cast<sf::Uint8>(alpha)));
        textShape.setCharacterSize(static_cast<unsigned int>(size));
        window.draw(textShape);
    } else {
        // Draw circle particle
        sf::CircleShape shape(size);
        shape.setPosition(position);
        shape.setFillColor(sf::Color(color.r, color.g, color.b, static_cast<sf::Uint8>(alpha)));
        window.draw(shape);
    }
}

void ParticleSystem::update(float deltaTime) {
    particles.erase(
        std::remove_if(particles.begin(), particles.end(),
            [deltaTime](Particle& p) { return !p.update(deltaTime); }),
        particles.end()
    );
}

void ParticleSystem::draw(sf::RenderWindow& window) {
    for (auto& particle : particles) {
        particle.draw(window);
    }
}

void ParticleSystem::createExplosion(const sf::Vector2f& position, const sf::Color& color, float size) {
    const int particleCount = 16;
    for (int i = 0; i < particleCount; ++i) {
        float angle = (i / static_cast<float>(particleCount)) * 2 * PI;
        float speed = 150.f + (rand() % 100);
        
        sf::Vector2f velocity(std::cos(angle) * speed, std::sin(angle) * speed);
        particles.emplace_back(
            position,
            velocity,
            color,
            0.5f  // lifetime
        );
        particles.back().setSize(size * 0.25f);
    }
    
    // Add some smaller particles for detail
    for (int i = 0; i < particleCount; ++i) {
        float angle = (rand() % 360) * PI / 180.f;
        float speed = 50.f + (rand() % 100);
        
        sf::Vector2f velocity(std::cos(angle) * speed, std::sin(angle) * speed);
        particles.emplace_back(
            position,
            velocity,
            sf::Color(color.r, color.g, color.b, 128),
            0.7f  // lifetime
        );
        particles.back().setSize(size * 0.15f);
    }
}

void ParticleSystem::createHitEffect(const sf::Vector2f& position, const sf::Color& color, float size) {
    const int particleCount = 8;
    for (int i = 0; i < particleCount; ++i) {
        float angle = (i / static_cast<float>(particleCount)) * 2 * PI;
        float speed = 100.f + (rand() % 50);
        
        sf::Vector2f velocity(std::cos(angle) * speed, std::sin(angle) * speed);
        particles.emplace_back(
            position,
            velocity,
            color,
            0.3f  // lifetime
        );
        particles.back().setSize(size * 0.2f);
    }
}

void ParticleSystem::createXPEffect(const sf::Vector2f& position, float amount) {
    Particle particle;
    particle.position = position;
    particle.velocity = sf::Vector2f(0.f, -50.f);  // Float upward
    particle.color = CONFIG::EFFECTS::COLORS::XP_COLOR;
    particle.lifetime = 1.0f;
    particle.maxLifetime = 1.0f;
    particle.size = 16.f;
    particle.text = "+" + std::to_string(static_cast<int>(amount)) + " XP";
    particles.push_back(particle);
}

void ParticleSystem::createLevelUpEffect(const sf::Vector2f& position) {
    const int numParticles = CONFIG::EFFECTS::LEVEL_UP_PARTICLES;
    const float speed = 200.f;
    
    for (int i = 0; i < numParticles; ++i) {
        float angle = (i / static_cast<float>(numParticles)) * 2 * PI;
        
        Particle particle;
        particle.position = position;
        particle.velocity = sf::Vector2f(
            std::cos(angle) * speed,
            std::sin(angle) * speed
        );
        particle.color = CONFIG::EFFECTS::COLORS::LEVEL_UP_COLOR;
        particle.lifetime = 1.0f;
        particle.maxLifetime = 1.0f;
        particle.size = 8.f;
        particles.push_back(particle);
    }
} 