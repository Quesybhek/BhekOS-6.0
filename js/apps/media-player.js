// Media Player App
const MediaPlayer = {
    load(view, os) {
        this.os = os;
        this.currentTrack = 0;
        this.isPlaying = false;
        this.volume = 70;
        this.playlist = BhekStorage.load('playlist', [
            { title: 'BhekOS Theme', artist: 'System Sounds', duration: '3:45' },
            { title: 'Ambient Waves', artist: 'Relaxation', duration: '5:20' },
            { title: 'Game Soundtrack', artist: '8-bit Music', duration: '2:15' },
            { title: 'Electronic Dreams', artist: 'Synthwave', duration: '4:30' },
            { title: 'Piano Memories', artist: 'Classical', duration: '3:50' }
        ]);
        
        view.innerHTML = `
            <div class="media-player" style="padding: 20px; height: 100%; overflow-y: auto;">
                <h2 style="margin-bottom: 20px;">🎵 Media Player</h2>
                
                <div style="background: rgba(255,255,255,0.05); padding: 30px; border-radius: 16px; text-align: center; margin-bottom: 20px;">
                    <div style="font-size: 64px; margin-bottom: 16px;" id="player-icon">🎵</div>
                    <h3 id="now-playing-title">${this.playlist[0].title}</h3>
                    <p id="now-playing-artist" style="opacity: 0.8;">${this.playlist[0].artist}</p>
                    
                    <div class="progress-bar" style="margin: 20px 0;">
                        <div class="progress" id="playback-progress" style="width: 0%;"></div>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; font-size: 12px; opacity: 0.7;">
                        <span id="current-time">0:00</span>
                        <span id="total-time">${this.playlist[0].duration}</span>
                    </div>
                    
                    <div class="media-controls" style="margin-top: 20px;">
                        <button onclick="MediaPlayer.previous()" style="font-size: 24px; background: transparent;">⏮️</button>
                        <button onclick="MediaPlayer.playPause()" id="play-pause-btn" style="font-size: 32px; background: transparent; transform: scale(1.2);">▶️</button>
                        <button onclick="MediaPlayer.next()" style="font-size: 24px; background: transparent;">⏭️</button>
                    </div>
                    
                    <div style="margin-top: 20px; display: flex; align-items: center; gap: 10px; justify-content: center;">
                        <span>🔉</span>
                        <input type="range" id="volume-slider" min="0" max="100" value="${this.volume}" style="width: 100px;" onchange="MediaPlayer.setVolume(this.value)">
                        <span>🔊</span>
                    </div>
                </div>
                
                <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px;">
                    <h4 style="margin-bottom: 16px;">📋 Playlist</h4>
                    <div id="playlist-container"></div>
                </div>
                
                <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: center;">
                    <button onclick="MediaPlayer.addToPlaylist()" class="secondary">➕ Add to Playlist</button>
                    <button onclick="MediaPlayer.clearPlaylist()" class="secondary">🗑️ Clear</button>
                    <button onclick="MediaPlayer.savePlaylist()" class="secondary">💾 Save</button>
                </div>
            </div>
        `;
        
        this.renderPlaylist();
        this.startProgressSimulation();
    },

    renderPlaylist() {
        const container = document.getElementById('playlist-container');
        if (!container) return;
        
        container.innerHTML = this.playlist.map((track, index) => `
            <div class="playlist-item" style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px;
                margin: 4px 0;
                background: ${index === this.currentTrack ? 'rgba(var(--accent-rgb), 0.2)' : 'rgba(255,255,255,0.02)'};
                border-radius: 8px;
                cursor: pointer;
                transition: background 0.2s;
            " onclick="MediaPlayer.playTrack(${index})">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span>${index === this.currentTrack && this.isPlaying ? '▶️' : '🎵'}</span>
                    <div>
                        <div style="font-weight: 500;">${track.title}</div>
                        <div style="font-size: 12px; opacity: 0.7;">${track.artist}</div>
                    </div>
                </div>
                <div style="font-size: 12px;">${track.duration}</div>
            </div>
        `).join('');
    },

    playPause() {
        this.isPlaying = !this.isPlaying;
        const btn = document.getElementById('play-pause-btn');
        btn.textContent = this.isPlaying ? '⏸️' : '▶️';
        
        if (this.isPlaying) {
            this.startProgressSimulation();
        }
        
        this.renderPlaylist();
    },

    playTrack(index) {
        this.currentTrack = index;
        this.isPlaying = true;
        document.getElementById('play-pause-btn').textContent = '⏸️';
        document.getElementById('now-playing-title').textContent = this.playlist[index].title;
        document.getElementById('now-playing-artist').textContent = this.playlist[index].artist;
        document.getElementById('total-time').textContent = this.playlist[index].duration;
        
        // Change icon based on mood
        const icons = ['🎵', '🎸', '🎹', '🎻', '🥁'];
        document.getElementById('player-icon').textContent = icons[index % icons.length];
        
        this.renderPlaylist();
        this.os.notify('Media Player', `Now playing: ${this.playlist[index].title}`);
    },

    next() {
        this.currentTrack = (this.currentTrack + 1) % this.playlist.length;
        this.playTrack(this.currentTrack);
    },

    previous() {
        this.currentTrack = (this.currentTrack - 1 + this.playlist.length) % this.playlist.length;
        this.playTrack(this.currentTrack);
    },

    setVolume(value) {
        this.volume = value;
        // In a real app, this would adjust audio volume
    },

    addToPlaylist() {
        const title = prompt('Enter track title:');
        const artist = prompt('Enter artist:');
        const duration = prompt('Enter duration (e.g., 3:45):');
        
        if (title && artist && duration) {
            this.playlist.push({ title, artist, duration });
            this.renderPlaylist();
            this.os.notify('Media Player', 'Track added to playlist');
        }
    },

    clearPlaylist() {
        if (confirm('Clear entire playlist?')) {
            this.playlist = [];
            this.renderPlaylist();
            this.os.notify('Media Player', 'Playlist cleared');
        }
    },

    savePlaylist() {
        BhekStorage.save('playlist', this.playlist);
        this.os.notify('Media Player', 'Playlist saved');
    },

    startProgressSimulation() {
        let progress = 0;
        const interval = setInterval(() => {
            if (!this.isPlaying) return;
            
            progress += 1;
            if (progress > 100) progress = 0;
            
            const progressBar = document.getElementById('playback-progress');
            if (progressBar) progressBar.style.width = progress + '%';
            
            // Update current time
            const timeDisplay = document.getElementById('current-time');
            if (timeDisplay) {
                const minutes = Math.floor(progress / 20);
                const seconds = Math.floor((progress % 20) * 3);
                timeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
        
        // Store interval to clear later
        this.progressInterval = interval;
    }
};

window.MediaPlayer = MediaPlayer;
