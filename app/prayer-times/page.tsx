'use client';

import { useState } from 'react';
import { ApiError, getPrayerTimes, getQibla } from '@/lib/api';
import { PrayerTimings, QiblaResponse } from '@/lib/types';

const PRAYER_ROWS: { key: keyof PrayerTimings; label: string }[] = [
  { key: 'fajr', label: 'Fajr' },
  { key: 'sunrise', label: 'Sunrise' },
  { key: 'dhuhr', label: 'Dhuhr' },
  { key: 'asr', label: 'Asr' },
  { key: 'maghrib', label: 'Maghrib' },
  { key: 'isha', label: 'Isha' },
];

export default function PrayerTimesPage() {
  const [timings, setTimings] = useState<PrayerTimings | null>(null);
  const [qibla, setQibla] = useState<QiblaResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleLocate() {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }
    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const [timingsRes, qiblaRes] = await Promise.all([
            getPrayerTimes(latitude, longitude),
            getQibla(latitude, longitude),
          ]);
          setTimings(timingsRes);
          setQibla(qiblaRes);
        } catch (err) {
          setError(err instanceof ApiError ? err.message : 'Could not fetch prayer data.');
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError('Location permission denied. Please allow location access and try again.');
        setLoading(false);
      },
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-1 text-2xl font-bold text-teal">Prayer Times & Qibla</h1>
      <p className="mb-6 text-sm text-inkMuted">
        Uses your browser location to fetch today&apos;s prayer timings and the
        direction to the Kaaba.
      </p>

      <button
        onClick={handleLocate}
        disabled={loading}
        className="mb-6 rounded-lg bg-teal px-4 py-2.5 text-sm font-semibold text-surface disabled:opacity-60"
      >
        {loading ? 'Locating…' : 'Use my location'}
      </button>

      {error && <p className="mb-4 text-sm text-error">{error}</p>}

      {timings && (
        <div className="mb-6 rounded-xl border border-border bg-surface p-6 shadow-sm">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-semibold text-teal">Today&apos;s Prayer Times</h2>
            <span className="text-xs text-inkMuted">{timings.date_hijri}</span>
          </div>
          <dl className="space-y-2">
            {PRAYER_ROWS.map(({ key, label }) => {
              const value = timings[key];
              if (!value) return null;
              return (
                <div key={key} className="flex justify-between border-b border-border pb-2 text-sm last:border-0">
                  <dt className="text-inkMuted">{label}</dt>
                  <dd className="font-medium text-ink">{value}</dd>
                </div>
              );
            })}
          </dl>
        </div>
      )}

      {qibla && (
        <div className="rounded-xl border border-gold bg-surface p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-teal">Qibla Direction</h2>
          <div className="flex items-center gap-6">
            <div
              className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full border-2 border-teal"
              style={{ transform: `rotate(${qibla.direction_degrees}deg)` }}
            >
              <div className="h-10 w-1 rounded-full bg-gold" />
            </div>
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-inkMuted">Bearing</dt>
                <dd className="font-medium">{qibla.direction_degrees}° from North</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-inkMuted">Distance to Kaaba</dt>
                <dd className="font-medium">{qibla.distance_km.toLocaleString()} km</dd>
              </div>
            </dl>
          </div>
          <p className="mt-4 text-xs italic text-inkMuted">
            Point the gold marker in this direction relative to true north (not your
            phone&apos;s current heading — this page shows a fixed bearing, not a live
            compass).
          </p>
        </div>
      )}
    </div>
  );
}
