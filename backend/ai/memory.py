# ============================================================
# SIMPLE CONVERSATION MEMORY
# ============================================================

# In-memory storage.
# Each session_id gets its own conversation history.

conversations = {}


# ============================================================
# SESSION METADATA STORE
# Subject lock, lesson number, and topic continuity per session
# ============================================================

session_metadata = {}


def get_session_metadata(session_id: str) -> dict:
    """Return the metadata dict for a session (subject, lesson_number, topics_covered)."""
    return session_metadata.get(session_id, {})


def set_session_subject(session_id: str, subject: str):
    """Lock the subject for this session and reject subject changes."""
    subject = (subject or "").strip()
    if not subject:
        return get_session_subject(session_id)

    if session_id not in session_metadata:
        session_metadata[session_id] = {}

    locked_subject = session_metadata[session_id].get("subject")
    if locked_subject:
        if locked_subject.casefold() != subject.casefold():
            raise ValueError(
                f"Session is locked to '{locked_subject}', not '{subject}'. "
                "Start a new session to change subjects."
            )
        return locked_subject

    if not locked_subject:
        session_metadata[session_id]["subject"] = subject
        session_metadata[session_id]["lesson_number"] = 0
        session_metadata[session_id]["topics_covered"] = []

    return subject


def get_session_subject(session_id: str) -> str:
    """Return the locked subject for this session, or empty string."""
    return session_metadata.get(session_id, {}).get("subject", "")


def increment_lesson_number(session_id: str) -> int:
    """Increment and return the new lesson number for this session."""
    if session_id not in session_metadata:
        session_metadata[session_id] = {}
    n = session_metadata[session_id].get("lesson_number", 0) + 1
    session_metadata[session_id]["lesson_number"] = n
    return n


def get_lesson_number(session_id: str) -> int:
    """Return the current lesson number (0 = no lessons yet)."""
    return session_metadata.get(session_id, {}).get("lesson_number", 0)


def add_topic_covered(session_id: str, topic: str):
    """Record a topic as covered in this session."""
    if session_id not in session_metadata:
        session_metadata[session_id] = {}
    covered = session_metadata[session_id].setdefault("topics_covered", [])
    if topic and topic not in covered:
        covered.append(topic)


def get_topics_covered(session_id: str) -> list:
    """Return the list of topics already covered in this session."""
    return session_metadata.get(session_id, {}).get("topics_covered", [])


def clear_session(session_id: str):
    """Fully reset a session (conversation + metadata)."""
    conversations.pop(session_id, None)
    session_metadata.pop(session_id, None)


# ============================================================
# GET CONVERSATION
# ============================================================

def get_conversation(session_id: str):

    return conversations.get(
        session_id,
        []
    )


# ============================================================
# ADD MESSAGE
# ============================================================

def add_message(
    session_id: str,
    role: str,
    content: str
):

    if session_id not in conversations:

        conversations[session_id] = []

    conversations[session_id].append({

        "role": role,

        "content": content
    })


# ============================================================
# CLEAR CONVERSATION
# ============================================================

def clear_conversation(session_id: str):

    conversations.pop(
        session_id,
        None
    )


# ============================================================
# LIMIT MEMORY
# ============================================================

def limit_conversation(
    session_id: str,
    max_messages: int = 20
):

    if session_id not in conversations:

        return

    conversations[session_id] = conversations[
        session_id
    ][-max_messages:]
