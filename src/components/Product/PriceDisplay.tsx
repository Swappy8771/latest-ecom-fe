interface Props {
  price:          number;
  compareAtPrice?: number;
  size?:          'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: { price: 'text-base font-semibold', compare: 'text-sm', badge: 'text-xs' },
  md: { price: 'text-lg font-bold',       compare: 'text-sm', badge: 'text-xs' },
  lg: { price: 'text-2xl font-bold',      compare: 'text-base', badge: 'text-sm' },
};

export default function PriceDisplay({ price, compareAtPrice, size = 'md' }: Props) {
  const s = sizeMap[size];
  const discount =
    compareAtPrice && compareAtPrice > price
      ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
      : null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className={`${s.price} text-zinc-900`}>₹{price.toLocaleString('en-IN')}</span>
      {compareAtPrice && compareAtPrice > price && (
        <span className={`${s.compare} text-zinc-400 line-through`}>
          ₹{compareAtPrice.toLocaleString('en-IN')}
        </span>
      )}
      {discount && (
        <span className={`${s.badge} bg-green-100 text-green-700 font-medium px-1.5 py-0.5 rounded`}>
          {discount}% off
        </span>
      )}
    </div>
  );
}
