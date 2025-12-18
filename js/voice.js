// Voice check-ins for EcoHabit Coach
// Uses Web Speech APIs when available:
// - SpeechRecognition / webkitSpeechRecognition for input
// - speechSynthesis for output

class EcoHabitVoice {
    constructor(options = {}) {
        this.options = {
            lang: 'en-US',
            speakResponses: true,
            ...options
        };

        this.recognition = null;
        this.isListening = false;

        this.state = {
            lastReply: '',
            lastIntentKey: null,
            pendingPrompt: null
        };

        this._initRecognition();
        this._autoWireIfPresent();
    }

    _initRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        this.recognition = new SpeechRecognition();
        this.recognition.lang = this.options.lang;
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 1;

        this.recognition.onstart = () => {
            this.isListening = true;
            this._emit('voice:listening', { listening: true });
        };

        this.recognition.onend = () => {
            this.isListening = false;
            this._emit('voice:listening', { listening: false });
        };

        this.recognition.onerror = (event) => {
            const err = event?.error;
            let message;

            if (err === 'not-allowed' || err === 'service-not-allowed') {
                message = "I can’t access your microphone right now. If you want, allow microphone access for localhost and we’ll try again.";
            } else if (err === 'audio-capture') {
                message = "I can’t find a working microphone right now. If you have one connected, try selecting it in your browser/system audio settings.";
            } else if (err === 'no-speech') {
                message = "I didn’t hear anything—no worries. Try speaking a little closer to the mic, then tap ‘Talk to your coach’ again.";
            } else if (err === 'network') {
                message = "Voice recognition needs a network connection in this browser. If your internet is spotty, we can try again in a moment.";
            } else if (err === 'aborted') {
                message = "All good—voice check-in stopped. Tap ‘Talk to your coach’ whenever you want to try again.";
            } else {
                message = "Something didn’t work with voice input. We can try again whenever you’re ready.";
            }

            this._emit('voice:error', { error: err, message });
            this.respond(message);
        };

        this.recognition.onresult = (event) => {
            const transcript = event?.results?.[0]?.[0]?.transcript || '';
            const confidence = event?.results?.[0]?.[0]?.confidence;

            const parsed = this.parseCheckin(transcript);
            const reply = this.composeGentleReply(parsed);

            this._emit('voice:checkin', { transcript, confidence, parsed, reply });
            this.respond(reply);
        };
    }

    _pickVaried(options) {
        if (!Array.isArray(options) || options.length === 0) return '';
        if (options.length === 1) return options[0];

        let choice = options[Math.floor(Math.random() * options.length)];
        if (choice === this.state.lastReply) {
            choice = options[(options.indexOf(choice) + 1) % options.length];
        }
        return choice;
    }

    _autoWireIfPresent() {
        // Optional wiring. If you add these elements later, it will just work.
        // - #voiceStartBtn: starts listening
        // - #voiceTranscript: displays what was heard
        // - #voiceResponse: displays the response
        const startBtn = document.getElementById('voiceStartBtn');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.start());
        }

        const statusEl = document.getElementById('voiceStatus');
        const transcriptEl = document.getElementById('voiceTranscript');
        const responseEl = document.getElementById('voiceResponse');

        const setStatus = (text, mode) => {
            if (!statusEl) return;
            statusEl.textContent = text;
            statusEl.dataset.mode = mode || '';
        };

        if (statusEl) {
            setStatus('Not listening', 'idle');
        }

        document.addEventListener('voice:listening', (e) => {
            const listening = !!(e.detail && e.detail.listening);
            if (listening) {
                setStatus('Listening…', 'listening');
                if (startBtn) startBtn.textContent = 'Listening…';
                if (startBtn) startBtn.disabled = true;
            } else {
                setStatus('Not listening', 'idle');
                if (startBtn) startBtn.textContent = 'Talk to your coach';
                if (startBtn) startBtn.disabled = false;
            }
        });

        document.addEventListener('voice:checkin', (e) => {
            const detail = e.detail || {};
            if (transcriptEl) transcriptEl.textContent = detail.transcript || '—';
            if (responseEl) responseEl.textContent = detail.reply || '—';
        });

        document.addEventListener('voice:response', (e) => {
            const detail = e.detail || {};
            if (responseEl && detail.text) responseEl.textContent = detail.text;
        });

        document.addEventListener('voice:error', (e) => {
            const detail = e.detail || {};
            setStatus('Not listening', 'idle');
            if (responseEl && detail.message) responseEl.textContent = detail.message;
        });

        document.addEventListener('voice:unsupported', (e) => {
            const detail = e.detail || {};
            setStatus('Voice not available here', 'unsupported');
            if (responseEl && detail.message) responseEl.textContent = detail.message;
        });

        if (startBtn && responseEl && !this.recognition) {
            startBtn.disabled = true;
            responseEl.textContent = "Voice check-ins aren’t supported in this browser. You can still type your check-in.";
            setStatus('Voice not supported', 'unsupported');
        }
    }

    _emit(type, detail) {
        document.dispatchEvent(new CustomEvent(type, { detail }));
    }

    start() {
        if (!this.recognition) {
            const msg = "Voice check-ins aren’t supported in this browser. You can still type your check-in.";
            this._emit('voice:unsupported', { message: msg });
            this.respond(msg);
            return;
        }

        if (this.isListening) return;
        try {
            this.recognition.start();
        } catch {
            // Avoid throwing if start is called too quickly.
        }
    }

    stop() {
        if (!this.recognition || !this.isListening) return;
        try {
            this.recognition.stop();
        } catch {
            // ignore
        }
    }

    parseCheckin(rawText) {
        const text = (rawText || '').trim();
        const normalized = text.toLowerCase();

        // Very lightweight intent extraction: we’re not judging, only recognizing.
        const intents = [];

        const shower = /(short(er)? shower|took a shorter shower|took shorter shower|short shower)/;
        const reuseFood = /(reused (food|leftovers)|ate leftovers|used leftovers|saved leftovers)/;

        if (shower.test(normalized)) intents.push({ key: 'shorter_shower', label: 'shorter shower' });
        if (reuseFood.test(normalized)) intents.push({ key: 'reused_food', label: 'reused food' });

        // Generic “I did X” pattern.
        const didSomething = /^(i\s+)(did|took|reused|used|ate|made|tried)\b/.test(normalized);

        return {
            text,
            normalized,
            intents,
            didSomething,
            isEmpty: text.length === 0
        };
    }

    composeGentleReply(parsed) {
        if (!parsed || parsed.isEmpty) {
            return "I didn’t catch that—no worries. Want to try once more?";
        }

        const normalized = parsed.normalized || '';

        // If we asked a question previously and the user is answering, respond warmly and keep it flowing.
        if (this.state.pendingPrompt) {
            const followups = [
                "Thank you for sharing that.",
                "That makes sense.",
                "I hear you.",
                "Got it. That’s helpful."
            ];
            const next = [
                "Want to do one more tiny thing today—or keep it gentle?",
                "Do you want a small suggestion for tomorrow?",
                "Would you like to name one thing that would make tomorrow easier?"
            ];
            this.state.pendingPrompt = null;
            const reply = `${this._pickVaried(followups)} ${this._pickVaried(next)}`;
            this.state.lastReply = reply;
            return reply;
        }

        // Warm acknowledgements (no pressure).
        const acknowledgements = [
            'Nice. That counts.',
            'That counts—thank you for doing that.',
            'You did a good thing for Future You.',
            'That’s a real win.',
            'Quiet progress. I like it.'
        ];

        const followUpQuestions = [
            'Want to tell me what made that doable today?',
            'Was that easy today, or did it take effort?',
            'Do you want to keep the streak gentle—one small thing tomorrow too?',
            'Anything you want to do a little differently tomorrow?'
        ];

        const tomorrow = [
            'We’ll try again tomorrow.',
            'If today was heavy, tomorrow is a fresh page.',
            'We can take it one day at a time.'
        ];

        // If we recognized a positive check-in, affirm it.
        if (parsed.intents && parsed.intents.length > 0) {
            const intentKey = parsed.intents[0]?.key || null;
            this.state.lastIntentKey = intentKey;

            const ack = this._pickVaried(acknowledgements);
            const ask = this._pickVaried(followUpQuestions);
            this.state.pendingPrompt = 'followup';

            const reply = `${ack} ${ask}`;
            this.state.lastReply = reply;
            return reply;
        }

        // If it sounds like they tried something, respond kindly without evaluation.
        if (parsed.didSomething) {
            const ack = this._pickVaried(acknowledgements);
            const ask = this._pickVaried(followUpQuestions);
            this.state.pendingPrompt = 'followup';
            const reply = `${ack} ${ask}`;
            this.state.lastReply = reply;
            return reply;
        }

        // Otherwise: gentle, supportive default.
        // If the user says something that sounds like they struggled, keep it kind.
        const struggle = /(couldn'?t|didn'?t|failed|messed up|hard|tired|overwhelmed)/.test(normalized);
        if (struggle) {
            const soft = [
                "That’s okay. You don’t need to be perfect.",
                "No judgment here.",
                "Thanks for being honest with me."
            ];
            const reply = `${this._pickVaried(soft)} ${this._pickVaried(tomorrow)}`;
            this.state.lastReply = reply;
            return reply;
        }

        const reply = this._pickVaried(tomorrow);
        this.state.lastReply = reply;
        return reply;
    }

    respond(text) {
        if (!text) return;
        this._emit('voice:response', { text });

        if (!this.options.speakResponses) return;
        if (!('speechSynthesis' in window) || !window.SpeechSynthesisUtterance) return;

        try {
            const utter = new SpeechSynthesisUtterance(text);
            utter.lang = this.options.lang;
            utter.rate = 0.95;
            utter.pitch = 1.0;
            utter.volume = 0.95;
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utter);
        } catch {
            // ignore
        }
    }
}

// Auto-init for convenience.
document.addEventListener('DOMContentLoaded', () => {
    window.ecoHabitVoice = new EcoHabitVoice();
});
