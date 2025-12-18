// EcoHabit Coach Animations
// This file handles all animations for a smooth, organic user experience

class EcoAnimations {
    constructor() {
        this.initializeAnimations();
    }

    initializeAnimations() {
        document.body.classList.add('motion-enabled');
        this.setupScrollAnimations();
        this.setupHoverAnimations();
        this.setupPageLoadAnimations();
        this.setupButtonAnimations();
        this.setupNatureMotion();
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
            button.addEventListener('pointerdown', (e) => {
                this.rippleEffect(e, button);
            });

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

        // Delegated fallback: guarantees ripples even if buttons are added later
        // or if individual listeners fail to attach for any reason.
        if (!window.__ecoRippleDelegate) {
            window.__ecoRippleDelegate = true;
            document.addEventListener('pointerdown', (e) => {
                const target = e.target;
                if (!target || !target.closest) return;
                const btn = target.closest('button, .habit-btn, .btn-primary, .btn-secondary');
                if (!btn) return;
                this.rippleEffect(e, btn);
            }, { capture: true });
        }
    }

    rippleEffect(event, element) {
        // Create ripple element
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        
        // Set ripple styles
        ripple.style.width = ripple.style.height = `${size}px`;

        const clientX = (event && typeof event.clientX === 'number') ? event.clientX : (rect.left + rect.width / 2);
        const clientY = (event && typeof event.clientY === 'number') ? event.clientY : (rect.top + rect.height / 2);

        ripple.style.left = `${clientX - rect.left - size/2}px`;
        ripple.style.top = `${clientY - rect.top - size/2}px`;
        ripple.classList.add('ripple');
        ripple.style.zIndex = '5';
        
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
        }, 1300);
    }

    setupNatureMotion() {
        // No confetti, no fireworks. Just calm satisfaction.
        // Keep backwards compatibility: if something calls showConfetti, do nothing.
        window.showConfetti = () => {};

        // Leaves drifting (enhance the existing .leaf elements if present)
        const leaves = document.querySelectorAll('.leaf-animation .leaf');
        leaves.forEach((leaf, idx) => {
            leaf.style.animationName = 'leafDrift';
            leaf.style.animationDuration = `${10 + idx * 3}s`;
            leaf.style.animationTimingFunction = 'ease-in-out';
            leaf.style.animationIterationCount = 'infinite';
            leaf.style.opacity = '0.6';
        });

        // Soft light pulses on cards
        const applyPulse = () => {
            document.querySelectorAll('.checkin-card, .progress-card').forEach(card => {
                card.classList.add('soft-pulse');
            });
        };
        requestAnimationFrame(applyPulse);

        // Progress ring bloom when progress screen becomes visible
        const progressSection = document.getElementById('progressSection');
        const ring = document.querySelector('.progress-ring');
        const ringCircle = document.querySelector('.progress-ring-circle');

        const bloom = () => {
            if (ring) {
                ring.classList.remove('ring-bloom');
                // force reflow
                void ring.offsetWidth;
                ring.classList.add('ring-bloom');
            }

            if (ringCircle) {
                ringCircle.style.transitionDuration = '2.8s';
            }
        };

        if (progressSection) {
            const observer = new MutationObserver(() => {
                const hidden = progressSection.classList.contains('hidden');
                if (!hidden) {
                    bloom();
                    applyPulse();
                }
            });
            observer.observe(progressSection, { attributes: true, attributeFilter: ['class'] });
        }

        // Re-apply pulses on navigation as sections toggle
        const dailyCheckin = document.getElementById('dailyCheckin');
        if (dailyCheckin) {
            const observer = new MutationObserver(() => {
                const hidden = dailyCheckin.classList.contains('hidden');
                if (!hidden) applyPulse();
            });
            observer.observe(dailyCheckin, { attributes: true, attributeFilter: ['class'] });
        }

        // Deterministic bloom: if progress is visible, ensure bloom class exists.
        if (!window.__ecoBloomInterval) {
            window.__ecoBloomInterval = setInterval(() => {
                const section = document.getElementById('progressSection');
                if (!section || section.classList.contains('hidden')) return;
                const ringNow = document.querySelector('.progress-ring');
                if (!ringNow) return;
                if (!ringNow.classList.contains('ring-bloom')) {
                    ringNow.classList.add('ring-bloom');
                }
            }, 800);
        }

        // Safety net: periodically re-apply pulses in case elements mount later.
        if (!window.__ecoPulseInterval) {
            window.__ecoPulseInterval = setInterval(applyPulse, 2500);
        }
    }
}

// Initialize animations when the DOM is fully loaded
const initEcoAnimations = () => {
    const ecoAnimations = new EcoAnimations();

    // Make available globally for debugging
    window.ecoAnimations = ecoAnimations;

    // Ensure the motion marker stays applied even if other code touches body classes.
    const ensureMotionClass = () => {
        if (document.body) document.body.classList.add('motion-enabled');
    };
    ensureMotionClass();
    setTimeout(ensureMotionClass, 0);
    setTimeout(ensureMotionClass, 250);
    setTimeout(ensureMotionClass, 1000);
    if (!window.__ecoMotionInterval) {
        window.__ecoMotionInterval = setInterval(ensureMotionClass, 3000);
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEcoAnimations);
} else {
    initEcoAnimations();
}

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

    @keyframes waterRipple {
        0% {
            transform: scale(0);
            opacity: 0.55;
        }
        100% {
            transform: scale(6.2);
            opacity: 0;
        }
    }

    @keyframes leafDrift {
        0%, 100% {
            transform: translate3d(0, 0, 0) rotate(-2deg);
        }
        50% {
            transform: translate3d(0, 42px, 0) rotate(4deg);
        }
    }

    @keyframes softPulse {
        0%, 100% {
            box-shadow: 0 18px 60px rgba(0, 0, 0, 0.55);
        }
        50% {
            box-shadow: 0 18px 60px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(56, 224, 122, 0.10), 0 0 26px rgba(56, 224, 122, 0.10);
        }
    }

    @keyframes ringBloom {
        0% {
            transform: scale(0.94);
            filter: blur(0px);
            opacity: 0.65;
        }
        100% {
            transform: scale(1);
            filter: blur(0px);
            opacity: 1;
        }
    }

    @keyframes ambientGlow {
        0%, 100% {
            opacity: 0.18;
            transform: translate3d(0, 0, 0) scale(1);
        }
        50% {
            opacity: 0.32;
            transform: translate3d(0, 0, 0) scale(1.03);
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
        background-color: rgba(56, 224, 122, 0.30);
        box-shadow: 0 0 0 1px rgba(56, 224, 122, 0.22), 0 0 18px rgba(56, 224, 122, 0.18);
        transform: scale(0);
        animation: waterRipple 1.2s ease-out;
        pointer-events: none;
        mix-blend-mode: screen;
    }
    
    .suggestion-update {
        animation: fadeIn 0.5s ease-out;
    }

    /* Ambient calm glow (helps you see motion even before clicking) */
    body.motion-enabled::before {
        content: '';
        position: fixed;
        inset: -20vh;
        pointer-events: none;
        z-index: 0;
        background:
            radial-gradient(700px 500px at 20% 20%, rgba(56, 224, 122, 0.12), transparent 60%),
            radial-gradient(900px 650px at 80% 30%, rgba(56, 224, 122, 0.10), transparent 65%),
            radial-gradient(850px 650px at 50% 95%, rgba(56, 224, 122, 0.08), transparent 60%);
        animation: ambientGlow 10s ease-in-out infinite;
    }

    .app-container {
        position: relative;
        z-index: 1;
    }

    .soft-pulse {
        animation: softPulse 6s ease-in-out infinite;
    }

    .ring-bloom {
        animation: ringBloom 2.2s ease-out both;
    }
`;

document.head.appendChild(style);
