"""
Dua library. NOTE: the seed data in app/data/duas_seed.json is a small,
carefully-chosen set of very well-known duas, but it has NOT been checked
character-by-character against a mus'haf / authenticated Hadith text by
a qualified reviewer. Treat it as a starting scaffold for the admin
dashboard's content team to verify before this goes to production —
same standard the plan requires for Quran/Hadith content.
"""
import json
import os
from functools import lru_cache

from app.models.schemas import Dua

_SEED_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "duas_seed.json")


@lru_cache
def _load_duas() -> list[Dua]:
    with open(_SEED_PATH, "r", encoding="utf-8") as f:
        raw = json.load(f)
    return [Dua(**item) for item in raw]


def list_duas(category: str | None = None) -> list[Dua]:
    duas = _load_duas()
    if category:
        return [d for d in duas if d.category == category]
    return duas


def get_dua(dua_id: str) -> Dua | None:
    return next((d for d in _load_duas() if d.id == dua_id), None)


def list_categories() -> list[str]:
    return sorted({d.category for d in _load_duas()})
