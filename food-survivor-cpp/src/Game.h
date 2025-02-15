#pragma once
#include <SFML/Graphics.hpp>
#include <SFML/Audio.hpp>
#include "Player.h"
#include "Enemy.h"
#include "Projectile.h"
#include "ParticleSystem.h"
#include "Config.h"
#include "UI.h"
#include "Weapon.h"
#include <vector>
#include <memory>
#include <unordered_map>

class Game {
public:
    Game();
    void run();
    Player* getPlayer() { return player.get(); }

private:
    void processEvents();
    void update(float deltaTime);
    void render();
    void spawnEnemy();
    void checkCollisions();
    void handleLevelUp();
    void showMenu();
    void startGame();
    void togglePause();
    void gameOver();
    
    std::shared_ptr<Enemy> findBestTarget(const Weapon& weapon);
    float calculateTargetScore(const Enemy& enemy, float distance, const Weapon& weapon);
    void autoShoot(float deltaTime);
    void addDamageNumber(const sf::Vector2f& pos, float amount, const std::string& type = "damage");

    sf::RenderWindow window;
    std::shared_ptr<Player> player;
    std::vector<std::shared_ptr<Enemy>> enemies;
    std::vector<std::shared_ptr<Projectile>> projectiles;
    ParticleSystem particles;
    
    // Font needs to be declared before UI
    sf::Font font;
    UI ui;
    
    // Font and text
    sf::Text scoreText;
    sf::Text levelText;
    sf::Text waveText;
    
    sf::Clock gameClock;
    float lastEnemySpawn;
    GameState state;
    
    // Sound system
    struct Sound {
        sf::SoundBuffer buffer;
        sf::Sound sound;
    };
    std::unordered_map<std::string, Sound> sounds;
    bool soundEnabled;
    float soundVolume;
    
    // Game state
    int score;
    int wave;
    float difficulty;
    
    // Input state
    bool keys[256];
    sf::Vector2f mousePos;
    
    bool levelUpMenuShown = false;
    std::vector<CONFIG::POWERUPS::PowerupData> currentPowerupOptions;
    
    void loadSounds();
    void playSound(const std::string& name);
    void setupUI();
    void updateUI();
    void showLevelUpMenu();
    void handleLevelUp(int optionIndex);
}; 