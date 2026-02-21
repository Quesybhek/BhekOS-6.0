// Puzzle Game
const PuzzleGame = {
    load(view, os) {
        this.os = os;
        this.moves = 0;
        this.gameActive = false;
        this.timerInterval = null;
        this.startTime = null;
        this.bestScore = BhekStorage.load('puzzleBest', { moves: 999, time: 999 });
        
        view.innerHTML = `
            <div style="text-align: center; height: 100%; display: flex; flex-direction: column; padding: 16px;">
                <h2 style="margin-bottom: 16px;">🧩 Puzzle Game</h2>
                <p style="margin-bottom: 16px;">Click pieces to move them into the correct order!</p>
                
                <div style="display: flex; justify-content: center; gap: 20px; margin-bottom: 16px; flex-wrap: wrap;">
                    <div style="background: rgba(255,255,255,0.1); padding: 8px 16px; border-radius: 6px;">
                        <div style="font-size: 12px; opacity: 0.8;">Moves</div>
                        <div id="puzzle-moves" style="font-size: 24px; font-weight: bold;">0</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.1); padding: 8px 16px; border-radius: 6px;">
                        <div style="font-size: 12px; opacity: 0.8;">Time</div>
                        <div id="puzzle-time" style="font-size: 24px; font-weight: bold;">0s</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.1); padding: 8px 16px; border-radius: 6px;">
                        <div style="font-size: 12px; opacity: 0.8;">Best</div>
                        <div id="puzzle-best" style="font-size: 14px; font-weight: bold;">${this.bestScore.moves} moves</div>
                    </div>
                </div>
                
                <div style="flex: 1; display: flex; justify-content: center; align-items: center;">
                    <div id="puzzle-container" class="puzzle-container"></div>
                </div>
                
                <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                    <button onclick="PuzzleGame.newGame()">🔄 New Puzzle</button>
                    <button onclick="PuzzleGame.solve()" class="secondary">🔧 Solve</button>
                    <button onclick="PuzzleGame.shuffle()" class="secondary">🎲 Shuffle</button>
                </div>
                
                <div style="margin-top: 16px; font-size: 12px; opacity: 0.7;">
                    <span class="security-indicator security-medium"></span> Puzzle progress saved
                </div>
            </div>
        `;
        
        setTimeout(() => this.init(), 100);
    },

    init() {
        this.size = 3; // 3x3 puzzle
        this.totalPieces = this.size * this.size;
        this.emptyIndex = this.totalPieces - 1;
        
        this.newGame();
    },

    newGame() {
        // Create solved puzzle
        this.puzzle = [];
        for (let i = 1; i < this.totalPieces; i++) {
            this.puzzle.push(i);
        }
        this.puzzle.push(0); // Empty piece
        
        this.emptyIndex = this.totalPieces - 1;
        this.moves = 0;
        this.gameActive = true;
        
        // Clear timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => this.updateTimer(), 1000);
        
        // Shuffle a bit
        this.shuffle(50);
        
        this.updateScore();
        this.renderPuzzle();
    },

    shuffle(times = 50) {
        for (let i = 0; i < times; i++) {
            const possibleMoves = this.getPossibleMoves();
            const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            this.movePiece(randomMove, false);
        }
        this.moves = 0;
        this.updateScore();
    },

    getPossibleMoves() {
        const moves = [];
        const emptyRow = Math.floor(this.emptyIndex / this.size);
        const emptyCol = this.emptyIndex % this.size;
        
        // Check adjacent pieces
        const directions = [
            { row: -1, col: 0 }, // Up
            { row: 1, col: 0 },  // Down
            { row: 0, col: -1 }, // Left
            { row: 0, col: 1 }   // Right
        ];
        
        directions.forEach(dir => {
            const newRow = emptyRow + dir.row;
            const newCol = emptyCol + dir.col;
            
            if (newRow >= 0 && newRow < this.size && newCol >= 0 && newCol < this.size) {
                moves.push(newRow * this.size + newCol);
            }
        });
        
        return moves;
    },

    movePiece(index, countMove = true) {
        if (!this.gameActive) return false;
        
        // Check if move is valid
        const possibleMoves = this.getPossibleMoves();
        if (!possibleMoves.includes(index)) return false;
        
        // Swap pieces
        [this.puzzle[this.emptyIndex], this.puzzle[index]] = 
        [this.puzzle[index], this.puzzle[this.emptyIndex]];
        
        this.emptyIndex = index;
        
        if (countMove) {
            this.moves++;
            this.updateScore();
            this.renderPuzzle();
            this.checkWin();
        }
        
        return true;
    },

    renderPuzzle() {
        const container = document.getElementById('puzzle-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.puzzle.forEach((value, index) => {
            const piece = document.createElement('div');
            piece.className = `puzzle-piece ${value === 0 ? 'empty' : ''}`;
            
            if (value !== 0) {
                piece.textContent = value;
                
                // Add background gradient based on number
                const hue = (value * 25) % 360;
                piece.style.background = `linear-gradient(135deg, 
                    hsl(${hue}, 70%, 50%), 
                    hsl(${hue}, 70%, 30%))`;
            } else {
                piece.style.background = 'rgba(255,255,255,0.05)';
            }
            
            piece.dataset.index = index;
            
            piece.onclick = () => this.movePiece(index, true);
            
            container.appendChild(piece);
        });
    },

    checkWin() {
        for (let i = 0; i < this.totalPieces - 1; i++) {
            if (this.puzzle[i] !== i + 1) {
                return false;
            }
        }
        
        // Game won!
        this.gameActive = false;
        clearInterval(this.timerInterval);
        
        const time = Math.floor((Date.now() - this.startTime) / 1000);
        
        // Check if it's a new record
        if (this.moves < this.bestScore.moves || 
            (this.moves === this.bestScore.moves && time < this.bestScore.time)) {
            this.bestScore = { moves: this.moves, time: time };
            BhekStorage.save('puzzleBest', this.bestScore);
            document.getElementById('puzzle-best').textContent = `${this.moves} moves`;
            this.os.notify('Puzzle', '🎉 New Record!');
        }
        
        this.os.notify('Puzzle', `🎉 Solved in ${this.moves} moves and ${time} seconds!`);
        
        // Show victory effect
        this.showVictory();
        
        return true;
    },

    showVictory() {
        const container = document.getElementById('puzzle-container');
        container.innerHTML = `
            <div style="grid-column: span 3; text-align: center; padding: 40px;">
                <div style="font-size: 64px; margin-bottom: 20px; animation: bounce 1s infinite;">🎉</div>
                <h3 style="margin-bottom: 10px;">Puzzle Solved!</h3>
                <p style="margin-bottom: 20px;">Moves: ${this.moves}</p>
                <button onclick="PuzzleGame.newGame()">Play Again</button>
            </div>
        `;
    },

    solve() {
        if (!this.gameActive) return;
        
        // Create solved puzzle
        for (let i = 0; i < this.totalPieces - 1; i++) {
            this.puzzle[i] = i + 1;
        }
        this.puzzle[this.totalPieces - 1] = 0;
        this.emptyIndex = this.totalPieces - 1;
        
        this.renderPuzzle();
        this.checkWin();
    },

    updateScore() {
        document.getElementById('puzzle-moves').textContent = this.moves;
    },

    updateTimer() {
        if (!this.gameActive) return;
        
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        document.getElementById('puzzle-time').textContent = `${elapsed}s`;
    },

    // Add CSS animation
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-20px); }
            }
        `;
        document.head.appendChild(style);
    }
};

// Initialize styles
PuzzleGame.addStyles();

window.PuzzleGame = PuzzleGame;
