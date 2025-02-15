class EffectSystem {
    constructor() {
        this.effects = [];
    }

    createExplosion(x, y, color, size = 1) {
        for (let i = 0; i < CONFIG.EFFECTS.EXPLOSION_PARTICLES; i++) {
            const angle = (Math.PI * 2 * i) / CONFIG.EFFECTS.EXPLOSION_PARTICLES;
            const speed = 2 + Math.random() * 2;
            const particle = new Particle(
                x,
                y,
                color,
                'explosion',
                {
                    velocityX: Math.cos(angle) * speed * size,
                    velocityY: Math.sin(angle) * speed * size,
                    size: (4 + Math.random() * 4) * size,
                    decay: 0.02 + Math.random() * 0.02
                }
            );
            this.effects.push(particle);
        }
    }

    createLevelUp(x, y) {
        for (let i = 0; i < CONFIG.EFFECTS.LEVEL_UP_PARTICLES; i++) {
            const angle = -Math.PI/2 + (Math.random() - 0.5);
            const speed = 3 + Math.random() * 3;
            const particle = new Particle(
                x,
                y,
                '#ffd700',
                'levelup',
                {
                    velocityX: Math.cos(angle) * speed,
                    velocityY: Math.sin(angle) * speed,
                    size: 3 + Math.random() * 3,
                    decay: 0.01
                }
            );
            this.effects.push(particle);
        }
    }

    update() {
        this.effects = this.effects.filter(effect => !effect.update());
    }

    draw(ctx) {
        this.effects.forEach(effect => effect.draw(ctx));
    }
} 