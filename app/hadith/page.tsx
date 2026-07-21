'use client';

import { useEffect, useState } from 'react';
import {
  ApiError,
  listHadithBooks,
  listHadithCollections,
  listHadithsInBook,
} from '@/lib/api';
import { HadithBookMeta, HadithCollectionMeta, HadithDetail } from '@/lib/types';

type View =
  | { level: 'collections' }
  | { level: 'books'; collection: HadithCollectionMeta }
  | { level: 'hadiths'; collection: HadithCollectionMeta; book: HadithBookMeta };

export default function HadithLibraryPage() {
  const [collections, setCollections] = useState<HadithCollectionMeta[]>([]);
  const [books, setBooks] = useState<HadithBookMeta[]>([]);
  const [hadiths, setHadiths] = useState<HadithDetail[]>([]);
  const [view, setView] = useState<View>({ level: 'collections' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listHadithCollections()
      .then(setCollections)
      .catch((err) =>
        setError(
          err instanceof ApiError
            ? err.message
            : 'Could not load Hadith collections.',
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  function openCollection(collection: HadithCollectionMeta) {
    setLoading(true);
    setError(null);
    setBooks([]);
    listHadithBooks(collection.name)
      .then((data) => {
        setBooks(data);
        setView({ level: 'books', collection });
      })
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : 'Could not load books.'),
      )
      .finally(() => setLoading(false));
  }

  function openBook(collection: HadithCollectionMeta, book: HadithBookMeta) {
    setLoading(true);
    setError(null);
    setHadiths([]);
    listHadithsInBook(collection.name, book.book_number)
      .then((data) => {
        setHadiths(data);
        setView({ level: 'hadiths', collection, book });
      })
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : 'Could not load hadiths.'),
      )
      .finally(() => setLoading(false));
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-teal">Hadith Library</h1>
      <p className="mb-6 text-sm text-inkMuted">
        Browse major collections, book by book.
      </p>

      {view.level !== 'collections' && (
        <button
          onClick={() =>
            view.level === 'hadiths'
              ? setView({ level: 'books', collection: view.collection })
              : setView({ level: 'collections' })
          }
          className="mb-4 text-sm font-semibold text-teal hover:underline"
        >
          ← Back
        </button>
      )}

      {error && <p className="mb-4 text-sm text-error">{error}</p>}
      {loading && <p className="text-sm text-inkMuted">Loading…</p>}

      {!loading && view.level === 'collections' && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {collections.map((c) => (
            <button
              key={c.name}
              onClick={() => openCollection(c)}
              className="rounded-xl border border-border bg-surface p-4 text-left transition-colors hover:border-gold"
            >
              <p className="font-semibold text-ink">{c.title}</p>
              {c.total_hadiths != null && (
                <p className="text-xs text-inkMuted">{c.total_hadiths} hadiths</p>
              )}
            </button>
          ))}
        </div>
      )}

      {!loading && view.level === 'books' && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {books.map((b) => (
            <button
              key={b.book_number}
              onClick={() => openBook(view.collection, b)}
              className="rounded-xl border border-border bg-surface p-4 text-left transition-colors hover:border-gold"
            >
              <p className="font-semibold text-ink">{b.name}</p>
              {b.number_of_hadiths != null && (
                <p className="text-xs text-inkMuted">{b.number_of_hadiths} hadiths</p>
              )}
            </button>
          ))}
        </div>
      )}

      {!loading && view.level === 'hadiths' && (
        <div className="space-y-4">
          {hadiths.map((h) => (
            <div
              key={h.hadith_number}
              className="rounded-xl border border-border bg-surface p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-teal">
                  {h.collection} #{h.hadith_number}
                </span>
                {h.authenticity && (
                  <span className="rounded bg-goldMuted px-2 py-0.5 text-xs font-medium text-ink">
                    {h.authenticity}
                  </span>
                )}
              </div>
              {h.arabic_text && (
                <p dir="rtl" className="mb-2 text-right text-lg leading-loose text-ink">
                  {h.arabic_text}
                </p>
              )}
              <p className="text-sm leading-relaxed text-inkMuted">{h.translation}</p>
              {h.narrator && (
                <p className="mt-2 text-xs text-inkMuted">Narrated by: {h.narrator}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
