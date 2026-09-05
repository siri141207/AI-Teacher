import { useState } from "react";
import { 
    ArrowRight, 
    BookOpen, 
    CheckCircle2, 
    Clock, 
    Compass, 
    GitBranch, 
    Globe2,
    GraduationCap, 
    Layers, 
    Play, 
    Sparkles, 
    Trophy, 
    X, 
    Zap 
} from "lucide-react";
import { createLearningPath } from "../services/api";
import { MASTER_CURRICULUM, getCurriculumBySubject } from "../data/curriculum";

export default function LearningPathModal({
    isOpen,
    onClose,
    onStartLessonFromPath
}) {
    const [topic, setTopic] = useState("Python Programming");
    const [targetGoal, setTargetGoal] = useState("Mastery & Practical Application");
    const [level, setLevel] = useState("beginner");
    const [selectedLanguage, setSelectedLanguage] = useState("English");
    const [selectedDuration, setSelectedDuration] = useState(30);
    const [loading, setLoading] = useState(false);
    const [pathData, setPathData] = useState(null);

    if (!isOpen) return null;

    async function handleGeneratePath(overrideTopic) {
        const queryTopic = (typeof overrideTopic === "string" ? overrideTopic : topic).trim();
        if (!queryTopic) return;
        setLoading(true);
        try {
            const res = await createLearningPath({
                topic: queryTopic,
                target_role_or_goal: targetGoal,
                current_level: level,
                language: selectedLanguage
            });
            setPathData(res);
        } catch (err) {
            console.error("Learning path generation failed, using curriculum roadmap:", err);
            const matched = getCurriculumBySubject(queryTopic);
            setPathData({
                topic: matched ? matched.name : queryTopic,
                summary: matched ? matched.description : `Structured 5-module path for ${queryTopic}.`,
                target_role: targetGoal,
                total_estimated_hours: 35,
                modules: matched ? matched.chapters.map((ch, idx) => ({
                    module_number: ch.id,
                    title: ch.title,
                    duration_hrs: 6 + idx * 2,
                    difficulty: idx === 0 ? "Beginner" : idx < 3 ? "Intermediate" : "Advanced",
                    description: ch.summary,
                    key_topics: [ch.title, "Core Principles & Mental Models", "Interactive Problem Solving", "Hands-on Verification"],
                    milestone_project: `Build and document a comprehensive practical project on ${ch.title}`
                })) : [
                    {
                        module_number: 1,
                        title: "Foundations & Principles",
                        duration_hrs: 8,
                        difficulty: "Beginner",
                        description: "Core terminology and intuitive mental models.",
                        key_topics: ["Definitions", "First Principles", "Core Axioms"],
                        milestone_project: "Foundations Capstone Exercise"
                    }
                ]
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="modal-backdrop">
            <div className="learning-path-dialog">
                <div className="dialog-header">
                    <div className="header-title-badge">
                        <GitBranch size={18} />
                        <span>AI CURRICULUM ROADMAP // 10 DOMAIN LEARNING PATHS</span>
                    </div>
                    <button type="button" className="dialog-close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Quick Subject Chips */}
                <div className="modal-subject-chips">
                    {MASTER_CURRICULUM.map(sub => (
                        <button
                            key={sub.id}
                            type="button"
                            className={`modal-sub-chip ${topic === sub.name ? "active" : ""}`}
                            onClick={() => {
                                setTopic(sub.name);
                                handleGeneratePath(sub.name);
                            }}
                        >
                            <span>{sub.icon}</span>
                            <span>{sub.name}</span>
                        </button>
                    ))}
                </div>

                {/* Path Configuration Bar: Topic, Level, Language & Class Duration */}
                <div className="path-top-config-grid">
                    <div className="form-group">
                        <label className="field-label">Target Domain or Subject:</label>
                        <input
                            type="text"
                            className="text-input"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g. Python Programming, Physics, Economics..."
                        />
                    </div>

                    <div className="form-group">
                        <label className="field-label">Experience Level:</label>
                        <select className="select-input" value={level} onChange={(e) => setLevel(e.target.value)}>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="field-label">
                            <Globe2 size={14} />
                            <span>Language:</span>
                        </label>
                        <select 
                            className="select-input" 
                            value={selectedLanguage} 
                            onChange={(e) => setSelectedLanguage(e.target.value)}
                        >
                            <option value="English">🇬🇧 English (Global)</option>
                            <option value="Hindi">🇮🇳 हिंदी (Hindi)</option>
                            <option value="Telugu">🇮🇳 తెలుగు (Telugu)</option>
                            <option value="Hinglish">Conversational Hinglish</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="field-label">
                            <Clock size={14} />
                            <span>Class Duration:</span>
                        </label>
                        <select 
                            className="select-input" 
                            value={selectedDuration} 
                            onChange={(e) => setSelectedDuration(Number(e.target.value))}
                        >
                            <option value={30}>⏱ 30 Minutes (5 Sections)</option>
                            <option value={60}>⏱ 1 Hour (9 Sections)</option>
                            <option value={120}>⏱ 2 Hours (15 Sections)</option>
                            <option value={15}>⏱ 15 Minutes (Flash)</option>
                            <option value={45}>⏱ 45 Minutes (Intensive)</option>
                        </select>
                    </div>

                    <div className="form-group action-group">
                        <button
                            type="button"
                            className="btn-primary-glow"
                            disabled={loading || !topic.trim()}
                            onClick={handleGeneratePath}
                        >
                            {loading ? "Designing Roadmap..." : "Generate Learning Path"}
                        </button>
                    </div>
                </div>

                <div className="dialog-body path-modules-container">
                    {loading && (
                        <div className="report-loading-state">
                            <div className="spinner-glow"></div>
                            <h4>AI Curriculum Architect is Designing Your Syllabus...</h4>
                            <p>Sequencing prerequisites, hands-on milestones, and estimated completion times in {selectedLanguage}.</p>
                        </div>
                    )}

                    {!loading && pathData && (
                        <>
                            <div className="path-summary-card">
                                <div className="summary-left">
                                    <h3>{pathData.topic}</h3>
                                    <p>{pathData.summary}</p>
                                </div>
                                <div className="summary-badges">
                                    <span className="badge-hrs">
                                        <Clock size={14} /> ~{pathData.total_estimated_hours} Hours Total
                                    </span>
                                    <span className="badge-modules">
                                        <Layers size={14} /> {pathData.modules?.length || 0} Milestone Units
                                    </span>
                                    <span className="badge-lang">
                                        <Globe2 size={14} /> {selectedLanguage}
                                    </span>
                                </div>
                            </div>

                            <div className="modules-timeline-flow">
                                {pathData.modules?.map((mod) => (
                                    <div key={mod.module_number} className="module-flow-card">
                                        <div className="module-number-disc">
                                            {mod.module_number}
                                        </div>
                                        <div className="module-details">
                                            <div className="module-header-row">
                                                <h4>{mod.title}</h4>
                                                <div className="module-pills">
                                                    <span className="diff-pill">{mod.difficulty}</span>
                                                    <span className="hrs-pill"><Clock size={12} /> {selectedDuration >= 60 ? `${(selectedDuration / 60).toFixed(0)}h class` : `${selectedDuration}m class`}</span>
                                                </div>
                                            </div>
                                            <p className="module-desc">{mod.description}</p>
                                            
                                            <div className="key-topics-chips">
                                                {mod.key_topics?.map((topic, i) => (
                                                    <span key={i} className="topic-chip">• {topic}</span>
                                                ))}
                                            </div>

                                            <div className="milestone-box">
                                                <Trophy size={14} />
                                                <span><strong>Hands-on Milestone:</strong> {mod.milestone_project}</span>
                                            </div>
                                        </div>

                                        <div className="module-action">
                                            <button
                                                type="button"
                                                className="start-unit-btn"
                                                onClick={() => {
                                                    if (onStartLessonFromPath) {
                                                        onStartLessonFromPath({
                                                            topic: mod.title,
                                                            subject: pathData?.topic || topic,
                                                            level: level,
                                                            language: selectedLanguage,
                                                            duration_minutes: selectedDuration,
                                                            persona: "lilly"
                                                        });
                                                    }
                                                    onClose();
                                                }}
                                                title={`Start ${selectedDuration} minute class in ${selectedLanguage}`}
                                            >
                                                <span>Start {selectedDuration}m Class</span>
                                                <Play size={13} fill="#00d9ff" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {!loading && !pathData && (
                        <div className="path-placeholder">
                            <Compass size={40} className="placeholder-icon" />
                            <p>Enter any topic above to generate a personalized multi-unit curriculum path.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
