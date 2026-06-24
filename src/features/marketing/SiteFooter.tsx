import { useTranslations } from 'next-intl';
import Link from 'next/link';

// Единый футер для всех публичных страниц.
export function SiteFooter() {
  const t = useTranslations('Footer');
  const tn = useTranslations('Nav');

  return (
    <footer className="border-t">
      <div className="
        mx-auto flex max-w-5xl flex-col gap-3 px-4 py-6 text-sm
        text-muted-foreground
        sm:flex-row sm:items-center sm:justify-between
      "
      >
        <span>{t('rights')}</span>
        <nav className="flex flex-wrap gap-4">
          <Link href="/about" className="hover:text-foreground">{tn('about')}</Link>
          <Link href="/privacy" className="hover:text-foreground">{t('privacy')}</Link>
          <Link href="/cookies" className="hover:text-foreground">{t('cookies')}</Link>
          <Link href="/disclaimer" className="hover:text-foreground">{t('disclaimer')}</Link>
        </nav>
      </div>
    </footer>
  );
}
