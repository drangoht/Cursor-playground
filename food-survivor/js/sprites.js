class Sprite {
    constructor(image, frameWidth, frameHeight, totalFrames = 1) {
        this.image = image;
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
        this.totalFrames = totalFrames;
        this.currentFrame = 0;
        this.animationSpeed = 0.1;
        this.animationCounter = 0;
    }

    update() {
        this.animationCounter += this.animationSpeed;
        if (this.animationCounter >= 1) {
            this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
            this.animationCounter = 0;
        }
    }

    draw(ctx, x, y, width, height, rotation = 0) {
        ctx.save();
        ctx.translate(x + width/2, y + height/2);
        ctx.rotate(rotation);
        ctx.drawImage(
            this.image,
            this.currentFrame * this.frameWidth,
            0,
            this.frameWidth,
            this.frameHeight,
            -width/2,
            -height/2,
            width,
            height
        );
        ctx.restore();
    }

    createPixelArtLogo() {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        
        // Draw lemon shape
        ctx.fillStyle = '#ffeb3b';
        ctx.beginPath();
        ctx.ellipse(16, 16, 12, 8, Math.PI/4, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw face
        ctx.fillStyle = '#000';
        // Eyes
        ctx.fillRect(12, 14, 2, 2);
        ctx.fillRect(18, 14, 2, 2);
        // Smile
        ctx.beginPath();
        ctx.arc(16, 18, 4, 0, Math.PI);
        ctx.stroke();
        
        return canvas;
    }
}

class Sprites {
    constructor() {
        this.logo = this.createLogo();
        this.player = this.createPlayerSprite();
        this.enemies = {
            'Angry Tomato': this.createEnemySprite('#ff6b6b'),
            'Raging Broccoli': this.createEnemySprite('#66bb6a'),
            'Mad Steak': this.createEnemySprite('#8d6e63'),
            'Evil Carrot': this.createEnemySprite('#ff7043'),
            'Angry Pizza': this.createEnemySprite('#ffa726'),
            'Evil Burger': this.createEnemySprite('#a1887f'),
            'Wicked Sushi': this.createEnemySprite('#81c784')
        };
    }

    createLogo() {
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');
        
        // Draw lemon body
        ctx.fillStyle = '#ffeb3b';
        ctx.beginPath();
        ctx.ellipse(100, 100, 70, 50, Math.PI/6, 0, Math.PI * 2);
        ctx.fill();
        
        // Add lemon texture/highlights
        ctx.strokeStyle = '#fff3b0';
        ctx.lineWidth = 2;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.ellipse(100, 100, 60 - i * 10, 40 - i * 7, Math.PI/6, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // Add stem/leaf
        ctx.fillStyle = '#4CAF50';
        ctx.beginPath();
        ctx.moveTo(100, 45);
        ctx.quadraticCurveTo(110, 35, 120, 40);
        ctx.quadraticCurveTo(110, 45, 100, 45);
        ctx.fill();
        
        // Add cute face
        ctx.fillStyle = '#000';
        // Eyes
        ctx.beginPath();
        ctx.arc(85, 90, 5, 0, Math.PI * 2);
        ctx.arc(115, 90, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Rosy cheeks
        ctx.fillStyle = '#ffb7b7';
        ctx.beginPath();
        ctx.arc(75, 105, 8, 0, Math.PI * 2);
        ctx.arc(125, 105, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Smile
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(100, 110, 20, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
        
        return canvas;
    }

    createPlayerSprite() {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        
        // Draw lemon body
        ctx.fillStyle = '#ffeb3b';
        ctx.beginPath();
        ctx.ellipse(16, 16, 12, 8, Math.PI/6, 0, Math.PI * 2);
        ctx.fill();
        
        // Add simple face
        ctx.fillStyle = '#000';
        // Eyes
        ctx.fillRect(12, 14, 2, 2);
        ctx.fillRect(18, 14, 2, 2);
        // Smile
        ctx.beginPath();
        ctx.arc(16, 18, 4, 0, Math.PI);
        ctx.stroke();
        
        return canvas;
    }

    createEnemySprite(color) {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        
        // Draw enemy body
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(16, 16, 12, 0, Math.PI * 2);
        ctx.fill();
        
        // Add angry eyes
        ctx.fillStyle = '#000';
        // Left eye
        ctx.beginPath();
        ctx.moveTo(8, 12);
        ctx.lineTo(14, 14);
        ctx.lineTo(8, 16);
        ctx.fill();
        
        // Right eye
        ctx.beginPath();
        ctx.moveTo(24, 12);
        ctx.lineTo(18, 14);
        ctx.lineTo(24, 16);
        ctx.fill();
        
        // Angry mouth
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(10, 22);
        ctx.lineTo(22, 22);
        ctx.stroke();
        
        return canvas;
    }
} 