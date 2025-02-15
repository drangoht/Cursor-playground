class Projectile {
    constructor(x, y, targetX, targetY, weapon) {
        this.x = x;
        this.y = y;
        this.weapon = weapon;
        
        // Calculate direction
        const dx = targetX - x;
        const dy = targetY - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        this.velocityX = (dx / distance) * weapon.projectileSpeed;
        this.velocityY = (dy / distance) * weapon.projectileSpeed;
        
        this.range = weapon.range;
        this.distanceTraveled = 0;
        this.size = 8;
        this.isOrbital = weapon.isOrbital;
        this.isPiercing = weapon.isPiercing;
        this.isShield = weapon.isShield;
        this.chainCount = weapon.chainCount;
        this.chainRange = weapon.chainRange;
        this.orbitAngle = Math.random() * Math.PI * 2;
        this.orbitSpeed = 0.1;
        this.hitTargets = new Set();
        this.expired = false;
        this.type = this.getProjectileType(weapon);
        this.rotation = Math.atan2(targetY - y, targetX - x);
        this.scale = weapon.effectScale || 1;
    }

    update() {
        if (this.isOrbital) {
            this.updateOrbital();
        } else if (this.isShield) {
            this.updateShield();
        } else {
            // Normal projectile movement
            this.x += this.velocityX;
            this.y += this.velocityY;
        }
        
        // Calculate distance traveled
        this.distanceTraveled += Math.sqrt(
            this.velocityX * this.velocityX + 
            this.velocityY * this.velocityY
        );
        
        // Check if projectile has exceeded its range
        this.expired = this.distanceTraveled > this.range;
        
        return this.expired;
    }

    isExpired() {
        return this.expired;
    }

    updateOrbital() {
        this.orbitAngle += this.orbitSpeed;
        const player = this.weapon.player;
        this.x = player.x + Math.cos(this.orbitAngle) * this.range;
        this.y = player.y + Math.sin(this.orbitAngle) * this.range;
    }

    updateShield() {
        const player = this.weapon.player;
        const shieldIndex = this.weapon.shieldIndex || 0;
        const totalShields = this.weapon.orbitalCount;
        const angle = (Math.PI * 2 * shieldIndex) / totalShields + this.orbitAngle;
        
        this.x = player.x + Math.cos(angle) * this.range;
        this.y = player.y + Math.sin(angle) * this.range;
    }

    handleHit(enemy) {
        if (this.isPiercing) {
            if (!this.hitTargets.has(enemy.id)) {
                this.hitTargets.add(enemy.id);
                return false; // Don't destroy projectile
            }
        }

        if (this.chainCount > 0) {
            this.chainToNearestEnemy();
            this.chainCount--;
            return false;
        }

        return true; // Destroy projectile
    }

    chainToNearestEnemy() {
        const nearestEnemy = this.findNearestEnemy();
        if (nearestEnemy) {
            const dx = nearestEnemy.x - this.x;
            const dy = nearestEnemy.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            this.velocityX = (dx / distance) * this.weapon.projectileSpeed;
            this.velocityY = (dy / distance) * this.weapon.projectileSpeed;
        }
    }

    findNearestEnemy() {
        // Implementation depends on game structure
        // Should return nearest enemy within chainRange that hasn't been hit
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        const color = this.weapon.color || '#ffeb3b';
        
        switch(this.type) {
            case 'spread':
                this.drawSpreadProjectile(ctx, color);
                break;
            case 'shield':
                this.drawShieldProjectile(ctx, color);
                break;
            case 'piercing':
                this.drawPiercingProjectile(ctx, color);
                break;
            case 'chain':
                this.drawChainProjectile(ctx, color);
                break;
            default:
                this.drawBasicProjectile(ctx, color);
        }
        
        ctx.restore();
    }

    drawBasicProjectile(ctx, color) {
        // Lemon drop shape
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0, 0, this.size * this.scale, 0, Math.PI * 2);
        ctx.fill();
        
        // Glow effect
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size * 1.5 * this.scale);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 1.5 * this.scale, 0, Math.PI * 2);
        ctx.fill();
    }

    drawSpreadProjectile(ctx, color) {
        // Acid spray effect
        ctx.strokeStyle = color;
        ctx.lineWidth = 2 * this.scale;
        
        for (let i = 0; i < 3; i++) {
            const offset = (i - 1) * 4;
            ctx.beginPath();
            ctx.moveTo(-5 * this.scale + offset, 0);
            ctx.lineTo(5 * this.scale + offset, 0);
            ctx.stroke();
        }
        
        // Particle effect
        for (let i = 0; i < 3; i++) {
            ctx.fillStyle = color;
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.arc(
                (Math.random() - 0.5) * 10 * this.scale,
                (Math.random() - 0.5) * 10 * this.scale,
                this.size * 0.3 * this.scale,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
    }

    drawPiercingProjectile(ctx, color) {
        // Sharp arrow shape
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(this.size * this.scale, 0);
        ctx.lineTo(-this.size * this.scale, this.size * 0.5 * this.scale);
        ctx.lineTo(-this.size * 0.5 * this.scale, 0);
        ctx.lineTo(-this.size * this.scale, -this.size * 0.5 * this.scale);
        ctx.closePath();
        ctx.fill();
        
        // Trail effect
        ctx.strokeStyle = color;
        ctx.lineWidth = 2 * this.scale;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.moveTo(-this.size * 0.5 * this.scale, 0);
        ctx.lineTo(-this.size * 2 * this.scale, 0);
        ctx.stroke();
    }

    drawChainProjectile(ctx, color) {
        // Electric bolt effect
        ctx.strokeStyle = color;
        ctx.lineWidth = 3 * this.scale;
        
        ctx.beginPath();
        ctx.moveTo(-this.size * this.scale, 0);
        for (let i = 1; i <= 3; i++) {
            const x = (-this.size + (i * this.size)) * this.scale;
            const y = (Math.random() - 0.5) * 10 * this.scale;
            ctx.lineTo(x, y);
        }
        ctx.stroke();
        
        // Spark effect
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.3 * this.scale, 0, Math.PI * 2);
        ctx.fill();
    }

    drawShieldProjectile(ctx, color) {
        // Shield orb with pulse effect
        const pulseScale = 1 + Math.sin(Date.now() * 0.01) * 0.2;
        
        // Outer glow
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size * 2 * this.scale * pulseScale);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 2 * this.scale * pulseScale, 0, Math.PI * 2);
        ctx.fill();
        
        // Core
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0, 0, this.size * this.scale, 0, Math.PI * 2);
        ctx.fill();
    }

    getProjectileType(weapon) {
        if (weapon.spread) return 'spread';
        if (weapon.isShield) return 'shield';
        if (weapon.isPiercing) return 'piercing';
        if (weapon.isChain) return 'chain';
        return 'basic';
    }

    getProjectileColor() {
        switch(this.weapon.name) {
            case 'Acid Spray': return '#7fff00';
            case 'Seed Shot': return '#ffd700';
            default: return '#ffffff';
        }
    }
} 