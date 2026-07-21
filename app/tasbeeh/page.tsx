'use client';

// Skip static prerendering — this page depends on Firebase Auth
// initializing client-side, which isn't meaningful (and isn't
// configured) at build time.
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { ApiError, getTasbeehProgress, logTasbeehSession } from '@/lib/api';
import { getIdToken, useAuth } from '@/lib/useAuth';
import { TasbeehProgress } from '@/lib/types';

const DEFAULT_GOAL = 100;
const COMMON_DHIKR = ['SubhanAllah', 'Alhamdulillah', 'Allahu Akbar', 'La ilaha illallah'];

export default function TasbeehPage() {
  const { user, loading: authLoading, error: authError } = useAuth();
  const [dhikr, setDhikr] = useState(COMMON_DHIKR[0]);
  const [count, setCount] = useState(0);
  const [goal, setGoal] = useState(DEFAULT_GOAL);
  const [progress, setProgress] = useState<TasbeehProgress | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    refreshProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, goal]);

  function refreshProgress() {
    getIdToken()
      .then((token) => {
        if (!token) return;
        return getTasbeehProgress(token, goal);
      })
      .then((data) => data && setProgress(data))
      .catch(() => {
        /* non-fatal — progress panel just won't update */
      });
  }

  function increment() {
    setCount((c) => c + 1);
  }

  function reset() {
    setCount(0);
  }

  async function saveSession() {
    if (count === 0) return;
    setSaving(true);
    setError(null);
    try {
      const token = await getIdToken();
      if (!token) throw new Error('Not signed in yet — try again in a moment.');
      await logTasbeehSession({ dhikr, count }, token);
      setCount(0);
      refreshProgress();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save your session.');
    } finally {
      setSaving(false);
    }
  }

  if (authLoading) {
    return <p className="text-sm text-inkMuted">Setting things up…</p>;
  }

  if (authError) {
    return <p className="text-sm text-error">Sign-in failed: {authError}</p>;
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-teal">Digital Tasbeeh</h1>
      <p className="mb-6 text-sm text-inkMuted">
        Count your dhikr. Progress saves automatically to this device.
      </p>

      <div className="mb-6 flex flex-wrap gap-2">
        {COMMON_DHIKR.map((d) => (
          <button
            key={d}
            onClick={() => setDhikr(d)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              dhikr === d ? 'bg-teal text-surface' : 'bg-surfaceMuted text-inkMuted'
            }`}
          >
            {d}
          </button>
        ))}
        <input
          value={dhikr}
          onChange={(e) => setDhikr(e.target.value)}
          placeholder="Custom dhikr…"
          className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs"
        />
      </div>

      <div className="flex flex-col items-center rounded-2xl border border-border bg-surface p-10">
        <button
          onClick={increment}
          className="flex h-40 w-40 flex-col items-center justify-center rounded-full bg-teal text-surface shadow-lg transition-transform active:scale-95"
        >
          <span className="text-4xl font-bold">{count}</span>
          <span className="mt-1 text-xs opacity-80">tap to count</span>
        </button>

        <div className="mt-6 flex gap-3">
          <button
            onClick={reset}
            className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-inkMuted"
          >
            Reset
          </button>
          <button
            onClick={saveSession}
            disabled={count === 0 || saving}
            className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-ink disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save session'}
          </button>
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-error">{error}</p>}

      <div className="mt-6">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-inkMuted">
          Daily goal
        </label>
        <input
          type="number"
          min={1}
          value={goal}
          onChange={(e) => setGoal(Number(e.target.value) || DEFAULT_GOAL)}
          className="w-32 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm"
        />
      </div>

      {progress && (
        <div className="mt-4 rounded-xl border border-border bg-surfaceMuted p-4">
          <p className="text-sm font-semibold text-ink">
            Today: {progress.total_count} / {progress.goal ?? '—'}{' '}
            {progress.goal_met && <span className="text-success">✓ Goal met</span>}
          </p>
          <div className="mt-2 space-y-1">
            {progress.sessions.map((s, idx) => (
              <p key={idx} className="text-xs text-inkMuted">
                {s.dhikr}: {s.count}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
