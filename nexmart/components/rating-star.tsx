import { Star } from "lucide-react";

type PartialStarProps = {
  fillRatio: number;
  size: number;
};

function PartialStar({ fillRatio, size }: PartialStarProps) {
  const pct = Math.max(0, Math.min(1, fillRatio));

  return (
    <span
      className="relative inline-block shrink-0"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <Star
        size={size}
        className="absolute left-0 top-0 text-slate-200"
        fill="currentColor"
        strokeWidth={0}
      />
      <div
        className="absolute inset-y-0 left-0 overflow-hidden"
        style={{ width: `${pct * 100}%` }}
      >
        <Star
          size={size}
          className="absolute left-0 top-0 text-orange-500"
          fill="currentColor"
          strokeWidth={0}
        />
      </div>
    </span>
  );
}

type RatingStarsProps = {
  rating: number;
  size?: number;
  className?: string;
};

export function RatingStars({
  rating,
  size = 16,
  className = "",
}: RatingStarsProps) {
  const clamped = Math.max(0, Math.min(5, rating));

  return (
    <span
      className={`inline-flex items-center gap-0.5 ${className}`}
      role="img"
      aria-label={`${clamped} out of 5 stars`}
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <PartialStar
          key={i}
          size={size}
          fillRatio={Math.min(1, Math.max(0, clamped - i))}
        />
      ))}
    </span>
  );
}
