from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


# =========================================================
# EXISTING SCHEMAS (Maintained for backward compatibility)
# =========================================================

class LessonRequest(BaseModel):
    topic: str = Field(..., min_length=1)
    level: str = Field(..., min_length=1)
    language: str = Field(..., min_length=1)
    time_minutes: int = Field(..., gt=0)
    goal: str = Field(..., min_length=1)
    session_id: str = ""
    subject: str = ""


class LessonSection(BaseModel):
    title: str
    objective: str
    explanation: str
    example: str
    question: str


class LessonResponse(BaseModel):
    title: str
    language: str
    estimated_minutes: int
    sections: List[LessonSection]


class EvaluationRequest(BaseModel):
    topic: str = Field(..., min_length=1)
    question: str = Field(..., min_length=1)
    student_answer: str = Field(..., min_length=1)
    language: str = Field(..., min_length=1)
    level: str = Field(..., min_length=1)
    session_id: str = ""
    subject: str = ""


class VisualLessonRequest(BaseModel):
    topic: str = Field(..., min_length=1)
    level: str = Field(..., min_length=1)
    language: str = Field(..., min_length=1)
    session_id: str = ""
    subject: str = ""


class VisualItem(BaseModel):
    name: str
    description: str
    label: str


class VisualLessonResponse(BaseModel):
    topic: str
    visual_type: str
    title: str
    description: str
    items: List[VisualItem]


# =========================================================
# VIDEO LESSON & AVATAR CLASSROOM SCHEMAS
# =========================================================

class CheckpointQuestion(BaseModel):
    question_id: str
    question: str
    type: str = "mcq"  # mcq or conceptual
    options: Optional[List[str]] = None
    correct_answer: str
    hint: str
    common_misconceptions: Optional[List[Dict[str, str]]] = None


class VideoChapter(BaseModel):
    id: int
    title: str
    duration_sec: int
    narration_script: str
    avatar_emotion: str = "explaining"  # welcoming, explaining, demonstrating, questioning, encouraging
    visual_type: str = "whiteboard"     # whiteboard, formula, simulation, diagram, code_sandbox, timeline
    visual_payload: Dict[str, Any]
    checkpoint: Optional[CheckpointQuestion] = None


class VideoLessonRequest(BaseModel):
    topic: str = Field(..., min_length=1)
    level: str = "beginner"  # beginner, intermediate, advanced
    language: str = "English"  # English, Hindi, Hinglish, Spanish, French, Telugu, Tamil, German
    time_minutes: int = 20
    persona: str = "lilly"  # lilly, vikram, alex
    goal: Optional[str] = "Master core concepts with visual intuition"
    use_rag: bool = True
    session_id: str = ""
    subject: str = ""


class VideoLessonResponse(BaseModel):
    title: str
    topic: str
    subject: str  # physics, math, biology, computer_science, history, general
    level: str
    language: str
    persona: str
    estimated_minutes: int
    summary: str
    learning_objectives: List[str]
    chapters: List[VideoChapter]


# =========================================================
# MISCONCEPTION DETECTION & ADAPTIVE REMEDIATION
# =========================================================

class MisconceptionRequest(BaseModel):
    topic: str
    question: str
    student_answer: str
    expected_answer: Optional[str] = None
    language: str = "English"
    level: str = "beginner"
    persona: str = "lilly"


class MisconceptionResponse(BaseModel):
    is_correct: bool
    confidence_score: float
    diagnosed_misconception: Optional[str] = None
    explanation: str
    alternative_analogy: str
    remedial_example: str
    followup_check_question: str
    encouragement: str


# =========================================================
# AI LEARNING PATH / CURRICULUM ROADMAP
# =========================================================

class PathModule(BaseModel):
    module_number: int
    title: str
    duration_hrs: int
    difficulty: str  # Beginner, Intermediate, Advanced
    description: str
    key_topics: List[str]
    milestone_project: str


class LearningPathRequest(BaseModel):
    topic: str
    target_role_or_goal: Optional[str] = "Comprehensive Mastery"
    current_level: str = "beginner"
    language: str = "English"
    session_id: str = ""
    subject: str = ""


class LearningPathResponse(BaseModel):
    topic: str
    summary: str
    target_role: str
    total_estimated_hours: int
    modules: List[PathModule]


# =========================================================
# FINAL POST-LESSON ASSESSMENT REPORT
# =========================================================

class QuestionAnswerPair(BaseModel):
    question: str
    student_answer: str
    correct_answer: Optional[str] = None


class AssessmentRequest(BaseModel):
    topic: str
    level: str = "beginner"
    language: str = "English"
    questions_and_answers: List[QuestionAnswerPair]
    session_id: str = ""
    subject: str = ""


class AssessmentReportResponse(BaseModel):
    topic: str
    score_percentage: int
    grade: str
    strong_concepts: List[str]
    weak_concepts: List[str]
    diagnosed_misconceptions: List[str]
    revision_recommendations: List[str]
    suggested_next_topics: List[str]
    overall_feedback: str


# =========================================================
# LEARNING PROGRESS & "CONTINUE" RESUME SYSTEM
# =========================================================

class SaveProgressRequest(BaseModel):
    subject: str
    chapter_id: int
    chapter_title: str
    stopping_point: Optional[str] = ""
    last_topic: Optional[str] = ""
    next_topic: Optional[str] = ""
    duration_min: Optional[int] = 0


class MarkChapterCompleteRequest(BaseModel):
    subject: str
    chapter_id: int
    duration_min: Optional[int] = 0


class ContinueLessonRequest(BaseModel):
    subject: str
    level: str = "beginner"
    language: str = "English"
    persona: str = "lilly"
    use_rag: bool = True


class SubjectProgress(BaseModel):
    completed_chapters: List[int] = []
    current_chapter_id: int = 1
    current_chapter_title: str = ""
    stopping_point: str = ""
    last_topic_taught: str = ""
    next_topic: str = ""
    total_chapters: int = 5
    percent_complete: int = 0
    last_session_date: Optional[str] = None
    session_history: List[dict] = []


class ContinueInfoResponse(BaseModel):
    topic: str
    chapter_id: int
    completed_chapters: List[int] = []
    completed_chapter_titles: List[str] = []
    stopping_point: str = ""
    is_course_complete: bool = False
    total_chapters: int = 5


# =========================================================
# DURATION-MATCHED MULTI-SECTION TEACHING SCHEMAS
# =========================================================

class LearningActivity(BaseModel):
    activity_type: str = "coding_exercise"  # coding_exercise, debugging, math_problem, step_by_step_solve, scientific_prediction, simulation_experiment, scenario_analysis, critical_question, concept_check
    title: str
    instructions: str
    initial_code: Optional[str] = None
    test_cases_or_criteria: Optional[List[str]] = None
    starter_problem: Optional[str] = None
    solution_steps: Optional[List[str]] = None
    scenario_prompt: Optional[str] = None
    scenario_options: Optional[List[str]] = None
    expected_answer: Optional[str] = None
    hint: Optional[str] = None
    sample_solution: Optional[str] = None


class ClassSection(BaseModel):
    id: int
    title: str
    allocated_minutes: int
    phase: str = "concept_deep_dive"  # introduction, concept_deep_dive, live_demonstration, guided_practice, hands_on_exercise, debugging_drill, case_study, checkpoint_milestone, synthesis_and_summary
    narration_script: str
    avatar_emotion: str = "explaining"  # welcoming, explaining, demonstrating, questioning, encouraging
    visual_type: str = "whiteboard"     # whiteboard, formula, simulation, diagram, code_sandbox, timeline
    visual_payload: Dict[str, Any] = {}
    learning_activity: Optional[LearningActivity] = None
    checkpoint: Optional[CheckpointQuestion] = None


class DurationLessonPlanRequest(BaseModel):
    topic: str = Field(..., min_length=1)
    subject: str = ""
    level: str = "beginner"  # beginner, intermediate, advanced
    language: str = "English"  # English, Hindi, Hinglish, Spanish, French, Telugu, Tamil, German
    duration_minutes: int = 30  # 15, 30, 45, 60, 90, 120, etc.
    persona: str = "lilly"  # lilly, vikram, alex
    goal: Optional[str] = "Deep interactive mastery"
    session_id: str = ""
    use_rag: bool = True


class DurationLessonPlanResponse(BaseModel):
    title: str
    topic: str
    subject: str
    level: str
    language: str
    persona: str
    target_duration_minutes: int
    min_duration_minutes: int
    max_duration_minutes: int
    summary: str
    learning_objectives: List[str]
    pedagogical_approach: str
    sections: List[ClassSection]


class SectionInteractionRequest(BaseModel):
    topic: str
    subject: str = ""
    section_id: int
    section_title: str
    activity_type: str
    student_submission: str
    expected_answer: Optional[str] = None
    level: str = "beginner"
    language: str = "English"
    persona: str = "lilly"
    session_id: str = ""


class SectionInteractionResponse(BaseModel):
    is_correct: bool
    score: int  # 0 to 100
    feedback: str
    explanation: str
    misconception_diagnosed: Optional[str] = None
    remedial_guidance: Optional[str] = None
    can_advance: bool = True
    encouragement: str
    teacher_spoken_response: str


# =========================================================
# REAL LESSON SESSION STATE & TIMER PERSISTENCE
# =========================================================

class LessonSessionState(BaseModel):
    session_id: str
    subject: str = ""
    topic: str = ""
    target_duration_minutes: int = 30
    elapsed_learning_seconds: int = 0
    current_section_index: int = 0
    completed_section_ids: List[int] = []
    completed_activities: List[Dict[str, Any]] = []
    answered_questions: Optional[List[Dict[str, Any]]] = []
    student_input: Optional[str] = None
    language: str = "English"
    persona: str = "lilly"
    lesson_data: Optional[Dict[str, Any]] = None
    is_paused: bool = False
    is_completed: bool = False
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class SaveSessionStateRequest(BaseModel):
    session_id: str
    subject: str = ""
    topic: str = ""
    target_duration_minutes: int = 30
    elapsed_learning_seconds: int = 0
    current_section_index: int = 0
    completed_section_ids: List[int] = []
    completed_activities: List[Dict[str, Any]] = []
    answered_questions: Optional[List[Dict[str, Any]]] = []
    student_input: Optional[str] = None
    language: Optional[str] = "English"
    persona: Optional[str] = "lilly"
    lesson_data: Optional[Dict[str, Any]] = None
    is_paused: bool = False
    is_completed: bool = False


class ExtendClassRequest(BaseModel):
    topic: str
    subject: str = ""
    level: str = "beginner"
    language: str = "English"
    persona: str = "lilly"
    current_section_count: int = 5
    elapsed_minutes: int = 15
    target_duration_minutes: int = 30
    session_id: str = ""


class ExtendClassResponse(BaseModel):
    new_sections: List[ClassSection]


# =========================================================
# LIVE CLASS DYNAMIC LANGUAGE SWITCH SCHEMAS
# =========================================================

class TranslateLessonRequest(BaseModel):
    lesson: Dict[str, Any]
    target_language: str = "English"  # English, Hindi, Telugu
    topic: Optional[str] = ""
    subject: Optional[str] = ""
    level: Optional[str] = "beginner"
    persona: Optional[str] = "lilly"
    session_id: Optional[str] = ""


class TranslateLessonResponse(BaseModel):
    lesson: Dict[str, Any]
    target_language: str