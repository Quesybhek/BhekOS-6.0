// Snake Game
const SnakeGame = {
    load(view, os) {
        this.os = os;
        this.score = 0;
        this.highScore = BhekStorage.getHighScore('snake') || 0;
        this.gameRunning = false;
        this.gameLoop = null;
        
        view.innerHTML = `
            <div style="text-align: center; height: 100%; display: flex; flex-direction: column; padding: 16px;">
                <h2 style="margin-bottom: 16px;">🐍 Snake Game</h2>
                <p style="margin-bottom: 16px;">Use arrow keys to control the snake. Eat food to grow!</p>
                
                <div style="display: flex; justify-content: center; gap: 20px; margin-bottom: 16px;">
                    <div style="background: rgba(255,255,255,0.1); padding: 8px 16px; border-radius: 6px;">
                        <div style="font-size: 12px; opacity: 0.8;">Score</div>
                        <div id="snake-score" style="font-size: 24px; font-weight: bold;">0</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.1); padding: 8px 16px; border-radius: 6px;">
                        <div style="font-size: 12px; opacity: 0.8;">High Score</div>
                        <div id="snake-high-score" style="font-size: 24px; font-weight: bold;">${this.highScore}</div>
                    </div>
                </div>
                
                <div style="flex: 1; display: flex; justify-content: center; align-items: center;">
                    <canvas id="snake-canvas" width="400" height="400" 
                            class="game-canvas" 
                            style="background: #111; cursor: pointer; max-width: 100%; height: auto;"></canvas>
                </div>
                
                <div style="margin-top: 16px; display: flex; gap: 10px; justify-content: center;">
                    <button onclick="SnakeGame.start()" id="snake-start-btn">▶️ Start Game</button>
                    <button onclick="SnakeGame.pause()" id="snake-pause-btn" class="secondary" disabled>⏸️ Pause</button>
                    <button onclick="SnakeGame.reset()" class="secondary">🔄 Reset</button>
                </div>
                
                <div style="margin-top: 16px; display: flex; justify-content: center; gap: 20px; font-size: 20px;">
                    <div style="display: flex; flex-direction: column; align-items: center;">
                        <span>⬆️</span>
                        <span style="font-size: 12px;">Up</span>
                    </div>
                    <div style="display: flex; flex-direction: column; align-items: center;">
                        <span>⬇️</span>
                        <span style="font-size: 12px;">Down</span>
                    </div>
                    <div style="display: flex; flex-direction: column; align-items: center;">
                        <span>⬅️</span>
                        <span style="font-size: 12px;">Left</span>
                    </div>
                    <div style="display: flex; flex-direction: column; align-items: center;">
                        <span>➡️</span>
                        <span style="font-size: 12px;">Right</span>
                    </div>
                </div>
                
                <div style="margin-top: 16px; font-size: 12px; opacity: 0.7;">
                    <span class="security-indicator security-high"></span> Game data is encrypted and secure
                </div>
            </div>
        `;
        
        setTimeout(() => this.init(), 100);
    },

    init() {
        const canvas = document.getElementById('snake-canvas');
        if (!canvas) return;
        
        this.ctx = canvas.getContext('2d');
        this.gridSize = 20;
        this.tileCount = canvas.width / this.gridSize;
        
        this.reset();
        this.setupControls();
        this.draw();
    },

    reset() {
        this.snake = [{x: 10, y: 10}];
        this.direction = {x: 1, y: 0};
        this.nextDirection = {x: 1, y: 0};
        this.score = 0;
        this.gameRunning = false;
        this.gameOver = false;
        
        this.generateFood();
        this.updateScore();
        
        // Reset buttons
        const startBtn = document.getElementById('snake-start-btn');
        const pauseBtn = document.getElementById('snake-pause-btn');
        if (startBtn) {
            startBtn.innerHTML = '▶️ Start Game';
            startBtn.disabled = false;
        }
        if (pauseBtn) {
            pauseBtn.innerHTML = '⏸️ Pause';
            pauseBtn.disabled = true;
        }
        
        this.draw();
    },

    generateFood() {
        do {
            this.food = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.snake.some(segment => segment.x === this.food.x && segment.y === this.food.y));
    },

    start() {
        if (this.gameRunning) return;
        
        if (this.gameOver) {
            this.reset();
        }
        
        this.gameRunning = true;
        this.gameOver = false;
        
        document.getElementById('snake-start-btn').innerHTML = '⏸️ Pause';
        document.getElementById('snake-pause-btn').disabled = false;
        
        this.gameLoop = setInterval(() => this.update(), 150);
    },

    pause() {
        this.gameRunning = !this.gameRunning;
        const pauseBtn = document.getElementById('snake-pause-btn');
        
        if (this.gameRunning) {
            pauseBtn.innerHTML = '⏸️ Pause';
            this.gameLoop = setInterval(() => this.update(), 150);
        } else {
            pauseBtn.innerHTML = '▶️ Resume';
            clearInterval(this.gameLoop);
        }
    },

    update() {
        if (!this.gameRunning) return;
        
        // Apply direction
        this.direction = {...this.nextDirection};
        
        // Calculate new head
        const head = {
            x: this.snake[0].x + this.direction.x,
            y: this.snake[0].y + this.direction.y
        };
        
        // Check wall collision
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.endGame();
            return;
        }
        
        // Check self collision
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.endGame();
            return;
        }
        
        // Add new head
        this.snake.unshift(head);
        
        // Check food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.updateScore();
            this.generateFood();
        } else {
            this.snake.pop();
        }
        
        this.draw();
    },

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(0, 0, 400, 400);
        
        // Draw grid
        this.ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= this.tileCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, 400);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(400, i * this.gridSize);
            this.ctx.stroke();
        }
        
        // Draw snake
        this.snake.forEach((segment, index) => {
            const gradient = this.ctx.createRadialGradient(
                segment.x * this.gridSize + this.gridSize/2,
                segment.y * this.gridSize + this.gridSize/2,
                0,
                segment.x * this.gridSize + this.gridSize/2,
                segment.y * this.gridSize + this.gridSize/2,
                this.gridSize
            );
            
            if (index === 0) {
                gradient.addColorStop(0, '#4CAF50');
                gradient.addColorStop(1, '#2E7D32');
            } else {
                gradient.addColorStop(0, '#81C784');
                gradient.addColorStop(1, '#4CAF50');
            }
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(
                segment.x * this.gridSize + 1,
                segment.y * this.gridSize + 1,
                this.gridSize - 2,
                this.gridSize - 2
            );
            
            // Draw eyes on head
            if (index === 0) {
                this.ctx.fillStyle = 'white';
                this.ctx.beginPath();
                this.ctx.arc(
                    segment.x * this.gridSize + this.gridSize * 0.35,
                    segment.y * this.gridSize + this.gridSize * 0.35,
                    2,
                    0,
                    Math.PI * 2
                );
                this.ctx.fill();
                
                this.ctx.beginPath();
                this.ctx.arc(
                    segment.x * this.gridSize + this.gridSize * 0.65,
                    segment.y * this.gridSize + this.gridSize * 0.35,
                    2,
                    0,
                    Math.PI * 2
                );
                this.ctx.fill();
                
                this.ctx.fillStyle = 'black';
                this.ctx.beginPath();
                this.ctx.arc(
                    segment.x * this.gridSize + this.gridSize * 0.35,
                    segment.y * this.gridSize + this.gridSize * 0.35,
                    1,
                    0,
                    Math.PI * 2
                );
                this.ctx.fill();
                
                this.ctx.beginPath();
                this.ctx.arc(
                    segment.x * this.gridSize + this.gridSize * 0.65,
                    segment.y * this.gridSize + this.gridSize * 0.35,
                    1,
                    0,
                    Math.PI * 2
                );
                this.ctx.fill();
            }
        });
        
        // Draw food
        const gradient = this.ctx.createRadialGradient(
            this.food.x * this.gridSize + this.gridSize/2,
            this.food.y * this.gridSize + this.gridSize/2,
            0,
            this.food.x * this.gridSize + this.gridSize/2,
            this.food.y * this.gridSize + this.gridSize/2,
            this.gridSize/2
        );
        gradient.addColorStop(0, '#FF5252');
        gradient.addColorStop(1, '#D32F2F');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.gridSize + this.gridSize/2,
            this.food.y * this.gridSize + this.gridSize/2,
            this.gridSize/2 - 2,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
    },

    endGame() {
        this.gameRunning = false;
        this.gameOver = true;
        clearInterval(this.gameLoop);
        
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            BhekStorage.saveScore('snake', this.highScore);
            document.getElementById('snake-high-score').textContent = this.highScore;
            this.os.notify('Snake Game', `New High Score: ${this.score}!`);
        }
        
        // Update buttons
        document.getElementById('snake-start-btn').innerHTML = '▶️ Play Again';
        document.getElementById('snake-pause-btn').disabled = true;
        
        // Draw game over message
        this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
        this.ctx.fillRect(0, 0, 400, 400);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Game Over!', 200, 180);
        
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Score: ${this.score}`, 200, 230);
        this.ctx.fillText('Click Play Again', 200, 280);
    },

    updateScore() {
        document.getElementById('snake-score').textContent = this.score;
    },

    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning) return;
            
            switch(e.key) {
                case 'ArrowUp':
                    if (this.direction.y !== 1) {
                        this.nextDirection = {x: 0, y: -1};
                    }
                    break;
                case 'ArrowDown':
                    if (this.direction.y !== -1) {
                        this.nextDirection = {x: 0, y: 1};
                    }
                    break;
                case 'ArrowLeft':
                    if (this.direction.x !== 1) {
                        this.nextDirection = {x: -1, y: 0};
                    }
                    break;
                case 'ArrowRight':
                    if (this.direction.x !== -1) {
                        this.nextDirection = {x: 1, y: 0};
                    }
                    break;
            }
        });
    }
};

window.SnakeGame = SnakeGame;
