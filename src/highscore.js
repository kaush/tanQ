// High Score Management System
class HighScoreManager {
    constructor() {
        this.highScores = [];
        this.currentPlayer = '';
        this.maxScores = 10; // Maximum number of high scores to track
        this.cookieName = 'tanQHighScores';
        this.cookieExpiry = 365; // Days
        
        // Load high scores from cookies
        this.loadHighScores();
    }
    
    // Set current player name
    setCurrentPlayer(name) {
        this.currentPlayer = name;
    }
    
    // Get current player name
    getCurrentPlayer() {
        return this.currentPlayer;
    }
    
    // Get all player names
    getPlayerNames() {
        const names = new Set();
        this.highScores.forEach(score => {
            names.add(score.name);
        });
        return Array.from(names).sort();
    }
    
    // Load high scores from cookies
    loadHighScores() {
        try {
            const cookie = this.getCookie(this.cookieName);
            if (cookie) {
                this.highScores = JSON.parse(cookie);
                console.log('High scores loaded:', this.highScores);
            } else {
                this.highScores = [];
                console.log('No high scores found in cookies');
            }
        } catch (error) {
            console.error('Error loading high scores:', error);
            this.highScores = [];
        }
    }
    
    // Save high scores to cookies
    saveHighScores() {
        try {
            const highScoresJSON = JSON.stringify(this.highScores);
            this.setCookie(this.cookieName, highScoresJSON, this.cookieExpiry);
            console.log('High scores saved to cookies');
        } catch (error) {
            console.error('Error saving high scores:', error);
        }
    }
    
    // Add a new score
    addScore(score) {
        const date = new Date();
        const dateString = date.toLocaleDateString();
        
        const newScore = {
            name: this.currentPlayer,
            score: score,
            date: dateString,
            timestamp: date.getTime()
        };
        
        // Check if this is a new high score for the player
        const playerBestBefore = this.getPlayerBestScore(this.currentPlayer);
        const isNewPersonalBest = score > playerBestBefore;
        
        // Add the new score
        this.highScores.push(newScore);
        
        // Sort by score (descending)
        this.highScores.sort((a, b) => b.score - a.score);
        
        // Keep only the top scores
        if (this.highScores.length > this.maxScores) {
            this.highScores = this.highScores.slice(0, this.maxScores);
        }
        
        // Check if the score made it to the leaderboard
        const position = this.getScorePosition(newScore);
        const madeLeaderboard = position !== -1;
        
        // Save to cookies
        this.saveHighScores();
        
        return {
            isNewPersonalBest: isNewPersonalBest,
            madeLeaderboard: madeLeaderboard,
            position: position,
            previousBest: playerBestBefore
        };
    }
    
    // Get the position of a score in the high scores list
    getScorePosition(scoreObj) {
        for (let i = 0; i < this.highScores.length; i++) {
            if (this.highScores[i].score === scoreObj.score && 
                this.highScores[i].name === scoreObj.name &&
                this.highScores[i].timestamp === scoreObj.timestamp) {
                return i + 1; // 1-based position
            }
        }
        return -1; // Not found
    }
    
    // Get all high scores
    getHighScores() {
        return this.highScores;
    }
    
    // Get player's best score
    getPlayerBestScore(playerName) {
        const playerScores = this.highScores.filter(score => score.name === playerName);
        if (playerScores.length === 0) {
            return 0;
        }
        
        // Return the highest score
        return Math.max(...playerScores.map(score => score.score));
    }
    
    // Helper: Set a cookie
    setCookie(name, value, days) {
        let expires = '';
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = '; expires=' + date.toUTCString();
        }
        document.cookie = name + '=' + (value || '') + expires + '; path=/';
    }
    
    // Helper: Get a cookie
    getCookie(name) {
        const nameEQ = name + '=';
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }
    
    // Helper: Delete a cookie
    eraseCookie(name) {
        document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
    
    // Clear all high scores (for testing)
    clearHighScores() {
        this.highScores = [];
        this.eraseCookie(this.cookieName);
        console.log('High scores cleared');
    }
}

// Global high score manager instance
window.highScoreManager = new HighScoreManager();
