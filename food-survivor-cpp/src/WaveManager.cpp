#include "WaveManager.h"
#include "Game.h"
#include <cmath>
#include <random>

WaveManager::WaveManager(Game* game) : 
    game(game),
    currentWave(0),
    difficulty(1.0f),
    waveTimer(0),
    spawnTimer(0),
    isBossWave(false)
{
}

void WaveManager::update(float deltaTime) {
    waveTimer += deltaTime;
    spawnTimer += deltaTime;

    // Check for wave completion
    if (waveTimer >= CONFIG::WAVES::DURATION) {
        startNewWave();
        return;
    }

    // Spawn enemies
    if (spawnTimer >= CONFIG::ENEMIES::SPAWN_RATE / difficulty) {
        spawnEnemy();
        spawnTimer = 0;
    }
}

void WaveManager::startNewWave() {
    currentWave++;
    waveTimer = 0;
    spawnTimer = 0;
    
    // Check if it's a boss wave
    isBossWave = (currentWave % CONFIG::WAVES::BOSS_EVERY == 0);
    
    if (isBossWave) {
        spawnBoss();
    }
    
    updateDifficulty();
}

void WaveManager::spawnEnemy() {
    // Random spawn position outside screen
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_real_distribution<float> angleDist(0, 2 * std::numbers::pi);
    
    float angle = angleDist(gen);
    float distance = 100.f; // Spawn distance from screen edge
    
    float spawnX = CONFIG::WINDOW_WIDTH/2 + std::cos(angle) * (CONFIG::WINDOW_WIDTH/2 + distance);
    float spawnY = CONFIG::WINDOW_HEIGHT/2 + std::sin(angle) * (CONFIG::WINDOW_HEIGHT/2 + distance);
    
    // Select random enemy type based on current wave
    std::uniform_int_distribution<> typeDist(0, std::min(
        static_cast<int>(CONFIG::ENEMIES::TYPES.size() - 1),
        currentWave / 2
    ));
    
    const auto& enemyData = CONFIG::ENEMIES::TYPES[typeDist(gen)];
    game->spawnEnemy(sf::Vector2f(spawnX, spawnY), enemyData, game->getPlayer());
}

void WaveManager::spawnBoss() {
    // Select boss based on wave number
    int bossIndex = (currentWave / CONFIG::WAVES::BOSS_EVERY - 1) % CONFIG::WAVES::BOSSES.size();
    const auto& bossData = CONFIG::WAVES::BOSSES[bossIndex];
    
    // Spawn at center top of screen
    game->spawnBoss(sf::Vector2f(
        CONFIG::WINDOW_WIDTH / 2,
        -bossData.size
    ));
}

void WaveManager::updateDifficulty() {
    // Increase difficulty with each wave
    difficulty = 1.0f + (currentWave - 1) * 0.1f;
    
    // Cap difficulty at 3.0
    difficulty = std::min(difficulty, 3.0f);
} 