import os
import sqlite3
from datetime import datetime

from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST_DIR = os.path.join(BASE_DIR, "dist")

DATA_DIR = os.environ.get("DATA_DIR", BASE_DIR)
os.makedirs(DATA_DIR, exist_ok=True)

DB = os.path.join(DATA_DIR, "answers.db")
OWNER_PASSWORD = os.environ.get("OWNER_PASSWORD", "")

app = FastAPI(title="MehraruBirthday")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def init_db():
    conn = sqlite3.connect(DB)

    conn.execute("""
        CREATE TABLE IF NOT EXISTS answers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            answer TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)

    conn.commit()
    conn.close()


init_db()


class Answer(BaseModel):
    answer: str


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "service": "MehraruBirthday"
    }


@app.post("/api/answers")
def save_answer(data: Answer):

    answer = data.answer.strip()

    if not answer:
        raise HTTPException(
            status_code=400,
            detail="Answer is empty."
        )

    conn = sqlite3.connect(DB)

    cursor = conn.execute(
        """
        INSERT INTO answers (answer, created_at)
        VALUES (?, ?)
        """,
        (
            answer,
            datetime.now().isoformat()
        )
    )

    conn.commit()

    answer_id = cursor.lastrowid

    conn.close()

    return {
        "success": True,
        "id": answer_id,
        "message": "Answer saved"
    }


@app.get("/api/answers")
def get_answers(
    x_owner_password: str = Header(default="")
):

    if not OWNER_PASSWORD:
        raise HTTPException(
            status_code=500,
            detail="Owner password is not configured."
        )

    if x_owner_password != OWNER_PASSWORD:
        raise HTTPException(
            status_code=401,
            detail="Unauthorized"
        )

    conn = sqlite3.connect(DB)

    rows = conn.execute(
        """
        SELECT id, answer, created_at
        FROM answers
        ORDER BY id DESC
        """
    ).fetchall()

    conn.close()

    return [
        {
            "id": row[0],
            "answer": row[1],
            "created_at": row[2]
        }
        for row in rows
    ]


# Serve Vite assets
if os.path.isdir(os.path.join(DIST_DIR, "assets")):
    app.mount(
        "/assets",
        StaticFiles(
            directory=os.path.join(DIST_DIR, "assets")
        ),
        name="assets"
    )


if os.path.isdir(os.path.join(DIST_DIR, "photos")):
    app.mount(
        "/photos",
        StaticFiles(
            directory=os.path.join(DIST_DIR, "photos")
        ),
        name="photos"
    )


@app.get("/{full_path:path}")
def frontend(full_path: str):

    if full_path.startswith("api/"):
        raise HTTPException(
            status_code=404,
            detail="API endpoint not found"
        )

    requested = os.path.join(
        DIST_DIR,
        full_path
    )

    if full_path and os.path.isfile(requested):
        return FileResponse(requested)

    index = os.path.join(
        DIST_DIR,
        "index.html"
    )

    if os.path.isfile(index):
        return FileResponse(index)

    raise HTTPException(
        status_code=500,
        detail="Frontend build not found"
    )

