class HighScores {
    constructor() {
        this.scores = this.loadScores();
    }

    loadScores() {
        const savedScores = localStorage.getItem('lemonSurvivorScores');
        return savedScores ? JSON.parse(savedScores) : [];
    }

    addScore(score, wave, difficulty) {
        const newScore = {
            score,
            wave,
            difficulty,
            date: new Date().toISOString()
        };

        this.scores.push(newScore);
        this.scores.sort((a, b) => b.score - a.score);
        this.scores = this.scores.slice(0, 10); // Keep top 10
        this.saveScores();
        this.updateDisplay();
    }

    saveScores() {
        localStorage.setItem('lemonSurvivorScores', JSON.stringify(this.scores));
    }

    updateDisplay() {
        const list = document.getElementById('highscores-list');
        list.innerHTML = '';

        this.scores.forEach((score, index) => {
            const entry = document.createElement('div');
            entry.className = 'highscore-entry';
            const date = new Date(score.date).toLocaleDateString();
            entry.innerHTML = `
                <span>#${index + 1}. ${score.score.toLocaleString()} pts</span>
                <span>Wave ${score.wave} (${score.difficulty})</span>
                <span>${date}</span>
            `;
            list.appendChild(entry);
        });
    }
} 