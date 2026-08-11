import { useEffect, useState } from 'react';
import { cn } from '@/utils/cn';
import { getMascot } from '@/data/mascots';
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
  /** Mascot skin id (see `src/data/mascots.ts`). */
  skin?: string;
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
  skin = 'zico',
  size = 72,
  className,
}: MascotProps) {
  const skinDef = getMascot(skin);
  const p = skinDef.palette;
  const bodyGradient = `url(#mascot-body-${skinDef.id})`;

  // Body silhouettes. Every path shares the same anchors — head top around
  // (50, 5), sides near (6-94, 45-55), bottom (50, 92) — so faces, hats,
  // capes and pets sit correctly on any shape.
  const BODY_PATHS: Record<string, string> = {
    blob: 'M50 5 C66 4 82 8 90 22 C97 35 95 52 89 64 C83 77 73 88 60 92 C47 96 34 94 24 86 C13 78 7 64 6 49 C5 34 12 20 23 12 C32 6 42 5 50 5 Z',
    tall: 'M50 4 C58 4 64 7 68 12 C78 22 92 30 93 46 C94 62 89 76 80 85 C70 94 59 96 50 96 C41 96 30 94 20 85 C11 76 6 62 7 46 C8 30 22 22 32 12 C36 7 42 4 50 4 Z',
    gumdrop: 'M50 6 C56 6 62 10 67 16 C77 28 92 36 93 52 C94 68 88 82 78 89 C68 95 58 96 50 96 C42 96 32 95 22 89 C12 82 6 68 7 52 C8 36 23 28 33 16 C38 10 44 6 50 6 Z',
    block: 'M50 7 C56 7 62 8 68 10 C80 14 90 22 92 36 C94 50 93 66 88 80 C83 91 69 95 50 95 C31 95 17 91 12 80 C7 66 6 50 8 36 C10 22 20 14 32 10 C38 8 44 7 50 7 Z',
    heart: 'M50 16 C48 8 38 2 28 6 C16 10 10 24 14 38 C18 52 34 70 50 95 C66 70 82 52 86 38 C90 24 84 10 72 6 C62 2 52 8 50 16 Z',
    egg: 'M50 4 C60 4 68 8 73 16 C82 30 92 40 92 52 C92 68 84 80 72 87 C64 91 57 92 50 92 C43 92 36 91 28 87 C16 80 8 68 8 52 C8 40 18 30 27 16 C32 8 40 4 50 4 Z',
  };
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
  // A one-shot reaction is playing — its face replaces the mood face.
  const reacting = celebrate || levelUp || sighing;

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

  // One-shot reaction faces override the mood face. Each progress / deprogress
  // picks a random variant so the mascot never wears the same face twice in a row.
  const variant = reaction.variant;
  const showWow = celebrate && (variant === 'wow' || variant === undefined);
  const showExcited = celebrate && variant === 'excited';
  const showWink = celebrate && variant === 'wink';
  const showTongueFace = celebrate && variant === 'tongue';
  const showLaughFace = celebrate && variant === 'laugh';
  const showLaugh = levelUp || showLaughFace;
  const showMeh = sighing && (variant === 'meh' || variant === undefined);
  const showPoutFace = sighing && variant === 'pout';
  const showUgh = sighing && variant === 'ugh';
  const showSighFace = sighing && variant === 'sigh';
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
      aria-label={`${skinDef.name} feeling ${mood.replace('-', ' ')}`}
    >
      <svg
        key={reaction.id}
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className={anim}
      >
        <defs>
          <linearGradient id={`mascot-body-${skinDef.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.from} />
            <stop offset="100%" stopColor={p.to} />
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

        {/* Rainbow trail (streak 30+) — shimmering arcs behind Zico, ends poking out at the sides */}
        {has('rainbow') && (
          <g className="animate-rainbow-shimmer" aria-hidden="true">
            <path d="M10 86 Q50 56 90 86" fill="none" stroke="#f87171" strokeWidth="3" strokeLinecap="round" />
            <path d="M13 90 Q50 64 87 90" fill="none" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
            <path d="M16 94 Q50 72 84 94" fill="none" stroke="#34d399" strokeWidth="3" strokeLinecap="round" />
            <path d="M19 98 Q50 80 81 98" fill="none" stroke="#60a5fa" strokeWidth="3" strokeLinecap="round" />
          </g>
        )}

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
            <ellipse cx="6" cy="60" rx="6" ry="13" fill={bodyGradient} stroke={p.outline} strokeWidth="1.6" />
          </g>
        )}

        {/* Hero cape (behind body) — bright red with gold trim, wider than the body so it shows at the sides */}
        {hasCape && (
          <g aria-hidden="true">
            <path
              className="animate-cape-wave"
              d="M44 33 C18 38 3 54 6 79 C8 92 19 99 42 99 C46 99 49 91 50 83 C51 91 54 99 58 99 C81 99 92 92 94 79 C97 54 82 38 56 33 Z"
              fill="url(#mascot-cape)"
              stroke="#fbbf24"
              strokeWidth="2.4"
              strokeLinejoin="round"
            />
            <circle cx="50" cy="36" r="3.2" fill="#fbbf24" stroke="#b45309" strokeWidth="1.2" />
          </g>
        )}

        {/* Fairy wings (shop) — flutter behind the body, poking out at the sides */}
        {has('wings') && (
          <g aria-hidden="true">
            <g className="animate-wing-flutter" style={{ transformOrigin: '16px 52px' }}>
              <path
                d="M16 52 C8 36 1 31 2 42 C3 51 7 60 19 64 C24 66 27 62 25 57 C23 54 17 54 16 52 Z"
                fill="rgba(232, 121, 249, 0.7)"
                stroke="#c026d3"
                strokeWidth="1.2"
              />
              <path d="M4 42 C7 36 12 36 18 48" fill="none" stroke="#e879f9" strokeWidth="1" opacity="0.8" />
            </g>
            <g className="animate-wing-flutter" style={{ animationDelay: '0.12s', transformOrigin: '84px 52px' }}>
              <path
                d="M84 52 C92 36 99 31 98 42 C97 51 93 60 81 64 C76 66 73 62 75 57 C77 54 83 54 84 52 Z"
                fill="rgba(232, 121, 249, 0.7)"
                stroke="#c026d3"
                strokeWidth="1.2"
              />
              <path d="M96 42 C93 36 88 36 82 48" fill="none" stroke="#e879f9" strokeWidth="1" opacity="0.8" />
            </g>
          </g>
        )}

        {/* Native skin accessories (behind the body) */}
        {skinDef.accessory === 'cat-ears' && (
          <g aria-hidden="true">
            <path d="M32 13 L23 -2 L40 7 Z" fill={bodyGradient} stroke={p.outline} strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M68 13 L77 -2 L60 7 Z" fill={bodyGradient} stroke={p.outline} strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M31 11 L26 2 L36 7 Z" fill={p.blush} opacity="0.9" />
            <path d="M69 11 L74 2 L64 7 Z" fill={p.blush} opacity="0.9" />
          </g>
        )}
        {skinDef.accessory === 'ram-horns' && (
          <g aria-hidden="true">
            <path d="M35 10 C26 5 19 -3 25 -7 C31 -11 38 -4 36 2 C35 6 36 9 35 10 Z" fill={p.feet} stroke={p.outline} strokeWidth="1.4" strokeLinejoin="round" />
            <path d="M65 10 C74 5 81 -3 75 -7 C69 -11 62 -4 64 2 C65 6 64 9 65 10 Z" fill={p.feet} stroke={p.outline} strokeWidth="1.4" strokeLinejoin="round" />
          </g>
        )}
        {skinDef.accessory === 'croc' && (
          <g aria-hidden="true">
            <path d="M36 9 L41 -4 L46 8 Z" fill={p.feet} stroke={p.outline} strokeWidth="1.2" strokeLinejoin="round" />
            <path d="M45 6 L50 -5 L55 6 Z" fill={p.feet} stroke={p.outline} strokeWidth="1.2" strokeLinejoin="round" />
            <path d="M54 8 L59 -4 L64 9 Z" fill={p.feet} stroke={p.outline} strokeWidth="1.2" strokeLinejoin="round" />
          </g>
        )}
        {skinDef.accessory === 'antenna' && (
          <g aria-hidden="true">
            <line x1="50" y1="13" x2="50" y2="3" stroke={p.outline} strokeWidth="2.4" strokeLinecap="round" />
            <circle cx="50" cy="3" r="3.2" fill={p.blush} stroke={p.outline} strokeWidth="1.4" />
          </g>
        )}
        {skinDef.accessory === 'dog-ears' && (
          <g aria-hidden="true">
            <path d="M31 12 L24 -5 L38 5 Z" fill={bodyGradient} stroke={p.outline} strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M69 12 L76 -5 L62 5 Z" fill={bodyGradient} stroke={p.outline} strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M30 10 L27 0 L35 5 Z" fill={p.feet} opacity="0.9" />
            <path d="M70 10 L73 0 L65 5 Z" fill={p.feet} opacity="0.9" />
          </g>
        )}
        {skinDef.accessory === 'beak' && (
          <g aria-hidden="true">
            <path d="M42 9 L39 -1 L46 5 Z" fill={p.feet} stroke={p.outline} strokeWidth="1.2" strokeLinejoin="round" />
            <path d="M50 7 L47 -3 L53 3 Z" fill={p.feet} stroke={p.outline} strokeWidth="1.2" strokeLinejoin="round" />
            <path d="M58 9 L61 -1 L54 5 Z" fill={p.feet} stroke={p.outline} strokeWidth="1.2" strokeLinejoin="round" />
          </g>
        )}
        {skinDef.accessory === 'mane' && (
          <g aria-hidden="true">
            <circle cx="27" cy="19" r="6.5" fill={p.feet} stroke={p.outline} strokeWidth="1.4" />
            <circle cx="39" cy="7" r="6.5" fill={p.feet} stroke={p.outline} strokeWidth="1.4" />
            <circle cx="61" cy="7" r="6.5" fill={p.feet} stroke={p.outline} strokeWidth="1.4" />
            <circle cx="73" cy="19" r="6.5" fill={p.feet} stroke={p.outline} strokeWidth="1.4" />
            <circle cx="22" cy="34" r="6" fill={p.feet} stroke={p.outline} strokeWidth="1.4" />
            <circle cx="78" cy="34" r="6" fill={p.feet} stroke={p.outline} strokeWidth="1.4" />
          </g>
        )}
        {skinDef.accessory === 'sun-rays' && (
          <g aria-hidden="true">
            <path d="M46 7 L50 -4 L54 7 Z" fill={p.feet} stroke={p.outline} strokeWidth="1.2" strokeLinejoin="round" />
            <path d="M38 10 L32 -1 L43 5 Z" fill={p.feet} stroke={p.outline} strokeWidth="1.2" strokeLinejoin="round" />
            <path d="M62 10 L68 -1 L57 5 Z" fill={p.feet} stroke={p.outline} strokeWidth="1.2" strokeLinejoin="round" />
            <path d="M30 19 L22 10 L34 14 Z" fill={p.feet} stroke={p.outline} strokeWidth="1.2" strokeLinejoin="round" />
            <path d="M70 19 L78 10 L66 14 Z" fill={p.feet} stroke={p.outline} strokeWidth="1.2" strokeLinejoin="round" />
          </g>
        )}
        {skinDef.accessory === 'moon-disc' && (
          <g aria-hidden="true">
            <path d="M30 14 C23 4 25 -5 33 -7 C27 0 30 7 37 11 Z" fill={p.feet} stroke={p.outline} strokeWidth="1.2" strokeLinejoin="round" />
            <path d="M70 14 C77 4 75 -5 67 -7 C73 0 70 7 63 11 Z" fill={p.feet} stroke={p.outline} strokeWidth="1.2" strokeLinejoin="round" />
            <circle cx="50" cy="3" r="6" fill={p.blush} stroke={p.outline} strokeWidth="1.2" />
            <circle cx="47.8" cy="1.6" r="1.4" fill="#ffffff" opacity="0.7" />
          </g>
        )}
        {skinDef.accessory === 'atef' && (
          <g aria-hidden="true">
            <path d="M37 12 L37 3 Q37 1 39 1 L61 1 Q63 1 63 3 L63 12 Z" fill={p.feet} stroke={p.outline} strokeWidth="1.2" strokeLinejoin="round" />
            <path d="M37 6 L63 6 L63 9 L37 9 Z" fill={p.blush} opacity="0.85" />
            <circle cx="50" cy="1" r="2.4" fill={p.blush} stroke={p.outline} strokeWidth="0.9" />
          </g>
        )}
        {skinDef.accessory === 'plume' && (
          <g aria-hidden="true">
            <path d="M46 9 C43 0 44 -6 48 -9 C51 -6 51 0 50 9 Z" fill={p.feet} stroke={p.outline} strokeWidth="1" strokeLinejoin="round" />
            <path d="M54 9 C57 0 56 -6 52 -9 C49 -6 49 0 50 9 Z" fill={p.feet} stroke={p.outline} strokeWidth="1" strokeLinejoin="round" />
          </g>
        )}
        {skinDef.accessory === 'star' && (
          <g transform="translate(50 4)" aria-hidden="true">
            <path
              className="mascot-sparkle"
              d="M0 -6 L1.8 -1.8 L6 0 L1.8 1.8 L0 6 L-1.8 1.8 L-6 0 L-1.8 -1.8 Z"
              fill={p.blush}
              stroke={p.outline}
              strokeWidth="1.1"
            />
          </g>
        )}
        {skinDef.accessory === 'spikes' && (
          <g aria-hidden="true">
            <path d="M37 9 L40 -4 L46 6 Z" fill={p.feet} stroke={p.outline} strokeWidth="1.2" strokeLinejoin="round" />
            <path d="M45 5 L50 -6 L55 5 Z" fill={p.feet} stroke={p.outline} strokeWidth="1.2" strokeLinejoin="round" />
            <path d="M54 6 L60 -4 L63 9 Z" fill={p.feet} stroke={p.outline} strokeWidth="1.2" strokeLinejoin="round" />
          </g>
        )}

        {/* Nub arms (behind the body edge) */}
        <ellipse cx="16" cy="68" rx="5.5" ry="8.5" fill={bodyGradient} stroke={p.outline} strokeWidth="1.6" transform="rotate(24 16 68)" />
        <ellipse cx="84" cy="68" rx="5.5" ry="8.5" fill={bodyGradient} stroke={p.outline} strokeWidth="1.6" transform="rotate(-24 84 68)" />

        {/* Body (silhouette per friend) */}
        <g>
          <path
            d={BODY_PATHS[skinDef.shape]}
            fill={bodyGradient}
            stroke={p.outline}
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          {/* Glossy highlight (top-left light) */}
          <ellipse
            cx="36"
            cy="29"
            rx="13"
            ry="7.5"
            fill="#ffffff"
            opacity="0.28"
            transform="rotate(-18 36 29)"
            aria-hidden="true"
          />
          {/* Soft belly */}
          <ellipse cx="50" cy="64" rx="23" ry="17" fill={p.belly} opacity="0.22" aria-hidden="true" />
        </g>

        {/* Screen-space burst ring on completion — in front of the body so it's always visible */}
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

        {/* Sigh puff on un-check — beside the body edge */}
        {sighing && <circle className="animate-puff-rise" cx="13" cy="42" r="4.2" fill="#cbd5e1" />}

        {/* Feet */}
        <ellipse cx="33" cy="93" rx="10" ry="5" fill={p.feet} opacity="0.9" />
        <ellipse cx="67" cy="93" rx="10" ry="5" fill={p.feet} opacity="0.9" />

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

        {/* Surprise "!" above the head on completion */}
        {showWow && (
          <text
            x="82"
            y="24"
            fontSize="11"
            fontWeight="black"
            fill="#a78bfa"
            stroke="#4c1d95"
            strokeWidth="0.5"
            className="animate-pop"
          >
            !
          </text>
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

        {/* Blush (happy, or nearly done — grows rosier with excitement) */}
        {(showHappy || excitement >= 2 || showWink || showExcited || showTongueFace || showLaughFace) && !faceSad && (
          <g aria-hidden="true">
            <ellipse cx="25" cy="54" rx={5 + excitement * 0.5} ry={3 + excitement * 0.25} fill={p.blush} opacity={0.55 + excitement * 0.12} />
            <ellipse cx="75" cy="54" rx={5 + excitement * 0.5} ry={3 + excitement * 0.25} fill={p.blush} opacity={0.55 + excitement * 0.12} />
          </g>
        )}

        {/* Tears (sad face; heavier with more missed tasks) */}
        {faceSad && !reacting && (
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
        {sweaty && !reacting && (
          <g aria-hidden="true">
            <circle cx="84" cy="30" r="2.3" fill="#60a5fa" className="animate-sweat-drop" />
            <circle cx="88" cy="38" r="2" fill="#93c5fd" className="animate-sweat-drop" style={{ animationDelay: '0.8s' }} />
          </g>
        )}

        {/* Jackal muzzle (Anubis) — sits under the mouth */}
        {skinDef.accessory === 'dog-ears' && (
          <g aria-hidden="true">
            <path d="M38 53 Q50 48 62 53 Q64 61 50 65 Q36 61 38 53 Z" fill={p.feet} opacity="0.5" />
            <ellipse cx="50" cy="53" rx="3.2" ry="2.3" fill={p.outline} />
          </g>
        )}

        {/* Falcon beak (Horus) — over the face, before the mouth */}
        {skinDef.accessory === 'beak' && (
          <g aria-hidden="true">
            <path d="M44 58 Q50 53 56 58 Q54 64 50 64 Q46 64 44 58 Z" fill="#fbbf24" stroke="#b45309" strokeWidth="1.4" />
            <path d="M50 54 L48 56.5 L52 56.5 Z" fill="#92400e" />
          </g>
        )}

        {/* Eyes (blink together) — reaction faces always win over the mood */}
        <g className="mascot-blink">
          {showWow ? (
            <>
              <circle cx="37" cy="45" r={eyeR + 1.5} fill="#312e81" />
              <circle cx="38.9" cy="43.3" r="2" fill="#ffffff" />
              <circle cx="63" cy="45" r={eyeR + 1.5} fill="#312e81" />
              <circle cx="64.9" cy="43.3" r="2" fill="#ffffff" />
            </>
          ) : showExcited ? (
            <>
              <circle cx="37" cy="45" r={eyeR + 0.8} fill="#312e81" />
              <circle cx="38.9" cy="43.3" r="1.8" fill="#ffffff" />
              <circle cx="63" cy="45" r={eyeR + 0.8} fill="#312e81" />
              <circle cx="64.9" cy="43.3" r="1.8" fill="#ffffff" />
              <circle cx="35.4" cy="46.4" r="0.9" fill="#ffffff" opacity="0.8" />
              <circle cx="61.4" cy="46.4" r="0.9" fill="#ffffff" opacity="0.8" />
            </>
          ) : showWink ? (
            <>
              <circle cx="37" cy="46" r={eyeR} fill="#312e81" />
              <circle cx={38.6 + excitement * 0.3} cy={44.4} r="1.7" fill="#ffffff" />
              <path d={`M${63 - eyeSpan / 2} 47 Q63 ${eyeY - 6} ${63 + eyeSpan / 2} 47`} stroke="#312e81" strokeWidth="3.4" fill="none" strokeLinecap="round" />
            </>
          ) : showTongueFace ? (
            <>
              <path d={`M${37 - eyeSpan / 2} ${eyeY} Q37 ${eyeY - 7.5} ${37 + eyeSpan / 2} ${eyeY}`} stroke="#312e81" strokeWidth="3.4" fill="none" strokeLinecap="round" />
              <path d={`M${63 - eyeSpan / 2} ${eyeY} Q63 ${eyeY - 7.5} ${63 + eyeSpan / 2} ${eyeY}`} stroke="#312e81" strokeWidth="3.4" fill="none" strokeLinecap="round" />
            </>
          ) : showLaugh ? (
            <>
              <path d={`M${37 - eyeSpan / 2} ${eyeY} Q37 ${eyeY - 8} ${37 + eyeSpan / 2} ${eyeY}`} stroke="#312e81" strokeWidth="3.6" fill="none" strokeLinecap="round" />
              <path d={`M${63 - eyeSpan / 2} ${eyeY} Q63 ${eyeY - 8} ${63 + eyeSpan / 2} ${eyeY}`} stroke="#312e81" strokeWidth="3.6" fill="none" strokeLinecap="round" />
            </>
          ) : showMeh ? (
            <>
              <path d="M33 46.5 Q37 49 41 46.5" stroke="#312e81" strokeWidth="3.2" fill="none" strokeLinecap="round" />
              <path d="M59 46.5 Q63 49 67 46.5" stroke="#312e81" strokeWidth="3.2" fill="none" strokeLinecap="round" />
              <circle cx="34.4" cy="48.4" r="1.6" fill="#312e81" />
              <circle cx="65.6" cy="48.4" r="1.6" fill="#312e81" />
            </>
          ) : showPoutFace ? (
            <>
              <path d="M32 46.5 Q37 49.5 42 46.5" stroke="#312e81" strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M58 46.5 Q63 49.5 68 46.5" stroke="#312e81" strokeWidth="3" fill="none" strokeLinecap="round" />
            </>
          ) : showUgh ? (
            <>
              <path d="M33 45.5 Q37 48.2 41 45.5" stroke="#312e81" strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M59 45.5 Q63 48.2 67 45.5" stroke="#312e81" strokeWidth="3" fill="none" strokeLinecap="round" />
              <circle cx="37" cy="44.8" r="1.6" fill="#312e81" />
              <circle cx="63" cy="44.8" r="1.6" fill="#312e81" />
            </>
          ) : showSighFace ? (
            <>
              <path d="M32 47 Q37 50 42 47" stroke="#312e81" strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M58 47 Q63 50 68 47" stroke="#312e81" strokeWidth="3" fill="none" strokeLinecap="round" />
            </>
          ) : faceSad ? (
            <>
              <path d="M31 47 Q37 50 43 47" stroke="#312e81" strokeWidth="3.4" fill="none" strokeLinecap="round" />
              <path d="M57 47 Q63 50 69 47" stroke="#312e81" strokeWidth="3.4" fill="none" strokeLinecap="round" />
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
        {worried && !reacting && (
          <g aria-hidden="true">
            <path d="M29 41 L42 38" stroke="#312e81" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M71 41 L58 38" stroke="#312e81" strokeWidth="2.4" strokeLinecap="round" />
          </g>
        )}

        {/* Sad brows */}
        {faceSad && !reacting && (
          <g aria-hidden="true">
            <path d="M29 40 L44 43" stroke="#312e81" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M71 40 L56 43" stroke="#312e81" strokeWidth="2.4" strokeLinecap="round" />
          </g>
        )}

        {/* Joyful brows (happy / laugh / wow / excited / wink / tongue / all done) */}
        {(showHappy || showLaugh || showWow || showWink || showExcited || showTongueFace || showAllDone) && !faceSad && !worried && (
          <g aria-hidden="true">
            {showWow ? (
              <>
                <path d="M30 39.5 Q37 36 44 39.5" stroke="#312e81" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M56 39.5 Q63 36 70 39.5" stroke="#312e81" strokeWidth="2.2" strokeLinecap="round" />
              </>
            ) : showLaugh ? (
              <>
                <path d="M31 39.5 L43 36.5" stroke="#312e81" strokeWidth="2.4" strokeLinecap="round" />
                <path d="M69 39.5 L57 36.5" stroke="#312e81" strokeWidth="2.4" strokeLinecap="round" />
              </>
            ) : (
              <>
                <path d="M31 39 Q37 36.5 43 39" stroke="#312e81" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M57 39 Q63 36.5 69 39" stroke="#312e81" strokeWidth="2.2" strokeLinecap="round" />
              </>
            )}
          </g>
        )}

        {/* Mouth — reaction faces win over the mood */}
        {showWow ? (
          <ellipse cx="50" cy="58" rx="3.4" ry="4.2" fill="#312e81" />
        ) : showExcited ? (
          <>
            <path d="M43 56.5 Q50 63.5 57 56.5 Q50 60 43 56.5 Z" fill="#9f1239" />
            <path d={`M${50 - smileSpan / 2} 55 Q50 ${64 + excitement} ${50 + smileSpan / 2} 55`} stroke="#312e81" strokeWidth="3.4" fill="none" strokeLinecap="round" />
          </>
        ) : showWink ? (
          <path d={`M${50 - smileSpan / 2} 56.5 Q50 ${65 + excitement} ${50 + smileSpan / 2} 56.5`} stroke="#312e81" strokeWidth="3.6" fill="none" strokeLinecap="round" />
        ) : showTongueFace ? (
          <>
            <path d={`M${50 - smileSpan / 2} 55 Q50 ${65 + excitement} ${50 + smileSpan / 2} 55`} stroke="#312e81" strokeWidth="3.6" fill="none" strokeLinecap="round" />
            <ellipse cx="50" cy="63.5" rx="2.6" ry="3" fill="#fb7185" stroke="#e11d48" strokeWidth="0.6" />
          </>
        ) : showLaugh ? (
          <>
            <path d="M42 56 Q50 72.5 58 56 Q50 63.5 42 56 Z" fill="#9f1239" />
            <ellipse cx="50" cy="63.8" rx="3.2" ry="2.3" fill="#fb7185" stroke="#e11d48" strokeWidth="0.5" />
            <path d={`M${50 - smileSpan / 2} 55.5 Q50 ${67 + excitement} ${50 + smileSpan / 2} 55.5`} stroke="#312e81" strokeWidth="3.4" fill="none" strokeLinecap="round" />
          </>
        ) : showMeh ? (
          <path d="M43 59.5 Q50 61 57 59.5" stroke="#312e81" strokeWidth="3" fill="none" strokeLinecap="round" />
        ) : showPoutFace ? (
          <>
            <path d="M43 60.5 Q50 57.5 57 60.5" stroke="#312e81" strokeWidth="3" fill="none" strokeLinecap="round" />
            <ellipse cx="50" cy="63.5" rx="3.6" ry="2.2" fill="#8b5cf6" opacity="0.55" />
          </>
        ) : showUgh ? (
          <path d="M43 60 Q50 61.5 57 60" stroke="#312e81" strokeWidth="3" fill="none" strokeLinecap="round" />
        ) : showSighFace ? (
          <path d="M44 59 Q50 61.5 56 59" stroke="#312e81" strokeWidth="3" fill="none" strokeLinecap="round" />
        ) : faceSad ? (
          <>
            <path d="M41 62 Q50 55 59 62" stroke="#312e81" strokeWidth="3.6" fill="none" strokeLinecap="round" />
            {showPout && <ellipse cx="50" cy="66" rx="4" ry="2.2" fill="#8b5cf6" opacity="0.55" />}
          </>
        ) : showIdle ? (
          idleFace === 'sleepy' ? (
            <ellipse cx="50" cy="59" rx="2.4" ry="2.6" fill="#312e81" />
          ) : idleFace === 'bored' ? (
            <ellipse cx="50" cy="60" rx="2.6" ry="3.4" fill="#312e81" />
          ) : (
            <path d="M43 58 Q50 62 57 58" stroke="#312e81" strokeWidth="3.4" fill="none" strokeLinecap="round" />
          )
        ) : showHappy ? (
          <>
            <path d={`M${50 - smileSpan / 2} 55 Q50 ${65 + excitement} ${50 + smileSpan / 2} 55`} stroke="#312e81" strokeWidth="3.6" fill="none" strokeLinecap="round" />
            {showTongue && <ellipse cx="50" cy="63.5" rx="2.6" ry="3" fill="#fb7185" stroke="#e11d48" strokeWidth="0.6" />}
          </>
        ) : worried ? (
          <path className="animate-mouth-tremble" d="M44 61.5 Q50 64 56 61.5" stroke="#312e81" strokeWidth="3.2" fill="none" strokeLinecap="round" />
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

        {/* Bubble aura (shop) — rising bubbles */}
        {has('bubbles') && (
          <g aria-hidden="true">
            <circle cx="22" cy="84" r="3" fill="none" stroke="#7dd3fc" strokeWidth="1.2" className="animate-bubble-rise" />
            <circle cx="78" cy="88" r="2.2" fill="none" stroke="#7dd3fc" strokeWidth="1.1" className="animate-bubble-rise" style={{ animationDelay: '0.7s' }} />
            <circle cx="12" cy="76" r="1.8" fill="none" stroke="#bae6fd" strokeWidth="1" className="animate-bubble-rise" style={{ animationDelay: '1.3s' }} />
            <circle cx="88" cy="72" r="2.6" fill="none" stroke="#7dd3fc" strokeWidth="1.2" className="animate-bubble-rise" style={{ animationDelay: '0.4s' }} />
          </g>
        )}

        {/* Flower petals (shop) — drifting petals */}
        {has('petals') && (
          <g aria-hidden="true">
            <ellipse cx="20" cy="20" rx="2.4" ry="1.4" fill="#fb7185" className="animate-petal-fall" />
            <ellipse cx="82" cy="12" rx="2" ry="1.2" fill="#f9a8d4" className="animate-petal-fall" style={{ animationDelay: '0.9s' }} />
            <ellipse cx="10" cy="30" rx="1.8" ry="1" fill="#fda4af" className="animate-petal-fall" style={{ animationDelay: '1.6s' }} />
            <ellipse cx="90" cy="28" rx="2.2" ry="1.3" fill="#fb7185" className="animate-petal-fall" style={{ animationDelay: '0.45s' }} />
          </g>
        )}

        {/* Music notes (shop) — floating melody */}
        {has('music') && (
          <g aria-hidden="true">
            <g className="animate-note-rise">
              <ellipse cx="21" cy="40" rx="3" ry="2.2" fill="#a78bfa" transform="rotate(-18 21 40)" />
              <line x1="24" y1="39" x2="24" y2="24" stroke="#a78bfa" strokeWidth="1.6" />
              <path d="M24 24 Q30 22 32 27" fill="none" stroke="#a78bfa" strokeWidth="1.6" />
            </g>
            <g className="animate-note-rise" style={{ animationDelay: '1.1s' }}>
              <ellipse cx="80" cy="46" rx="3" ry="2.2" fill="#f472b6" transform="rotate(-18 80 46)" />
              <line x1="83" y1="45" x2="83" y2="30" stroke="#f472b6" strokeWidth="1.6" />
              <path d="M83 30 Q89 28 91 33" fill="none" stroke="#f472b6" strokeWidth="1.6" />
            </g>
          </g>
        )}

        {/* Ice shards (shop) — floating crystals */}
        {has('ice') && (
          <g aria-hidden="true">
            <g className="animate-ice-float">
              <path d="M14 30 L16.5 24 L19 30 L16.5 36 Z" fill="#bae6fd" stroke="#7dd3fc" strokeWidth="0.8" />
            </g>
            <g className="animate-ice-float" style={{ animationDelay: '0.9s' }}>
              <path d="M85 20 L87.5 14 L90 20 L87.5 26 Z" fill="#93c5fd" stroke="#60a5fa" strokeWidth="0.8" />
            </g>
            <g className="animate-ice-float" style={{ animationDelay: '1.6s' }}>
              <path d="M90 40 L91.8 35 L93.6 40 L91.8 45 Z" fill="#bae6fd" stroke="#7dd3fc" strokeWidth="0.7" />
            </g>
          </g>
        )}

        {/* Fire flames (shop) — flickering warmth */}
        {has('fire') && (
          <g aria-hidden="true">
            <path className="animate-fire-flicker" d="M18 92 Q16 84 20 80 Q22 77 21 74 Q24 80 26 84 Q28 88 25 92 Z" fill="#fb923c" />
            <path className="animate-fire-flicker" style={{ animationDelay: '0.25s' }} d="M80 92 Q78 85 82 81 Q84 78 83 75 Q86 81 88 85 Q90 89 87 92 Z" fill="#f97316" />
            <path className="animate-fire-flicker" style={{ animationDelay: '0.5s' }} d="M50 95 Q47 87 51 82 Q53 79 52 76 Q55 82 57 86 Q59 90 55 95 Z" fill="#fbbf24" />
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
