# pyrefly: ignore [missing-import]

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
import sqlite3
import os
import hashlib


# =========================================================
# ROUTER
# =========================================================

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# =========================================================
# DATABASE
# =========================================================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DATABASE_DIR = os.path.join(BASE_DIR, "database")

DATABASE_PATH = os.path.join(
    DATABASE_DIR,
    "users.db"
)


os.makedirs(DATABASE_DIR, exist_ok=True)


# =========================================================
# DATABASE INITIALIZATION
# =========================================================

def init_database():

    connection = sqlite3.connect(DATABASE_PATH)

    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)

    connection.commit()

    connection.close()


init_database()


# =========================================================
# PASSWORD HASHING
# =========================================================

def hash_password(password: str):

    return hashlib.sha256(
        password.encode("utf-8")
    ).hexdigest()


# =========================================================
# REQUEST MODELS
# =========================================================

class SignupRequest(BaseModel):

    full_name: str

    email: EmailStr

    password: str


class LoginRequest(BaseModel):

    email: EmailStr

    password: str


# =========================================================
# SIGNUP
# =========================================================

@router.post("/signup")
def signup(data: SignupRequest):

    full_name = data.full_name.strip()

    email = str(data.email).lower().strip()

    password = data.password


    # -----------------------------
    # VALIDATION
    # -----------------------------

    if not full_name:

        raise HTTPException(
            status_code=400,
            detail="Full name is required."
        )


    if len(password) < 6:

        raise HTTPException(
            status_code=400,
            detail="Password must contain at least 6 characters."
        )


    # -----------------------------
    # DATABASE
    # -----------------------------

    connection = sqlite3.connect(DATABASE_PATH)

    cursor = connection.cursor()


    # Check existing user

    cursor.execute(
        "SELECT id FROM users WHERE email = ?",
        (email,)
    )

    existing_user = cursor.fetchone()


    if existing_user:

        connection.close()

        raise HTTPException(
            status_code=400,
            detail="An account with this email already exists."
        )


    # -----------------------------
    # HASH PASSWORD
    # -----------------------------

    password_hash = hash_password(password)


    # -----------------------------
    # CREATE USER
    # -----------------------------

    from datetime import datetime

    created_at = datetime.utcnow().isoformat()


    cursor.execute(
        """
        INSERT INTO users
        (full_name, email, password_hash, created_at)
        VALUES (?, ?, ?, ?)
        """,
        (
            full_name,
            email,
            password_hash,
            created_at
        )
    )


    user_id = cursor.lastrowid


    connection.commit()

    connection.close()


    # -----------------------------
    # RESPONSE
    # -----------------------------

    return {

        "message": "Account created successfully.",

        "user": {

            "id": user_id,

            "full_name": full_name,

            "email": email

        }

    }


# =========================================================
# LOGIN
# =========================================================

@router.post("/login")
def login(data: LoginRequest):

    email = str(data.email).lower().strip()

    password = data.password


    connection = sqlite3.connect(DATABASE_PATH)

    cursor = connection.cursor()


    cursor.execute(
        """
        SELECT id, full_name, email, password_hash
        FROM users
        WHERE email = ?
        """,
        (email,)
    )


    user = cursor.fetchone()


    connection.close()


    # -----------------------------
    # USER NOT FOUND
    # -----------------------------

    if not user:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )


    user_id = user[0]

    full_name = user[1]

    user_email = user[2]

    stored_password_hash = user[3]


    # -----------------------------
    # VERIFY PASSWORD
    # -----------------------------

    password_hash = hash_password(password)


    if password_hash != stored_password_hash:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )


    # -----------------------------
    # RESPONSE
    # -----------------------------

    return {

        "message": "Login successful.",

        "user": {

            "id": user_id,

            "full_name": full_name,

            "email": user_email

        }

    }


# =========================================================
# LOGOUT
# =========================================================

@router.post("/logout")
def logout():

    return {

        "message": "Logged out successfully."

    }