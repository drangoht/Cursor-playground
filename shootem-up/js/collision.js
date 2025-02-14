class Collision {
    static checkCollisions(game) {
        // Check projectiles hitting enemies
        for (let projectile of game.projectiles) {
            for (let enemy of game.enemies) {
                if (this.isColliding(projectile, enemy)) {
                    enemy.hit();
                    const projectileIndex = game.projectiles.indexOf(projectile);
                    if (projectileIndex > -1) {
                        projectile.onHit(projectile.x, projectile.y);
                        game.projectiles.splice(projectileIndex, 1);
                    }
                }
            }
        }

        // Check enemies hitting player
        for (let enemy of game.enemies) {
            if (this.isColliding(enemy, game.player) && !game.player.invulnerable) {
                game.player.hit();
                const enemyIndex = game.enemies.indexOf(enemy);
                if (enemyIndex > -1) {
                    game.enemies.splice(enemyIndex, 1);
                }
            }
        }

        // Check powerups colliding with player
        for (let powerup of game.powerups) {
            if (this.isColliding(powerup, game.player)) {
                powerup.collect();
                const powerupIndex = game.powerups.indexOf(powerup);
                if (powerupIndex > -1) {
                    game.powerups.splice(powerupIndex, 1);
                }
            }
        }
    }

    static isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
} 