// Habit tracking and management
class HabitTracker {
    constructor() {
        this.habits = {
            water: { count: 0, lastTrackedDay: null },
            plastic: { count: 0, lastTrackedDay: null },
            food: { count: 0, lastTrackedDay: null }
        };
        this.today = this.getTodayKey();
        this.daily = {
            [this.today]: {
                water: false,
                plastic: false,
                food: false,
                mood: null,
                overwhelmSignals: []
            }
        };
        this.initialize();
    }

    initialize() {
        this.loadFromStorage();
        this.ensureToday();
    }

    getTodayKey() {
        return new Date().toISOString().slice(0, 10);
    }

    ensureToday() {
        const today = this.getTodayKey();
        this.today = today;
        if (!this.daily[today]) {
            this.daily[today] = {
                water: false,
                plastic: false,
                food: false,
                mood: null,
                overwhelmSignals: []
            };
        }
    }

    track(category) {
        this.ensureToday();
        if (!this.habits[category]) return false;

        this.habits[category].count += 1;
        this.habits[category].lastTrackedDay = this.today;
        this.daily[this.today][category] = true;
        this.saveToStorage();
        return true;
    }

    setMood(mood) {
        this.ensureToday();
        if (!mood) return false;
        this.daily[this.today].mood = mood;
        this.saveToStorage();
        return true;
    }

    addOverwhelmSignal(signal) {
        this.ensureToday();
        if (!signal) return false;
        this.daily[this.today].overwhelmSignals.push({
            signal,
            at: new Date().toISOString()
        });
        this.saveToStorage();
        return true;
    }

    getTodaySummary() {
        this.ensureToday();
        const d = this.daily[this.today];
        return {
            day: this.today,
            categories: {
                water: !!d.water,
                plastic: !!d.plastic,
                food: !!d.food
            },
            mood: d.mood,
            overwhelmSignals: Array.isArray(d.overwhelmSignals) ? d.overwhelmSignals : []
        };
    }

    getLightTotals() {
        return {
            water: { ...this.habits.water },
            plastic: { ...this.habits.plastic },
            food: { ...this.habits.food }
        };
    }

    getDailyProgress() {
        this.ensureToday();
        const d = this.daily[this.today];
        const completed = [d.water, d.plastic, d.food].filter(Boolean).length;
        const total = 3;
        return {
            completed,
            total,
            percentage: Math.round((completed / total) * 100)
        };
    }

    saveToStorage() {
        localStorage.setItem('habitData', JSON.stringify({
            habits: this.habits,
            daily: this.daily
        }));
    }

    loadFromStorage() {
        const savedHabits = localStorage.getItem('habitData');
        
        if (savedHabits) {
            const parsed = JSON.parse(savedHabits);
            if (parsed?.habits) this.habits = parsed.habits;
            if (parsed?.daily) this.daily = parsed.daily;
        }
    }

    resetDailyHabits() {
        // This would be called at the start of a new day
        // Implementation would reset daily tracking while preserving historical data
    }
}

// Initialize habit tracker
export const habitTracker = new HabitTracker();

// Expose for other modules that read from window
window.habitTracker = habitTracker;

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const habitButtons = document.querySelectorAll('.habit-btn');
    
    habitButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.dataset.category;
            const habit = this.dataset.value;
            
            // Toggle active state
            this.classList.toggle('active');
            
            // Log the habit
            if (this.classList.contains('active')) {
                habitTracker.track(category);
            }
            
            // Update UI
            updateProgressUI();
        });
    });
});

// Update progress UI elements
function updateProgressUI() {
    const progress = habitTracker.getDailyProgress();
    const progressRing = document.querySelector('.progress-ring-circle');
    const progressPercentage = document.getElementById('progressPercentage');
    const streakCount = document.getElementById('streakCount');
    
    if (progressRing && progressPercentage) {
        const circumference = 2 * Math.PI * 90; // 90 is the radius
        const offset = circumference - (progress.percentage / 100) * circumference;
        
        progressRing.style.strokeDashoffset = offset;
        progressPercentage.textContent = `${progress.percentage}%`;
    }
    
    if (streakCount) {
        streakCount.textContent = '';
    }
}

// Initialize UI on page load
updateProgressUI();
