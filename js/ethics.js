// Ethics & Privacy Management for EcoHabit Coach
class EthicsManager {
    constructor() {
        this.consentGiven = false;
        this.dataCollectionEnabled = false;
        this.analyticsEnabled = false;
        this.initialize();
    }

    initialize() {
        this.loadConsent();
        this.setupEventListeners();
    }

    loadConsent() {
        // Check if user has given consent
        const consent = localStorage.getItem('ecoHabitConsent');
        
        if (consent === 'true') {
            this.consentGiven = true;
            this.dataCollectionEnabled = true;
            this.analyticsEnabled = true;
            this.initializeAnalytics();
        } else if (consent === 'false') {
            this.consentGiven = true;
            this.dataCollectionEnabled = false;
            this.analyticsEnabled = false;
        }
        // If consent is null, show the consent banner
    }

    setupEventListeners() {
        // Consent banner buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('#acceptConsent, #acceptConsent *')) {
                this.handleConsent(true);
            } else if (e.target.matches('#declineConsent, #declineConsent *')) {
                this.handleConsent(false);
            } else if (e.target.matches('#learnMore, #learnMore *')) {
                e.preventDefault();
                this.showTransparencyScreen();
            }
        });
    }

    handleConsent(given) {
        this.consentGiven = true;
        this.dataCollectionEnabled = given;
        this.analyticsEnabled = given;
        
        // Save user preference
        localStorage.setItem('ecoHabitConsent', given.toString());
        
        // Hide the consent banner
        const consentBanner = document.getElementById('consentBanner');
        if (consentBanner) {
            consentBanner.style.display = 'none';
        }
        
        // Initialize analytics if consent was given
        if (given) {
            this.initializeAnalytics();
        } else {
            try {
                localStorage.removeItem('habitData');
                localStorage.removeItem('ecoCoachProfile');
                localStorage.removeItem('ecoHabitSettings');
                localStorage.removeItem('ecoHabitReflection');
            } catch {}
        }
        
        // Dispatch event for other components
        document.dispatchEvent(new CustomEvent('consentUpdated', { 
            detail: { consentGiven: given } 
        }));
    }

    initializeAnalytics() {
        if (!this.analyticsEnabled) return;
        
        // In a real app, this would initialize analytics services
        console.log('Analytics initialized with user consent');
        
        // Example: Initialize analytics with anonymized data
        this.trackEvent('app', 'consent_given');
    }

    trackEvent(category, action, label = '', value = null) {
        if (!this.analyticsEnabled) return;
        
        // In a real app, this would send data to your analytics service
        console.log(`[Analytics] Event: ${category}.${action}`, { label, value });
        
        // Example of how you might track events
        const eventData = {
            category,
            action,
            label,
            value,
            timestamp: new Date().toISOString(),
            // Add any additional context here
        };
        
        // In a real app, you would send this to your analytics service
        // this.sendToAnalytics(eventData);
    }

    showPrivacyPolicy() {
        // In a real app, this would show a modal or navigate to a privacy policy page
        const privacyHTML = `
            <div class="privacy-modal">
                <h2>Privacy Policy</h2>
                <p>At EcoHabit Coach, we take your privacy seriously. Here's how we handle your data:</p>
                
                <h3>Data We Collect</h3>
                <ul>
                    <li>Habit completion data (only what you log)</li>
                    <li>App usage statistics (to improve the app)</li>
                    <li>Device information (anonymized)</li>
                </ul>
                
                <h3>How We Use Your Data</h3>
                <ul>
                    <li>To provide personalized suggestions</li>
                    <li>To improve our app's features</li>
                    <li>For anonymous analytics</li>
                </ul>
                
                <h3>We Never</h3>
                <ul>
                    <li>Sell your data to third parties</li>
                    <li>Share personally identifiable information without consent</li>
                    <li>Use your data for advertising</li>
                </ul>
                
                <p>You can change your privacy settings at any time in the app settings.</p>
                
                <button id="closePrivacy" class="btn-primary">Close</button>
            </div>
        `;
        
        // Create and show modal
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = privacyHTML;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 2000;
                padding: 20px;
                animation: fadeIn 0.3s ease-out;
            }
            
            .privacy-modal {
                background: white;
                padding: 2rem;
                border-radius: 12px;
                max-width: 600px;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            }
            
            .privacy-modal h2 {
                color: #2E7D32;
                margin-bottom: 1.5rem;
            }
            
            .privacy-modal h3 {
                color: #1B5E20;
                margin: 1.5rem 0 0.8rem;
            }
            
            .privacy-modal ul {
                margin: 0.5rem 0 1.5rem 1.5rem;
            }
            
            .privacy-modal li {
                margin-bottom: 0.5rem;
            }
            
            #closePrivacy {
                margin-top: 1.5rem;
                width: 100%;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
        `;
        
        // Add close functionality
        modal.querySelector('#closePrivacy').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        // Close when clicking outside the modal
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
        
        // Add to document
        document.head.appendChild(style);
        document.body.appendChild(modal);
    }

    getSettings() {
        try {
            if (!this.dataCollectionEnabled) {
                return { suggestionsEnabled: false, badgesEnabled: false, leaderboardEnabled: false };
            }
            const raw = localStorage.getItem('ecoHabitSettings');
            const parsed = raw ? JSON.parse(raw) : {};
            return {
                suggestionsEnabled: parsed.suggestionsEnabled !== false,
                badgesEnabled: parsed.badgesEnabled !== false,
                leaderboardEnabled: parsed.leaderboardEnabled !== false
            };
        } catch {
            return { suggestionsEnabled: true, badgesEnabled: true, leaderboardEnabled: true };
        }
    }

    setSettings(next) {
        if (!this.dataCollectionEnabled) return;
        try {
            localStorage.setItem('ecoHabitSettings', JSON.stringify({
                suggestionsEnabled: next?.suggestionsEnabled !== false,
                badgesEnabled: next?.badgesEnabled !== false,
                leaderboardEnabled: next?.leaderboardEnabled !== false
            }));
        } catch {}
    }

    showTransparencyScreen() {
        if (document.getElementById('transparencyModal')) return;

        const settings = this.getSettings();

        const modal = document.createElement('div');
        modal.id = 'transparencyModal';
        modal.className = 'calm-modal';

        const disabledAttr = this.dataCollectionEnabled ? '' : 'disabled';
        const checkedSuggestions = settings.suggestionsEnabled ? 'checked' : '';
        const checkedBadges = settings.badgesEnabled ? 'checked' : '';
        const checkedLeaderboard = settings.leaderboardEnabled ? 'checked' : '';

        modal.innerHTML = `
            <div class="calm-modal__backdrop" data-close="true"></div>
            <div class="calm-modal__panel" role="dialog" aria-modal="true" aria-label="Transparency">
                <h3>Full transparency</h3>
                <div class="transparency-lines">
                    <div class="transparency-line"><strong>Data stays local</strong><span>Everything lives in your browser on this device.</span></div>
                    <div class="transparency-line"><strong>Suggestions optional</strong><span>You can turn them off anytime.</span></div>
                    <div class="transparency-line"><strong>Nothing is tracked without consent</strong><span>If you decline, we won’t store anything.</span></div>
                    <div class="transparency-line"><strong>No public leaderboards</strong><span>Leaderboards are private to this device only.</span></div>
                </div>

                <div class="transparency-toggles">
                    <label class="transparency-toggle">
                        <input id="toggleSuggestions" type="checkbox" ${checkedSuggestions} ${disabledAttr} />
                        <span>Suggestions</span>
                    </label>
                    <label class="transparency-toggle">
                        <input id="toggleBadges" type="checkbox" ${checkedBadges} ${disabledAttr} />
                        <span>Badges (private)</span>
                    </label>
                    <label class="transparency-toggle">
                        <input id="toggleLeaderboard" type="checkbox" ${checkedLeaderboard} ${disabledAttr} />
                        <span>Leaderboard (private)</span>
                    </label>
                </div>

                <div class="transparency-actions">
                    <button class="btn-secondary" type="button" data-close="true">Close</button>
                </div>
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

        const suggestionsEl = modal.querySelector('#toggleSuggestions');
        const badgesEl = modal.querySelector('#toggleBadges');
        const leaderboardEl = modal.querySelector('#toggleLeaderboard');

        const persist = () => {
            const next = {
                suggestionsEnabled: !!suggestionsEl?.checked,
                badgesEnabled: !!badgesEl?.checked,
                leaderboardEnabled: !!leaderboardEl?.checked
            };
            this.setSettings(next);
            document.dispatchEvent(new CustomEvent('ecoSettingsUpdated', { detail: next }));
        };

        if (suggestionsEl) suggestionsEl.addEventListener('change', persist);
        if (badgesEl) badgesEl.addEventListener('change', persist);
        if (leaderboardEl) leaderboardEl.addEventListener('change', persist);
    }

    // Data anonymization helper
    anonymizeData(data) {
        if (!this.dataCollectionEnabled) return null;
        
        // In a real app, this would properly anonymize user data
        return {
            ...data,
            userId: this.hashString(data.userId || ''),
            timestamp: new Date().toISOString()
        };
    }
    
    // Simple string hashing for anonymization
    hashString(str) {
        let hash = 0;
        if (str.length === 0) return hash.toString();
        
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        
        return 'user_' + Math.abs(hash).toString(16);
    }
}

export const ethicsManager = new EthicsManager();
window.ethicsManager = ethicsManager;
