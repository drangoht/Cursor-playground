class Powerup {
    constructor(config, x, y) {
        this.x = x;
        this.y = y;
        this.config = config;
        this.size = 16;
        this.collected = false;
        this.floatOffset = 0;
        this.floatSpeed = 0.05;
    }

    update() {
        // Make the powerup float up and down
        this.floatOffset = Math.sin(Date.now() * this.floatSpeed) * 5;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y + this.floatOffset);
        
        // Draw powerup icon based on type
        switch(this.config.effect) {
            case 'speed':
                this.drawSpeedPowerup(ctx);
                break;
            case 'damage':
                this.drawDamagePowerup(ctx);
                break;
            case 'health':
                this.drawHealthPowerup(ctx);
                break;
        }
        
        ctx.restore();
    }

    drawSpeedPowerup(ctx) {
        ctx.fillStyle = '#00ff00';
        ctx.beginPath();
        ctx.moveTo(0, this.size/2);
        ctx.lineTo(this.size, this.size/2);
        ctx.lineTo(this.size * 0.75, 0);
        ctx.lineTo(this.size, this.size/2);
        ctx.lineTo(this.size * 0.75, this.size);
        ctx.fill();
    }

    drawDamagePowerup(ctx) {
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.moveTo(this.size/2, 0);
        ctx.lineTo(this.size, this.size/2);
        ctx.lineTo(this.size/2, this.size);
        ctx.lineTo(0, this.size/2);
        ctx.closePath();
        ctx.fill();
    }

    drawHealthPowerup(ctx) {
        ctx.fillStyle = '#ff69b4';
        const padding = 3;
        // Draw cross shape
        ctx.fillRect(padding, this.size/3, this.size - 2*padding, this.size/3);
        ctx.fillRect(this.size/3, padding, this.size/3, this.size - 2*padding);
    }
} 