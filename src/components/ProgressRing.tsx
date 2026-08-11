interface ProgressRingProps {
  percent: number;
  size?: number;
  stroke?: number;
  /** Renders the percentage in the middle when true. */
  showLabel?: boolean;
  labelClassName?: string;
}

/** Colour shifts from rose → violet → emerald as completion rises. */
export function ringColor(percent: number): string {
  if (percent >= 100) return '#10b981';
  if (percent >= 60) return '#8b5cf6';
  if (percent >= 25) return '#6366f1';
  return '#f43f5e';
}

export default function ProgressRing({
  percent,
  size = 48,
  stroke = 4,
  showLabel = true,
  labelClassName = 'text-[11px]',
}: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, percent));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-slate-200 dark:stroke-slate-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          stroke={ringColor(clamped)}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16,1,0.3,1), stroke 0.4s ease' }}
        />
      </svg>
      {showLabel && (
        <span
          className={`absolute inset-0 flex items-center justify-center font-extrabold text-slate-600 dark:text-slate-200 ${labelClassName}`}
        >
          {clamped}%
        </span>
      )}
    </div>
  );
}
