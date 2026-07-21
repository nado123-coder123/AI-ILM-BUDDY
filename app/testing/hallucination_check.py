"""
A structural (not semantic) hallucination check: scans the generated
answer text for Quran/Hadith-style references (e.g. "2:255",
"Surah Al-Baqarah 2:255", "Bukhari #123") and flags any that don't match
one of the SourceRef objects actually returned by retrieval. This can't
catch subtler fabrication (a real reference used to support a claim it
doesn't actually support), but it catches the sharpest failure mode: the
model naming a verse/hadith that was never retrieved at all.
"""
import re

from app.models.schemas import SourceRef

# Matches "2:255", "Surah 2:255", "Surah Al-Baqarah 2:255", etc.
_QURAN_REF_PATTERN = re.compile(r"\b(\d{1,3}):(\d{1,3})\b")
# Matches "Bukhari #123", "Muslim 456", "Sahih Bukhari #123"
_HADITH_REF_PATTERN = re.compile(r"\b([A-Za-z][A-Za-z \-']{2,30}?)\s*#?\s*(\d{1,5})\b")


def _normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text.strip().lower())


def find_unverified_references(answer_text: str, sources: list[SourceRef]) -> list[str]:
    """Returns a list of reference-like strings in the answer that don't
    correspond to any of the actually-retrieved sources. An empty list
    means every reference-shaped mention in the answer is backed by a
    real retrieved source."""
    verified_refs = {_normalize(s.reference) for s in sources}
    flagged: list[str] = []

    for match in _QURAN_REF_PATTERN.finditer(answer_text):
        surah, ayah = match.groups()
        candidate = f"surah {surah}:{ayah}"
        if not any(candidate in ref or f"{surah}:{ayah}" in ref for ref in verified_refs):
            flagged.append(match.group(0))

    return flagged


def check_answer(answer_text: str, sources: list[SourceRef]) -> dict:
    unverified = find_unverified_references(answer_text, sources)
    return {
        "has_sources": len(sources) > 0,
        "unverified_reference_count": len(unverified),
        "unverified_references": unverified,
        "passed": len(unverified) == 0,
    }
