import Link from 'next/link';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/apps', label: 'Browse' },
  { href: '/toplist', label: 'Toplist' },
  { href: '/faq', label: 'FAQ' },
];

// Единый хедер для всех публичных страниц (i18n-переключатель включён).
export function SiteHeader() {
  return (
    <header className="border-b">
      <div className="
        mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 p-4
      "
      >
        <Link href="/" className="font-semibold">Mystery Customer Insight</Link>
        <nav className="flex flex-wrap items-center gap-4 text-sm">
          {LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className="
                opacity-80
                hover:opacity-100
              "
            >
              {l.label}
            </Link>
          ))}
          <Link href="/sign-in" className="font-medium">Sign in</Link>
          <LocaleSwitcher />
        </nav>
      </div>
    </header>
  );
}
