// Player tank class
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 8;
        this.height = 8;
        this.speed = 50; // pixels per second
        this.direction = 0; // 0 = up, 1 = right, 2 = down, 3 = left
        this.turretDirection = 0;
        this.destroyed = false;
        this.canShoot = true;
        this.shootCooldown = 0;
    }
    
    update(deltaTime, keys, gameWidth, gameHeight) {
        if (this.destroyed) return;
        
        // Handle shooting cooldown
        if (this.shootCooldown > 0) {
            this.shootCooldown -= deltaTime;
            if (this.shootCooldown <= 0) {
                this.canShoot = true;
            }
        }
        
        // Movement
        let dx = 0;
        let dy = 0;
        let isMoving = false;
        
        if (keys['KeyW'] || keys['ArrowUp']) {
            dy = -1;
            this.direction = 0;
            isMoving = true;
        }
        if (keys['KeyS'] || keys['ArrowDown']) {
            dy = 1;
            this.direction = 2;
            isMoving = true;
        }
        if (keys['KeyA'] || keys['ArrowLeft']) {
            dx = -1;
            this.direction = 3;
            isMoving = true;
        }
        if (keys['KeyD'] || keys['ArrowRight']) {
            dx = 1;
            this.direction = 1;
            isMoving = true;
        }
        
        // Play movement sound (throttled)
        if (isMoving && (!this.lastMoveSound || Date.now() - this.lastMoveSound > 200)) {
            audioSystem.playPlayerMove();
            this.lastMoveSound = Date.now();
        }
        
        // Diagonal movement
        if (dx !== 0 && dy !== 0) {
            dx *= 0.707; // Normalize diagonal movement
            dy *= 0.707;
        }
        
        // Apply movement
        const moveSpeed = this.speed * (deltaTime / 1000);
        this.x += dx * moveSpeed;
        this.y += dy * moveSpeed;
        
        // Keep player in bounds
        this.x = Math.max(0, Math.min(gameWidth - this.width, this.x));
        this.y = Math.max(0, Math.min(gameHeight - this.height, this.y));
        
        // Turret rotation
        if (keys['KeyQ']) {
            this.turretDirection = (this.turretDirection + 3) % 4; // Counter-clockwise
        }
        if (keys['KeyE']) {
            this.turretDirection = (this.turretDirection + 1) % 4; // Clockwise
        }
    }
    
    shoot() {
        if (!this.canShoot) return null;
        
        this.canShoot = false;
        this.shootCooldown = 300; // 300ms cooldown
        
        // Play shooting sound
        audioSystem.playShoot(true);
        
        // Calculate bullet starting position based on turret direction
        let bulletX = this.x + this.width / 2;
        let bulletY = this.y + this.height / 2;
        let bulletDx = 0;
        let bulletDy = 0;
        
        switch (this.turretDirection) {
            case 0: // Up
                bulletY -= this.height / 2;
                bulletDy = -1;
                break;
            case 1: // Right
                bulletX += this.width / 2;
                bulletDx = 1;
                break;
            case 2: // Down
                bulletY += this.height / 2;
                bulletDy = 1;
                break;
            case 3: // Left
                bulletX -= this.width / 2;
                bulletDx = -1;
                break;
        }
        
        return new Bullet(bulletX, bulletY, bulletDx, bulletDy, 'player');
    }
    
    draw(ctx) {
        if (this.destroyed) return;
        
        // Draw tank body
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw turret (simple line indicating direction)
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 1;
        ctx.beginPath();
        
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        let endX = centerX;
        let endY = centerY;
        
        switch (this.turretDirection) {
            case 0: // Up
                endY -= 6;
                break;
            case 1: // Right
                endX += 6;
                break;
            case 2: // Down
                endY += 6;
                break;
            case 3: // Left
                endX -= 6;
                break;
        }
        
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
    }
}

// Bullet class
class Bullet {
    constructor(x, y, dx, dy, owner) {
        this.x = x;
        this.y = y;
        this.width = 2;
        this.height = 2;
        this.dx = dx;
        this.dy = dy;
        this.speed = 100; // pixels per second
        this.owner = owner; // 'player' or 'enemy'
    }
    
    update(deltaTime) {
        const moveSpeed = this.speed * (deltaTime / 1000);
        this.x += this.dx * moveSpeed;
        this.y += this.dy * moveSpeed;
    }
    
    draw(ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(this.x - 1, this.y - 1, this.width, this.height);
    }
}
