from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import admin, calendar, chat, dua, hadith, mosque, prayer, qibla, quran, tasbeeh, zakat

settings = get_settings()

app = FastAPI(
    title="ILM Buddy API",
    description="RAG-based Islamic knowledge API — Quran & Hadith backed chatbot.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.cors_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)
app.include_router(quran.router)
app.include_router(hadith.router)
app.include_router(prayer.router)
app.include_router(qibla.router)
app.include_router(zakat.router)
app.include_router(tasbeeh.router)
app.include_router(calendar.router)
app.include_router(dua.router)
app.include_router(mosque.router)
app.include_router(admin.router)


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "environment": settings.environment}
