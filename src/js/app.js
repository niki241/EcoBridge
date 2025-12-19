// DOM Elements
const consentOverlay = document.getElementById('consent-overlay');
const acceptConsentBtn = document.getElementById('accept-consent');
const declineConsentBtn = document.getElementById('decline-consent');
const dailyCheckinSection = document.getElementById('daily-checkin');
const aiSuggestionCard = document.getElementById('ai-suggestion');
const reflectionSection = document.getElementById('reflection');
const progressRingsContainer = document.getElementById('progress-rings');

// App State
let appState = {
    hasConsent: localStorage.getItem('hasConsent') === 'true',
    dailyCheckinCompleted: false,
    reflectionCompleted: false,
    progress: {
        habits: 40,  // Example progress values
        goals: 65,
        consistency: 30
    },
    mood: null,
    dailyGoal: ''
};

// AI Suggestions
const aiSuggestions = [
    "Try taking a 5-minute walk outside to refresh your mind and body.",
    "Consider drinking a glass of water to stay hydrated throughout the day.",
    "Take three deep breaths to center yourself and reduce stress.",
    "Write down three things you're grateful for today.",
    "Try the 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds."
];

// Initialize the app
function initApp() {
    // Check consent
    if (!appState.hasConsent) {
        showConsentOverlay();
    } else {
        startApp();
    }

    // Set up event listeners
    setupEventListeners();
}

// Show consent overlay
function showConsentOverlay() {
    consentOverlay.classList.remove('hidden');
}

// Hide consent overlay
function hideConsentOverlay() {
    consentOverlay.classList.add('hidden');
}

// Start the main application
function startApp() {
    hideConsentOverlay();
    initializeProgressRings();
    showDailyCheckin();
    
    // Show AI suggestion after a delay
    setTimeout(showRandomSuggestion, 3000);
}

// Set up event listeners
function setupEventListeners() {
    // Consent buttons
    acceptConsentBtn.addEventListener('click', () => {
        appState.hasConsent = true;
        localStorage.setItem('hasConsent', 'true');
        startApp();
    });

    declineConsentBtn.addEventListener('click', () => {
        // Handle decline (e.g., show a message or redirect)
        document.body.innerHTML = '<div class="consent-content"><h2>Consent Required</h2><p>This application requires your consent to continue. Please refresh the page if you change your mind.</p></div>';
    });

    // Mood selection
    const moodButtons = document.querySelectorAll('.mood-selector button');
    moodButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Remove active class from all buttons
            moodButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            e.target.classList.add('active');
            appState.mood = parseInt(e.target.dataset.mood);
        });
    });

    // Daily check-in form
    const checkinForm = document.getElementById('checkin-form');
    if (checkinForm) {
        checkinForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const dailyGoal = document.getElementById('daily-goal').value;
            appState.dailyGoal = dailyGoal;
            appState.dailyCheckinCompleted = true;
            
            // Update progress based on mood (simple example)
            if (appState.mood >= 4) {
                appState.progress.consistency = Math.min(100, appState.progress.consistency + 10);
            }
            
            updateProgressRings();
            showReflection();
        });
    }

    // Refresh suggestion button
    const refreshSuggestionBtn = document.getElementById('refresh-suggestion');
    if (refreshSuggestionBtn) {
        refreshSuggestionBtn.addEventListener('click', showRandomSuggestion);
    }

    // Dismiss suggestion button
    const dismissSuggestionBtn = document.getElementById('dismiss-suggestion');
    if (dismissSuggestionBtn) {
        dismissSuggestionBtn.addEventListener('click', () => {
            aiSuggestionCard.classList.add('hidden');
        });
    }

    // Reflection form
    const reflectionForm = document.getElementById('reflection-form');
    if (reflectionForm) {
        reflectionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const positiveReflection = document.getElementById('positive-reflection').value;
            const improvementReflection = document.getElementById('improvement-reflection').value;
            
            // Save reflection (in a real app, this would be sent to a server)
            console.log('Positive:', positiveReflection);
            console.log('Improvement:', improvementReflection);
            
            // Update progress
            appState.progress.habits = Math.min(100, appState.progress.habits + 5);
            appState.progress.goals = Math.min(100, appState.progress.goals + 3);
            updateProgressRings();
            
            // Show completion message
            reflectionSection.innerHTML = `
                <div class="text-center">
                    <h2>Thank you for your reflection!</h2>
                    <p>Your progress has been saved. Keep up the great work!</p>
                    <button id="start-new-day" class="btn btn-primary">Start a New Day</button>
                </div>
            `;
            
            // Add event listener for the new button
            document.getElementById('start-new-day').addEventListener('click', resetForNewDay);
        });
    }
}

// Show daily check-in
function showDailyCheckin() {
    // Reset form
    const moodButtons = document.querySelectorAll('.mood-selector button');
    moodButtons.forEach(btn => btn.classList.remove('active'));
    document.getElementById('daily-goal').value = '';
    appState.mood = null;
    
    // Show section
    dailyCheckinSection.classList.remove('hidden');
    aiSuggestionCard.classList.add('hidden');
    reflectionSection.classList.add('hidden');
    
    // Add fade-in effect
    setTimeout(() => {
        dailyCheckinSection.classList.add('fade-in');
    }, 10);
}

// Show reflection
function showReflection() {
    dailyCheckinSection.classList.add('hidden');
    aiSuggestionCard.classList.add('hidden');
    reflectionSection.classList.remove('hidden');
    
    // Reset form
    document.getElementById('positive-reflection').value = '';
    document.getElementById('improvement-reflection').value = '';
    
    // Add fade-in effect
    setTimeout(() => {
        reflectionSection.classList.add('fade-in');
    }, 10);
}

// Show random AI suggestion
function showRandomSuggestion() {
    const suggestionContent = document.getElementById('suggestion-content');
    const randomSuggestion = aiSuggestions[Math.floor(Math.random() * aiSuggestions.length)];
    
    suggestionContent.innerHTML = `<p>${randomSuggestion}</p>`;
    aiSuggestionCard.classList.remove('hidden');
    
    // Auto-dismiss after 10 seconds
    setTimeout(() => {
        if (!aiSuggestionCard.classList.contains('hidden')) {
            aiSuggestionCard.classList.add('fade-out');
            setTimeout(() => {
                aiSuggestionCard.classList.add('hidden');
                aiSuggestionCard.classList.remove('fade-out');
            }, 500);
        }
    }, 10000);
}

// Initialize progress rings
function initializeProgressRings() {
    progressRingsContainer.innerHTML = '';
    
    Object.entries(appState.progress).forEach(([key, value]) => {
        const ringContainer = document.createElement('div');
        ringContainer.className = 'progress-ring';
        ringContainer.innerHTML = `
            <svg class="progress-ring" width="120" height="120" viewBox="0 0 120 120">
                <circle class="progress-ring-bg" cx="60" cy="60" r="50" stroke-width="8" fill="none" />
                <circle class="progress-ring-fill" cx="60" cy="60" r="50" stroke-width="8" fill="none" 
                        stroke-dasharray="314" stroke-dashoffset="${314 * (1 - value / 100)}" />
            </svg>
            <div class="progress-ring-text">
                <div>${value}%</div>
                <div style="font-size: 0.8rem; font-weight: normal;">${key.charAt(0).toUpperCase() + key.slice(1)}</div>
            </div>
        `;
        progressRingsContainer.appendChild(ringContainer);
    });
}

// Update progress rings
function updateProgressRings() {
    const rings = document.querySelectorAll('.progress-ring-fill');
    let index = 0;
    
    Object.values(appState.progress).forEach(value => {
        if (rings[index]) {
            const offset = 314 * (1 - value / 100);
            rings[index].style.strokeDashoffset = offset;
            
            // Update text
            const textElement = rings[index].parentElement.nextElementSibling;
            if (textElement) {
                textElement.firstElementChild.textContent = `${value}%`;
            }
            
            index++;
        }
    });
}

// Reset for a new day
function resetForNewDay() {
    appState.dailyCheckinCompleted = false;
    appState.reflectionCompleted = false;
    showDailyCheckin();
}

// Start the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);
