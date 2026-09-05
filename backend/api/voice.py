import os
import traceback
from typing import Optional

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Form,
    HTTPException
)
from fastapi.responses import FileResponse

from ai.voice import (
    transcribe_audio,
    generate_speech,
    get_voice_for_language,
    VOICE_MAP
)
from ai.lesson_planner import (
    generate_chat_response
)


router = APIRouter()


# =========================================================
# LIST VOICES & PERSONAS
# =========================================================

@router.get("/voice/personas")
def get_personas():
    return {
        "personas": [
            {
                "id": "lilly",
                "name": "Lilly",
                "role": "AI Senior Educator",
                "avatar": "lilly",
                "style": "Patient, warm, analogy-rich, highly encouraging."
            },
            {
                "id": "vikram",
                "name": "Prof. Vikram",
                "role": "Academic & Scientific Fellow",
                "avatar": "vikram",
                "style": "Rigorous, analytical, first-principles, deep technical explanations."
            },
            {
                "id": "alex",
                "name": "Alex",
                "role": "Tech & Practical Lab Instructor",
                "avatar": "alex",
                "style": "Hands-on, energetic, code-driven, real-world examples."
            }
        ]
    }


# =========================================================
# SPEECH TO TEXT
# =========================================================

@router.post("/voice/transcribe")
async def transcribe_voice(
    audio: UploadFile = File(...),
    language: Optional[str] = Form(None)
):
    temp_path = None

    try:
        file_extension = os.path.splitext(
            audio.filename or ".webm"
        )[1]

        temp_path = f"temp_voice_input{file_extension}"

        with open(temp_path, "wb") as buffer:
            buffer.write(await audio.read())

        # Auto-detect language if not strictly specified
        result = transcribe_audio(
            temp_path,
            language
        )

        return result

    except Exception as error:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )

    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass


# =========================================================
# VOICE AI TEACHER
# =========================================================

@router.post("/voice/ask")
async def voice_teacher(
    audio: UploadFile = File(...),
    session_id: str = Form(...),
    language: str = Form("English"),
    level: str = Form("beginner")
):
    temp_path = None

    try:
        file_extension = os.path.splitext(
            audio.filename or ".webm"
        )[1]

        temp_path = f"temp_voice_input{file_extension}"

        with open(temp_path, "wb") as buffer:
            buffer.write(await audio.read())

        transcription = transcribe_audio(
            temp_path,
            None
        )

        question = transcription["text"].strip()

        if not question:
            raise HTTPException(
                status_code=400,
                detail="Could not understand the audio. Please speak clearly into your microphone."
            )

        answer = generate_chat_response(
            session_id=session_id,
            question=question,
            language=language,
            level=level
        )

        return {
            "session_id": session_id,
            "question": question,
            "answer": answer,
            "detected_language": transcription["language"]
        }

    except HTTPException:
        raise

    except Exception as error:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )

    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass


# =========================================================
# TEXT TO SPEECH
# =========================================================

@router.post("/voice/speak")
async def speak_text(
    text: str = Form(...),
    voice: Optional[str] = Form(None),
    language: Optional[str] = Form("english"),
    persona: Optional[str] = Form("lilly")
):
    output_path = None

    try:
        chosen_voice = voice
        if not chosen_voice or chosen_voice == "auto":
            chosen_voice = get_voice_for_language(language or "english", persona or "lilly")

        output_path = await generate_speech(
            text,
            chosen_voice
        )

        return FileResponse(
            output_path,
            media_type="audio/mpeg",
            filename="ai_teacher_response.mp3"
        )

    except Exception as error:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )