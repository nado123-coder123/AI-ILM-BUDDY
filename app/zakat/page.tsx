'use client';

import { FormEvent, useState } from 'react';
import { ApiError, calculateZakat } from '@/lib/api';
import { ZakatResponse } from '@/lib/types';

const FIELDS: { key: keyof typeof INITIAL; label: string }[] = [
  { key: 'gold_grams', label: 'Gold (grams)' },
  { key: 'silver_grams', label: 'Silver (grams)' },
  { key: 'gold_price_per_gram', label: 'Gold price (per gram)' },
  { key: 'silver_price_per_gram', label: 'Silver price (per gram)' },
  { key: 'cash', label: 'Cash on hand' },
  { key: 'savings', label: 'Savings' },
  { key: 'business_assets', label: 'Business assets' },
  { key: 'debts_due', label: 'Short-term debts owed' },
];

const INITIAL = {
  gold_grams: 0,
  silver_grams: 0,
  gold_price_per_gram: 0,
  silver_price_per_gram: 0,
  cash: 0,
  savings: 0,
  business_assets: 0,
  debts_due: 0,
};

export default function ZakatPage() {
  const [values, setValues] = useState(INITIAL);
  const [nisabBasis, setNisabBasis] = useState<'gold' | 'silver'>('silver');
  const [result, setResult] = useState<ZakatResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await calculateZakat({ ...values, nisab_basis: nisabBasis });
      setResult(response);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not calculate Zakat.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-2xl font-bold text-teal">Zakat Calculator</h1>
      <p className="mb-6 text-sm text-inkMuted">
        Estimate your Zakat obligation. Enter current gold/silver prices for an
        accurate Nisab threshold.
      </p>

      <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <div className="grid grid-cols-2 gap-4">
          {FIELDS.map((field) => (
            <label key={field.key} className="block">
              <span className="mb-1 block text-xs font-medium text-inkMuted">{field.label}</span>
              <input
                type="number"
                min={0}
                step="any"
                value={values[field.key]}
                onChange={(e) =>
                  setValues((v) => ({ ...v, [field.key]: Number(e.target.value) }))
                }
                className="w-full rounded-lg border border-border bg-surfaceMuted px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal/30"
              />
            </label>
          ))}
        </div>

        <div className="mt-4">
          <span className="mb-1 block text-xs font-medium text-inkMuted">Nisab basis</span>
          <div className="flex gap-2">
            {(['silver', 'gold'] as const).map((basis) => (
              <button
                key={basis}
                type="button"
                onClick={() => setNisabBasis(basis)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
                  nisabBasis === basis
                    ? 'bg-teal text-surface'
                    : 'bg-surfaceMuted text-inkMuted'
                }`}
              >
                {basis}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full rounded-lg bg-teal py-2.5 text-sm font-semibold text-surface disabled:opacity-60"
        >
          {loading ? 'Calculating…' : 'Calculate Zakat'}
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-error">{error}</p>}

      {result && (
        <div className="mt-6 rounded-xl border border-gold bg-surface p-6 shadow-sm">
          <div className="mb-4 flex items-baseline justify-between">
            <span className="text-sm text-inkMuted">Zakat due</span>
            <span className="text-3xl font-bold text-teal">{result.zakat_due.toLocaleString()}</span>
          </div>

          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-inkMuted">Total zakatable wealth</dt>
              <dd className="font-medium">{result.total_zakatable_wealth.toLocaleString()}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-inkMuted">Nisab threshold ({result.nisab_basis})</dt>
              <dd className="font-medium">{result.nisab_threshold.toLocaleString()}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-inkMuted">Meets Nisab</dt>
              <dd className={`font-medium ${result.meets_nisab ? 'text-success' : 'text-error'}`}>
                {result.meets_nisab ? 'Yes' : 'No'}
              </dd>
            </div>
          </dl>

          <p className="mt-4 text-xs italic leading-relaxed text-inkMuted">{result.note}</p>
        </div>
      )}
    </div>
  );
}
