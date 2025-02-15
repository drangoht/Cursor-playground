#pragma once
#include "Enemy.h"
#include <vector>
#include <functional>

class Boss : public Enemy {
public:
    Boss(const CONFIG::WAVES::BossData& data, const sf::Vector2f& position);
    void update(float deltaTime) override;
    void draw(sf::RenderWindow& window) override;

private:
    std::vector<std::function<void()>> attacks;
    float attackTimer;
    float attackCooldown;
    
    void initializeAttacks();
    void performRandomAttack();
}; 