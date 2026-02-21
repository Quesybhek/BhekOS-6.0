// Tic Tac Toe Game
const TicTacToe = {
    load(view, os) {
        this.os = os;
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.gameMode = 'ai'; // 'ai' or 'twoPlayer'
        this.playerWins = parseInt(BhekStorage.load('tttPlayerWins', 0));
        this.aiWins = parseInt(BhekStorage.load('tttAIWins', 0));
        this.draws = parseInt(BhekStorage.load('tttDraws', 0));
        
        view.innerHTML = `
            <div style="text-align: center; height: 100%; display: flex; flex-direction: column; padding: 16px;">
                <h2 style="margin-bottom: 16px;">⭕ Tic Tac Toe</h2>
                <p style="margin-bottom: 16px;">Get three in a row to win!</p>
                
                <div style="display: flex; justify-content: center; gap: 20px; margin-bottom: 16px; flex-wrap: wrap;">
                    <div style="background: rgba(255,255,255,0.1); padding: 8px 16px; border-radius: 6px;">
                        <div style="font-size: 12px; opacity: 0.8;">Player (X)</div>
                        <div id="ttt-player-wins" style="font-size: 24px; font-weight: bold;">${this.playerWins}</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.1); padding: 8px 16px; border-radius: 6px;">
                        <div style="font-size: 12px; opacity: 0.8;">AI (O)</div>
                        <div id="ttt-ai-wins" style="font-size: 24px; font-weight: bold;">${this.aiWins}</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.1); padding: 8px 16px; border-radius: 6px;">
                        <div style="font-size: 12px; opacity: 0.8;">Draws</div>
                        <div id="ttt-draws" style="font-size: 24px; font-weight: bold;">${this.draws}</div>
                    </div>
                </div>
                
                <div style="margin-bottom: 16px;">
                    <select id="ttt-mode" onchange="TicTacToe.setMode(this.value)" style="padding: 8px;">
                        <option value="ai" selected>vs AI</option>
                        <option value="twoPlayer">Two Players</option>
                    </select>
                </div>
                
                <div style="flex: 1; display: flex; justify-content: center; align-items: center;">
                    <div id="ttt-grid" class="tic-tac-toe-grid"></div>
                </div>
                
                <div id="ttt-status" style="margin: 20px 0; font-size: 18px; font-weight: bold;">
                    Your turn (X)
                </div>
                
                <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                    <button onclick="TicTacToe.newGame()">🔄 New Game</button>
                    <button onclick="TicTacToe.resetStats()" class="secondary">📊 Reset Stats</button>
                </div>
                
                <div style="margin-top: 16px; font-size: 12px; opacity: 0.7;">
                    <span class="security-indicator security-low"></span> Casual game - no encryption needed
                </div>
            </div>
        `;
        
        this.newGame();
    },

    newGame() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        
        this.renderBoard();
        this.updateStatus();
    },

    setMode(mode) {
        this.gameMode = mode;
        this.newGame();
    },

    renderBoard() {
        const grid = document.getElementById('ttt-grid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        this.board.forEach((cell, index) => {
            const cellElement = document.createElement('div');
            cellElement.className = 'ttt-cell';
            cellElement.textContent = cell;
            cellElement.dataset.index = index;
            
            if (!cell && this.gameActive) {
                if (this.gameMode === 'ai' && this.currentPlayer === 'O') {
                    // AI's turn - disable clicks
                } else {
                    cellElement.onclick = () => this.makeMove(index);
                }
            }
            
            // Add hover effect for empty cells
            if (!cell && this.gameActive) {
                cellElement.style.cursor = 'pointer';
            }
            
            grid.appendChild(cellElement);
        });
        
        // If it's AI's turn, make a move
        if (this.gameActive && this.gameMode === 'ai' && this.currentPlayer === 'O') {
            setTimeout(() => this.aiMove(), 500);
        }
    },

    makeMove(index) {
        if (!this.gameActive || this.board[index] !== '') return;
        
        // Make move
        this.board[index] = this.currentPlayer;
        
        // Check win/draw
        if (this.checkWin()) {
            this.gameActive = false;
            if (this.currentPlayer === 'X') {
                this.playerWins++;
                BhekStorage.save('tttPlayerWins', this.playerWins);
                document.getElementById('ttt-player-wins').textContent = this.playerWins;
                this.os.notify('Tic Tac Toe', 'You win! 🎉');
            } else {
                this.aiWins++;
                BhekStorage.save('tttAIWins', this.aiWins);
                document.getElementById('ttt-ai-wins').textContent = this.aiWins;
                this.os.notify('Tic Tac Toe', 'AI wins! 🤖');
            }
            this.updateStatus('win');
        } else if (this.checkDraw()) {
            this.gameActive = false;
            this.draws++;
            BhekStorage.save('tttDraws', this.draws);
            document.getElementById('ttt-draws').textContent = this.draws;
            this.os.notify('Tic Tac Toe', "It's a draw! 🤝");
            this.updateStatus('draw');
        } else {
            // Switch player
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
            this.updateStatus();
        }
        
        this.renderBoard();
    },

    aiMove() {
        if (!this.gameActive) return;
        
        // Find best move using minimax
        const bestMove = this.getBestMove();
        
        if (bestMove !== -1) {
            this.makeMove(bestMove);
        }
    },

    getBestMove() {
        // Try to win
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'O';
                if (this.checkWin()) {
                    this.board[i] = '';
                    return i;
                }
                this.board[i] = '';
            }
        }
        
        // Block player win
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'X';
                if (this.checkWin()) {
                    this.board[i] = '';
                    return i;
                }
                this.board[i] = '';
            }
        }
        
        // Take center
        if (this.board[4] === '') {
            return 4;
        }
        
        // Take corners
        const corners = [0, 2, 6, 8].filter(i => this.board[i] === '');
        if (corners.length > 0) {
            return corners[Math.floor(Math.random() * corners.length)];
        }
        
        // Take any available
        const available = this.board.map((cell, idx) => cell === '' ? idx : -1).filter(idx => idx !== -1);
        return available.length > 0 ? available[Math.floor(Math.random() * available.length)] : -1;
    },

    checkWin() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6] // diagonals
        ];
        
        return winPatterns.some(pattern => {
            const [a, b, c] = pattern;
            return this.board[a] !== '' &&
                   this.board[a] === this.board[b] &&
                   this.board[a] === this.board[c];
        });
    },

    checkDraw() {
        return this.board.every(cell => cell !== '');
    },

    updateStatus(result = null) {
        const status = document.getElementById('ttt-status');
        if (!status) return;
        
        if (result === 'win') {
            status.textContent = this.currentPlayer === 'X' ? 'You Win! 🎉' : 'AI Wins! 🤖';
        } else if (result === 'draw') {
            status.textContent = "It's a Draw! 🤝";
        } else {
            status.textContent = this.currentPlayer === 'X' ? 
                "Your turn (X)" : 
                (this.gameMode === 'ai' ? "AI thinking... 🤖" : "Player O's turn");
        }
    },

    resetStats() {
        if (confirm('Reset all statistics?')) {
            this.playerWins = 0;
            this.aiWins = 0;
            this.draws = 0;
            
            BhekStorage.save('tttPlayerWins', 0);
            BhekStorage.save('tttAIWins', 0);
            BhekStorage.save('tttDraws', 0);
            
            document.getElementById('ttt-player-wins').textContent = '0';
            document.getElementById('ttt-ai-wins').textContent = '0';
            document.getElementById('ttt-draws').textContent = '0';
            
            this.os.notify('Tic Tac Toe', 'Statistics reset');
        }
    }
};

window.TicTacToe = TicTacToe;
