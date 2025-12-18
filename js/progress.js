class EcoProgress {
    constructor() {
        this.badges = [
            { key: 'water_saver', emoji: '🌱', title: 'Water Saver', category: 'water' },
            { key: 'plastic_reducer', emoji: '🌍', title: 'Plastic Reducer', category: 'plastic' },
            { key: 'food_hero', emoji: '🍽', title: 'Food Hero', category: 'food' }
        ];

        this.initialize();
    }

    initialize() {
        this.ensureBadgesUI();
        this.updateBadgesUI();

        this.ensureLeaderboardUI();
        this.updateLeaderboardUI();

        // Update whenever progress view is shown
        const progressSection = document.getElementById('progressSection');
        if (progressSection) {
            const observer = new MutationObserver(() => {
                if (!progressSection.classList.contains('hidden')) {
                    this.ensureBadgesUI();
                    this.updateBadgesUI();

                    this.ensureLeaderboardUI();
                    this.updateLeaderboardUI();
                }
            });
            observer.observe(progressSection, { attributes: true, attributeFilter: ['class'] });
        }

        // Periodic refresh (covers late-loaded trackers)
        setInterval(() => {
            this.updateBadgesUI();
            this.updateLeaderboardUI();
        }, 1500);
    }

    canStore() {
        return !!window?.ethicsManager?.dataCollectionEnabled;
    }

    getSettings() {
        try {
            if (!this.canStore()) {
                return { badgesEnabled: false, suggestionsEnabled: false, leaderboardEnabled: false };
            }
            const raw = localStorage.getItem('ecoHabitSettings');
            const parsed = raw ? JSON.parse(raw) : {};
            return {
                badgesEnabled: parsed.badgesEnabled !== false,
                suggestionsEnabled: parsed.suggestionsEnabled !== false,
                leaderboardEnabled: parsed.leaderboardEnabled !== false
            };
        } catch {
            return { badgesEnabled: true, suggestionsEnabled: true, leaderboardEnabled: true };
        }
    }

    getDailyHistory() {
        if (!this.canStore()) return {};
        const d = window?.habitTracker?.daily;
        if (d && typeof d === 'object') return d;
        try {
            const raw = localStorage.getItem('habitData');
            const parsed = raw ? JSON.parse(raw) : null;
            return parsed?.daily && typeof parsed.daily === 'object' ? parsed.daily : {};
        } catch {
            return {};
        }
    }

    getDayScore(dayRecord) {
        if (!dayRecord) return 0;
        const w = !!dayRecord.water;
        const p = !!dayRecord.plastic;
        const f = !!dayRecord.food;
        return [w, p, f].filter(Boolean).length;
    }

    computeEarnedBadges() {
        const totals = window?.habitTracker?.getLightTotals?.();
        if (!totals) return [];

        const thresholds = {
            water: 3,
            plastic: 3,
            food: 3
        };

        return this.badges.filter(b => {
            const count = totals?.[b.category]?.count || 0;
            return count >= thresholds[b.category];
        });
    }

    ensureBadgesUI() {
        const progressCard = document.querySelector('#progressSection .progress-card');
        if (!progressCard) return;

        if (progressCard.querySelector('#badgesSection')) return;

        const wrap = document.createElement('div');
        wrap.id = 'badgesSection';
        wrap.className = 'badges-card';

        wrap.innerHTML = `
            <h3>Badges (private)</h3>
            <p class="badges-help">Optional, just for you.</p>
            <div class="badges-list" id="badgesList"></div>
            <p class="badges-disabled" id="badgesDisabled" style="display:none;">Badges are off right now. You can enable them in Transparency.</p>
        `;

        progressCard.appendChild(wrap);
    }

    updateBadgesUI() {
        const section = document.getElementById('badgesSection');
        if (!section) return;

        const list = document.getElementById('badgesList');
        const disabled = document.getElementById('badgesDisabled');
        if (!list || !disabled) return;

        const settings = this.getSettings();
        if (!settings.badgesEnabled) {
            list.innerHTML = '';
            disabled.style.display = 'block';
            return;
        }

        disabled.style.display = 'none';

        const earned = this.computeEarnedBadges();
        const earnedKeys = new Set(earned.map(b => b.key));

        list.innerHTML = this.badges
            .map(b => {
                const isEarned = earnedKeys.has(b.key);
                return `
                    <div class="badge ${isEarned ? 'badge--earned' : 'badge--locked'}" aria-label="${b.title}">
                        <span class="badge__emoji">${b.emoji}</span>
                        <span class="badge__title">${b.title}</span>
                        <span class="badge__state">${isEarned ? 'earned' : 'not yet'}</span>
                    </div>
                `;
            })
            .join('');
    }

    ensureLeaderboardUI() {
        const progressCard = document.querySelector('#progressSection .progress-card');
        if (!progressCard) return;

        if (progressCard.querySelector('#leaderboardSection')) return;

        const wrap = document.createElement('div');
        wrap.id = 'leaderboardSection';
        wrap.className = 'badges-card leaderboard-card';

        wrap.innerHTML = `
            <h3>Leaderboard</h3>
            <p class="badges-help">Private to this device. Your strongest days so far.</p>
            <div class="leaderboard-list" id="leaderboardList"></div>
            <p class="badges-disabled" id="leaderboardDisabled" style="display:none;">Leaderboard is off right now. You can enable it in Transparency.</p>
            <p class="badges-disabled" id="leaderboardNoData" style="display:none;">No history yet. Complete a few check-ins and come back.</p>
        `;

        progressCard.appendChild(wrap);
    }

    updateLeaderboardUI() {
        const section = document.getElementById('leaderboardSection');
        if (!section) return;

        const list = document.getElementById('leaderboardList');
        const disabled = document.getElementById('leaderboardDisabled');
        const noData = document.getElementById('leaderboardNoData');
        if (!list || !disabled || !noData) return;

        const settings = this.getSettings();
        if (!settings.leaderboardEnabled) {
            list.innerHTML = '';
            disabled.style.display = 'block';
            noData.style.display = 'none';
            return;
        }

        disabled.style.display = 'none';

        const daily = this.getDailyHistory();
        const days = Object.keys(daily || {});
        if (!days || days.length === 0) {
            list.innerHTML = '';
            noData.style.display = 'block';
            return;
        }

        const scored = days
            .map(day => ({ day, score: this.getDayScore(daily[day]) }))
            .filter(x => x.score > 0)
            .sort((a, b) => {
                if (b.score !== a.score) return b.score - a.score;
                return String(b.day).localeCompare(String(a.day));
            })
            .slice(0, 7);

        if (scored.length === 0) {
            list.innerHTML = '';
            noData.style.display = 'block';
            return;
        }

        noData.style.display = 'none';

        const medal = (idx) => (idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '');

        list.innerHTML = scored
            .map((row, idx) => {
                const scoreLabel = row.score === 3 ? 'full day' : row.score === 2 ? 'two habits' : 'one habit';
                return `
                    <div class="leaderboard-row">
                        <span class="leaderboard-rank">${idx + 1}${medal(idx) ? ' ' + medal(idx) : ''}</span>
                        <span class="leaderboard-day">${row.day}</span>
                        <span class="leaderboard-score">${row.score}/3 · ${scoreLabel}</span>
                    </div>
                `;
            })
            .join('');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.ecoProgress = new EcoProgress();
});
