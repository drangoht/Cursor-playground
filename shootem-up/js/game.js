class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        this.player = new Player(this);
        this.enemies = [];
        this.projectiles = [];
        this.powerups = [];
        this.score = 0;
        this.gameOver = false;
        this.lastEnemySpawn = 0;
        this.enemySpawnInterval = 1000; // 1 second
        this.background = new Background(this);
        this.effects = [];
        
        // Add background music control
        this.musicEnabled = true;
        
        this.init();
    }

    init() {
        // Initialize event listeners
        document.getElementById('startButton').addEventListener('click', () => this.startGame());
        document.getElementById('restartButton').addEventListener('click', () => this.restartGame());
        
        // Load assets
        Assets.loadAll().then(() => {
            this.showStartScreen();
        });
    }

    startGame() {
        document.getElementById('start-screen').classList.add('hidden');
        this.gameOver = false;
        this.score = 0;
        this.updateScore();
        this.gameLoop();
        if (this.musicEnabled) {
            Assets.playBackgroundMusic();
        }
    }

    restartGame() {
        document.getElementById('game-over-screen').classList.add('hidden');
        this.enemies = [];
        this.projectiles = [];
        this.powerups = [];
        this.player.reset();
        this.startGame();
    }

    gameLoop() {
        if (this.gameOver) return;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Update and draw game objects
        this.update();
        this.draw();

        // Continue game loop
        requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        this.background.update();
        
        // Spawn enemies
        if (Date.now() - this.lastEnemySpawn > this.enemySpawnInterval) {
            this.spawnEnemy();
            this.lastEnemySpawn = Date.now();
        }

        // Update game objects
        this.player.update();
        this.updateProjectiles();
        this.updateEnemies();
        this.updatePowerups();
        this.checkCollisions();
        
        // Update effects
        this.effects = this.effects.filter(effect => effect.update());
    }

    draw() {
        // Draw background first
        this.background.draw();
        
        // Draw effects behind game objects
        this.effects.forEach(effect => effect.draw());
        
        // Draw game objects
        this.player.draw();
        this.projectiles.forEach(projectile => projectile.draw());
        this.enemies.forEach(enemy => enemy.draw());
        this.powerups.forEach(powerup => powerup.draw());
    }

    spawnEnemy() {
        const types = ['raisin', 'apricot', 'prune'];
        const type = types[Math.floor(Math.random() * types.length)];
        const x = Math.random() * (this.canvas.width - 50);
        this.enemies.push(new Enemy(this, x, -50, type));
    }

    updateScore(points = 0) {
        this.score += points;
        document.getElementById('scoreValue').textContent = this.score;
    }

    endGame() {
        this.gameOver = true;
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('game-over-screen').classList.remove('hidden');
        Assets.stopBackgroundMusic();
        Assets.playSound('gameOver');
    }

    updateProjectiles() {
        this.projectiles.forEach(projectile => projectile.update());
    }

    updateEnemies() {
        this.enemies.forEach(enemy => enemy.update());
    }

    updatePowerups() {
        this.powerups.forEach(powerup => powerup.update());
    }

    checkCollisions() {
        Collision.checkCollisions(this);
    }

    showStartScreen() {
        document.getElementById('start-screen').classList.remove('hidden');
        document.getElementById('game-over-screen').classList.add('hidden');
    }

    addEffect(type, x, y, size, color) {
        switch(type) {
            case 'explosion':
                this.effects.push(new ExplosionEffect(this, x, y, size, color));
                break;
            case 'hit':
                this.effects.push(new HitEffect(this, x, y));
                break;
            case 'shipExplosion':
                this.effects.push(new ShipExplosionEffect(this, x, y));
                break;
            case 'smallExplosion':
                this.effects.push(new SmallExplosionEffect(this, x, y));
                break;
        }
    }
}

// Start the game when the window loads
window.onload = () => {
    const game = new Game();
}; 