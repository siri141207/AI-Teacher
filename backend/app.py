from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

fastapi_app = FastAPI(
    title="Lilly - AI Teacher",
    description=(
        "Advanced AI Teacher with personalized learning, "
        "RAG, adaptive teaching, visual learning, "
        "conversation memory and voice assistance."
    ),
    version="1.0.0"
)

# CORS
# Allow the stable Vercel domain AND all Vercel preview/deployment URLs
app = CORSMiddleware(
    app=fastapi_app,
    allow_origins=[
        "https://ai-teacher-2-nine.vercel.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_origin_regex=r"https://ai-teacher-2-[a-z0-9]+-siri-b157\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from api.lesson import router as lesson_router
from api.documents import router as document_router
from api.voice import router as voice_router
from api.auth import router as auth_router

fastapi_app.include_router(lesson_router, prefix="/api")
fastapi_app.include_router(document_router, prefix="/api")
fastapi_app.include_router(voice_router, prefix="/api")
fastapi_app.include_router(auth_router, prefix="/api")


@fastapi_app.get("/")
def home():
    return {
        "status": "online",
        "service": "Lilly - AI Teacher",
        "message": "Lilly AI Teacher backend is running 🚀"
    }


@fastapi_app.get("/health")
def health():
    return {"status": "healthy"}
