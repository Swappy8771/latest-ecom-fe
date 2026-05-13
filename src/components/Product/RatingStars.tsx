interface Props {
  avg:   number;
  count: number;
  size?: 'sm' | 'md';
}

export default function RatingStars({ avg, count, size = 'md' }: Props) {
  const filled = Math.round(avg);
  const starSize = size === 'sm' ? 'text-sm' : 'text-base';

  return (
    <div className="flex items-center gap-1">
      <div className={`flex ${starSize}`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={i < filled ? 'text-amber-400' : 'text-zinc-300'}>
            ★
          </span>
        ))}
      </div>
      <span className={`text-zinc-500 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
        {avg.toFixed(1)} ({count})
      </span>
    </div>
  );
}
