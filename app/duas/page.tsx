'use client';

import { useEffect, useState } from 'react';
import { ApiError, listDuaCategories, listDuas } from '@/lib/api';
import { Dua } from '@/lib/types';
import { DuaCard } from '@/components/DuaCard';

export default function DuasPage() {
  const [duas, setDuas] = useState<Dua[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listDuaCategories()
      .then(setCategories)
      .catch(() => {
        /* non-fatal — category filter just won't show */
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    listDuas(activeCategory ?? undefined)
      .then(setDuas)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : 'Could not load duas.'),
      )
      .finally(() => setLoading(false));
  }, [activeCategory]);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-teal">Dua Library</h1>
      <p className="mb-6 text-sm text-inkMuted">
        A small curated set of well-known duas for daily moments.
      </p>

      {categories.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
              activeCategory === null ? 'bg-teal text-surface' : 'bg-surfaceMuted text-inkMuted'
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
                activeCategory === category
                  ? 'bg-teal text-surface'
                  : 'bg-surfaceMuted text-inkMuted'
              }`}
            >
              {category.replace('_', ' ')}
            </button>
          ))}
        </div>
      )}

      {loading && <p className="text-sm text-inkMuted">Loading…</p>}
      {error && <p className="text-sm text-error">{error}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {duas.map((dua) => (
          <DuaCard key={dua.id} dua={dua} />
        ))}
      </div>
    </div>
  );
}
