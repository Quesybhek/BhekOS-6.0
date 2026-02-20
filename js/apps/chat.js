// AI Chat App with BhekThink Integration
const AIChat = {
    load(view, os) {
        this.os = os;
        this.messages = [];
        
        view.innerHTML = `
            <div style="height: 100%; display: flex; flex-direction: column; background: #000; font-family: 'Inter', system-ui, sans-serif;">
                <!-- Header -->
                <div style="padding: 16px 20px; background: rgba(0,255,136,0.05); border-bottom: 1px solid #00ff8822; display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="font-size: 24px; color: #00ff88;">🤖</span>
                        <div>
                            <h2 style="font-size: 16px; font-weight: 900; letter-spacing: 2px; color: #00ff88;">BHEKTHINK SOVEREIGN</h2>
                            <p style="font-size: 10px; opacity: 0.7;">v1000.5 • Omega AI</p>
                        </div>
                    </div>
                    <div id="think-status" style="display: flex; align-items: center; gap: 8px;">
                        <span class="security-indicator ${os.integrations.bhekthink?.isConnected ? 'security-high' : 'security-low'}"></span>
                        <span style="font-size: 11px;" id="think-mode">${os.integrations.bhekthink?.isConnected ? 'LIVE' : 'FALLBACK'}</span>
                    </div>
                </div>
                
                <!-- Chat Stream -->
                <div id="think-stream" style="flex: 1; overflow-y: auto; padding: 30px; display: flex; flex-direction: column; gap: 30px;"></div>
                
                <!-- Input Dock -->
                <div style="padding: 20px; background: linear-gradient(transparent, #000 50%);">
                    <div style="background: #0a0a0a; border: 1px solid #00ff8822; border-radius: 40px; padding: 12px 24px; display: flex; align-items: center; gap: 12px; box-shadow: 0 0 30px rgba(0,255,136,0.1);">
                        <textarea id="think-input" placeholder="Address BhekThink Singularity..." 
                                  style="flex: 1; background: transparent; border: none; color: white; font-size: 16px; outline: none; resize: none; max-height: 100px; font-family: inherit;"></textarea>
                        <span class="material-symbols-rounded" style="color: #00ff88; cursor: pointer; font-size: 28px;" onclick="AIChat.sendMessage()">bolt</span>
                    </div>
                    <div style="display: flex; gap: 12px; margin-top: 12px; justify-content: center; flex-wrap: wrap;">
                        <button class="secondary" onclick="AIChat.uploadFile()">📎 Attach</button>
                        <button class="secondary" onclick="AIChat.toggleVoice()">🎤 Voice</button>
                        <button class="secondary" onclick="AIChat.clearChat()">🗑️ Clear</button>
                        <button class="secondary" onclick="AIChat.exportChat()">📥 Export</button>
                    </div>
                </div>
            </div>
        `;
        
        this.setupInput();
        this.loadHistory();
    },

    setupInput() {
        const input = document.getElementById('think-input');
        input.addEventListener('input', () => {
            input.style.height = 'auto';
            input.style.height = input.scrollHeight + 'px';
        });
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    },

    async sendMessage() {
        const input = document.getElementById('think-input');
        const message = input.value.trim();
        if (!message) return;
        
        this.addMessage('user', message);
        input.value = '';
        input.style.height = 'auto';
        
        this.showTyping();
        
        try {
            const response = await this.os.integrations.bhekthink.processMessage(message, {
                source: 'ai-chat',
                timestamp: new Date().toISOString()
            });
            
            this.removeTyping();
            this.addMessage('ai', response);
            
        } catch (error) {
            this.removeTyping();
            this.addMessage('ai', `# Error\n\nFailed to process: ${error.message}`);
        }
    },

    addMessage(type, content) {
        const stream = document.getElementById('think-stream');
        const messageDiv = document.createElement('div');
        
        if (type === 'user') {
            messageDiv.className = 'node-user';
            messageDiv.style.cssText = `
                align-self: flex-end;
                max-width: 80%;
                font-size: 18px;
                color: #fff;
                border-right: 4px solid #00ff88;
                padding-right: 20px;
                text-align: right;
                animation: fadeIn 0.3s ease;
                margin: 10px 0;
            `;
            messageDiv.textContent = content;
        } else {
            messageDiv.className = 'node-ai';
            messageDiv.style.cssText = `
                width: 100%;
                animation: fadeIn 0.5s ease;
                margin: 10px 0;
            `;
            
            if (content.includes('#') || content.includes('*') || content.includes('`')) {
                messageDiv.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
                        <span style="color: #00ff88; font-size: 12px; font-weight: 900; letter-spacing: 2px;">⚡ BHEKTHINK</span>
                    </div>
                    <div class="ai-text" style="font-size: 16px; line-height: 1.7; color: #e0e0e0;">
                        ${marked.parse(content)}
                    </div>
                `;
                
                messageDiv.querySelectorAll('pre code').forEach(block => {
                    hljs.highlightElement(block);
                });
            } else {
                messageDiv.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
                        <span style="color: #00ff88; font-size: 12px; font-weight: 900; letter-spacing: 2px;">⚡ BHEKTHINK</span>
                    </div>
                    <div style="font-size: 16px; line-height: 1.7; color: #e0e0e0;">${content}</div>
                `;
            }
        }
        
        stream.appendChild(messageDiv);
        stream.scrollTo(0, stream.scrollHeight);
    },

    showTyping() {
        const stream = document.getElementById('think-stream');
        const typing = document.createElement('div');
        typing.id = 'typing-indicator';
        typing.style.cssText = `
            display: flex;
            gap: 5px;
            padding: 20px;
            align-items: center;
            color: #00ff88;
        `;
        typing.innerHTML = `
            <span>⚡</span>
            <span>BhekThink thinking</span>
            <span style="animation: pulse 1s infinite;">.</span>
            <span style="animation: pulse 1s infinite 0.2s;">.</span>
            <span style="animation: pulse 1s infinite 0.4s;">.</span>
        `;
        stream.appendChild(typing);
        stream.scrollTo(0, stream.scrollHeight);
    },

    removeTyping() {
        const typing = document.getElementById('typing-indicator');
        if (typing) typing.remove();
    },

    loadHistory() {
        const history = this.os.integrations.bhekthink?.conversationHistory || [];
        if (history.length > 0) {
            history.slice(-5).forEach(item => {
                this.addMessage('user', item.query);
                this.addMessage('ai', item.response);
            });
        } else {
            this.addMessage('ai', `# ⚡ Welcome to **BhekThink Sovereign**\n\nAbsolute AI v1000.5 is online. Full language mesh, toolset, and neural memory integrated.\n\nTry asking about my capabilities or generating something!`);
        }
    },

    uploadFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.onchange = (e) => {
            const file = e.target.files[0];
            this.addMessage('user', `📎 Uploaded: ${file.name}`);
            this.showTyping();
            
            setTimeout(() => {
                this.removeTyping();
                this.addMessage('ai', `# File Ingested\n\nI've received **${file.name}** (${(file.size/1024).toFixed(2)} KB). What would you like me to do with it?`);
            }, 1500);
        };
        input.click();
    },

    toggleVoice() {
        if (this.voiceActive) {
            this.os.integrations.bhekthink?.stopSpeaking();
            this.voiceActive = false;
        } else {
            this.voiceActive = true;
            this.os.integrations.bhekthink?.listen((text) => {
                document.getElementById('think-input').value = text;
                this.sendMessage();
            });
        }
    },

    clearChat() {
        const stream = document.getElementById('think-stream');
        stream.innerHTML = '';
        this.addMessage('ai', `# Session Cleared\n\nNeural context reset. How can I assist you?`);
        this.os.integrations.bhekthink?.clearHistory();
    },

    exportChat() {
        this.os.integrations.bhekthink?.exportConversation();
    }
};

// Add styles if not already present
if (!document.querySelector('#ai-chat-styles')) {
    const style = document.createElement('style');
    style.id = 'ai-chat-styles';
    style.textContent = `
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .ai-text h1 { color: #00ff88; font-size: 24px; margin: 20px 0 10px; }
        .ai-text h2 { color: #00ff88; font-size: 20px; margin: 15px 0 8px; }
        .ai-text h3 { color: #00ff88; font-size: 18px; margin: 12px 0 6px; }
        .ai-text p { margin: 10px 0; }
        .ai-text code { background: #1a1a1a; padding: 2px 6px; border-radius: 4px; color: #ffa657; }
        .ai-text pre { background: #1a1a1a; padding: 15px; border-radius: 8px; overflow-x: auto; margin: 15px 0; border: 1px solid #00ff8822; }
    `;
    document.head.appendChild(style);
    }
