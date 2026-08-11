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
  /** Wardrobe item ids currently worn (already filtered to owned items). */
  equipped?: string[];
  size?: number;
  className?: string;
}

const SAD = new Set<Mood>(['sad', 'very-sad']);
const HAPPY = new Set<Mood>(['happy', 'very-happy', 'ecstatic']);

const HEADWEAR = new Set(['hat', 'cap', 'headband']);

/**
 * "Zico" — the Make Zico Great Again mascot. A squishy violet blob whose
 * expression and animations react to your day in real time:
 *  - walks a progress track as you complete tasks (jumps on each completion)
 *  - sighs and deflates when a task is un-checked
 *  - grows sparkles and hearts as excitement rises, showers confetti when
 *    ecstatic
 *  - sweats and sheds tears when many tasks are left pending
 *  - wears whatever wardrobe items are equipped (streak gear, hats, weapons
 *    and pets from the shop)
 */
export default function Mascot({
  mood,
  excitement = 0,
  missedToday = 0,
  walking = false,
  reaction = { id: 0, type: 'none' },
  equipped = [],
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

  /* ---------- expression system ---------- */
  // With nothing on the list Zico doesn't force a smile — he gets bored and
  // sleepy instead. His idle face cycles through a few moods every few seconds.
  const idle =
    !walking && excitement === 0 && missedToday === 0 && !celebrate && !levelUp && !sighing;
  const [idleFace, setIdleFace] = useState<'neutral' | 'bored' | 'sleepy'>('neutral');
  useEffect(() => {
    if (!idle) {
      setIdleFace('neutral');
      return;
    }
    const faces: Array<'neutral' | 'bored' | 'sleepy'> = ['neutral', 'bored', 'neutral', 'sleepy'];
    let i = 0;
    const t = window.setInterval(() => {
      i = (i + 1) % faces.length;
      setIdleFace(faces[i]);
    }, 4800);
    return () => window.clearInterval(t);
  }, [idle]);

  // One-shot reaction faces override the mood face
  const showWow = celebrate;
  const showLaugh = levelUp;
  const showMeh = sighing;
  // The happy mood face only wins when something is actually going on
  const showHappy = faceHappy && !idle;
  const showIdle = idle && !faceSad;
  const showAllDone = showHappy && excitement >= 3;
  const showTongue = showAllDone;
  const showPout = faceSad && missedToday >= 3;

  /* ---------- gadget tiers ---------- */
  const has = (id: string) => equipped.includes(id);
  const hasGlasses = has('glasses');
  const hasChain = has('chain');
  const hasCape = has('cape');
  const hasHalo = has('halo');
  const hasGrandCrown = has('crown');
  // Hats cover the crown — don't render both at once
  const wearingHeadwear = [...HEADWEAR].some((id) => equipped.includes(id));

  /* ---------- body animation ---------- */
  let anim = 'animate-mascot-breathe';
  if (celebrate) anim = 'animate-mascot-jump';
  else if (sighing) anim = 'animate-mascot-sigh';
  else if (levelUp) anim = 'animate-mascot-spin';
  else if (faceSad) anim = 'animate-mascot-wiggle';
  else if (walking) anim = excitement >= 2 ? 'animate-mascot-walk-fast' : 'animate-mascot-walk';
  else if (showHappy) anim = 'animate-mascot-bob';

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
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#b91c1c" />
          </linearGradient>
          <linearGradient id="mascot-gold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>

        {/* Ground shadow */}
        <ellipse cx="50" cy="95" rx="20" ry="3.5" fill="#0f172a" opacity="0.12" />

        {/* Rainbow trail (streak 30+) — shimmering arcs behind Zico */}
        {has('rainbow') && (
          <g className="animate-rainbow-shimmer" aria-hidden="true">
            <path d="M22 87 Q50 62 78 87" fill="none" stroke="#f87171" strokeWidth="3" strokeLinecap="round" />
            <path d="M26 90.5 Q50 68 74 90.5" fill="none" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
            <path d="M30 94 Q50 74 70 94" fill="none" stroke="#34d399" strokeWidth="3" strokeLinecap="round" />
            <path d="M34 97.5 Q50 80 66 97.5" fill="none" stroke="#60a5fa" strokeWidth="3" strokeLinecap="round" />
          </g>
        )}

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
        {ecstatic && (
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

        {/* Hero cape (behind body) — bright red with gold trim */}
        {hasCape && (
          <g aria-hidden="true">
            <path
              className="animate-cape-wave"
              d="M40 36 C22 42 10 58 14 80 C16 92 28 98 44 98 C47 98 50 88 50 80 C50 88 53 98 56 98 C72 98 84 92 86 80 C90 58 78 42 60 36 Z"
              fill="url(#mascot-cape)"
              stroke="#fbbf24"
              strokeWidth="2.4"
              strokeLinejoin="round"
            />
            <circle cx="50" cy="38" r="3.2" fill="#fbbf24" stroke="#b45309" strokeWidth="1.2" />
          </g>
        )}

        {/* Fairy wings (shop) — flutter behind the body */}
        {has('wings') && (
          <g aria-hidden="true">
            <g className="animate-wing-flutter">
              <path
                d="M48 50 C38 34 22 34 16 46 C12 55 20 66 34 68 C42 69 47 64 48 57 Z"
                fill="rgba(232, 121, 249, 0.7)"
                stroke="#c026d3"
                strokeWidth="1.2"
              />
              <path d="M22 44 C28 42 36 44 44 52" fill="none" stroke="#e879f9" strokeWidth="1" opacity="0.8" />
            </g>
            <g className="animate-wing-flutter" style={{ animationDelay: '0.12s', transformOrigin: '15% 60%' }}>
              <path
                d="M52 50 C62 34 78 34 84 46 C88 55 80 66 66 68 C58 69 53 64 52 57 Z"
                fill="rgba(232, 121, 249, 0.7)"
                stroke="#c026d3"
                strokeWidth="1.2"
              />
              <path d="M78 44 C72 42 64 44 56 52" fill="none" stroke="#e879f9" strokeWidth="1" opacity="0.8" />
            </g>
          </g>
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

        {/* Royal crown — exclusive 25-day streak gear */}
        {hasGrandCrown && !wearingHeadwear && (
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
        )}

        {/* Golden halo (streak 20+) */}
        {hasHalo && (
          <g className="animate-halo-float" aria-hidden="true">
            <ellipse cx="50" cy="0" rx="14" ry="3.6" fill="#fde047" />
            <ellipse cx="50" cy="0" rx="18" ry="5" fill="none" stroke="#fde047" strokeWidth="1.6" opacity="0.55" />
          </g>
        )}

        {/* Ninja headband (shop) */}
        {has('headband') && (
          <g aria-hidden="true">
            <path d="M28 30 Q50 27 72 30 L72 34 Q50 31 28 34 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="0.8" />
            <path d="M71 27 L82 23 L79 32 L83 39 L72 36 Z" fill="#dc2626" />
            <path d="M79 32 L83 39 L75 34 Z" fill="#ef4444" />
          </g>
        )}

        {/* Street cap (shop) */}
        {has('cap') && (
          <g aria-hidden="true">
            <path d="M36 18 Q38 4 50 4 Q62 4 64 18 Z" fill="#2563eb" stroke="#1e40af" strokeWidth="1" />
            <path d="M63 15 Q75 12 77 17 Q73 20 63 19 Z" fill="#1d4ed8" stroke="#1e40af" strokeWidth="0.8" />
            <circle cx="50" cy="5" r="2" fill="#3b82f6" stroke="#1e40af" strokeWidth="0.6" />
          </g>
        )}

        {/* Top hat (shop) */}
        {has('hat') && (
          <g aria-hidden="true">
            <path d="M39 14 L39 4 Q39 2 41 2 L59 2 Q61 2 61 4 L61 14 Z" fill="#0f172a" stroke="#334155" strokeWidth="1" />
            <path d="M39 8 L61 8 L61 11 L39 11 Z" fill="#dc2626" />
            <ellipse cx="50" cy="14.5" rx="17" ry="3.2" fill="#0f172a" stroke="#334155" strokeWidth="1" />
          </g>
        )}

        {/* Sparkles (happy or excited) */}
        {(HAPPY.has(mood) || excitement >= 2) && !levelUp && (
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

        {/* Sleepy "z z z" (idle with nothing to do) */}
        {showIdle && idleFace === 'sleepy' && (
          <g aria-hidden="true">
            <text x="76" y="32" fontSize="6.5" fontWeight="bold" fill="#94a3b8" className="animate-twinkle">z</text>
            <text x="83" y="25" fontSize="5" fontWeight="bold" fill="#a5b4fc" className="animate-twinkle" style={{ animationDelay: '0.4s' }}>z</text>
            <text x="88" y="19" fontSize="4" fontWeight="bold" fill="#c4b5fd" className="animate-twinkle" style={{ animationDelay: '0.8s' }}>z</text>
          </g>
        )}

        {/* Bored "..." (idle with nothing to do) */}
        {showIdle && idleFace === 'bored' && (
          <g aria-hidden="true">
            <circle cx="80" cy="27" r="1.1" fill="#94a3b8" className="animate-twinkle" />
            <circle cx="86" cy="25" r="1.1" fill="#a5b4fc" className="animate-twinkle" style={{ animationDelay: '0.35s' }} />
            <circle cx="92" cy="23" r="1.1" fill="#c4b5fd" className="animate-twinkle" style={{ animationDelay: '0.7s' }} />
          </g>
        )}

        {/* Blush (happy face) */}
        {showHappy && (
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
          ) : showWow ? (
            <>
              <circle cx="37" cy="45" r={eyeR + 1.5} fill="#312e81" />
              <circle cx="38.9" cy="43.3" r="2" fill="#ffffff" />
              <circle cx="63" cy="45" r={eyeR + 1.5} fill="#312e81" />
              <circle cx="64.9" cy="43.3" r="2" fill="#ffffff" />
            </>
          ) : showLaugh ? (
            <>
              <path d={`M${37 - eyeSpan / 2} ${eyeY} Q37 ${eyeY - 8} ${37 + eyeSpan / 2} ${eyeY}`} stroke="#312e81" strokeWidth="3.6" fill="none" strokeLinecap="round" />
              <path d={`M${63 - eyeSpan / 2} ${eyeY} Q63 ${eyeY - 8} ${63 + eyeSpan / 2} ${eyeY}`} stroke="#312e81" strokeWidth="3.6" fill="none" strokeLinecap="round" />
            </>
          ) : showMeh ? (
            <>
              <path d="M33 47 Q37 49 41 47" stroke="#312e81" strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M59 47 Q63 49 67 47" stroke="#312e81" strokeWidth="3" fill="none" strokeLinecap="round" />
            </>
          ) : showIdle ? (
            idleFace === 'sleepy' ? (
              <>
                <path d="M32 47 Q37 50.5 42 47" stroke="#312e81" strokeWidth="3" fill="none" strokeLinecap="round" />
                <path d="M58 47 Q63 50.5 68 47" stroke="#312e81" strokeWidth="3" fill="none" strokeLinecap="round" />
              </>
            ) : idleFace === 'bored' ? (
              <>
                <path d="M32.5 47 Q37 45.5 41.5 47" stroke="#312e81" strokeWidth="3" fill="none" strokeLinecap="round" />
                <path d="M58.5 47 Q63 45.5 67.5 47" stroke="#312e81" strokeWidth="3" fill="none" strokeLinecap="round" />
              </>
            ) : (
              <>
                <circle cx="37" cy="46" r={eyeR} fill="#312e81" />
                <circle cx={38.6 + excitement * 0.3} cy={44.4} r="1.7" fill="#ffffff" />
                <circle cx="63" cy="46" r={eyeR} fill="#312e81" />
                <circle cx={64.6 + excitement * 0.3} cy={44.4} r="1.7" fill="#ffffff" />
              </>
            )
          ) : showAllDone ? (
            <>
              <g transform="translate(37, 45)">
                <path d="M0 -5 L1.4 -1.4 L5 0 L1.4 1.4 L0 5 L-1.4 1.4 L-5 0 L-1.4 -1.4 Z" fill="#312e81" />
              </g>
              <g transform="translate(63, 45)">
                <path d="M0 -5 L1.4 -1.4 L5 0 L1.4 1.4 L0 5 L-1.4 1.4 L-5 0 L-1.4 -1.4 Z" fill="#312e81" />
              </g>
            </>
          ) : showHappy ? (
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
          <>
            <path d="M41 62 Q50 55 59 62" stroke="#312e81" strokeWidth="3.6" fill="none" strokeLinecap="round" />
            {showPout && <ellipse cx="50" cy="66" rx="4" ry="2.2" fill="#8b5cf6" opacity="0.55" />}
          </>
        ) : showWow ? (
          <ellipse cx="50" cy="58" rx="3.4" ry="4.2" fill="#312e81" />
        ) : showLaugh ? (
          <path d={`M${50 - smileSpan / 2} 56 Q50 ${68 + excitement} ${50 + smileSpan / 2} 56`} stroke="#312e81" strokeWidth="3.4" fill="none" strokeLinecap="round" />
        ) : showMeh ? (
          <path d="M43 59.5 Q50 61 57 59.5" stroke="#312e81" strokeWidth="3" fill="none" strokeLinecap="round" />
        ) : showIdle ? (
          idleFace === 'sleepy' ? (
            <ellipse cx="50" cy="59" rx="2.4" ry="2.6" fill="#312e81" />
          ) : idleFace === 'bored' ? (
            <path d="M44 60 Q50 59 56 60" stroke="#312e81" strokeWidth="3" fill="none" strokeLinecap="round" />
          ) : (
            <path d="M43 58 Q50 62 57 58" stroke="#312e81" strokeWidth="3.4" fill="none" strokeLinecap="round" />
          )
        ) : showHappy ? (
          <>
            <path d={`M${50 - smileSpan / 2} 55 Q50 ${65 + excitement} ${50 + smileSpan / 2} 55`} stroke="#312e81" strokeWidth="3.6" fill="none" strokeLinecap="round" />
            {showTongue && <ellipse cx="50" cy="63.5" rx="2.6" ry="3" fill="#fb7185" stroke="#e11d48" strokeWidth="0.6" />}
          </>
        ) : worried ? (
          <path d="M44 61.5 Q50 64 56 61.5" stroke="#312e81" strokeWidth="3.2" fill="none" strokeLinecap="round" />
        ) : (
          <path d="M43 58 Q50 62 57 58" stroke="#312e81" strokeWidth="3.4" fill="none" strokeLinecap="round" />
        )}

        {/* Hero sword (shop) */}
        {has('sword') && (
          <g transform="rotate(-35 20 56)" aria-hidden="true">
            <rect x="17" y="20" width="6" height="32" rx="1" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
            <path d="M17 20 L23 20 L20 11 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
            <rect x="14" y="51" width="12" height="5" rx="1" fill="#b45309" />
            <rect x="17" y="56" width="6" height="11" rx="1.5" fill="#7c3aed" />
            <circle cx="20" cy="70" r="2.6" fill="#fbbf24" stroke="#b45309" strokeWidth="0.8" />
          </g>
        )}

        {/* Knight shield (shop) */}
        {has('shield') && (
          <g transform="rotate(14 16 58)" aria-hidden="true">
            <path d="M16 44 Q27 47 26 62 Q25 74 16 78 Q7 74 6 62 Q5 47 16 44 Z" fill="#94a3b8" stroke="#e2e8f0" strokeWidth="2" />
            <path d="M11 54 L21 54 L21 60 L11 60 Z" fill="#1e3a8a" />
            <path d="M14 51 L14 63" stroke="#1e3a8a" strokeWidth="2.4" />
          </g>
        )}

        {/* Archer bow (shop) */}
        {has('bow') && (
          <g aria-hidden="true">
            <path d="M11 36 Q18 55 11 74" fill="none" stroke="#92400e" strokeWidth="3.4" strokeLinecap="round" />
            <line x1="13.5" y1="36" x2="13.5" y2="74" stroke="#f1f5f9" strokeWidth="1.1" />
            <line x1="14" y1="55" x2="30" y2="55" stroke="#cbd5e1" strokeWidth="2" />
            <path d="M30 55 L24 51.5 L24 58.5 Z" fill="#e2e8f0" />
            <path d="M14 51.5 L14 58.5 L11 55 Z" fill="#f87171" />
          </g>
        )}

        {/* Magic wand (shop) */}
        {has('wand') && (
          <g aria-hidden="true">
            <line x1="13" y1="70" x2="30" y2="45" stroke="#78350f" strokeWidth="2.6" strokeLinecap="round" />
            <g transform="translate(30, 44) scale(1.1)">
              <path className="mascot-sparkle" d="M0 -5 L1.4 -1.4 L5 0 L1.4 1.4 L0 5 L-1.4 1.4 L-5 0 L-1.4 -1.4 Z" fill="#fbbf24" />
            </g>
          </g>
        )}

        {/* Sea trident (shop) */}
        {has('trident') && (
          <g transform="rotate(-8 18 54)" aria-hidden="true">
            <line x1="16" y1="70" x2="16" y2="34" stroke="#b45309" strokeWidth="3" strokeLinecap="round" />
            <path d="M10 38 L10 42 L16 40 L16 36 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.8" />
            <path d="M22 38 L22 42 L16 40 L16 36 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.8" />
            <path d="M8 42 L24 42" stroke="#e2e8f0" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M16 30 L19 34 L16 36 L13 34 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.8" />
          </g>
        )}

        {/* Lightning aura (shop) — crackling energy */}
        {has('aura') && (
          <g className="animate-aura-pulse" aria-hidden="true">
            <path d="M6 42 L14 42 L10 52 L19 52 L7 66 L12 52 L5 52 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
            <path
              d="M81 34 L89 34 L85 44 L94 44 L82 58 L87 44 L80 44 Z"
              fill="#fbbf24"
              stroke="#d97706"
              strokeWidth="1"
              style={{ animationDelay: '0.35s' }}
            />
          </g>
        )}

        {/* Cat pet (shop) */}
        {has('cat') && (
          <g className="animate-pet-bob" aria-hidden="true">
            <path d="M92 88 Q99 82 97 74" fill="none" stroke="#f97316" strokeWidth="2.4" strokeLinecap="round" />
            <ellipse cx="87" cy="87" rx="6.5" ry="6" fill="#f97316" />
            <circle cx="87" cy="76" r="5.4" fill="#fb923c" />
            <path d="M83.5 73 L81.5 67.5 L86 72 Z" fill="#f97316" />
            <path d="M90.5 73 L92.5 67.5 L88 72 Z" fill="#f97316" />
            <circle cx="85.4" cy="75.6" r="0.9" fill="#1c1917" />
            <circle cx="88.6" cy="75.6" r="0.9" fill="#1c1917" />
            <path d="M87 78.5 L88.4 79.4 L87 80.3 Z" fill="#fda4af" />
          </g>
        )}

        {/* Dog pet (shop) */}
        {has('dog') && (
          <g className="animate-pet-bob" aria-hidden="true">
            <ellipse cx="87" cy="87" rx="6.5" ry="6" fill="#92400e" />
            <ellipse cx="83.5" cy="77" rx="2.4" ry="4" fill="#78350f" transform="rotate(12 83.5 77)" />
            <ellipse cx="90.5" cy="77" rx="2.4" ry="4" fill="#78350f" transform="rotate(-12 90.5 77)" />
            <circle cx="87" cy="76" r="5.6" fill="#b45309" />
            <circle cx="85.4" cy="75.2" r="0.9" fill="#1c1917" />
            <circle cx="88.6" cy="75.2" r="0.9" fill="#1c1917" />
            <ellipse cx="87" cy="79" rx="2.6" ry="1.8" fill="#fcd9b6" />
            <path d="M92.5 87 Q95 84 93 81" fill="none" stroke="#78350f" strokeWidth="2.2" strokeLinecap="round" />
          </g>
        )}

        {/* Turtle pet (shop) */}
        {has('turtle') && (
          <g className="animate-pet-bob" aria-hidden="true">
            <path d="M79 88 A8.5 8.5 0 0 1 96 88 Z" fill="#22c55e" stroke="#15803d" strokeWidth="1.4" />
            <path d="M83 84 L83 88 M87.5 83.5 L87.5 88 M91 84 L91 88" stroke="#15803d" strokeWidth="1.2" />
            <circle cx="77.5" cy="85" r="2.8" fill="#16a34a" />
            <circle cx="76.8" cy="84.6" r="0.6" fill="#1c1917" />
            <ellipse cx="84" cy="88.5" rx="2.2" ry="1.3" fill="#16a34a" />
            <ellipse cx="91" cy="88.5" rx="2.2" ry="1.3" fill="#16a34a" />
            <path d="M95.5 90 Q97.5 91.5 96.5 93" fill="none" stroke="#15803d" strokeWidth="1.6" strokeLinecap="round" />
          </g>
        )}

        {/* Owl pet (shop) */}
        {has('owl') && (
          <g className="animate-pet-bob" aria-hidden="true">
            <path d="M84 72.5 L82.5 67.5 L86.2 71.5 Z" fill="#6d28d9" />
            <path d="M90 72.5 L91.5 67.5 L87.8 71.5 Z" fill="#6d28d9" />
            <ellipse cx="87" cy="84" rx="6" ry="7" fill="#7c3aed" />
            <circle cx="87" cy="74" r="5.8" fill="#8b5cf6" />
            <circle cx="84.8" cy="73.5" r="2.3" fill="#f8fafc" />
            <circle cx="89.2" cy="73.5" r="2.3" fill="#f8fafc" />
            <circle cx="84.8" cy="73.5" r="1.1" fill="#1e1b4b" />
            <circle cx="89.2" cy="73.5" r="1.1" fill="#1e1b4b" />
            <path d="M87 77 L88.2 78.4 L87 79.8 Z" fill="#f59e0b" />
            <path d="M81.5 83 Q80 87 81.5 90" fill="none" stroke="#6d28d9" strokeWidth="2.6" strokeLinecap="round" />
            <path d="M92.5 83 Q94 87 92.5 90" fill="none" stroke="#6d28d9" strokeWidth="2.6" strokeLinecap="round" />
          </g>
        )}

        {/* Fox pet (shop) */}
        {has('fox') && (
          <g className="animate-pet-bob" aria-hidden="true">
            <path d="M86 88 Q94 82 92 74" fill="none" stroke="#f97316" strokeWidth="2.6" strokeLinecap="round" />
            <circle cx="89" cy="70" r="1.8" fill="#fff7ed" />
            <ellipse cx="86" cy="88" rx="6.5" ry="5.5" fill="#f97316" />
            <path d="M81.5 84 L81 78 L85 81.5 Z" fill="#f97316" />
            <path d="M90.5 84 L91 78 L87 81.5 Z" fill="#f97316" />
            <circle cx="86" cy="78" r="5" fill="#fb923c" />
            <path d="M82.5 76.5 L83 71.5 L86 75.5 Z" fill="#ea580c" />
            <path d="M89.5 76.5 L89 71.5 L86 75.5 Z" fill="#ea580c" />
            <circle cx="84.6" cy="77.5" r="0.8" fill="#1c1917" />
            <circle cx="87.4" cy="77.5" r="0.8" fill="#1c1917" />
            <circle cx="86" cy="79.6" r="1.1" fill="#1c1917" />
          </g>
        )}

        {/* Mini dragon pet (shop) */}
        {has('dragon') && (
          <g className="animate-pet-bob" aria-hidden="true">
            <path d="M92 86 Q99 78 94 70" fill="none" stroke="#10b981" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M94 70 L98 66.5 L93 66 Z" fill="#10b981" />
            <ellipse cx="86" cy="87" rx="6.5" ry="5.5" fill="#34d399" />
            <path d="M82 85 Q78 80 83 80 Z" fill="#10b981" />
            <path d="M90 85 Q94 80 89 80 Z" fill="#10b981" />
            <circle cx="86" cy="77" r="5" fill="#34d399" />
            <path d="M83.5 73 L82.5 68.5 L85 72.5 Z" fill="#fbbf24" />
            <path d="M88.5 73 L89.5 68.5 L87 72.5 Z" fill="#fbbf24" />
            <circle cx="84.6" cy="76.6" r="0.9" fill="#022c22" />
            <circle cx="87.4" cy="76.6" r="0.9" fill="#022c22" />
            <path d="M86 79.5 L87.6 80.2 L86 80.9 Z" fill="#a7f3d0" />
            <ellipse cx="86" cy="85" rx="3.5" ry="2" fill="#a7f3d0" opacity="0.8" />
          </g>
        )}
      </svg>
    </div>
  );
}
