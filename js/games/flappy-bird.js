// Flappy Bird Game
const FlappyBird = {
    load(view, os) {
        this.os = os;
        this.score = 0;
        this.highScore = BhekStorage.getHighScore('flappy') || 0;
        this.gameRunning = false;
        this.gameLoop = null;
        
        view.innerHTML = `
            <div style="text-align: center; height: 100%; display: flex; flex-direction: column; padding: 16px;">
                <h2 style="margin-bottom: 16px;">🐦 Flappy Bird</h2>
                <p style="margin-bottom: 16px;">Click or press Space to flap. Avoid the pipes!</p>
                
                <div style="display: flex; justify-content: center; gap: 20px; margin-bottom: 16px;">
                    <div style="background: rgba(255,255,255,0.1); padding: 8px 16px; border-radius: 6px;">
                        <div style="font-size: 12px; opacity: 0.8;">Score</div>
                        <div id="flappy-score" style="font-size: 24px; font-weight: bold;">0</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.1); padding: 8px 16px; border-radius: 6px;">
                        <div style="font-size: 12px; opacity: 0.8;">High Score</div>
                        <div id="flappy-high-score" style="font-size: 24px; font-weight: bold;">${this.highScore}</div>
                    </div>
                </div>
                
                <div style="flex: 1; display: flex; justify-content: center; align-items: center;">
                    <canvas id="flappy-canvas" width="400" height="500" 
                            class="game-canvas" 
                            style="background: #87CEEB; cursor: pointer; max-width: 100%; height: auto;"></canvas>
                </div>
                
                <div style="margin-top: 16px; display: flex; gap: 10px; justify-content: center;">
                    <button onclick="FlappyBird.start()" id="flappy-start-btn">▶️ Start Game</button>
                    <button onclick="FlappyBird.reset()" class="secondary">🔄 Reset</button>
                </div>
                
                <div style="margin-top: 16px; font-size: 12px; opacity: 0.7;">
                    <span class="security-indicator security-high"></span> Protected game session
                </div>
            </div>
        `;
        
        setTimeout(() => this.init(), 100);
    },

    init() {
        const canvas = document.getElementById('flappy-canvas');
        if (!canvas) return;
        
        this.ctx = canvas.getContext('2d');
        this.canvasWidth = 400;
        this.canvasHeight = 500;
        
        this.reset();
        this.setupControls();
        this.draw();
    },

    reset() {
        this.bird = {
            x: 50,
            y: 250,
            radius: 12,
            velocity: 0,
            gravity: 0.5,
            jump: -8
        };
        
        this.pipes = [];
        this.score = 0;
        this.gameRunning = false;
        this.gameOver = false;
        this.pipeGap = 150;
        this.pipeWidth = 50;
        this.pipeSpeed = 3;
        this.frameCount = 0;
        
        this.updateScore();
        
        const startBtn = document.getElementById('flappy-start-btn');
        if (startBtn) {
            startBtn.innerHTML = '▶️ Start Game';
        }
        
        this.draw();
    },

    start() {
        if (this.gameRunning) return;
        
        if (this.gameOver) {
            this.reset();
        }
        
        this.gameRunning = true;
        this.gameOver = false;
        
        document.getElementById('flappy-start-btn').innerHTML = '⏸️ Pause';
        
        this.gameLoop = setInterval(() => this.update(), 1000 / 60);
    },

    pause() {
        this.gameRunning = false;
        document.getElementById('flappy-start-btn').innerHTML = '▶️ Resume';
        clearInterval(this.gameLoop);
    },

    update() {
        if (!this.gameRunning) return;
        
        this.frameCount++;
        
        // Bird physics
        this.bird.velocity += this.bird.gravity;
        this.bird.y += this.bird.velocity;
        
        // Generate pipes
        if (this.frameCount % 90 === 0) {
            const gapY = Math.random() * (this.canvasHeight - this.pipeGap - 100) + 50;
            this.pipes.push({
                x: this.canvasWidth,
                topHeight: gapY,
                bottomY: gapY + this.pipeGap,
                passed: false
            });
        }
        
        // Move pipes
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            this.pipes[i].x -= this.pipeSpeed;
            
            // Remove off-screen pipes
            if (this.pipes[i].x + this.pipeWidth < 0) {
                this.pipes.splice(i, 1);
                continue;
            }
            
            // Score when passing pipe
            if (!this.pipes[i].passed && this.pipes[i].x + this.pipeWidth < this.bird.x) {
                this.pipes[i].passed = true;
                this.score++;
                this.updateScore();
            }
        }
        
        // Check collisions
        this.checkCollisions();
        
        this.draw();
    },

    draw() {
        // Sky gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#B0E2FF');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        // Draw clouds
        this.ctx.fillStyle = 'rgba(255,255,255,0.5)';
        this.ctx.beginPath();
        this.ctx.arc(100, 100, 30, 0, Math.PI * 2);
        this.ctx.arc(130, 120, 25, 0, Math.PI * 2);
        this.ctx.arc(70, 120, 25, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(300, 200, 25, 0, Math.PI * 2);
        this.ctx.arc(330, 220, 20, 0, Math.PI * 2);
        this.ctx.arc(270, 220, 20, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw ground
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(0, this.canvasHeight - 50, this.canvasWidth, 50);
        
        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(0, this.canvasHeight - 50, this.canvasWidth, 10);
        
        // Draw grass
        this.ctx.strokeStyle = '#32CD32';
        this.ctx.lineWidth = 2;
        for (let i = 0; i < this.canvasWidth; i += 20) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, this.canvasHeight - 50);
            this.ctx.lineTo(i - 5, this.canvasHeight - 60);
            this.ctx.lineTo(i + 5, this.canvasHeight - 60);
            this.ctx.closePath();
            this.ctx.fillStyle = '#32CD32';
            this.ctx.fill();
        }
        
        // Draw pipes
        this.pipes.forEach(pipe => {
            // Top pipe
            const pipeGradient = this.ctx.createLinearGradient(pipe.x, 0, pipe.x + this.pipeWidth, 0);
            pipeGradient.addColorStop(0, '#2E8B57');
            pipeGradient.addColorStop(1, '#228B22');
            
            this.ctx.fillStyle = pipeGradient;
            this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);
            
            // Pipe cap
            this.ctx.fillStyle = '#2E8B57';
            this.ctx.fillRect(pipe.x - 5, pipe.topHeight - 30, this.pipeWidth + 10, 30);
            
            // Bottom pipe
            this.ctx.fillStyle = pipeGradient;
            this.ctx.fillRect(pipe.x, pipe.bottomY, this.pipeWidth, this.canvasHeight - pipe.bottomY - 50);
            
            // Pipe cap
            this.ctx.fillStyle = '#2E8B57';
            this.ctx.fillRect(pipe.x - 5, pipe.bottomY, this.pipeWidth + 10, 30);
        });
        
        // Draw bird
        // Body
        const birdGradient = this.ctx.createRadialGradient(
            this.bird.x - 5, this.bird.y - 5, 0,
            this.bird.x, this.bird.y, this.bird.radius * 2
        );
        birdGradient.addColorStop(0, '#FFD700');
        birdGradient.addColorStop(1, '#FFA500');
        
        this.ctx.fillStyle = birdGradient;
        this.ctx.beginPath();
        this.ctx.ellipse(this.bird.x, this.bird.y, this.bird.radius, this.bird.radius * 0.9, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Eye
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(this.bird.x + 5, this.bird.y - 4, 4, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.arc(this.bird.x + 6, this.bird.y - 5, 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Beak
        this.ctx.fillStyle = '#FF8C00';
        this.ctx.beginPath();
        this.ctx.moveTo(this.bird.x + this.bird.radius + 2, this.bird.y - 2);
        this.ctx.lineTo(this.bird.x + this.bird.radius + 12, this.bird.y);
        this.ctx.lineTo(this.bird.x + this.bird.radius + 2, this.bird.y + 2);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Wing
        this.ctx.fillStyle = '#FF8C00';
        this.ctx.beginPath();
        this.ctx.ellipse(
            this.bird.x - 8,
            this.bird.y + 2,
            6,
            3,
            Math.PI / 4,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
        
        // Draw score
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.score, this.canvasWidth / 2, 80);
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 2;
        this.ctx.strokeText(this.score, this.canvasWidth / 2, 80);
    },

    checkCollisions() {
        // Ground collision
        if (this.bird.y + this.bird.radius >= this.canvasHeight - 50) {
            this.endGame();
            return;
        }
        
        // Ceiling collision
        if (this.bird.y - this.bird.radius <= 0) {
            this.endGame();
            return;
        }
        
        // Pipe collisions
        for (let pipe of this.pipes) {
            if (this.bird.x + this.bird.radius > pipe.x &&
                this.bird.x - this.bird.radius < pipe.x + this.pipeWidth) {
                
                if (this.bird.y - this.bird.radius < pipe.topHeight ||
                    this.bird.y + this.bird.radius > pipe.bottomY) {
                    this.endGame();
                    return;
                }
            }
        }
    },

    jump() {
        if (this.gameRunning) {
            this.bird.velocity = this.bird.jump;
        }
    },

    endGame() {
        this.gameRunning = false;
        this.gameOver = true;
        clearInterval(this.gameLoop);
        
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            BhekStorage.saveScore('flappy', this.highScore);
            document.getElementById('flappy-high-score').textContent = this.highScore;
            this.os.notify('Flappy Bird', `New High Score: ${this.score}!`);
        }
        
        // Update button
        document.getElementById('flappy-start-btn').innerHTML = '▶️ Play Again';
        
        // Draw game over message
        this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Game Over!', 200, 200);
        
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Score: ${this.score}`, 200, 250);
        this.ctx.fillText('Click Play Again', 200, 300);
    },

    updateScore() {
        document.getElementById('flappy-score').textContent = this.score;
    },

    setupControls() {
        const canvas = document.getElementById('flappy-canvas');
        
        canvas.addEventListener('click', () => this.jump());
        
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.jump();
            }
        });
    }
};

window.FlappyBird = FlappyBird;
