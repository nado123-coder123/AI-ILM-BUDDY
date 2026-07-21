'use client';

import { useEffect, useState } from 'react';
import { ApiError, getHijriDate, getRamadanCountdown } from '@/lib/api';
import { HijriDateResponse, RamadanCountdown } from '@/lib/types';

export default function CalendarPage() {
  const [hijri, setHijri] = useState<HijriDateResponse | null>(null);
  const [countdown, setCountdown] = useState<RamadanCountdown | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getHijriDate(), getRamadanCountdown()])
      .then(([hijriRes, countdownRes]) => {
        setHijri(hijriRes);
        setCountdown(countdownRes);
      })
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : 'Could not load calendar data.'),
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 text-2xl font-bold text-teal">Islamic Calendar</h1>

      {loading && <p className="text-sm text-inkMuted">Loading…</p>}
      {error && <p className="text-sm text-error">{error}</p>}

      {hijri && (
        <div className="mb-6 rounded-xl border border-border bg-surface p-6 text-center shadow-sm">
          <p className="mb-1 text-xs uppercase tracking-wide text-inkMuted">Today</p>
          <p className="mb-1 text-2xl font-bold text-teal">{hijri.hijri_date}</p>
          <p className="text-sm text-inkMuted">{hijri.gregorian_date} (Gregorian)</p>
        </div>
      )}

      {countdown && (
        <div className="rounded-xl border border-gold bg-surface p-6 text-center shadow-sm">
          {countdown.is_ramadan_now ? (
            <>
              <p className="mb-1 text-xs uppercase tracking-wide text-inkMuted">
                Ramadan Mubarak
              </p>
              <p className="text-xl font-bold text-teal">Ramadan {countdown.hijri_year} is here</p>
            </>
          ) : (
            <>
              <p className="mb-1 text-xs uppercase tracking-wide text-inkMuted">
                Countdown to Ramadan {countdown.hijri_year}
              </p>
              <p className="mb-1 text-3xl font-bold text-teal">
                {countdown.days_remaining} day{countdown.days_remaining === 1 ? '' : 's'}
              </p>
              <p className="text-sm text-inkMuted">
                Starts around {countdown.ramadan_start_gregorian}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
