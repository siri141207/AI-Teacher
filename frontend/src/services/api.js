import { connectAudioElement, startSimulation, stopSimulation, disconnectAnalyzer, registerSpeech, onWordBoundary } from "./audioAnalyzer";

const API_URL = "https://ai-teacher-01.onrender.com";

// ======================================================
// VIDEO LESSON API (Task 1 & 2 Core)
// ======================================================

export async function createVideoLesson({
    topic,
    level = "beginner",
    language = "English",
    time_minutes = 20,
    persona = "lilly",
    goal = "Master core concepts with visual intuition",
    use_rag = true,
    session_id = "",
    subject = ""
}) {
    const response = await fetch(`${API_URL}/lesson/video-lesson`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            topic,
            level,
            language,
            time_minutes,
            persona,
            goal,
            use_rag,
            session_id,
            subject
        })
    });

    if (!response.ok) {
        const detail = await response.text();
        throw new Error(`Video lesson generation failed: ${response.status} ${detail}`);
    }

    return response.json();
}

// ======================================================
// DURATION-MATCHED MULTI-SECTION LESSON API
// ======================================================

export async function createDurationLessonPlan({
    topic,
    subject = "",
    level = "beginner",
    language = "English",
    duration_minutes = 30,
    persona = "lilly",
    goal = "Deep interactive mastery",
    use_rag = true,
    session_id = ""
}) {
    const response = await fetch(`${API_URL}/lesson/duration-plan`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            topic,
            subject,
            level,
            language,
            duration_minutes,
            persona,
            goal,
            use_rag,
            session_id
        })
    });

    if (!response.ok) {
        const detail = await response.text();
        throw new Error(`Duration lesson plan generation failed: ${response.status} ${detail}`);
    }

    return response.json();
}

export async function interactWithSectionActivity({
    topic,
    subject = "",
    section_id = 1,
    section_title = "",
    activity_type = "coding_exercise",
    student_submission = "",
    expected_answer = null,
    level = "beginner",
    language = "English",
    persona = "lilly",
    session_id = ""
}) {
    const response = await fetch(`${API_URL}/lesson/section/interact`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            topic,
            subject,
            section_id,
            section_title,
            activity_type,
            student_submission,
            expected_answer,
            level,
            language,
            persona,
            session_id
        })
    });

    if (!response.ok) {
        const detail = await response.text();
        throw new Error(`Section interaction failed: ${response.status} ${detail}`);
    }

    return response.json();
}

// ======================================================
// LESSON SESSION STATE & TIMER PERSISTENCE
// ======================================================

export async function saveLessonSessionState({
    session_id,
    subject = "",
    topic = "",
    target_duration_minutes = 30,
    elapsed_learning_seconds = 0,
    current_section_index = 0,
    completed_section_ids = [],
    completed_activities = [],
    answered_questions = [],
    student_input = "",
    language = "English",
    persona = "lilly",
    lesson_data = null,
    is_paused = false,
    is_completed = false
}) {
    if (!session_id) return null;
    try {
        const response = await fetch(`${API_URL}/lesson/session/save`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                session_id,
                subject,
                topic,
                target_duration_minutes,
                elapsed_learning_seconds,
                current_section_index,
                completed_section_ids,
                completed_activities,
                answered_questions,
                student_input,
                language,
                persona,
                lesson_data,
                is_paused,
                is_completed
            })
        });
        if (response.ok) {
            return await response.json();
        }
    } catch (e) {
        console.warn("Session save to backend warning (fallback to localStorage active):", e);
    }
    return null;
}

export async function getLessonSessionState(session_id) {
    if (!session_id) return null;
    try {
        const response = await fetch(`${API_URL}/lesson/session/${session_id}`);
        if (response.ok) {
            return await response.json();
        }
    } catch (e) {
        console.warn("Session fetch warning:", e);
    }
    return null;
}

export async function getLatestActiveSessionState() {
    try {
        const response = await fetch(`${API_URL}/lesson/session/active`);
        if (response.ok) {
            return await response.json();
        }
    } catch (e) {
        console.warn("Active session fetch warning:", e);
    }
    return null;
}

export async function clearLessonSessionState(session_id) {
    if (!session_id) return null;
    try {
        const response = await fetch(`${API_URL}/lesson/session/clear`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ session_id })
        });
        if (response.ok) {
            return await response.json();
        }
    } catch (e) {
        console.warn("Session clear warning:", e);
    }
    return null;
}

export async function translateLesson({
    lesson,
    target_language,
    topic = "",
    subject = "",
    level = "beginner",
    persona = "lilly",
    session_id = ""
}) {
    const response = await fetch(`${API_URL}/lesson/translate-lesson`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            lesson,
            target_language,
            topic,
            subject,
            level,
            persona,
            session_id
        })
    });

    if (!response.ok) {
        const detail = await response.text();
        throw new Error(`Lesson translation failed: ${response.status} ${detail}`);
    }

    const data = await response.json();
    return data.lesson;
}

// ======================================================
// MISCONCEPTION DETECTION & ADAPTATION
// ======================================================

export async function diagnoseMisconception({
    topic,
    question,
    student_answer,
    expected_answer = null,
    language = "English",
    level = "beginner",
    persona = "lilly"
}) {
    const response = await fetch(`${API_URL}/lesson/diagnose-misconception`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            topic,
            question,
            student_answer,
            expected_answer,
            language,
            level,
            persona
        })
    });

    if (!response.ok) {
        const detail = await response.text();
        throw new Error(`Misconception diagnosis failed: ${response.status} ${detail}`);
    }

    return response.json();
}

// ======================================================
// LEARNING PATH API
// ======================================================

export async function createLearningPath({
    topic,
    target_role_or_goal = "Comprehensive Mastery",
    current_level = "beginner",
    language = "English"
}) {
    const response = await fetch(`${API_URL}/lesson/learning-path`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            topic,
            target_role_or_goal,
            current_level,
            language
        })
    });

    if (!response.ok) {
        const detail = await response.text();
        throw new Error(`Learning path generation failed: ${response.status} ${detail}`);
    }

    return response.json();
}

// ======================================================
// POST-LESSON ASSESSMENT REPORT
// ======================================================

export async function createAssessmentReport({
    topic,
    level = "beginner",
    language = "English",
    questions_and_answers = []
}) {
    const response = await fetch(`${API_URL}/lesson/assessment-report`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            topic,
            level,
            language,
            questions_and_answers
        })
    });

    if (!response.ok) {
        const detail = await response.text();
        throw new Error(`Assessment report generation failed: ${response.status} ${detail}`);
    }

    return response.json();
}

// ======================================================
// TEACHER PERSONAS
// ======================================================

export async function getTeacherPersonas() {
    try {
        const response = await fetch(`${API_URL}/voice/personas`);
        if (response.ok) {
            return await response.json();
        }
    } catch (e) {
        console.warn("Could not fetch remote personas, using default", e);
    }
    return {
        personas: [
            { id: "lilly", name: "Lilly", role: "AI Senior Educator", style: "Patient, warm, analogy-rich." },
            { id: "vikram", name: "Prof. Vikram", role: "Scientific Fellow", style: "Rigorous, analytical, first-principles." },
            { id: "alex", name: "Alex", role: "Tech & Lab Instructor", style: "Practical, energetic, code-driven." }
        ]
    };
}

// ======================================================
// AUDIO PLAYBACK (Backend Neural Edge-TTS + Browser Fallback)
// Ensures strictly ONE AI voice plays at a time and starts only on user command
// ======================================================

let currentAudio = null;
let currentAudioRequestId = 0;
let isSpeaking = false;

export async function playTeacherAudio({
    text,
    language = "English",
    persona = "lilly",
    playbackRate = 1.0,
    onAudioStart = null,
    onAudioEnd = null
}) {
    // 1. Immediately halt any currently playing audio and generate a unique request token
    stopTeacherAudio();
    const requestId = ++currentAudioRequestId;

    if (!text || !text.trim()) {
        if (onAudioEnd) onAudioEnd();
        return;
    }

    // 2. Try backend Neural Voice (Edge-TTS) with exact language mapping
    try {
        const formData = new FormData();
        formData.append("text", text);
        formData.append("language", language);
        formData.append("persona", persona);

        const response = await fetch(`${API_URL}/voice/speak`, {
            method: "POST",
            body: formData
        });

        // If another audio request was started while waiting for backend, abort this one
        if (requestId !== currentAudioRequestId) {
            return;
        }

        if (response.ok) {
            const blob = await response.blob();
            if (requestId !== currentAudioRequestId) return;

            const audioUrl = URL.createObjectURL(blob);
            const audio = new Audio(audioUrl);
            audio.playbackRate = playbackRate;
            currentAudio = audio;
            isSpeaking = true;

            // Connect to Web Audio API for real-time lip-sync analysis
            try {
                connectAudioElement(audio);
                registerSpeech({ text, audioElement: audio, playbackRate });
                audio.onloadedmetadata = () => {
                    registerSpeech({ text, duration: audio.duration, audioElement: audio, playbackRate });
                };
            } catch (e) {
                console.warn("Audio analyzer connection notice:", e);
                registerSpeech({ text, playbackRate });
            }

            if (onAudioStart) onAudioStart();

            return new Promise((resolve) => {
                audio.onended = () => {
                    if (requestId === currentAudioRequestId) {
                        isSpeaking = false;
                        currentAudio = null;
                        disconnectAnalyzer();
                        if (onAudioEnd) onAudioEnd();
                    }
                    resolve();
                };
                audio.onerror = () => {
                    if (requestId === currentAudioRequestId) {
                        isSpeaking = false;
                        currentAudio = null;
                        disconnectAnalyzer();
                        if (onAudioEnd) onAudioEnd();
                    }
                    resolve();
                };
                audio.play().catch(() => {
                    // Autoplay blocked fallback to browser SpeechSynthesis
                    if (requestId === currentAudioRequestId) {
                        speakWithBrowserTTS(text, language, playbackRate, onAudioStart, onAudioEnd, requestId).then(resolve);
                    } else {
                        resolve();
                    }
                });
            });
        }
    } catch (err) {
        console.warn("Backend neural TTS unavailable, falling back to browser SpeechSynthesis:", err);
    }

    // 3. Fallback to browser SpeechSynthesis
    if (requestId === currentAudioRequestId) {
        return speakWithBrowserTTS(text, language, playbackRate, onAudioStart, onAudioEnd, requestId);
    }
}

export function stopTeacherAudio() {
    currentAudioRequestId++;
    if (currentAudio) {
        try {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            currentAudio.src = "";
        } catch (e) {}
        currentAudio = null;
    }
    if (window.speechSynthesis) {
        try {
            window.speechSynthesis.cancel();
        } catch (e) {}
    }
    isSpeaking = false;
    disconnectAnalyzer();
}

function speakWithBrowserTTS(text, language = "English", playbackRate = 1.0, onStart = null, onEnd = null, expectedRequestId = null) {
    return new Promise((resolve) => {
        if (!text || !window.speechSynthesis) {
            if (onEnd) onEnd();
            resolve();
            return;
        }

        // Cancel previous speech
        try {
            window.speechSynthesis.cancel();
        } catch (e) {}

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = Math.max(0.8, Math.min(1.4, 0.95 * playbackRate));
        utterance.pitch = 1.0;

        const voices = window.speechSynthesis.getVoices();
        const langLower = (language || "english").toLowerCase();

        let match = null;
        if (langLower.includes("telugu") || langLower.includes("te")) {
            match = voices.find(v => v.lang.startsWith("te") || v.name.toLowerCase().includes("telugu"));
            utterance.lang = "te-IN";
        } else if (langLower.includes("hindi") || langLower.includes("hi")) {
            match = voices.find(v => v.lang.startsWith("hi") || v.name.toLowerCase().includes("hindi") || v.name.toLowerCase().includes("kalpana") || v.name.toLowerCase().includes("hemant"));
            utterance.lang = "hi-IN";
        } else if (langLower.includes("hinglish")) {
            match = voices.find(v => v.lang.startsWith("hi") || v.lang === "en-IN");
            utterance.lang = "hi-IN";
        } else if (langLower.includes("spanish") || langLower.includes("es")) {
            match = voices.find(v => v.lang.startsWith("es"));
            utterance.lang = "es-ES";
        } else if (langLower.includes("french") || langLower.includes("fr")) {
            match = voices.find(v => v.lang.startsWith("fr"));
            utterance.lang = "fr-FR";
        } else if (langLower.includes("tamil") || langLower.includes("ta")) {
            match = voices.find(v => v.lang.startsWith("ta"));
            utterance.lang = "ta-IN";
        } else if (langLower.includes("german") || langLower.includes("de")) {
            match = voices.find(v => v.lang.startsWith("de"));
            utterance.lang = "de-DE";
        } else {
            match = voices.find(v => /aria|jenny|zira|samantha|female/i.test(v.name) && v.lang.startsWith("en")) ||
                    voices.find(v => v.lang.startsWith("en"));
            utterance.lang = "en-US";
        }

        if (match) utterance.voice = match;

        registerSpeech({ text, playbackRate });

        utterance.onboundary = (event) => {
            if (event.name === "word") {
                onWordBoundary({ charIndex: event.charIndex, charLength: event.charLength });
            }
        };

        utterance.onstart = () => {
            isSpeaking = true;
            if (onStart) onStart();
        };

        utterance.onend = () => {
            if (!expectedRequestId || expectedRequestId === currentAudioRequestId) {
                isSpeaking = false;
                disconnectAnalyzer();
                if (onEnd) onEnd();
            }
            resolve();
        };

        utterance.onerror = () => {
            if (!expectedRequestId || expectedRequestId === currentAudioRequestId) {
                isSpeaking = false;
                disconnectAnalyzer();
                if (onEnd) onEnd();
            }
            resolve();
        };

        try {
            window.speechSynthesis.speak(utterance);
        } catch (e) {
            console.warn("Speech synthesis error:", e);
            if (onEnd) onEnd();
            resolve();
        }
    });
}

// Backward compatibility methods
export const speakLilly = (text) => playTeacherAudio({ text, language: "English", persona: "lilly" });
export const stopLilly = stopTeacherAudio;

// ======================================================
// CHAT & TRANSCRIBE
// ======================================================

export async function askLilly(question, language = "English", level = "beginner", subject = "", sessionId = "lilly-session") {
    const response = await fetch(`${API_URL}/lesson/chat`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            session_id: sessionId,
            question,
            language,
            level,
            subject
        })
    });

    if (!response.ok) {
        const detail = await response.text();
        throw new Error(`AI request failed: ${response.status} ${detail}`);
    }

    return response.json();
}

export async function transcribeVoice(audioBlob) {
    const formData = new FormData();
    formData.append("audio", audioBlob, "voice.webm");

    const response = await fetch(`${API_URL}/voice/transcribe`, {
        method: "POST",
        body: formData
    });

    if (!response.ok) {
        const detail = await response.text();
        throw new Error(`Voice transcription failed: ${response.status} ${detail}`);
    }

    return response.json();
}
