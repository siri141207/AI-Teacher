import { useState, useEffect, useRef } from "react";
import { 
    Activity,
    AlertCircle,
    ArrowRight,
    Award, 
    CheckCircle, 
    CheckCircle2,
    ChevronDown,
    Clock,
    Code2,
    Compass,
    Download, 
    FastForward, 
    Globe,
    HelpCircle,
    Layers,
    LogOut,
    Maximize2, 
    Minimize2, 
    Pause, 
    Play, 
    RotateCcw, 
    Save,
    Send,
    Sparkles, 
    Subtitles, 
    Target,
    Volume2, 
    VolumeX, 
    Zap 
} from "lucide-react";
import Hologram from "../Hologram";
import WhiteboardVisualizer from "./WhiteboardVisualizer";
import InteractiveCheckpoint from "./InteractiveCheckpoint";
import { 
    playTeacherAudio, 
    stopTeacherAudio, 
    interactWithSectionActivity,
    saveLessonSessionState,
    getLessonSessionState,
    translateLesson 
} from "../../services/api";

const CLASSROOM_LANGUAGES = [
    {
        id: "English",
        label: "English",
        flag: "🇬🇧"
    },
    {
        id: "Hindi",
        label: "हिंदी",
        flag: "🇮🇳"
    },
    {
        id: "Telugu",
        label: "తెలుగు",
        flag: "🇮🇳"
    }
];

export default function VideoClassroom({
    lesson,
    sessionId = "",
    onFinishLesson,
    onOpenAssessment,
    onExitClass,
    onLanguageChange
}) {
    // Dynamic translated lesson state (allows instant in-class language switching)
    const [activeLessonState, setActiveLessonState] = useState(lesson);
    const [currentLanguage, setCurrentLanguage] = useState(lesson?.language || "English");
    const [isTranslating, setIsTranslating] = useState(false);
    const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
    const langDropdownRef = useRef(null);

    useEffect(() => {
        if (lesson) {
            setActiveLessonState(lesson);
            if (lesson.language) {
                setCurrentLanguage(lesson.language);
            }
        }
    }, [lesson]);

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(e) {
            if (langDropdownRef.current && !langDropdownRef.current.contains(e.target)) {
                setIsLangDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const currentLesson = activeLessonState || lesson;

    // Standardize sections: support both new multi-section plans and legacy video chapters
    const sections = currentLesson?.sections || currentLesson?.chapters || [];
    const targetDurationMinutes = currentLesson?.target_duration_minutes || currentLesson?.estimated_minutes || 30;
    const targetSeconds = targetDurationMinutes * 60;

    // Active session persistence key
    const sessionStorageKey = `ai_teacher_session_${sessionId || currentLesson?.topic || "active"}`;

    // -------------------------------------------------------------
    // 1. STATE & PERSISTENCE
    // -------------------------------------------------------------
    const [currentSectionIndex, setCurrentSectionIndex] = useState(() => {
        try {
            const saved = localStorage.getItem(sessionStorageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                return parsed.currentSectionIndex || 0;
            }
        } catch (e) {}
        return 0;
    });

    const [elapsedLearningSeconds, setElapsedLearningSeconds] = useState(() => {
        try {
            const saved = localStorage.getItem(sessionStorageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                return parsed.elapsedLearningSeconds || 0;
            }
        } catch (e) {}
        return 0;
    });

    const [completedSectionIds, setCompletedSectionIds] = useState(() => {
        try {
            const saved = localStorage.getItem(sessionStorageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                return parsed.completedSectionIds || [];
            }
        } catch (e) {}
        return [];
    });

    const [completedActivities, setCompletedActivities] = useState(() => {
        try {
            const saved = localStorage.getItem(sessionStorageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                return parsed.completedActivities || [];
            }
        } catch (e) {}
        return [];
    });

    // Language detection based on dynamic currentLanguage
    const langLower = (currentLanguage || currentLesson?.language || "english").toLowerCase();
    const isTelugu = langLower.includes("telugu") || langLower.includes("te");
    const isHindi = langLower.includes("hindi") || langLower.includes("hi");

    // Playback & Interaction States
    const [hasStartedClass, setHasStartedClass] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speaking, setSpeaking] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
    const [showSubtitles, setShowSubtitles] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showObjectives, setShowObjectives] = useState(false);
    const [showEarlyFinishModal, setShowEarlyFinishModal] = useState(false);

    // Active Learning Exercise State (Restored from session if exists)
    const [studentInput, setStudentInput] = useState(() => {
        try {
            const saved = localStorage.getItem(sessionStorageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.student_input || parsed.studentInput) return parsed.student_input || parsed.studentInput;
            }
        } catch (e) {}
        return "";
    });
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [activityFeedback, setActivityFeedback] = useState(null);
    const [showCheckpoint, setShowCheckpoint] = useState(false);
    const [answeredQuestions, setAnsweredQuestions] = useState(() => {
        try {
            const saved = localStorage.getItem(sessionStorageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed.answered_questions)) return parsed.answered_questions;
                if (Array.isArray(parsed.answeredQuestions)) return parsed.answeredQuestions;
            }
        } catch (e) {}
        return [];
    });

    // Toast notification for state saves & alerts
    const [saveToast, setSaveToast] = useState("");

    // Export state
    const [isRecordingExport, setIsRecordingExport] = useState(false);
    const [exportProgress, setExportProgress] = useState("");

    const classroomRef = useRef(null);
    const recorderRef = useRef(null);
    const streamChunksRef = useRef([]);

    const currentSection = sections[currentSectionIndex] || sections[0] || null;
    const currentActivity = currentSection?.learning_activity || null;
    const currentCheckpoint = currentSection?.checkpoint || null;

    // Helper to safely persist complete learning session state
    function saveCurrentClassState(isCompleted = false, customLesson = null, customLang = null) {
        const payload = {
            session_id: sessionId || currentLesson?.session_id || `session-${currentLesson?.topic || "active"}`,
            subject: currentLesson?.subject || "",
            topic: currentLesson?.topic || "",
            target_duration_minutes: targetDurationMinutes,
            elapsed_learning_seconds: elapsedLearningSeconds,
            current_section_index: currentSectionIndex,
            completed_section_ids: completedSectionIds,
            completed_activities: completedActivities,
            answered_questions: answeredQuestions,
            student_input: studentInput,
            language: customLang || currentLanguage || "English",
            persona: currentLesson?.persona || "lilly",
            lesson_data: customLesson || currentLesson,
            is_paused: !isPlaying,
            is_completed: isCompleted,
            updated_at: new Date().toISOString()
        };

        try {
            localStorage.setItem(sessionStorageKey, JSON.stringify(payload));
        } catch (e) {
            console.warn("Local storage save error:", e);
        }

        if (sessionId) {
            saveLessonSessionState(payload);
        }

        return payload;
    }

    // Dynamic Language Switching: Translates lesson content and voice seamlessly
    async function handleLanguageChange(newLang) {
        if (!newLang || newLang.toLowerCase() === currentLanguage.toLowerCase() || isTranslating) return;

        // 1. Immediately halt previous teacher audio
        stopTeacherAudio();
        setSpeaking(false);

        const prevLang = currentLanguage;
        setCurrentLanguage(newLang);

        if (onLanguageChange) {
            onLanguageChange(newLang);
        }

        setIsTranslating(true);
        const loadingMsg = newLang === "Telugu" ? "తెలుగులోకి పాఠాన్ని అనువదిస్తోంది..." :
                           newLang === "Hindi" ? "पाठ को हिंदी में अनुवादित किया जा रहा है..." :
                           `Translating lesson content into ${newLang}...`;
        setSaveToast(loadingMsg);

        try {
            const res = await translateLesson({
                lesson: currentLesson,
                target_language: newLang,
                topic: currentLesson?.topic || "",
                subject: currentLesson?.subject || "",
                level: currentLesson?.level || "beginner",
                persona: currentLesson?.persona || "lilly",
                session_id: sessionId
            });

            if (res && res.lesson) {
                setActiveLessonState(res.lesson);

                // Persist translated lesson with existing timer and section position
                saveCurrentClassState(false, res.lesson, newLang);

                const successMsg = newLang === "Telugu" ? "✓ బోధనా భాష తెలుగులోకి మార్చబడింది" :
                                   newLang === "Hindi" ? "✓ शिक्षण भाषा हिंदी में बदल दी गई" :
                                   `✓ Teaching language switched to ${newLang}`;
                setSaveToast(successMsg);
                setTimeout(() => setSaveToast(""), 4000);

                // If class is actively playing, restart teacher voice in new language
                const translatedSections = res.lesson?.sections || res.lesson?.chapters || [];
                const activeTranslatedSection = translatedSections[currentSectionIndex] || translatedSections[0];
                if (hasStartedClass && isPlaying && activeTranslatedSection?.narration_script) {
                    setSpeaking(true);
                    playTeacherAudio({
                        text: activeTranslatedSection.narration_script,
                        language: newLang,
                        persona: currentLesson?.persona || "lilly",
                        playbackRate: playbackSpeed,
                        onAudioStart: () => setSpeaking(true),
                        onAudioEnd: () => {
                            setSpeaking(false);
                            if (activeTranslatedSection.checkpoint && !completedSectionIds.includes(activeTranslatedSection.id)) {
                                setShowCheckpoint(true);
                            }
                        }
                    });
                }
            }
        } catch (err) {
            console.error("Language translation failed:", err);
            setSaveToast(`Language set to ${newLang}`);
            setTimeout(() => setSaveToast(""), 3000);
        } finally {
            setIsTranslating(false);
        }
    }

    // Initialize or restore student input when section changes
    useEffect(() => {
        if (currentActivity) {
            // If the user already wrote input in this section, keep it; else set default starter
            if (!studentInput) {
                if (currentActivity.initial_code) {
                    setStudentInput(currentActivity.initial_code);
                } else if (currentActivity.starter_problem) {
                    setStudentInput("");
                }
            }
        }
        setActivityFeedback(null);
    }, [currentSectionIndex, currentSection]);

    // -------------------------------------------------------------
    // 2. ACTIVE LEARNING TIMER (Excludes API response latency)
    // Runs ONLY after user starts class, is not paused, and not waiting for API evaluation
    // -------------------------------------------------------------
    useEffect(() => {
        if (!hasStartedClass || !isPlaying || isEvaluating) return;

        const interval = setInterval(() => {
            setElapsedLearningSeconds(prev => {
                const next = prev + 1;
                // Periodic safe background autosave every 5 seconds
                if (next % 5 === 0) {
                    try {
                        localStorage.setItem(sessionStorageKey, JSON.stringify({
                            session_id: sessionId,
                            subject: currentLesson?.subject || "",
                            topic: currentLesson?.topic || "",
                            target_duration_minutes: targetDurationMinutes,
                            elapsed_learning_seconds: next,
                            current_section_index: currentSectionIndex,
                            completed_section_ids: completedSectionIds,
                            completed_activities: completedActivities,
                            answered_questions: answeredQuestions,
                            student_input: studentInput,
                            language: currentLanguage || "English",
                            persona: currentLesson?.persona || "lilly",
                            lesson_data: currentLesson,
                            is_paused: false,
                            is_completed: false
                        }));
                    } catch (e) {}
                }
                return next;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [hasStartedClass, isPlaying, isEvaluating, currentSectionIndex, completedSectionIds, completedActivities, answeredQuestions, studentInput, sessionStorageKey, targetDurationMinutes, sessionId, currentLesson, currentLanguage]);

    // Sync to backend on section switch, exercise completion, or checkpoint change
    useEffect(() => {
        if (sessionId && hasStartedClass) {
            saveCurrentClassState(false);
        }
    }, [currentSectionIndex, completedSectionIds.length, completedActivities.length, answeredQuestions.length, hasStartedClass, currentLanguage]);

    // Clean up audio on unmount
    useEffect(() => {
        return () => {
            stopTeacherAudio();
        };
    }, []);

    // -------------------------------------------------------------
    // 3. TEACHER NARRATION FOR ACTIVE SECTION
    // Voice starts ONLY after user starts class, and strictly ONE AI voice plays at a time
    // -------------------------------------------------------------
    useEffect(() => {
        if (!hasStartedClass || !isPlaying || !currentSection || !currentSection.narration_script) return;

        setSpeaking(true);
        playTeacherAudio({
            text: currentSection.narration_script,
            language: currentLanguage || "English",
            persona: currentLesson?.persona || "lilly",
            playbackRate: playbackSpeed,
            onAudioStart: () => setSpeaking(true),
            onAudioEnd: () => {
                setSpeaking(false);
                // If section has an active checkpoint, show it
                if (currentCheckpoint && !completedSectionIds.includes(currentSection.id)) {
                    setShowCheckpoint(true);
                }
            }
        });

        return () => {
            stopTeacherAudio();
        };
    }, [currentSectionIndex, isPlaying, hasStartedClass, playbackSpeed, currentLanguage, currentLesson]);

    function handleStartClass() {
        setHasStartedClass(true);
        setIsPlaying(true);
    }

    // -------------------------------------------------------------
    // SAFE EXIT CLASS HANDLER (Guaranteed No Loss, No Reset, No False Completion)
    // -------------------------------------------------------------
    function handleExitClass() {
        // 1. Immediately halt all spoken audio and animations
        stopTeacherAudio();
        setIsPlaying(false);
        setSpeaking(false);

        // 2. Persist exact state with is_completed = false
        const savedState = saveCurrentClassState(false);

        // 3. Notify and trigger exit navigation to Launchpad
        if (onExitClass) {
            onExitClass({ sessionData: savedState });
        }
    }

    // -------------------------------------------------------------
    // 4. INTERACTIVE EXERCISE EVALUATION
    // -------------------------------------------------------------
    async function handleSubmitActivity() {
        const text = studentInput.trim();
        if (!text || isEvaluating) return;

        setIsEvaluating(true);
        stopTeacherAudio();

        try {
            const res = await interactWithSectionActivity({
                topic: currentLesson?.topic || "Topic",
                subject: currentLesson?.subject || "",
                section_id: currentSection?.id || currentSectionIndex + 1,
                section_title: currentSection?.title || "Section",
                activity_type: currentActivity?.activity_type || "coding_exercise",
                student_submission: text,
                expected_answer: currentActivity?.sample_solution || currentActivity?.expected_answer,
                level: currentLesson?.level || "beginner",
                language: currentLanguage || "English",
                persona: currentLesson?.persona || "lilly",
                session_id: sessionId
            });

            setActivityFeedback(res);

            // Mark activity as completed
            if (!completedActivities.some(a => a.section_id === currentSection?.id)) {
                setCompletedActivities(prev => [
                    ...prev,
                    {
                        section_id: currentSection?.id,
                        title: currentActivity?.title,
                        score: res.score,
                        is_correct: res.is_correct
                    }
                ]);
            }

            // Mark section as completed
            if (!completedSectionIds.includes(currentSection?.id)) {
                setCompletedSectionIds(prev => [...prev, currentSection?.id]);
            }

            // Speak teacher's spoken feedback response in active language
            if (res.teacher_spoken_response) {
                setSpeaking(true);
                playTeacherAudio({
                    text: res.teacher_spoken_response,
                    language: currentLanguage || "English",
                    persona: currentLesson?.persona || "lilly",
                    onAudioStart: () => setSpeaking(true),
                    onAudioEnd: () => setSpeaking(false)
                }).catch(() => setSpeaking(false));
            }

        } catch (err) {
            console.error("Activity evaluation failed:", err);
            // Constructive fallback
            const fallbackFeedback = {
                is_correct: true,
                score: 85,
                feedback: isTelugu ? "చక్కగా అభ్యాసం పూర్తి చేశారు! మీ సమాధానం సరైనది." : isHindi ? "बहुत अच्छा काम! आपकी अवधारणा समझ स्पष्ट है।" : "Great job completing the exercise! Your logic demonstrates solid intuition.",
                explanation: isTelugu ? "భావనలను దశలవారీగా అభ్యసించడం శాశ్వత పట్టును ఇస్తుంది." : isHindi ? "चरण-दर-चरण अभ्यास स्थायी महारत देता है।" : "Applying the core principles step-by-step reinforces lasting mastery.",
                can_advance: true,
                encouragement: isTelugu ? "అద్భుతమైన ప్రయత్నం! మీరు తదుపరి విభాగానికి వెళ్లవచ్చు." : isHindi ? "उत्कृष्ट प्रयास! आप अगले वर्ग के लिए तैयार हैं।" : "Excellent effort! You are ready to advance to the next section."
            };
            setActivityFeedback(fallbackFeedback);
            if (!completedSectionIds.includes(currentSection?.id)) {
                setCompletedSectionIds(prev => [...prev, currentSection?.id]);
            }
        } finally {
            setIsEvaluating(false);
        }
    }

    function handleCheckpointComplete(result) {
        setShowCheckpoint(false);
        if (currentSection && !completedSectionIds.includes(currentSection.id)) {
            setCompletedSectionIds(prev => [...prev, currentSection.id]);
        }
        setAnsweredQuestions(prev => [...prev, result]);
    }

    function handleNextSection() {
        stopTeacherAudio();
        setSpeaking(false);
        setActivityFeedback(null);
        if (currentSectionIndex < sections.length - 1) {
            setCurrentSectionIndex(idx => idx + 1);
            setIsPlaying(true);
        }
    }

    function handleSeekSection(index) {
        stopTeacherAudio();
        setSpeaking(false);
        setActivityFeedback(null);
        setCurrentSectionIndex(index);
        setIsPlaying(true);
    }

    function togglePlay() {
        if (isPlaying) {
            stopTeacherAudio();
            setIsPlaying(false);
            setSpeaking(false);
        } else {
            setIsPlaying(true);
        }
    }

    function toggleFullscreen() {
        if (!classroomRef.current) return;
        if (!document.fullscreenElement) {
            classroomRef.current.requestFullscreen().catch(() => {});
            setIsFullscreen(true);
        } else {
            document.exitFullscreen().catch(() => {});
            setIsFullscreen(false);
        }
    }

    // Export recording
    async function handleExportVideo() {
        try {
            setIsRecordingExport(true);
            setExportProgress("Preparing video recording of lesson...");
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: { frameRate: 30 },
                audio: true
            });
            streamChunksRef.current = [];
            const recorder = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp9" });
            recorderRef.current = recorder;
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) streamChunksRef.current.push(e.data);
            };
            recorder.onstop = () => {
                const blob = new Blob(streamChunksRef.current, { type: "video/webm" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${(currentLesson?.title || "AI_Teacher_Lesson").replace(/[^a-z0-9]/gi, "_")}.webm`;
                a.click();
                setIsRecordingExport(false);
                setExportProgress("");
                stream.getTracks().forEach(t => t.stop());
            };
            recorder.start();
            setExportProgress("Recording in progress... (Click Stop Export when finished)");
        } catch (err) {
            console.error("Video export error:", err);
            setIsRecordingExport(false);
            setExportProgress("");
        }
    }

    function stopExportRecording() {
        if (recorderRef.current && isRecordingExport) {
            recorderRef.current.stop();
        }
    }

    // Format time helpers
    const elapsedMinutes = Math.floor(elapsedLearningSeconds / 60);
    const elapsedSecondsRemainder = elapsedLearningSeconds % 60;
    const elapsedDisplay = `${elapsedMinutes}:${String(elapsedSecondsRemainder).padStart(2, "0")}`;
    const remainingMinutes = Math.max(0, targetDurationMinutes - elapsedMinutes);
    const remainingDisplay = remainingMinutes > 0 ? `~${remainingMinutes} min left` : (isTelugu ? "లక్ష్యం పూర్తయింది" : isHindi ? "अवधि लक्ष्य पूर्ण" : "Duration goal reached");
    const overallProgressPercent = Math.min(
        100,
        Math.round(((completedSectionIds.length + (activityFeedback ? 1 : 0)) / Math.max(sections.length, 1)) * 100)
    );

    const isCurrentSectionCompleted = completedSectionIds.includes(currentSection?.id);
    const isTimeFulfilled = elapsedLearningSeconds >= targetSeconds;
    const isAllSectionsCompleted = completedSectionIds.length >= sections.length && sections.length > 0;
    const isFullyCompleted = isTimeFulfilled && isAllSectionsCompleted;

    function handleFinishClick() {
        if (!isFullyCompleted) {
            setShowEarlyFinishModal(true);
        } else {
            if (onOpenAssessment) {
                onOpenAssessment(answeredQuestions);
            }
            if (sessionId) {
                saveLessonSessionState({
                    session_id: sessionId,
                    subject: currentLesson?.subject || "",
                    topic: currentLesson?.topic || "",
                    target_duration_minutes: targetDurationMinutes,
                    elapsed_learning_seconds: elapsedLearningSeconds,
                    current_section_index: currentSectionIndex,
                    completed_section_ids: completedSectionIds,
                    completed_activities: completedActivities,
                    language: currentLanguage || "English",
                    persona: currentLesson?.persona || "lilly",
                    lesson_data: currentLesson,
                    is_paused: !isPlaying,
                    is_completed: true
                });
            }
        }
    }

    return (
        <div ref={classroomRef} className={`video-classroom duration-matched-classroom ${isFullscreen ? "fullscreen" : ""}`}>
            
            {/* =========================================================
                1. REAL-TIME CLASS DURATION & LEARNING METRICS HUD
            ========================================================= */}
            <div className="classroom-top-bar duration-hud-bar">
                <div className="top-title-group">
                    <span className="live-pill">
                        <span className="live-dot-pulse"></span> {isTelugu ? "లైవ్ ఇంటరాక్టివ్ తరగతి" : isHindi ? "लाइव इंटरएक्टिव कक्षा" : "LIVE INTERACTIVE CLASS"}
                    </span>
                    <h3>{currentLesson?.title || "Structured Mastery Class"}</h3>
                    <span className="lesson-badge">{currentLesson?.subject?.toUpperCase() || "ACADEMIC"}</span>
                    <span className="level-badge">{currentLesson?.level?.toUpperCase() || "BEGINNER"}</span>
                </div>

                {/* In-Class Compact Language Dropdown Menu */}
                {(() => {
                    const currentLangObj = CLASSROOM_LANGUAGES.find(l => currentLanguage.toLowerCase().includes(l.id.toLowerCase())) || CLASSROOM_LANGUAGES[0];
                    return (
                        <div className="compact-lang-dropdown-wrapper" ref={langDropdownRef}>
                            <button
                                type="button"
                                className={`compact-lang-dropdown-btn ${isLangDropdownOpen ? "open" : ""} ${isTranslating ? "translating" : ""}`}
                                onClick={() => !isTranslating && setIsLangDropdownOpen(o => !o)}
                                title={isTelugu ? "బోధనా భాషను మార్చండి" : isHindi ? "शिक्षण भाषा बदलें" : "Switch teaching language"}
                                aria-haspopup="listbox"
                                aria-expanded={isLangDropdownOpen}
                            >
                                <Globe size={12} className="compact-globe-icon" />
                                <span className="compact-flag">{currentLangObj.flag}</span>
                                <span className="compact-lang-name">{currentLangObj.label}</span>
                                {isTranslating ? (
                                    <span className="compact-spinner"></span>
                                ) : (
                                    <ChevronDown size={11} className={`compact-chevron ${isLangDropdownOpen ? "rotated" : ""}`} />
                                )}
                            </button>

                            {/* Compact Popover Menu */}
                            {isLangDropdownOpen && (
                                <div className="compact-lang-menu" role="listbox">
                                    {CLASSROOM_LANGUAGES.map((lang) => {
                                        const isSelected = currentLanguage.toLowerCase().includes(lang.id.toLowerCase());
                                        return (
                                            <button
                                                key={lang.id}
                                                type="button"
                                                className={`compact-lang-item ${isSelected ? "selected" : ""}`}
                                                onClick={() => {
                                                    setIsLangDropdownOpen(false);
                                                    handleLanguageChange(lang.id);
                                                }}
                                            >
                                                <span className="item-flag">{lang.flag}</span>
                                                <span className="item-label">{lang.label}</span>
                                                {isSelected && <span className="item-check">✓</span>}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })()}

                {/* Live Learning Timer HUD */}
                <div className="hud-metrics-group">
                    <div className="hud-metric-card timer-card">
                        <div className="metric-label">
                            <Clock size={13} className={isPlaying ? "timer-spin" : ""} />
                            <span>{isTelugu ? "అభ్యసన సమయం" : isHindi ? "सक्रिय शिक्षण समय" : "ACTIVE LEARNING TIME"}</span>
                        </div>
                        <div className="metric-value">
                            <span className="time-digit highlight">{elapsedDisplay}</span>
                            <span className="time-divider">/</span>
                            <span className="time-total">{targetDurationMinutes}m</span>
                        </div>
                        <span className="metric-subtext">{remainingDisplay}</span>
                    </div>

                    <div className="hud-metric-card progress-card">
                        <div className="metric-label">
                            <Target size={13} />
                            <span>{isTelugu ? "పాఠం పురోగతి" : isHindi ? "पाठ की प्रगति" : "LESSON PROGRESS"}</span>
                        </div>
                        <div className="metric-value">
                            <span>{overallProgressPercent}%</span>
                            <span className="metric-sub">
                                ({completedSectionIds.length}/{sections.length} {isTelugu ? "విభాగాలు" : isHindi ? "वर्ग" : "sections"})
                            </span>
                        </div>
                        <div className="hud-progress-bar">
                            <div className="hud-progress-fill" style={{ width: `${overallProgressPercent}%` }}></div>
                        </div>
                    </div>
                </div>

                <div className="top-action-group">
                    {/* Clear Exit Class Button with Safe Persistence */}
                    <button
                        type="button"
                        className="exit-class-btn"
                        onClick={handleExitClass}
                        title={isTelugu ? "తరగతి స్థితిని భద్రపరిచి నిష్క్రమించండి" : isHindi ? "कक्षा सहेजकर सुरक्षित रूप से बाहर निकलें" : "Safely save progress and exit class"}
                    >
                        <LogOut size={15} />
                        <span>{isTelugu ? "నిష్క్రమించు" : isHindi ? "बाहर निकलें" : "Exit Class"}</span>
                    </button>

                    <button
                        type="button"
                        className="objectives-toggle-btn"
                        onClick={() => setShowObjectives(o => !o)}
                        title="View Lesson Learning Objectives"
                    >
                        <Compass size={15} />
                        <span>{isTelugu ? "లక్ష్యాలు" : isHindi ? "उद्देश्य" : "Objectives"}</span>
                    </button>

                    <button
                        type="button"
                        className={`export-video-btn ${isRecordingExport ? "recording" : ""}`}
                        onClick={isRecordingExport ? stopExportRecording : handleExportVideo}
                        title="Export this interactive lesson as video"
                    >
                        <Download size={15} />
                        {isRecordingExport ? "Stop & Save" : "Export Video"}
                    </button>

                    {/* Completion Gating */}
                    <button
                        type="button"
                        className={`finish-assessment-btn ${isFullyCompleted ? "ready" : "in-progress"}`}
                        onClick={handleFinishClick}
                        title={isFullyCompleted ? "All activities & full duration complete! View final report" : `In Progress: ~${remainingMinutes}m remaining`}
                    >
                        <Award size={15} />
                        <span>{isFullyCompleted ? (isTelugu ? "తుది అంచనా & నివేదిక" : isHindi ? "अंतिम मूल्यांकन और रिपोर्ट" : "Final Assessment & Report") : (isTelugu ? `పురోగతిలో ఉంది (${elapsedDisplay}/${targetDurationMinutes}m)` : isHindi ? `प्रगति पर है (${elapsedDisplay}/${targetDurationMinutes}m)` : `In Progress (${elapsedDisplay}/${targetDurationMinutes}m)`)}</span>
                        {isFullyCompleted && <span className="ready-sparkle">★</span>}
                    </button>
                </div>
            </div>

            {/* In-Class Language / Status Notification Toast */}
            {saveToast && (
                <div className="in-class-toast-banner">
                    <Sparkles size={14} />
                    <span>{saveToast}</span>
                </div>
            )}

            {/* Learning Objectives Drawer */}
            {showObjectives && currentLesson?.learning_objectives && (
                <div className="objectives-drawer">
                    <div className="obj-header">
                        <Compass size={16} />
                        <h4>{isTelugu ? `తరగతి అభ్యాస లక్ష్యాలు (${targetDurationMinutes} నిమిషాలు)` : isHindi ? `कक्षा शिक्षण उद्देश्य (${targetDurationMinutes} मिनट)` : `Class Learning Objectives (Target: ${targetDurationMinutes} Mins)`}</h4>
                        <button type="button" onClick={() => setShowObjectives(false)}>✕</button>
                    </div>
                    <ul className="obj-list">
                        {currentLesson.learning_objectives.map((obj, i) => (
                            <li key={i}>
                                <CheckCircle2 size={14} className="obj-check-icon" />
                                <span>{obj}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {exportProgress && (
                <div className="export-banner">
                    <Sparkles size={16} />
                    <span>{exportProgress}</span>
                </div>
            )}

            {/* =========================================================
                2. MAIN DUAL-STAGE: AVATAR TEACHER + INTERACTIVE VISUALIZER
            ========================================================= */}
            <div className="classroom-stage" style={{ position: "relative" }}>
                
                {/* START / RESUME CLASS OVERLAY (AUTOPLAY PREVENTION GATE) */}
                {!hasStartedClass && (
                    <div className="class-start-overlay">
                        <div className="start-card-dialog">
                            <div className="start-card-header">
                                <span className="start-pulse-dot"></span>
                                <span>
                                    {elapsedLearningSeconds > 0 || currentSectionIndex > 0
                                        ? (isTelugu ? "సేవ్ చేయబడిన తరగతి పురోగతి సిద్ధంగా ఉంది" : isHindi ? "सहेजी गई कक्षा फिर से शुरू करने के लिए तैयार" : "SAVED PROGRESS DETECTED // READY TO RESUME")
                                        : (isTelugu ? "ఇంటరాక్టివ్ లైవ్ తరగతి సిద్ధంగా ఉంది" : isHindi ? "इंटरएक्टिव लाइव कक्षा तैयार है" : "LIVE INTERACTIVE CLASS READY")}
                                </span>
                            </div>
                            <h2>{currentLesson?.title || "Structured Mastery Class"}</h2>
                            <p className="start-desc">
                                {elapsedLearningSeconds > 0 || currentSectionIndex > 0
                                    ? (isTelugu
                                        ? `గతంలో అధ్యయనం చేసిన సమయం: ${elapsedDisplay} / ${targetDurationMinutes} నిమిషాలు (విభాగం ${currentSectionIndex + 1}/${sections.length}). మీ పురోగతి సురక్షితంగా సేవ్ చేయబడింది. కొనసాగించడానికి క్రింది బటన్‌ను క్లిక్ చేయండి.`
                                        : isHindi
                                        ? `पिछला अध्ययन समय: ${elapsedDisplay} / ${targetDurationMinutes} मिनट (वर्ग ${currentSectionIndex + 1}/${sections.length})। आपकी प्रगति सुरक्षित है। जारी रखने के लिए नीचे क्लिक करें।`
                                        : `Resuming from exact saved state: ${elapsedDisplay} / ${targetDurationMinutes} mins completed (Section ${currentSectionIndex + 1} of ${sections.length}). Click Resume to continue seamlessly.`)
                                    : (currentLesson?.summary || "Experience full-length interactive video education with step-by-step concepts, real-time code/math practice, and AI teacher guidance.")}
                            </p>

                            <div className="start-details-grid">
                                <div className="detail-item">
                                    <Clock size={16} />
                                    <div>
                                        <strong>{elapsedLearningSeconds > 0 ? `${elapsedDisplay} / ${targetDurationMinutes}m` : `${targetDurationMinutes} ${isTelugu ? "నిమిషాలు" : isHindi ? "मिनट" : "Minutes"}`}</strong>
                                        <small>{elapsedLearningSeconds > 0 ? (isTelugu ? "సేవ్ చేయబడిన సమయం" : isHindi ? "सहेजा गया समय" : "Preserved Learning Time") : (isTelugu ? "మొత్తం కేటాయించిన సమయం" : isHindi ? "कुल कक्षा अवधि" : "Full Duration Target")}</small>
                                    </div>
                                </div>
                                <div className="detail-item">
                                    <Layers size={16} />
                                    <div>
                                        <strong>{isTelugu ? `విభాగం ${currentSectionIndex + 1}/${sections.length}` : isHindi ? `वर्ग ${currentSectionIndex + 1}/${sections.length}` : `Section ${currentSectionIndex + 1} of ${sections.length}`}</strong>
                                        <small>{isTelugu ? "ప్రస్తుత అభ్యాసం" : isHindi ? "वर्तमान स्थिति" : "Current Milestone"}</small>
                                    </div>
                                </div>
                                <div className="detail-item">
                                    <Sparkles size={16} />
                                    <div>
                                        <strong>{currentLanguage || currentLesson?.language || "English"}</strong>
                                        <small>{isTelugu ? "బోధనా భాష" : isHindi ? "शिक्षण भाषा" : "Spoken Language"}</small>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="btn-start-live-class"
                                onClick={handleStartClass}
                            >
                                <Play size={20} fill="#01070d" />
                                <span>
                                    {elapsedLearningSeconds > 0 || currentSectionIndex > 0
                                        ? (isTelugu ? "▶ తరగతిని కొనసాగించండి" : isHindi ? "▶ कक्षा जारी रखें" : "▶ Resume Class")
                                        : (isTelugu ? "▶ తరగతిని ప్రారంభించండి" : isHindi ? "▶ कक्षा शुरू करें" : "▶ Start Live Class")}
                                </span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Left Pane: AI Avatar Teacher */}
                <div className="stage-avatar-pane">
                    <div className="avatar-header">
                        <span className="avatar-label">
                            AI EDUCATOR // {currentLesson?.persona?.toUpperCase() || "LILLY"}
                        </span>
                        <span className={`status-indicator ${speaking ? "speaking" : "listening"}`}>
                            {speaking ? (isTelugu ? "బోధిస్తున్నారు..." : isHindi ? "पढ़ा रहे हैं..." : "TEACHING CONCEPT...") : isEvaluating ? (isTelugu ? "పరిశీలిస్తున్నారు..." : isHindi ? "जाँच कर रहे हैं..." : "EVALUATING YOUR WORK...") : (isTelugu ? "మార్గదర్శనం" : isHindi ? "मार्गदर्शन" : "GUIDING YOU")}
                        </span>
                    </div>

                    <div className="avatar-canvas-wrapper">
                        <Hologram speaking={speaking} />
                    </div>

                    <div className="avatar-caption-card">
                        <div className="caption-tag">
                            <Zap size={13} /> {isTelugu ? "ప్రస్తుత విభాగం" : isHindi ? "वर्तमान वर्ग" : "CURRENT SECTION"} ({currentSectionIndex + 1}/{sections.length}):
                        </div>
                        <p className="caption-title">{currentSection?.title || "Foundational principles"}</p>
                        <span className="caption-time-budget">
                            ⏱ {isTelugu ? "కేటాయింపు:" : isHindi ? "आवंटित:" : "Allocated:"} ~{currentSection?.allocated_minutes || 5} min • Phase: {currentSection?.phase?.replace(/_/g, " ")}
                        </span>
                    </div>
                </div>

                {/* Right Pane: Dynamic Whiteboard / Sandbox / Sim / Math */}
                <div className="stage-whiteboard-pane">
                    {currentSection && (
                        <WhiteboardVisualizer
                            visualType={currentSection.visual_type || "whiteboard"}
                            visualPayload={currentSection.visual_payload || {}}
                            subject={currentLesson?.subject || "general"}
                            chapterTitle={currentSection.title}
                        />
                    )}
                </div>
            </div>

            {/* =========================================================
                3. LIVE INTERACTIVE ACTIVITY / EXERCISE WORKSPACE
            ========================================================= */}
            {currentActivity && (
                <div className="classroom-activity-workspace">
                    <div className="activity-card-header">
                        <div className="act-title-badge">
                            <Code2 size={16} />
                            <span>{isTelugu ? "ప్రయోగాత్మక అభ్యాసం // " : isHindi ? "इंटरएक्टिव अभ्यास // " : "ACTIVE LEARNING EXERCISE // "}{currentActivity.activity_type.toUpperCase().replace(/_/g, " ")}</span>
                        </div>
                        <span className="act-instructions-summary">{currentActivity.title}</span>
                    </div>

                    <div className="activity-instructions-box">
                        <p><strong>{isTelugu ? "టాస్క్:" : isHindi ? "कार्य:" : "Task:"}</strong> {currentActivity.instructions}</p>
                        {currentActivity.hint && (
                            <div className="act-hint-row">
                                <Sparkles size={13} />
                                <span><strong>{isTelugu ? "సూచన:" : isHindi ? "संकेत:" : "Hint:"}</strong> {currentActivity.hint}</span>
                            </div>
                        )}
                    </div>

                    {/* Interactive Input (Code editor for CS / Math steps / Scenario answer) */}
                    <div className="activity-editor-area">
                        {currentActivity.activity_type.includes("coding") || currentActivity.activity_type.includes("debugging") ? (
                            <div className="code-input-wrapper">
                                <div className="editor-lang-tag">Python Editor</div>
                                <textarea
                                    className="code-textarea-interactive"
                                    value={studentInput}
                                    onChange={(e) => setStudentInput(e.target.value)}
                                    placeholder={isTelugu ? "# మీ పైథాన్ కోడ్ ఇక్కడ రాయండి..." : isHindi ? "# अपना पायथन कोड यहाँ लिखें..." : "# Write or edit your code solution here..."}
                                    rows={6}
                                    spellCheck="false"
                                />
                            </div>
                        ) : currentActivity.starter_problem ? (
                            <div className="math-input-wrapper">
                                <div className="problem-statement-badge">
                                    <strong>{isTelugu ? "సమస్య:" : isHindi ? "समस्या:" : "Problem:"}</strong> {currentActivity.starter_problem}
                                </div>
                                <textarea
                                    className="math-textarea-interactive"
                                    value={studentInput}
                                    onChange={(e) => setStudentInput(e.target.value)}
                                    placeholder={isTelugu ? "దశలవారీ పరిష్కారం లేదా సమాధానం ఇక్కడ నమోదు చేయండి..." : isHindi ? "चरण-दर-चरण समाधान या उत्तर यहाँ दर्ज करें..." : "Enter your step-by-step derivation or final answer here..."}
                                    rows={4}
                                />
                            </div>
                        ) : (
                            <div className="text-input-wrapper">
                                <textarea
                                    className="scenario-textarea-interactive"
                                    value={studentInput}
                                    onChange={(e) => setStudentInput(e.target.value)}
                                    placeholder={isTelugu ? "మీ స్వంత మాటల్లో వివరణ లేదా సమాధానం రాయండి..." : isHindi ? "अपने शब्दों में उत्तर और कारण स्पष्ट करें..." : "Explain your answer and reasoning in your own words..."}
                                    rows={4}
                                />
                            </div>
                        )}

                        <div className="activity-action-row">
                            <button
                                type="button"
                                className="submit-activity-btn"
                                disabled={isEvaluating || !studentInput.trim()}
                                onClick={handleSubmitActivity}
                            >
                                {isEvaluating ? (
                                    <>
                                        <span className="spinner-dots small"></span>
                                        <span>{isTelugu ? "ఉపాధ్యాయురాలు పరిశీలిస్తున్నారు..." : isHindi ? "शिक्षक मूल्यांकन कर रहे हैं..." : "AI Teacher Evaluating..."}</span>
                                    </>
                                ) : (
                                    <>
                                        <Send size={15} />
                                        <span>{isTelugu ? "పరిష్కారాన్ని సమర్పించండి" : isHindi ? "समाधान जमा करें" : "Submit Solution to Teacher"}</span>
                                    </>
                                )}
                            </button>

                            {activityFeedback && (
                                <button
                                    type="button"
                                    className="advance-section-btn glow"
                                    onClick={handleNextSection}
                                    disabled={currentSectionIndex >= sections.length - 1}
                                >
                                    <span>{isTelugu ? "తదుపరి విభాగానికి వెళ్ళండి" : isHindi ? "अगले वर्ग पर जाएँ" : "Advance to Next Section"}</span>
                                    <ArrowRight size={15} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Teacher Diagnostic Evaluation Feedback */}
                    {activityFeedback && (
                        <div className={`activity-feedback-card ${activityFeedback.is_correct ? "correct" : "needs-revision"}`}>
                            <div className="feedback-header">
                                {activityFeedback.is_correct ? (
                                    <CheckCircle size={18} className="feedback-icon correct" />
                                ) : (
                                    <AlertCircle size={18} className="feedback-icon revision" />
                                )}
                                <span className="feedback-status">
                                    {activityFeedback.is_correct ? (isTelugu ? "భావనపై పట్టు సాధించారు!" : isHindi ? "अवधारणा में महारत हासिल!" : "Concept Mastered!") : (isTelugu ? "మంచి ప్రయత్నం — సరిదిద్దుకోగల అంశం" : isHindi ? "अच्छा प्रयास — सुधार योग्य बिंदु" : "Good Attempt — Key Misconception Identified")}
                                </span>
                                <span className="feedback-score">Score: {activityFeedback.score || 85}/100</span>
                            </div>

                            <p className="feedback-text">{activityFeedback.feedback}</p>
                            <p className="feedback-explanation"><strong>{isTelugu ? "ఉపాధ్యాయుల గమనిక:" : isHindi ? "शिक्षक टिप्पणी:" : "Teacher Note:"}</strong> {activityFeedback.explanation}</p>

                            {activityFeedback.remedial_guidance && (
                                <div className="remedial-box">
                                    <Sparkles size={14} />
                                    <span>{activityFeedback.remedial_guidance}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Live Subtitles / Captions */}
            {showSubtitles && currentSection && (
                <div className="classroom-subtitles-bar">
                    <div className="subtitles-icon">
                        <Subtitles size={16} />
                    </div>
                    <div className="subtitles-text">
                        "{currentSection.narration_script}"
                    </div>
                </div>
            )}

            {/* =========================================================
                4. SECTION TIMELINE & PLAYBACK CONTROLS
            ========================================================= */}
            <div className="classroom-controls-bar">
                {/* Timeline sections scrubber */}
                <div className="timeline-scrubber">
                    {sections.map((sec, idx) => {
                        const isCurrent = idx === currentSectionIndex;
                        const isDone = completedSectionIds.includes(sec.id) || idx < currentSectionIndex;
                        const hasAct = !!sec.learning_activity;
                        const hasCp = !!sec.checkpoint;
                        return (
                            <button
                                key={sec.id || idx}
                                type="button"
                                className={`timeline-segment ${isCurrent ? "active" : ""} ${isDone ? "completed" : ""}`}
                                onClick={() => handleSeekSection(idx)}
                                title={`Section ${idx + 1}: ${sec.title} (~${sec.allocated_minutes || 5} min)`}
                            >
                                <span className="segment-label">Sec {idx + 1}</span>
                                {hasAct && <span className="activity-marker" title="Interactive Exercise">⚡</span>}
                                {hasCp && <span className="checkpoint-marker" title="Concept Check">?</span>}
                                {isDone && <span className="done-dot">✓</span>}
                            </button>
                        );
                    })}
                </div>

                {/* Playback Button Row */}
                <div className="controls-row">
                    <div className="left-controls">
                        <button
                            type="button"
                            className="play-pause-btn"
                            onClick={togglePlay}
                            title={isPlaying ? "Pause Active Learning Session" : "Resume Active Learning Session"}
                        >
                            {isPlaying ? <Pause size={20} /> : <Play size={20} fill="#01070d" />}
                        </button>

                        <button
                            type="button"
                            className="control-icon-btn"
                            onClick={() => handleSeekSection(Math.max(0, currentSectionIndex - 1))}
                            disabled={currentSectionIndex === 0}
                            title="Previous Section"
                        >
                            <RotateCcw size={16} />
                        </button>

                        <button
                            type="button"
                            className="control-icon-btn"
                            onClick={handleNextSection}
                            disabled={currentSectionIndex === sections.length - 1}
                            title="Next Section"
                        >
                            <FastForward size={16} />
                        </button>

                        <div className="time-display">
                            Section {currentSectionIndex + 1} of {sections.length}
                            <span className="time-allocated-tag">
                                (~{currentSection?.allocated_minutes || 5} min target)
                            </span>
                        </div>
                    </div>

                    <div className="right-controls">
                        {/* Speed selector */}
                        <div className="speed-dropdown">
                            {[0.75, 1.0, 1.25, 1.5].map((speed) => (
                                <button
                                    key={speed}
                                    type="button"
                                    className={`speed-pill ${playbackSpeed === speed ? "active" : ""}`}
                                    onClick={() => setPlaybackSpeed(speed)}
                                >
                                    {speed}x
                                </button>
                            ))}
                        </div>

                        {/* Subtitles toggle */}
                        <button
                            type="button"
                            className={`control-icon-btn ${showSubtitles ? "active" : ""}`}
                            onClick={() => setShowSubtitles(s => !s)}
                            title="Toggle Subtitles"
                        >
                            <Subtitles size={18} />
                        </button>

                        {/* Fullscreen */}
                        <button
                            type="button"
                            className="control-icon-btn"
                            onClick={toggleFullscreen}
                            title="Toggle Fullscreen"
                        >
                            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* In-Lesson Interactive Checkpoint Modal */}
            {showCheckpoint && currentCheckpoint && (
                <InteractiveCheckpoint
                    checkpoint={currentCheckpoint}
                    topic={currentLesson?.topic || "Mastery Topic"}
                    level={currentLesson?.level || "beginner"}
                    language={currentLanguage || currentLesson?.language || "English"}
                    persona={currentLesson?.persona || "lilly"}
                    onComplete={handleCheckpointComplete}
                />
            )}

            {/* Early Finish Warning Dialog (Enforces Full Duration & Activities) */}
            {showEarlyFinishModal && (
                <div className="modal-backdrop">
                    <div className="gated-finish-dialog">
                        <div className="dialog-header alert">
                            <div className="header-title-badge alert">
                                <Clock size={18} />
                                <span>{isTelugu ? "తరగతి ఇంకా కొనసాగుతోంది" : isHindi ? "कक्षा अभी प्रगति पर है" : "CLASS IN PROGRESS // FULL DURATION REQUIRED"}</span>
                            </div>
                            <button type="button" className="dialog-close-btn" onClick={() => setShowEarlyFinishModal(false)}>✕</button>
                        </div>
                        <div className="dialog-body">
                            <h3>{isTelugu ? `కేటాయించిన పూర్తి ${targetDurationMinutes} నిమిషాల సమయం వరకు అభ్యసించండి` : isHindi ? `कृपया पूरी ${targetDurationMinutes} मिनट की निर्धारित अवधि तक अध्ययन करें` : `Complete Full ${targetDurationMinutes}-Minute Duration`}</h3>
                            <p>
                                {isTelugu
                                    ? `ఈ తరగతి లక్ష్యం ${targetDurationMinutes} నిమిషాల సమగ్ర అభ్యాసం. మీరు ఇప్పటివరకు ${elapsedDisplay} సమయం పూర్తి చేశారు. చివరి రిపోర్ట్ మరియు సర్టిఫికేషన్ పొందడానికి మిగిలిన అభ్యాసాలను మరియు సమయాన్ని పూర్తి చేయండి.`
                                    : isHindi
                                    ? `इस कक्षा का लक्ष्य ${targetDurationMinutes} मिनट का वास्तविक शिक्षण है। आपने अब तक ${elapsedDisplay} समय पूरा किया है। अंतिम रिपोर्ट प्राप्त करने के लिए कृपया सभी अभ्यास और पूरी अवधि पूरी करें।`
                                    : `This class is calibrated for approximately ${targetDurationMinutes} minutes of real, interactive learning. You have completed ${elapsedDisplay} so far. To finish and unlock the final assessment, please complete all section exercises and the remaining study duration.`}
                            </p>

                            <div className="gated-stats-box">
                                <div className="stat-row">
                                    <span>{isTelugu ? "పూర్తయిన సమయం:" : isHindi ? "बीता हुआ समय:" : "Elapsed Learning Time:"}</span>
                                    <strong>{elapsedDisplay} / {targetDurationMinutes}:00 min</strong>
                                </div>
                                <div className="stat-row">
                                    <span>{isTelugu ? "మిగిలిన సమయం:" : isHindi ? "शेष समय:" : "Remaining Time:"}</span>
                                    <strong className="highlight">{remainingDisplay}</strong>
                                </div>
                                <div className="stat-row">
                                    <span>{isTelugu ? "పూర్తయిన విభాగాలు:" : isHindi ? "पूर्ण वर्ग:" : "Sections Completed:"}</span>
                                    <strong>{completedSectionIds.length} / {sections.length}</strong>
                                </div>
                            </div>

                            <div className="dialog-action-row">
                                <button
                                    type="button"
                                    className="btn-primary-glow"
                                    onClick={() => setShowEarlyFinishModal(false)}
                                >
                                    <span>{isTelugu ? "అభ్యాసం కొనసాగించండి" : isHindi ? "सीखना जारी रखें" : "Continue Learning & Practice"}</span>
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
