import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { BrandLogo } from './BrandLogo';

const LINKS = [
  { href: '/', key: 'home' },
  { href: '/how-it-works', key: 'how_it_works' },
  { href: '/about', key: 'about' },
  { href: '/apps', key: 'browse' },
  { href: '/toplist', key: 'toplist' },
  { href: '/faq', key: 'faq' },
] as const;

// Единый хедер для всех публичных страниц (i18n-переключатель включён).
export function SiteHeader() {
  const t = useTranslations('Nav');

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
              {t(l.key)}
            </Link>
          ))}
          <Link
            href="/sign-in"
            className="
              font-medium
              hover:text-primary
            "
          >
            {t('sign_in')}
          </Link>
          <LocaleSwitcher />
        </nav>
      </div>
    </header>
  );
}
