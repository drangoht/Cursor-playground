#include "UI.h"

UI::UI(sf::Font& font) : font(font) {
    // Setup score text
    scoreText.setFont(font);
    scoreText.setCharacterSize(24);
    scoreText.setFillColor(sf::Color::White);
    scoreText.setPosition(10.f, 10.f);
    
    // Setup XP bar (moved lower)
    xpBarBackground.setSize(sf::Vector2f(200.f, 20.f));
    xpBarBackground.setPosition(10.f, CONFIG::WINDOW_HEIGHT - 30.f);
    xpBarBackground.setFillColor(sf::Color(50, 50, 50));
    xpBarBackground.setOutlineThickness(2.f);
    xpBarBackground.setOutlineColor(sf::Color::White);
    
    xpBarFill.setSize(sf::Vector2f(0.f, 16.f));
    xpBarFill.setPosition(12.f, CONFIG::WINDOW_HEIGHT - 28.f);
    xpBarFill.setFillColor(sf::Color(100, 200, 255));
    
    levelText.setFont(font);
    levelText.setCharacterSize(16);
    levelText.setFillColor(sf::Color::White);
    levelText.setPosition(220.f, CONFIG::WINDOW_HEIGHT - 30.f);
    
    xpText.setFont(font);
    xpText.setCharacterSize(16);
    xpText.setFillColor(sf::Color::White);
    
    // Setup level up menu with semi-transparent background
    menuBackground.setSize(sf::Vector2f(600.f, 400.f));
    menuBackground.setOrigin(300.f, 200.f);
    menuBackground.setPosition(CONFIG::WINDOW_WIDTH/2.f, CONFIG::WINDOW_HEIGHT/2.f);
    menuBackground.setFillColor(sf::Color(30, 30, 30, 230));  // More transparent
    menuBackground.setOutlineThickness(2.f);
    menuBackground.setOutlineColor(sf::Color::White);
    
    // Setup level up menu title
    menuTitle.setFont(font);
    menuTitle.setString("LEVEL UP!");
    menuTitle.setCharacterSize(48);
    menuTitle.setFillColor(sf::Color::Yellow);
    menuTitle.setOutlineThickness(2.f);
    menuTitle.setOutlineColor(sf::Color(200, 150, 0));
    // Position will be set during draw
}

void UI::drawXPBar(sf::RenderWindow& window, const Player& player) {
    // Calculate XP ratio
    float xpRatio = player.getXP() / player.getNextLevelXP();
    
    // Update XP bar fill width
    xpBarFill.setSize(sf::Vector2f(196.f * xpRatio, 16.f));
    
    // Update level text
    levelText.setString("Level " + std::to_string(player.getLevel()));
    
    // Update XP text
    std::string xpString = std::to_string(static_cast<int>(player.getXP())) + 
                          " / " + 
                          std::to_string(static_cast<int>(player.getNextLevelXP()));
    xpText.setString(xpString);
    xpText.setPosition(
        xpBarBackground.getPosition().x + xpBarBackground.getSize().x + 10.f,
        xpBarBackground.getPosition().y
    );
    
    // Draw all elements
    window.draw(xpBarBackground);
    window.draw(xpBarFill);
    window.draw(levelText);
    window.draw(xpText);
}

void UI::showLevelUpMenu(const std::vector<CONFIG::POWERUPS::PowerupData>& options) {
    levelUpMenuVisible = true;
    currentOptions = options;
    selectedOption = -1;
    menuAnimationTime = 0.f;
    animationClock.restart();
    
    // Create option boxes and texts
    optionBoxes.clear();
    optionTexts.clear();
    optionDescriptions.clear();
    
    // Menu layout constants
    float boxWidth = 500.f;
    float boxHeight = 80.f;
    float verticalSpacing = 20.f;
    float totalHeight = (boxHeight + verticalSpacing) * options.size();
    float startY = CONFIG::WINDOW_HEIGHT/2.f - totalHeight/2.f + 30.f;  // Adjusted for title
    
    for (size_t i = 0; i < options.size(); ++i) {
        // Create box
        sf::RectangleShape box(sf::Vector2f(boxWidth, boxHeight));
        box.setOrigin(boxWidth/2.f, boxHeight/2.f);
        box.setPosition(
            CONFIG::WINDOW_WIDTH/2.f,
            startY + i * (boxHeight + verticalSpacing)
        );
        box.setFillColor(sf::Color(50, 50, 50, 230));
        box.setOutlineThickness(2.f);
        box.setOutlineColor(sf::Color::White);
        optionBoxes.push_back(box);
        
        // Create title text
        sf::Text title;
        title.setFont(font);
        title.setString(options[i].name);
        title.setCharacterSize(24);
        title.setFillColor(sf::Color::White);
        title.setPosition(
            CONFIG::WINDOW_WIDTH/2.f - boxWidth/2.f + 20.f,
            startY + i * (boxHeight + verticalSpacing) - boxHeight/4.f
        );
        optionTexts.push_back(title);
        
        // Create description text
        sf::Text desc;
        desc.setFont(font);
        desc.setString(options[i].description);
        desc.setCharacterSize(16);
        desc.setFillColor(sf::Color(200, 200, 200));
        desc.setPosition(
            CONFIG::WINDOW_WIDTH/2.f - boxWidth/2.f + 20.f,
            startY + i * (boxHeight + verticalSpacing) + boxHeight/8.f
        );
        optionDescriptions.push_back(desc);
    }
}

void UI::hideLevelUpMenu() {
    levelUpMenuVisible = false;
}

bool UI::handleClick(const sf::Vector2f& mousePos) {
    if (!levelUpMenuVisible) return false;
    
    for (size_t i = 0; i < optionBoxes.size(); ++i) {
        if (optionBoxes[i].getGlobalBounds().contains(mousePos)) {
            selectedOption = i;
            return true;
        }
    }
    return false;
}

void UI::draw(sf::RenderWindow& window, const Player& player) {
    // Draw score at top
    scoreText.setString("Score: " + std::to_string(score));
    scoreText.setPosition(10.f, 10.f);
    window.draw(scoreText);
    
    // Draw XP bar at bottom
    drawXPBar(window, player);
    
    // Draw level up menu if visible
    if (levelUpMenuVisible) {
        // Update animation time
        menuAnimationTime = std::min(animationClock.getElapsedTime().asSeconds() / MENU_ANIMATION_DURATION, 1.0f);
        float animProgress = getEaseOutBack(menuAnimationTime);
        
        // Draw semi-transparent overlay with fade in
        sf::RectangleShape overlay(sf::Vector2f(CONFIG::WINDOW_WIDTH, CONFIG::WINDOW_HEIGHT));
        overlay.setFillColor(sf::Color(0, 0, 0, static_cast<sf::Uint8>(180 * menuAnimationTime)));
        window.draw(overlay);
        
        // Draw menu title with scale animation
        float titleScale = animProgress;
        menuTitle.setScale(titleScale, titleScale);
        menuTitle.setOrigin(menuTitle.getLocalBounds().width/2.f, menuTitle.getLocalBounds().height/2.f);
        menuTitle.setPosition(
            CONFIG::WINDOW_WIDTH/2.f,
            CONFIG::WINDOW_HEIGHT/2.f - 180.f
        );
        window.draw(menuTitle);
        
        // Draw menu options with staggered animations
        for (size_t i = 0; i < optionBoxes.size(); ++i) {
            // Stagger the appearance of each option
            float optionDelay = 0.1f * i;  // 0.1 second delay between each option
            float optionTime = std::max(0.f, (menuAnimationTime * MENU_ANIMATION_DURATION - optionDelay)) / MENU_ANIMATION_DURATION;
            if (optionTime <= 0) continue;
            
            float optionProgress = getEaseOutBack(optionTime);
            
            // Scale and alpha animation for boxes
            sf::Vector2f originalScale = sf::Vector2f(1.f, 1.f);
            sf::Vector2f targetScale = sf::Vector2f(optionProgress, optionProgress);
            
            // Get mouse position for hover effect
            sf::Vector2i mousePos = sf::Mouse::getPosition(window);
            bool isHovered = optionBoxes[i].getGlobalBounds().contains(mousePos.x, mousePos.y);
            
            // Set box appearance based on state
            if (selectedOption == static_cast<int>(i)) {
                optionBoxes[i].setFillColor(sf::Color(80, 80, 80, static_cast<sf::Uint8>(230 * optionProgress)));
                optionBoxes[i].setOutlineColor(sf::Color(255, 255, 0, static_cast<sf::Uint8>(255 * optionProgress)));
            } else if (isHovered) {
                optionBoxes[i].setFillColor(sf::Color(60, 60, 60, static_cast<sf::Uint8>(230 * optionProgress)));
                optionBoxes[i].setOutlineColor(sf::Color(200, 200, 200, static_cast<sf::Uint8>(255 * optionProgress)));
            } else {
                optionBoxes[i].setFillColor(sf::Color(50, 50, 50, static_cast<sf::Uint8>(230 * optionProgress)));
                optionBoxes[i].setOutlineColor(sf::Color(255, 255, 255, static_cast<sf::Uint8>(255 * optionProgress)));
            }
            
            // Apply scale animation
            optionBoxes[i].setScale(targetScale);
            
            // Set text alpha
            optionTexts[i].setFillColor(sf::Color(255, 255, 255, static_cast<sf::Uint8>(255 * optionProgress)));
            optionDescriptions[i].setFillColor(sf::Color(200, 200, 200, static_cast<sf::Uint8>(255 * optionProgress)));
            
            // Draw option elements
            window.draw(optionBoxes[i]);
            window.draw(optionTexts[i]);
            window.draw(optionDescriptions[i]);
        }
    }
} 