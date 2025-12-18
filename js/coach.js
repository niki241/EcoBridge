// AI Coach - Provides personalized suggestions and adapts to user behavior
class EcoCoach {
    constructor() {
        this.userProfile = this.loadUserProfile();
        this.suggestions = this.buildSuggestionBank();
        this.currentSuggestion = null;
        this.initialize();
    }

    initialize() {
        this.ensureDefaults();
        this.displayNextSuggestion();
    }

    loadUserProfile() {
        // Load or create user profile from localStorage
        if (!window?.ethicsManager?.dataCollectionEnabled) {
            return {
                level: 0,
                softMode: 0,
                successStreak: 0,
                skipStreak: 0,
                overwhelmCooldownUntil: null,
                lastCategory: null,
                lastSuggestionId: null
            };
        }

        const savedProfile = localStorage.getItem('ecoCoachProfile');
        return savedProfile ? JSON.parse(savedProfile) : {
            level: 0,
            softMode: 0,
            successStreak: 0,
            skipStreak: 0,
            overwhelmCooldownUntil: null,
            lastCategory: null,
            lastSuggestionId: null
        };
    }

    ensureDefaults() {
        if (typeof this.userProfile.level !== 'number') this.userProfile.level = 0;
        if (typeof this.userProfile.softMode !== 'number') this.userProfile.softMode = 0;
        if (typeof this.userProfile.successStreak !== 'number') this.userProfile.successStreak = 0;
        if (typeof this.userProfile.skipStreak !== 'number') this.userProfile.skipStreak = 0;
        if (!('overwhelmCooldownUntil' in this.userProfile)) this.userProfile.overwhelmCooldownUntil = null;
        if (!('lastCategory' in this.userProfile)) this.userProfile.lastCategory = null;
        if (!('lastSuggestionId' in this.userProfile)) this.userProfile.lastSuggestionId = null;
        this.saveUserProfile();
    }

    saveUserProfile() {
        if (!window?.ethicsManager?.dataCollectionEnabled) return;
        localStorage.setItem('ecoCoachProfile', JSON.stringify(this.userProfile));
    }

    suggestionsEnabled() {
        if (!window?.ethicsManager?.dataCollectionEnabled) return false;
        try {
            const raw = localStorage.getItem('ecoHabitSettings');
            const parsed = raw ? JSON.parse(raw) : {};
            return parsed.suggestionsEnabled !== false;
        } catch {
            return true;
        }
    }

    buildSuggestionBank() {
        return {
            soften: [
                { id: 'soft-notice', text: 'Just notice one eco-choice you make today, with zero pressure.' },
                { id: 'soft-one-kind', text: 'Do one small kind thing for the planet today—any one thing counts.' },
                { id: 'soft-breathe', text: 'Take a slow breath and pick one tiny eco-action that feels easy today.' }
            ],
            water: {
                0: [
                    { id: 'w-0-1', text: 'Turn off the tap while brushing your teeth today.' },
                    { id: 'w-0-2', text: 'Keep your shower one minute shorter today.' },
                    { id: 'w-0-3', text: 'Run water only when you actually need it today.' }
                ],
                1: [
                    { id: 'w-1-1', text: 'Choose one water-saving moment today and repeat it once more.' },
                    { id: 'w-1-2', text: 'Try a quick shower timer today and stop when it rings.' },
                    { id: 'w-1-3', text: 'Wash dishes with the tap off between rinses today.' }
                ],
                2: [
                    { id: 'w-2-1', text: 'Pick one daily water habit and make it your default for a week.' },
                    { id: 'w-2-2', text: 'Do a two-minute “leak check” on one faucet today.' },
                    { id: 'w-2-3', text: 'Use a bucket/bowl once today instead of running water continuously.' }
                ]
            },
            plastic: {
                0: [
                    { id: 'p-0-1', text: 'Refuse one single-use plastic item today.' },
                    { id: 'p-0-2', text: 'Carry a reusable bottle today if you can.' },
                    { id: 'p-0-3', text: 'Say “no bag” once today if you don’t need it.' }
                ],
                1: [
                    { id: 'p-1-1', text: 'Choose one purchase today and pick the lower-plastic option.' },
                    { id: 'p-1-2', text: 'Keep a reusable bag by the door today for next time.' },
                    { id: 'p-1-3', text: 'Swap one snack for a less-packaged option today.' }
                ],
                2: [
                    { id: 'p-2-1', text: 'Make one “reusables kit” item part of your daily carry today.' },
                    { id: 'p-2-2', text: 'Avoid plastic for one item today, even if it’s slightly inconvenient.' },
                    { id: 'p-2-3', text: 'Choose one refill/reuse option today instead of buying new plastic.' }
                ]
            },
            food: {
                0: [
                    { id: 'f-0-1', text: 'Save one leftover portion today for tomorrow.' },
                    { id: 'f-0-2', text: 'Check your fridge once today before buying more food.' },
                    { id: 'f-0-3', text: 'Eat the most perishable item you have today.' }
                ],
                1: [
                    { id: 'f-1-1', text: 'Plan one meal today around what you already have.' },
                    { id: 'f-1-2', text: 'Freeze one item today that you might not finish in time.' },
                    { id: 'f-1-3', text: 'Make one “use-it-up” snack today from leftovers or scraps.' }
                ],
                2: [
                    { id: 'f-2-1', text: 'Create one simple rule today that prevents food waste for you.' },
                    { id: 'f-2-2', text: 'Do a two-minute pantry check today and note what to finish first.' },
                    { id: 'f-2-3', text: 'Use a “leftovers first” lunch today and make it a habit.' }
                ]
            }
        };
    }

    isInOverwhelmCooldown() {
        if (!this.userProfile.overwhelmCooldownUntil) return false;
        return Date.now() < new Date(this.userProfile.overwhelmCooldownUntil).getTime();
    }

    getOverwhelmScoreFromHabits() {
        try {
            const summary = window?.habitTracker?.getTodaySummary?.();
            if (!summary) return 0;

            const mood = String(summary.mood || '').toLowerCase();
            const signals = Array.isArray(summary.overwhelmSignals) ? summary.overwhelmSignals : [];

            let score = 0;
            if (mood === 'overwhelmed' || mood === 'stressed' || mood === 'tired') score += 2;
            if (signals.length > 0) score += 1;
            return score;
        } catch {
            return 0;
        }
    }

    pickCategory() {
        const categories = ['water', 'plastic', 'food'];
        const last = this.userProfile.lastCategory;
        const options = categories.filter(c => c !== last);
        return options[Math.floor(Math.random() * options.length)];
    }

    pickFrom(list, avoidId) {
        if (!Array.isArray(list) || list.length === 0) return null;
        const filtered = avoidId ? list.filter(s => s.id !== avoidId) : list;
        const pool = filtered.length > 0 ? filtered : list;
        return pool[Math.floor(Math.random() * pool.length)];
    }

    getMicroSuggestion() {
        const overwhelmScore = this.getOverwhelmScoreFromHabits();
        const shouldSoften = this.isInOverwhelmCooldown() || this.userProfile.softMode > 0 || overwhelmScore >= 2;

        if (shouldSoften) {
            const s = this.pickFrom(this.suggestions.soften, this.userProfile.lastSuggestionId);
            return { ...s, category: 'soften', level: 0 };
        }

        const category = this.pickCategory();
        const level = Math.max(0, Math.min(2, this.userProfile.level));
        const s = this.pickFrom(this.suggestions[category][level], this.userProfile.lastSuggestionId);
        return { ...s, category, level };
    }

    respond(outcome) {
        // outcome: 'skip' | 'success' | 'overwhelmed'
        const o = String(outcome || '').toLowerCase();

        if (o === 'overwhelmed') {
            this.userProfile.level = 0;
            this.userProfile.softMode = Math.min(3, this.userProfile.softMode + 2);
            this.userProfile.successStreak = 0;
            this.userProfile.skipStreak = 0;
            this.userProfile.overwhelmCooldownUntil = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
            try {
                window?.habitTracker?.addOverwhelmSignal?.('user_marked_overwhelmed');
                window?.habitTracker?.setMood?.('overwhelmed');
            } catch {}
        } else if (o === 'success') {
            this.userProfile.successStreak += 1;
            this.userProfile.skipStreak = 0;
            this.userProfile.softMode = Math.max(0, this.userProfile.softMode - 1);
            if (this.userProfile.successStreak >= 3) {
                this.userProfile.level = Math.min(2, this.userProfile.level + 1);
                this.userProfile.successStreak = 0;
            }
        } else {
            // skip or unknown: soften next suggestions, no failure state
            this.userProfile.skipStreak += 1;
            this.userProfile.successStreak = 0;
            this.userProfile.softMode = Math.min(3, this.userProfile.softMode + 1);
            if (this.userProfile.skipStreak >= 2) {
                this.userProfile.level = Math.max(0, this.userProfile.level - 1);
                this.userProfile.skipStreak = 0;
            }
        }

        this.saveUserProfile();
        this.displayNextSuggestion();
    }

    displayNextSuggestion() {
        if (!this.suggestionsEnabled()) {
            const suggestionElement = document.getElementById('aiSuggestion');
            if (suggestionElement) {
                suggestionElement.textContent = 'Suggestions are off. You can enable them in Transparency.';
            }
            return;
        }
        const suggestion = this.getMicroSuggestion();
        if (!suggestion) return;
        this.currentSuggestion = suggestion;
        this.userProfile.lastCategory = suggestion.category;
        this.userProfile.lastSuggestionId = suggestion.id;
        this.saveUserProfile();
        this.displaySuggestion(suggestion);
    }

    displaySuggestion(suggestion) {
        const suggestionElement = document.getElementById('aiSuggestion');
        if (suggestionElement) {
            // Add animation class
            suggestionElement.classList.add('suggestion-update');
            
            // Update text after a short delay for animation
            setTimeout(() => {
                suggestionElement.textContent = suggestion.text;
                // Remove animation class after it completes
                setTimeout(() => {
                    suggestionElement.classList.remove('suggestion-update');
                }, 500);
            }, 300);
        }
    }
}

// Initialize the coach
export const ecoCoach = new EcoCoach();

// Display initial suggestion when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Show initial suggestion
    ecoCoach.displayNextSuggestion();

    const suggestionEl = document.getElementById('aiSuggestion');
    if (suggestionEl) {
        // Skip = soften next suggestion (no penalty)
        suggestionEl.addEventListener('click', () => {
            ecoCoach.respond('skip');
        });

        // Mark overwhelm signals (gentler suggestions + cooldown)
        suggestionEl.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            ecoCoach.respond('overwhelmed');
        });
    }

    const submit = document.getElementById('submitCheckin');
    if (submit) {
        submit.addEventListener('click', () => {
            ecoCoach.respond('success');
        });
    }
});
