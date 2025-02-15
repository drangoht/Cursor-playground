class DamageNumber {
    constructor(x, y, amount, type = 'damage') {
        this.x = x;
        this.y = y;
        this.amount = Math.round(amount);
        this.type = type; // 'damage', 'heal', 'xp'
        this.life = 1; // 1 second lifetime
        this.opacity = 1;
        this.offsetY = 0;
        
        // Random slight x offset for visual variety
        this.offsetX = (Math.random() - 0.5) * 20;
    }

    update(deltaTime) {
        this.life -= deltaTime;
        this.opacity = Math.max(0, this.life);
        this.offsetY -= deltaTime * 50; // Float upward
        return this.life > 0;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        
        // Set text style based on type
        ctx.font = 'bold 16px Arial';
        switch(this.type) {
            case 'damage':
                ctx.fillStyle = '#ff4444';
                if (this.amount > 20) {
                    ctx.font = 'bold 20px Arial';
                }
                if (this.amount > 50) {
                    ctx.font = 'bold 24px Arial';
                }
                break;
            case 'heal':
                ctx.fillStyle = '#44ff44';
                break;
            case 'xp':
                ctx.fillStyle = '#4444ff';
                break;
        }
        
        // Add text shadow for better visibility
        ctx.shadowColor = 'black';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        // Draw the number
        const text = this.formatNumber();
        const x = this.x + this.offsetX;
        const y = this.y + this.offsetY;
        ctx.textAlign = 'center';
        ctx.fillText(text, x, y);
        
        ctx.restore();
    }

    formatNumber() {
        switch(this.type) {
            case 'damage':
                return `-${this.amount}`;
            case 'heal':
                return `+${this.amount}`;
            case 'xp':
                return `+${this.amount}XP`;
            default:
                return `${this.amount}`;
        }
    }
} 