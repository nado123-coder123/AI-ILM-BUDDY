/**
 * Thin fetch wrapper around the ILM Buddy FastAPI backend.
 *
 * NEXT_PUBLIC_API_BASE_URL must be set at build time (Vercel: Project
 * Settings → Environment Variables) since NEXT_PUBLIC_* vars are inlined
 * into the client bundle, not read at runtime on the server.
 */
import {
  ChatLogEntry,
  ChatRequest,
  ChatResponse,
  Dua,
  HadithBookMeta,
  HadithCollectionMeta,
  HadithDetail,
  HijriDateResponse,
  Mosque,
  PrayerTimings,
  QiblaResponse,
  RamadanCountdown,
  SurahDetail,
  SurahMeta,
  TasbeehDay,
  TasbeehProgress,
  TasbeehSessionInput,
  ZakatRequest,
  ZakatResponse,
} from './types';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  path: string,
  init?: RequestInit,
  token?: string,
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers,
    ...init,
  });

  if (!response.ok) {
    let detail = `Request failed with status ${response.status}`;
    try {
      const body = await response.json();
      detail = body?.detail ?? detail;
    } catch {
      /* response wasn't JSON — keep default message */
    }
    throw new ApiError(detail, response.status);
  }

  return (await response.json()) as T;
}

export function sendChatMessage(
  body: ChatRequest,
  signal?: AbortSignal,
): Promise<ChatResponse> {
  return request<ChatResponse>('/chat', {
    method: 'POST',
    body: JSON.stringify(body),
    signal,
  });
}

export function calculateZakat(body: ZakatRequest): Promise<ZakatResponse> {
  return request<ZakatResponse>('/zakat/calculate', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function listDuas(category?: string): Promise<Dua[]> {
  const qs = category ? `?category=${encodeURIComponent(category)}` : '';
  return request<Dua[]>(`/duas${qs}`);
}

export function listDuaCategories(): Promise<string[]> {
  return request<string[]>('/duas/categories');
}

export function getPrayerTimes(lat: number, lng: number): Promise<PrayerTimings> {
  return request<PrayerTimings>(`/prayer-times?lat=${lat}&lng=${lng}`);
}

export function getQibla(lat: number, lng: number): Promise<QiblaResponse> {
  return request<QiblaResponse>(`/qibla?lat=${lat}&lng=${lng}`);
}

export function getHijriDate(): Promise<HijriDateResponse> {
  return request<HijriDateResponse>('/calendar/hijri-date');
}

export function getRamadanCountdown(): Promise<RamadanCountdown> {
  return request<RamadanCountdown>('/calendar/ramadan-countdown');
}

// --- Quran Reader ---
export function listSurahs(): Promise<SurahMeta[]> {
  return request<SurahMeta[]>('/quran/surahs');
}

export function getSurah(number: number): Promise<SurahDetail> {
  return request<SurahDetail>(`/quran/surahs/${number}`);
}

// --- Hadith Library ---
export function listHadithCollections(): Promise<HadithCollectionMeta[]> {
  return request<HadithCollectionMeta[]>('/hadith/collections');
}

export function listHadithBooks(collection: string): Promise<HadithBookMeta[]> {
  return request<HadithBookMeta[]>(`/hadith/collections/${collection}/books`);
}

export function listHadithsInBook(
  collection: string,
  bookNumber: string,
): Promise<HadithDetail[]> {
  return request<HadithDetail[]>(
    `/hadith/collections/${collection}/books/${bookNumber}/hadiths`,
  );
}

// --- Mosque Finder ---
export function getNearbyMosques(lat: number, lng: number): Promise<Mosque[]> {
  return request<Mosque[]>(`/mosques/nearby?lat=${lat}&lng=${lng}`);
}

// --- Digital Tasbeeh (requires a Firebase Auth ID token) ---
export function logTasbeehSession(
  session: TasbeehSessionInput,
  token: string,
): Promise<TasbeehDay> {
  return request<TasbeehDay>(
    '/tasbeeh/sessions',
    { method: 'POST', body: JSON.stringify(session) },
    token,
  );
}

export function getTasbeehProgress(
  token: string,
  goal?: number,
): Promise<TasbeehProgress> {
  const qs = goal ? `?goal=${goal}` : '';
  return request<TasbeehProgress>(`/tasbeeh/progress${qs}`, undefined, token);
}

export function getTasbeehHistory(token: string): Promise<TasbeehDay[]> {
  return request<TasbeehDay[]>('/tasbeeh/history', undefined, token);
}

// --- Admin Dashboard (requires a Firebase Auth token with the 'admin' custom claim) ---
export function getAyahRecord(docId: string, token: string): Promise<Record<string, unknown>> {
  return request<Record<string, unknown>>(`/admin/quran/${docId}`, undefined, token);
}

export function updateAyahRecord(
  docId: string,
  data: Record<string, unknown>,
  token: string,
): Promise<{ status: string; doc_id: string }> {
  return request(`/admin/quran/${docId}`, { method: 'PUT', body: JSON.stringify(data) }, token);
}

export function getHadithRecord(docId: string, token: string): Promise<Record<string, unknown>> {
  return request<Record<string, unknown>>(`/admin/hadith/${docId}`, undefined, token);
}

export function updateHadithRecord(
  docId: string,
  data: Record<string, unknown>,
  token: string,
): Promise<{ status: string; doc_id: string }> {
  return request(`/admin/hadith/${docId}`, { method: 'PUT', body: JSON.stringify(data) }, token);
}

export function getChatLogs(token: string, limit = 50): Promise<ChatLogEntry[]> {
  return request<ChatLogEntry[]>(`/admin/chat-logs?limit=${limit}`, undefined, token);
}
