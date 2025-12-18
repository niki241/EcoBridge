// UI Management for EcoHabit Coach
class EcoHabitUI {
    constructor() {
        this.elements = {
            welcome: document.getElementById('welcome'),
            dailyCheckin: document.getElementById('dailyCheckin'),
            progressSection: document.getElementById('progressSection'),
            startBtn: document.getElementById('startBtn'),
            submitCheckin: document.getElementById('submitCheckin'),
            backToCheckin: document.getElementById('backToCheckin'),
            currentDate: document.getElementById('currentDate'),
            consentBanner: document.getElementById('consentBanner'),
            acceptConsent: document.getElementById('acceptConsent'),
            declineConsent: document.getElementById('declineConsent'),
            learnMore: document.getElementById('learnMore')
        };
        
        this.initialize();
    }

    initialize() {
        this.setupEventListeners();
        this.applyCalmWelcomeCopy();
        this.updateCurrentDate();
        this.checkConsent();
    }

    applyCalmWelcomeCopy() {
        const welcome = this.elements.welcome;
        if (!welcome) return;

        const headline = welcome.querySelector('h1');
        const tagline = welcome.querySelector('.tagline');

        if (headline) {
            headline.textContent = "You’re already doing enough. Let’s do one thing more.";
        }

        if (tagline) {
            tagline.textContent = "EcoHabit Coach";
        }
    }

    setupEventListeners() {
        const { startBtn, submitCheckin, backToCheckin, acceptConsent, declineConsent, learnMore } = this.elements;
        
        // Welcome screen
        if (startBtn) {
            startBtn.addEventListener('click', () => this.showDailyCheckin());
        }
        
        // Check-in submission
        if (submitCheckin) {
            submitCheckin.addEventListener('click', () => this.completeDailyCheckin());
        }
        
        // Navigation
        if (backToCheckin) {
            backToCheckin.addEventListener('click', () => this.showDailyCheckin());
        }
        
        // Consent management
        if (acceptConsent) {
            acceptConsent.addEventListener('click', () => this.handleConsent(true));
        }
        
        if (declineConsent) {
            declineConsent.addEventListener('click', () => this.handleConsent(false));
        }
        
        if (learnMore) {
            learnMore.addEventListener('click', (e) => {
                e.preventDefault();
                this.showPrivacyInfo();
            });
        }
        
        // Habit button interactions
        const habitButtons = document.querySelectorAll('.habit-btn');
        habitButtons.forEach(button => {
            button.addEventListener('click', () => this.handleHabitButtonClick(button));
        });
    }

    updateCurrentDate() {
        if (this.elements.currentDate) {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            this.elements.currentDate.textContent = new Date().toLocaleDateString(undefined, options);
        }
    }

    showDailyCheckin() {
        this.toggleSection('welcome', false);
        this.toggleSection('dailyCheckin', true);
        this.toggleSection('progressSection', false);
    }

    showProgress() {
        this.toggleSection('welcome', false);
        this.toggleSection('dailyCheckin', false);
        this.toggleSection('progressSection', true);
        this.updateProgressUI();
        this.ensureReflectionPrompt();
    }

    toggleSection(sectionKey, show) {
        const section = this.elements[sectionKey];
        if (section) {
            section.classList.toggle('hidden', !show);
        }
    }

    completeDailyCheckin() {
        // In a real app, this would save the check-in data
        this.showProgress();
        this.showConfetti();
    }

    updateProgressUI() {
        // This would be connected to the habit tracker
        const progressElement = document.querySelector('.progress-ring-circle');
        const progressPercentage = document.getElementById('progressPercentage');
        
        if (progressElement && progressPercentage) {
            // Example: 75% progress
            const progress = 75;
            const circumference = 2 * Math.PI * 90; // 90 is the radius
            const offset = circumference - (progress / 100) * circumference;
            
            progressElement.style.strokeDashoffset = offset;

            // No percentages: just vibes.
            const vibes = [
                'gentle start',
                'steady energy',
                'soft glow',
                'in a good flow',
                'quiet momentum'
            ];
            const vibeIndex = Math.min(vibes.length - 1, Math.floor((progress / 100) * vibes.length));
            progressPercentage.textContent = vibes[vibeIndex];
        }
        
        // Update streak count
        const streakCount = document.getElementById('streakCount');
        if (streakCount) {
            // Example: 5 day streak
            streakCount.textContent = '5';
        }
    }

    ensureReflectionPrompt() {
        const progressCard = document.querySelector('#progressSection .progress-card');
        if (!progressCard) return;

        if (progressCard.querySelector('#reflectionPrompt')) return;

        const reflection = document.createElement('div');
        reflection.id = 'reflectionPrompt';
        reflection.className = 'reflection-card';

        reflection.innerHTML = `
            <h3>Reflection</h3>
            <p class="reflection-question">Which habit felt easiest today?</p>
            <textarea id="reflectionInput" rows="3" placeholder="A sentence is enough."></textarea>
            <button id="saveReflection" class="btn-secondary" type="button">Save</button>
        `;

        progressCard.appendChild(reflection);

        const saveBtn = reflection.querySelector('#saveReflection');
        const input = reflection.querySelector('#reflectionInput');

        if (saveBtn && input) {
            saveBtn.addEventListener('click', () => {
                localStorage.setItem('ecoHabitReflection', input.value || '');
                saveBtn.textContent = 'Saved';
            });

            const saved = localStorage.getItem('ecoHabitReflection');
            if (saved) input.value = saved;
        }
    }

    handleHabitButtonClick(button) {
        const category = button.dataset.category;
        const value = button.dataset.value;
        
        // Toggle active state
        button.classList.toggle('active');
        
        // In a real app, this would update the habit tracker
        console.log(`Toggled ${category}.${value}:`, button.classList.contains('active'));
    }

    showConfetti() {
        // Simple confetti effect
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        document.body.appendChild(confetti);
        
        // Remove after animation
        setTimeout(() => {
            confetti.remove();
        }, 3000);
    }

    checkConsent() {
        const hasConsent = localStorage.getItem('ecoHabitConsent');
        if (hasConsent === null && this.elements.consentBanner) {
            this.elements.consentBanner.style.display = 'flex';
        }
    }

    handleConsent(accepted) {
        if (accepted) {
            localStorage.setItem('ecoHabitConsent', 'true');
            // Initialize analytics or other services that require consent
        } else {
            localStorage.setItem('ecoHabitConsent', 'false');
        }
        
        if (this.elements.consentBanner) {
            this.elements.consentBanner.style.display = 'none';
        }
    }

    showPrivacyInfo() {
        // In a real app, this would show a modal or navigate to a privacy page
        if (document.getElementById('privacyModal')) return;

        const modal = document.createElement('div');
        modal.id = 'privacyModal';
        modal.className = 'calm-modal';

        modal.innerHTML = `
            <div class="calm-modal__backdrop" data-close="true"></div>
            <div class="calm-modal__panel" role="dialog" aria-modal="true" aria-label="Privacy information">
                <h3>Privacy</h3>
                <p>Privacy is important to us. We only collect data to improve your experience and never share it with third parties.</p>
                <p>You can change your preferences anytime in settings.</p>
                <button class="btn-secondary" type="button" data-close="true">Close</button>
            </div>
        `;

        document.body.appendChild(modal);

        const close = () => modal.remove();
        modal.addEventListener('click', (e) => {
            const target = e.target;
            if (target && target.dataset && target.dataset.close === 'true') {
                close();
            }
        });

        document.addEventListener('keydown', function onKeyDown(e) {
            if (e.key === 'Escape') {
                document.removeEventListener('keydown', onKeyDown);
                close();
            }
        });
    }
}

// Initialize the UI when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const ecoHabitUI = new EcoHabitUI();
    
    // Example of how to use the UI manager
    // ecoHabitUI.showDailyCheckin();
    
    // Make it available globally for debugging
    window.ecoHabitUI = ecoHabitUI;
});

// Fallback: ensure Get Started always navigates even if other UI setup breaks
document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('startBtn');
    const welcome = document.getElementById('welcome');
    const dailyCheckin = document.getElementById('dailyCheckin');
    const progressSection = document.getElementById('progressSection');

    if (!startBtn || !welcome || !dailyCheckin) return;

    startBtn.addEventListener('click', () => {
        welcome.classList.add('hidden');
        dailyCheckin.classList.remove('hidden');
        if (progressSection) progressSection.classList.add('hidden');
    });
});

// Add some basic animations
function animateElements() {
    // Add animation to habit buttons on page load
    const habitButtons = document.querySelectorAll('.habit-btn');
    habitButtons.forEach((button, index) => {
        button.style.animationDelay = `${index * 0.1}s`;
        button.classList.add('animate-in');
    });
}

// Call animations when the page loads
window.addEventListener('load', animateElements);
