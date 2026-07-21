import { Dua } from '@/lib/types';

export function DuaCard({ dua }: { dua: Dua }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-teal">{dua.title}</h3>
        <span className="rounded-full bg-surfaceMuted px-2.5 py-1 text-xs font-medium text-inkMuted">
          {dua.category}
        </span>
      </div>

      <p className="mb-3 text-right font-arabic text-2xl leading-loose text-ink" dir="rtl">
        {dua.arabic_text}
      </p>

      <p className="mb-1 text-sm italic text-inkMuted">{dua.transliteration}</p>
      <p className="mb-3 text-sm leading-relaxed text-ink">{dua.translation}</p>

      <p className="text-xs font-medium text-gold">{dua.reference}</p>
    </div>
  );
}
