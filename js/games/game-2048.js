// 2048 Game
const Game2048 = {
    load(view, os) {
        this.os = os;
        this.score = 0;
        this.bestScore = BhekStorage.getHighScore('2048') || 0;
        this.gameActive = false;
        this.grid = [];
        this.previousState = null;
        
        view.innerHTML = `
            <div style="text-align: center; height: 100%; display: flex; flex-direction: column; padding: 16px;">
                <h2 style="margin-bottom: 16px;">🧮 2048</h2>
                <p style="margin-bottom: 16px;">Use arrow keys to slide tiles. Combine identical tiles!</p>
                
                <div style="display: flex; justify-content: center; gap: 20px; margin-bottom: 16px;">
                    <div style="background: rgba(255,255,255,0.1); padding: 8px 16px; border-radius: 6px;">
                        <div style="font-size: 12px; opacity: 0.8;">Score</div>
                        <div id="game2048-score" style="font-size: 24px; font-weight: bold;">0</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.1); padding: 8px 16px; border-radius: 6px;">
                        <div style="font-size: 12px; opacity: 0.8;">Best</div>
                        <div id="game2048-best" style="font-size: 24px; font-weight: bold;">${this.bestScore}</div>
                    </div>
                </div>
                
                <div style="flex: 1; display: flex; justify-content: center; align-items: center;">
                    <div id="game2048-grid" class="game-2048-grid"></div>
                </div>
                
                <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: center;">
                    <button onclick="Game2048.newGame()">🔄 New Game</button>
                    <button onclick="Game2048.undo()" id="2048-undo-btn" class="secondary" disabled>↩️ Undo</button>
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
                    <span class="security-indicator security-high"></span> Game progress is encrypted
                </div>
            </div>
        `;
        
        this.tileColors = {
            0: { bg: 'rgba(255,255,255,0.1)', color: 'white' },
            2: { bg: '#EEE4DA', color: '#776E65' },
            4: { bg: '#EDE0C8', color: '#776E65' },
            8: { bg: '#F2B179', color: 'white' },
            16: { bg: '#F59563', color: 'white' },
            32: { bg: '#F67C5F', color: 'white' },
            64: { bg: '#F65E3B', color: 'white' },
            128: { bg: '#EDCF72', color: 'white' },
            256: { bg: '#EDCC61', color: 'white' },
            512: { bg: '#EDC850', color: 'white' },
            1024: { bg: '#EDC53F', color: 'white' },
            2048: { bg: '#EDC22E', color: 'white' },
            4096: { bg: '#3C3A32', color: 'white' }
        };
        
        this.newGame();
        this.setupControls();
    },

    newGame() {
        this.grid = [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ];
        
        this.score = 0;
        this.previousState = null;
        this.gameActive = true;
        
        this.addRandomTile();
        this.addRandomTile();
        this.renderGrid();
        
        document.getElementById('2048-undo-btn').disabled = true;
    },

    addRandomTile() {
        const emptyCells = [];
        
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({ row: i, col: j });
                }
            }
        }
        
        if (emptyCells.length > 0) {
            const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.grid[row][col] = Math.random() < 0.9 ? 2 : 4;
        }
    },

    move(direction) {
        if (!this.gameActive) return;
        
        // Save state for undo
        this.saveState();
        
        let moved = false;
        const oldGrid = JSON.parse(JSON.stringify(this.grid));
        
        switch(direction) {
            case 'left':
                moved = this.moveLeft();
                break;
            case 'right':
                moved = this.moveRight();
                break;
            case 'up':
                moved = this.moveUp();
                break;
            case 'down':
                moved = this.moveDown();
                break;
        }
        
        if (moved) {
            this.addRandomTile();
            this.renderGrid();
            this.updateScore();
            this.checkGameOver();
            document.getElementById('2048-undo-btn').disabled = false;
        }
    },

    moveLeft() {
        let moved = false;
        
        for (let i = 0; i < 4; i++) {
            const row = this.grid[i].filter(val => val !== 0);
            
            for (let j = 0; j < row.length - 1; j++) {
                if (row[j] === row[j + 1]) {
                    row[j] *= 2;
                    this.score += row[j];
                    row.splice(j + 1, 1);
                    moved = true;
                }
            }
            
            while (row.length < 4) {
                row.push(0);
            }
            
            if (JSON.stringify(this.grid[i]) !== JSON.stringify(row)) {
                moved = true;
            }
            
            this.grid[i] = row;
        }
        
        return moved;
    },

    moveRight() {
        let moved = false;
        
        for (let i = 0; i < 4; i++) {
            const row = this.grid[i].filter(val => val !== 0);
            
            for (let j = row.length - 1; j > 0; j--) {
                if (row[j] === row[j - 1]) {
                    row[j] *= 2;
                    this.score += row[j];
                    row.splice(j - 1, 1);
                    moved = true;
                    j--;
                }
            }
            
            while (row.length < 4) {
                row.unshift(0);
            }
            
            if (JSON.stringify(this.grid[i]) !== JSON.stringify(row)) {
                moved = true;
            }
            
            this.grid[i] = row;
        }
        
        return moved;
    },

    moveUp() {
        let moved = false;
        
        for (let j = 0; j < 4; j++) {
            const column = [];
            for (let i = 0; i < 4; i++) {
                if (this.grid[i][j] !== 0) {
                    column.push(this.grid[i][j]);
                }
            }
            
            for (let i = 0; i < column.length - 1; i++) {
                if (column[i] === column[i + 1]) {
                    column[i] *= 2;
                    this.score += column[i];
                    column.splice(i + 1, 1);
                    moved = true;
                }
            }
            
            while (column.length < 4) {
                column.push(0);
            }
            
            for (let i = 0; i < 4; i++) {
                if (this.grid[i][j] !== column[i]) {
                    moved = true;
                }
                this.grid[i][j] = column[i];
            }
        }
        
        return moved;
    },

    moveDown() {
        let moved = false;
        
        for (let j = 0; j < 4; j++) {
            const column = [];
            for (let i = 0; i < 4; i++) {
                if (this.grid[i][j] !== 0) {
                    column.push(this.grid[i][j]);
                }
            }
            
            for (let i = column.length - 1; i > 0; i--) {
                if (column[i] === column[i - 1]) {
                    column[i] *= 2;
                    this.score += column[i];
                    column.splice(i - 1, 1);
                    moved = true;
                    i--;
                }
            }
            
            while (column.length < 4) {
                column.unshift(0);
            }
            
            for (let i = 0; i < 4; i++) {
                if (this.grid[i][j] !== column[i]) {
                    moved = true;
                }
                this.grid[i][j] = column[i];
            }
        }
        
        return moved;
    },

    saveState() {
        this.previousState = {
            grid: JSON.parse(JSON.stringify(this.grid)),
            score: this.score
        };
    },

    undo() {
        if (this.previousState && this.gameActive) {
            this.grid = JSON.parse(JSON.stringify(this.previousState.grid));
            this.score = this.previousState.score;
            this.renderGrid();
            this.updateScore();
            document.getElementById('2048-undo-btn').disabled = true;
        }
    },

    renderGrid() {
        const gridElement = document.getElementById('game2048-grid');
        if (!gridElement) return;
        
        gridElement.innerHTML = '';
        
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const value = this.grid[i][j];
                const colors = this.tileColors[value] || this.tileColors[4096];
                
                const tile = document.createElement('div');
                tile.className = 'tile';
                tile.textContent = value === 0 ? '' : value;
                tile.style.backgroundColor = colors.bg;
                tile.style.color = colors.color;
                
                // Adjust font size based on number of digits
                if (value >= 1000) {
                    tile.style.fontSize = '18px';
                } else if (value >= 100) {
                    tile.style.fontSize = '20px';
                }
                
                gridElement.appendChild(tile);
            }
        }
    },

    updateScore() {
        document.getElementById('game2048-score').textContent = this.score;
        
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            BhekStorage.saveScore('2048', this.bestScore);
            document.getElementById('game2048-best').textContent = this.bestScore;
        }
    },

    checkGameOver() {
        // Check for 2048 win
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.grid[i][j] >= 2048) {
                    this.gameWon();
                    return;
                }
            }
        }
        
        // Check for possible moves
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.grid[i][j] === 0) return;
                
                if (j < 3 && this.grid[i][j] === this.grid[i][j + 1]) return;
                if (i < 3 && this.grid[i][j] === this.grid[i + 1][j]) return;
            }
        }
        
        // Game over
        this.gameActive = false;
        this.os.notify('2048', 'Game Over! No more moves available.');
    },

    gameWon() {
        this.gameActive = false;
        this.os.notify('2048', '🎉 Congratulations! You reached 2048!');
    },

    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (!this.gameActive) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.move('left');
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.move('right');
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.move('up');
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.move('down');
                    break;
            }
        });
    }
};

window.Game2048 = Game2048;
