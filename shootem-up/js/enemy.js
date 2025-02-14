class Enemy {
    constructor(game, x, y, type) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.type = type;
        
        // Set properties based on enemy type
        switch(type) {
            case 'raisin':
                this.width = 30;
                this.height = 30;
                this.speed = 2;
                this.health = 1;
                this.points = 100;
                break;
            case 'apricot':
                this.width = 40;
                this.height = 40;
                this.speed = 3;
                this.health = 2;
                this.points = 200;
                this.zigzagOffset = 0;
                break;
            case 'prune':
                this.width = 50;
                this.height = 50;
                this.speed = 1.5;
                this.health = 3;
                this.points = 300;
                break;
        }
    }

    update() {
        // Basic movement downward
        this.y += this.speed;

        // Special movement patterns
        if (this.type === 'apricot') {
            // Zigzag movement
            this.zigzagOffset += 0.05;
            this.x += Math.sin(this.zigzagOffset) * 2;
        } else if (this.type === 'prune') {
            // Follow player
            const dx = this.game.player.x - this.x;
            this.x += Math.sign(dx) * this.speed * 0.5;
        }

        // Remove if off screen
        if (this.y > this.game.canvas.height) {
            const index = this.game.enemies.indexOf(this);
            if (index > -1) {
                this.game.enemies.splice(index, 1);
            }
        }
    }

    draw() {
        const ctx = this.game.ctx;
        const image = Assets.getImage(this.type);
        
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        
        // Add wobble effect for dried fruits
        const wobble = Math.sin(Date.now() * 0.005) * 0.1;
        ctx.rotate(wobble);
        
        ctx.drawImage(
            image,
            -this.width/2,
            -this.height/2,
            this.width,
            this.height
        );
        
        ctx.restore();
    }

    hit() {
        this.health--;
        if (this.health <= 0) {
            const index = this.game.enemies.indexOf(this);
            if (index > -1) {
                // Add explosion effect based on enemy type
                let color;
                switch(this.type) {
                    case 'raisin': 
                        color = '#461B7E';
                        Assets.playSound('splat', { volume: 0.4, randomPitch: true });
                        break;
                    case 'apricot': 
                        color = '#FF7F00';
                        Assets.playSound('hitMedium', { volume: 0.5, randomPitch: true });
                        break;
                    case 'prune': 
                        color = '#871F78';
                        Assets.playSound('explosion', { volume: 0.6, randomPitch: true });
                        break;
                }
                this.game.addEffect('explosion', this.x + this.width/2, this.y + this.height/2, this.width, color);
                
                this.game.enemies.splice(index, 1);
                this.game.updateScore(this.points);
            }
        } else {
            // Add hit effect with different sounds based on enemy type
            this.game.addEffect('hit', this.x + this.width/2, this.y + this.height/2);
            Assets.playSound('hitSmall', { volume: 0.3, randomPitch: true });
        }
    }
} 