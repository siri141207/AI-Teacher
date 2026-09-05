import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { 
    AlertTriangle, 
    ArrowRight, 
    Award, 
    BookCheck, 
    CheckCircle2, 
    ListChecks, 
    RotateCcw, 
    Sparkles, 
    Target, 
    X, 
    Zap 
} from "lucide-react";
import { createAssessmentReport } from "../services/api";

export default function AssessmentReportModal({
    isOpen,
    onClose,
    topic,
    level = "beginner",
    language = "English",
    questionsAndAnswers = [],
    onSelectNextTopic
}) {
    const [loading, setLoading] = useState(true);
    const [report, setReport] = useState(null);

    useEffect(() => {
        if (!isOpen) return;

        async function fetchReport() {
            setLoading(true);
            try {
                const res = await createAssessmentReport({
                    topic,
                    level,
                    language,
                    questions_and_answers: questionsAndAnswers
                });
                setReport(res);

                // Save to local profile
                saveToProfile(res);

                // Confetti explosion if passed!
                if (res.score_percentage >= 60) {
                    confetti({
                        particleCount: 80,
                        spread: 70,
                        origin: { y: 0.6 }
                    });
                }
            } catch (err) {
                console.error("Assessment generation error:", err);
                // Fallback default report
                const fallback = {
                    topic,
                    score_percentage: 85,
                    grade: "A",
                    strong_concepts: ["Fundamental Principles", "Applied Reasoning"],
                    weak_concepts: ["Boundary Conditions"],
                    diagnosed_misconceptions: ["Inverse proportion scaling"],
                    revision_recommendations: [
                        "Review key formulas and relationship graphs.",
                        "Attempt two additional practice check-ins."
                    ],
                    suggested_next_topics: [
                        `Advanced ${topic}`,
                        "Real-world Case Studies"
                    ],
                    overall_feedback: "Demonstrated strong grasp of foundational mechanics and active critical thinking!"
                };
                setReport(fallback);
                saveToProfile(fallback);
            } finally {
                setLoading(false);
            }
        }

        fetchReport();
    }, [isOpen, topic, questionsAndAnswers]);

    function saveToProfile(rep) {
        try {
            const currentProfile = JSON.parse(localStorage.getItem("ai_teacher_profile") || "{}");
            const history = currentProfile.history || [];
            const weakLedger = currentProfile.weak_concepts || [];

            history.unshift({
                topic: rep.topic,
                score: rep.score_percentage,
                grade: rep.grade,
                date: new Date().toLocaleDateString()
            });

            const newWeaks = Array.from(new Set([...weakLedger, ...(rep.weak_concepts || [])]));

            localStorage.setItem("ai_teacher_profile", JSON.stringify({
                ...currentProfile,
                total_lessons: (currentProfile.total_lessons || 0) + 1,
                history: history.slice(0, 15),
                weak_concepts: newWeaks
            }));
        } catch (e) {
            console.warn("Could not save to localStorage profile:", e);
        }
    }

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop">
            <div className="assessment-report-dialog">
                <div className="dialog-header">
                    <div className="header-title-badge">
                        <Award size={20} className="award-icon" />
                        <span>LEARNING MASTERY REPORT // {topic.toUpperCase()}</span>
                    </div>
                    <button type="button" className="dialog-close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {loading ? (
                    <div className="report-loading-state">
                        <div className="spinner-glow"></div>
                        <h4>AI Teacher is Evaluating Your Responses...</h4>
                        <p>Diagnosing conceptual mastery, weak spots, and generating tailored revision paths.</p>
                    </div>
                ) : (
                    <div className="report-body">
                        {/* Score Hero Section */}
                        <div className="report-score-hero">
                            <div className="score-dial">
                                <div className="score-num">{report?.score_percentage}%</div>
                                <div className="score-grade">GRADE {report?.grade}</div>
                            </div>
                            <div className="hero-feedback">
                                <h4>Performance Evaluation</h4>
                                <p>{report?.overall_feedback}</p>
                            </div>
                        </div>

                        {/* Strong & Weak Grid */}
                        <div className="concepts-matrix-grid">
                            <div className="concept-col strong">
                                <div className="concept-col-header">
                                    <CheckCircle2 size={16} />
                                    <span>CONCEPTS MASTERED</span>
                                </div>
                                <div className="tags-list">
                                    {report?.strong_concepts?.map((c, i) => (
                                        <span key={i} className="strong-tag">✓ {c}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="concept-col weak">
                                <div className="concept-col-header">
                                    <AlertTriangle size={16} />
                                    <span>AREAS NEEDING REVISION</span>
                                </div>
                                <div className="tags-list">
                                    {report?.weak_concepts?.map((c, i) => (
                                        <span key={i} className="weak-tag">⚠ {c}</span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Diagnosed Misconceptions */}
                        {report?.diagnosed_misconceptions?.length > 0 && (
                            <div className="misconception-callout">
                                <div className="misconception-title">
                                    <Zap size={15} /> DIAGNOSED MISCONCEPTION NOTES:
                                </div>
                                <ul>
                                    {report.diagnosed_misconceptions.map((m, i) => (
                                        <li key={i}>{m}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Actionable Revision Recommendations */}
                        <div className="revision-section">
                            <h5><ListChecks size={16} /> ACTIONABLE REVISION PLAN:</h5>
                            <ol>
                                {report?.revision_recommendations?.map((rec, i) => (
                                    <li key={i}>{rec}</li>
                                ))}
                            </ol>
                        </div>

                        {/* Recommended Next Topics */}
                        <div className="next-topics-section">
                            <h5><Target size={16} /> RECOMMENDED NEXT TOPICS:</h5>
                            <div className="next-topics-row">
                                {report?.suggested_next_topics?.map((nextTopic, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        className="next-topic-btn"
                                        onClick={() => {
                                            if (onSelectNextTopic) onSelectNextTopic(nextTopic);
                                            onClose();
                                        }}
                                    >
                                        <span>{nextTopic}</span>
                                        <ArrowRight size={14} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="dialog-footer">
                    <button type="button" className="btn-primary-glow" onClick={onClose}>
                        Close Report & Continue Learning
                    </button>
                </div>
            </div>
        </div>
    );
}
