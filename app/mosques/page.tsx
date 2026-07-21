export default function MosqueFinderPage() {
  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-teal">Mosque Finder</h1>
      <p className="mb-6 text-sm text-inkMuted">
        Find mosques near your current location.
      </p>

      <div className="flex flex-col items-center rounded-2xl border border-dashed border-gold bg-surfaceMuted px-8 py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-goldMuted text-2xl">
          🕌
        </div>
        <h2 className="mb-2 text-lg font-bold text-teal">Coming Soon</h2>
        <p className="max-w-sm text-sm text-inkMuted">
          Mosque search is on the way — it needs a mapping service to be
          configured on the backend first. Check back soon.
        </p>
      </div>
    </div>
  );
}
