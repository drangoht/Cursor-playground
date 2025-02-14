// This is a temporary file to create placeholder assets until real ones are available
class PlaceholderAssets {
    static createBananaImage() {
        const canvas = document.createElement('canvas');
        canvas.width = 50;
        canvas.height = 70;
        const ctx = canvas.getContext('2d');
        
        // Draw banana body with more curve
        ctx.fillStyle = '#FFE135';
        ctx.beginPath();
        ctx.moveTo(25, 10);
        // Create more curved banana shape
        ctx.bezierCurveTo(45, 15, 45, 40, 35, 60); // Right curve
        ctx.quadraticCurveTo(25, 70, 15, 60); // Bottom curve
        ctx.bezierCurveTo(5, 40, 5, 15, 25, 10); // Left curve
        ctx.fill();

        // Add brown tips
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.arc(25, 10, 5, 0, Math.PI, true);
        ctx.fill();
        
        // Add shading for 3D effect
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.beginPath();
        ctx.moveTo(25, 10);
        ctx.bezierCurveTo(35, 15, 35, 40, 30, 60);
        ctx.quadraticCurveTo(25, 65, 25, 60);
        ctx.fill();

        // Add highlights
        ctx.strokeStyle = '#FFF7B2';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(15, 20);
        ctx.bezierCurveTo(18, 30, 18, 40, 15, 50);
        ctx.stroke();

        // Add texture lines
        ctx.strokeStyle = '#FFB90F';
        ctx.lineWidth = 1;
        for(let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(15 + i*7, 15);
            ctx.bezierCurveTo(20 + i*7, 30, 20 + i*7, 40, 15 + i*7, 60);
            ctx.stroke();
        }
        
        return canvas;
    }

    static createEnemyImage(type) {
        const canvas = document.createElement('canvas');
        canvas.width = 40;
        canvas.height = 40;
        const ctx = canvas.getContext('2d');
        
        switch(type) {
            case 'raisin':
                // Create wrinkled raisin
                ctx.fillStyle = '#461B7E';
                ctx.beginPath();
                ctx.moveTo(20, 10);
                for(let i = 0; i < 8; i++) {
                    const angle = (i/8) * Math.PI * 2;
                    const r = 12 + Math.sin(angle * 3) * 3;
                    ctx.lineTo(
                        20 + Math.cos(angle) * r,
                        20 + Math.sin(angle) * r
                    );
                }
                ctx.closePath();
                ctx.fill();
                // Add wrinkles
                ctx.strokeStyle = '#2B0F4D';
                ctx.lineWidth = 1;
                for(let i = 0; i < 3; i++) {
                    ctx.beginPath();
                    ctx.moveTo(15 + i*4, 15);
                    ctx.quadraticCurveTo(20, 20 + i*2, 25, 15 + i*4);
                    ctx.stroke();
                }
                break;

            case 'apricot':
                // Create apricot with gradient
                const gradientApricot = ctx.createRadialGradient(15, 15, 0, 20, 20, 20);
                gradientApricot.addColorStop(0, '#FFB347');
                gradientApricot.addColorStop(1, '#FF7F00');
                ctx.fillStyle = gradientApricot;
                ctx.beginPath();
                ctx.arc(20, 20, 15, 0, Math.PI * 2);
                ctx.fill();
                // Add highlight
                ctx.fillStyle = 'rgba(255,255,255,0.2)';
                ctx.beginPath();
                ctx.arc(15, 15, 8, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'prune':
                // Create dark purple prune
                const gradientPrune = ctx.createRadialGradient(20, 20, 5, 20, 20, 18);
                gradientPrune.addColorStop(0, '#871F78');
                gradientPrune.addColorStop(1, '#4B0082');
                ctx.fillStyle = gradientPrune;
                ctx.beginPath();
                ctx.ellipse(20, 20, 18, 15, Math.PI/4, 0, Math.PI * 2);
                ctx.fill();
                // Add shine
                ctx.fillStyle = 'rgba(255,255,255,0.15)';
                ctx.beginPath();
                ctx.ellipse(15, 15, 5, 3, Math.PI/4, 0, Math.PI * 2);
                ctx.fill();
                break;
        }
        
        return canvas;
    }

    static createProjectileImage() {
        const canvas = document.createElement('canvas');
        canvas.width = 8;
        canvas.height = 20;
        const ctx = canvas.getContext('2d');

        // Create orange juice drop
        const gradient = ctx.createLinearGradient(4, 0, 4, 20);
        gradient.addColorStop(0, '#FFA500');
        gradient.addColorStop(1, '#FF8C00');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(4, 0);
        ctx.bezierCurveTo(8, 5, 8, 15, 4, 20);
        ctx.bezierCurveTo(0, 15, 0, 5, 4, 0);
        ctx.fill();

        // Add shine
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.beginPath();
        ctx.ellipse(2, 5, 1, 3, -Math.PI/6, 0, Math.PI * 2);
        ctx.fill();

        return canvas;
    }

    static createMediumHitSound(ctx) {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(550, ctx.currentTime);
        
        oscillator.frequency.setValueAtTime(220, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.1);
        
        return oscillator;
    }

    static createSplatSound(ctx) {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(150, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.1);
        
        return oscillator;
    }

    static createPlaceholderSound(createSoundFn) {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            return {
                cloneNode: () => ({
                    play: () => {
                        try {
                            createSoundFn(ctx);
                        } catch (error) {
                            console.warn('Error playing placeholder sound:', error);
                        }
                    },
                    volume: 1,
                    playbackRate: 1
                })
            };
        } catch (error) {
            return {
                cloneNode: () => ({
                    play: () => {},
                    volume: 1,
                    playbackRate: 1
                })
            };
        }
    }

    static createPlaceholderSounds() {
        return {
            shoot: this.createPlaceholderSound(this.createShootSound),
            hit: this.createPlaceholderSound(this.createHitSound),
            explosion: this.createPlaceholderSound(this.createExplosionSound),
            hitSmall: this.createPlaceholderSound(this.createSmallHitSound),
            hitMedium: this.createPlaceholderSound(this.createMediumHitSound),
            splat: this.createPlaceholderSound(this.createSplatSound),
            gameOver: {
                cloneNode: () => ({
                    play: () => {},
                    volume: 1,
                    playbackRate: 1
                })
            },
            bgMusic: {
                play: () => {},
                pause: () => {},
                cloneNode: () => this,
                loop: false,
                volume: 1,
                currentTime: 0
            }
        };
    }

    static createShootSound(ctx) {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.setValueAtTime(880, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.1);
    }

    static createHitSound(ctx) {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.setValueAtTime(440, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.05);
        
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.05);
        
        return oscillator;
    }

    static createExplosionSound(ctx) {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.3);
        
        oscillator.frequency.setValueAtTime(100, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.3);
        
        return oscillator;
    }

    static createSmallHitSound(ctx) {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.setValueAtTime(660, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(330, ctx.currentTime + 0.03);
        
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.03);
        
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.03);
        
        return oscillator;
    }

    // Add similar methods for other sound effects...
} 