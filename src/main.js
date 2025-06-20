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
        this.gameState = 'playerSelect'; // playerSelect, title, playing, gameOver, leaderboard
        this.game = new Game(this.gameWidth, this.gameHeight);
        
        // Player name input
        this.playerName = '';
        this.selectedNameIndex = 0;
        this.existingNames = [];
        this.showNameInput = true;
        this.nameInputActive = true;
        this.cursorVisible = true;
        this.cursorBlinkTimer = 0;
        
        // High score tracking
        this.scoreResult = null;
        this.showLeaderboard = false;
        
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
            
            // Handle player selection screen
            if (this.gameState === 'playerSelect') {
                this.handlePlayerSelectInput(e);
                return;
            }
            
            // Start game on SPACE key from title screen
            if (this.gameState === 'title' && e.code === 'Space') {
                this.handleGameStart();
            }
            
            // Handle game over screen
            if (this.gameState === 'gameOver') {
                if (e.code === 'Space') {
                    this.gameState = 'leaderboard';
                } else if (e.code === 'KeyR') {
                    this.restartGame();
                }
            }
            
            // Handle leaderboard screen
            if (this.gameState === 'leaderboard') {
                if (e.code === 'Space' || e.code === 'Enter') {
                    this.gameState = 'playerSelect';
                    this.existingNames = window.highScoreManager.getPlayerNames();
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
        
        // Update cursor blink timer
        this.cursorBlinkTimer += deltaTime;
        if (this.cursorBlinkTimer > 500) {
            this.cursorVisible = !this.cursorVisible;
            this.cursorBlinkTimer = 0;
        }
        
        // Clear canvas
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Scale context for retro resolution
        this.ctx.save();
        this.ctx.scale(this.scale, this.scale);
        
        switch (this.gameState) {
            case 'playerSelect':
                this.drawPlayerSelect();
                break;
            case 'title':
                this.drawTitleScreen();
                break;
            case 'playing':
                this.game.update(deltaTime, this.keys);
                this.game.draw(this.ctx);
                
                if (this.game.isGameOver()) {
                    this.handleGameOver();
                }
                break;
            case 'gameOver':
                this.drawGameOverScreen();
                break;
            case 'leaderboard':
                this.drawLeaderboard();
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
        
        this.ctx.fillText('GAME OVER', this.gameWidth / 2, 60);
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillText(`FINAL SCORE: ${this.game.score}`, this.gameWidth / 2, 80);
        this.ctx.fillText(`WAVE REACHED: ${this.game.wave}`, this.gameWidth / 2, 95);
        
        // Show score achievement
        if (this.scoreResult) {
            if (this.scoreResult.isNewPersonalBest) {
                this.ctx.fillStyle = '#00FF00';
                this.ctx.fillText('NEW PERSONAL BEST!', this.gameWidth / 2, 115);
            }
            if (this.scoreResult.madeLeaderboard) {
                this.ctx.fillStyle = '#FFFF00';
                this.ctx.fillText(`RANK #${this.scoreResult.position}!`, this.gameWidth / 2, 130);
            }
        }
        
        // Instructions
        this.ctx.fillStyle = '#AAAAAA';
        this.ctx.font = '6px monospace';
        this.ctx.fillText('SPACE: VIEW LEADERBOARD', this.gameWidth / 2, 155);
        this.ctx.fillText('R: PLAY AGAIN', this.gameWidth / 2, 165);
    }
    
    // Handle player selection input
    handlePlayerSelectInput(e) {
        if (this.nameInputActive) {
            // Handle typing new name
            if (e.code === 'Enter') {
                if (this.playerName.trim().length > 0) {
                    this.confirmPlayerName();
                }
            } else if (e.code === 'Backspace') {
                this.playerName = this.playerName.slice(0, -1);
            } else if (e.code === 'ArrowUp') {
                this.nameInputActive = false;
                this.selectedNameIndex = Math.max(0, this.existingNames.length - 1);
            } else if (e.code === 'ArrowDown') {
                this.nameInputActive = false;
                this.selectedNameIndex = 0;
            } else if (e.key && e.key.length === 1 && /[a-zA-Z0-9 ]/.test(e.key)) {
                if (this.playerName.length < 12) {
                    this.playerName += e.key.toUpperCase();
                }
            }
        } else {
            // Handle selecting existing name
            if (e.code === 'ArrowUp') {
                this.selectedNameIndex = Math.max(0, this.selectedNameIndex - 1);
            } else if (e.code === 'ArrowDown') {
                if (this.selectedNameIndex < this.existingNames.length - 1) {
                    this.selectedNameIndex++;
                } else {
                    this.nameInputActive = true;
                }
            } else if (e.code === 'Enter') {
                if (this.existingNames.length > 0) {
                    this.playerName = this.existingNames[this.selectedNameIndex];
                    this.confirmPlayerName();
                }
            }
        }
    }
    
    // Confirm player name and proceed to title screen
    confirmPlayerName() {
        if (this.playerName.trim().length > 0) {
            window.highScoreManager.setCurrentPlayer(this.playerName.trim());
            this.gameState = 'title';
        }
    }
    
    // Handle game over
    handleGameOver() {
        const finalScore = this.game.getScore();
        this.scoreResult = window.highScoreManager.addScore(finalScore);
        this.gameState = 'gameOver';
    }
    
    // Restart the game
    restartGame() {
        this.game.restart();
        this.gameState = 'playing';
        
        // Try to handle audio if available
        if (typeof window.audioSystem !== 'undefined') {
            window.audioSystem.stopBackgroundMusic();
            window.audioSystem.startBackgroundMusic();
        }
    }
    
    // Draw player selection screen
    drawPlayerSelect() {
        // Load existing names
        this.existingNames = window.highScoreManager.getPlayerNames();
        
        this.ctx.fillStyle = '#00FF00';
        this.ctx.font = '8px monospace';
        this.ctx.textAlign = 'center';
        
        // Title
        this.ctx.fillStyle = '#FFFF00';
        this.ctx.fillText('ENTER PLAYER NAME', this.gameWidth / 2, 30);
        
        // Existing players
        if (this.existingNames.length > 0) {
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.fillText('SELECT EXISTING PLAYER:', this.gameWidth / 2, 50);
            
            for (let i = 0; i < Math.min(this.existingNames.length, 5); i++) {
                const y = 65 + i * 12;
                if (!this.nameInputActive && i === this.selectedNameIndex) {
                    this.ctx.fillStyle = '#00FF00';
                    this.ctx.fillText('> ' + this.existingNames[i] + ' <', this.gameWidth / 2, y);
                } else {
                    this.ctx.fillStyle = '#AAAAAA';
                    this.ctx.fillText(this.existingNames[i], this.gameWidth / 2, y);
                }
            }
        }
        
        // New name input
        const inputY = this.existingNames.length > 0 ? 65 + Math.min(this.existingNames.length, 5) * 12 + 20 : 60;
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillText('OR ENTER NEW NAME:', this.gameWidth / 2, inputY);
        
        // Name input field
        const nameY = inputY + 15;
        if (this.nameInputActive) {
            this.ctx.fillStyle = '#00FF00';
            const displayName = this.playerName + (this.cursorVisible ? '_' : ' ');
            this.ctx.fillText('> ' + displayName + ' <', this.gameWidth / 2, nameY);
        } else {
            this.ctx.fillStyle = '#AAAAAA';
            this.ctx.fillText(this.playerName || '(ENTER NAME)', this.gameWidth / 2, nameY);
        }
        
        // Instructions
        this.ctx.fillStyle = '#888888';
        this.ctx.font = '6px monospace';
        this.ctx.fillText('ARROWS: SELECT  ENTER: CONFIRM', this.gameWidth / 2, this.gameHeight - 20);
    }
    
    // Draw leaderboard
    drawLeaderboard() {
        this.ctx.fillStyle = '#FFFF00';
        this.ctx.font = '8px monospace';
        this.ctx.textAlign = 'center';
        
        // Title
        this.ctx.fillText('HIGH SCORES', this.gameWidth / 2, 20);
        
        // Check if player made a new record
        if (this.scoreResult) {
            if (this.scoreResult.isNewPersonalBest) {
                this.ctx.fillStyle = '#00FF00';
                this.ctx.fillText('NEW PERSONAL BEST!', this.gameWidth / 2, 35);
            }
            if (this.scoreResult.madeLeaderboard) {
                this.ctx.fillStyle = '#FFFF00';
                this.ctx.fillText(`#${this.scoreResult.position} ON LEADERBOARD!`, this.gameWidth / 2, 45);
            }
        }
        
        // High scores list
        const scores = window.highScoreManager.getHighScores();
        const startY = this.scoreResult ? 60 : 40;
        
        // Header
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '7px monospace';
        this.ctx.fillText('RANK    NAME         SCORE', this.gameWidth / 2, startY);
        
        // Draw separator line
        this.ctx.fillStyle = '#888888';
        this.ctx.fillRect(20, startY + 3, this.gameWidth - 40, 1);
        
        // Display top 10 scores
        for (let i = 0; i < Math.min(scores.length, 10); i++) {
            const score = scores[i];
            const y = startY + 18 + i * 12;
            
            // Highlight current player's scores
            const isCurrentPlayer = score.name === window.highScoreManager.getCurrentPlayer();
            const isNewScore = this.scoreResult && 
                              score.score === this.game.getScore() && 
                              isCurrentPlayer &&
                              Math.abs(score.timestamp - Date.now()) < 5000; // Recent score
            
            if (isNewScore) {
                this.ctx.fillStyle = '#00FF00'; // Highlight new score in bright green
            } else if (isCurrentPlayer) {
                this.ctx.fillStyle = '#FFFF00'; // Highlight player's other scores in yellow
            } else {
                this.ctx.fillStyle = '#FFFFFF'; // Regular scores in white
            }
            
            // Format the display
            const rank = `${i + 1}.`.padEnd(3, ' ');
            const name = score.name.substring(0, 10).padEnd(10, ' ');
            const scoreStr = score.score.toString().padStart(8, ' ');
            
            this.ctx.textAlign = 'left';
            this.ctx.fillText(`${rank}  ${name}  ${scoreStr}`, 25, y);
        }
        
        // Show message if no scores yet
        if (scores.length === 0) {
            this.ctx.fillStyle = '#888888';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('NO SCORES YET', this.gameWidth / 2, startY + 30);
            this.ctx.fillText('BE THE FIRST!', this.gameWidth / 2, startY + 45);
        }
        
        // Instructions
        this.ctx.fillStyle = '#888888';
        this.ctx.font = '6px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('SPACE: PLAY AGAIN', this.gameWidth / 2, this.gameHeight - 10);
    }
}

// Start the game when page loads
window.addEventListener('load', () => {
    new TankDestroyer();
});
