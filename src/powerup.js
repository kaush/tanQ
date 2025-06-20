// Power-up system for tanQ
class PowerUp {
    constructor(x, y, type = 'heart') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.width = 8;
        this.height = 8;
        this.collected = false;
        this.animationTimer = 0;
        this.pulseScale = 1.0;
        this.lifetime = 15000; // 15 seconds before disappearing
        this.age = 0;
    }
    
    update(deltaTime) {
        if (this.collected) return;
        
        // Update animation
        this.animationTimer += deltaTime;
        this.age += deltaTime;
        
        // Pulsing animation
        this.pulseScale = 1.0 + Math.sin(this.animationTimer * 0.005) * 0.2;
        
        // Check if power-up has expired
        if (this.age > this.lifetime) {
            this.collected = true; // Mark for removal
        }
    }
    
    draw(ctx) {
        if (this.collected) return;
        
        ctx.save();
        
        // Apply pulsing scale
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        ctx.translate(centerX, centerY);
        ctx.scale(this.pulseScale, this.pulseScale);
        ctx.translate(-this.width / 2, -this.height / 2);
        
        if (this.type === 'heart') {
            this.drawHeart(ctx);
        }
        
        ctx.restore();
    }
    
    drawHeart(ctx) {
        // Draw a simple heart shape using pixels
        ctx.fillStyle = '#FF0066';
        
        // Heart pattern (8x8 pixels)
        const heartPattern = [
            [0,1,1,0,0,1,1,0],
            [1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1],
            [0,1,1,1,1,1,1,0],
            [0,0,1,1,1,1,0,0],
            [0,0,0,1,1,0,0,0],
            [0,0,0,0,0,0,0,0]
        ];
        
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                if (heartPattern[y][x]) {
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }
        
        // Add a white highlight
        ctx.fillStyle = '#FFAACC';
        ctx.fillRect(1, 1, 1, 1);
        ctx.fillRect(4, 1, 1, 1);
    }
    
    // Check collision with player
    checkCollision(player) {
        if (this.collected) return false;
        
        return player.x < this.x + this.width &&
               player.x + player.width > this.x &&
               player.y < this.y + this.height &&
               player.y + player.height > this.y;
    }
    
    // Collect the power-up
    collect() {
        if (!this.collected) {
            this.collected = true;
            return this.type;
        }
        return null;
    }
    
    isCollected() {
        return this.collected;
    }
}

// Power-up manager
class PowerUpManager {
    constructor(gameWidth, gameHeight) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.powerUps = [];
        this.spawnTimer = 0;
        this.spawnInterval = 20000; // 20 seconds between spawns
        this.maxPowerUps = 2; // Maximum power-ups on screen at once
    }
    
    update(deltaTime) {
        // Update spawn timer
        this.spawnTimer += deltaTime;
        
        // Spawn new power-up if conditions are met
        if (this.spawnTimer >= this.spawnInterval && 
            this.powerUps.filter(p => !p.collected).length < this.maxPowerUps) {
            this.spawnPowerUp();
            this.spawnTimer = 0;
        }
        
        // Update existing power-ups
        this.powerUps.forEach(powerUp => {
            powerUp.update(deltaTime);
        });
        
        // Remove collected or expired power-ups
        this.powerUps = this.powerUps.filter(powerUp => !powerUp.collected);
    }
    
    spawnPowerUp() {
        // Random position, avoiding edges
        const margin = 20;
        const x = margin + Math.random() * (this.gameWidth - margin * 2 - 8);
        const y = margin + Math.random() * (this.gameHeight - margin * 2 - 8);
        
        const powerUp = new PowerUp(x, y, 'heart');
        this.powerUps.push(powerUp);
        
        console.log('Heart power-up spawned at:', x, y);
    }
    
    draw(ctx) {
        this.powerUps.forEach(powerUp => {
            powerUp.draw(ctx);
        });
    }
    
    checkCollisions(player) {
        const collectedTypes = [];
        
        this.powerUps.forEach(powerUp => {
            if (powerUp.checkCollision(player)) {
                const type = powerUp.collect();
                if (type) {
                    collectedTypes.push(type);
                    console.log('Power-up collected:', type);
                }
            }
        });
        
        return collectedTypes;
    }
    
    // Clear all power-ups (for game restart)
    clear() {
        this.powerUps = [];
        this.spawnTimer = 0;
    }
}
