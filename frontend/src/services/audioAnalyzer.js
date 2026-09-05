/* ============================================================
   AUDIO ANALYZER & WORD-SYNCHRONIZED LIP ENGINE
   • Real-time Web Audio API frequency/amplitude extraction
   • Phonetic word-to-viseme parser
   • Syllable-level mouth openness matching spoken words
   • Seamless fallback for browser SpeechSynthesis boundary events
============================================================ */

let audioCtx = null;
let currentAnalyser = null;
let timeDomainData = null;
let frequencyData = null;
let currentAudioElement = null;

// Speech tracking state
let activeSpeechText = "";
let wordTimeline = [];
let totalEstimatedDuration = 0;
let speechStartTime = 0;
let currentWordIndex = -1;
let currentWordViseme = 0.0;
let isSpeaking = false;
let isSimulating = false;
let simInterval = null;
let simulatedAmplitude = 0;

/* ─────────────────────────────────────────────────────────────
   1. PHONETIC ANALYSIS HELPERS
───────────────────────────────────────────────────────────── */

/**
 * Classify a word or syllable into a mouth openness target (0.0 to 1.0)
 * based on phonetic properties:
 * - Bilabials (M, B, P): lips closed (~0.05)
 * - Labiodentals (F, V): teeth to lip (~0.20)
 * - Dentals/Sibilants (S, Z, T, D, TH, N): narrow aperture (~0.35)
 * - Narrow vowels (I, EE, U, OO): medium opening (~0.50 - 0.60)
 * - Open vowels (A, O, AH, AW, OH): wide opening (~0.85 - 1.00)
 */
function analyzeWordViseme(word) {
    if (!word) return 0.0;
    const w = word.toLowerCase().replace(/[^a-z]/g, "");
    if (!w) return 0.0;

    // Check bilabials (lips closed)
    if (/^[mbp]/.test(w) || /[mbp]$/.test(w)) {
        // Words starting or ending with m/b/p close the lips
        if (w.length <= 2) return 0.15;
    }

    // Check dominant vowel
    if (/aa|ah|aw|au|ar|o|ou|ow|a/.test(w)) {
        return 0.92; // Open vowel (wide jaw)
    }
    if (/ee|ea|ai|ay|e|i/.test(w)) {
        return 0.62; // Mid vowel
    }
    if (/oo|u/.test(w)) {
        return 0.48; // Rounded narrow
    }
    if (/^[szctdf]/.test(w)) {
        return 0.35; // Consonant onset
    }

    return 0.55;
}

/**
 * Estimate syllable count of an English word
 */
function countSyllables(word) {
    const w = word.toLowerCase().replace(/[^a-z]/g, "");
    if (w.length <= 3) return 1;
    const matches = w.match(/[aeiouy]{1,2}/g);
    return Math.max(1, matches ? matches.length : 1);
}

/**
 * Build a word timeline from text
 */
function parseTextToTimeline(text, expectedDurationSec = 0) {
    if (!text) return [];

    const rawTokens = text.match(/[\w']+|[.,!?;:]/g) || [];
    const timeline = [];
    let cumulativeWeight = 0;

    // First pass: assign relative weights
    const tokenWeights = rawTokens.map(token => {
        if (/^[.,!?;:]$/.test(token)) {
            const pauseWeight = token === "." || token === "!" || token === "?" ? 1.8 : 1.0;
            cumulativeWeight += pauseWeight;
            return { token, isPause: true, weight: pauseWeight };
        } else {
            const syllables = countSyllables(token);
            const viseme = analyzeWordViseme(token);
            const wordWeight = 1.0 + (syllables - 1) * 0.65;
            cumulativeWeight += wordWeight;
            return { token, isPause: false, syllables, viseme, weight: wordWeight };
        }
    });

    // Default duration: ~3.2 words per second (180 wpm) if not provided
    const totalDuration = expectedDurationSec > 0.5
        ? expectedDurationSec
        : (cumulativeWeight * 0.28);

    let currentTime = 0;
    for (const item of tokenWeights) {
        const itemDuration = (item.weight / cumulativeWeight) * totalDuration;
        timeline.push({
            token: item.token,
            isPause: item.isPause,
            viseme: item.isPause ? 0.0 : item.viseme,
            syllables: item.syllables || 1,
            start: currentTime,
            end: currentTime + itemDuration
        });
        currentTime += itemDuration;
    }

    return timeline;
}

/* ─────────────────────────────────────────────────────────────
   2. SPEECH REGISTRATION & LIFECYCLE
───────────────────────────────────────────────────────────── */

/**
 * Register speech text and optional audio element for word-accurate lip-sync
 */
export function registerSpeech({ text, duration = 0, audioElement = null, playbackRate = 1.0 }) {
    activeSpeechText = text || "";
    currentAudioElement = audioElement;
    speechStartTime = performance.now() / 1000;
    isSpeaking = true;

    // Connect audio element if provided and not already hooked
    if (audioElement) {
        connectAudioElement(audioElement);
    }

    // Build timeline
    wordTimeline = parseTextToTimeline(text, duration > 0 ? duration / playbackRate : 0);
    totalEstimatedDuration = wordTimeline.length > 0 ? wordTimeline[wordTimeline.length - 1].end : 0;
    currentWordIndex = 0;
    currentWordViseme = wordTimeline.length > 0 ? wordTimeline[0].viseme : 0.6;
}

/**
 * Callback when browser SpeechSynthesis hits a word boundary
 */
export function onWordBoundary({ charIndex = 0, charLength = 0 }) {
    if (!activeSpeechText) return;
    const word = activeSpeechText.substr(charIndex, charLength || 5).trim();
    currentWordViseme = analyzeWordViseme(word);
    isSpeaking = true;
}

/* ─────────────────────────────────────────────────────────────
   3. WEB AUDIO API INTEGRATION
───────────────────────────────────────────────────────────── */

export function connectAudioElement(audioElement) {
    try {
        currentAudioElement = audioElement;
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === "suspended") {
            audioCtx.resume();
        }

        isSimulating = false;
        if (simInterval) {
            clearInterval(simInterval);
            simInterval = null;
        }

        if (!currentAnalyser) {
            const source = audioCtx.createMediaElementSource(audioElement);
            currentAnalyser = audioCtx.createAnalyser();
            currentAnalyser.fftSize = 256;
            currentAnalyser.smoothingTimeConstant = 0.55;

            timeDomainData = new Uint8Array(currentAnalyser.frequencyBinCount);
            frequencyData = new Uint8Array(currentAnalyser.frequencyBinCount);

            source.connect(currentAnalyser);
            currentAnalyser.connect(audioCtx.destination);
        }
    } catch (e) {
        // If already connected or CORS blocked, use timing simulation
        isSimulating = true;
    }
}

export function startSimulation() {
    isSimulating = true;
    isSpeaking = true;
    if (simInterval) clearInterval(simInterval);
    simInterval = setInterval(() => {
        const t = performance.now() / 1000;
        // Natural speech rhythm simulation
        const syllable = Math.max(0, Math.sin(t * 26.0) * 0.35 + Math.sin(t * 18.0) * 0.25);
        const wordGate = Math.sin(t * 5.2) > 0.80 ? 0.0 : 1.0;
        simulatedAmplitude = Math.max(0, Math.min(1, syllable * wordGate));
    }, 14);
}

export function stopSimulation() {
    isSimulating = false;
    isSpeaking = false;
    simulatedAmplitude = 0;
    if (simInterval) {
        clearInterval(simInterval);
        simInterval = null;
    }
}

export function getAmplitude() {
    if (isSimulating) {
        return simulatedAmplitude;
    }

    if (!currentAnalyser || !timeDomainData) return 0;

    currentAnalyser.getByteTimeDomainData(timeDomainData);
    let sumSquares = 0;
    for (let i = 0; i < timeDomainData.length; i++) {
        const normalized = (timeDomainData[i] - 128) / 128;
        sumSquares += normalized * normalized;
    }
    return Math.sqrt(sumSquares / timeDomainData.length);
}

export function getFrequencyBands() {
    if (isSimulating) {
        const t = performance.now() / 1000;
        return {
            low: Math.max(0, simulatedAmplitude * (0.8 + Math.sin(t * 5.5) * 0.2)),
            mid: Math.max(0, simulatedAmplitude * (0.6 + Math.sin(t * 8.2) * 0.3)),
            high: Math.max(0, simulatedAmplitude * (0.3 + Math.sin(t * 14.1) * 0.25)),
            midHigh: Math.max(0, simulatedAmplitude * (0.4 + Math.sin(t * 11.0) * 0.2))
        };
    }

    if (!currentAnalyser || !frequencyData) {
        return { low: 0, mid: 0, high: 0, midHigh: 0 };
    }

    currentAnalyser.getByteFrequencyData(frequencyData);
    const len = frequencyData.length;
    const quarter = Math.floor(len / 4);

    let low = 0, mid = 0, midHigh = 0, high = 0;
    for (let i = 0; i < quarter; i++) low += frequencyData[i];
    for (let i = quarter; i < quarter * 2; i++) mid += frequencyData[i];
    for (let i = quarter * 2; i < quarter * 3; i++) midHigh += frequencyData[i];
    for (let i = quarter * 3; i < len; i++) high += frequencyData[i];

    return {
        low: low / (quarter * 255),
        mid: mid / (quarter * 255),
        high: high / (quarter * 255),
        midHigh: midHigh / (quarter * 255)
    };
}

/* ─────────────────────────────────────────────────────────────
   4. MASTER WORD-ACCURATE LIP TARGET COMPUTATION
───────────────────────────────────────────────────────────── */

/**
 * Computes the instantaneous target mouth openness (0.0 to 1.0)
 * strictly synchronized with the spoken words.
 */
export function getMouthTarget() {
    if (!isSpeaking) return 0.0;

    // 1. Determine current playback time
    let currentTime = 0;
    if (currentAudioElement && !currentAudioElement.paused && currentAudioElement.duration > 0) {
        currentTime = currentAudioElement.currentTime;
    } else {
        currentTime = (performance.now() / 1000) - speechStartTime;
    }

    // 2. Find active word in timeline
    let activeToken = null;
    if (wordTimeline.length > 0) {
        // Binary / linear search for active token
        for (let i = 0; i < wordTimeline.length; i++) {
            if (currentTime >= wordTimeline[i].start && currentTime <= wordTimeline[i].end) {
                activeToken = wordTimeline[i];
                currentWordIndex = i;
                break;
            }
        }
    }

    // 3. If on a punctuation pause or beyond speech end, close mouth
    if (activeToken && activeToken.isPause) {
        return 0.0;
    }
    if (totalEstimatedDuration > 0 && currentTime > totalEstimatedDuration + 0.3) {
        return 0.0;
    }

    // 4. Compute syllable cycle within the active word
    let syllableEnvelope = 1.0;
    if (activeToken) {
        const wordElapsed = currentTime - activeToken.start;
        const wordDur = Math.max(0.08, activeToken.end - activeToken.start);
        const progress = Math.min(1.0, Math.max(0.0, wordElapsed / wordDur));

        // Close lips slightly at start and end of word for crisp articulation
        const edgeDamp = Math.sin(progress * Math.PI); // 0 at start, 1 in middle, 0 at end

        // Multi-syllable bounce
        const syllables = activeToken.syllables || 1;
        const syllableCycle = Math.sin(progress * Math.PI * syllables);
        syllableEnvelope = Math.max(0.1, edgeDamp * Math.abs(syllableCycle));
    }

    // 5. Combine with real-time acoustic energy
    const amp = getAmplitude();
    const bands = getFrequencyBands();
    const acousticPower = amp * 2.8 + bands.low * 1.6 + bands.mid * 0.8;

    let target = 0.0;
    if (acousticPower > 0.03) {
        // Acoustic energy available: scale word viseme by real sound energy
        const baseViseme = activeToken ? activeToken.viseme : (currentWordViseme || 0.6);
        target = Math.min(1.0, acousticPower * 1.8 * baseViseme * (0.6 + 0.4 * syllableEnvelope));
    } else if (activeToken) {
        // Fallback for non-audio or low acoustic signal: follow syllable rhythm
        target = activeToken.viseme * syllableEnvelope * 0.85;
    } else if (isSimulating) {
        target = simulatedAmplitude * (currentWordViseme || 0.6);
    }

    return Math.max(0.0, Math.min(1.0, target));
}

export function disconnectAnalyzer() {
    stopSimulation();
    isSpeaking = false;
    currentAudioElement = null;
    wordTimeline = [];
    activeSpeechText = "";
}
