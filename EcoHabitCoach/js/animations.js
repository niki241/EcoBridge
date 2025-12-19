// EcoHabit Coach Animations
// This file handles all animations for a smooth, organic user experience

class EcoAnimations {
    constructor() {
        this.initializeAnimations();
    }

    initializeAnimations() {
        this.setupScrollAnimations();
        this.setupHoverAnimations();
        this.setupPageLoadAnimations();
        this.setupButtonAnimations();
        this.setupConfetti();
    }

    setupScrollAnimations() {
        // Animate elements when they come into view
        const animateOnScroll = () => {
            const elements = document.querySelectorAll('.animate-on-scroll');
            
            elements.forEach(element => {
                const elementTop = element.getBoundingClientRect().top;
                const elementVisible = 150;
                
                if (elementTop < window.innerHeight - elementVisible) {
                    element.classList.add('active');
                }
            });
        };

        // Run once on load and then on scroll
        animateOnScroll();
        window.addEventListener('scroll', animateOnScroll);
    }

    setupHoverAnimations() {
        // Add hover effects to all buttons with the 'btn' class
        const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, .habit-btn');
        
        buttons.forEach(button => {
            // Mouse enter effect
            button.addEventListener('mouseenter', (e) => {
                this.rippleEffect(e, button);
                button.style.transform = 'translateY(-2px)';
                button.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.1)';
            });
            
            // Mouse leave effect
            button.addEventListener('mouseleave', () => {
                button.style.transform = 'translateY(0)';
                button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
            });
        });
    }

    setupPageLoadAnimations() {
        const run = () => {
            // Animate the welcome section
            const welcomeSection = document.querySelector('.welcome-section');
            if (welcomeSection) {
                setTimeout(() => {
                    welcomeSection.style.opacity = '1';
                    welcomeSection.style.transform = 'translateY(0)';
                }, 100);
            }

            // Animate habit buttons with a slight delay
            const habitButtons = document.querySelectorAll('.habit-btn');
            habitButtons.forEach((button, index) => {
                setTimeout(() => {
                    button.style.opacity = '1';
                    button.style.transform = 'translateY(0)';
                }, 200 + (index * 50));
            });
        };

        // Animate elements when the page loads
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', run);
        } else {
            run();
        }
    }

    setupButtonAnimations() {
        // Add click animation to all buttons
        const buttons = document.querySelectorAll('button');
        
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                // Add a small scale effect on click
                button.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    button.style.transform = 'scale(1)';
                }, 100);
                
                // Add ripple effect
                this.rippleEffect(e, button);
            });
        });
    }

    rippleEffect(event, element) {
        // Create ripple element
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        
        // Set ripple styles
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${event.clientX - rect.left - size/2}px`;
        ripple.style.top = `${event.clientY - rect.top - size/2}px`;
        ripple.classList.add('ripple');
        
        // Remove any existing ripples
        const existingRipple = element.querySelector('.ripple');
        if (existingRipple) {
            existingRipple.remove();
        }
        
        // Add ripple to button
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        // Remove ripple after animation
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    setupConfetti() {
        // This creates a simple confetti effect
        window.showConfetti = () => {
            const colors = ['#4CAF50', '#81C784', '#388E3C', '#A5D6A7', '#66BB6A'];
            const canvas = document.createElement('canvas');
            const container = document.querySelector('.app-container') || document.body;
            
            canvas.style.position = 'fixed';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.style.pointerEvents = 'none';
            canvas.style.zIndex = '1000';
            
            container.appendChild(canvas);
            
            const ctx = canvas.getContext('2d');
            const width = window.innerWidth;
            const height = window.innerHeight;
            
            // Set canvas size
            canvas.width = width;
            canvas.height = height;
            
            // Create confetti particles
            const particles = [];
            const particleCount = 100;
            
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height - height,
                    r: Math.random() * 4 + 1,
                    d: Math.random() * particleCount,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    rotation: Math.random() * 360,
                    speed: Math.random() * 3 + 2
                });
            }
            
            // Animation loop
            function animate() {
                ctx.clearRect(0, 0, width, height);
                
                let stillActive = false;
                
                particles.forEach((p, i) => {
                    p.y += p.speed;
                    p.rotation += 2;
                    
                    if (p.y < height) {
                        stillActive = true;
                    }
                    
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.rotation * Math.PI / 180);
                    
                    ctx.fillStyle = p.color;
                    ctx.globalAlpha = 0.8;
                    ctx.fillRect(-p.r, -p.r, p.r * 2, p.r * 2);
                    
                    ctx.restore();
                });
                
                if (stillActive) {
                    requestAnimationFrame(animate);
                } else {
                    canvas.remove();
                }
            }
            
            // Start animation
            animate();
            
            // Remove canvas after animation completes
            setTimeout(() => {
                if (canvas.parentNode) {
                    canvas.parentNode.removeChild(canvas);
                }
            }, 3000);
        };
    }
}

// Initialize animations when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const ecoAnimations = new EcoAnimations();
    
    // Make available globally for debugging
    window.ecoAnimations = ecoAnimations;
});

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    /* Base animations */
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes slideUp {
        from { 
            opacity: 0;
            transform: translateY(20px);
        }
        to { 
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    /* Apply animations */
    .welcome-section {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease-out, transform 0.6s ease-out;
    }
    
    .habit-btn {
        opacity: 0;
        transform: translateY(10px);
        transition: all 0.3s ease-out;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.7);
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
    }
    
    .suggestion-update {
        animation: fadeIn 0.5s ease-out;
    }
    
    /* Confetti particles */
    .confetti {
        position: fixed;
        width: 10px;
        height: 10px;
        background-color: #f00;
        opacity: 0.7;
        border-radius: 50%;
        pointer-events: none;
        z-index: 1000;
    }
`;

document.head.appendChild(style);
