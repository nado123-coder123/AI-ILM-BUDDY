'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/chat', label: 'Ask' },
  { href: '/quran', label: 'Quran' },
  { href: '/hadith', label: 'Hadith' },
  { href: '/prayer-times', label: 'Prayer & Qibla' },
  { href: '/calendar', label: 'Calendar' },
  { href: '/zakat', label: 'Zakat' },
  { href: '/tasbeeh', label: 'Tasbeeh' },
  { href: '/duas', label: 'Duas' },
  { href: '/mosques', label: 'Mosques' },
  { href: '/admin', label: 'Admin' },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-teal">
          ILM Buddy
        </Link>
        <nav className="flex flex-wrap gap-1">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-teal text-surface'
                    : 'text-inkMuted hover:bg-surfaceMuted hover:text-ink'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
