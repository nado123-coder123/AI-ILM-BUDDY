export type Language = 'en' | 'ur';

export interface SourceRef {
  type: 'quran' | 'hadith';
  reference: string;
  arabic_text?: string | null;
  translation: string;
  authenticity?: string | null;
  score: number;
}

export interface ChatRequest {
  question: string;
  language: Language;
  session_id?: string | null;
}

export interface ChatResponse {
  answer: string;
  sources: SourceRef[];
  disclaimer: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  sources?: SourceRef[];
  disclaimer?: string;
  pending?: boolean;
  error?: string;
}

export interface ZakatRequest {
  gold_grams: number;
  silver_grams: number;
  cash: number;
  savings: number;
  business_assets: number;
  debts_due: number;
  gold_price_per_gram: number;
  silver_price_per_gram: number;
  nisab_basis: 'gold' | 'silver';
}

export interface ZakatResponse {
  total_zakatable_wealth: number;
  nisab_threshold: number;
  nisab_basis: string;
  meets_nisab: boolean;
  zakat_due: number;
  zakat_rate: number;
  breakdown: Record<string, number>;
  note: string;
}

export interface Dua {
  id: string;
  category: string;
  title: string;
  arabic_text: string;
  transliteration: string;
  translation: string;
  reference: string;
}

export interface PrayerTimings {
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  sunrise?: string | null;
  date_gregorian: string;
  date_hijri: string;
  timezone: string;
}

export interface QiblaResponse {
  direction_degrees: number;
  distance_km: number;
  latitude: number;
  longitude: number;
}

export interface HijriDateResponse {
  gregorian_date: string;
  hijri_date: string;
  hijri_day: number;
  hijri_month_number: number;
  hijri_month_name: string;
  hijri_year: number;
}

export interface RamadanCountdown {
  today_gregorian: string;
  ramadan_start_gregorian: string;
  hijri_year: number;
  days_remaining: number;
  is_ramadan_now: boolean;
}

export interface SurahMeta {
  number: number;
  name_arabic: string;
  name_english: string;
  name_translation: string;
  revelation_type: string;
  total_ayahs: number;
}

export interface SurahAyah {
  number_in_surah: number;
  arabic_text: string;
  translation: string;
}

export interface SurahDetail {
  meta: SurahMeta;
  ayahs: SurahAyah[];
}

export interface HadithCollectionMeta {
  name: string;
  title: string;
  total_hadiths?: number | null;
  total_books?: number | null;
}

export interface HadithBookMeta {
  book_number: string;
  name: string;
  number_of_hadiths?: number | null;
}

export interface HadithDetail {
  collection: string;
  book_number: string;
  hadith_number: string;
  arabic_text?: string | null;
  translation: string;
  narrator?: string | null;
  authenticity?: string | null;
}

export interface Mosque {
  place_id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distance_km?: number | null;
  rating?: number | null;
  is_open_now?: boolean | null;
}

export interface TasbeehSessionInput {
  dhikr: string;
  count: number;
  date?: string | null;
}

export interface ChatLogEntry {
  session_id: string;
  question: string;
  answer: string;
  sources: unknown[];
  created_at?: string | null;
}

export interface TasbeehDay {
  date: string;
  dhikr: string;
  count: number;
}

export interface TasbeehProgress {
  date: string;
  total_count: number;
  goal?: number | null;
  goal_met?: boolean | null;
  sessions: TasbeehDay[];
}
