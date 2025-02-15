class Settings {
    constructor() {
        this.settings = {
            sfxVolume: 70,
            showDamage: true,
            showTarget: true,
            screenShake: true,
            difficulty: 'normal'
        };
        
        this.loadSettings();
        // Don't setup listeners immediately, wait until needed
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('lemonSurvivorSettings');
        if (savedSettings) {
            this.settings = {...this.settings, ...JSON.parse(savedSettings)};
        }
    }

    setupListeners() {
        // Define all settings controls
        const controls = {
            'sfx-volume': {
                event: 'change',
                handler: (e) => {
                    this.settings.sfxVolume = parseInt(e.target.value);
                    this.saveSettings();
                }
            },
            'show-damage': {
                event: 'change',
                handler: (e) => {
                    this.settings.showDamage = e.target.checked;
                    this.saveSettings();
                }
            },
            'show-target': {
                event: 'change',
                handler: (e) => {
                    this.settings.showTarget = e.target.checked;
                    this.saveSettings();
                }
            },
            'screen-shake': {
                event: 'change',
                handler: (e) => {
                    this.settings.screenShake = e.target.checked;
                    this.saveSettings();
                }
            },
            'difficulty': {
                event: 'change',
                handler: (e) => {
                    this.settings.difficulty = e.target.value;
                    this.saveSettings();
                }
            }
        };

        // Safely add listeners to existing elements
        Object.entries(controls).forEach(([id, control]) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener(control.event, control.handler);
            }
        });
    }

    applySettings() {
        // Safely update UI elements if they exist
        const elements = {
            'sfx-volume': (el) => el.value = this.settings.sfxVolume,
            'show-damage': (el) => el.checked = this.settings.showDamage,
            'show-target': (el) => el.checked = this.settings.showTarget,
            'screen-shake': (el) => el.checked = this.settings.screenShake,
            'difficulty': (el) => el.value = this.settings.difficulty
        };

        Object.entries(elements).forEach(([id, setter]) => {
            const element = document.getElementById(id);
            if (element) {
                setter(element);
            }
        });
    }

    saveSettings() {
        localStorage.setItem('lemonSurvivorSettings', JSON.stringify(this.settings));
    }

    getDifficultyMultipliers() {
        switch(this.settings.difficulty) {
            case 'easy':
                return { damage: 0.7, health: 0.8, speed: 0.8, xp: 1.2 };
            case 'hard':
                return { damage: 1.3, health: 1.2, speed: 1.2, xp: 0.8 };
            case 'nightmare':
                return { damage: 1.5, health: 1.5, speed: 1.3, xp: 0.6 };
            default: // normal
                return { damage: 1, health: 1, speed: 1, xp: 1 };
        }
    }
} 