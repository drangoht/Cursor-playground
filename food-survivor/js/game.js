class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.canvas.width = CONFIG.CANVAS_WIDTH;
        this.canvas.height = CONFIG.CANVAS_HEIGHT;
        
        // Create sprites first
        this.sprites = new Sprites();
        
        this.settings = new Settings();
        this.highScores = new HighScores();
        this.damageNumbers = [];
        
        // Initialize game state
        this.gameState = 'menu';
        this.isLooping = true;
        
        // Initialize game objects
        this.reset();
        
        // Setup logo
        const logoContainer = document.querySelector('.pixel-art-logo');
        if (logoContainer) {
            logoContainer.innerHTML = ''; // Clear any existing content
            logoContainer.appendChild(this.sprites.logo);
        }
        
        // Hide all overlays except main menu
        this.hideAllOverlays();
        document.getElementById('menu-screen').classList.remove('hidden');
        
        // Setup event listeners
        this.setupEventListeners();
        this.setupMenuListeners();
        
        // Start game loop
        requestAnimationFrame(() => this.gameLoop());
    }

    hideAllOverlays() {
        const overlays = [
            'menu-screen',
            'game-over-screen',
            'pause-menu',
            'settings-menu',
            'highscores-menu',
            'level-up-menu'
        ];
        
        overlays.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.classList.add('hidden');
            }
        });
    }

    showMenu() {
        this.gameState = 'menu';
        this.hideAllOverlays();
        document.getElementById('menu-screen').classList.remove('hidden');
    }

    startGame() {
        console.log('startGame called, current state:', this.gameState); // Debug log
        this.reset();
        this.gameState = 'playing';
        this.hideAllOverlays();
        
        // Initialize player and game objects
        this.player = new Player(CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2);
        this.player.game = this;
        this.enemies = [];
        this.projectiles = [];
        this.particles = new ParticleSystem();
        
        console.log('Game started, state:', this.gameState); // Debug log
    }

    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            document.getElementById('pause-menu').classList.remove('hidden');
        } else if (this.gameState === 'paused') {
            this.resumeGame();
        }
    }

    resumeGame() {
        this.gameState = 'playing';
        this.hideAllOverlays();
    }

    gameLoop() {
        if (this.gameState === 'playing') {
            this.update();
        }
        
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }

    reset() {
        this.player = new Player(CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2);
        this.player.game = this;
        this.enemies = [];
        this.projectiles = [];
        this.particles = new ParticleSystem();
        this.waveManager = new WaveManager(this);
        this.keys = {};
        this.mouseX = 0;
        this.mouseY = 0;
        this.lastShot = 0;
        this.lastAutoShot = 0;
        this.soundEnabled = false;
        this.score = 0;
        this.wave = 1;
        this.damageNumbers = [];
    }

    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.gameState === 'playing') {
                    this.togglePause();
                } else if (this.gameState === 'paused') {
                    this.resumeGame();
                }
                return;
            }
            
            if (this.gameState === 'playing') {
                this.keys[e.key] = true;
                this.soundEnabled = true;
            }
        });

        window.addEventListener('keyup', (e) => {
            if (this.gameState === 'playing') {
                this.keys[e.key] = false;
            }
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.gameState === 'playing') {
                const rect = this.canvas.getBoundingClientRect();
                this.mouseX = e.clientX - rect.left;
                this.mouseY = e.clientY - rect.top;
            }
        });
    }

    setupMenuListeners() {
        const startButton = document.getElementById('start-button');
        if (startButton) {
            startButton.onclick = () => {
                console.log('Starting game...'); // Debug log
                this.startGame();
            };
        }

        const resumeButton = document.getElementById('resume-button');
        if (resumeButton) {
            resumeButton.onclick = () => this.resumeGame();
        }

        const pauseRestartButton = document.getElementById('pause-restart-button');
        if (pauseRestartButton) {
            pauseRestartButton.onclick = () => this.startGame();
        }

        const quitButton = document.getElementById('quit-to-menu');
        if (quitButton) {
            quitButton.onclick = () => {
                this.gameState = 'menu';
                this.hideAllOverlays();
                document.getElementById('menu-screen').classList.remove('hidden');
            };
        }
    }

    showSettings() {
        document.getElementById('menu-screen').classList.add('hidden');
        document.getElementById('settings-menu').classList.remove('hidden');
        
        // Apply current settings and setup listeners
        this.settings.applySettings();
        this.settings.setupListeners();
    }

    showHighScores() {
        document.getElementById('menu-screen').classList.add('hidden');
        document.getElementById('highscores-menu').classList.remove('hidden');
        this.highScores.updateDisplay();
    }

    update() {
        if (this.gameState !== 'playing') return;

        // Update game objects
        this.player.update(this.keys);
        this.enemies.forEach(enemy => enemy.update());
        this.projectiles = this.projectiles.filter(projectile => !projectile.update());
        this.particles.update();
        
        // Spawn enemies
        this.spawnEnemy();
        
        // Check collisions
        this.checkCollisions();
        
        // Auto-shoot
        this.autoShoot();
        
        // Update damage numbers
        this.damageNumbers = this.damageNumbers.filter(number => 
            number.update(1/60)
        );
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.gameState === 'playing' || this.gameState === 'paused' || this.gameState === 'levelUp') {
            this.player.draw(this.ctx);
            this.enemies.forEach(enemy => enemy.draw(this.ctx));
            this.projectiles.forEach(projectile => projectile.draw(this.ctx));
            this.particles.draw(this.ctx);
            
            // Draw target indicator if enabled
            if (this.settings.settings.showTarget) {
                this.drawTargetIndicator();
            }
            
            // Draw damage numbers
            if (this.settings.settings.showDamage) {
                this.damageNumbers.forEach(number => number.draw(this.ctx));
            }
        }
    }

    drawTargetIndicator() {
        const target = this.findBestTarget();
        if (target) {
            this.ctx.save();
            this.ctx.strokeStyle = '#ffeb3b';
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([5, 5]);
            this.ctx.beginPath();
            this.ctx.arc(target.x, target.y, 20, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.restore();
        }
    }

    playSound(sound) {
        if (this.soundEnabled && ASSETS.SOUNDS[sound]) {
            try {
                ASSETS.SOUNDS[sound].volume = this.settings.settings.sfxVolume / 100;
                ASSETS.SOUNDS[sound].currentTime = 0;
                ASSETS.SOUNDS[sound].play().catch(e => {
                    if (e.name === 'NotAllowedError') {
                        this.soundEnabled = false;
                    }
                });
            } catch (e) {
                console.warn('Sound playback error:', e);
            }
        }
    }

    shoot() {
        const now = Date.now();
        if (now - this.lastShot >= this.player.weapons[0].fireRate) {
            this.projectiles.push(new Projectile(
                this.player.x + this.player.size / 2,
                this.player.y + this.player.size / 2,
                this.mouseX,
                this.mouseY,
                this.player.weapons[0]
            ));
            this.lastShot = now;
            this.playSound('shoot');
        }
    }

    spawnEnemy() {
        const now = Date.now();
        if (!this.lastEnemySpawn) {
            this.lastEnemySpawn = now;
        }
        
        if (now - this.lastEnemySpawn >= CONFIG.ENEMIES.SPAWN_RATE) {
            // Choose spawn position outside the screen
            let x, y;
            const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
            
            switch(side) {
                case 0: // top
                    x = Math.random() * CONFIG.CANVAS_WIDTH;
                    y = -32;
                    break;
                case 1: // right
                    x = CONFIG.CANVAS_WIDTH + 32;
                    y = Math.random() * CONFIG.CANVAS_HEIGHT;
                    break;
                case 2: // bottom
                    x = Math.random() * CONFIG.CANVAS_WIDTH;
                    y = CONFIG.CANVAS_HEIGHT + 32;
                    break;
                case 3: // left
                    x = -32;
                    y = Math.random() * CONFIG.CANVAS_HEIGHT;
                    break;
            }
            
            const randomType = CONFIG.ENEMIES.TYPES[
                Math.floor(Math.random() * CONFIG.ENEMIES.TYPES.length)
            ];
            
            const enemy = new Enemy(randomType, x, y, this.player);
            this.enemies.push(enemy);
            this.lastEnemySpawn = now;
        }
    }

    checkCollisions() {
        // Projectile-Enemy collisions
        this.projectiles = this.projectiles.filter(projectile => {
            let projectileHit = false;
            
            this.enemies = this.enemies.filter(enemy => {
                if (this.checkCollision(projectile, enemy)) {
                    const damage = projectile.weapon.damage;
                    const enemyDied = enemy.takeDamage(damage);
                    
                    // Add damage number
                    this.addDamageNumber(
                        enemy.x + enemy.size/2,
                        enemy.y,
                        damage
                    );
                    
                    this.particles.createHitEffect(
                        projectile.x,
                        projectile.y,
                        enemy.getEnemyColor()
                    );
                    projectileHit = true;
                    
                    if (enemyDied) {
                        this.player.addXp(enemy.xpValue);
                        this.addDamageNumber(
                            enemy.x + enemy.size/2,
                            enemy.y - 20,
                            enemy.xpValue,
                            'xp'
                        );
                        this.particles.createXPEffect(enemy.x, enemy.y);
                        return false;
                    }
                }
                return true;
            });
            
            return !projectileHit && !projectile.isExpired();
        });

        // Enemy-Player collisions
        this.enemies.forEach(enemy => {
            if (this.checkCollision(enemy, this.player)) {
                // Handle player damage with invincibility frames
                if (!this.player.isInvulnerable) {
                    this.player.takeDamage(enemy.damage);
                }
            }
        });
    }

    checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.size &&
               obj1.x + obj1.size > obj2.x &&
               obj1.y < obj2.y + obj2.size &&
               obj1.y + obj1.size > obj2.y;
    }

    findBestTarget() {
        let bestTarget = null;
        let bestScore = -Infinity;
        
        for (const enemy of this.enemies) {
            const dx = enemy.x - this.player.x;
            const dy = enemy.y - this.player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Calculate target score based on multiple factors
            const score = this.calculateTargetScore(enemy, distance);
            
            if (score > bestScore) {
                bestScore = score;
                bestTarget = enemy;
            }
        }
        
        return bestTarget;
    }

    calculateTargetScore(enemy, distance) {
        // Base score is inverse of distance (closer is better)
        let score = 1000 / (distance + 1);
        
        // Prioritize enemies with lower health
        score += (1 - enemy.health / enemy.maxHealth) * 500;
        
        // Prioritize enemies that are closer to the player
        if (distance < 200) {
            score += 300;
        }
        
        // Prioritize more dangerous enemies
        score += enemy.damage * 10;
        
        return score;
    }

    autoShoot() {
        const now = Date.now();
        if (!this.lastAutoShot) {
            this.lastAutoShot = now;
        }

        // Fire all weapons that are ready
        this.player.weapons.forEach(weapon => {
            if (now - weapon.lastFired >= weapon.fireRate) {
                // Skip targeting for orbital/shield weapons
                if (weapon.isOrbital || weapon.isShield) {
                    this.player.fireWeapon(weapon);
                    weapon.lastFired = now;
                    return;
                }

                const target = this.findBestTargetForWeapon(weapon);
                if (target) {
                    // Update player's target coordinates for weapon firing
                    this.player.targetX = target.x + target.size/2;
                    this.player.targetY = target.y + target.size/2;
                    
                    // Fire weapon
                    this.player.fireWeapon(weapon);
                    weapon.lastFired = now;
                }
            }
        });
    }

    findBestTargetForWeapon(weapon) {
        let bestTarget = null;
        let bestScore = -Infinity;
        
        for (const enemy of this.enemies) {
            const dx = enemy.x - this.player.x;
            const dy = enemy.y - this.player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Skip if enemy is out of weapon range
            if (distance > weapon.range) continue;
            
            // Calculate weapon-specific target score
            const score = this.calculateWeaponTargetScore(weapon, enemy, distance);
            
            if (score > bestScore) {
                bestScore = score;
                bestTarget = enemy;
            }
        }
        
        return bestTarget;
    }

    calculateWeaponTargetScore(weapon, enemy, distance) {
        let score = 1000 / (distance + 1);
        
        // Spread weapons prefer grouped enemies
        if (weapon.spread) {
            const nearbyEnemies = this.enemies.filter(other => {
                const dx = other.x - enemy.x;
                const dy = other.y - enemy.y;
                return Math.sqrt(dx * dx + dy * dy) < 100;
            }).length;
            score += nearbyEnemies * 200;
        }
        
        // High damage weapons prefer high health enemies
        if (weapon.damage > 15) {
            score += enemy.health * 0.5;
        }
        
        // Fast weapons prefer low health enemies
        if (weapon.fireRate < 300) {
            score += (1 - enemy.health/enemy.maxHealth) * 300;
        }
        
        return score;
    }

    addDamageNumber(x, y, amount, type = 'damage') {
        if (this.settings.settings.showDamage) {
            this.damageNumbers.push(new DamageNumber(x, y, amount, type));
        }
    }

    showLevelUpMenu() {
        this.gameState = 'levelUp';
        document.getElementById('level-up-menu').classList.remove('hidden');
    }

    hideLevelUpMenu() {
        this.gameState = 'playing';
        document.getElementById('level-up-menu').classList.add('hidden');
    }
}

// Initialize game when window is fully loaded
window.addEventListener('load', () => {
    new Game();
}); 