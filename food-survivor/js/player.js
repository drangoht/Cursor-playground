class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = CONFIG.PLAYER.SIZE;
        this.speed = CONFIG.PLAYER.SPEED;
        this.maxHealth = CONFIG.PLAYER.MAX_HEALTH;
        this.health = this.maxHealth;
        this.xp = 0;
        this.level = 1;
        this.nextLevelXp = CONFIG.XP.BASE_NEXT_LEVEL;
        this.weapons = [];
        this.powerups = [];
        this.baseDamage = CONFIG.PLAYER.BASE_DAMAGE;
        this.isInvulnerable = false;
        this.invulnerabilityDuration = 1000; // 1 second of invincibility after taking damage
        this.lastDamageTime = 0;
        this.shield = 0;
        this.maxShield = 100;
        this.activeEffects = [];
        this.healthRegen = 0;
        this.damageField = 0;
        this.damageFieldRadius = 0;
        this.targetX = x;
        this.targetY = y;
        
        // Add default weapon
        this.addWeapon(CONFIG.WEAPONS[0]);

        // Get sprite reference from game
        this.sprite = null; // Will be set when game reference is added

        this.visualEffects = {
            trail: false,
            glow: false,
            shield: false,
            trailColor: '#ffffff',
            glowColor: '#ffffff',
            shieldColor: '#ffffff',
            glowIntensity: 1,
            trailLength: 5,
            shieldPulseRate: 1
        };
    }

    update(keys) {
        // Movement
        if (keys.ArrowLeft || keys.a) this.x -= this.speed;
        if (keys.ArrowRight || keys.d) this.x += this.speed;
        if (keys.ArrowUp || keys.w) this.y -= this.speed;
        if (keys.ArrowDown || keys.s) this.y += this.speed;
        
        // Keep player in bounds
        this.x = Math.max(0, Math.min(this.x, CONFIG.CANVAS_WIDTH - this.size));
        this.y = Math.max(0, Math.min(this.y, CONFIG.CANVAS_HEIGHT - this.size));

        // Update weapons
        const now = Date.now();
        this.weapons.forEach(weapon => {
            if (weapon.isOrbital || weapon.isShield) {
                // Auto-fire orbital and shield weapons
                if (now - weapon.lastFired >= weapon.fireRate) {
                    this.fireWeapon(weapon);
                    weapon.lastFired = now;
                }
            }
        });

        // Update invulnerability
        if (this.isInvulnerable && now - this.lastDamageTime >= this.invulnerabilityDuration) {
            this.isInvulnerable = false;
        }

        // Update active effects
        this.activeEffects = this.activeEffects.filter(effect => {
            if (now >= effect.endTime) {
                this.removeEffect(effect);
                return false;
            }
            return true;
        });

        // Apply health regeneration
        if (this.healthRegen > 0) {
            this.heal(this.healthRegen / 60); // Assuming 60 FPS
        }

        // Apply damage field
        if (this.damageField > 0) {
            this.applyDamageField();
        }
    }

    draw(ctx) {
        ctx.save();
        
        // Draw trails if active
        if (this.visualEffects.trail) {
            this.drawTrailEffect(ctx);
        }
        
        // Draw glow if active
        if (this.visualEffects.glow) {
            this.drawGlowEffect(ctx);
        }
        
        // Draw shield if active
        if (this.visualEffects.shield) {
            this.drawShieldEffect(ctx);
        }

        // Draw base player sprite with current weapon color
        if (this.game && this.game.sprites) {
            const currentWeapon = this.weapons[0];
            this.drawPlayerWithWeaponEffect(ctx, currentWeapon);
        }
        
        // Draw damage field if active
        if (this.damageField > 0) {
            const gradient = ctx.createRadialGradient(
                this.x + this.size/2, this.y + this.size/2, 0,
                this.x + this.size/2, this.y + this.size/2, this.damageFieldRadius
            );
            gradient.addColorStop(0, 'rgba(255, 255, 0, 0.1)');
            gradient.addColorStop(1, 'rgba(255, 255, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x + this.size/2, this.y + this.size/2, this.damageFieldRadius, 0, Math.PI * 2);
            ctx.fill();
        }

        // Flash when invulnerable
        if (this.isInvulnerable) {
            ctx.globalAlpha = 0.5 + Math.sin(Date.now() * 0.01) * 0.5;
        }

        // Draw health and shield bars
        const barWidth = this.size;
        const barHeight = 4;
        const barSpacing = 2;
        const barY = this.y - 12;

        // Health bar
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x, barY, barWidth, barHeight);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(this.x, barY, barWidth * (this.health / this.maxHealth), barHeight);

        // Shield bar
        if (this.shield > 0) {
            ctx.fillStyle = '#4444ff';
            ctx.fillRect(this.x, barY - barHeight - barSpacing, barWidth, barHeight);
            ctx.fillStyle = '#8888ff';
            ctx.fillRect(this.x, barY - barHeight - barSpacing, barWidth * (this.shield / this.maxShield), barHeight);
        }

        // Active effects indicators
        this.drawActiveEffects(ctx);

        ctx.restore();
    }

    drawTrailEffect(ctx) {
        ctx.fillStyle = this.visualEffects.trailColor;
        ctx.globalAlpha = 0.3;
        for (let i = 0; i < this.visualEffects.trailLength; i++) {
            const trailSize = this.size * (1 - i / this.visualEffects.trailLength);
            ctx.beginPath();
            ctx.arc(
                this.x + this.size/2,
                this.y + this.size/2,
                trailSize/2,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
    }

    drawGlowEffect(ctx) {
        const gradient = ctx.createRadialGradient(
            this.x + this.size/2,
            this.y + this.size/2,
            0,
            this.x + this.size/2,
            this.y + this.size/2,
            this.size * this.visualEffects.glowIntensity
        );
        gradient.addColorStop(0, this.visualEffects.glowColor);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(
            this.x - this.size/2,
            this.y - this.size/2,
            this.size * 2,
            this.size * 2
        );
    }

    drawShieldEffect(ctx) {
        const pulseScale = 1 + Math.sin(Date.now() * 0.003 * this.visualEffects.shieldPulseRate) * 0.1;
        ctx.strokeStyle = this.visualEffects.shieldColor;
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.arc(
            this.x + this.size/2,
            this.y + this.size/2,
            this.size * pulseScale,
            0,
            Math.PI * 2
        );
        ctx.stroke();
    }

    drawPlayerWithWeaponEffect(ctx, weapon) {
        // Tint player sprite based on current weapon
        const sprite = this.game.sprites.player;
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(sprite, this.x, this.y, this.size, this.size);
        
        if (weapon && weapon.color) {
            ctx.globalCompositeOperation = 'overlay';
            ctx.fillStyle = weapon.color;
            ctx.globalAlpha = 0.3;
            ctx.fillRect(this.x, this.y, this.size, this.size);
        }
    }

    drawActiveEffects(ctx) {
        const iconSize = 20;
        const padding = 5;
        let offsetX = 0;

        this.activeEffects.forEach(effect => {
            const timeLeft = (effect.endTime - Date.now()) / effect.duration;
            
            // Draw effect icon
            ctx.fillStyle = this.getEffectColor(effect.type);
            ctx.fillRect(this.x + offsetX, this.y - 25, iconSize, iconSize);
            
            // Draw duration bar
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(
                this.x + offsetX,
                this.y - 25 + iconSize,
                iconSize * timeLeft,
                2
            );
            
            offsetX += iconSize + padding;
        });
    }

    getEffectColor(type) {
        switch(type) {
            case 'shield': return '#4444ff';
            case 'regen': return '#44ff44';
            case 'field': return '#ffff44';
            case 'fireRate': return '#ff44ff';
            default: return '#ffffff';
        }
    }

    addXp(amount) {
        this.xp += amount;
        
        if (this.xp >= this.nextLevelXp) {
            this.levelUp();
        }
        
        // Update XP bar
        const xpBar = document.getElementById('xp-bar');
        if (xpBar) {
            const progress = (this.xp / this.nextLevelXp) * 100;
            xpBar.style.width = `${progress}%`;
        }
    }

    levelUp() {
        this.level++;
        this.xp = 0;
        this.nextLevelXp *= CONFIG.XP.LEVEL_MULTIPLIER;
        
        // Create level up effect
        if (this.game) {
            this.game.particles.createLevelUpEffect(this.x + this.size/2, this.y + this.size/2);
            this.game.playSound('levelUp');
        }
        
        // Show level up menu
        this.showLevelUpMenu();
    }

    showLevelUpMenu() {
        if (this.game) {
            const menu = document.getElementById('level-up-menu');
            const options = document.getElementById('upgrade-options');
            options.innerHTML = '';
            
            // Generate 3 random upgrades
            const upgrades = this.getRandomUpgrades(3);
            upgrades.forEach(upgrade => {
                const option = document.createElement('div');
                option.className = 'upgrade-option';
                
                // Add icon and description
                option.innerHTML = `
                    <h3>${upgrade.name}</h3>
                    <p>${this.getUpgradeDescription(upgrade)}</p>
                    <div class="upgrade-preview"></div>
                `;
                
                // Add preview animation
                const preview = option.querySelector('.upgrade-preview');
                this.createUpgradePreview(upgrade, preview);
                
                option.onclick = () => {
                    this.selectUpgrade(upgrade);
                    this.game.playSound('powerup');
                };
                options.appendChild(option);
            });
            
            // Show menu and pause game
            this.game.showLevelUpMenu();
        }
    }

    createUpgradePreview(upgrade, container) {
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        container.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        let frame = 0;
        
        const animate = () => {
            if (!container.isConnected) return; // Stop if element is removed
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw preview animation based on upgrade type
            if (upgrade.projectileSpeed) { // Weapon preview
                this.drawWeaponPreview(ctx, upgrade, frame);
            } else { // Powerup preview
                this.drawPowerupPreview(ctx, upgrade, frame);
            }
            
            frame++;
            requestAnimationFrame(animate);
        };
        
        animate();
    }

    drawWeaponPreview(ctx, weapon, frame) {
        const centerX = 50;
        const centerY = 50;
        
        // Draw weapon effect
        if (weapon.spread) {
            // Draw spread pattern
            for (let i = 0; i < weapon.spread; i++) {
                const angle = (Math.PI / 4) * (i - (weapon.spread - 1) / 2);
                const x = centerX + Math.cos(angle + frame * 0.05) * 20;
                const y = centerY + Math.sin(angle + frame * 0.05) * 20;
                
                ctx.fillStyle = weapon.color;
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (weapon.isShield) {
            // Draw orbiting shield
            for (let i = 0; i < weapon.orbitalCount; i++) {
                const angle = (Math.PI * 2 * i) / weapon.orbitalCount + frame * 0.05;
                const x = centerX + Math.cos(angle) * 20;
                const y = centerY + Math.sin(angle) * 20;
                
                ctx.fillStyle = weapon.color;
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, Math.PI * 2);
                ctx.fill();
            }
        } else {
            // Draw basic projectile pattern
            const x = centerX + Math.cos(frame * 0.1) * 20;
            const y = centerY + Math.sin(frame * 0.1) * 20;
            
            ctx.fillStyle = weapon.color;
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawPowerupPreview(ctx, powerup, frame) {
        const centerX = 50;
        const centerY = 50;
        
        if (powerup.visualEffect) {
            const { color, trail, glow, shield } = powerup.visualEffect;
            
            if (shield) {
                // Draw pulsing shield
                const pulseScale = 1 + Math.sin(frame * 0.1) * 0.2;
                ctx.strokeStyle = color;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(centerX, centerY, 20 * pulseScale, 0, Math.PI * 2);
                ctx.stroke();
            }
            
            if (glow) {
                // Draw glowing effect
                const gradient = ctx.createRadialGradient(
                    centerX, centerY, 0,
                    centerX, centerY, 30
                );
                gradient.addColorStop(0, color);
                gradient.addColorStop(1, 'transparent');
                ctx.fillStyle = gradient;
                ctx.fillRect(20, 20, 60, 60);
            }
            
            if (trail) {
                // Draw trailing effect
                for (let i = 0; i < 5; i++) {
                    const x = centerX + Math.cos(frame * 0.1) * 20;
                    const y = centerY + Math.sin(frame * 0.1) * 20;
                    ctx.fillStyle = color;
                    ctx.globalAlpha = 1 - i * 0.2;
                    ctx.beginPath();
                    ctx.arc(x, y, 8 - i, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
    }

    getRandomUpgrades(count) {
        // Combine weapons and powerups
        const allUpgrades = [...CONFIG.WEAPONS, ...CONFIG.POWERUPS];
        const upgrades = [];
        
        for (let i = 0; i < count; i++) {
            const index = Math.floor(Math.random() * allUpgrades.length);
            upgrades.push(allUpgrades[index]);
        }
        
        return upgrades;
    }

    selectUpgrade(upgrade) {
        if (upgrade.projectileSpeed) { // It's a weapon
            this.addWeapon(upgrade);
        } else { // It's a powerup
            this.addPowerup(upgrade);
        }
        
        // Resume game
        if (this.game) {
            this.game.hideLevelUpMenu();
        }
    }

    getUpgradeDescription(upgrade) {
        if (upgrade.projectileSpeed) {
            return `Weapon: ${upgrade.description || 'A new weapon to fight with!'}`;
        } else {
            switch(upgrade.effect) {
                case 'speed':
                    return `Increase movement speed by ${(upgrade.value - 1) * 100}%`;
                case 'damage':
                    return `Increase damage by ${(upgrade.value - 1) * 100}%`;
                case 'health':
                    return `Restore ${upgrade.value} health`;
                case 'shield':
                    return `Add ${upgrade.value} shield points`;
                case 'regen':
                    return `Regenerate ${upgrade.value} health per second`;
                case 'field':
                    return `Create damage field dealing ${upgrade.value} damage per second`;
                default:
                    return upgrade.description || 'A powerful upgrade!';
            }
        }
    }

    addWeapon(weaponConfig) {
        // Create a new weapon instance
        const weapon = {
            ...weaponConfig,
            player: this,
            lastFired: 0,
            id: Date.now() + Math.random() // Unique ID for each weapon
        };

        // For orbital/shield weapons, assign positions
        if (weapon.isShield || weapon.isOrbital) {
            const existingOrbitalCount = this.weapons.filter(w => 
                w.isShield || w.isOrbital
            ).length;
            weapon.orbitalIndex = existingOrbitalCount;
        }

        this.weapons.push(weapon);

        // Sort weapons so regular weapons come first, then orbitals/shields
        this.weapons.sort((a, b) => {
            if ((a.isShield || a.isOrbital) && !(b.isShield || b.isOrbital)) return 1;
            if (!(a.isShield || a.isOrbital) && (b.isShield || b.isOrbital)) return -1;
            return 0;
        });
    }

    addPowerup(powerup) {
        this.powerups.push(powerup);
        this.applyPowerup(powerup);
    }

    applyPowerup(powerup) {
        switch(powerup.effect) {
            case 'speed':
                this.speed *= powerup.value;
                break;
            case 'damage':
                this.baseDamage *= powerup.value;
                break;
            case 'health':
                this.health = Math.min(
                    this.health + powerup.value,
                    CONFIG.PLAYER.MAX_HEALTH
                );
                break;
        }

        // Apply visual effects
        if (powerup.visualEffect) {
            const {trail, glow, shield, color, intensity, pulseRate, particles} = powerup.visualEffect;
            
            if (trail) {
                this.visualEffects.trail = true;
                this.visualEffects.trailColor = color;
            }
            
            if (glow) {
                this.visualEffects.glow = true;
                this.visualEffects.glowColor = color;
                this.visualEffects.glowIntensity = intensity || 1;
            }
            
            if (shield) {
                this.visualEffects.shield = true;
                this.visualEffects.shieldColor = color;
                this.visualEffects.shieldPulseRate = pulseRate || 1;
            }
        }
    }

    getDamage() {
        return this.baseDamage;
    }

    fireWeapon(weapon) {
        if (!this.game) return;

        if (weapon.spread) {
            // Fire multiple projectiles in a spread pattern
            for (let i = 0; i < weapon.spread; i++) {
                const angle = (Math.PI / 4) * (i - (weapon.spread - 1) / 2);
                const cos = Math.cos(angle);
                const sin = Math.sin(angle);
                
                const dirX = this.targetX - (this.x + this.size/2);
                const dirY = this.targetY - (this.y + this.size/2);
                const length = Math.sqrt(dirX * dirX + dirY * dirY);
                
                const normalizedX = dirX / length;
                const normalizedY = dirY / length;
                
                const spreadX = normalizedX * cos - normalizedY * sin;
                const spreadY = normalizedX * sin + normalizedY * cos;
                
                this.createProjectile(weapon, spreadX, spreadY);
            }
        } else if (weapon.isShield) {
            // Create shield projectiles around the player
            const totalShields = this.weapons.filter(w => w.isShield).length;
            const shieldIndex = weapon.orbitalIndex;
            
            for (let i = 0; i < weapon.orbitalCount; i++) {
                const angle = (Math.PI * 2 * i) / weapon.orbitalCount + 
                            (shieldIndex * Math.PI * 2) / (totalShields * weapon.orbitalCount);
                this.createOrbitalProjectile(weapon, angle);
            }
        } else if (weapon.isOrbital) {
            // Create orbital projectiles
            const angle = (weapon.orbitalIndex || 0) * (Math.PI * 2 / this.weapons.length);
            this.createOrbitalProjectile(weapon, angle);
        } else {
            // Standard single projectile
            const dirX = this.targetX - (this.x + this.size/2);
            const dirY = this.targetY - (this.y + this.size/2);
            const length = Math.sqrt(dirX * dirX + dirY * dirY);
            this.createProjectile(weapon, dirX/length, dirY/length);
        }

        // Play shoot sound
        this.game.playSound('shoot');
    }

    createProjectile(weapon, dirX, dirY) {
        this.game.projectiles.push(new Projectile(
            this.x + this.size/2,
            this.y + this.size/2,
            this.x + this.size/2 + dirX * 100,
            this.y + this.size/2 + dirY * 100,
            weapon
        ));
    }

    createOrbitalProjectile(weapon, angle) {
        const shieldWeapon = { 
            ...weapon, 
            orbitAngle: angle,
            parentWeaponId: weapon.id 
        };
        this.game.projectiles.push(new Projectile(
            this.x + this.size/2,
            this.y + this.size/2,
            this.x + this.size/2,
            this.y + this.size/2,
            shieldWeapon
        ));
    }

    takeDamage(amount) {
        if (this.isInvulnerable) return;

        // Apply shield first
        if (this.shield > 0) {
            if (this.shield >= amount) {
                this.shield -= amount;
                amount = 0;
            } else {
                amount -= this.shield;
                this.shield = 0;
            }
        }

        // Apply remaining damage to health
        if (amount > 0) {
            this.health = Math.max(0, this.health - amount * CONFIG.PLAYER.DAMAGE_REDUCTION);
            this.isInvulnerable = true;
            this.lastDamageTime = Date.now();

            // Visual and sound feedback
            this.game.particles.createHitEffect(this.x + this.size/2, this.y + this.size/2, '#ff0000');
            this.game.playSound('hit');

            if (this.health <= 0) {
                this.die();
            }
        }
    }

    die() {
        // Trigger game over
        this.game.gameOver();
    }

    heal(amount) {
        const oldHealth = this.health;
        this.health = Math.min(this.maxHealth, this.health + amount);
        const actualHeal = this.health - oldHealth;
        
        if (actualHeal > 0 && this.game) {
            this.game.addDamageNumber(
                this.x + this.size/2,
                this.y,
                actualHeal,
                'heal'
            );
        }
    }

    applyDamageField() {
        this.game.enemies.forEach(enemy => {
            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= this.damageFieldRadius) {
                enemy.takeDamage(this.damageField / 60); // Damage per frame
                
                // Visual effect
                if (Math.random() < 0.1) { // 10% chance per frame
                    this.game.particles.createDamageFieldParticle(
                        enemy.x + Math.random() * enemy.size,
                        enemy.y + Math.random() * enemy.size
                    );
                }
            }
        });
    }

    addEffect(type, value, duration) {
        const effect = {
            type,
            value,
            duration,
            endTime: Date.now() + duration
        };

        this.activeEffects.push(effect);

        switch(type) {
            case 'shield':
                this.shield = Math.min(this.maxShield, this.shield + value);
                break;
            case 'regen':
                this.healthRegen += value;
                break;
            case 'field':
                this.damageField += value;
                this.damageFieldRadius = Math.max(this.damageFieldRadius, effect.radius || 100);
                break;
            case 'fireRate':
                this.weapons.forEach(weapon => {
                    weapon.fireRate *= value;
                });
                break;
        }
    }

    removeEffect(effect) {
        switch(effect.type) {
            case 'regen':
                this.healthRegen -= effect.value;
                break;
            case 'field':
                this.damageField -= effect.value;
                break;
            case 'fireRate':
                this.weapons.forEach(weapon => {
                    weapon.fireRate /= effect.value;
                });
                break;
        }
    }

    applyDifficultyMultipliers(multipliers) {
        // Apply difficulty settings to player stats
        this.baseDamage *= multipliers.damage;
        this.maxHealth *= multipliers.health;
        this.health = this.maxHealth;
        this.speed *= multipliers.speed;
        
        // Apply to weapons
        this.weapons.forEach(weapon => {
            weapon.damage *= multipliers.damage;
        });
    }
} 