import { useState, useEffect } from "react";
import { 
    Activity, 
    AlertCircle, 
    Award, 
    BookOpen, 
    CheckCircle2, 
    Clock, 
    Flame, 
    GraduationCap, 
    Sparkles, 
    Trash2, 
    User, 
    X 
} from "lucide-react";

export default function StudentProfileModal({
    isOpen,
    onClose,
    onReviewConcept
}) {
    const [profile, setProfile] = useState({
        total_lessons: 0,
        history: [],
        weak_concepts: []
    });

    useEffect(() => {
        if (!isOpen) return;
        try {
            const raw = localStorage.getItem("ai_teacher_profile");
            if (raw) {
                setProfile(JSON.parse(raw));
            } else {
                // Initialize default demo profile
                const initial = {
                    total_lessons: 3,
                    history: [
                        { topic: "Newton's First & Second Laws", score: 90, grade: "A+", date: "Today" },
                        { topic: "Ohm's Law & Circuit Fundamentals", score: 85, grade: "A", date: "Yesterday" },
                        { topic: "Binary Search & Algorithmic Complexity", score: 75, grade: "B+", date: "2 days ago" }
                    ],
                    weak_concepts: ["Inverse Proportionality in Resistance", "Boundary Off-By-One Indexes"]
                };
                setProfile(initial);
                localStorage.setItem("ai_teacher_profile", JSON.stringify(initial));
            }
        } catch (e) {
            console.warn("Could not read profile:", e);
        }
    }, [isOpen]);

    function clearHistory() {
        if (confirm("Reset learning history and student profile?")) {
            const cleared = { total_lessons: 0, history: [], weak_concepts: [] };
            setProfile(cleared);
            localStorage.setItem("ai_teacher_profile", JSON.stringify(cleared));
        }
    }

    if (!isOpen) return null;

    const avgScore = profile.history.length > 0
        ? Math.round(profile.history.reduce((sum, h) => sum + (h.score || 0), 0) / profile.history.length)
        : 0;

    return (
        <div className="modal-backdrop">
            <div className="profile-dialog">
                <div className="dialog-header">
                    <div className="header-title-badge">
                        <User size={18} />
                        <span>STUDENT LEARNING PROFILE & ANALYTICS</span>
                    </div>
                    <button type="button" className="dialog-close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="dialog-body">
                    {/* Stats Metric Cards */}
                    <div className="profile-stats-grid">
                        <div className="stat-card">
                            <div className="stat-label">
                                <BookOpen size={15} /> LESSONS COMPLETED
                            </div>
                            <div className="stat-val">{profile.total_lessons || profile.history.length}</div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-label">
                                <Award size={15} /> AVERAGE MASTERY
                            </div>
                            <div className="stat-val">{avgScore}%</div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-label">
                                <Flame size={15} /> LEARNING STREAK
                            </div>
                            <div className="stat-val">3 Days</div>
                        </div>
                    </div>

                    {/* Weak Concepts Ledger (Misconceptions Tracked) */}
                    <div className="profile-section">
                        <div className="section-title">
                            <AlertCircle size={16} />
                            <span>CONCEPTS FLAGGED FOR REVISION</span>
                        </div>
                        {profile.weak_concepts.length === 0 ? (
                            <div className="empty-ledger">
                                <CheckCircle2 size={20} className="icon-green" />
                                <span>No active learning gaps! Outstanding mastery.</span>
                            </div>
                        ) : (
                            <div className="weak-tags-grid">
                                {profile.weak_concepts.map((concept, idx) => (
                                    <div key={idx} className="weak-chip">
                                        <span>{concept}</span>
                                        <button
                                            type="button"
                                            className="review-btn"
                                            onClick={() => {
                                                if (onReviewConcept) onReviewConcept(concept);
                                                onClose();
                                            }}
                                            title="Launch targeted revision lesson"
                                        >
                                            Revise ↺
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recent Lessons History */}
                    <div className="profile-section">
                        <div className="section-title">
                            <GraduationCap size={16} />
                            <span>ASSESSMENT & LESSON HISTORY</span>
                        </div>
                        {profile.history.length === 0 ? (
                            <div className="empty-ledger">
                                <span>No lessons recorded yet. Start your first lesson today!</span>
                            </div>
                        ) : (
                            <div className="history-table">
                                {profile.history.map((item, idx) => (
                                    <div key={idx} className="history-row">
                                        <div className="history-topic">
                                            <strong>{item.topic}</strong>
                                            <small>{item.date}</small>
                                        </div>
                                        <div className="history-score-pill">
                                            <span>Score: {item.score}%</span>
                                            <strong className="badge-grade">{item.grade}</strong>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="dialog-footer between">
                    <button type="button" className="btn-text-danger" onClick={clearHistory}>
                        <Trash2 size={14} /> Reset Profile
                    </button>
                    <button type="button" className="btn-primary-glow" onClick={onClose}>
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
