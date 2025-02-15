class Particle {
    constructor(x, y, vx, vy, color, alpha = 1, life = 30, type = 'normal') {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.alpha = alpha;
        this.life = life;
        this.maxLife = life;
        this.type = type;
        this.size = type === 'star' ? 3 : 2;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        this.rotation += this.rotationSpeed;

        switch(this.type) {
            case 'levelUp':
                this.size = (1 - this.life/this.maxLife) * 10;
                this.alpha = this.life/this.maxLife;
                break;
            case 'star':
                this.vy += 0.05; // Gravity
                this.alpha = this.life/this.maxLife;
                break;
            case 'xp':
                this.vy -= 0.1; // Float upward
                this.alpha = this.life/this.maxLife;
                break;
            case 'field':
                this.alpha = (this.life/this.maxLife) * 0.5;
                break;
            default:
                this.alpha = this.life/this.maxLife;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        
        if (this.type === 'star') {
            this.drawStar(ctx);
        } else {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }

    drawStar(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 * i) / 5 - Math.PI/2;
            const x = Math.cos(angle) * this.size;
            const y = Math.sin(angle) * this.size;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    update() {
        this.particles = this.particles.filter(particle => {
            particle.update();
            return particle.life > 0;
        });
    }

    draw(ctx) {
        this.particles.forEach(particle => particle.draw(ctx));
    }

    createHitEffect(x, y, color) {
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            const speed = 2 + Math.random() * 2;
            this.particles.push(new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                color,
                0.5 + Math.random() * 0.5,
                20
            ));
        }
    }

    createXPEffect(x, y) {
        for (let i = 0; i < 5; i++) {
            const angle = -Math.PI/2 + (Math.random() - 0.5);
            const speed = 1 + Math.random() * 2;
            this.particles.push(new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                '#4CAF50',
                0.8,
                30,
                'xp'
            ));
        }
    }

    createLevelUpEffect(x, y) {
        // Create expanding ring
        for (let i = 0; i < 36; i++) {
            const angle = (Math.PI * 2 * i) / 36;
            this.particles.push(new Particle(
                x, y,
                Math.cos(angle) * 3,
                Math.sin(angle) * 3,
                '#ffeb3b',
                1,
                40,
                'levelUp'
            ));
        }

        // Create rising stars
        for (let i = 0; i < 12; i++) {
            const angle = -Math.PI/2 + (Math.random() - 0.5);
            const speed = 2 + Math.random() * 3;
            this.particles.push(new Particle(
                x + (Math.random() - 0.5) * 40,
                y + (Math.random() - 0.5) * 40,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                '#ffffff',
                1,
                50,
                'star'
            ));
        }
    }

    createDamageFieldParticle(x, y) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.5 + Math.random();
        this.particles.push(new Particle(
            x, y,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            '#ffeb3b',
            0.5,
            20,
            'field'
        ));
    }
} 