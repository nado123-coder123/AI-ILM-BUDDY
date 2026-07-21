"""
Browse endpoints for the Quran Reader screen. Deliberately separate from
quran_service's RAG search (embedding + FAISS) — reading a surah in order
is a plain sequential fetch, not a similarity search, and hitting
AlQuran Cloud directly here means the reader works even before the RAG
ingestion script has been run.
"""
from functools import lru_cache

import httpx

from app.config import get_settings
from app.models.schemas import SurahAyah, SurahDetail, SurahMeta

ARABIC_EDITION = "quran-uthmani"
TRANSLATION_EDITION = "en.sahih"


@lru_cache
def list_surahs() -> list[SurahMeta]:
    settings = get_settings()
    resp = httpx.get(f"{settings.quran_api_base}/surah", timeout=15)
    resp.raise_for_status()
    data = resp.json()["data"]

    return [
        SurahMeta(
            number=s["number"],
            name_arabic=s["name"],
            name_english=s["englishName"],
            name_translation=s["englishNameTranslation"],
            revelation_type=s["revelationType"],
            total_ayahs=s["numberOfAyahs"],
        )
        for s in data
    ]


def get_surah(surah_number: int) -> SurahDetail:
    settings = get_settings()

    arabic_resp = httpx.get(
        f"{settings.quran_api_base}/surah/{surah_number}/{ARABIC_EDITION}", timeout=20
    )
    arabic_resp.raise_for_status()
    arabic_data = arabic_resp.json()["data"]

    translation_resp = httpx.get(
        f"{settings.quran_api_base}/surah/{surah_number}/{TRANSLATION_EDITION}", timeout=20
    )
    translation_resp.raise_for_status()
    translation_data = translation_resp.json()["data"]

    ayahs = [
        SurahAyah(
            number_in_surah=ar["numberInSurah"],
            arabic_text=ar["text"],
            translation=tr["text"],
        )
        for ar, tr in zip(arabic_data["ayahs"], translation_data["ayahs"])
    ]

    meta = SurahMeta(
        number=arabic_data["number"],
        name_arabic=arabic_data["name"],
        name_english=arabic_data["englishName"],
        name_translation=arabic_data["englishNameTranslation"],
        revelation_type=arabic_data["revelationType"],
        total_ayahs=len(ayahs),
    )

    return SurahDetail(meta=meta, ayahs=ayahs)
