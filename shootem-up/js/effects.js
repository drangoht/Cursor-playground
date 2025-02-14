class Effect {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.frame = 0;
        this.maxFrames = 8;
        this.frameSize = 64;
        this.size = 64;
        this.alpha = 1;
    }

    update() {
        this.frame++;
        return this.frame < this.maxFrames;
    }
}

class ExplosionEffect extends Effect {
    constructor(game, x, y, size = 64, color = '#FF4500') {
        super(game, x, y);
        this.size = size;
        this.particles = [];
        this.color = color;
        
        // Create explosion particles
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const speed = Math.random() * 3 + 2;
            this.particles.push({
                x: 0,
                y: 0,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 4 + 2
            });
        }
    }

    update() {
        this.frame++;
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.size *= 0.9;
        });
        this.alpha = 1 - (this.frame / this.maxFrames);
        return this.frame < this.maxFrames;
    }

    draw() {
        const ctx = this.game.ctx;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.globalAlpha = this.alpha;

        // Draw particles
        this.particles.forEach(p => {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.restore();
    }
}

class HitEffect extends Effect {
    constructor(game, x, y) {
        super(game, x, y);
        this.maxFrames = 5;
        this.size = 20;
    }

    draw() {
        const ctx = this.game.ctx;
        const alpha = 1 - (this.frame / this.maxFrames);
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.globalAlpha = alpha;
        
        // Draw hit flash
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(0, 0, this.size * (1 - alpha), 0, Math.PI * 2);
        ctx.fill();
        
        // Draw hit lines
        ctx.strokeStyle = '#FFA500';
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            const length = this.size * (1 + alpha);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(
                Math.cos(angle) * length,
                Math.sin(angle) * length
            );
            ctx.stroke();
        }
        
        ctx.restore();
    }
}

class ShipExplosionEffect extends Effect {
    constructor(game, x, y) {
        super(game, x, y);
        this.maxFrames = 120; // Doubled duration (2 seconds at 60fps)
        this.particles = [];
        this.rings = [];
        this.sparkles = [];
        
        // Create banana pieces
        for (let i = 0; i < 30; i++) { // More particles
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 8 + 3; // Faster particles
            this.particles.push({
                x: 0,
                y: 0,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.2,
                size: Math.random() * 15 + 8, // Larger pieces
                color: Math.random() > 0.5 ? '#FFE135' : '#FFD700', // Varied yellow shades
                type: Math.floor(Math.random() * 3) // Different piece shapes
            });
        }

        // Create expanding rings
        for (let i = 0; i < 3; i++) {
            this.rings.push({
                radius: 0,
                maxRadius: 100 + i * 50,
                speed: 1 + i * 0.5,
                alpha: 1
            });
        }

        // Create sparkles
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 1;
            this.sparkles.push({
                x: 0,
                y: 0,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 3 + 1,
                alpha: 1,
                decay: Math.random() * 0.02 + 0.01
            });
        }
    }

    update() {
        this.frame++;
        
        // Update banana pieces
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.15; // Gravity
            p.rotation += p.rotationSpeed;
            p.vx *= 0.99; // Air resistance
        });

        // Update rings
        this.rings.forEach(ring => {
            ring.radius += ring.speed;
            ring.alpha = Math.max(0, 1 - ring.radius / ring.maxRadius);
        });

        // Update sparkles
        this.sparkles.forEach(s => {
            s.x += s.vx;
            s.y += s.vy;
            s.alpha -= s.decay;
            s.vx *= 0.98;
            s.vy *= 0.98;
        });

        // Fade out effect
        this.alpha = Math.min(1, 2 - (this.frame / this.maxFrames) * 2);
        
        return this.frame < this.maxFrames;
    }

    draw() {
        const ctx = this.game.ctx;
        ctx.save();
        ctx.translate(this.x, this.y);

        // Draw expanding rings
        this.rings.forEach(ring => {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 165, 0, ${ring.alpha * 0.5})`;
            ctx.lineWidth = 3;
            ctx.arc(0, 0, ring.radius, 0, Math.PI * 2);
            ctx.stroke();
        });

        // Draw banana pieces with glow
        this.particles.forEach(p => {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            
            // Add glow effect
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = 10;
            
            // Draw banana piece
            ctx.fillStyle = p.color;
            ctx.beginPath();
            
            switch(p.type) {
                case 0: // Curved piece
                    ctx.ellipse(0, 0, p.size, p.size/2, 0, 0, Math.PI * 2);
                    break;
                case 1: // Triangle piece
                    ctx.moveTo(-p.size/2, -p.size/4);
                    ctx.lineTo(p.size/2, 0);
                    ctx.lineTo(-p.size/2, p.size/4);
                    break;
                case 2: // Irregular piece
                    ctx.moveTo(-p.size/2, 0);
                    ctx.quadraticCurveTo(0, -p.size/2, p.size/2, 0);
                    ctx.quadraticCurveTo(0, p.size/2, -p.size/2, 0);
                    break;
            }
            
            ctx.fill();
            
            // Add highlight
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.beginPath();
            ctx.ellipse(-p.size/4, -p.size/4, p.size/4, p.size/8, Math.PI/4, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        });

        // Draw sparkles
        this.sparkles.forEach(s => {
            ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.restore();
    }
}

class PowerupEffect extends Effect {
    constructor(game, x, y) {
        super(game, x, y);
        this.maxFrames = 6;
        this.size = 32;
    }

    draw() {
        const ctx = this.game.ctx;
        ctx.fillStyle = `rgba(255, 215, 0, ${1 - this.frame/this.maxFrames})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * (1 + this.frame/this.maxFrames), 0, Math.PI * 2);
        ctx.fill();
    }
}

class SmallExplosionEffect extends Effect {
    constructor(game, x, y) {
        super(game, x, y);
        this.maxFrames = 45; // 0.75 seconds at 60fps
        this.particles = [];
        this.rings = [];
        
        // Create smaller banana pieces
        for (let i = 0; i < 12; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 4 + 2;
            this.particles.push({
                x: 0,
                y: 0,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.2,
                size: Math.random() * 8 + 4,
                color: '#FFE135',
                type: Math.floor(Math.random() * 3)
            });
        }

        // Create smaller rings
        for (let i = 0; i < 2; i++) {
            this.rings.push({
                radius: 0,
                maxRadius: 40 + i * 20,
                speed: 1 + i * 0.5,
                alpha: 1
            });
        }
    }

    update() {
        this.frame++;
        
        // Update particles
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1;
            p.rotation += p.rotationSpeed;
            p.vx *= 0.95;
        });

        // Update rings
        this.rings.forEach(ring => {
            ring.radius += ring.speed;
            ring.alpha = Math.max(0, 1 - ring.radius / ring.maxRadius);
        });

        this.alpha = Math.min(1, 2 - (this.frame / this.maxFrames) * 2);
        return this.frame < this.maxFrames;
    }

    draw() {
        const ctx = this.game.ctx;
        ctx.save();
        ctx.translate(this.x, this.y);

        // Draw rings
        this.rings.forEach(ring => {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 165, 0, ${ring.alpha * 0.5})`;
            ctx.lineWidth = 2;
            ctx.arc(0, 0, ring.radius, 0, Math.PI * 2);
            ctx.stroke();
        });

        // Draw particles
        this.particles.forEach(p => {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = 5;
            
            ctx.fillStyle = p.color;
            ctx.beginPath();
            
            switch(p.type) {
                case 0:
                    ctx.ellipse(0, 0, p.size, p.size/2, 0, 0, Math.PI * 2);
                    break;
                case 1:
                    ctx.moveTo(-p.size/2, -p.size/4);
                    ctx.lineTo(p.size/2, 0);
                    ctx.lineTo(-p.size/2, p.size/4);
                    break;
                case 2:
                    ctx.moveTo(-p.size/2, 0);
                    ctx.quadraticCurveTo(0, -p.size/2, p.size/2, 0);
                    ctx.quadraticCurveTo(0, p.size/2, -p.size/2, 0);
                    break;
            }
            
            ctx.fill();
            ctx.restore();
        });

        ctx.restore();
    }
} 