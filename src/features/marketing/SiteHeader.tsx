import Link from 'next/link';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { BrandLogo } from './BrandLogo';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/about', label: 'About' },
  { href: '/apps', label: 'Browse' },
  { href: '/toplist', label: 'Toplist' },
  { href: '/faq', label: 'FAQ' },
];

// Единый хедер для всех публичных страниц (i18n-переключатель включён).
export function SiteHeader() {
  return (
    <header className="
      sticky top-0 z-40 border-b bg-background/80 backdrop-blur-sm
    "
    >
      <div className="
        mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 p-4
      "
      >
        <BrandLogo />
        <nav className="flex flex-wrap items-center gap-4 text-sm">
          {LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className="
                text-muted-foreground
                hover:text-primary
              "
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/sign-in"
            className="
              font-medium
              hover:text-primary
            "
          >
            Sign in
          </Link>
          <LocaleSwitcher />
        </nav>
      </div>
    </header>
  );
}
