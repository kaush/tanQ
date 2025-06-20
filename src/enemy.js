// Enemy tank classes
class Enemy {
    constructor(x, y, type = 'basic') {
        this.x = x;
        this.y = y;
        this.width = 8;
        this.height = 8;
        this.type = type;
        this.destroyed = false;
        this.health = 1;
        
        // Movement properties
        this.direction = Math.floor(Math.random() * 4); // Random initial direction
        this.moveTimer = 0;
        this.directionChangeInterval = 1000 + Math.random() * 2000; // 1-3 seconds
        
        // Shooting properties
        this.canShoot = true;
        this.shootCooldown = 0;
        this.lastShotTime = 0;
        
        // Type-specific properties
        this.setupTypeProperties();
    }
    
    setupTypeProperties() {
        switch (this.type) {
            case 'basic':
                this.speed = 20;
                this.color = '#FF0000';
                this.health = 1;
                this.shootInterval = 2000 + Math.random() * 3000; // 2-5 seconds
                break;
            case 'smart':
                this.speed = 25;
                this.color = '#FFFF00';
                this.health = 1;
                this.shootInterval = 1500 + Math.random() * 2000; // 1.5-3.5 seconds
                break;
            case 'fast':
                this.speed = 40;
                this.color = '#FF8800';
                this.health = 1;
                this.shootInterval = 3000 + Math.random() * 2000; // 3-5 seconds
                break;
            case 'heavy':
                this.speed = 15;
                this.color = '#800080';
                this.health = 2;
                this.shootInterval = 1000 + Math.random() * 2000; // 1-3 seconds
                break;
        }
    }
    
    update(deltaTime, player, gameWidth, gameHeight) {
        if (this.destroyed) return;
        
        // Handle shooting cooldown
        if (this.shootCooldown > 0) {
            this.shootCooldown -= deltaTime;
            if (this.shootCooldown <= 0) {
                this.canShoot = true;
            }
        }
        
        // Movement logic based on type
        this.updateMovement(deltaTime, player, gameWidth, gameHeight);
        
        // Keep enemy in bounds
        this.x = Math.max(0, Math.min(gameWidth - this.width, this.x));
        this.y = Math.max(0, Math.min(gameHeight - this.height, this.y));
    }
    
    updateMovement(deltaTime, player, gameWidth, gameHeight) {
        this.moveTimer += deltaTime;
        
        // Change direction periodically or when hitting boundaries
        if (this.moveTimer > this.directionChangeInterval || this.isAtBoundary(gameWidth, gameHeight)) {
            this.changeDirection(player);
            this.moveTimer = 0;
            this.directionChangeInterval = 1000 + Math.random() * 2000;
        }
        
        // Move based on current direction
        const moveSpeed = this.speed * (deltaTime / 1000);
        const oldX = this.x;
        const oldY = this.y;
        
        switch (this.direction) {
            case 0: // Up
                this.y -= moveSpeed;
                break;
            case 1: // Right
                this.x += moveSpeed;
                break;
            case 2: // Down
                this.y += moveSpeed;
                break;
            case 3: // Left
                this.x -= moveSpeed;
                break;
        }
        
        // Play movement sound if actually moved (throttled)
        if ((Math.abs(this.x - oldX) > 0.1 || Math.abs(this.y - oldY) > 0.1) && 
            (!this.lastMoveSound || Date.now() - this.lastMoveSound > 300)) {
            audioSystem.playEnemyMove(this.type);
            this.lastMoveSound = Date.now();
        }
    }
    
    changeDirection(player) {
        if (this.type === 'smart' && player && Math.random() < 0.6) {
            // Smart tanks sometimes move toward player
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            
            if (Math.abs(dx) > Math.abs(dy)) {
                this.direction = dx > 0 ? 1 : 3; // Right or Left
            } else {
                this.direction = dy > 0 ? 2 : 0; // Down or Up
            }
        } else {
            // Random direction change
            this.direction = Math.floor(Math.random() * 4);
        }
    }
    
    isAtBoundary(gameWidth, gameHeight) {
        const margin = 5;
        return this.x <= margin || this.x >= gameWidth - this.width - margin ||
               this.y <= margin || this.y >= gameHeight - this.height - margin;
    }
    
    shoot(player) {
        if (!this.canShoot || !player) return null;
        
        this.canShoot = false;
        this.shootCooldown = this.shootInterval;
        
        // Play enemy shooting sound
        audioSystem.playShoot(false);
        
        // Calculate bullet direction
        let bulletDx = 0;
        let bulletDy = 0;
        
        if (this.type === 'smart') {
            // Smart tanks aim at player
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                bulletDx = dx / distance;
                bulletDy = dy / distance;
            }
        } else {
            // Other tanks shoot in random directions or toward player area
            if (Math.random() < 0.3) {
                // Sometimes shoot toward player general area
                bulletDx = player.x > this.x ? 0.5 : -0.5;
                bulletDy = player.y > this.y ? 0.5 : -0.5;
            } else {
                // Random direction
                const angle = Math.random() * Math.PI * 2;
                bulletDx = Math.cos(angle);
                bulletDy = Math.sin(angle);
            }
        }
        
        return new Bullet(
            this.x + this.width / 2,
            this.y + this.height / 2,
            bulletDx,
            bulletDy,
            'enemy'
        );
    }
    
    takeDamage() {
        this.health--;
        if (this.health <= 0) {
            this.destroyed = true;
        }
    }
    
    getScore() {
        switch (this.type) {
            case 'basic': return 100;
            case 'smart': return 200;
            case 'fast': return 150;
            case 'heavy': return 300;
            default: return 100;
        }
    }
    
    draw(ctx) {
        if (this.destroyed) return;
        
        // Draw tank body
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw health indicator for heavy tanks
        if (this.type === 'heavy' && this.health > 1) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(this.x + 1, this.y - 2, this.width - 2, 1);
        }
        
        // Draw simple turret indicator
        ctx.fillStyle = this.color;
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        ctx.fillRect(centerX - 1, centerY - 1, 2, 2);
    }
}
