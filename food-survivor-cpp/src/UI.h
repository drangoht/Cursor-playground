#pragma once
#include <SFML/Graphics.hpp>
#include "Config.h"
#include "Player.h"
#include <vector>
#include <string>
#include <cmath>  // Add this for pow function

class UI {
public:
    UI(sf::Font& font);
    void draw(sf::RenderWindow& window, const Player& player);
    void showLevelUpMenu(const std::vector<CONFIG::POWERUPS::PowerupData>& options);
    void hideLevelUpMenu();
    bool handleClick(const sf::Vector2f& mousePos);
    int getSelectedOption() const { return selectedOption; }
    bool isLevelUpMenuVisible() const { return levelUpMenuVisible; }
    void setScore(int newScore) { score = newScore; }

private:
    void drawXPBar(sf::RenderWindow& window, const Player& player);
    void drawLevelUpMenu(sf::RenderWindow& window);
    
    sf::Font& font;
    sf::RectangleShape xpBarBackground;
    sf::RectangleShape xpBarFill;
    sf::Text levelText;
    sf::Text xpText;
    sf::Text scoreText;
    
    bool levelUpMenuVisible = false;
    std::vector<CONFIG::POWERUPS::PowerupData> currentOptions;
    int selectedOption = -1;
    
    // Level up menu elements
    sf::RectangleShape menuBackground;
    sf::Text menuTitle;
    std::vector<sf::RectangleShape> optionBoxes;
    std::vector<sf::Text> optionTexts;
    std::vector<sf::Text> optionDescriptions;
    int score = 0;
    
    // Animation properties
    float menuAnimationTime = 0.f;
    const float MENU_ANIMATION_DURATION = 0.3f;  // Animation duration in seconds
    sf::Clock animationClock;
    
    float getEaseOutBack(float t) {
        const float c1 = 1.70158f;
        const float c3 = c1 + 1.f;
        return 1.f + c3 * std::pow(t - 1.f, 3.f) + c1 * std::pow(t - 1.f, 2.f);
    }
}; 