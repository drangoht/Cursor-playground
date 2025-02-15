class SoundManager {
    constructor() {
        this.sounds = {
            shoot: this.createSound([220, 0], 0.1),
            levelUp: this.createSound([440, 880], 0.3),
            powerup: this.createSound([330, 440, 550], 0.2),
            hit: this.createSound([110, 55], 0.1),
            death: this.createSound([110, 55, 27], 0.3)
        };
        
        this.enabled = true;
        this.volume = 0.3;
    }

    createSound(frequencies, duration) {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillators = frequencies.map(freq => {
            const oscillator = audioCtx.createOscillator();
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
            return oscillator;
        });
        
        const gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + duration);
        
        oscillators.forEach(osc => {
            osc.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + duration);
        });
    }

    play(soundName) {
        if (this.enabled && this.sounds[soundName]) {
            this.sounds[soundName]();
        }
    }
} 