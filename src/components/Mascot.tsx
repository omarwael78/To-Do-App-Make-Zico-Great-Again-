import { useEffect, useState } from 'react';
import { cn } from '@/utils/cn';
import type { Mood, Reaction } from '@/types/task';

interface MascotProps {
  mood: Mood;
  /** 0-3 — how much of today's list is done. Drives excitement. */
  excitement?: number;
  /** Pending tasks today. Drives worry, sweat and tear intensity. */
  missedToday?: number;
  /** True when today's list is non-empty (the character walks the track). */
  walking?: boolean;
  /** One-shot animation to replay (bump `id` to retrigger). */
  reaction?: Reaction;
  /** Consecutive productive days — unlocks gadget tiers every 5 days. */
  streak?: number;
  size?: number;
  className?: string;
}

const SAD = new Set<Mood>(['sad', 'very-sad']);
const HAPPY = new Set<Mood>(['happy', 'very-happy', 'ecstatic']);

/** Wardrobe items Zico unlocks with his streak. */
export const GADGETS = [
  { level: 5, name: 'Black glasses', icon: '🕶️' },
  { level: 10, name: 'Gold chain', icon: '⛓️' },
  { level: 15, name: 'Hero cape', icon: '🦸' },
  { level: 20, name: 'Golden halo', icon: '✨' },
  { level: 25, name: 'Royal crown', icon: '👑' },
] as const;

/**
 * "Zico" — the Make Zico Great Again mascot. A squishy violet blob whose
 * expression and animations react to your day in real time:
 *  - walks a progress track as you complete tasks (jumps on each completion)
 *  - sighs and deflates when a task is un-checked
 *  - grows sparkles, hearts and a crown as excitement rises
 *  - sweats and sheds tears when many tasks are left pending
 *  - unlocks wardrobe gadgets every 5 streak days (glasses, chain, cape,
 *    halo, crown)
 */
export default function Mascot({
  mood,
  excitement = 0,
  missedToday = 0,
  walking = false,
  reaction = { id: 0, type: 'none' },
  streak = 0,
  size = 72,
  className,
}: MascotProps) {
  const [waving, setWaving] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setWaving(true), 250);
    return () => window.clearTimeout(t);
  }, []);

  /* ---------- derived face state ---------- */
  const baseSad = SAD.has(mood);
  // A good day can lift a sad base mood ("hope" rule)
  const faceSad = baseSad && excitement < 2;
  const faceHappy = !faceSad && (HAPPY.has(mood) || excitement >= 2);
  const worried = missedToday > 0 && !faceSad && !faceHappy;
  const sweaty = missedToday >= 3 && !faceSad && !faceHappy;
  const celebrate = reaction.type === 'celebrate';
  const sighing = reaction.type === 'sigh';
  const levelUp = reaction.type === 'levelup';
  const ecstatic = mood === 'ecstatic';

  /* ---------- gadget tiers ---------- */
  const hasGlasses = streak >= 5;
  const hasChain = streak >= 10;
  const hasCape = streak >= 15;
  const hasHalo = streak >= 20;
  const hasGrandCrown = streak >= 25;
  const moodCrown = ecstatic && !hasGrandCrown;

  /* ---------- body animation ---------- */
  let anim = 'animate-mascot-breathe';
  if (celebrate) anim = 'animate-mascot-jump';
  else if (sighing) anim = 'animate-mascot-sigh';
  else if (levelUp) anim = 'animate-mascot-spin';
  else if (faceSad) anim = 'animate-mascot-wiggle';
  else if (walking) anim = excitement >= 2 ? 'animate-mascot-walk-fast' : 'animate-mascot-walk';
  else if (faceHappy) anim = 'animate-mascot-bob';

  /* ---------- face geometry ---------- */
  const eyeSpan = 12 + excitement * 2;
  const eyeY = 46 - excitement * 1.2;
  const eyeR = 4.2 + excitement * 0.35;
  const smileSpan = 22 + excitement * 2;
  const tearsFast = missedToday >= 3 ? '1s' : '1.5s';

  return (
    <div
      className={cn('relative shrink-0', className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Zico feeling ${mood.replace('-', ' ')}`}
    >
      <svg
        key={reaction.id}
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className={anim}
      >
        <defs>
          <linearGradient id="mascot-body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <linearGradient id="mascot-cape" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="100%" stopColor="#b91c1c" />
          </linearGradient>
          <linearGradient id="mascot-gold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>

        {/* Ground shadow */}
        <ellipse cx="50" cy="95" rx="20" ry="3.5" fill="#0f172a" opacity="0.12" />

        {/* Screen-space burst ring on completion */}
        {celebrate && (
          <ellipse
            className="animate-ring-pulse"
            cx="50"
            cy="92"
            rx="14"
            ry="4.5"
            fill="none"
            stroke="#a78bfa"
            strokeWidth="3"
          />
        )}

        {/* Level-up gold burst */}
        {levelUp && (
          <g aria-hidden="true">
            <ellipse
              className="animate-ring-pulse"
              cx="50"
              cy="92"
              rx="14"
              ry="4.5"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="3.5"
            />
            <g transform="translate(18, 18) scale(1.3)">
              <path className="mascot-sparkle" d="M0 -5 L1.4 -1.4 L5 0 L1.4 1.4 L0 5 L-1.4 1.4 L-5 0 L-1.4 -1.4 Z" fill="#fbbf24" />
            </g>
            <g transform="translate(84, 26) scale(1)">
              <path className="mascot-sparkle" d="M0 -5 L1.4 -1.4 L5 0 L1.4 1.4 L0 5 L-1.4 1.4 L-5 0 L-1.4 -1.4 Z" fill="#f472b6" style={{ animationDelay: '0.15s' }} />
            </g>
            <g transform="translate(72, 6) scale(0.9)">
              <path className="mascot-sparkle" d="M0 -5 L1.4 -1.4 L5 0 L1.4 1.4 L0 5 L-1.4 1.4 L-5 0 L-1.4 -1.4 Z" fill="#34d399" style={{ animationDelay: '0.3s' }} />
            </g>
          </g>
        )}

        {/* Sigh puff on un-check */}
        {sighing && <circle className="animate-puff-rise" cx="30" cy="44" r="4.2" fill="#cbd5e1" />}

        {/* Confetti (ecstatic) */}
        {ecstatic && !hasGrandCrown && (
          <g aria-hidden="true">
            <rect x="13" y="2" width="3.5" height="5" rx="1" fill="#f472b6" className="animate-confetti" />
            <rect x="83" y="4" width="3.5" height="5" rx="1" fill="#fbbf24" className="animate-confetti" style={{ animationDelay: '0.5s' }} />
            <rect x="89" y="14" width="3" height="4.5" rx="1" fill="#34d399" className="animate-confetti" style={{ animationDelay: '1s' }} />
            <rect x="8" y="12" width="3" height="4.5" rx="1" fill="#60a5fa" className="animate-confetti" style={{ animationDelay: '1.4s' }} />
            <circle cx="20" cy="8" r="1.8" fill="#fbbf24" className="animate-confetti" style={{ animationDelay: '0.8s' }} />
            <circle cx="80" cy="18" r="1.8" fill="#34d399" className="animate-confetti" style={{ animationDelay: '1.7s' }} />
          </g>
        )}

        {/* Waving arm (waves on load) */}
        {waving && (
          <g key={`arm-${reaction.id}`} className="animate-arm-wave" aria-hidden="true">
            <ellipse cx="6" cy="60" rx="6" ry="13" fill="#4f46e5" />
          </g>
        )}

        {/* Hero cape (behind body) */}
        {hasCape && (
          <path
            className="animate-cape-wave"
            d="M42 38 C28 42 20 58 24 78 C26 88 34 95 45 96 C48 96 50 90 50 84 C50 90 52 96 55 96 C66 95 74 88 76 78 C80 58 72 42 58 38 Z"
            fill="url(#mascot-cape)"
            aria-hidden="true"
          />
        )}

        {/* Body */}
        <path
          d="M50 5 C66 4 82 8 90 22 C97 35 95 52 89 64 C83 77 73 88 60 92 C47 96 34 94 24 86 C13 78 7 64 6 49 C5 34 12 20 23 12 C32 6 42 5 50 5 Z"
          fill="url(#mascot-body)"
        />
        <ellipse cx="50" cy="63" rx="25" ry="19" fill="#ffffff" opacity="0.22" aria-hidden="true" />

        {/* Feet */}
        <ellipse cx="33" cy="93" rx="10" ry="5" fill="#4338ca" opacity="0.85" />
        <ellipse cx="67" cy="93" rx="10" ry="5" fill="#4338ca" opacity="0.85" />

        {/* Gold chain (streak 10+) */}
        {hasChain && (
          <g aria-hidden="true">
            <g fill="#fbbf24" stroke="#d97706" strokeWidth="0.7">
              <circle cx="36" cy="80" r="2.1" />
              <circle cx="43" cy="82.5" r="2.1" />
              <circle cx="50" cy="83.5" r="2.1" />
              <circle cx="57" cy="82.5" r="2.1" />
              <circle cx="64" cy="80" r="2.1" />
            </g>
            <circle cx="50" cy="90" r="4.4" fill="#fbbf24" stroke="#d97706" strokeWidth="1.1" />
            <g transform="translate(50, 90) scale(0.55)">
              <path d="M0 -5 L1.4 -1.4 L5 0 L1.4 1.4 L0 5 L-1.4 1.4 L-5 0 L-1.4 -1.4 Z" fill="#b45309" />
            </g>
          </g>
        )}

        {/* Crowns */}
        {hasGrandCrown ? (
          <g aria-hidden="true">
            <path
              d="M25 15 L31 3 L42 11 L50 1 L58 11 L69 3 L75 15 L75 21 L25 21 Z"
              fill="url(#mascot-gold)"
              stroke="#92400e"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            <circle cx="34" cy="17" r="1.8" fill="#f43f5e" />
            <circle cx="50" cy="18" r="1.8" fill="#3b82f6" />
            <circle cx="66" cy="17" r="1.8" fill="#22c55e" />
            <circle cx="42" cy="19" r="1.4" fill="#fbbf24" />
            <circle cx="58" cy="19" r="1.4" fill="#fbbf24" />
          </g>
        ) : (
          moodCrown && (
            <g aria-hidden="true">
              <path
                d="M28 13 L33 5 L41 11 L50 4 L59 11 L67 5 L72 13 L72 18 L28 18 Z"
                fill="#fbbf24"
                stroke="#d97706"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              <circle cx="36" cy="15" r="1.6" fill="#f43f5e" />
              <circle cx="50" cy="16" r="1.6" fill="#3b82f6" />
              <circle cx="64" cy="15" r="1.6" fill="#22c55e" />
            </g>
          )
        )}

        {/* Golden halo (streak 20+) */}
        {hasHalo && (
          <g className="animate-halo-float" aria-hidden="true">
            <ellipse cx="50" cy="0" rx="14" ry="3.6" fill="#fde047" />
            <ellipse cx="50" cy="0" rx="18" ry="5" fill="none" stroke="#fde047" strokeWidth="1.6" opacity="0.55" />
          </g>
        )}

        {/* Sparkles (very happy or excited) */}
        {(HAPPY.has(mood) || excitement >= 2) && !ecstatic && !levelUp && (
          <g aria-hidden="true">
            <g transform="translate(16, 16) scale(1.1)">
              <path className="mascot-sparkle" d="M0 -5 L1.4 -1.4 L5 0 L1.4 1.4 L0 5 L-1.4 1.4 L-5 0 L-1.4 -1.4 Z" fill="#fbbf24" />
            </g>
            <g transform="translate(84, 24) scale(0.8)">
              <path className="mascot-sparkle" d="M0 -5 L1.4 -1.4 L5 0 L1.4 1.4 L0 5 L-1.4 1.4 L-5 0 L-1.4 -1.4 Z" fill="#f472b6" style={{ animationDelay: '0.9s' }} />
            </g>
            <g transform="translate(74, 8) scale(0.7)">
              <path className="mascot-sparkle" d="M0 -5 L1.4 -1.4 L5 0 L1.4 1.4 L0 5 L-1.4 1.4 L-5 0 L-1.4 -1.4 Z" fill="#60a5fa" style={{ animationDelay: '1.6s' }} />
            </g>
          </g>
        )}

        {/* Rising hearts (everything done) */}
        {excitement >= 3 && (
          <g aria-hidden="true">
            <g transform="translate(20, 42) scale(0.9)">
              <path className="animate-heart-rise" d="M0 4 C0 1.6 1.5 0 3.4 0 C5.4 0 7 1.6 7 4 C7 7.2 0 10.6 0 10.6 C0 10.6 -7 7.2 -7 4 C-7 1.6 -5.4 0 -3.4 0 C-1.5 0 0 1.6 0 4 Z" fill="#fb7185" />
            </g>
            <g transform="translate(80, 38) scale(0.8)">
              <path className="animate-heart-rise" d="M0 4 C0 1.6 1.5 0 3.4 0 C5.4 0 7 1.6 7 4 C7 7.2 0 10.6 0 10.6 C0 10.6 -7 7.2 -7 4 C-7 1.6 -5.4 0 -3.4 0 C-1.5 0 0 1.6 0 4 Z" fill="#f472b6" style={{ animationDelay: '0.9s' }} />
            </g>
          </g>
        )}

        {/* Blush (happy face) */}
        {faceHappy && (
          <g aria-hidden="true">
            <ellipse cx="25" cy="54" rx="5" ry="3" fill="#f9a8d4" opacity="0.7" />
            <ellipse cx="75" cy="54" rx="5" ry="3" fill="#f9a8d4" opacity="0.7" />
          </g>
        )}

        {/* Tears (sad face; heavier with more missed tasks) */}
        {faceSad && (
          <g aria-hidden="true">
            <circle cx="36" cy="55" r="2.4" fill="#60a5fa" className="animate-tear" style={{ animationDuration: tearsFast }} />
            <circle cx="64" cy="55" r="2.4" fill="#60a5fa" className="animate-tear" style={{ animationDuration: tearsFast, animationDelay: '0.7s' }} />
            {missedToday >= 3 && (
              <>
                <circle cx="36" cy="58" r="2" fill="#93c5fd" className="animate-tear" style={{ animationDuration: tearsFast, animationDelay: '0.4s' }} />
                <circle cx="64" cy="58" r="2" fill="#93c5fd" className="animate-tear" style={{ animationDuration: tearsFast, animationDelay: '1.1s' }} />
              </>
            )}
          </g>
        )}

        {/* Worry sweat (many missed tasks) */}
        {sweaty && (
          <g aria-hidden="true">
            <circle cx="84" cy="30" r="2.3" fill="#60a5fa" className="animate-sweat-drop" />
            <circle cx="88" cy="38" r="2" fill="#93c5fd" className="animate-sweat-drop" style={{ animationDelay: '0.8s' }} />
          </g>
        )}

        {/* Eyes (blink together) */}
        <g className="mascot-blink">
          {faceSad ? (
            <>
              <path d="M31 47 Q37 50 43 47" stroke="#312e81" strokeWidth="3.4" fill="none" strokeLinecap="round" />
              <path d="M57 47 Q63 50 69 47" stroke="#312e81" strokeWidth="3.4" fill="none" strokeLinecap="round" />
            </>
          ) : faceHappy && excitement >= 3 ? (
            <>
              <g transform="translate(37, 45)">
                <path d="M0 -5 L1.4 -1.4 L5 0 L1.4 1.4 L0 5 L-1.4 1.4 L-5 0 L-1.4 -1.4 Z" fill="#312e81" />
              </g>
              <g transform="translate(63, 45)">
                <path d="M0 -5 L1.4 -1.4 L5 0 L1.4 1.4 L0 5 L-1.4 1.4 L-5 0 L-1.4 -1.4 Z" fill="#312e81" />
              </g>
            </>
          ) : faceHappy ? (
            <>
              <path d={`M${37 - eyeSpan / 2} ${eyeY} Q37 ${eyeY - 7} ${37 + eyeSpan / 2} ${eyeY}`} stroke="#312e81" strokeWidth="3.4" fill="none" strokeLinecap="round" />
              <path d={`M${63 - eyeSpan / 2} ${eyeY} Q63 ${eyeY - 7} ${63 + eyeSpan / 2} ${eyeY}`} stroke="#312e81" strokeWidth="3.4" fill="none" strokeLinecap="round" />
            </>
          ) : (
            <>
              <circle cx="37" cy="46" r={eyeR} fill="#312e81" />
              <circle cx={38.6 + excitement * 0.3} cy={44.4} r="1.7" fill="#ffffff" />
              <circle cx="63" cy="46" r={eyeR} fill="#312e81" />
              <circle cx={64.6 + excitement * 0.3} cy={44.4} r="1.7" fill="#ffffff" />
            </>
          )}
        </g>

        {/* Black glasses (streak 5+) */}
        {hasGlasses && (
          <g aria-hidden="true">
            <circle cx="37" cy="46" r="7.2" fill="rgba(15, 23, 42, 0.42)" stroke="#0f172a" strokeWidth="2.8" />
            <circle cx="63" cy="46" r="7.2" fill="rgba(15, 23, 42, 0.42)" stroke="#0f172a" strokeWidth="2.8" />
            <path d="M44.2 45.5 h11.6" stroke="#0f172a" strokeWidth="2.8" strokeLinecap="round" />
            <path d="M29.8 45 l-6 -3" stroke="#0f172a" strokeWidth="2.8" strokeLinecap="round" />
            <path d="M70.2 45 l6 -3" stroke="#0f172a" strokeWidth="2.8" strokeLinecap="round" />
            <path d="M33.5 42 l2.6 -2.6" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" opacity="0.75" />
            <path d="M59.5 42 l2.6 -2.6" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" opacity="0.75" />
          </g>
        )}

        {/* Concerned brows (missed tasks, neutral face) */}
        {worried && (
          <g aria-hidden="true">
            <path d="M29 41 L42 38" stroke="#312e81" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M71 41 L58 38" stroke="#312e81" strokeWidth="2.4" strokeLinecap="round" />
          </g>
        )}

        {/* Sad brows */}
        {faceSad && (
          <g aria-hidden="true">
            <path d="M29 40 L44 43" stroke="#312e81" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M71 40 L56 43" stroke="#312e81" strokeWidth="2.4" strokeLinecap="round" />
          </g>
        )}

        {/* Mouth */}
        {faceSad ? (
          <path d="M41 62 Q50 55 59 62" stroke="#312e81" strokeWidth="3.6" fill="none" strokeLinecap="round" />
        ) : faceHappy ? (
          <path d={`M${50 - smileSpan / 2} 55 Q50 ${65 + excitement} ${50 + smileSpan / 2} 55`} stroke="#312e81" strokeWidth="3.6" fill="none" strokeLinecap="round" />
        ) : worried ? (
          <path d="M44 61.5 Q50 64 56 61.5" stroke="#312e81" strokeWidth="3.2" fill="none" strokeLinecap="round" />
        ) : (
          <path d="M43 58 Q50 62 57 58" stroke="#312e81" strokeWidth="3.4" fill="none" strokeLinecap="round" />
        )}
      </svg>
    </div>
  );
}
