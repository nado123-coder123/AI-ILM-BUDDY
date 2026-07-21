import { SourceRef } from '@/lib/types';

export function SourceCard({ source }: { source: SourceRef }) {
  return (
    <div className="mb-2 rounded-lg border-l-[3px] border-gold bg-surfaceMuted p-3">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-teal">
          {source.reference}
        </span>
        {source.authenticity && (
          <span className="rounded bg-gold-muted px-1.5 py-0.5 text-[10px] font-medium text-ink">
            {source.authenticity}
          </span>
        )}
      </div>

      {source.arabic_text && (
        <p className="mb-1.5 text-right font-arabic text-xl leading-loose text-ink" dir="rtl">
          {source.arabic_text}
        </p>
      )}

      <p className="text-sm leading-relaxed text-inkMuted">{source.translation}</p>
    </div>
  );
}
