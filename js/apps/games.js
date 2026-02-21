// Game Center App
const Games = {
    load(view, os) {
        this.os = os;
        
        view.innerHTML = `
            <div style="padding: 20px; height: 100%; overflow-y: auto;">
                <h2 style="margin-bottom: 20px;">🎮 Game Center</h2>
                <p style="margin-bottom: 20px; opacity: 0.8;">Select a game to play. All games feature password protection.</p>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; margin-top: 20px;">
                    <div class="game-card" onclick="Games.launch('snake')">
                        <div style="font-size: 48px; margin-bottom: 12px;">🐍</div>
                        <h3 style="margin-bottom: 8px;">Snake</h3>
                        <p style="font-size: 12px; opacity: 0.8;">Classic snake game</p>
                        <div style="margin-top: 10px; font-size: 11px;">High: ${BhekStorage.getHighScore('snake') || 0}</div>
                    </div>
                    
                    <div class="game-card" onclick="Games.launch('flappy')">
                        <div style="font-size: 48px; margin-bottom: 12px;">🐦</div>
                        <h3 style="margin-bottom: 8px;">Flappy Bird</h3>
                        <p style="font-size: 12px; opacity: 0.8;">Fly through pipes</p>
                        <div style="margin-top: 10px; font-size: 11px;">High: ${BhekStorage.getHighScore('flappy') || 0}</div>
                    </div>
                    
                    <div class="game-card" onclick="Games.launch('memory')">
                        <div style="font-size: 48px; margin-bottom: 12px;">🧠</div>
                        <h3 style="margin-bottom: 8px;">Memory Match</h3>
                        <p style="font-size: 12px; opacity: 0.8;">Test your memory</p>
                        <div style="margin-top: 10px; font-size: 11px;">Best: ${BhekStorage.getHighScore('memory') || '0 moves'}</div>
                    </div>
                    
                    <div class="game-card" onclick="Games.launch('2048')">
                        <div style="font-size: 48px; margin-bottom: 12px;">🧮</div>
                        <h3 style="margin-bottom: 8px;">2048</h3>
                        <p style="font-size: 12px; opacity: 0.8;">Slide and combine numbers</p>
                        <div style="margin-top: 10px; font-size: 11px;">High: ${BhekStorage.getHighScore('2048') || 0}</div>
                    </div>
                    
                    <div class="game-card" onclick="Games.launch('puzzle')">
                        <div style="font-size: 48px; margin-bottom: 12px;">🧩</div>
                        <h3 style="margin-bottom: 8px;">Puzzle</h3>
                        <p style="font-size: 12px; opacity: 0.8;">Slide puzzle game</p>
                        <div style="margin-top: 10px; font-size: 11px;">Best: ${BhekStorage.getHighScore('puzzle') || '0 moves'}</div>
                    </div>
                    
                    <div class="game-card" onclick="Games.launch('tictactoe')">
                        <div style="font-size: 48px; margin-bottom: 12px;">⭕</div>
                        <h3 style="margin-bottom: 8px;">Tic Tac Toe</h3>
                        <p style="font-size: 12px; opacity: 0.8;">Play against AI</p>
                        <div style="margin-top: 10px; font-size: 11px;">Wins: ${BhekStorage.load('tttPlayerWins') || 0}</div>
                    </div>
                </div>
                
                <div style="margin-top: 30px; padding: 16px; background: rgba(var(--accent-rgb), 0.1); border-radius: 8px;">
                    <h4>🔐 Game Security</h4>
                    <p style="font-size: 13px; margin-top: 8px;">All games are protected with BhekOS security features.</p>
                    <label style="display: flex; align-items: center; gap: 8px; margin-top: 12px;">
                        <input type="checkbox" id="game-passwords" ${this.os.security.settings.requirePasswordForGames ? 'checked' : ''} 
                               onchange="Games.togglePasswordProtection(this.checked)">
                        Require password for games
                    </label>
                </div>
                
                <div style="margin-top: 20px; font-size: 12px; opacity: 0.6; text-align: center;">
                    High scores are encrypted and saved locally
                </div>
            </div>
        `;
    },

    launch(gameType) {
        const security = this.os.security.settings;
        if (security.requirePasswordForGames) {
            this.os.security.showPasswordPrompt('game', null, () => {
                this.openGame(gameType);
            });
        } else {
            this.openGame(gameType);
        }
    },

    openGame(gameType) {
        const gameNames = {
            'snake': 'Snake Game',
            'flappy': 'Flappy Bird',
            'memory': 'Memory Match',
            '2048': '2048',
            'puzzle': 'Puzzle Game',
            'tictactoe': 'Tic Tac Toe'
        };
        
        const pid = this.os.wm.spawn(gameNames[gameType], 'games');
        
        setTimeout(() => {
            const view = document.getElementById(`view-${pid}`);
            if (view) {
                this.loadSpecificGame(gameType, view);
            }
        }, 100);
    },

    loadSpecificGame(gameType, view) {
        switch(gameType) {
            case 'snake':
                SnakeGame.load(view, this.os);
                break;
            case 'flappy':
                FlappyBird.load(view, this.os);
                break;
            case 'memory':
                MemoryGame.load(view, this.os);
                break;
            case '2048':
                Game2048.load(view, this.os);
                break;
            case 'puzzle':
                PuzzleGame.load(view, this.os);
                break;
            case 'tictactoe':
                TicTacToe.load(view, this.os);
                break;
        }
    },

    togglePasswordProtection(enabled) {
        this.os.security.toggleGamePasswords(enabled);
    }
};

window.Games = Games;
