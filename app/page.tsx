import Link from 'next/link';

const FEATURES = [
  {
    href: '/chat',
    title: 'Ask a Question',
    description: 'Get answers grounded in verified Quran & Hadith sources, with citations.',
  },
  {
    href: '/prayer-times',
    title: 'Prayer Times & Qibla',
    description: 'Daily prayer timings for your location and the direction to the Kaaba.',
  },
  {
    href: '/calendar',
    title: 'Islamic Calendar',
    description: "Today's Hijri date and a countdown to Ramadan.",
  },
  {
    href: '/zakat',
    title: 'Zakat Calculator',
    description: 'Calculate your Zakat across gold, silver, cash, and business assets.',
  },
  {
    href: '/duas',
    title: 'Dua Library',
    description: 'Browse well-known duas for daily moments, with Arabic and translation.',
  },
];

export default function HomePage() {
  return (
    <div>
      <section className="mb-10 text-center">
        <h1 className="mb-2 text-3xl font-bold text-teal">ILM Buddy</h1>
        <p className="mx-auto max-w-xl text-inkMuted">
          A trusted Islamic knowledge and worship companion — answers grounded in
          verified Quran and Hadith sources, plus everyday tools for prayer and
          worship.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {FEATURES.map((feature) => (
          <Link
            key={feature.href}
            href={feature.href}
            className="rounded-xl border border-border bg-surface p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <h2 className="mb-1.5 font-semibold text-teal">{feature.title}</h2>
            <p className="text-sm text-inkMuted">{feature.description}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
