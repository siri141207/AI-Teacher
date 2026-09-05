# pyrefly: ignore [missing-import]

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()


# =========================================================
# FASTAPI APPLICATION
# =========================================================

app = FastAPI(
    title="Lilly - AI Teacher",
    description=(
        "Advanced AI Teacher with personalized learning, "
        "RAG, adaptive teaching, visual learning, "
        "conversation memory and voice assistance."
    ),
    version="1.0.0"
)


# =========================================================
# CORS CONFIGURATION
# =========================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        # Local development
        "http://localhost:5173",
        "http://127.0.0.1:5173",

        "http://localhost:5174",
        "http://127.0.0.1:5174",

        "http://localhost:3000",
        "http://127.0.0.1:3000",

        # Production Vercel frontend
        "https://ai-teacher-2-ks4pqal4d-siri-b157.vercel.app",
    ],

    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# ROUTERS
# =========================================================

from api.lesson import router as lesson_router
from api.documents import router as document_router
from api.voice import router as voice_router
from api.auth import router as auth_router


# =========================================================
# REGISTER ROUTERS
# =========================================================

app.include_router(
    lesson_router,
    prefix="/api"
)

app.include_router(
    document_router,
    prefix="/api"
)

app.include_router(
    voice_router,
    prefix="/api"
)

app.include_router(
    auth_router,
    prefix="/api"
)


# =========================================================
# HOME
# =========================================================

@app.get("/")
def home():
    return {
        "status": "online",
        "service": "Lilly - AI Teacher",
        "message": "Lilly AI Teacher backend is running 🚀"
    }


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }