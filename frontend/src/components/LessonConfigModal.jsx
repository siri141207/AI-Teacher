import { useState } from "react";
import { 
    BookOpen, 
    Clock, 
    Compass, 
    FileText, 
    Globe2, 
    GraduationCap, 
    Layers,
    Sparkles, 
    Target, 
    UserCheck, 
    X, 
    Zap 
} from "lucide-react";
import { MASTER_CURRICULUM, getCurriculumBySubject } from "../data/curriculum";

export default function LessonConfigModal({
    isOpen,
    onClose,
    onGenerateLesson,
    uploadedDocName = null
}) {
    const [selectedDomain, setSelectedDomain] = useState("Python Programming");
    const [topic, setTopic] = useState(uploadedDocName ? `Lesson on ${uploadedDocName}` : "Python Basics & Syntax");
    const [level, setLevel] = useState("beginner");
    const [timeMinutes, setTimeMinutes] = useState(20);
    const [language, setLanguage] = useState("English");
    const [persona, setPersona] = useState("lilly");
    const [goal, setGoal] = useState("Master core concepts with visual intuition");
    const [useRag, setUseRag] = useState(!!uploadedDocName);
    const [isGenerating, setIsGenerating] = useState(false);

    if (!isOpen) return null;

    const currentDomainData = getCurriculumBySubject(selectedDomain);

    async function handleStart() {
        if (!topic.trim()) return;
        setIsGenerating(true);
        try {
            await onGenerateLesson({
                topic: topic.trim(),
                subject: selectedDomain,
                level,
                language,
                time_minutes: timeMinutes,
                persona,
                goal,
                use_rag: useRag
            });
            onClose();
        } catch (err) {
            console.error("Lesson generation failed:", err);
            alert("Could not generate lesson. Please check backend connection.");
        } finally {
            setIsGenerating(false);
        }
    }

    return (
        <div className="modal-backdrop">
            <div className="lesson-config-dialog">
                <div className="dialog-header">
                    <div className="header-title-badge">
                        <Sparkles size={18} />
                        <span>AI TEACHER STUDIO // LESSON PLANNER</span>
                    </div>
                    <button type="button" className="dialog-close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="dialog-body">
                    {/* Domain & Curriculum Chapter Quick Select */}
                    <div className="form-group">
                        <label className="field-label">
                            <Layers size={16} />
                            <span>Select Subject Domain:</span>
                        </label>
                        <select 
                            className="select-input"
                            value={selectedDomain}
                            onChange={(e) => {
                                const newDom = e.target.value;
                                setSelectedDomain(newDom);
                                const domData = getCurriculumBySubject(newDom);
                                if (domData && domData.chapters.length > 0) {
                                    setTopic(domData.chapters[0].title);
                                }
                            }}
                        >
                            {MASTER_CURRICULUM.map(d => (
                                <option key={d.id} value={d.name}>
                                    {d.icon} {d.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Chapter Quick Chips */}
                    {currentDomainData && (
                        <div className="form-group">
                            <label className="field-label-small">
                                <span>Curriculum Chapters for {currentDomainData.name}:</span>
                            </label>
                            <div className="curriculum-modal-chips">
                                {currentDomainData.chapters.map(ch => (
                                    <button
                                        key={ch.id}
                                        type="button"
                                        className={`ch-modal-chip ${topic === ch.title ? "active" : ""}`}
                                        onClick={() => setTopic(ch.title)}
                                    >
                                        <span className="chip-num">0{ch.id}</span>
                                        <span>{ch.title}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Topic or Uploaded Doc */}
                    <div className="form-group">
                        <label className="field-label">
                            <BookOpen size={16} />
                            <span>Lesson Topic or Sub-concept:</span>
                        </label>
                        <input
                            type="text"
                            className="text-input"
                            placeholder="e.g. Variables, Data Types & Operators..."
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                        />
                        {uploadedDocName && (
                            <div className="doc-active-pill">
                                <FileText size={14} />
                                <span>Grounding with uploaded document: <strong>{uploadedDocName}</strong></span>
                                <label className="rag-checkbox-label">
                                    <input 
                                        type="checkbox" 
                                        checked={useRag} 
                                        onChange={(e) => setUseRag(e.target.checked)} 
                                    />
                                    Enable RAG Knowledge Grounding
                                </label>
                            </div>
                        )}
                    </div>

                    {/* Learner Level */}
                    <div className="form-group">
                        <label className="field-label">
                            <GraduationCap size={16} />
                            <span>Learner Experience Level</span>
                        </label>
                        <div className="segmented-picker">
                            {[
                                { id: "beginner", label: "Beginner", desc: "Intuitive analogies, fundamental terminology" },
                                { id: "intermediate", label: "Intermediate", desc: "Practical applications, real-world examples" },
                                { id: "advanced", label: "Advanced", desc: "First-principles math, deep technical rigor" }
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    className={`segment-btn ${level === item.id ? "active" : ""}`}
                                    onClick={() => setLevel(item.id)}
                                >
                                    <strong>{item.label}</strong>
                                    <small>{item.desc}</small>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Time Available & Class Duration */}
                    <div className="form-group">
                        <div className="field-label-row">
                            <label className="field-label">
                                <Clock size={16} />
                                <span>Target Class Duration & Depth:</span>
                            </label>
                            <span className="duration-pill-active">
                                {timeMinutes >= 60 
                                    ? `${(timeMinutes / 60).toFixed(timeMinutes % 60 === 0 ? 0 : 1)} Hr (${timeMinutes} Mins)` 
                                    : `${timeMinutes} Minutes`}
                            </span>
                        </div>
                        <div className="segmented-picker time-picker duration-grid-picker">
                            {[
                                { min: 15, label: "15 Min", badge: "Flash", desc: "3 sections • 1 practice drill" },
                                { min: 30, label: "30 Min", badge: "Standard", desc: "5 sections • 2 exercises + check" },
                                { min: 45, label: "45 Min", badge: "Intensive", desc: "7 sections • 3 drills + debug" },
                                { min: 60, label: "1 Hour", badge: "Masterclass", desc: "9 sections • 4 exercises + case study" },
                                { min: 90, label: "1.5 Hours", badge: "Workshop", desc: "12 sections • multi-step problem sets" },
                                { min: 120, label: "2 Hours", badge: "Comprehensive", desc: "15 sections • full project & drills" }
                            ].map((item) => (
                                <button
                                    key={item.min}
                                    type="button"
                                    className={`segment-btn ${timeMinutes === item.min ? "active" : ""}`}
                                    onClick={() => setTimeMinutes(item.min)}
                                >
                                    <div className="seg-top">
                                        <strong>{item.label}</strong>
                                        <span className="seg-badge">{item.badge}</span>
                                    </div>
                                    <small>{item.desc}</small>
                                </button>
                            ))}
                        </div>

                        {/* Custom Duration Input */}
                        <div className="custom-duration-row">
                            <label className="custom-dur-label">Or custom minutes:</label>
                            <input 
                                type="number" 
                                min="5" 
                                max="240" 
                                step="5"
                                className="custom-dur-input" 
                                value={timeMinutes}
                                onChange={(e) => setTimeMinutes(Math.max(5, parseInt(e.target.value) || 30))}
                            />
                            <span className="dur-unit">minutes</span>
                        </div>
                    </div>

                    {/* Language Selection */}
                    <div className="form-row-2col">
                        <div className="form-group">
                            <label className="field-label">
                                <Globe2 size={16} />
                                <span>Teaching Language</span>
                            </label>
                            <select
                                className="select-input"
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                            >
                                <option value="English">🇬🇧 English (Global)</option>
                                <option value="Hindi">🇮🇳 हिंदी (Hindi)</option>
                                <option value="Telugu">🇮🇳 తెలుగు (Telugu)</option>
                                <option value="Hinglish">Conversational Hinglish</option>
                                <option value="Spanish">Español (Spanish)</option>
                                <option value="French">Français (French)</option>
                                <option value="Tamil">தமிழ் (Tamil)</option>
                                <option value="German">Deutsch (German)</option>
                            </select>
                        </div>

                        {/* Teacher Persona */}
                        <div className="form-group">
                            <label className="field-label">
                                <UserCheck size={16} />
                                <span>AI Teacher Personality</span>
                            </label>
                            <select
                                className="select-input"
                                value={persona}
                                onChange={(e) => setPersona(e.target.value)}
                            >
                                <option value="lilly">Lilly — Warm, Encouraging & Analogy-rich</option>
                                <option value="vikram">Prof. Vikram — Rigorous, Analytical & Academic</option>
                                <option value="alex">Alex — Practical, Energetic & Code-driven</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="dialog-footer">
                    <button type="button" className="btn-secondary" onClick={onClose} disabled={isGenerating}>
                        Cancel
                    </button>
                    <button 
                        type="button" 
                        className="btn-primary-glow"
                        disabled={isGenerating || !topic.trim()}
                        onClick={handleStart}
                    >
                        {isGenerating ? (
                            <>
                                <span className="spinner-dots"></span>
                                Orchestrating Video Lesson...
                            </>
                        ) : (
                            <>
                                <Zap size={16} />
                                Generate AI Video Lesson
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
