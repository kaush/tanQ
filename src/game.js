// Main game logic and state management
class Game {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        
        // Game state
        this.score = 0;
        this.lives = 3;
        this.maxLives = 5; // Maximum lives allowed
        this.wave = 1;
        this.gameOver = false;
        this.gameOverSoundPlayed = false;
        
        // Game objects
        this.player = null;
        this.enemies = [];
        this.playerBullets = [];
        this.enemyBullets = [];
        this.obstacles = [];
        this.powerUpManager = new PowerUpManager(width, height);
        
        // Wave management
        this.enemiesRemaining = 0;
        this.waveStartDelay = 0;
        
        // Timing
        this.enemySpawnTimer = 0;
        this.enemyFireTimer = 0;
    }
    
    start() {
        this.restart();
    }
    
    restart() {
        // Reset game state
        this.score = 0;
        this.lives = 3;
        this.wave = 1;
        this.gameOver = false;
        this.gameOverSoundPlayed = false;
        
        // Clear arrays
        this.enemies = [];
        this.playerBullets = [];
        this.enemyBullets = [];
        this.obstacles = [];
        
        // Clear power-ups
        this.powerUpManager.clear();
        
        // Create player
        this.player = new Player(this.width / 2, this.height - 20);
        
        // Create obstacles
        this.createObstacles();
        
        // Start first wave
        this.startWave();
    }
    
    createObstacles() {
        // Create some static obstacles
        const obstaclePositions = [
            {x: 40, y: 60}, {x: 120, y: 60},
            {x: 20, y: 120}, {x: 80, y: 100}, {x: 140, y: 120},
            {x: 60, y: 140}
        ];
        
        obstaclePositions.forEach(pos => {
            this.obstacles.push({
                x: pos.x,
                y: pos.y,
                width: 16,
                height: 16
            });
        });
    }
    
    startWave() {
        this.waveStartDelay = 1000; // 1 second delay
        
        // Determine enemy count and types based on wave
        let basicTanks = Math.min(2 + Math.floor(this.wave / 2), 4); // 2-4 basic tanks
        let smartTanks = Math.max(0, this.wave - 2); // Smart tanks from wave 3
        let fastTanks = Math.max(0, Math.floor((this.wave - 1) / 3)); // Fast tanks from wave 4
        
        // Cap total enemies at 8 to fit spawn positions (we have 8 spawn positions)
        const totalEnemies = basicTanks + smartTanks + fastTanks;
        if (totalEnemies > 8) {
            // Reduce basic tanks if we have too many
            basicTanks = Math.max(1, 8 - smartTanks - fastTanks);
        }
        
        // Debug: Log wave info
        console.log(`Starting Wave ${this.wave}: ${basicTanks} basic, ${smartTanks} smart, ${fastTanks} fast (Total calculated: ${basicTanks + smartTanks + fastTanks})`);
        console.log(`Wave ${this.wave} calculation: basicTanks=${basicTanks}, smartTanks=${smartTanks}, fastTanks=${fastTanks}, total=${totalEnemies}`);
        
        // Spawn enemies with delay (enemiesRemaining will be set in spawnEnemies)
        this.spawnEnemies(basicTanks, smartTanks, fastTanks);
    }
    
    spawnEnemies(basic, smart, fast) {
        const spawnPositions = [
            {x: 20, y: 20}, {x: 60, y: 20}, {x: 100, y: 20}, {x: 140, y: 20},
            {x: 20, y: 40}, {x: 140, y: 40},
            {x: 40, y: 60}, {x: 120, y: 60}
        ];
        
        let spawnIndex = 0;
        const totalEnemies = basic + smart + fast;
        
        // Clear existing enemies
        this.enemies = [];
        
        // Spawn basic tanks
        for (let i = 0; i < basic && spawnIndex < spawnPositions.length; i++) {
            const pos = spawnPositions[spawnIndex++];
            this.enemies.push(new Enemy(pos.x, pos.y, 'basic'));
        }
        
        // Spawn smart tanks
        for (let i = 0; i < smart && spawnIndex < spawnPositions.length; i++) {
            const pos = spawnPositions[spawnIndex++];
            this.enemies.push(new Enemy(pos.x, pos.y, 'smart'));
        }
        
        // Spawn fast tanks
        for (let i = 0; i < fast && spawnIndex < spawnPositions.length; i++) {
            const pos = spawnPositions[spawnIndex++];
            this.enemies.push(new Enemy(pos.x, pos.y, 'fast'));
        }
        
        // IMPORTANT: Update enemiesRemaining to match actual spawned enemies
        this.enemiesRemaining = this.enemies.length;
        
        // Debug: Log spawning info
        console.log(`Wave ${this.wave}: Spawned ${this.enemies.length} enemies (${basic} basic, ${smart} smart, ${fast} fast)`);
        console.log(`Expected: ${basic + smart + fast}, Actually spawned: ${this.enemies.length}, enemiesRemaining: ${this.enemiesRemaining}`);
    }
    
    update(deltaTime, keys) {
        if (this.gameOver) return;
        
        // Handle wave start delay
        if (this.waveStartDelay > 0) {
            this.waveStartDelay -= deltaTime;
            return;
        }
        
        // Update player
        if (this.player && !this.player.destroyed) {
            this.player.update(deltaTime, keys, this.width, this.height);
            
            // Player shooting
            if (keys['Space'] && this.playerBullets.length === 0) {
                const bullet = this.player.shoot();
                if (bullet) {
                    this.playerBullets.push(bullet);
                }
            }
        }
        
        // Update enemies
        this.enemies.forEach(enemy => {
            enemy.update(deltaTime, this.player, this.width, this.height);
        });
        
        // Enemy shooting
        this.enemyFireTimer += deltaTime;
        if (this.enemyFireTimer > 1000 + Math.random() * 2000) { // Random fire rate
            this.enemyFireTimer = 0;
            const shootingEnemy = this.enemies[Math.floor(Math.random() * this.enemies.length)];
            if (shootingEnemy && this.enemyBullets.length < 3) {
                const bullet = shootingEnemy.shoot(this.player);
                if (bullet) {
                    this.enemyBullets.push(bullet);
                }
            }
        }
        
        // Update bullets
        this.updateBullets(deltaTime);
        
        // Check collisions
        this.checkCollisions();
        
        // Update power-ups
        this.powerUpManager.update(deltaTime);
        
        // Check power-up collisions
        if (this.player && !this.player.destroyed) {
            const collectedPowerUps = this.powerUpManager.checkCollisions(this.player);
            collectedPowerUps.forEach(type => {
                if (type === 'heart' && this.lives < this.maxLives) {
                    this.lives++;
                    console.log('Life gained! Lives:', this.lives);
                    
                    // Play power-up sound
                    if (typeof window.audioSystem !== 'undefined') {
                        window.audioSystem.playPowerUp();
                    }
                }
            });
        }
        
        // Bullets vs obstacles
        this.checkBulletObstacleCollisions();
        
        // Check wave completion
        console.log(`Wave ${this.wave}: enemies.length = ${this.enemies.length}, enemiesRemaining = ${this.enemiesRemaining}`);
        if (this.enemies.length === 0 && this.enemiesRemaining <= 0) {
            console.log(`Wave ${this.wave} completed! Starting wave ${this.wave + 1}`);
            this.score += 500; // Wave completion bonus
            this.wave++;
            
            // Play wave completion sound
            if (typeof window.audioSystem !== 'undefined') {
                window.audioSystem.playWaveComplete();
            }
            
            this.startWave();
        }
        
        // Check game over
        if (this.lives <= 0 && !this.gameOverSoundPlayed) {
            this.gameOver = true;
            
            // Play game over sound
            if (typeof window.audioSystem !== 'undefined') {
                window.audioSystem.playGameOver();
                window.audioSystem.stopBackgroundMusic();
            }
            
            this.gameOverSoundPlayed = true;
        }
    }
    
    updateBullets(deltaTime) {
        // Update player bullets
        this.playerBullets = this.playerBullets.filter(bullet => {
            bullet.update(deltaTime);
            return bullet.x >= 0 && bullet.x <= this.width && 
                   bullet.y >= 0 && bullet.y <= this.height;
        });
        
        // Update enemy bullets
        this.enemyBullets = this.enemyBullets.filter(bullet => {
            bullet.update(deltaTime);
            return bullet.x >= 0 && bullet.x <= this.width && 
                   bullet.y >= 0 && bullet.y <= this.height;
        });
    }
    
    checkCollisions() {
        // Player bullets vs enemies
        this.playerBullets.forEach((bullet, bulletIndex) => {
            this.enemies.forEach((enemy, enemyIndex) => {
                if (Collision.rectangles(bullet, enemy)) {
                    // Remove bullet
                    this.playerBullets.splice(bulletIndex, 1);
                    
                    // Damage enemy
                    enemy.takeDamage();
                    if (enemy.destroyed) {
                        this.score += enemy.getScore();
                        this.enemies.splice(enemyIndex, 1);
                        this.enemiesRemaining--; // Decrement remaining enemies counter
                        console.log(`Enemy destroyed! Remaining: ${this.enemiesRemaining}, Active enemies: ${this.enemies.length}`);
                        
                        // Play enemy destruction sound
                        if (typeof window.audioSystem !== 'undefined') {
                            window.audioSystem.playEnemyDestroyed(enemy.type);
                        }
                    }
                }
            });
        });
        
        // Enemy bullets vs player
        this.enemyBullets.forEach((bullet, bulletIndex) => {
            if (this.player && Collision.rectangles(bullet, this.player)) {
                this.enemyBullets.splice(bulletIndex, 1);
                this.lives--;
                
                // Play player hit sound
                if (typeof window.audioSystem !== 'undefined') {
                    window.audioSystem.playPlayerDestroyed();
                }
                
                // Reset player position
                this.player.x = this.width / 2;
                this.player.y = this.height - 20;
            }
        });
    }
    
    checkBulletObstacleCollisions() {
        // Player bullets vs obstacles
        this.playerBullets = this.playerBullets.filter(bullet => {
            return !this.obstacles.some(obstacle => 
                Collision.rectangles(bullet, obstacle)
            );
        });
        
        // Enemy bullets vs obstacles
        this.enemyBullets = this.enemyBullets.filter(bullet => {
            return !this.obstacles.some(obstacle => 
                Collision.rectangles(bullet, obstacle)
            );
        });
    }
    
    draw(ctx) {
        // Draw obstacles
        ctx.fillStyle = '#8B4513';
        this.obstacles.forEach(obstacle => {
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        });
        
        // Draw player
        if (this.player && !this.player.destroyed) {
            this.player.draw(ctx);
        }
        
        // Draw enemies
        this.enemies.forEach(enemy => {
            enemy.draw(ctx);
        });
        
        // Draw bullets
        ctx.fillStyle = '#FFFFFF';
        this.playerBullets.forEach(bullet => {
            bullet.draw(ctx);
        });
        
        this.enemyBullets.forEach(bullet => {
            bullet.draw(ctx);
        });
        
        // Draw power-ups
        this.powerUpManager.draw(ctx);
        
        // Show wave start message
        if (this.waveStartDelay > 0) {
            ctx.fillStyle = '#FFFF00';
            ctx.font = '12px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`WAVE ${this.wave}`, this.width / 2, this.height / 2);
            ctx.font = '8px monospace';
            ctx.fillText('GET READY!', this.width / 2, this.height / 2 + 20);
        }
        
        // Draw HUD
        this.drawHUD(ctx);
    }
    
    drawHUD(ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '8px monospace';
        ctx.textAlign = 'left';
        
        // Score
        ctx.fillText(`SCORE: ${this.score}`, 5, 10);
        
        // Lives
        ctx.textAlign = 'right';
        ctx.fillText(`LIVES: ${this.lives}`, this.width - 5, 10);
        
        // Wave
        ctx.textAlign = 'center';
        ctx.fillText(`WAVE: ${this.wave}`, this.width / 2, 10);
    }
    
    isGameOver() {
        return this.gameOver;
    }
    
    getScore() {
        return this.score;
    }
}
