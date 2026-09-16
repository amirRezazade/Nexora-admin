import { cn, productArt } from '@/lib/format';

const sizes = {
  xs: 'h-7 w-7 rounded-[6px] text-[9px]',
  sm: 'h-9 w-9 rounded-control text-[10px]',
  md: 'h-11 w-11 rounded-control text-[11px]',
  lg: 'h-16 w-16 rounded-card text-caption',
  xl: 'h-full w-full rounded-card-lg text-h1',
  fill: 'aspect-square w-full rounded-card text-caption',
};

/**
 * Catalog imagery stand-in. Deterministic per SKU so a product looks the same
 * everywhere, with a real alt text describing the product.
 */
export default function ProductThumb({ name = '', seed, src, size = 'md', className }) {
  const [from, to] = productArt(seed || name);
  const label = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <span
      role="img"
      aria-label={`${name} product image`}
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden border border-line font-bold text-black/35',
        sizes[size],
        className
      )}
      style={src ? undefined : { backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        label
      )}
    </span>
  );
}
