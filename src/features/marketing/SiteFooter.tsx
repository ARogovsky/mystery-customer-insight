import Link from 'next/link';

// Единый футер для всех публичных страниц.
export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="
        mx-auto flex max-w-5xl flex-col gap-3 px-4 py-6 text-sm
        text-muted-foreground
        sm:flex-row sm:items-center sm:justify-between
      "
      >
        <span>
          © Mystery Customer Insight · NGO "POGOVORIMO" (EDRPOU 44818137)
        </span>
        <nav className="flex flex-wrap gap-4">
          <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
          <Link href="/cookies" className="hover:text-foreground">Cookies</Link>
          <Link href="/disclaimer" className="hover:text-foreground">Disclaimer</Link>
        </nav>
      </div>
    </footer>
  );
}
