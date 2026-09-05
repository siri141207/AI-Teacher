import os
import asyncio
import tempfile
from typing import Optional

from faster_whisper import WhisperModel
import edge_tts


# ============================================================
# WHISPER MODEL (LAZY LOADED)
# ============================================================

MODEL_SIZE = "base"
_whisper_model = None


def get_whisper_model():
    global _whisper_model
    if _whisper_model is None:
        _whisper_model = WhisperModel(
            MODEL_SIZE,
            device="cpu",
            compute_type="int8"
        )
    return _whisper_model


# ============================================================
# VOICE MAPPINGS
# ============================================================

VOICE_MAP = {
    ("english", "lilly"): "en-US-AriaNeural",
    ("english", "vikram"): "en-IN-PrabhatNeural",
    ("english", "alex"): "en-US-GuyNeural",
    ("hindi", "lilly"): "hi-IN-SwaraNeural",
    ("hindi", "vikram"): "hi-IN-MadhurNeural",
    ("hindi", "alex"): "hi-IN-MadhurNeural",
    ("hinglish", "lilly"): "hi-IN-SwaraNeural",
    ("hinglish", "vikram"): "hi-IN-MadhurNeural",
    ("hinglish", "alex"): "hi-IN-MadhurNeural",
    ("telugu", "lilly"): "te-IN-ShrutiNeural",
    ("telugu", "vikram"): "te-IN-MohanNeural",
    ("telugu", "alex"): "te-IN-MohanNeural",
    ("tamil", "lilly"): "ta-IN-PallaviNeural",
    ("tamil", "vikram"): "ta-IN-ValluvarNeural",
    ("tamil", "alex"): "ta-IN-ValluvarNeural",
    ("spanish", "lilly"): "es-ES-ElviraNeural",
    ("spanish", "vikram"): "es-ES-AlvaroNeural",
    ("spanish", "alex"): "es-ES-AlvaroNeural",
    ("french", "lilly"): "fr-FR-DeniseNeural",
    ("french", "vikram"): "fr-FR-HenriNeural",
    ("french", "alex"): "fr-FR-HenriNeural",
    ("german", "lilly"): "de-DE-KatjaNeural",
    ("german", "vikram"): "de-DE-ConradNeural",
    ("german", "alex"): "de-DE-ConradNeural",
}


def get_voice_for_language(language: str = "english", persona: str = "lilly") -> str:
    lang_key = (language or "english").strip().lower()
    persona_key = (persona or "lilly").strip().lower()

    if (lang_key, persona_key) in VOICE_MAP:
        return VOICE_MAP[(lang_key, persona_key)]

    if ("english", persona_key) in VOICE_MAP:
        return VOICE_MAP[("english", persona_key)]

    return "en-US-AriaNeural"


# ============================================================
# SPEECH TO TEXT
# ============================================================

def transcribe_audio(
    audio_path: str,
    language: Optional[str] = None
):
    lang_param = None if (not language or language.lower() in ["auto", "any", "all"]) else language.lower()

    model = get_whisper_model()
    segments, info = model.transcribe(
        audio_path,
        language=lang_param,
        beam_size=5
    )

    text_parts = []
    for segment in segments:
        text_parts.append(segment.text.strip())

    text = " ".join(text_parts).strip()

    return {
        "text": text,
        "language": info.language
    }


# ============================================================
# TEXT TO SPEECH
# ============================================================

async def text_to_speech(
    text: str,
    output_path: str,
    voice: str = "en-US-AriaNeural"
):
    communicate = edge_tts.Communicate(
        text,
        voice
    )
    await communicate.save(
        output_path
    )


async def generate_speech(
    text: str,
    voice: str = "en-US-AriaNeural"
):
    temp_file = tempfile.NamedTemporaryFile(
        delete=False,
        suffix=".mp3"
    )
    output_path = temp_file.name
    temp_file.close()

    await text_to_speech(
        text,
        output_path,
        voice
    )

    return output_path