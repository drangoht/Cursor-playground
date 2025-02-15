const ASSETS = {
    SPRITES: {},
    SOUNDS: {},
    
    loadSprite(name, src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.SPRITES[name] = img;
                resolve(img);
            };
            img.onerror = reject;
            img.src = src;
        });
    },

    loadSound(name, src) {
        return new Promise((resolve) => {
            try {
                const audio = new Audio();
                audio.oncanplaythrough = () => {
                    this.SOUNDS[name] = audio;
                    resolve(audio);
                };
                audio.onerror = () => {
                    console.warn(`Sound ${name} failed to load, using silent sound`);
                    this.SOUNDS[name] = this.createSilentSound();
                    resolve(this.SOUNDS[name]);
                };
                audio.src = src;
            } catch (error) {
                console.warn(`Sound system not available, using silent sound`);
                this.SOUNDS[name] = this.createSilentSound();
                resolve(this.SOUNDS[name]);
            }
        });
    },

    createPixelArt() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const createSprite = (width, height, drawFunction) => {
            canvas.width = width;
            canvas.height = height;
            ctx.imageSmoothingEnabled = false;
            drawFunction(ctx);
            const img = new Image();
            img.src = canvas.toDataURL();
            return img;
        };

        // Improved Lemon player sprite (32x32)
        this.SPRITES.player = createSprite(32, 32, (ctx) => {
            // Main lemon body
            ctx.fillStyle = '#ffeb3b';
            ctx.beginPath();
            ctx.ellipse(16, 16, 12, 10, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Darker yellow shading
            ctx.fillStyle = '#fdd835';
            ctx.beginPath();
            ctx.ellipse(18, 18, 8, 6, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Leaf on top
            ctx.fillStyle = '#4caf50';
            ctx.fillRect(14, 4, 4, 4);
            ctx.fillStyle = '#388e3c';
            ctx.fillRect(15, 6, 2, 3);
            
            // Face
            ctx.fillStyle = '#3e2723';
            ctx.fillRect(12, 14, 3, 3); // Left eye
            ctx.fillRect(18, 14, 3, 3); // Right eye
            ctx.fillRect(14, 20, 5, 2); // Smile
        });

        // Improved Tomato enemy (32x32)
        this.SPRITES.tomato = createSprite(32, 32, (ctx) => {
            // Main body
            ctx.fillStyle = '#e53935';
            ctx.beginPath();
            ctx.arc(16, 18, 10, 0, Math.PI * 2);
            ctx.fill();
            
            // Highlights
            ctx.fillStyle = '#ef5350';
            ctx.beginPath();
            ctx.arc(14, 16, 4, 0, Math.PI * 2);
            ctx.fill();
            
            // Stem and leaves
            ctx.fillStyle = '#43a047';
            ctx.fillRect(14, 6, 4, 4);
            ctx.fillRect(12, 8, 8, 2);
            
            // Angry eyes
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(11, 16, 4, 4);
            ctx.fillRect(17, 16, 4, 4);
            ctx.fillStyle = '#000000';
            ctx.fillRect(13, 17, 2, 2);
            ctx.fillRect(19, 17, 2, 2);
        });

        // Improved Broccoli enemy (32x32)
        this.SPRITES.broccoli = createSprite(32, 32, (ctx) => {
            // Stem
            ctx.fillStyle = '#81c784';
            ctx.fillRect(13, 16, 6, 12);
            
            // Florets
            ctx.fillStyle = '#2e7d32';
            for(let x = 8; x < 24; x += 4) {
                for(let y = 4; y < 16; y += 4) {
                    ctx.beginPath();
                    ctx.arc(x + (y % 8)/2, y, 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            
            // Angry eyes
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(10, 14, 4, 4);
            ctx.fillRect(18, 14, 4, 4);
            ctx.fillStyle = '#000000';
            ctx.fillRect(11, 15, 2, 2);
            ctx.fillRect(19, 15, 2, 2);
        });

        // New: Angry Steak enemy (32x32)
        this.SPRITES.steak = createSprite(32, 32, (ctx) => {
            // Main body
            ctx.fillStyle = '#8d6e63';
            ctx.beginPath();
            ctx.moveTo(6, 12);
            ctx.lineTo(26, 8);
            ctx.lineTo(28, 20);
            ctx.lineTo(24, 24);
            ctx.lineTo(4, 20);
            ctx.closePath();
            ctx.fill();
            
            // Grill marks
            ctx.fillStyle = '#5d4037';
            ctx.fillRect(8, 12, 16, 2);
            ctx.fillRect(10, 16, 14, 2);
            
            // Fat marbling
            ctx.fillStyle = '#d7ccc8';
            ctx.fillRect(12, 14, 3, 3);
            ctx.fillRect(18, 14, 4, 2);
            
            // Angry eyes
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(10, 10, 4, 4);
            ctx.fillRect(18, 10, 4, 4);
            ctx.fillStyle = '#000000';
            ctx.fillRect(11, 11, 2, 2);
            ctx.fillRect(19, 11, 2, 2);
        });

        // New: Evil Carrot enemy (32x32)
        this.SPRITES.carrot = createSprite(32, 32, (ctx) => {
            // Carrot body
            ctx.fillStyle = '#ff7043';
            ctx.beginPath();
            ctx.moveTo(16, 28);
            ctx.lineTo(8, 8);
            ctx.lineTo(24, 8);
            ctx.closePath();
            ctx.fill();
            
            // Texture lines
            ctx.fillStyle = '#e64a19';
            for(let y = 12; y < 26; y += 4) {
                ctx.fillRect(10 + y/4, y, 12 - y/2, 1);
            }
            
            // Leaves
            ctx.fillStyle = '#66bb6a';
            ctx.fillRect(12, 4, 2, 6);
            ctx.fillRect(16, 4, 2, 8);
            ctx.fillRect(20, 4, 2, 6);
            
            // Angry eyes
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(10, 12, 4, 4);
            ctx.fillRect(18, 12, 4, 4);
            ctx.fillStyle = '#000000';
            ctx.fillRect(11, 13, 2, 2);
            ctx.fillRect(19, 13, 2, 2);
        });

        // Improved projectile sprites
        this.SPRITES.acidSpray = createSprite(16, 16, (ctx) => {
            // Glowing center
            const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
            gradient.addColorStop(0, '#b2ff59');
            gradient.addColorStop(0.6, '#64dd17');
            gradient.addColorStop(1, 'rgba(100, 221, 23, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(8, 8, 8, 0, Math.PI * 2);
            ctx.fill();
        });

        // Improved XP gem sprite
        this.SPRITES.gem = createSprite(16, 16, (ctx) => {
            // Diamond shape
            ctx.fillStyle = '#4CAF50';
            ctx.beginPath();
            ctx.moveTo(8, 2);
            ctx.lineTo(14, 8);
            ctx.lineTo(8, 14);
            ctx.lineTo(2, 8);
            ctx.closePath();
            ctx.fill();
            
            // Highlight
            ctx.fillStyle = '#81c784';
            ctx.beginPath();
            ctx.moveTo(8, 2);
            ctx.lineTo(14, 8);
            ctx.lineTo(8, 8);
            ctx.closePath();
            ctx.fill();
        });

        // New: Pizza enemy sprite
        this.SPRITES.pizza = createSprite(36, 36, (ctx) => {
            // Triangle pizza shape
            ctx.fillStyle = '#fff176';
            ctx.beginPath();
            ctx.moveTo(18, 4);
            ctx.lineTo(32, 30);
            ctx.lineTo(4, 30);
            ctx.closePath();
            ctx.fill();
            
            // Toppings
            ctx.fillStyle = '#e53935'; // Pepperoni
            ctx.beginPath();
            ctx.arc(18, 15, 3, 0, Math.PI * 2);
            ctx.arc(12, 22, 3, 0, Math.PI * 2);
            ctx.arc(24, 22, 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Angry eyes
            ctx.fillStyle = '#000000';
            ctx.fillRect(14, 12, 3, 3);
            ctx.fillRect(22, 12, 3, 3);
        });

        // New: Burger enemy sprite
        this.SPRITES.burger = createSprite(36, 36, (ctx) => {
            // Buns
            ctx.fillStyle = '#ffb74d';
            ctx.fillRect(6, 6, 24, 8);
            ctx.fillRect(6, 22, 24, 8);
            
            // Patty
            ctx.fillStyle = '#5d4037';
            ctx.fillRect(4, 14, 28, 8);
            
            // Lettuce
            ctx.fillStyle = '#81c784';
            ctx.fillRect(8, 18, 20, 2);
            
            // Angry eyes
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(10, 10, 4, 4);
            ctx.fillRect(22, 10, 4, 4);
            ctx.fillStyle = '#000000';
            ctx.fillRect(11, 11, 2, 2);
            ctx.fillRect(23, 11, 2, 2);
        });

        // New weapon sprites
        this.SPRITES.citrusBurst = createSprite(16, 16, (ctx) => {
            const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
            gradient.addColorStop(0, '#ffeb3b');
            gradient.addColorStop(0.6, '#fdd835');
            gradient.addColorStop(1, 'rgba(255, 235, 59, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(8, 8, 6, 0, Math.PI * 2);
            ctx.fill();
        });

        // Animation frames for the lemon player
        this.SPRITES.playerWalk = createSprite(128, 32, (ctx) => {
            // Frame 1: Normal
            drawLemonFrame(ctx, 0);
            // Frame 2: Slight squeeze
            drawLemonFrame(ctx, 32, 0.9);
            // Frame 3: Normal
            drawLemonFrame(ctx, 64);
            // Frame 4: Slight stretch
            drawLemonFrame(ctx, 96, 1.1);
        });

        function drawLemonFrame(ctx, x, scaleY = 1) {
            ctx.save();
            ctx.translate(x + 16, 16);
            ctx.scale(1, scaleY);
            
            // Main body
            ctx.fillStyle = '#ffeb3b';
            ctx.beginPath();
            ctx.ellipse(0, 0, 12, 10, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Darker yellow shading
            ctx.fillStyle = '#fdd835';
            ctx.beginPath();
            ctx.ellipse(18, 18, 8, 6, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Leaf on top
            ctx.fillStyle = '#4caf50';
            ctx.fillRect(14, 4, 4, 4);
            ctx.fillStyle = '#388e3c';
            ctx.fillRect(15, 6, 2, 3);
            
            // Face
            ctx.fillStyle = '#3e2723';
            ctx.fillRect(12, 14, 3, 3); // Left eye
            ctx.fillRect(18, 14, 3, 3); // Right eye
            ctx.fillRect(14, 20, 5, 2); // Smile
            
            ctx.restore();
        }
    },

    async loadAll() {
        this.createPixelArt();
        
        // Create sounds directory if it doesn't exist
        const soundsPath = 'sounds/';
        const requiredSounds = ['hit', 'shoot', 'levelup'];
        
        // Load sounds with fallback
        for (const sound of requiredSounds) {
            try {
                await this.loadSound(sound, `${soundsPath}${sound}.wav`);
            } catch (error) {
                console.warn(`Failed to load ${sound} sound, continuing without it`);
                this.SOUNDS[sound] = null;
            }
        }
    },

    createSilentSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.1, audioContext.sampleRate);
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        return buffer;
    }
}; 