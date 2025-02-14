class Background {
    constructor(game) {
        this.game = game;
        this.x = 0;
        this.y = 0;
        this.width = game.canvas.width;
        this.height = game.canvas.height;
        this.speed = 1;
        
        // Create starfield
        this.stars = [];
        for (let i = 0; i < 50; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 3 + 1,
                speed: Math.random() * 2 + 1
            });
        }
    }

    update() {
        // Update stars
        this.stars.forEach(star => {
            star.y += star.speed;
            if (star.y > this.height) {
                star.y = 0;
                star.x = Math.random() * this.width;
            }
        });
    }

    draw() {
        const ctx = this.game.ctx;

        // Draw gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#000033');
        gradient.addColorStop(1, '#330066');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);

        // Draw stars
        ctx.fillStyle = '#FFFFFF';
        this.stars.forEach(star => {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }
} 