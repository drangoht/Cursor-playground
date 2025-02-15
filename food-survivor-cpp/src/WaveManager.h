#pragma once
#include "Config.h"
#include <vector>

class Game;

class WaveManager {
public:
    WaveManager(Game* game);
    void update(float deltaTime);
    void startNewWave();
    int getCurrentWave() const { return currentWave; }
    float getDifficulty() const { return difficulty; }

private:
    Game* game;
    int currentWave = 0;
    float difficulty = 1.0f;
    float waveTimer = 0;
    float spawnTimer = 0;
    bool isBossWave = false;

    void spawnEnemy();
    void spawnBoss();
    void updateDifficulty();
}; 