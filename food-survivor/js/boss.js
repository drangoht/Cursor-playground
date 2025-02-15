class Boss extends Enemy {
    constructor(config, playerRef) {
        super(config, playerRef);
        this.attacks = config.attacks;
        this.currentAttack = null;
        this.attackTimer = 0;
        this.attackCooldown = 3000; // 3 seconds between attacks
    }

    update() {
        super.update();
        this.updateAttacks();
    }

    updateAttacks() {
        this.attackTimer += 16; // Assuming 60fps
        if (this.attackTimer >= this.attackCooldown) {
            this.performRandomAttack();
            this.attackTimer = 0;
        }
    }

    performRandomAttack() {
        const attack = this.attacks[Math.floor(Math.random() * this.attacks.length)];
        switch(attack) {
            case 'summonFries':
                this.summonFries();
                break;
            case 'beefBarrage':
                this.beefBarrage();
                break;
            case 'pepperoniStorm':
                this.pepperoniStorm();
                break;
            case 'cheeseBeam':
                this.cheeseBeam();
                break;
        }
    }

    // Boss-specific attack patterns
    summonFries() {
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            const enemy = new Enemy(CONFIG.ENEMIES.TYPES[0], this.player);
            enemy.x = this.x + Math.cos(angle) * 50;
            enemy.y = this.y + Math.sin(angle) * 50;
            this.game.enemies.push(enemy);
        }
    }

    beefBarrage() {
        for (let i = 0; i < 12; i++) {
            setTimeout(() => {
                const angle = Math.random() * Math.PI * 2;
                const projectile = new Projectile(
                    this.x,
                    this.y,
                    this.x + Math.cos(angle) * 100,
                    this.y + Math.sin(angle) * 100,
                    { damage: 20, projectileSpeed: 5 }
                );
                this.game.projectiles.push(projectile);
            }, i * 100);
        }
    }
} 