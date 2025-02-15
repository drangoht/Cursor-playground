#include "Weapon.h"
#include "Player.h"
#include <cmath>
#include <numbers>

Weapon::Weapon(const CONFIG::WEAPONS::WeaponData& data, Player* owner) :
    name(data.name),
    owner(owner),
    damage(data.damage),
    currentDamage(data.damage),
    range(data.range),
    fireRate(data.fireRate),
    projectileSpeed(data.projectileSpeed),
    color(data.color),
    effectScale(data.effectScale),
    spread(data.spread),
    shield(data.isShield),
    piercing(data.isPiercing),
    orbital(data.isChain),
    orbitalCount(data.orbitalCount),
    chainCount(data.chainCount)
{
    if (shield) {
        createShieldProjectiles();
    } else if (orbital) {
        createOrbitalProjectiles();
    }
}

void Weapon::update(float deltaTime) {
    // Update existing projectiles
    auto it = projectiles.begin();
    while (it != projectiles.end()) {
        if ((*it)->update(deltaTime)) {
            it = projectiles.erase(it);
        } else {
            ++it;
        }
    }

    if (orbital || shield) {
        updateOrbitalProjectiles(deltaTime);
    }
}

std::shared_ptr<Projectile> Weapon::createProjectile(const sf::Vector2f& targetPos) {
    if (!isReady()) return nullptr;
    lastFireClock.restart();

    if (spread) {
        // Create spread projectiles
        const int spreadCount = 3;
        const float spreadAngle = 15.f * std::numbers::pi / 180.f;
        
        sf::Vector2f direction = targetPos - owner->getPosition();
        float baseAngle = std::atan2(direction.y, direction.x);
        
        // Return center projectile
        float angle = baseAngle;
        sf::Vector2f velocity(
            std::cos(angle) * projectileSpeed * projectileSpeedMultiplier,
            std::sin(angle) * projectileSpeed * projectileSpeedMultiplier
        );
        
        return std::make_shared<Projectile>(
            owner->getPosition(),
            velocity,
            currentDamage,
            color,
            piercing
        );
    } else {
        // Create single projectile
        sf::Vector2f direction = targetPos - owner->getPosition();
        float length = std::hypot(direction.x, direction.y);
        if (length > 0) {
            direction.x /= length;
            direction.y /= length;
        }
        
        return std::make_shared<Projectile>(
            owner->getPosition(),
            direction * projectileSpeed * projectileSpeedMultiplier,
            currentDamage,
            color,
            piercing
        );
    }
}

void Weapon::createOrbitalProjectiles() {
    const float radius = range;
    for (int i = 0; i < orbitalCount; ++i) {
        float angle = (i / static_cast<float>(orbitalCount)) * 2 * std::numbers::pi;
        sf::Vector2f pos(
            std::cos(angle) * radius,
            std::sin(angle) * radius
        );
        
        projectiles.push_back(std::make_shared<Projectile>(
            pos,
            sf::Vector2f(0, 0),
            damage,
            color,
            piercing
        ));
    }
}

void Weapon::createShieldProjectiles() {
    createOrbitalProjectiles(); // Shield uses same logic as orbital
}

void Weapon::updateOrbitalProjectiles(float deltaTime) {
    static float angle = 0;
    angle += deltaTime * 2; // Rotation speed
    
    const float radius = range;
    for (size_t i = 0; i < projectiles.size(); ++i) {
        float projectileAngle = angle + (i / static_cast<float>(projectiles.size())) * 2 * std::numbers::pi;
        sf::Vector2f pos = owner->getPosition() + sf::Vector2f(
            std::cos(projectileAngle) * radius,
            std::sin(projectileAngle) * radius
        );
        projectiles[i]->setPosition(pos);
    }
}

bool Weapon::isReady() const {
    return lastFireClock.getElapsedTime().asSeconds() >= fireRate;
} 