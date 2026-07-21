from pydantic import BaseModel, Field
from typing import Literal, Optional


class SourceRef(BaseModel):
    type: Literal["quran", "hadith"]
    reference: str          # e.g. "Surah Al-Baqarah 2:255" or "Sahih Bukhari 1:1"
    arabic_text: Optional[str] = None
    translation: str
    authenticity: Optional[str] = None   # hadith grading, if applicable
    score: float             # similarity score from vector search


class ChatRequest(BaseModel):
    question: str = Field(..., min_length=2, max_length=1000)
    language: Literal["en", "ur"] = "en"
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    answer: str
    sources: list[SourceRef]
    disclaimer: str = (
        "This is general Islamic information based on retrieved Quran and "
        "Hadith sources, not a personal fatwa. For rulings specific to your "
        "situation, please consult a qualified local scholar."
    )


class SurahMeta(BaseModel):
    number: int
    name_arabic: str
    name_english: str
    name_translation: str
    revelation_type: str
    total_ayahs: int


class SurahAyah(BaseModel):
    number_in_surah: int
    arabic_text: str
    translation: str


class SurahDetail(BaseModel):
    meta: SurahMeta
    ayahs: list[SurahAyah]


class QuranSearchResult(BaseModel):
    surah: int
    ayah: int
    arabic_text: str
    translation: str
    score: float


class PrayerTimings(BaseModel):
    fajr: str
    dhuhr: str
    asr: str
    maghrib: str
    isha: str
    sunrise: Optional[str] = None
    date_gregorian: str
    date_hijri: str
    timezone: str


class MonthlyPrayerDay(BaseModel):
    date_gregorian: str
    date_hijri: str
    fajr: str
    dhuhr: str
    asr: str
    maghrib: str
    isha: str


class ZakatRequest(BaseModel):
    gold_grams: float = Field(0, ge=0)
    silver_grams: float = Field(0, ge=0)
    cash: float = Field(0, ge=0)
    savings: float = Field(0, ge=0)
    business_assets: float = Field(0, ge=0)
    debts_due: float = Field(0, ge=0, description="Short-term debts owed, deducted from wealth")
    gold_price_per_gram: float = Field(..., gt=0, description="Current market price, in your currency")
    silver_price_per_gram: float = Field(..., gt=0, description="Current market price, in your currency")
    nisab_basis: Literal["gold", "silver"] = Field(
        "silver",
        description="Which metal's value sets the Nisab threshold. Silver is lower and more "
        "commonly used so more wealth qualifies; some scholars prefer gold. Scholarly opinions vary.",
    )


class ZakatResponse(BaseModel):
    total_zakatable_wealth: float
    nisab_threshold: float
    nisab_basis: str
    meets_nisab: bool
    zakat_due: float
    zakat_rate: float = 0.025
    breakdown: dict[str, float]
    note: str = (
        "This is a general estimate (2.5% of qualifying wealth held a full lunar year, "
        "above Nisab). It is not a personal fatwa — asset types like business inventory "
        "or mixed holdings can need scholarly judgment. Consult a qualified scholar for "
        "your specific situation."
    )


class TasbeehSession(BaseModel):
    dhikr: str
    count: int = Field(..., gt=0)
    date: Optional[str] = None  # YYYY-MM-DD, defaults to today server-side


class TasbeehDay(BaseModel):
    date: str
    dhikr: str
    count: int


class TasbeehProgress(BaseModel):
    date: str
    total_count: int
    goal: Optional[int] = None
    goal_met: Optional[bool] = None
    sessions: list[TasbeehDay]


class HijriDateResponse(BaseModel):
    gregorian_date: str
    hijri_date: str
    hijri_day: int
    hijri_month_number: int
    hijri_month_name: str
    hijri_year: int


class RamadanCountdown(BaseModel):
    today_gregorian: str
    ramadan_start_gregorian: str
    hijri_year: int
    days_remaining: int
    is_ramadan_now: bool


class SehriIftarTimes(BaseModel):
    date_gregorian: str
    sehri_end: str  # = Fajr
    iftar_time: str  # = Maghrib


class Dua(BaseModel):
    id: str
    category: str
    title: str
    arabic_text: str
    transliteration: str
    translation: str
    reference: str


class Mosque(BaseModel):
    place_id: str
    name: str
    address: str
    latitude: float
    longitude: float
    distance_km: Optional[float] = None
    rating: Optional[float] = None
    is_open_now: Optional[bool] = None


class QiblaResponse(BaseModel):
    direction_degrees: float = Field(..., description="Bearing from true north, 0-360")
    distance_km: float
    latitude: float
    longitude: float


class HadithCollectionMeta(BaseModel):
    name: str
    title: str
    total_hadiths: Optional[int] = None
    total_books: Optional[int] = None


class HadithBookMeta(BaseModel):
    book_number: str
    name: str
    number_of_hadiths: Optional[int] = None


class HadithDetail(BaseModel):
    collection: str
    book_number: str
    hadith_number: str
    arabic_text: Optional[str] = None
    translation: str
    narrator: Optional[str] = None
    authenticity: Optional[str] = None


class HadithSearchResult(BaseModel):
    collection: str
    book: str
    hadith_number: str
    arabic_text: Optional[str] = None
    translation: str
    narrator: Optional[str] = None
    authenticity: Optional[str] = None
    score: float
