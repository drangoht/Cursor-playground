class Assets {
    static images = {};
    static sounds = {};
    
    static async loadAll() {
        const imageFiles = {
            banana: 'assets/images/banana.png',
            raisin: 'assets/images/enemies/raisin.png',
            apricot: 'assets/images/enemies/apricot.png',
            prune: 'assets/images/enemies/prune.png',
            powerup_doubleShot: 'assets/images/powerups/double_shot.png',
            powerup_spreadShot: 'assets/images/powerups/spread_shot.png',
            powerup_shield: 'assets/images/powerups/shield.png',
            powerup_speed: 'assets/images/powerups/speed.png',
            powerup_rapidFire: 'assets/images/powerups/rapid_fire.png',
            explosion: 'assets/images/effects/explosion.png',
            shield: 'assets/images/effects/shield.png'
        };

        const soundFiles = {
            shoot: 'assets/sounds/shoot.wav',
            explosion: 'assets/sounds/explosion.wav',
            powerup: 'assets/sounds/powerup.wav',
            hit: 'assets/sounds/hit.wav',
            gameOver: 'assets/sounds/game_over.wav',
            bgMusic: 'assets/sounds/background_music.mp3',
            bossMusic: 'assets/sounds/boss_music.mp3',
            hitSmall: 'assets/sounds/hit_small.wav',
            hitMedium: 'assets/sounds/hit_medium.wav',
            splat: 'assets/sounds/splat.wav'
        };

        const imagePromises = Object.entries(imageFiles).map(([key, src]) => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    Assets.images[key] = img;
                    resolve();
                };
                img.onerror = () => {
                    console.warn(`Failed to load image: ${src}`);
                    resolve(); // Resolve anyway to continue loading
                };
                img.src = src;
            });
        });

        const audioAvailable = await this.isAudioAvailable();
        let soundsLoaded = false;
        
        if (audioAvailable) {
            try {
                const soundPromises = Object.entries(soundFiles).map(([key, src]) => {
                    return new Promise((resolve) => {
                        const audio = new Audio();
                        audio.oncanplaythrough = () => {
                            Assets.sounds[key] = audio;
                            resolve();
                        };
                        audio.onerror = () => {
                            console.warn(`Failed to load sound: ${src}`);
                            resolve();
                        };
                        audio.src = src;
                    });
                });

                await Promise.all(soundPromises);
                soundsLoaded = Object.keys(Assets.sounds).length > 0;
            } catch (error) {
                console.warn('Error loading audio files:', error);
            }
        }

        // Create placeholder sounds if needed
        if (!audioAvailable || !soundsLoaded) {
            console.log('Using placeholder sounds');
            try {
                const placeholderSounds = PlaceholderAssets.createPlaceholderSounds();
                Object.assign(Assets.sounds, placeholderSounds);
            } catch (error) {
                console.warn('Failed to create placeholder sounds:', error);
                // Create silent sounds as last resort
                const silentSound = {
                    cloneNode: () => ({
                        play: () => Promise.resolve(),
                        volume: 1,
                        playbackRate: 1
                    })
                };

                Assets.sounds = {
                    shoot: silentSound,
                    hit: silentSound,
                    explosion: silentSound,
                    hitSmall: silentSound,
                    hitMedium: silentSound,
                    splat: silentSound,
                    gameOver: silentSound,
                    bgMusic: {
                        play: () => Promise.resolve(),
                        pause: () => {},
                        cloneNode: () => this,
                        loop: false,
                        volume: 1,
                        currentTime: 0
                    }
                };
            }
        }
    }

    static playSound(name, options = {}) {
        try {
            if (Assets.sounds[name]) {
                let sound;
                if (typeof Assets.sounds[name].cloneNode === 'function') {
                    sound = Assets.sounds[name].cloneNode();
                } else {
                    sound = Assets.sounds[name];
                }

                if (options.volume !== undefined) {
                    sound.volume = options.volume;
                }
                if (options.pitch !== undefined) {
                    sound.playbackRate = options.pitch;
                }
                if (options.randomPitch) {
                    sound.playbackRate = 0.9 + Math.random() * 0.2;
                }

                const playPromise = sound.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.warn(`Error playing sound ${name}:`, error);
                        if (options.fallback) options.fallback();
                    });
                }
            } else {
                console.warn(`Sound ${name} not loaded`);
                if (options.fallback) options.fallback();
            }
        } catch (error) {
            console.warn(`Error with sound ${name}:`, error);
            if (options.fallback) options.fallback();
        }
    }

    static playBackgroundMusic() {
        if (Assets.sounds.bgMusic) {
            Assets.sounds.bgMusic.loop = true;
            Assets.sounds.bgMusic.volume = 0.5;
            Assets.sounds.bgMusic.play();
        }
    }

    static stopBackgroundMusic() {
        if (Assets.sounds.bgMusic) {
            Assets.sounds.bgMusic.pause();
            Assets.sounds.bgMusic.currentTime = 0;
        }
    }

    static getImage(name) {
        if (Assets.images[name]) {
            return Assets.images[name];
        }
        
        // Create placeholder if image not loaded
        switch(name) {
            case 'banana':
                Assets.images[name] = PlaceholderAssets.createBananaImage();
                break;
            case 'raisin':
            case 'apricot':
            case 'prune':
                Assets.images[name] = PlaceholderAssets.createEnemyImage(name);
                break;
            case 'projectile':
                Assets.images[name] = PlaceholderAssets.createProjectileImage();
                break;
        }
        
        return Assets.images[name];
    }

    // Add method to check if audio is available
    static isAudioAvailable() {
        return new Promise(resolve => {
            const audio = new Audio();
            audio.oncanplaythrough = () => resolve(true);
            audio.onerror = () => resolve(false);
            audio.src = 'data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAAABmYWN0BAAAAAAAAABkYXRhAAAAAA==';
        });
    }
} 