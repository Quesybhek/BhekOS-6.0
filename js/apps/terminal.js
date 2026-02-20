// Terminal App
const Terminal = {
    load(view, os) {
        view.innerHTML = `
            <div class="terminal">
                <div>BhekOS Terminal v${os.version}</div>
                <div>Type 'help' for available commands</div>
                <br>
                <div>> Welcome to BhekOS Terminal</div>
                <div>> System ready with enhanced security</div>
                <div>> Password protection: <span style="color:#4CAF50">ACTIVE</span></div>
                <br>
                <div id="terminal-output"></div>
                <div class="terminal-input">
                    <span class="prompt">$</span>
                    <input type="text" id="terminal-input" 
                           style="background: transparent; border: none; color: #00ff00; flex: 1; outline: none;" 
                           placeholder="Type command..." 
                           autofocus>
                </div>
            </div>
        `;
        
        this.history = [];
        this.historyIndex = -1;
        this.os = os;
        this.commands = this.initCommands();
        
        const input = document.getElementById('terminal-input');
        input.focus();
        input.addEventListener('keydown', (e) => this.handleKeyPress(e));
    },

    initCommands() {
        return {
            'help': {
                description: 'Show available commands',
                execute: () => this.showHelp()
            },
            'clear': {
                description: 'Clear terminal screen',
                execute: () => this.clear()
            },
            'date': {
                description: 'Show current date',
                execute: () => new Date().toLocaleDateString()
            },
            'time': {
                description: 'Show current time',
                execute: () => new Date().toLocaleTimeString()
            },
            'ver': {
                description: 'Show BhekOS version',
                execute: () => `BhekOS ${this.os.version} Build ${this.os.build}`
            },
            'lock': {
                description: 'Lock the system',
                execute: () => {
                    this.os.lockScreen();
                    return 'Locking system...';
                }
            },
            'shutdown': {
                description: 'Shut down the system',
                execute: () => {
                    this.os.shutdown();
                    return 'Initiating shutdown...';
                }
            },
            'restart': {
                description: 'Restart the system',
                execute: () => {
                    this.os.restart();
                    return 'Restarting...';
                }
            },
            'ls': {
                description: 'List files in current directory',
                execute: () => this.listFiles()
            },
            'pwd': {
                description: 'Print working directory',
                execute: () => '/home/bhekos'
            },
            'whoami': {
                description: 'Show current user',
                execute: () => 'administrator'
            },
            'echo': {
                description: 'Print text',
                execute: (args) => args.join(' ')
            },
            'games': {
                description: 'List available games',
                execute: () => 'Available games: snake, flappy, memory, 2048, puzzle, tictactoe'
            },
            'snake': {
                description: 'Launch Snake game',
                execute: () => {
                    this.os.launchGame('snake');
                    return 'Launching Snake...';
                }
            },
            'flappy': {
                description: 'Launch Flappy Bird',
                execute: () => {
                    this.os.launchGame('flappy');
                    return 'Launching Flappy Bird...';
                }
            },
            'memory': {
                description: 'Launch Memory game',
                execute: () => {
                    this.os.launchGame('memory');
                    return 'Launching Memory Match...';
                }
            }
        };
    },

    handleKeyPress(e) {
        if (e.key === 'Enter') {
            const input = document.getElementById('terminal-input');
            const command = input.value.trim();
            this.executeCommand(command);
            input.value = '';
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.navigateHistory(-1);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.navigateHistory(1);
        }
    },

    executeCommand(cmd) {
        const output = document.getElementById('terminal-output');
        if (!output) return;
        
        // Add command to output
        output.innerHTML += `<div>> ${cmd}</div>`;
        
        // Add to history
        this.history.push(cmd);
        this.historyIndex = this.history.length;
        
        // Parse command
        const parts = cmd.split(' ');
        const command = parts[0].toLowerCase();
        const args = parts.slice(1);
        
        // Execute command
        let response;
        if (command === '') {
            response = '';
        } else if (this.commands[command]) {
            response = this.commands[command].execute(args);
        } else {
            response = `Command not found: ${command}. Type 'help' for available commands.`;
        }
        
        if (response) {
            output.innerHTML += `<div>> ${response}</div>`;
        }
        
        output.innerHTML += '<br>';
        output.scrollTop = output.scrollHeight;
    },

    showHelp() {
        const helpText = Object.entries(this.commands)
            .map(([cmd, info]) => `  ${cmd.padEnd(12)} - ${info.description}`)
            .join('\n');
        return `Available commands:\n${helpText}`;
    },

    clear() {
        document.getElementById('terminal-output').innerHTML = '';
        return '';
    },

    listFiles() {
        const files = ['Documents/', 'Downloads/', 'Pictures/', 'Music/', 'Videos/',
                      'project.docx', 'budget.xlsx', 'script.js', 'readme.txt'];
        return files.join('  ');
    },

    navigateHistory(direction) {
        this.historyIndex += direction;
        if (this.historyIndex < 0) {
            this.historyIndex = -1;
            document.getElementById('terminal-input').value = '';
        } else if (this.historyIndex >= this.history.length) {
            this.historyIndex = this.history.length;
            document.getElementById('terminal-input').value = '';
        } else {
            document.getElementById('terminal-input').value = this.history[this.historyIndex];
        }
    }
};

window.Terminal = Terminal;
