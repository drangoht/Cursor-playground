class Player {
    constructor(game) {
        this.game = game;
        this.width = 50;
        this.height = 70;
        this.x = game.canvas.width / 2 - this.width / 2;
        this.y = game.canvas.height - this.height - 20;
        this.speed = 5;
        this.lives = 3;
        this.shootCooldown = 250; // milliseconds
        this.lastShot = 0;
        this.engineGlow = 0;
        this.engineGlowDirection = 1;
        this.invulnerable = false;
        this.blinkCount = 0;
        this.blinkDuration = 2000; // 2 seconds of invulnerability
        this.blinkStart = 0;
        this.isVisible = true;
        this.hitAnimationFrame = 0;
        
        this.setupControls();
    }

    setupControls() {
        this.keys = {
            left: false,
            right: false,
            up: false,
            down: false,
            shoot: false
        };

        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }

    handleKeyDown(e) {
        switch(e.key) {
            case 'ArrowLeft':
            case 'a':
                this.keys.left = true;
                break;
            case 'ArrowRight':
            case 'd':
                this.keys.right = true;
                break;
            case 'ArrowUp':
            case 'w':
                this.keys.up = true;
                break;
            case 'ArrowDown':
            case 's':
                this.keys.down = true;
                break;
            case ' ':
                this.keys.shoot = true;
                break;
        }
    }

    handleKeyUp(e) {
        switch(e.key) {
            case 'ArrowLeft':
            case 'a':
                this.keys.left = false;
                break;
            case 'ArrowRight':
            case 'd':
                this.keys.right = false;
                break;
            case 'ArrowUp':
            case 'w':
                this.keys.up = false;
                break;
            case 'ArrowDown':
            case 's':
                this.keys.down = false;
                break;
            case ' ':
                this.keys.shoot = false;
                break;
        }
    }

    update() {
        // Update invulnerability state
        if (this.invulnerable) {
            const currentTime = Date.now();
            const blinkElapsed = currentTime - this.blinkStart;
            
            // Blink effect
            this.blinkCount++;
            this.isVisible = (this.blinkCount % 6) < 3;

            // Check if invulnerability is over
            if (blinkElapsed >= this.blinkDuration) {
                this.invulnerable = false;
                this.isVisible = true;
            }
        }

        // Normal movement updates
        if (this.keys.left) this.x = Math.max(0, this.x - this.speed);
        if (this.keys.right) this.x = Math.min(this.game.canvas.width - this.width, this.x + this.speed);
        if (this.keys.up) this.y = Math.max(0, this.y - this.speed);
        if (this.keys.down) this.y = Math.min(this.game.canvas.height - this.height, this.y + this.speed);

        // Shooting
        if (this.keys.shoot && Date.now() - this.lastShot > this.shootCooldown) {
            this.shoot();
            this.lastShot = Date.now();
        }

        // Update engine glow
        this.engineGlow += 0.1 * this.engineGlowDirection;
        if (this.engineGlow >= 1 || this.engineGlow <= 0) {
            this.engineGlowDirection *= -1;
        }
    }

    shoot() {
        const projectile = new Projectile(
            this.game,
            this.x + this.width / 2,
            this.y,
            'orange'
        );
        this.game.projectiles.push(projectile);
        
        // Play shoot sound with error handling
        Assets.playSound('shoot', { 
            volume: 0.3, 
            randomPitch: true,
            fallback: () => {
                // Create a quick fallback sound if audio isn't loaded
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = ctx.createOscillator();
                const gainNode = ctx.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(ctx.destination);
                
                oscillator.frequency.setValueAtTime(880, ctx.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);
                
                gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
                
                oscillator.start();
                oscillator.stop(ctx.currentTime + 0.1);
            }
        });
    }

    draw() {
        // Don't draw if not visible during blink
        if (!this.isVisible) return;

        const ctx = this.game.ctx;
        const image = Assets.getImage('banana');
        
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        
        // Add floating animation
        const floatOffset = Math.sin(Date.now() * 0.003) * 3;
        ctx.translate(0, floatOffset);
        
        // Add tilt based on movement
        let tilt = 0;
        if (this.keys.left) tilt = 0.2;
        if (this.keys.right) tilt = -0.2;
        ctx.rotate(tilt);
        
        // Draw engine glow
        ctx.fillStyle = `rgba(255, 165, 0, ${this.engineGlow * 0.5})`;
        ctx.beginPath();
        ctx.arc(0, this.height/2, 10, 0, Math.PI * 2);
        ctx.fill();

        // Draw banana with hit effect
        if (this.invulnerable) {
            ctx.globalAlpha = 0.7;
            ctx.shadowColor = 'white';
            ctx.shadowBlur = 10;
        }
        
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
        if (this.invulnerable) return; // Prevent multiple hits during invulnerability

        this.lives--;
        document.getElementById('livesValue').textContent = this.lives;
        
        if (this.lives > 0) {
            // Create smaller explosion for life loss
            this.game.addEffect('smallExplosion', this.x + this.width/2, this.y + this.height/2);
            Assets.playSound('hit', { volume: 0.4, randomPitch: true });
            
            // Start invulnerability period
            this.invulnerable = true;
            this.blinkStart = Date.now();
            this.blinkCount = 0;
            this.isVisible = true;
        } else {
            // Final death
            this.game.addEffect('shipExplosion', this.x + this.width/2, this.y + this.height/2);
            Assets.playSound('explosion', { volume: 0.6 });
            this.width = 0;
            this.height = 0;
            setTimeout(() => this.game.endGame(), 2000);
        }
    }

    reset() {
        this.lives = 3;
        this.width = 50;
        this.height = 70;
        this.x = this.game.canvas.width / 2 - this.width / 2;
        this.y = this.game.canvas.height - this.height - 20;
        this.invulnerable = false;
        this.isVisible = true;
        this.blinkCount = 0;
        document.getElementById('livesValue').textContent = this.lives;
    }
} 