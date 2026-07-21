/**
 * Signature element carried over from the mobile design: a thin gold
 * line with a rotated square at center, used once per assistant answer
 * between the answer text and its cited sources.
 */
export function SectionDivider() {
  return (
    <div className="my-3 flex items-center">
      <div className="h-px flex-1 bg-gold/50" />
      <div className="mx-2 h-[7px] w-[7px] rotate-45 bg-gold" />
      <div className="h-px flex-1 bg-gold/50" />
    </div>
  );
}
