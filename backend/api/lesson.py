import traceback
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from models.schemas import (
    LessonRequest,
    LessonResponse,
    EvaluationRequest,
    VisualLessonRequest,
    VisualLessonResponse,
    VideoLessonRequest,
    VideoLessonResponse,
    MisconceptionRequest,
    MisconceptionResponse,
    LearningPathRequest,
    LearningPathResponse,
    AssessmentRequest,
    AssessmentReportResponse,
    DurationLessonPlanRequest,
    DurationLessonPlanResponse,
    SectionInteractionRequest,
    SectionInteractionResponse,
    SaveSessionStateRequest,
    LessonSessionState,
    TranslateLessonRequest,
    TranslateLessonResponse
)

from ai.lesson_planner import (
    generate_lesson,
    generate_grounded_answer,
    evaluate_student_answer,
    generate_adaptive_teaching,
    generate_visual_lesson,
    generate_chat_response,
    generate_video_lesson,
    diagnose_misconception,
    generate_learning_path,
    generate_assessment_report,
    generate_duration_lesson_plan,
    evaluate_section_activity,
    translate_lesson_content
)

from ai.progress import (
    save_lesson_session,
    get_lesson_session,
    get_latest_incomplete_session,
    clear_lesson_session
)


router = APIRouter()


# =========================================================
# VIDEO-BASED LESSON GENERATOR (Task 1 & 2 Core)
# =========================================================

@router.post(
    "/lesson/video-lesson",
    response_model=VideoLessonResponse
)
def create_video_lesson(request: VideoLessonRequest):
    """
    Generates a full video-based lesson structured for an AI Avatar and visual whiteboard.
    Includes chapters with narration scripts, dynamic visual payloads, and checkpoints.
    """
    try:
        lesson = generate_video_lesson(
            topic=request.topic,
            level=request.level,
            language=request.language,
            time_minutes=request.time_minutes,
            persona=request.persona,
            goal=request.goal or "Master core concepts with visual intuition",
            use_rag=request.use_rag,
            session_id=getattr(request, "session_id", ""),
            subject=getattr(request, "subject", "")
        )
        return lesson
    except Exception as error:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Video lesson generation failed: {str(error)}"
        )


# =========================================================
# MISCONCEPTION DETECTION & ADAPTIVE REMEDIATION
# =========================================================

@router.post(
    "/lesson/diagnose-misconception",
    response_model=MisconceptionResponse
)
def check_misconception(request: MisconceptionRequest):
    """
    Evaluates student response, detects false mental models,
    and returns an alternate real-world analogy and remedial question.
    """
    try:
        result = diagnose_misconception(
            topic=request.topic,
            question=request.question,
            student_answer=request.student_answer,
            expected_answer=request.expected_answer,
            language=request.language,
            level=request.level,
            persona=request.persona
        )
        return result
    except Exception as error:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Misconception diagnosis failed: {str(error)}"
        )


# =========================================================
# AI LEARNING PATH / CURRICULUM ROADMAP
# =========================================================

@router.post(
    "/lesson/learning-path",
    response_model=LearningPathResponse
)
def create_learning_path(request: LearningPathRequest):
    """
    Generates a progressive multi-unit curriculum for broad subjects.
    """
    try:
        path = generate_learning_path(
            topic=request.topic,
            target_role_or_goal=request.target_role_or_goal or "Comprehensive Mastery",
            current_level=request.current_level,
            language=request.language,
            session_id=getattr(request, "session_id", ""),
            subject=getattr(request, "subject", "")
        )
        return path
    except Exception as error:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Learning path generation failed: {str(error)}"
        )


# =========================================================
# FINAL POST-LESSON ASSESSMENT REPORT
# =========================================================

@router.post(
    "/lesson/assessment-report",
    response_model=AssessmentReportResponse
)
def create_assessment_report(request: AssessmentRequest):
    """
    Evaluates student answers at the end of the lesson, computes score,
    and returns strong areas, weak areas, and revision steps.
    """
    try:
        qa_dicts = [item.model_dump() for item in request.questions_and_answers]
        report = generate_assessment_report(
            topic=request.topic,
            level=request.level,
            language=request.language,
            questions_and_answers=qa_dicts,
            session_id=getattr(request, "session_id", ""),
            subject=getattr(request, "subject", "")
        )
        return report
    except Exception as error:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Assessment report generation failed: {str(error)}"
        )


# =========================================================
# CREATE TRADITIONAL LESSON (Compatibility)
# =========================================================

@router.post(
    "/lesson/create",
    response_model=LessonResponse
)
def create_lesson(request: LessonRequest):
    try:
        lesson = generate_lesson(
            topic=request.topic,
            level=request.level,
            language=request.language,
            time_minutes=request.time_minutes,
            goal=request.goal,
            session_id=getattr(request, "session_id", ""),
            subject=getattr(request, "subject", "")
        )
        return lesson
    except Exception as error:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


# =========================================================
# GROUNDED AI TEACHING
# =========================================================

class TeachingRequest(BaseModel):
    question: str
    language: str
    level: str
    session_id: str = ""   # Subject lock support
    subject: str = ""       # The locked subject for this session


@router.post("/lesson/teach")
def teach_student(request: TeachingRequest):
    try:
        answer = generate_grounded_answer(
            question=request.question,
            language=request.language,
            level=request.level,
            session_id=request.session_id,
            subject=request.subject
        )
        return {"answer": answer}
    except Exception as error:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


# =========================================================
# STUDENT ANSWER EVALUATION
# =========================================================

@router.post("/lesson/evaluate")
def evaluate_answer(request: EvaluationRequest):
    try:
        result = evaluate_student_answer(
            topic=request.topic,
            question=request.question,
            student_answer=request.student_answer,
            language=request.language,
            level=request.level,
            session_id=getattr(request, "session_id", ""),
            subject=getattr(request, "subject", "")
        )
        return result
    except Exception as error:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


# =========================================================
# ADAPTIVE TEACHING
# =========================================================

@router.post("/lesson/adapt")
def adapt_lesson(request: EvaluationRequest):
    try:
        result = generate_adaptive_teaching(
            topic=request.topic,
            question=request.question,
            student_answer=request.student_answer,
            language=request.language,
            level=request.level,
            session_id=getattr(request, "session_id", ""),
            subject=getattr(request, "subject", "")
        )
        return result
    except Exception as error:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


# =========================================================
# VISUAL LESSON
# =========================================================

@router.post(
    "/lesson/visual",
    response_model=VisualLessonResponse
)
def create_visual_lesson(request: VisualLessonRequest):
    try:
        visual = generate_visual_lesson(
            topic=request.topic,
            level=request.level,
            language=request.language,
            session_id=getattr(request, "session_id", ""),
            subject=getattr(request, "subject", "")
        )
        return visual
    except Exception as error:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


# =========================================================
# CONVERSATIONAL AI TEACHER
# =========================================================

class ChatRequest(BaseModel):
    session_id: str
    question: str
    language: str
    level: str
    subject: str = ""  # The locked subject/topic the student has selected


@router.post("/lesson/chat")
def chat_with_teacher(request: ChatRequest):
    try:
        answer = generate_chat_response(
            session_id=request.session_id,
            question=request.question,
            language=request.language,
            level=request.level,
            subject=request.subject
        )
        return {
            "session_id": request.session_id,
            "answer": answer
        }
    except Exception as error:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


# =========================================================
# DURATION-MATCHED LESSON PLANNER ENDPOINTS
# =========================================================

@router.post(
    "/lesson/duration-plan",
    response_model=DurationLessonPlanResponse
)
def create_duration_lesson_plan(request: DurationLessonPlanRequest):
    """
    Generates a structured, multi-section interactive class
    matching the exact selected duration (15m, 30m, 45m, 60m, 90m, 120m).
    """
    try:
        plan = generate_duration_lesson_plan(
            topic=request.topic,
            subject=request.subject,
            level=request.level,
            language=request.language,
            duration_minutes=request.duration_minutes,
            persona=request.persona,
            goal=request.goal or "Deep interactive mastery",
            session_id=request.session_id,
            use_rag=request.use_rag
        )
        return plan
    except Exception as error:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Duration lesson plan generation failed: {str(error)}"
        )


@router.post(
    "/lesson/section/interact",
    response_model=SectionInteractionResponse
)
def interact_with_section(request: SectionInteractionRequest):
    """
    Evaluates student active submissions for section exercises (coding, math, scenarios).
    Returns real-time feedback, misconception detection, and teacher speech.
    """
    try:
        result = evaluate_section_activity(
            topic=request.topic,
            subject=request.subject,
            section_id=request.section_id,
            section_title=request.section_title,
            activity_type=request.activity_type,
            student_submission=request.student_submission,
            expected_answer=request.expected_answer,
            level=request.level,
            language=request.language,
            persona=request.persona,
            session_id=request.session_id
        )
        return result
    except Exception as error:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Section interaction evaluation failed: {str(error)}"
        )


# =========================================================
# LESSON SESSION STATE & TIMER PERSISTENCE ENDPOINTS
# =========================================================

@router.post("/lesson/session/save")
def save_session_state(request: SaveSessionStateRequest):
    """
    Persists active session state (elapsed seconds, current section, completed activities, lesson data, student input, quiz progress).
    """
    try:
        saved = save_lesson_session(
            session_id=request.session_id,
            subject=request.subject,
            topic=request.topic,
            target_duration_minutes=request.target_duration_minutes,
            elapsed_learning_seconds=request.elapsed_learning_seconds,
            current_section_index=request.current_section_index,
            completed_section_ids=request.completed_section_ids,
            completed_activities=request.completed_activities,
            answered_questions=request.answered_questions,
            student_input=request.student_input,
            language=request.language or "English",
            persona=request.persona or "lilly",
            lesson_data=request.lesson_data,
            is_paused=request.is_paused,
            is_completed=request.is_completed
        )
        return saved
    except Exception as error:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save session state: {str(error)}"
        )


@router.get("/lesson/session/active")
def get_active_session_state():
    """
    Retrieves the most recent incomplete session state for quick launchpad resume.
    """
    try:
        state = get_latest_incomplete_session()
        return state
    except Exception as error:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to load active session state: {str(error)}"
        )


@router.get("/lesson/session/{session_id}")
def get_session_state(session_id: str):
    """
    Retrieves saved session state for page refresh or lesson resume.
    """
    try:
        state = get_lesson_session(session_id)
        return state
    except Exception as error:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to load session state: {str(error)}"
        )


@router.post("/lesson/session/clear")
def clear_session_state(payload: dict):
    """
    Clears saved session state.
    """
    try:
        session_id = payload.get("session_id", "")
        return clear_lesson_session(session_id)
    except Exception as error:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to clear session state: {str(error)}"
        )


@router.post(
    "/lesson/translate-lesson",
    response_model=TranslateLessonResponse
)
def translate_lesson(request: TranslateLessonRequest):
    """
    Translates/adapts an active lesson to the requested target language (English, Hindi, Telugu)
    while preserving all section structure, sequence IDs, visual payloads, and activities.
    """
    try:
        translated = translate_lesson_content(
            lesson=request.lesson,
            target_language=request.target_language,
            topic=request.topic or "",
            subject=request.subject or "",
            level=request.level or "beginner",
            persona=request.persona or "lilly",
            session_id=request.session_id or ""
        )
        return {
            "lesson": translated,
            "target_language": request.target_language
        }
    except Exception as error:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to translate lesson: {str(error)}"
        )