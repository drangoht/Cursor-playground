class Enemy {
    constructor(type, x, y, player) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.player = player;
        this.size = type.size;
        this.speed = type.speed;
        this.health = type.health;
        this.maxHealth = type.health;
        this.damage = type.damage;
        this.xpValue = type.xpValue;
    }

    update() {
        // Move towards player
        const dx = this.player.x - this.x;
        const dy = this.player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }
    }

    draw(ctx) {
        ctx.save();
        
        // Draw enemy sprite if available
        if (this.player.game && this.player.game.sprites && this.player.game.sprites.enemies[this.type.name]) {
            ctx.drawImage(
                this.player.game.sprites.enemies[this.type.name],
                this.x,
                this.y,
                this.size,
                this.size
            );
        } else {
            // Fallback to simple circle if sprite not available
            ctx.fillStyle = this.getEnemyColor();
            ctx.beginPath();
            ctx.arc(
                this.x + this.size/2,
                this.y + this.size/2,
                this.size/2,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
        
        // Draw health bar
        const healthPercent = this.health / this.maxHealth;
        const barWidth = this.size;
        const barHeight = 4;
        const barY = this.y - 8;
        
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x, barY, barWidth, barHeight);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(this.x, barY, barWidth * healthPercent, barHeight);
        
        ctx.restore();
    }

    getEnemyColor() {
        switch(this.type.name) {
            case 'Angry Tomato': return '#ff6b6b';
            case 'Raging Broccoli': return '#66bb6a';
            case 'Mad Steak': return '#8d6e63';
            case 'Evil Carrot': return '#ff7043';
            case 'Angry Pizza': return '#ffa726';
            case 'Evil Burger': return '#a1887f';
            case 'Wicked Sushi': return '#81c784';
            default: return '#ff0000';
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        return this.health <= 0;
    }
} 