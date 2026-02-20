// Animation Utilities
const BhekAnimations = {
    // Default animation settings
    defaults: {
        duration: 300,
        easing: 'ease-in-out',
        fill: 'forwards'
    },

    // Window animations
    windowOpen(element, options = {}) {
        const settings = { ...this.defaults, ...options };
        
        element.style.transform = 'scale(0.9) translateY(20px)';
        element.style.opacity = '0';
        
        return element.animate([
            { transform: 'scale(0.9) translateY(20px)', opacity: 0 },
            { transform: 'scale(1) translateY(0)', opacity: 1 }
        ], {
            duration: settings.duration,
            easing: settings.easing,
            fill: settings.fill
        });
    },

    windowClose(element, options = {}) {
        const settings = { ...this.defaults, ...options };
        
        return element.animate([
            { transform: 'scale(1) translateY(0)', opacity: 1 },
            { transform: 'scale(0.9) translateY(20px)', opacity: 0 }
        ], {
            duration: settings.duration,
            easing: settings.easing,
            fill: settings.fill
        });
    },

    // Taskbar animations
    taskbarIconHover(element) {
        return element.animate([
            { transform: 'scale(1)' },
            { transform: 'scale(1.1)' }
        ], {
            duration: 200,
            easing: 'ease-out',
            fill: 'forwards'
        });
    },

    taskbarIconUnhover(element) {
        return element.animate([
            { transform: 'scale(1.1)' },
            { transform: 'scale(1)' }
        ], {
            duration: 200,
            easing: 'ease-out',
            fill: 'forwards'
        });
    },

    // Notification animations
    notificationSlideIn(element, options = {}) {
        const settings = { ...this.defaults, ...options };
        
        element.style.transform = 'translateX(100%)';
        
        return element.animate([
            { transform: 'translateX(100%)', opacity: 0 },
            { transform: 'translateX(0)', opacity: 1 }
        ], {
            duration: settings.duration,
            easing: 'ease-out',
            fill: settings.fill
        });
    },

    notificationSlideOut(element, options = {}) {
        const settings = { ...this.defaults, ...options };
        
        return element.animate([
            { transform: 'translateX(0)', opacity: 1 },
            { transform: 'translateX(100%)', opacity: 0 }
        ], {
            duration: settings.duration,
            easing: 'ease-in',
            fill: settings.fill
        });
    },

    // Desktop icon animations
    iconHover(element) {
        return element.animate([
            { transform: 'scale(1)' },
            { transform: 'scale(1.05)' }
        ], {
            duration: 200,
            easing: 'ease-out',
            fill: 'forwards'
        });
    },

    iconClick(element) {
        return element.animate([
            { transform: 'scale(1)' },
            { transform: 'scale(0.95)' },
            { transform: 'scale(1)' }
        ], {
            duration: 200,
            easing: 'ease-in-out'
        });
    },

    // Menu animations
    menuOpen(element, options = {}) {
        const settings = { ...this.defaults, ...options };
        
        element.style.transform = 'scale(0.95)';
        element.style.opacity = '0';
        element.style.transformOrigin = 'bottom left';
        
        return element.animate([
            { transform: 'scale(0.95)', opacity: 0 },
            { transform: 'scale(1)', opacity: 1 }
        ], {
            duration: settings.duration,
            easing: 'ease-out',
            fill: settings.fill
        });
    },

    menuClose(element, options = {}) {
        const settings = { ...this.defaults, ...options };
        
        return element.animate([
            { transform: 'scale(1)', opacity: 1 },
            { transform: 'scale(0.95)', opacity: 0 }
        ], {
            duration: settings.duration,
            easing: 'ease-in',
            fill: settings.fill
        });
    },

    // Shutdown animations
    shutdownScreen(element) {
        return element.animate([
            { opacity: 0 },
            { opacity: 1 }
        ], {
            duration: 500,
            easing: 'ease-in',
            fill: 'forwards'
        });
    },

    // Loading animations
    loadingSpinner(element, options = {}) {
        const settings = {
            duration: 1000,
            iterations: Infinity,
            ...options
        };
        
        return element.animate([
            { transform: 'rotate(0deg)' },
            { transform: 'rotate(360deg)' }
        ], {
            duration: settings.duration,
            iterations: settings.iterations,
            easing: 'linear'
        });
    },

    // Game animations
    gameOverlay(element) {
        return element.animate([
            { backgroundColor: 'rgba(0,0,0,0)' },
            { backgroundColor: 'rgba(0,0,0,0.7)' }
        ], {
            duration: 300,
            easing: 'ease-in',
            fill: 'forwards'
        });
    },

    scorePopup(element, score) {
        element.textContent = `+${score}`;
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
        
        return element.animate([
            { transform: 'translateY(0)', opacity: 1 },
            { transform: 'translateY(-50px)', opacity: 0 }
        ], {
            duration: 1000,
            easing: 'ease-out',
            fill: 'forwards'
        });
    },

    // Page transitions
    fadeIn(element, options = {}) {
        const settings = { ...this.defaults, ...options };
        
        element.style.opacity = '0';
        
        return element.animate([
            { opacity: 0 },
            { opacity: 1 }
        ], {
            duration: settings.duration,
            easing: 'ease-in',
            fill: settings.fill
        });
    },

    fadeOut(element, options = {}) {
        const settings = { ...this.defaults, ...options };
        
        return element.animate([
            { opacity: 1 },
            { opacity: 0 }
        ], {
            duration: settings.duration,
            easing: 'ease-out',
            fill: settings.fill
        });
    },

    slideInFromLeft(element, options = {}) {
        const settings = { ...this.defaults, ...options };
        
        element.style.transform = 'translateX(-100%)';
        
        return element.animate([
            { transform: 'translateX(-100%)' },
            { transform: 'translateX(0)' }
        ], {
            duration: settings.duration,
            easing: 'ease-out',
            fill: settings.fill
        });
    },

    slideInFromRight(element, options = {}) {
        const settings = { ...this.defaults, ...options };
        
        element.style.transform = 'translateX(100%)';
        
        return element.animate([
            { transform: 'translateX(100%)' },
            { transform: 'translateX(0)' }
        ], {
            duration: settings.duration,
            easing: 'ease-out',
            fill: settings.fill
        });
    },

    // Pulse animation for attention
    pulse(element, options = {}) {
        const settings = {
            duration: 1000,
            iterations: 1,
            ...options
        };
        
        return element.animate([
            { transform: 'scale(1)' },
            { transform: 'scale(1.1)' },
            { transform: 'scale(1)' }
        ], {
            duration: settings.duration,
            iterations: settings.iterations,
            easing: 'ease-in-out'
        });
    },

    // Shake animation for errors
    shake(element, options = {}) {
        const settings = {
            duration: 500,
            ...options
        };
        
        return element.animate([
            { transform: 'translateX(0)' },
            { transform: 'translateX(-10px)' },
            { transform: 'translateX(10px)' },
            { transform: 'translateX(-5px)' },
            { transform: 'translateX(5px)' },
            { transform: 'translateX(0)' }
        ], {
            duration: settings.duration,
            easing: 'ease-in-out'
        });
    },

    // Bounce animation
    bounce(element, options = {}) {
        const settings = {
            duration: 1000,
            iterations: 1,
            ...options
        };
        
        return element.animate([
            { transform: 'translateY(0)' },
            { transform: 'translateY(-30px)' },
            { transform: 'translateY(0)' },
            { transform: 'translateY(-15px)' },
            { transform: 'translateY(0)' }
        ], {
            duration: settings.duration,
            iterations: settings.iterations,
            easing: 'ease-in-out'
        });
    },

    // Flip animation
    flip(element, options = {}) {
        const settings = {
            duration: 600,
            ...options
        };
        
        return element.animate([
            { transform: 'perspective(400px) rotateY(0)' },
            { transform: 'perspective(400px) rotateY(180deg)' },
            { transform: 'perspective(400px) rotateY(360deg)' }
        ], {
            duration: settings.duration,
            easing: 'ease-in-out'
        });
    },

    // Progress bar animation
    animateProgress(element, from, to, options = {}) {
        const settings = {
            duration: 1000,
            ...options
        };
        
        return element.animate([
            { width: `${from}%` },
            { width: `${to}%` }
        ], {
            duration: settings.duration,
            easing: 'linear',
            fill: 'forwards'
        });
    },

    // Typewriter effect
    async typewriter(element, text, options = {}) {
        const settings = {
            speed: 50,
            cursor: true,
            ...options
        };
        
        element.textContent = '';
        
        if (settings.cursor) {
            const cursor = document.createElement('span');
            cursor.textContent = '|';
            cursor.style.animation = 'blink 1s infinite';
            element.appendChild(cursor);
        }
        
        for (let i = 0; i < text.length; i++) {
            element.textContent = text.substring(0, i + 1);
            await new Promise(resolve => setTimeout(resolve, settings.speed));
        }
        
        if (settings.cursor) {
            element.removeChild(element.lastChild);
        }
    },

    // Confetti effect for wins
    confetti(options = {}) {
        const settings = {
            count: 100,
            colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'],
            duration: 3000,
            ...options
        };
        
        const container = document.createElement('div');
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 99999;
        `;
        document.body.appendChild(container);
        
        for (let i = 0; i < settings.count; i++) {
            const confetti = document.createElement('div');
            const color = settings.colors[Math.floor(Math.random() * settings.colors.length)];
            const left = Math.random() * 100;
            const size = Math.random() * 10 + 5;
            const rotation = Math.random() * 360;
            const delay = Math.random() * settings.duration;
            
            confetti.style.cssText = `
                position: absolute;
                left: ${left}%;
                top: -20px;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                transform: rotate(${rotation}deg);
                opacity: ${Math.random() * 0.5 + 0.5};
                animation: confettiFall ${settings.duration}ms ease-in ${delay}ms forwards;
            `;
            
            container.appendChild(confetti);
        }
        
        // Add keyframe animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes confettiFall {
                0% {
                    transform: translateY(0) rotate(0deg);
                }
                100% {
                    transform: translateY(100vh) rotate(${Math.random() * 720}deg);
                }
            }
        `;
        document.head.appendChild(style);
        
        setTimeout(() => {
            container.remove();
            style.remove();
        }, settings.duration + 1000);
    }
};

// Initialize common animations
document.addEventListener('DOMContentLoaded', () => {
    // Add blink animation style for cursor
    const style = document.createElement('style');
    style.textContent = `
        @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
        }
    `;
    document.head.appendChild(style);
});
