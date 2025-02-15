#include "Game.h"
#include <stdexcept>
#include <iostream>
#include <cmath>
#include <cstdlib>
#include <algorithm>
#include <random>

// Define PI if we can't use std::numbers
constexpr float PI = 3.14159265358979323846f;

Game::Game() : 
    window(sf::VideoMode(CONFIG::WINDOW_WIDTH, CONFIG::WINDOW_HEIGHT), "Food Survivor"),
    // Load font first
    font([]{
        sf::Font f;
        if (!f.loadFromFile("assets/fonts/pixel.ttf")) {
            throw std::runtime_error("Could not load font");
        }
        return f;
    }()),
    // Initialize UI with font
    ui(font),
    state(GameState::Menu),
    lastEnemySpawn(0.f),
    score(0),
    wave(1),
    difficulty(1.f),
    soundEnabled(true),
    soundVolume(70.f)
{
    // Initialize random seed
    std::srand(static_cast<unsigned int>(std::time(nullptr)));
    
    window.setFramerateLimit(60);
    
    // Initialize player
    player = std::make_shared<Player>(
        sf::Vector2f(CONFIG::WINDOW_WIDTH/2, CONFIG::WINDOW_HEIGHT/2)
    );
    
    // Setup UI elements
    setupUI();
    
    // Initialize other systems
    loadSounds();
}

void Game::setupUI() {
    // Setup score text
    scoreText.setFont(font);
    scoreText.setCharacterSize(24);
    scoreText.setFillColor(sf::Color::White);
    scoreText.setPosition(10, 10);
    
    // Setup level text
    levelText.setFont(font);
    levelText.setCharacterSize(24);
    levelText.setFillColor(sf::Color::White);
    levelText.setPosition(10, 40);
    
    // Setup wave text
    waveText.setFont(font);
    waveText.setCharacterSize(24);
    waveText.setFillColor(sf::Color::White);
    waveText.setPosition(10, 70);
    
    updateUI();
}

void Game::updateUI() {
    scoreText.setString("Score: " + std::to_string(score));
    levelText.setString("Level: " + std::to_string(player->getLevel()));
    waveText.setString("Wave: " + std::to_string(wave));
}

void Game::run() {
    sf::Clock clock;
    
    while (window.isOpen()) {
        float deltaTime = clock.restart().asSeconds();
        
        processEvents();
        update(deltaTime);
        render();
    }
}

void Game::processEvents() {
    sf::Event event;
    while (window.pollEvent(event)) {
        if (event.type == sf::Event::Closed) {
            window.close();
        }
        else if (event.type == sf::Event::KeyPressed) {
            switch (event.key.code) {
                case sf::Keyboard::Escape:
                    if (state == GameState::Playing) {
                        togglePause();
                    }
                    break;
                case sf::Keyboard::Space:
                    if (state == GameState::Menu || state == GameState::GameOver) {
                        startGame();
                    }
                    break;
            }
        }
        
        if (state == GameState::LevelUp) {
            sf::Vector2i mousePos = sf::Mouse::getPosition(window);
            sf::Vector2f worldPos = window.mapPixelToCoords(mousePos);
            
            if (event.type == sf::Event::MouseButtonPressed) {
                if (ui.handleClick(worldPos)) {
                    handleLevelUp(ui.getSelectedOption());
                }
            }
        }
    }

    if (state == GameState::Playing) {
        // Update input state
        keys[sf::Keyboard::W] = sf::Keyboard::isKeyPressed(sf::Keyboard::W);
        keys[sf::Keyboard::A] = sf::Keyboard::isKeyPressed(sf::Keyboard::A);
        keys[sf::Keyboard::S] = sf::Keyboard::isKeyPressed(sf::Keyboard::S);
        keys[sf::Keyboard::D] = sf::Keyboard::isKeyPressed(sf::Keyboard::D);
        
        // Update mouse position
        sf::Vector2i mousePixelPos = sf::Mouse::getPosition(window);
        mousePos = window.mapPixelToCoords(mousePixelPos);
    }
}

void Game::startGame() {
    state = GameState::Playing;
    score = 0;
    wave = 1;
    difficulty = 1.0f;
    
    // Reset player
    player = std::make_shared<Player>(
        sf::Vector2f(CONFIG::WINDOW_WIDTH/2, CONFIG::WINDOW_HEIGHT/2)
    );
    
    // Clear game objects
    enemies.clear();
    projectiles.clear();
    particles = ParticleSystem();
    
    // Reset timers
    lastEnemySpawn = gameClock.getElapsedTime().asSeconds();
    
    // Update UI
    updateUI();
}

void Game::update(float deltaTime) {
    if (state != GameState::Playing) {
        return;
    }
        
    // Update player
    player->update(deltaTime);
    
    // Handle auto-shooting
    autoShoot(deltaTime);
    
    // Update enemies
    for (auto& enemy : enemies) {
        enemy->update(deltaTime);
    }
    
    // Update projectiles
    auto projIt = projectiles.begin();
    while (projIt != projectiles.end()) {
        if ((*projIt)->update(deltaTime)) {
            projIt = projectiles.erase(projIt);
        } else {
            ++projIt;
        }
    }
    
    // Spawn enemies
    float currentTime = gameClock.getElapsedTime().asSeconds();
    if (currentTime - lastEnemySpawn >= CONFIG::ENEMIES::SPAWN_RATE / difficulty) {
        spawnEnemy();
        lastEnemySpawn = currentTime;
    }
    
    // Check collisions
    checkCollisions();
    
    // Update particles
    particles.update(deltaTime);
    
    // Update UI
    updateUI();
    
    // Update UI with current score
    ui.setScore(score);
}

void Game::autoShoot(float deltaTime) {
    // Get all player weapons
    const auto& weapons = player->getWeapons();
    
    for (const auto& weapon : weapons) {
        // Find best target for this weapon
        auto target = findBestTarget(*weapon);
        if (target && weapon->isReady()) {
            // Create projectile
            auto newProjectile = weapon->createProjectile(target->getPosition());
            if (newProjectile) {
                projectiles.push_back(newProjectile);
                // Play shoot sound
                playSound("shoot");
            }
        }
    }
}

std::shared_ptr<Enemy> Game::findBestTarget(const Weapon& weapon) {
    if (enemies.empty()) return nullptr;
    
    std::shared_ptr<Enemy> bestTarget = nullptr;
    float bestScore = -1.0f;
    
    for (const auto& enemy : enemies) {
        // Calculate distance to enemy
        sf::Vector2f diff = enemy->getPosition() - player->getPosition();
        float distance = std::hypot(diff.x, diff.y);
        
        // Skip if enemy is out of range
        if (distance > weapon.getRange()) continue;
        
        // Calculate target score
        float score = calculateTargetScore(*enemy, distance, weapon);
        
        // Update best target if this one is better
        if (score > bestScore) {
            bestScore = score;
            bestTarget = enemy;
        }
    }
    
    return bestTarget;
}

float Game::calculateTargetScore(const Enemy& enemy, float distance, const Weapon& weapon) {
    // Base score is inverse of distance (closer targets are better)
    float score = 1.0f / (distance + 1.0f);
    
    // Prioritize enemies with lower health
    score *= (1.0f + (1.0f - enemy.getHealth() / enemy.getMaxHealth()));
    
    // Prioritize enemies that are closer to the player
    if (distance < weapon.getRange() * 0.5f) {
        score *= 1.5f;
    }
    
    return score;
}

void Game::render() {
    window.clear(sf::Color(17, 17, 17));
    
    switch (state) {
        case GameState::Menu: {
            // Draw start screen
            sf::RectangleShape overlay(sf::Vector2f(CONFIG::WINDOW_WIDTH, CONFIG::WINDOW_HEIGHT));
            overlay.setFillColor(sf::Color(0, 0, 0, 200));
            window.draw(overlay);
            
            // Draw title
            sf::Text title("FOOD SURVIVOR", font);
            title.setCharacterSize(64);
            title.setFillColor(sf::Color::Yellow);
            title.setOutlineThickness(3.f);
            title.setOutlineColor(sf::Color(200, 150, 0));
            title.setOrigin(title.getLocalBounds().width/2.f, title.getLocalBounds().height/2.f);
            title.setPosition(CONFIG::WINDOW_WIDTH/2.f, CONFIG::WINDOW_HEIGHT/3.f);
            
            // Create start button
            sf::RectangleShape startButton(sf::Vector2f(200.f, 60.f));
            startButton.setOrigin(100.f, 30.f);
            startButton.setPosition(CONFIG::WINDOW_WIDTH/2.f, CONFIG::WINDOW_HEIGHT * 0.6f);
            startButton.setFillColor(sf::Color(50, 50, 50));
            startButton.setOutlineThickness(2.f);
            startButton.setOutlineColor(sf::Color::White);
            
            sf::Text startText("START GAME", font);
            startText.setCharacterSize(24);
            startText.setFillColor(sf::Color::White);
            startText.setOrigin(startText.getLocalBounds().width/2.f, startText.getLocalBounds().height/2.f);
            startText.setPosition(CONFIG::WINDOW_WIDTH/2.f, CONFIG::WINDOW_HEIGHT * 0.6f);
            
            // Check if mouse is hovering over start button
            sf::Vector2i mousePos = sf::Mouse::getPosition(window);
            if (startButton.getGlobalBounds().contains(mousePos.x, mousePos.y)) {
                startButton.setFillColor(sf::Color(80, 80, 80));
                startButton.setOutlineColor(sf::Color::Yellow);
                if (sf::Mouse::isButtonPressed(sf::Mouse::Left)) {
                    startGame();
                }
            }
            
            window.draw(title);
            window.draw(startButton);
            window.draw(startText);
            break;
        }
        
        case GameState::Playing: {
            // Draw game objects
            for (const auto& projectile : projectiles)
                projectile->draw(window);
                
            for (const auto& enemy : enemies)
                enemy->draw(window);
                
            player->draw(window);
            particles.draw(window);
            
            // Draw UI
            ui.draw(window, *player);
            break;
        }
        
        case GameState::Paused: {
            // Draw game state (frozen)
            for (const auto& projectile : projectiles)
                projectile->draw(window);
            for (const auto& enemy : enemies)
                enemy->draw(window);
            player->draw(window);
            particles.draw(window);
            
            // Draw UI even when paused
            ui.draw(window, *player);
            
            // Draw pause overlay
            sf::RectangleShape overlay(sf::Vector2f(CONFIG::WINDOW_WIDTH, CONFIG::WINDOW_HEIGHT));
            overlay.setFillColor(sf::Color(0, 0, 0, 128));
            window.draw(overlay);
            
            sf::Text pauseText("PAUSED", font);
            pauseText.setCharacterSize(48);
            pauseText.setFillColor(sf::Color::White);
            pauseText.setPosition(
                CONFIG::WINDOW_WIDTH/2.f - pauseText.getLocalBounds().width/2.f,
                CONFIG::WINDOW_HEIGHT/2.f - pauseText.getLocalBounds().height/2.f
            );
            window.draw(pauseText);
            break;
        }
        
        case GameState::GameOver: {
            sf::Text gameOverText("GAME OVER", font);
            gameOverText.setCharacterSize(48);
            gameOverText.setFillColor(sf::Color::Red);
            gameOverText.setPosition(
                CONFIG::WINDOW_WIDTH/2 - gameOverText.getLocalBounds().width/2,
                CONFIG::WINDOW_HEIGHT/3
            );
            
            sf::Text scoreText("Score: " + std::to_string(score), font);
            scoreText.setCharacterSize(24);
            scoreText.setFillColor(sf::Color::White);
            scoreText.setPosition(
                CONFIG::WINDOW_WIDTH/2 - scoreText.getLocalBounds().width/2,
                CONFIG::WINDOW_HEIGHT/2
            );
            
            sf::Text restartText("Press SPACE to restart", font);
            restartText.setCharacterSize(24);
            restartText.setFillColor(sf::Color::White);
            restartText.setPosition(
                CONFIG::WINDOW_WIDTH/2 - restartText.getLocalBounds().width/2,
                CONFIG::WINDOW_HEIGHT * 2/3
            );
            
            window.draw(gameOverText);
            window.draw(scoreText);
            window.draw(restartText);
            break;
        }
        
        case GameState::LevelUp: {
            // Draw game state behind level up menu
            for (const auto& projectile : projectiles)
                projectile->draw(window);
            for (const auto& enemy : enemies)
                enemy->draw(window);
            player->draw(window);
            particles.draw(window);
            
            // Draw UI including XP bar
            ui.draw(window, *player);
            break;
        }
    }
    
    window.display();
}

void Game::loadSounds() {
    // Load sound files
    std::vector<std::string> soundFiles = {
        "hit", "shoot", "levelup"
    };
    
    for (const auto& name : soundFiles) {
        Sound sound;
        std::string path = "assets/sounds/" + name + ".wav";
        if (sound.buffer.loadFromFile(path)) {
            sound.sound.setBuffer(sound.buffer);
            sound.sound.setVolume(soundVolume);
            sounds[name] = sound;
        } else {
            std::cerr << "Failed to load sound: " << path << std::endl;
        }
    }
}

void Game::spawnEnemy() {
    // Randomly select enemy type
    int typeIndex = rand() % CONFIG::ENEMIES::TYPES.size();
    const auto& enemyData = CONFIG::ENEMIES::TYPES[typeIndex];
    
    // Spawn position outside screen
    float angle = static_cast<float>(rand()) / RAND_MAX * 2 * PI;
    float distance = 100.f; // Spawn distance from screen edge
    
    float spawnX = CONFIG::WINDOW_WIDTH/2 + std::cos(angle) * (CONFIG::WINDOW_WIDTH/2 + distance);
    float spawnY = CONFIG::WINDOW_HEIGHT/2 + std::sin(angle) * (CONFIG::WINDOW_HEIGHT/2 + distance);
    
    // Create enemy
    auto enemy = std::make_shared<Enemy>(
        sf::Vector2f(spawnX, spawnY),
        enemyData,
        player.get()
    );
    
    enemies.push_back(enemy);
}

void Game::checkCollisions() {
    // Check projectile-enemy collisions
    for (auto projIt = projectiles.begin(); projIt != projectiles.end();) {
        bool projectileDestroyed = false;
        const auto& projectile = *projIt;
        
        for (auto enemyIt = enemies.begin(); enemyIt != enemies.end();) {
            const auto& enemy = *enemyIt;
            
            // Calculate collision
            sf::Vector2f diff = projectile->getPosition() - enemy->getPosition();
            float distance = std::hypot(diff.x, diff.y);
            float collisionRadius = (enemy->getSize() + projectile->getSize()) * 0.5f;
            
            if (distance < collisionRadius) {
                // Create hit particles at collision point
                particles.createHitEffect(
                    projectile->getPosition(),
                    projectile->getColor()
                );
                
                // Play hit sound
                playSound("hit");
                
                // Apply damage
                if (enemy->takeDamage(projectile->getDamage())) {
                    // Enemy died
                    int xpGained = enemy->getXPValue();
                    player->addXP(xpGained);
                    score += xpGained;
                    
                    // Create XP particle effect
                    particles.createXPEffect(
                        enemy->getPosition(),
                        xpGained
                    );
                    
                    // Create death explosion
                    particles.createExplosion(
                        enemy->getPosition(),
                        enemy->getColor(),
                        enemy->getSize() * 1.5f
                    );
                    
                    // Check if player leveled up
                    if (player->getXP() >= player->getNextLevelXP()) {
                        showLevelUpMenu();
                        playSound("levelup");
                        
                        // Create level up effect
                        particles.createLevelUpEffect(player->getPosition());
                    }
                    
                    enemyIt = enemies.erase(enemyIt);
                } else {
                    ++enemyIt;
                }
                
                // Destroy projectile unless it's piercing
                if (!projectile->isPiercing()) {
                    projectileDestroyed = true;
                    break;  // Exit enemy loop since projectile is destroyed
                }
            } else {
                ++enemyIt;
            }
        }
        
        // Remove destroyed projectile or move to next one
        if (projectileDestroyed) {
            projIt = projectiles.erase(projIt);
        } else {
            ++projIt;
        }
    }
    
    // Check enemy-player collisions
    for (const auto& enemy : enemies) {
        sf::Vector2f diff = player->getPosition() - enemy->getPosition();
        float distance = std::hypot(diff.x, diff.y);
        float collisionRadius = (player->getSize() + enemy->getSize()) * 0.5f;
        
        if (distance < collisionRadius) {
            player->takeDamage(enemy->getDamage());
            
            // Create hit effect
            particles.createHitEffect(
                player->getPosition() + diff * 0.5f,  // Create effect at collision point
                sf::Color::Red,
                20.f  // Larger effect for player hits
            );
            
            playSound("hit");
            
            if (player->getHealth() <= 0) {
                gameOver();
                break;
            }
        }
    }
}

void Game::gameOver() {
    state = GameState::GameOver;
    
    // Save high score if needed
    // TODO: Implement high score system
    
    // Clear game objects
    enemies.clear();
    projectiles.clear();
    particles = ParticleSystem();  // Reset particle system
    
    // Play game over sound
    playSound("gameover");
    
    // Update UI
    updateUI();
}

void Game::playSound(const std::string& name) {
    if (!soundEnabled) return;
    
    auto it = sounds.find(name);
    if (it != sounds.end()) {
        it->second.sound.play();
    }
}

void Game::togglePause() {
    if (state == GameState::Playing) {
        state = GameState::Paused;
        // Optional: Play pause sound
        // playSound("pause");
    } else if (state == GameState::Paused) {
        state = GameState::Playing;
        // Optional: Play unpause sound
        // playSound("unpause");
    }
}

void Game::showLevelUpMenu() {
    state = GameState::LevelUp;  // Set game state to level up
    
    // Pause the game while showing menu
    for (auto& enemy : enemies) {
        enemy->pause();
    }
    
    // Select 3 random powerups
    currentPowerupOptions.clear();
    std::vector<int> indices;
    for (size_t i = 0; i < CONFIG::POWERUPS::TYPES.size(); ++i) {
        indices.push_back(i);
    }
    
    // Shuffle indices
    std::random_device rd;
    std::mt19937 gen(rd());
    std::shuffle(indices.begin(), indices.end(), gen);
    
    // Take first 3 options
    for (int i = 0; i < std::min(3, (int)indices.size()); ++i) {
        currentPowerupOptions.push_back(CONFIG::POWERUPS::TYPES[indices[i]]);
    }
    
    // Show menu in UI
    ui.showLevelUpMenu(currentPowerupOptions);
}

void Game::handleLevelUp(int optionIndex) {
    const auto& powerup = currentPowerupOptions[optionIndex];
    
    // Apply powerup effect
    if (powerup.effect == "armor") {
        player->increaseMaxHealth(powerup.value);
    }
    else if (powerup.effect == "speed") {
        player->setSpeedMultiplier(powerup.value);
    }
    else if (powerup.effect == "damage") {
        player->setDamageMultiplier(powerup.value);
    }
    else if (powerup.effect == "bullet_speed") {
        player->setProjectileSpeedMultiplier(powerup.value);
    }
    else if (powerup.effect == "new_weapon") {
        // Find the weapon data that matches this powerup
        for (const auto& weaponData : CONFIG::WEAPONS::TYPES) {
            if (weaponData.name == powerup.name) {
                player->addWeapon(weaponData);
                break;
            }
        }
    }
    
    // Resume enemies
    for (auto& enemy : enemies) {
        enemy->resume();
    }
    
    ui.hideLevelUpMenu();
    state = GameState::Playing;
} 