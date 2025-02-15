class WaveManager {
    constructor(game) {
        this.game = game;
        this.currentWave = 1;
        this.waveTimer = 0;
        this.isWaveActive = true;
        this.isBossWave = false;
        this.spawnMultiplier = 1;
    }

    update(deltaTime) {
        if (!this.isWaveActive) return;

        this.waveTimer += deltaTime;
        if (this.waveTimer >= CONFIG.WAVES.DURATION) {
            this.startNewWave();
        }

        if (this.isBossWave && this.game.enemies.length === 0) {
            this.completeWave();
        }

        this.updateSpawnRate();
    }

    startNewWave() {
        this.currentWave++;
        this.waveTimer = 0;
        this.isBossWave = this.currentWave % CONFIG.WAVES.BOSS_EVERY === 0;
        this.spawnMultiplier = 1 + (this.currentWave * 0.1);

        if (this.isBossWave) {
            this.spawnBoss();
        }

        // Show wave announcement
        this.game.ui.showWaveAnnouncement(this.currentWave, this.isBossWave);
    }

    spawnBoss() {
        const bossIndex = Math.floor((this.currentWave / CONFIG.WAVES.BOSS_EVERY - 1) % CONFIG.WAVES.BOSSES.length);
        const bossConfig = CONFIG.WAVES.BOSSES[bossIndex];
        const boss = new Boss(bossConfig, this.game.player);
        this.game.enemies.push(boss);
    }

    updateSpawnRate() {
        if (this.isBossWave) return;
        
        CONFIG.ENEMIES.SPAWN_RATE = Math.max(
            200,
            1000 - (this.currentWave * 50)
        );
    }
} 