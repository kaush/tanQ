// Main game initialization and loop
class TankDestroyer {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Scale factor for retro look (3x scale)
        this.scale = 3;
        this.gameWidth = 160;
        this.gameHeight = 192;
        
        // Set canvas size
        this.canvas.width = this.gameWidth * this.scale;
        this.canvas.height = this.gameHeight * this.scale;
        
        // Disable image smoothing for pixel-perfect rendering
        this.ctx.imageSmoothingEnabled = false;
        
        // Game state
        this.gameState = 'title'; // title, playing, gameOver
        this.game = new Game(this.gameWidth, this.gameHeight);
        
        // Input handling
        this.keys = {};
        this.setupInput();
        
        // Add click handler for canvas
        this.canvas.addEventListener('click', () => this.handleGameStart());
        
        // Start game loop
        this.lastTime = 0;
        this.gameLoop = this.gameLoop.bind(this);
        requestAnimationFrame(this.gameLoop);
    }
    
    // Safe method to handle audio system
    initAudio() {
        // Check if audioSystem exists
        if (typeof window.audioSystem !== 'undefined') {
            console.log('Initializing audio from game...');
            if (!window.audioSystem.isInitialized) {
                window.audioSystem.init();
            }
            window.audioSystem.resume();
            
            // Force a user interaction with audio context
            const unlockAudio = () => {
                console.log('Unlocking audio...');
                // Create and play a silent buffer to unlock audio
                if (window.audioSystem.audioContext) {
                    const buffer = window.audioSystem.audioContext.createBuffer(1, 1, 22050);
                    const source = window.audioSystem.audioContext.createBufferSource();
                    source.buffer = buffer;
                    source.connect(window.audioSystem.audioContext.destination);
                    source.start(0);
                    console.log('Audio unlocked');
                }
                
                // Remove the event listeners
                document.removeEventListener('click', unlockAudio);
                document.removeEventListener('keydown', unlockAudio);
            };
            
            // Add event listeners to unlock audio
            document.addEventListener('click', unlockAudio);
            document.addEventListener('keydown', unlockAudio);
            
            return true;
        }
        return false;
    }
    
    // Handle game start (from click or key)
    handleGameStart() {
        if (this.gameState === 'title') {
            this.gameState = 'playing';
            this.game.start();
            
            // Try to play audio if available
            if (this.initAudio()) {
                window.audioSystem.playStartupMelody();
                // Start background music after startup melody
                setTimeout(() => {
                    if (typeof window.audioSystem !== 'undefined') {
                        window.audioSystem.startBackgroundMusic();
                    }
                }, 3000);
            }
        }
    }
    
    setupInput() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            // Try to initialize audio
            this.initAudio();
            
            // Start game on SPACE key from title screen
            if (this.gameState === 'title' && e.code === 'Space') {
                this.handleGameStart();
            }
            
            // Restart game on space from game over screen
            if (this.gameState === 'gameOver' && e.code === 'Space') {
                this.gameState = 'playing';
                this.game.restart();
                
                // Try to handle audio if available
                if (typeof window.audioSystem !== 'undefined') {
                    window.audioSystem.stopBackgroundMusic();
                    window.audioSystem.startBackgroundMusic();
                }
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }
    
    gameLoop(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Clear canvas
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Scale context for retro resolution
        this.ctx.save();
        this.ctx.scale(this.scale, this.scale);
        
        switch (this.gameState) {
            case 'title':
                this.drawTitleScreen();
                break;
            case 'playing':
                this.game.update(deltaTime, this.keys);
                this.game.draw(this.ctx);
                
                if (this.game.isGameOver()) {
                    this.gameState = 'gameOver';
                }
                break;
            case 'gameOver':
                this.drawGameOverScreen();
                break;
        }
        
        this.ctx.restore();
        requestAnimationFrame(this.gameLoop);
    }
    
    drawTitleScreen() {
        this.ctx.fillStyle = '#00FF00';
        this.ctx.font = '8px monospace';
        this.ctx.textAlign = 'center';
        
        // Company logo
        this.ctx.fillStyle = '#FFFF00';
        this.ctx.fillText('ARIN ARCADE PRESENTS', this.gameWidth / 2, 40);
        
        // Game title
        this.ctx.fillStyle = '#00FF00';
        this.ctx.font = '12px monospace';
        this.ctx.fillText('tanQ', this.gameWidth / 2, 70);
        
        this.ctx.font = '8px monospace';
        this.ctx.fillStyle = '#FF8800';
        this.ctx.fillText('RETRO TANK DESTROYER', this.gameWidth / 2, 85);
        
        // Instructions
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillText('PRESS SPACE TO START', this.gameWidth / 2, 120);
        this.ctx.fillStyle = '#AAAAAA';
        this.ctx.fillText('OR CLICK ANYWHERE', this.gameWidth / 2, 135);
        
        // Simple blinking effect
        if (Math.floor(Date.now() / 500) % 2) {
            this.ctx.fillStyle = '#888888';
            this.ctx.fillText('© 2025 ARIN ARCADE', this.gameWidth / 2, 160);
        }
    }
    
    drawGameOverScreen() {
        this.ctx.fillStyle = '#FF0000';
        this.ctx.font = '8px monospace';
        this.ctx.textAlign = 'center';
        
        this.ctx.fillText('GAME OVER', this.gameWidth / 2, 80);
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillText(`SCORE: ${this.game.score}`, this.gameWidth / 2, 100);
        this.ctx.fillText(`WAVE: ${this.game.wave}`, this.gameWidth / 2, 120);
        this.ctx.fillText('PRESS SPACE TO RESTART', this.gameWidth / 2, 140);
    }
}

// Start the game when page loads
window.addEventListener('load', () => {
    new TankDestroyer();
});
