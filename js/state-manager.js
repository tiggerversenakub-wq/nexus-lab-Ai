/**
 * state-manager.js
 * Centralized Reactive State Management for NexusLab AI
 * Manages simulation state, tutor conversation memory, learner profile,
 * PDF documents, UI preferences, and demo tier status.
 */

const STORAGE_KEY = 'nexuslab_state_v5';

// Default initial state
const defaultState = {
    // Subject & Sub-mode navigation
    currentSubject: 'chemistry', // 'chemistry' | 'biology' | 'physics' | 'astronomy'
    currentSubMode: 'chem_mix',

    // Simulation parameter states
    simulationState: {
        chemistry: {
            reactionType: 'neutralization', // 'neutralization' | 'precipitation' | 'gas' | 'combustion'
            volA: 50,
            volB: 50,
            temp: 25,
            selectedMatter: 'H2O', // 'H2O' | 'CO2' | 'CH4' | 'NaCl' | 'states_solid' | 'states_liquid' | 'states_gas'
            stoichMode: 'moles',
            lastResult: null
        },
        biology: {
            specimen: 'onion', // 'onion' | 'cheek' | 'pond'
            focusCoarse: 50,
            focusFine: 50,
            magnification: 400,
            isFluorescent: false,
            ecoProducers: 100,
            ecoPrey: 50,
            ecoPredators: 15
        },
        physics: {
            mass: 10, // kg
            appliedForce: 40, // N
            frictionCoeff: 0.2, // mu
            inclineAngle: 0, // degrees
            positionX: -5.0,
            velocityX: 0,
            acceleration: 0,
            netForce: 0,
            normalForce: 98,
            frictionForce: 19.6,
            isMoving: false,
            centripetalRadius: 4.5,
            centripetalSpeed: 20
        },
        astronomy: {
            eccentricity: 0.5,
            semiMajorAxis: 6.0,
            timeOfDay: 12.0,
            selectedConstellation: 'all',
            orbitalPeriod: 14.7,
            rPerihelion: 3.0,
            rAphelion: 9.0
        }
    },

    // 3D Viewport Controls
    viewportState: {
        isWireframe: false,
        isGridVisible: true,
        cameraPreset: 'main', // 'main' | 'closeup' | 'wide'
        autoRotate: true,
        fps: 60
    },

    // Conversation & Tutor Memory State
    conversationState: {
        messages: [],
        subject: 'chemistry',
        subMode: 'chem_mix',
        learnerLevel: 'high-school', // 'middle-school' | 'high-school' | 'university'
        responseMode: 'explain',     // 'explain' | 'step-by-step' | 'hint' | 'calculate' | 'verify' | 'challenge'
        lastCalculation: null,
        lastSimulationState: null,
        loadedDocument: null,
        misconceptions: [],
        currentTopic: null
    },

    // Adaptive Learner Profile
    learnerProfile: {
        level: 'high-school',
        preferredLanguage: 'th',
        difficulty: 'normal',
        weakTopics: [],
        strongTopics: [],
        recentTopics: []
    },

    // PDF Document Management
    pdfState: {
        loaded: false,
        fileName: '',
        pageCount: 0,
        fullText: '',
        chunks: [],
        extractedMetadata: null
    },

    // UI Preferences & Themes
    uiPreferences: {
        theme: 'dark', // 'dark' | 'light' | 'system'
        isSoundEnabled: true
    },

    // Demo Tier Status (Clearly labeled as DEMO / SIMULATED)
    demoTierState: {
        currentTier: 'pro_demo', // 'student_demo' | 'pro_demo' | 'institution_demo'
        isSimulated: true,
        dailyTokensUsed: 12,
        dailyTokenLimit: 1000
    }
};

class StateManager {
    constructor() {
        this.state = this._loadState();
        this.listeners = new Set();
    }

    _loadState() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                return this._deepMerge(defaultState, parsed);
            }
        } catch (err) {
            console.warn('[StateManager] Failed to read from localStorage, using defaults.', err);
        }
        return JSON.parse(JSON.stringify(defaultState));
    }

    _deepMerge(target, source) {
        const output = Object.assign({}, target);
        if (this._isObject(target) && this._isObject(source)) {
            Object.keys(source).forEach(key => {
                if (this._isObject(source[key])) {
                    if (!(key in target)) Object.assign(output, { [key]: source[key] });
                    else output[key] = this._deepMerge(target[key], source[key]);
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }
        return output;
    }

    _isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    }

    saveState() {
        try {
            // Save state excluding large ephemeral full text or history exceeding 30 items
            const toPersist = JSON.parse(JSON.stringify(this.state));
            if (toPersist.conversationState.messages.length > 25) {
                toPersist.conversationState.messages = toPersist.conversationState.messages.slice(-25);
            }
            if (toPersist.pdfState.fullText && toPersist.pdfState.fullText.length > 20000) {
                toPersist.pdfState.fullText = toPersist.pdfState.fullText.slice(0, 20000);
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(toPersist));
        } catch (err) {
            console.warn('[StateManager] Failed to save state to localStorage.', err);
        }
    }

    getState() {
        return this.state;
    }

    /**
     * Subscribe to state updates
     * @param {Function} listener (changedPath, newValue, fullState) => void
     */
    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    notify(changedPath, newValue) {
        this.listeners.forEach(fn => {
            try {
                fn(changedPath, newValue, this.state);
            } catch (e) {
                console.error('[StateManager] Listener error:', e);
            }
        });
        this.saveState();
    }

    // Navigation setters
    setSubject(subject) {
        this.state.currentSubject = subject;
        this.state.conversationState.subject = subject;
        this.notify('currentSubject', subject);
    }

    setSubMode(subMode) {
        this.state.currentSubMode = subMode;
        this.state.conversationState.subMode = subMode;
        this.notify('currentSubMode', subMode);
    }

    // Simulation parameter setters
    updateSimulationParams(subject, params) {
        if (!this.state.simulationState[subject]) return;
        Object.assign(this.state.simulationState[subject], params);
        this.state.conversationState.lastSimulationState = {
            subject,
            params: { ...this.state.simulationState[subject] },
            timestamp: Date.now()
        };
        this.notify(`simulationState.${subject}`, this.state.simulationState[subject]);
    }

    getSimulationState(subject = null) {
        const sub = subject || this.state.currentSubject;
        return this.state.simulationState[sub] || null;
    }

    // Conversation Memory Management
    addMessage(role, text, metadata = {}) {
        const msg = {
            id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            role, // 'user' | 'tutor' | 'system'
            text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isoTime: new Date().toISOString(),
            metadata // calculations, citations, actions, verification
        };

        this.state.conversationState.messages.push(msg);
        if (this.state.conversationState.messages.length > 30) {
            this.state.conversationState.messages.shift();
        }

        this.notify('conversationState.messages', this.state.conversationState.messages);
        return msg;
    }

    clearMessages() {
        this.state.conversationState.messages = [];
        this.notify('conversationState.messages', []);
    }

    setLearnerLevel(level) {
        this.state.conversationState.learnerLevel = level;
        this.state.learnerProfile.level = level;
        this.notify('learnerProfile.level', level);
    }

    setResponseMode(mode) {
        this.state.conversationState.responseMode = mode;
        this.notify('conversationState.responseMode', mode);
    }

    recordMisconception(topic, description) {
        this.state.conversationState.misconceptions.push({
            topic,
            description,
            timestamp: Date.now()
        });
        if (!this.state.learnerProfile.weakTopics.includes(topic)) {
            this.state.learnerProfile.weakTopics.push(topic);
        }
        this.notify('conversationState.misconceptions', this.state.conversationState.misconceptions);
    }

    recordSuccessTopic(topic) {
        if (!this.state.learnerProfile.strongTopics.includes(topic)) {
            this.state.learnerProfile.strongTopics.push(topic);
        }
        this.state.learnerProfile.weakTopics = this.state.learnerProfile.weakTopics.filter(t => t !== topic);
        this.notify('learnerProfile', this.state.learnerProfile);
    }

    // PDF State Management
    setPdfDocument(fileName, pageCount, fullText, chunks, extractedMetadata) {
        this.state.pdfState = {
            loaded: true,
            fileName,
            pageCount,
            fullText,
            chunks,
            extractedMetadata
        };
        this.state.conversationState.loadedDocument = {
            fileName,
            pageCount,
            summary: extractedMetadata?.title || fileName
        };
        this.notify('pdfState', this.state.pdfState);
    }

    clearPdfDocument() {
        this.state.pdfState = {
            loaded: false,
            fileName: '',
            pageCount: 0,
            fullText: '',
            chunks: [],
            extractedMetadata: null
        };
        this.state.conversationState.loadedDocument = null;
        this.notify('pdfState', this.state.pdfState);
    }

    // Theme & Preferences
    setTheme(theme) {
        this.state.uiPreferences.theme = theme;
        this.notify('uiPreferences.theme', theme);
    }

    // Demo Tier Upgrades
    setDemoTier(tierName) {
        this.state.demoTierState.currentTier = tierName;
        this.notify('demoTierState', this.state.demoTierState);
    }
}

export const stateManager = new StateManager();
