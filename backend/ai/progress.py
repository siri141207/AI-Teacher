# ============================================================
# PERSISTENT LEARNING PROGRESS TRACKER
# ============================================================
# Stores per-subject learning progress in a JSON file so that
# progress survives server restarts. Each subject tracks:
#   - completed chapters
#   - current chapter and stopping point
#   - next topic to continue with
#   - session history
# ============================================================

import os
import json
from datetime import datetime
from pathlib import Path

# ============================================================
# PROGRESS FILE LOCATION
# ============================================================

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
PROGRESS_FILE = DATA_DIR / "progress.json"


def _ensure_data_dir():
    """Create the data directory if it doesn't exist."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)


def _load_progress() -> dict:
    """Load all progress from the JSON file."""
    _ensure_data_dir()
    if PROGRESS_FILE.exists():
        try:
            with open(PROGRESS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return {}
    return {}


def _save_progress_file(data: dict):
    """Write all progress to the JSON file."""
    _ensure_data_dir()
    with open(PROGRESS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


# ============================================================
# MASTER CURRICULUM REFERENCE (chapter count per subject)
# ============================================================

CURRICULUM_CHAPTER_COUNT = {
    "Python Programming": 5,
    "Physics": 5,
    "Mathematics": 5,
    "Biology": 5,
    "Chemistry": 5,
    "Computer Science": 5,
    "History": 5,
    "Geography": 5,
    "English Literature": 5,
    "Economics": 5,
}

CURRICULUM_CHAPTERS = {
    "Python Programming": [
        {"id": 1, "title": "Python Basics & Syntax"},
        {"id": 2, "title": "Variables, Data Types & Operators"},
        {"id": 3, "title": "Conditional Statements & Loops"},
        {"id": 4, "title": "Functions, Lists, Tuples & Dictionaries"},
        {"id": 5, "title": "Files, Exception Handling & Mini Project"},
    ],
    "Physics": [
        {"id": 1, "title": "Units, Measurements & Vectors"},
        {"id": 2, "title": "Motion & Laws of Motion"},
        {"id": 3, "title": "Work, Energy & Power"},
        {"id": 4, "title": "Gravitation & Properties of Matter"},
        {"id": 5, "title": "Thermodynamics, Waves & Oscillations"},
    ],
    "Mathematics": [
        {"id": 1, "title": "Sets, Relations & Functions"},
        {"id": 2, "title": "Algebra & Quadratic Equations"},
        {"id": 3, "title": "Trigonometry"},
        {"id": 4, "title": "Coordinate Geometry & Calculus Basics"},
        {"id": 5, "title": "Probability & Statistics"},
    ],
    "Biology": [
        {"id": 1, "title": "Introduction to Biology & Cell Structure"},
        {"id": 2, "title": "Biomolecules & Cell Division"},
        {"id": 3, "title": "Plant Structure & Plant Physiology"},
        {"id": 4, "title": "Human Anatomy & Physiology"},
        {"id": 5, "title": "Genetics, Evolution & Ecology"},
    ],
    "Chemistry": [
        {"id": 1, "title": "Basic Concepts of Chemistry"},
        {"id": 2, "title": "Atomic Structure & Periodic Table"},
        {"id": 3, "title": "Chemical Bonding"},
        {"id": 4, "title": "States of Matter & Thermodynamics"},
        {"id": 5, "title": "Chemical Reactions, Acids-Bases & Organic Chemistry"},
    ],
    "Computer Science": [
        {"id": 1, "title": "Introduction to Computer Science"},
        {"id": 2, "title": "Programming Fundamentals & Algorithms"},
        {"id": 3, "title": "Data Structures"},
        {"id": 4, "title": "Databases & Operating Systems"},
        {"id": 5, "title": "Computer Networks, Cybersecurity & AI"},
    ],
    "History": [
        {"id": 1, "title": "Ancient Civilizations"},
        {"id": 2, "title": "Medieval Kingdoms & Empires"},
        {"id": 3, "title": "The Age of Exploration & Renaissance"},
        {"id": 4, "title": "Colonialism & Independence Movements"},
        {"id": 5, "title": "World Wars & Modern History"},
    ],
    "Geography": [
        {"id": 1, "title": "Earth, Maps & Geographic Coordinates"},
        {"id": 2, "title": "Landforms, Rocks & Natural Processes"},
        {"id": 3, "title": "Climate, Weather & Water Resources"},
        {"id": 4, "title": "Population, Agriculture & Human Geography"},
        {"id": 5, "title": "Natural Resources, Industries & Environmental Issues"},
    ],
    "English Literature": [
        {"id": 1, "title": "Introduction to Literature & Literary Genres"},
        {"id": 2, "title": "Poetry & Poetic Devices"},
        {"id": 3, "title": "Short Stories & Prose"},
        {"id": 4, "title": "Drama & Shakespeare"},
        {"id": 5, "title": "Novels, Literary Analysis & Critical Thinking"},
    ],
    "Economics": [
        {"id": 1, "title": "Introduction to Economics & Basic Concepts"},
        {"id": 2, "title": "Demand, Supply & Market Equilibrium"},
        {"id": 3, "title": "Production, Costs & Market Structures"},
        {"id": 4, "title": "Money, Banking & National Income"},
        {"id": 5, "title": "Inflation, Unemployment, International Trade & Economic Growth"},
    ],
}


# ============================================================
# PUBLIC API — SAVE PROGRESS
# ============================================================

def save_progress(
    subject: str,
    chapter_id: int,
    chapter_title: str,
    stopping_point: str = "",
    last_topic: str = "",
    next_topic: str = "",
    duration_min: int = 0,
):
    """
    Save or update learning progress for a subject.
    Called automatically after each chapter narration completes.
    """
    all_progress = _load_progress()
    total = CURRICULUM_CHAPTER_COUNT.get(subject, 5)

    if subject not in all_progress:
        all_progress[subject] = {
            "completed_chapters": [],
            "current_chapter_id": chapter_id,
            "current_chapter_title": chapter_title,
            "stopping_point": stopping_point,
            "last_topic_taught": last_topic,
            "next_topic": next_topic,
            "total_chapters": total,
            "percent_complete": 0,
            "last_session_date": datetime.now().isoformat(),
            "session_history": [],
        }

    entry = all_progress[subject]
    entry["current_chapter_id"] = chapter_id
    entry["current_chapter_title"] = chapter_title
    entry["stopping_point"] = stopping_point
    entry["last_topic_taught"] = last_topic
    entry["next_topic"] = next_topic
    entry["last_session_date"] = datetime.now().isoformat()

    # Update percent
    completed_count = len(entry.get("completed_chapters", []))
    entry["percent_complete"] = int((completed_count / total) * 100)

    _save_progress_file(all_progress)
    return entry


# ============================================================
# PUBLIC API — MARK CHAPTER COMPLETE
# ============================================================

def mark_chapter_complete(
    subject: str,
    chapter_id: int,
    duration_min: int = 0,
):
    """
    Mark a chapter as fully completed and advance the pointer
    to the next chapter in the curriculum.
    """
    all_progress = _load_progress()
    total = CURRICULUM_CHAPTER_COUNT.get(subject, 5)

    if subject not in all_progress:
        all_progress[subject] = {
            "completed_chapters": [],
            "current_chapter_id": 1,
            "current_chapter_title": "",
            "stopping_point": "",
            "last_topic_taught": "",
            "next_topic": "",
            "total_chapters": total,
            "percent_complete": 0,
            "last_session_date": datetime.now().isoformat(),
            "session_history": [],
        }

    entry = all_progress[subject]

    # Add to completed list (no duplicates)
    if chapter_id not in entry["completed_chapters"]:
        entry["completed_chapters"].append(chapter_id)
        entry["completed_chapters"].sort()

    # Record session history
    entry["session_history"].append({
        "date": datetime.now().isoformat(),
        "chapter_completed": chapter_id,
        "duration_min": duration_min,
    })

    # Advance pointer to next chapter
    chapters = CURRICULUM_CHAPTERS.get(subject, [])
    next_ch = None
    for ch in chapters:
        if ch["id"] not in entry["completed_chapters"]:
            next_ch = ch
            break

    if next_ch:
        entry["current_chapter_id"] = next_ch["id"]
        entry["current_chapter_title"] = next_ch["title"]
        entry["stopping_point"] = "Starting fresh"
        entry["next_topic"] = next_ch["title"]
    else:
        # All chapters complete
        entry["current_chapter_id"] = total
        entry["current_chapter_title"] = "All chapters completed"
        entry["stopping_point"] = "Course complete"
        entry["next_topic"] = ""

    # Update percent
    completed_count = len(entry["completed_chapters"])
    entry["percent_complete"] = int((completed_count / total) * 100)
    entry["last_session_date"] = datetime.now().isoformat()

    _save_progress_file(all_progress)
    return entry


# ============================================================
# PUBLIC API — GET PROGRESS
# ============================================================

def get_progress(subject: str) -> dict:
    """Return progress for a single subject, or empty dict if none."""
    all_progress = _load_progress()
    return all_progress.get(subject, {})


def get_all_progress() -> dict:
    """Return progress for all subjects."""
    return _load_progress()


# ============================================================
# PUBLIC API — GET CONTINUE INFO
# ============================================================

def get_continue_info(subject: str) -> dict:
    """
    Determine exactly what to teach next for a "Continue" command.
    Returns a dict with:
      - topic: the chapter title to teach
      - chapter_id: the chapter id
      - completed_chapters: list of already-done chapter IDs
      - completed_chapter_titles: list of already-done chapter titles
      - stopping_point: where they stopped last time
      - is_course_complete: True if all chapters done
    """
    all_progress = _load_progress()
    chapters = CURRICULUM_CHAPTERS.get(subject, [])
    total = CURRICULUM_CHAPTER_COUNT.get(subject, 5)

    if subject not in all_progress:
        # Brand new — start from Chapter 1
        first = chapters[0] if chapters else {"id": 1, "title": subject}
        return {
            "topic": first["title"],
            "chapter_id": first["id"],
            "completed_chapters": [],
            "completed_chapter_titles": [],
            "stopping_point": "",
            "is_course_complete": False,
            "total_chapters": total,
        }

    entry = all_progress[subject]
    completed = entry.get("completed_chapters", [])

    # Find first incomplete chapter
    next_ch = None
    for ch in chapters:
        if ch["id"] not in completed:
            next_ch = ch
            break

    if next_ch is None:
        # All done
        return {
            "topic": chapters[-1]["title"] if chapters else subject,
            "chapter_id": total,
            "completed_chapters": completed,
            "completed_chapter_titles": [
                ch["title"] for ch in chapters if ch["id"] in completed
            ],
            "stopping_point": "Course complete",
            "is_course_complete": True,
            "total_chapters": total,
        }

    return {
        "topic": next_ch["title"],
        "chapter_id": next_ch["id"],
        "completed_chapters": completed,
        "completed_chapter_titles": [
            ch["title"] for ch in chapters if ch["id"] in completed
        ],
        "stopping_point": entry.get("stopping_point", ""),
        "is_course_complete": False,
        "total_chapters": total,
    }


# ============================================================
# PUBLIC API — RESET PROGRESS
# ============================================================

def reset_progress(subject: str):
    """Clear all progress for a single subject."""
    all_progress = _load_progress()
    if subject in all_progress:
        del all_progress[subject]
        _save_progress_file(all_progress)
    return {"status": "reset", "subject": subject}


def reset_all_progress():
    """Clear all progress for all subjects."""
    _save_progress_file({})
    return {"status": "reset_all"}


# ============================================================
# LESSON SESSION STATE PERSISTENCE (Active Class Tracking & Resume)
# ============================================================

SESSIONS_FILE = DATA_DIR / "sessions.json"


def _load_sessions() -> dict:
    _ensure_data_dir()
    if SESSIONS_FILE.exists():
        try:
            with open(SESSIONS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return {}
    return {}


def _save_sessions_file(data: dict):
    _ensure_data_dir()
    with open(SESSIONS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def save_lesson_session(
    session_id: str,
    subject: str = "",
    topic: str = "",
    target_duration_minutes: int = 30,
    elapsed_learning_seconds: int = 0,
    current_section_index: int = 0,
    completed_section_ids: list = None,
    completed_activities: list = None,
    answered_questions: list = None,
    student_input: str = None,
    language: str = "English",
    persona: str = "lilly",
    lesson_data: dict = None,
    is_paused: bool = False,
    is_completed: bool = False
) -> dict:
    """
    Saves the live learning session state for an active lesson.
    Persists elapsed timer, current section index, completed exercises, quiz checkpoints, and lesson data.
    """
    if not session_id:
        return {}

    all_sessions = _load_sessions()
    now_iso = datetime.now().isoformat()
    existing = all_sessions.get(session_id, {})

    entry = {
        "session_id": session_id,
        "subject": subject or existing.get("subject", ""),
        "topic": topic or existing.get("topic", ""),
        "target_duration_minutes": target_duration_minutes or existing.get("target_duration_minutes", 30),
        "elapsed_learning_seconds": elapsed_learning_seconds if elapsed_learning_seconds is not None else existing.get("elapsed_learning_seconds", 0),
        "current_section_index": current_section_index if current_section_index is not None else existing.get("current_section_index", 0),
        "completed_section_ids": completed_section_ids if completed_section_ids is not None else existing.get("completed_section_ids", []),
        "completed_activities": completed_activities if completed_activities is not None else existing.get("completed_activities", []),
        "answered_questions": answered_questions if answered_questions is not None else existing.get("answered_questions", []),
        "student_input": student_input if student_input is not None else existing.get("student_input", ""),
        "language": language or existing.get("language", "English"),
        "persona": persona or existing.get("persona", "lilly"),
        "lesson_data": lesson_data if lesson_data is not None else existing.get("lesson_data", None),
        "is_paused": is_paused,
        "is_completed": is_completed,
        "created_at": existing.get("created_at", now_iso),
        "updated_at": now_iso
    }

    all_sessions[session_id] = entry
    _save_sessions_file(all_sessions)
    return entry


def get_lesson_session(session_id: str):
    """Retrieve saved session state by session_id."""
    if not session_id:
        return None
    all_sessions = _load_sessions()
    return all_sessions.get(session_id, None)


def get_latest_incomplete_session():
    """
    Finds and returns the most recent active session that has not been marked completed.
    Returns None if no active incomplete sessions exist.
    """
    all_sessions = _load_sessions()
    if not all_sessions:
        return None

    # Filter for incomplete sessions with valid session_id
    incomplete = [
        s for s in all_sessions.values()
        if isinstance(s, dict) and not s.get("is_completed", False) and (s.get("topic") or s.get("subject"))
    ]

    if not incomplete:
        return None

    # Sort descending by updated_at or created_at
    incomplete.sort(
        key=lambda x: x.get("updated_at") or x.get("created_at") or "",
        reverse=True
    )
    return incomplete[0]


def clear_lesson_session(session_id: str) -> dict:
    """Remove a session from storage after final completion or reset."""
    if not session_id:
        return {"status": "ok"}
    all_sessions = _load_sessions()
    if session_id in all_sessions:
        del all_sessions[session_id]
        _save_sessions_file(all_sessions)
    return {"status": "cleared", "session_id": session_id}


