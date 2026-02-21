// Memory Match Game
const MemoryGame = {
    load(view, os) {
        this.os = os;
        this.moves = 0;
        this.matches = 0;
        this.gameActive = false;
        this.timerInterval = null;
        this.startTime = null;
        this.highScores = BhekStorage.load('memoryHighScores', []);
        
        view.innerHTML = `
            <div style="text-align: center; height: 100%; display: flex; flex-direction: column; padding: 16px;">
                <h2 style="margin-bottom: 16px;">🧠 Memory Match</h2>
                <p style="margin-bottom: 16px;">Click cards to find matching pairs. Remember their positions!</p>
                
                <div style="display: flex; justify-content: center; gap: 20px; margin-bottom: 16px; flex-wrap: wrap;">
                    <div style="background: rgba(255,255,255,0.1); padding: 8px 16px; border-radius: 6px;">
                        <div style="font-size: 12px; opacity: 0.8;">Moves</div>
                        <div id="memory-moves" style="font-size: 24px; font-weight: bold;">0</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.1); padding: 8px 16px; border-radius: 6px;">
                        <div style="font-size: 12px; opacity: 0.8;">Matches</div>
                        <div id="memory-matches" style="font-size: 24px; font-weight: bold;">0/8</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.1); padding: 8px 16px; border-radius: 6px;">
                        <div style="font-size: 12px; opacity: 0.8;">Time</div>
                        <div id="memory-time" style="font-size: 24px; font-weight: bold;">0s</div>
                    </div>
                </div>
                
                <div style="flex: 1; display: flex; justify-content: center; align-items: center;">
                    <div id="memory-grid" style="
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 10px;
                        max-width: 420px;
                        margin: 0 auto;
                    "></div>
                </div>
                
                <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                    <button onclick="MemoryGame.newGame()">🔄 New Game</button>
                    <button onclick="MemoryGame.showSolution()" class="secondary">💡 Show Solution</button>
                    <button onclick="MemoryGame.showHighScores()" class="secondary">🏆 High Scores</button>
                </div>
                
                <div style="margin-top: 16px; font-size: 12px; opacity: 0.7;">
                    <span class="security-indicator security-medium"></span> Memory scores are encrypted
                </div>
            </div>
        `;
        
        setTimeout(() => this.init(), 100);
    },

    init() {
        this.emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
        this.newGame();
    },

    newGame() {
        this.cards = [...this.emojis, ...this.emojis];
        this.shuffleArray(this.cards);
        
        this.flippedCards = [];
        this.matchedCards = [];
        this.moves = 0;
        this.matches = 0;
        this.gameActive = true;
        this.lockBoard = false;
        
        // Clear any existing timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => this.updateTimer(), 1000);
        
        this.updateScore();
        this.renderGrid();
    },

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    },

    renderGrid() {
        const grid = document.getElementById('memory-grid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        this.cards.forEach((emoji, index) => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.dataset.index = index;
            card.dataset.emoji = emoji;
            
            if (this.matchedCards.includes(index)) {
                card.classList.add('matched');
                card.innerHTML = `
                    <div style="font-size: 32px;">${emoji}</div>
                `;
            } else if (this.flippedCards.includes(index)) {
                card.classList.add('flipped');
                card.innerHTML = `
                    <div style="font-size: 32px;">${emoji}</div>
                `;
            } else {
                card.innerHTML = `
                    <div style="font-size: 32px;">❓</div>
                `;
            }
            
            card.onclick = () => this.flipCard(index);
            
            grid.appendChild(card);
        });
    },

    flipCard(index) {
        if (!this.gameActive || this.lockBoard) return;
        if (this.matchedCards.includes(index)) return;
        if (this.flippedCards.includes(index)) return;
        if (this.flippedCards.length >= 2) return;
        
        // Add to flipped cards
        this.flippedCards.push(index);
        this.renderGrid();
        
        // Check for match
        if (this.flippedCards.length === 2) {
            this.lockBoard = true;
            this.moves++;
            this.updateScore();
            
            const [card1, card2] = this.flippedCards;
            
            if (this.cards[card1] === this.cards[card2]) {
                // Match found
                setTimeout(() => {
                    this.matchedCards.push(card1, card2);
                    this.matches++;
                    this.flippedCards = [];
                    this.lockBoard = false;
                    
                    this.updateScore();
                    this.renderGrid();
                    
                    if (this.matches === 8) {
                        this.gameWon();
                    }
                }, 500);
            } else {
                // No match
                setTimeout(() => {
                    this.flippedCards = [];
                    this.lockBoard = false;
                    this.renderGrid();
                }, 1000);
            }
        }
    },

    gameWon() {
        this.gameActive = false;
        clearInterval(this.timerInterval);
        
        const time = Math.floor((Date.now() - this.startTime) / 1000);
        
        // Save score
        this.highScores.push({
            moves: this.moves,
            time: time,
            date: new Date().toLocaleDateString()
        });
        
        this.highScores.sort((a, b) => {
            if (a.moves === b.moves) {
                return a.time - b.time;
            }
            return a.moves - b.moves;
        });
        
        if (this.highScores.length > 10) {
            this.highScores.length = 10;
        }
        
        BhekStorage.save('memoryHighScores', this.highScores);
        
        this.os.notify('Memory Game', `🎉 You won in ${this.moves} moves and ${time} seconds!`);
        
        // Show victory message
        const grid = document.getElementById('memory-grid');
        grid.innerHTML = `
            <div style="grid-column: span 4; text-align: center; padding: 40px;">
                <div style="font-size: 48px; margin-bottom: 20px;">🎉</div>
                <h3>Congratulations!</h3>
                <p>You completed the game in ${this.moves} moves</p>
                <p>Time: ${time} seconds</p>
                <button onclick="MemoryGame.newGame()" style="margin-top: 20px;">Play Again</button>
            </div>
        `;
    },

    showSolution() {
        if (!this.gameActive) return;
        
        this.flippedCards = [];
        this.lockBoard = true;
        this.renderGrid();
        
        // Show all cards briefly
        setTimeout(() => {
            this.flippedCards = [];
            this.lockBoard = false;
            this.renderGrid();
        }, 2000);
    },

    showHighScores() {
        const scores = this.highScores.map((score, index) => 
            `${index + 1}. ${score.moves} moves - ${score.time}s (${score.date})`
        ).join('\n');
        
        alert(scores || 'No high scores yet!');
    },

    updateScore() {
        document.getElementById('memory-moves').textContent = this.moves;
        document.getElementById('memory-matches').textContent = `${this.matches}/8`;
    },

    updateTimer() {
        if (!this.gameActive) return;
        
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        document.getElementById('memory-time').textContent = `${elapsed}s`;
    }
};

window.MemoryGame = MemoryGame;
