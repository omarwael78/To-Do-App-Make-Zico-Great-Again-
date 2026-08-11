import { useMemo } from 'react';

const COLORS = ['#8b5cf6', '#f472b6', '#fbbf24', '#34d399', '#60a5fa', '#fb7185'];

/** A one-shot confetti rain shown when every task is completed. */
export default function CelebrationConfetti() {
  const particles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.7,
        duration: 2.8 + Math.random() * 1.8,
        color: COLORS[i % COLORS.length],
        width: 5 + Math.random() * 5,
        height: 7 + Math.random() * 6,
      })),
    []
  );

  return (
    <div
      className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
      aria-hidden="true"
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className="animate-confetti-fall absolute -top-4"
          style={{
            left: `${p.left}%`,
            width: p.width,
            height: p.height,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
