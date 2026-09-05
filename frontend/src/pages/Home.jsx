import { useState, useEffect } from "react";
import { 
    Activity, 
    ArrowRight, 
    Award, 
    BookOpen, 
    CheckCircle2,
    Clock,
    Compass, 
    FileText, 
    GitBranch, 
    Globe,
    GraduationCap, 
    LogOut,
    MessageSquare, 
    Play, 
    Plus, 
    RotateCcw, 
    Sparkles, 
    Trash2,
    Tv, 
    User, 
    Video, 
    Zap 
} from "lucide-react";

import Hologram from "../components/Hologram";
import ChatPanel from "../components/ChatPanel";
import CorePanel from "../components/CorePanel";
import VoiceButton from "../components/VoiceButton";
import DocumentUpload from "../components/DocumentUpload";
import VideoClassroom from "../components/VideoClassroom/VideoClassroom";
import LessonConfigModal from "../components/LessonConfigModal";
import AssessmentReportModal from "../components/AssessmentReportModal";
import LearningPathModal from "../components/LearningPathModal";
import StudentProfileModal from "../components/StudentProfileModal";

import { 
    askLilly, 
    playTeacherAudio, 
    stopTeacherAudio, 
    createVideoLesson,
    createDurationLessonPlan,
    getLatestActiveSessionState,
    clearLessonSessionState
} from "../services/api";

import { 
    MASTER_CURRICULUM, 
    buildCurriculumVideoLesson, 
    getCurriculumBySubject,
    findSubjectAndChapter 
} from "../data/curriculum";

export default function Home() {
    const [sessionId, setSessionId] = useState(() => `lilly-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    // Top-level Navigation Mode: "classroom" | "chat"
    const [activeTab, setActiveTab] = useState("classroom");

    // Global Selected Language for Video Classroom & Teacher Q&A Chat (English | Hindi | Telugu)
    const [selectedLanguage, setSelectedLanguage] = useState("English");

    // Video Lesson State
    const [activeLesson, setActiveLesson] = useState(null);
    const [lessonLoading, setLessonLoading] = useState(false);
    const [uploadedDoc, setUploadedDoc] = useState(null);
    const [selectedCurriculumId, setSelectedCurriculumId] = useState("python");

    // In-Progress Resumable Session State
    const [resumableSession, setResumableSession] = useState(null);

    // Modals
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [isAssessmentOpen, setIsAssessmentOpen] = useState(false);
    const [isPathOpen, setIsPathOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Completed checkpoint data for assessment
    const [assessmentData, setAssessmentData] = useState([]);

    // Chat Tab State
    const [chatQuestion, setChatQuestion] = useState("");
    const [chatAnswer, setChatAnswer] = useState("");
    const [chatLoading, setChatLoading] = useState(false);
    const [chatSpeaking, setChatSpeaking] = useState(false);
    const [chatSubject, setChatSubject] = useState(""); // Locked subject for chat
    const [chatSubjectLocked, setChatSubjectLocked] = useState(false); // Subject is locked after first message

    // Scan for resumable sessions from localStorage & backend
    const checkResumableSessions = async () => {
        // 1. Check localStorage first
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith("ai_teacher_session_")) {
                    const raw = localStorage.getItem(key);
                    if (raw) {
                        const parsed = JSON.parse(raw);
                        if (parsed && !parsed.is_completed && (parsed.topic || parsed.subject)) {
                            setResumableSession(parsed);
                            return;
                        }
                    }
                }
            }
        } catch (e) {}

        // 2. Check backend for latest active incomplete session
        try {
            const activeBackendSession = await getLatestActiveSessionState();
            if (activeBackendSession && !activeBackendSession.is_completed && (activeBackendSession.topic || activeBackendSession.subject)) {
                setResumableSession(activeBackendSession);
                return;
            }
        } catch (e) {}

        setResumableSession(null);
    };

    useEffect(() => {
        if (!activeLesson) {
            checkResumableSessions();
        }
    }, [activeLesson]);

    function handleResumeSession(session) {
        if (!session) return;
        const restoredSessionId = session.session_id || sessionId;
        setSessionId(restoredSessionId);

        if (session.language) {
            setSelectedLanguage(session.language);
        }

        let lessonToLoad = session.lesson_data;
        if (!lessonToLoad) {
            lessonToLoad = buildCurriculumVideoLesson({
                topic: session.topic || "Lesson",
                subject: session.subject || "",
                level: session.level || "beginner",
                language: session.language || "English",
                persona: session.persona || "lilly",
                time_minutes: session.target_duration_minutes || 30
            });
        }
        setActiveLesson(lessonToLoad);
        setActiveTab("classroom");
    }

    function handleDiscardSession(session) {
        if (!session) return;
        const sessId = session.session_id;
        try {
            localStorage.removeItem(`ai_teacher_session_${sessId}`);
            if (session.topic) {
                localStorage.removeItem(`ai_teacher_session_${session.topic}`);
            }
            localStorage.removeItem("ai_teacher_session_active");
        } catch (e) {}

        if (sessId) {
            clearLessonSessionState(sessId);
        }
        setResumableSession(null);
    }

    function handleExitClass({ sessionData }) {
        stopTeacherAudio();
        setActiveLesson(null);
        if (sessionData) {
            setResumableSession(sessionData);
            if (sessionData.language) {
                setSelectedLanguage(sessionData.language);
            }
        } else {
            checkResumableSessions();
        }
    }

    // ==================================================
    // LAUNCH NEW DURATION-MATCHED CLASS
    // ==================================================
    async function handleGenerateLesson(config) {
        setLessonLoading(true);
        if (config.language) {
            setSelectedLanguage(config.language);
        }

        // Resolve the subject once; a locked session cannot be redirected by a new topic.
        const matched = findSubjectAndChapter(config.topic);
        const requestedSubject = config.subject || matched?.subject?.name || chatSubject || "";
        const resolvedSubject = chatSubjectLocked ? chatSubject : requestedSubject;
        if (chatSubjectLocked && requestedSubject && requestedSubject.toLowerCase() !== chatSubject.toLowerCase()) {
            console.warn(`Subject change blocked: session is locked to ${chatSubject}.`);
            setLessonLoading(false);
            return;
        }
        if (resolvedSubject && !chatSubjectLocked) {
            setChatSubject(resolvedSubject);
            setChatSubjectLocked(true);
        }

        const durationMins = config.time_minutes || config.duration_minutes || 30;

        try {
            const lessonData = await createDurationLessonPlan({
                ...config,
                duration_minutes: durationMins,
                subject: resolvedSubject,
                session_id: sessionId
            });
            setActiveLesson(lessonData);
            setActiveTab("classroom");
        } catch (err) {
            console.error("Duration lesson plan failed, using video lesson / curriculum fallback:", err);
            try {
                const fallbackData = await createVideoLesson({
                    ...config,
                    time_minutes: durationMins,
                    subject: resolvedSubject,
                    session_id: sessionId
                });
                setActiveLesson(fallbackData);
                setActiveTab("classroom");
            } catch (err2) {
                const fallbackLesson = buildCurriculumVideoLesson({
                    topic: config.topic,
                    subject: resolvedSubject,
                    level: config.level || "beginner",
                    language: config.language || "English",
                    persona: config.persona || "lilly",
                    time_minutes: durationMins
                });
                setActiveLesson(fallbackLesson);
                setActiveTab("classroom");
            }
        } finally {
            setLessonLoading(false);
        }
    }

    // ==================================================
    // QUICK PRESETS / CURRICULUM LAUNCH
    // ==================================================
    function launchPresetLesson(topicName, domainName) {
        if (domainName) {
            setChatSubject(domainName);
            setChatSubjectLocked(true);
        }
        handleGenerateLesson({
            topic: topicName,
            subject: domainName || "",
            level: "beginner",
            language: selectedLanguage || "English",
            time_minutes: 20,
            persona: "lilly",
            goal: "Master core concepts with visual intuition",
            use_rag: false
        });
    }

    // ==================================================
    // CHAT SYSTEM (Synchronized Multilingual Q&A)
    // ==================================================
    async function askChatQuestion() {
        const text = chatQuestion.trim();
        if (!text || chatLoading) return;

        // Resolve the active subject: prefer active lesson topic, else manual selection
        const activeSubject = activeLesson?.subject || chatSubject || "";

        // LOCK the subject permanently on the very first message sent
        if (activeSubject && !chatSubjectLocked) {
            setChatSubjectLocked(true);
        }

        stopTeacherAudio();
        setChatSpeaking(false);
        setChatLoading(true);
        setChatAnswer("");

        try {
            const result = await askLilly(text, selectedLanguage, "beginner", activeSubject, sessionId);
            const aiAns = result.answer || result.response || (
                selectedLanguage === "Telugu" ? "నేను మీకు సహాయం చేయడానికి సిద్ధంగా ఉన్నాను." :
                selectedLanguage === "Hindi" ? "मैं आपके अध्ययन में सहायता के लिए तैयार हूँ।" :
                "I am ready to assist your learning."
            );
            setChatAnswer(aiAns);
            setChatLoading(false);

            setChatSpeaking(true);
            await playTeacherAudio({
                text: aiAns,
                language: selectedLanguage,
                persona: "lilly",
                onAudioStart: () => setChatSpeaking(true),
                onAudioEnd: () => setChatSpeaking(false)
            });
        } catch (err) {
            console.error("Chat error:", err);
            setChatAnswer(
                selectedLanguage === "Telugu" ? "నా న్యూరల్ కోర్ కనెక్ట్ అవుతోంది. దయచేసి కాసేపట్లో మళ్ళీ ప్రయత్నించండి." :
                selectedLanguage === "Hindi" ? "मेरा न्यूरल कोर कनेक्ट हो रहा है। कृपया कुछ पलों में पुनः प्रयास करें।" :
                "I'm connecting to my neural core. Please try again in a moment."
            );
            setChatLoading(false);
            setChatSpeaking(false);
        }
    }

    function handleStopSpeaking() {
        stopTeacherAudio();
        setChatSpeaking(false);
    }

    return (
        <main className="lilly-app">
            {/* Ambient Background Grid */}
            <div className="background-grid"></div>
            <div className="ambient-glow glow-one"></div>
            <div className="ambient-glow glow-two"></div>

            {/* ==========================================
                TOP NAVIGATION BAR
            ========================================== */}
            <header className="header">
                {/* Brand */}
                <div className="brand">
                    <div className="brand-symbol">◈</div>
                    <div>
                        <h1>LILLY</h1>
                        <span>HUMAN-LIKE AI TEACHER SYSTEM</span>
                    </div>
                </div>

                {/* Primary Mode Switcher Tabs */}
                <nav className="mode-nav-tabs">
                    <button
                        type="button"
                        className={`nav-tab-btn ${activeTab === "classroom" ? "active" : ""}`}
                        onClick={() => setActiveTab("classroom")}
                    >
                        <Video size={16} />
                        <span>AI Video Classroom</span>
                        {activeLesson && <span className="active-dot"></span>}
                    </button>

                    <button
                        type="button"
                        className={`nav-tab-btn ${activeTab === "chat" ? "active" : ""}`}
                        onClick={() => setActiveTab("chat")}
                    >
                        <MessageSquare size={16} />
                        <span>Teacher Q&A Chat</span>
                    </button>

                    <button
                        type="button"
                        className="nav-tab-btn"
                        onClick={() => setIsPathOpen(true)}
                    >
                        <GitBranch size={16} />
                        <span>Learning Path</span>
                    </button>

                    <button
                        type="button"
                        className="nav-tab-btn"
                        onClick={() => setIsProfileOpen(true)}
                    >
                        <User size={16} />
                        <span>Learner Profile</span>
                    </button>
                </nav>

                {/* Header Actions */}
                <div className="header-actions">
                    <DocumentUpload 
                        onDocumentLoaded={(doc) => {
                            setUploadedDoc(doc);
                            setIsConfigOpen(true);
                        }} 
                    />

                    <button
                        type="button"
                        className="new-lesson-btn"
                        onClick={() => setIsConfigOpen(true)}
                    >
                        <Plus size={15} />
                        <span>New Lesson</span>
                    </button>

                    <div className="header-status">
                        <span className="status-dot"></span>
                        ONLINE
                    </div>
                </div>
            </header>

            {/* ==========================================
                MAIN VIEWPORT
            ========================================== */}
            {activeTab === "classroom" && (
                <section className="classroom-view-wrapper">
                    {lessonLoading ? (
                        <div className="lesson-loading-hero">
                            <div className="spinner-dots big"></div>
                            <h2>Crafting Your AI Teaching Video...</h2>
                            <p>
                                Analyzing educational concepts, structuring sequential chapters,
                                preparing interactive whiteboard simulations, and calibrating voice synthesis.
                            </p>
                        </div>
                    ) : activeLesson ? (
                        <VideoClassroom
                            lesson={activeLesson}
                            sessionId={sessionId}
                            onExitClass={handleExitClass}
                            onLanguageChange={(newLang) => setSelectedLanguage(newLang)}
                            onOpenAssessment={(answeredList) => {
                                setAssessmentData(answeredList || []);
                                setIsAssessmentOpen(true);
                            }}
                        />
                    ) : (
                        /* Hero Launchpad when no lesson is active */
                        <div className="classroom-launchpad">
                            
                            {/* In-Progress Active Session Card (Guaranteed Exact Resume) */}
                            {resumableSession && !resumableSession.is_completed && (
                                <div className="resumable-session-card">
                                    <div className="resumable-card-badge">
                                        <span className="pulse-dot-amber"></span>
                                        <span>SAVED CLASS IN PROGRESS // READY TO RESUME</span>
                                    </div>
                                    <div className="resumable-card-content">
                                        <div className="resumable-card-info">
                                            <h3>{resumableSession.topic || resumableSession.subject || "In-Progress Masterclass"}</h3>
                                            <div className="resumable-meta-row">
                                                <span className="resumable-badge subject">{resumableSession.subject?.toUpperCase() || "ACADEMIC"}</span>
                                                <span className="resumable-badge lang">🌐 {resumableSession.language || "English"}</span>
                                                <span className="resumable-badge time">
                                                    <Clock size={12} />
                                                    <span>
                                                        {Math.floor((resumableSession.elapsed_learning_seconds || 0) / 60)}:
                                                        {String((resumableSession.elapsed_learning_seconds || 0) % 60).padStart(2, "0")} / {resumableSession.target_duration_minutes || 30}m
                                                    </span>
                                                </span>
                                                <span className="resumable-badge section">
                                                    Section {(resumableSession.current_section_index || 0) + 1}
                                                    {resumableSession.lesson_data?.sections?.length ? ` of ${resumableSession.lesson_data.sections.length}` : ""}
                                                </span>
                                            </div>
                                            <p className="resumable-subtext">
                                                Your learning timer, section progress, quiz checkpoints, and activity inputs are safely preserved.
                                            </p>
                                        </div>
                                        <div className="resumable-card-actions">
                                            <button
                                                type="button"
                                                className="btn-primary-glow btn-resume-class"
                                                onClick={() => handleResumeSession(resumableSession)}
                                            >
                                                <Play size={16} fill="#01070d" />
                                                <span>Resume Class</span>
                                            </button>
                                            <button
                                                type="button"
                                                className="btn-discard-session"
                                                onClick={() => handleDiscardSession(resumableSession)}
                                                title="Discard saved progress and clear session"
                                            >
                                                <Trash2 size={15} />
                                                <span>Discard</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="launchpad-hero">
                                <span className="hero-pill">
                                    <Sparkles size={14} /> ADAPTIVE VIDEO EDUCATION PLATFORM
                                </span>
                                <h2>Teach Any Topic or Document Through Video</h2>
                                <p>
                                    Experience real human-like teaching: our AI virtual educator explains concepts
                                    verbally with a 3D avatar, presents synchronized interactive whiteboard graphics,
                                    asks checkpoint questions, and detects your misconceptions.
                                </p>
                                <div className="hero-cta-row">
                                    <button
                                        type="button"
                                        className="btn-primary-glow big"
                                        onClick={() => setIsConfigOpen(true)}
                                    >
                                        <Play size={18} fill="#01070d" />
                                        <span>Start Personalized Lesson</span>
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-secondary big"
                                        onClick={() => setIsPathOpen(true)}
                                    >
                                        <GitBranch size={18} />
                                        <span>Generate Curriculum Path</span>
                                    </button>
                                </div>
                            </div>

                            {/* Curriculum Explorer: 10 Domains & 50 Video Lessons */}
                            <div className="curriculum-explorer-section">
                                <div className="presets-heading">
                                    <Zap size={16} />
                                    <span>EXPLORE MASTER CURRICULUM // 10 DOMAINS & 50 INTERACTIVE VIDEO LESSONS:</span>
                                </div>

                                {/* Domain Selector Tabs */}
                                <div className="curriculum-tabs-bar">
                                    {MASTER_CURRICULUM.map(domain => (
                                        <button
                                            key={domain.id}
                                            type="button"
                                            className={`curriculum-tab-btn ${selectedCurriculumId === domain.id ? "active" : ""}`}
                                            onClick={() => setSelectedCurriculumId(domain.id)}
                                        >
                                            <span className="domain-tab-icon">{domain.icon}</span>
                                            <span className="domain-tab-name">{domain.name}</span>
                                        </button>
                                    ))}
                                </div>

                                {/* Active Domain Showcase & 5 Chapters */}
                                {(() => {
                                    const activeDomain = MASTER_CURRICULUM.find(d => d.id === selectedCurriculumId) || MASTER_CURRICULUM[0];
                                    return (
                                        <div className="curriculum-domain-wrapper">
                                            <div className="domain-banner">
                                                <div className="domain-banner-info">
                                                    <div className="domain-banner-header">
                                                        <span className="domain-banner-icon">{activeDomain.icon}</span>
                                                        <div>
                                                            <span className="domain-badge">{activeDomain.badge}</span>
                                                            <h3>{activeDomain.name}</h3>
                                                        </div>
                                                    </div>
                                                    <p>{activeDomain.description}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="btn-primary-glow btn-compact"
                                                    onClick={() => launchPresetLesson(activeDomain.name, activeDomain.name)}
                                                >
                                                    <Play size={15} fill="#01070d" />
                                                    <span>Play Full Subject Masterclass (5 Chapters)</span>
                                                </button>
                                            </div>

                                            {/* 5 Chapters Grid */}
                                            <div className="curriculum-chapters-grid">
                                                {activeDomain.chapters.map((ch) => (
                                                    <div 
                                                        key={ch.id} 
                                                        className="curriculum-chapter-card"
                                                        onClick={() => launchPresetLesson(ch.title, activeDomain.name)}
                                                    >
                                                        <div className="ch-card-header">
                                                            <span className="ch-number-badge">CHAPTER 0{ch.id}</span>
                                                            <span className="ch-visual-type-tag">
                                                                {ch.visual_type === "code_sandbox" ? "💻 Code Sandbox" :
                                                                 ch.visual_type === "simulation" ? "⚡ Simulation" :
                                                                 ch.visual_type === "diagram" ? "🧬 System Diagram" :
                                                                 ch.visual_type === "timeline" ? "⏱ Chronology" :
                                                                 ch.visual_type === "formula" ? "📐 Formula Sheet" : "📊 Whiteboard"}
                                                            </span>
                                                        </div>
                                                        <h4 className="ch-card-title">{ch.title}</h4>
                                                        <p className="ch-card-summary">{ch.summary}</p>
                                                        <div className="ch-card-footer">
                                                            <span className="ch-duration">⏱ ~{Math.round(ch.duration_sec / 60)} min video</span>
                                                            <span className="ch-launch-link">
                                                                <span>Watch Video Lesson</span>
                                                                <ArrowRight size={14} />
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    )}
                </section>
            )}

            {/* ==========================================
                LIVE CHAT MODE
            ========================================== */}
            {activeTab === "chat" && (
                <section className="dashboard">
                    <ChatPanel
                        question={chatQuestion}
                        answer={chatAnswer}
                        loading={chatLoading}
                        language={selectedLanguage}
                        onLanguageChange={(newLang) => setSelectedLanguage(newLang)}
                    />

                    <section className="teacher-area">
                        <div className="ai-label">LILLY // AI TEACHER 07</div>
                        <Hologram speaking={chatSpeaking} />
                        <div className="teacher-info">
                            {/* Multilingual Q&A Language Selector Bar */}
                            <div className="chat-language-bar">
                                <span className="chat-lang-label">
                                    <Globe size={13} />
                                    <span>
                                        {selectedLanguage === "Telugu" ? "ప్రశ్నోత్తరాల భాష:" :
                                         selectedLanguage === "Hindi" ? "प्रश्नोत्तरी भाषा:" :
                                         "Q&A Language:"}
                                    </span>
                                </span>
                                <div className="chat-lang-pills">
                                    {[
                                        { id: "English", label: "English", flag: "🇬🇧" },
                                        { id: "Hindi", label: "हिंदी", flag: "🇮🇳" },
                                        { id: "Telugu", label: "తెలుగు", flag: "🇮🇳" }
                                    ].map((lang) => (
                                        <button
                                            key={lang.id}
                                            type="button"
                                            className={`chat-lang-pill ${selectedLanguage.toLowerCase().includes(lang.id.toLowerCase()) ? "active" : ""}`}
                                            onClick={() => setSelectedLanguage(lang.id)}
                                            title={`Set AI Teacher Q&A language to ${lang.label}`}
                                        >
                                            <span>{lang.flag}</span>
                                            <span>{lang.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Subject Lock Indicator / Selector */}
                            {activeLesson?.subject ? (
                                <div className="subject-lock-badge">
                                    <span className="subject-lock-icon">&#x1F512;</span>
                                    <span>{selectedLanguage === "Telugu" ? "బోధిస్తున్న అంశం:" : selectedLanguage === "Hindi" ? "अध्यापन विषय:" : "Teaching:"} <strong>{activeLesson.subject}</strong></span>
                                    <button
                                        type="button"
                                        className="subject-reset-btn"
                                        title="Start a new session with a different subject"
                                        onClick={() => {
                                            setSessionId(`lilly-${Date.now()}-${Math.random().toString(36).slice(2)}`);
                                            setActiveLesson(null);
                                            setChatSubject("");
                                            setChatSubjectLocked(false);
                                            setChatAnswer("");
                                            setChatQuestion("");
                                        }}
                                    >
                                        ↺ New Session
                                    </button>
                                </div>
                            ) : chatSubjectLocked && chatSubject ? (
                                /* Subject is permanently locked for this session */
                                <div className="subject-lock-badge active">
                                    <span className="subject-lock-icon">&#x1F512;</span>
                                    <span>Session locked to: <strong>{chatSubject}</strong></span>
                                    <button
                                        type="button"
                                        className="subject-reset-btn"
                                        title="Start a new session with a different subject"
                                        onClick={() => {
                                            setSessionId(`lilly-${Date.now()}-${Math.random().toString(36).slice(2)}`);
                                            setActiveLesson(null);
                                            setChatSubject("");
                                            setChatSubjectLocked(false);
                                            setChatAnswer("");
                                            setChatQuestion("");
                                        }}
                                    >
                                        ↺ New Session
                                    </button>
                                </div>
                            ) : (
                                <div className="subject-selector-wrap">
                                    <label htmlFor="chat-subject-select" className="subject-selector-label">
                                        &#x1F3AF; Select Subject to Study:
                                    </label>
                                    <select
                                        id="chat-subject-select"
                                        className="subject-selector-dropdown"
                                        value={chatSubject}
                                        onChange={(e) => setChatSubject(e.target.value)}
                                        disabled={chatSubjectLocked}
                                    >
                                        <option value="">No restriction (all topics)</option>
                                        <option value="Python Programming">🐍 Python Programming</option>
                                        <option value="Physics">⚛️ Physics</option>
                                        <option value="Mathematics">📐 Mathematics</option>
                                        <option value="Biology">🧬 Biology</option>
                                        <option value="Chemistry">🧪 Chemistry</option>
                                        <option value="Computer Science">💻 Computer Science</option>
                                        <option value="History">🏛️ History</option>
                                        <option value="Geography">🌍 Geography</option>
                                        <option value="English Literature">📖 English Literature</option>
                                        <option value="Economics">💰 Economics</option>
                                    </select>
                                    {chatSubject && (
                                        <div className="subject-lock-badge active">
                                            <span className="subject-lock-icon">&#x1F512;</span>
                                            <span>Will lock to: <strong>{chatSubject}</strong> on first message</span>
                                        </div>
                                    )}
                                </div>
                            )}
                            <p>
                                {selectedLanguage === "Telugu"
                                    ? "మీ సందేహాలను తెలుగులో అడగండి — లిల్లీ స్వచ్ఛమైన తెలుగులో వివరిస్తుంది"
                                    : selectedLanguage === "Hindi"
                                    ? "अपने प्रश्न हिंदी में पूछें — लिली स्पष्ट हिंदी में समझाएगी"
                                    : "Ask questions in English, Hindi, Hinglish or your uploaded notes"}
                            </p>
                            {chatSpeaking && (
                                <button
                                    type="button"
                                    onClick={handleStopSpeaking}
                                    className="stop-speaking"
                                >
                                    &#9209; STOP SPEAKING
                                </button>
                            )}
                        </div>
                    </section>

                    <CorePanel />
                </section>
            )}

            {/* Input Bar (Visible in Chat Mode) */}
            {activeTab === "chat" && (
                <section className="input-section">
                    <div className="input-box">
                        <VoiceButton onTranscript={(txt) => setChatQuestion(txt)} />
                        <textarea
                            className="textarea"
                            value={chatQuestion}
                            onChange={(e) => setChatQuestion(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    askChatQuestion();
                                }
                            }}
                            placeholder={
                                selectedLanguage === "Telugu"
                                    ? "లిల్లీని ఏదైనా ప్రశ్న అడగండి లేదా సందేహాలు నివృత్తి చేసుకోండి..."
                                    : selectedLanguage === "Hindi"
                                    ? "लिली से कोई भी प्रश्न पूछें या अपनी शंकाओं का समाधान करें..."
                                    : "Ask Lilly anything or question your uploaded document..."
                            }
                            rows={1}
                        />
                        <button
                            type="button"
                            className="send-button"
                            onClick={askChatQuestion}
                            disabled={chatLoading || !chatQuestion.trim()}
                        >
                            {chatLoading ? "..." : "➤"}
                        </button>
                    </div>

                    <div className="suggestions">
                        {selectedLanguage === "Telugu" ? (
                            <>
                                <button type="button" onClick={() => setChatQuestion("ఈ భావనను సరళమైన నిజ జీవిత ఉదాహరణతో వివరించండి")}>
                                    ఉదాహరణతో వివరించండి
                                </button>
                                <button type="button" onClick={() => setChatQuestion("ఈ అంశంపై నన్ను ఒక ఆలోచనాత్మక ప్రశ్న అడగండి")}>
                                    నన్ను క్విజ్ చేయండి
                                </button>
                                <button type="button" onClick={() => setChatQuestion("ముఖ్యమైన సూత్రాలు మరియు దశలను సంగ్రహించండి")}>
                                    సారాంశం ఇవ్వండి
                                </button>
                                <button type="button" onClick={() => setChatQuestion("ప్రారంభకులకు సరిపోయే విధంగా దశలవారీగా నేర్పించండి")}>
                                    దశలవారీ గైడ్
                                </button>
                            </>
                        ) : selectedLanguage === "Hindi" ? (
                            <>
                                <button type="button" onClick={() => setChatQuestion("इस अवधारणा को एक सरल वास्तविक जीवन उदाहरण के साथ समझाएं")}>
                                    उदाहरण से समझाएं
                                </button>
                                <button type="button" onClick={() => setChatQuestion("मुझसे इस विषय पर एक ज्ञानवर्धक प्रश्न पूछें")}>
                                    मुझसे क्विज़ लें
                                </button>
                                <button type="button" onClick={() => setChatQuestion("मुख्य सूत्रों और महत्वपूर्ण बिंदुओं का सारांश दें")}>
                                    मुख्य सारांश
                                </button>
                                <button type="button" onClick={() => setChatQuestion("शुरुआती स्तर के अनुसार चरण-दर-चरण मार्गदर्शन करें")}>
                                    चरण-दर-चरण गाइड
                                </button>
                            </>
                        ) : (
                            <>
                                <button type="button" onClick={() => setChatQuestion("Explain this concept simply with a real-world analogy")}>
                                    Explain with analogy
                                </button>
                                <button type="button" onClick={() => setChatQuestion("Mujhe ye Hinglish mein simple example ke saath samjhao")}>
                                    Explain in Hinglish
                                </button>
                                <button type="button" onClick={() => setChatQuestion("Quiz me on this topic with a tricky question")}>
                                    Quiz me
                                </button>
                                <button type="button" onClick={() => setChatQuestion("Summarize the key takeaways from my uploaded document")}>
                                    Summarize document
                                </button>
                            </>
                        )}
                    </div>
                </section>
            )}

            {/* ==========================================
                MODALS
            ========================================== */}
            <LessonConfigModal
                isOpen={isConfigOpen}
                onClose={() => setIsConfigOpen(false)}
                onGenerateLesson={handleGenerateLesson}
                uploadedDocName={uploadedDoc?.filename}
            />

            <AssessmentReportModal
                isOpen={isAssessmentOpen}
                onClose={() => setIsAssessmentOpen(false)}
                topic={activeLesson?.topic || "Current Lesson"}
                level={activeLesson?.level || "beginner"}
                language={activeLesson?.language || "English"}
                questionsAndAnswers={assessmentData}
                onSelectNextTopic={(nextTopic) => {
                    handleGenerateLesson({
                        topic: nextTopic,
                        level: activeLesson?.level || "beginner",
                        language: activeLesson?.language || "English",
                        time_minutes: activeLesson?.estimated_minutes || 20,
                        persona: activeLesson?.persona || "lilly"
                    });
                }}
            />

            <LearningPathModal
                isOpen={isPathOpen}
                onClose={() => setIsPathOpen(false)}
                onStartLessonFromPath={(unitConfig) => {
                    if (typeof unitConfig === "string") {
                        handleGenerateLesson({
                            topic: unitConfig,
                            level: "beginner",
                            language: "English",
                            time_minutes: 30,
                            persona: "lilly"
                        });
                    } else {
                        handleGenerateLesson({
                            topic: unitConfig.topic,
                            subject: unitConfig.subject || "",
                            level: unitConfig.level || "beginner",
                            language: unitConfig.language || "English",
                            duration_minutes: unitConfig.duration_minutes || 30,
                            time_minutes: unitConfig.duration_minutes || 30,
                            persona: unitConfig.persona || "lilly"
                        });
                    }
                }}
            />

            <StudentProfileModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                onReviewConcept={(conceptName) => {
                    handleGenerateLesson({
                        topic: `Remedial Revision on ${conceptName}`,
                        level: "beginner",
                        language: "English",
                        time_minutes: 10,
                        persona: "lilly",
                        goal: `Clarify misconceptions and master ${conceptName}`
                    });
                }}
            />

            {/* Footer */}
            <footer>
                LILLY AI EDUCATION SYSTEM
                <span>•</span>
                VIDEO-BASED ADAPTIVE PEDAGOGY
                <span>•</span>
                RAG KNOWLEDGE GROUNDING ACTIVE
            </footer>
        </main>
    );
}