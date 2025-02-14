const fs = require('fs');
const { exec } = require('child_process');

// Using SoX command-line tool to generate sound files
// Make sure to have SoX installed: http://sox.sourceforge.net/

const sounds = {
    'shoot.wav': 'synth 0.1 sine 880-440 vol 0.3',
    'explosion.wav': 'synth 0.3 noise fade 0 0.3 0.1 vol 0.5',
    'powerup.wav': 'synth 0.15 sine 440-880 vol 0.4',
    'hit.wav': 'synth 0.05 sine 440-220 vol 0.2',
    'hit_small.wav': 'synth 0.03 sine 660-330 vol 0.1',
    'hit_medium.wav': 'synth 0.1 sine 550-275 vol 0.3',
    'splat.wav': 'synth 0.1 noise fade 0 0.1 0.05 vol 0.2',
    'game_over.wav': 'synth 0.5 sine 440-110 vol 0.4'
};

// Background music (simple loop)
const bgMusic = 'synth 4 sine 440,880,330 sine 330,660,220 vol 0.3 repeat 4';
const bossMusic = 'synth 4 sine 330,660,220 sine 440,880,330 vol 0.4 repeat 4';

// Generate sounds
Object.entries(sounds).forEach(([filename, command]) => {
    exec(`sox -n ../assets/sounds/${filename} ${command}`);
});

// Generate music
exec(`sox -n ../assets/sounds/background_music.mp3 ${bgMusic}`);
exec(`sox -n ../assets/sounds/boss_music.mp3 ${bossMusic}`); 