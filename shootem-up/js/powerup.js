class PowerUp {
    constructor(game, x, y, type) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.type = type;
        this.width = 30;
        this.height = 30;
        this.speed = 2;
        
        // PowerUp types: 'doubleShot', 'spreadShot', 'shield', 'speed', 'rapidFire'
        this.duration = 5000; // 5 seconds
    }

    update() {
        this.y += this.speed;
        
        // Remove if off screen
        if (this.y > this.game.canvas.height) {
            const index = this.game.powerups.indexOf(this);
            if (index > -1) {
                this.game.powerups.splice(index, 1);
            }
        }
    }

    draw() {
        const ctx = this.game.ctx;
        const image = Assets.images[`powerup_${this.type}`];
        
        if (image) {
            ctx.drawImage(image, this.x, this.y, this.width, this.height);
        } else {
            // Fallback shape if image isn't loaded
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(
                this.x + this.width/2,
                this.y + this.height/2,
                this.width/2,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
    }

    collect() {
        Assets.playSound('powerup');
        
        switch(this.type) {
            case 'doubleShot':
                this.activateDoubleShot();
                break;
            case 'spreadShot':
                this.activateSpreadShot();
                break;
            case 'shield':
                this.activateShield();
                break;
            case 'speed':
                this.activateSpeed();
                break;
            case 'rapidFire':
                this.activateRapidFire();
                break;
        }
    }

    // PowerUp effect methods
    activateDoubleShot() {
        // Implementation for double shot power-up
    }

    activateSpreadShot() {
        // Implementation for spread shot power-up
    }

    activateShield() {
        // Implementation for shield power-up
    }

    activateSpeed() {
        // Implementation for speed power-up
    }

    activateRapidFire() {
        // Implementation for rapid fire power-up
    }
} 