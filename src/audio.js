// Retro 8-bit Audio System
class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.sounds = {};
        this.musicGain = null;
        this.sfxGain = null;
        this.isInitialized = false;
        
        // Volume settings
        this.masterVolume = 0.3;
        this.musicVolume = 0.2;
        this.sfxVolume = 0.4;
        
        // Debug flag
        this.debug = true;
    }
    
    async init() {
        if (this.isInitialized) return;
        
        try {
            console.log('Initializing audio system...');
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create gain nodes for volume control
            this.musicGain = this.audioContext.createGain();
            this.sfxGain = this.audioContext.createGain();
            
            this.musicGain.connect(this.audioContext.destination);
            this.sfxGain.connect(this.audioContext.destination);
            
            this.musicGain.gain.value = this.musicVolume * this.masterVolume;
            this.sfxGain.gain.value = this.sfxVolume * this.masterVolume;
            
            this.isInitialized = true;
            console.log('Audio system initialized successfully');
            
            // Play a test sound to verify audio is working
            this.playTestSound();
        } catch (error) {
            console.error('Audio initialization failed:', error);
        }
    }
    
    // Test sound to verify audio is working
    playTestSound() {
        try {
            console.log('Playing test sound...');
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5);
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.5);
            console.log('Test sound played');
        } catch (error) {
            console.error('Test sound failed:', error);
        }
    }
    
    // Generate square wave (classic 8-bit sound)
    createSquareWave(frequency, duration, volume = 0.1) {
        if (!this.audioContext) return null;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.sfxGain);
        
        return { oscillator, gainNode };
    }
    
    // Generate noise (for explosions)
    createNoise(duration, volume = 0.1) {
        if (!this.audioContext) return null;
        
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * volume;
        }
        
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        
        source.buffer = buffer;
        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
        
        source.connect(gainNode);
        gainNode.connect(this.sfxGain);
        
        return { source, gainNode };
    }
    
    // Play player movement sound
    playPlayerMove() {
        if (!this.audioContext) return;
        
        const sound = this.createSquareWave(220, 0.1, 0.05);
        if (sound) {
            sound.oscillator.start();
            sound.oscillator.stop(this.audioContext.currentTime + 0.1);
        }
    }
    
    // Play enemy movement sounds (different for each type)
    playEnemyMove(enemyType) {
        if (!this.audioContext) return;
        
        let frequency;
        switch (enemyType) {
            case 'basic':
                frequency = 150;
                break;
            case 'smart':
                frequency = 180;
                break;
            case 'fast':
                frequency = 200;
                break;
            case 'heavy':
                frequency = 120;
                break;
            default:
                frequency = 150;
        }
        
        const sound = this.createSquareWave(frequency, 0.08, 0.03);
        if (sound) {
            sound.oscillator.start();
            sound.oscillator.stop(this.audioContext.currentTime + 0.08);
        }
    }
    
    // Play shooting sound
    playShoot(isPlayer = true) {
        if (!this.audioContext) return;
        
        const frequency = isPlayer ? 440 : 330;
        const sound = this.createSquareWave(frequency, 0.15, 0.08);
        if (sound) {
            sound.oscillator.start();
            sound.oscillator.stop(this.audioContext.currentTime + 0.15);
        }
    }
    
    // Play enemy destruction sound
    playEnemyDestroyed(enemyType) {
        if (!this.audioContext) return;
        
        // Explosion noise
        const noise = this.createNoise(0.3, 0.1);
        if (noise) {
            noise.source.start();
        }
        
        // Pitched explosion sound
        setTimeout(() => {
            const sound = this.createSquareWave(100, 0.2, 0.06);
            if (sound) {
                sound.oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.2);
                sound.oscillator.start();
                sound.oscillator.stop(this.audioContext.currentTime + 0.2);
            }
        }, 50);
    }
    
    // Play player destruction sound
    playPlayerDestroyed() {
        if (!this.audioContext) return;
        
        // Dramatic descending sound
        const sound = this.createSquareWave(440, 1.0, 0.1);
        if (sound) {
            sound.oscillator.frequency.exponentialRampToValueAtTime(110, this.audioContext.currentTime + 1.0);
            sound.oscillator.start();
            sound.oscillator.stop(this.audioContext.currentTime + 1.0);
        }
    }
    
    // Play wave completion sound
    playWaveComplete() {
        if (!this.audioContext) return;
        
        // Victory fanfare
        const notes = [262, 330, 392, 523]; // C, E, G, C (major chord)
        notes.forEach((freq, index) => {
            setTimeout(() => {
                const sound = this.createSquareWave(freq, 0.4, 0.08);
                if (sound) {
                    sound.oscillator.start();
                    sound.oscillator.stop(this.audioContext.currentTime + 0.4);
                }
            }, index * 100);
        });
    }
    
    // Play game over sound
    playGameOver() {
        if (!this.audioContext) return;
        
        // Sad descending melody
        const notes = [523, 494, 440, 392, 349, 294]; // Descending notes
        notes.forEach((freq, index) => {
            setTimeout(() => {
                const sound = this.createSquareWave(freq, 0.6, 0.1);
                if (sound) {
                    sound.oscillator.start();
                    sound.oscillator.stop(this.audioContext.currentTime + 0.6);
                }
            }, index * 200);
        });
    }
    
    // Play startup melody
    playStartupMelody() {
        if (!this.audioContext) return;
        
        // Classic arcade startup melody
        const melody = [
            {freq: 262, duration: 0.3}, // C
            {freq: 330, duration: 0.3}, // E
            {freq: 392, duration: 0.3}, // G
            {freq: 523, duration: 0.6}, // C
            {freq: 392, duration: 0.3}, // G
            {freq: 523, duration: 0.9}  // C
        ];
        
        let time = 0;
        melody.forEach(note => {
            setTimeout(() => {
                const sound = this.createSquareWave(note.freq, note.duration, 0.1);
                if (sound) {
                    sound.oscillator.start();
                    sound.oscillator.stop(this.audioContext.currentTime + note.duration);
                }
            }, time * 1000);
            time += note.duration + 0.1; // Small gap between notes
        });
    }
    
    // Background music loop (soft retro melody)
    startBackgroundMusic() {
        if (!this.audioContext || this.backgroundMusic) return;
        
        this.playBackgroundLoop();
        this.backgroundMusic = setInterval(() => {
            this.playBackgroundLoop();
        }, 8000); // Loop every 8 seconds
    }
    
    playBackgroundLoop() {
        if (!this.audioContext) return;
        
        // Soft background melody
        const melody = [
            {freq: 220, duration: 0.5}, // A
            {freq: 247, duration: 0.5}, // B
            {freq: 262, duration: 0.5}, // C
            {freq: 294, duration: 0.5}, // D
            {freq: 262, duration: 0.5}, // C
            {freq: 247, duration: 0.5}, // B
            {freq: 220, duration: 1.0}, // A
        ];
        
        let time = 0;
        melody.forEach(note => {
            setTimeout(() => {
                const sound = this.createSquareWave(note.freq, note.duration, 0.02); // Very soft
                if (sound) {
                    sound.oscillator.start();
                    sound.oscillator.stop(this.audioContext.currentTime + note.duration);
                }
            }, time * 1000);
            time += note.duration + 0.1;
        });
    }
    
    stopBackgroundMusic() {
        if (this.backgroundMusic) {
            clearInterval(this.backgroundMusic);
            this.backgroundMusic = null;
        }
    }
    
    toggleSound() {
        if (this.masterVolume > 0) {
            // Turn off sound
            this.masterVolume = 0;
            this.musicGain.gain.value = 0;
            this.sfxGain.gain.value = 0;
            
            // Update button if it exists
            const soundToggle = document.getElementById('soundToggle');
            if (soundToggle) {
                soundToggle.textContent = 'SOUND: OFF';
                soundToggle.style.color = '#888888';
            }
            
            return false; // Sound is now off
        } else {
            // Turn on sound
            this.masterVolume = 0.3;
            this.musicGain.gain.value = this.musicVolume * this.masterVolume;
            this.sfxGain.gain.value = this.sfxVolume * this.masterVolume;
            
            // Update button if it exists
            const soundToggle = document.getElementById('soundToggle');
            if (soundToggle) {
                soundToggle.textContent = 'SOUND: ON';
                soundToggle.style.color = '#00FF00';
            }
            
            // Initialize audio if needed
            if (!this.isInitialized) {
                this.init();
            }
            this.resume();
            
            return true; // Sound is now on
        }
    }
}

// Global audio system instance
window.audioSystem = new AudioSystem();

// Setup sound toggle button
window.addEventListener('load', () => {
    const soundToggle = document.getElementById('soundToggle');
    if (soundToggle) {
        soundToggle.addEventListener('click', () => {
            window.audioSystem.toggleSound();
        });
    }
    
    // Add init audio button handler
    const initAudioButton = document.getElementById('initAudio');
    if (initAudioButton) {
        initAudioButton.addEventListener('click', () => {
            console.log('Manual audio initialization requested');
            if (!window.audioSystem.isInitialized) {
                window.audioSystem.init();
            }
            window.audioSystem.resume();
            window.audioSystem.playTestSound();
        });
    }
    
    // Add keyboard shortcut for sound toggle (M key)
    document.addEventListener('keydown', (e) => {
        if (e.code === 'KeyM') {
            window.audioSystem.toggleSound();
        }
    });
});
    // Resume audio context (required for modern browsers)
    resume() {
        if (!this.audioContext) {
            console.log('No audio context to resume');
            return;
        }
        
        if (this.audioContext.state === 'suspended') {
            console.log('Resuming suspended audio context...');
            this.audioContext.resume().then(() => {
                console.log('Audio context resumed successfully');
                // Play a test sound to verify audio is working
                this.playTestSound();
            }).catch(error => {
                console.error('Failed to resume audio context:', error);
            });
        } else {
            console.log('Audio context state:', this.audioContext.state);
        }
    }
