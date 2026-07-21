'use client';

import { useEffect, useState } from 'react';
import { ApiError, getSurah, listSurahs } from '@/lib/api';
import { SurahDetail, SurahMeta } from '@/lib/types';

export default function QuranReaderPage() {
  const [surahs, setSurahs] = useState<SurahMeta[]>([]);
  const [activeSurah, setActiveSurah] = useState<SurahDetail | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingSurah, setLoadingSurah] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listSurahs()
      .then(setSurahs)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : 'Could not load surah list.'),
      )
      .finally(() => setLoadingList(false));
  }, []);

  function openSurah(number: number) {
    setLoadingSurah(true);
    setError(null);
    setActiveSurah(null);
    getSurah(number)
      .then(setActiveSurah)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : 'Could not load this surah.'),
      )
      .finally(() => setLoadingSurah(false));
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-teal">Quran Reader</h1>
      <p className="mb-6 text-sm text-inkMuted">
        Browse all 114 surahs — Arabic text with English translation.
      </p>

      {error && <p className="mb-4 text-sm text-error">{error}</p>}

      {activeSurah ? (
        <div>
          <button
            onClick={() => setActiveSurah(null)}
            className="mb-4 text-sm font-semibold text-teal hover:underline"
          >
            ← Back to surah list
          </button>

          <div className="mb-6 rounded-xl border border-border bg-surface p-5">
            <h2 className="text-xl font-bold text-teal">
              {activeSurah.meta.number}. {activeSurah.meta.name_english}
            </h2>
            <p className="text-sm text-inkMuted">
              {activeSurah.meta.name_translation} · {activeSurah.meta.revelation_type} ·{' '}
              {activeSurah.meta.total_ayahs} ayahs
            </p>
          </div>

          <div className="space-y-4">
            {activeSurah.ayahs.map((ayah) => (
              <div
                key={ayah.number_in_surah}
                className="rounded-xl border border-border bg-surface p-4"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-goldMuted text-xs font-semibold text-ink">
                    {ayah.number_in_surah}
                  </span>
                </div>
                <p
                  dir="rtl"
                  className="mb-3 text-right text-xl leading-loose text-ink"
                >
                  {ayah.arabic_text}
                </p>
                <p className="text-sm leading-relaxed text-inkMuted">{ayah.translation}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {loadingList && <p className="text-sm text-inkMuted">Loading surah list…</p>}
          {loadingSurah && <p className="text-sm text-inkMuted">Loading surah…</p>}

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {surahs.map((surah) => (
              <button
                key={surah.number}
                onClick={() => openSurah(surah.number)}
                className="flex items-center justify-between rounded-xl border border-border bg-surface p-4 text-left transition-colors hover:border-gold"
              >
                <div>
                  <p className="font-semibold text-ink">
                    {surah.number}. {surah.name_english}
                  </p>
                  <p className="text-xs text-inkMuted">
                    {surah.name_translation} · {surah.total_ayahs} ayahs
                  </p>
                </div>
                <span dir="rtl" className="text-lg text-teal">
                  {surah.name_arabic}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
