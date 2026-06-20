import Link from 'next/link';

// Единый футер для всех публичных страниц.
export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="
        mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4
        py-6 text-sm text-muted-foreground
      "
      >
        <span>© Mystery Customer Insight</span>
        <nav className="flex gap-4">
          <Link href="/how-it-works" className="hover:text-foreground">How it works</Link>
          <Link href="/toplist" className="hover:text-foreground">Toplist</Link>
          <Link href="/faq" className="hover:text-foreground">FAQ</Link>
        </nav>
      </div>
    </footer>
  );
}
