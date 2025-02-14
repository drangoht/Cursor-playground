class Projectile {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 8;
        this.height = 20;
        this.speed = 7;
        this.color = '#FFA500'; // Orange color
    }

    update() {
        this.y -= this.speed;
        
        // Remove if off screen
        if (this.y < -this.height) {
            const index = this.game.projectiles.indexOf(this);
            if (index > -1) {
                this.game.projectiles.splice(index, 1);
            }
        }
    }

    draw() {
        const ctx = this.game.ctx;
        const image = Assets.getImage('projectile');
        
        // Draw orange juice drop
        ctx.drawImage(
            image,
            this.x - this.width/2,
            this.y,
            this.width,
            this.height
        );
    }

    onHit(x, y) {
        // Add small explosion effect for projectile
        this.game.addEffect('explosion', x, y, 20, '#FFA500');
    }
} 