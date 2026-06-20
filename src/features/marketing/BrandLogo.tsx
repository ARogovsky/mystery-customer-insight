import Link from 'next/link';

// Единый логотип для всех страниц (маркетинг + дашборд). Клик — всегда на главную.
export function BrandLogo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`
        flex items-center gap-2 font-semibold
        ${className ?? ''}
      `}
    >
      <span
        aria-hidden
        className="
          relative size-7 shrink-0 overflow-hidden rounded-lg bg-foreground
        "
      >
        <span
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 70% 25%, #FFB020 0 18%, transparent 42%)',
          }}
        />
      </span>
      Mystery Customer Insight
    </Link>
  );
}
