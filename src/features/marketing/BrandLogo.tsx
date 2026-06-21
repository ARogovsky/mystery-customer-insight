import Image from 'next/image';
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
      <Image
        src="/logo.svg"
        alt=""
        width={28}
        height={28}
        unoptimized
        className="size-7 shrink-0"
      />
      Mystery Customer Insight
    </Link>
  );
}
