import { cn } from '@/utils/cn';
import Mascot from './Mascot';
import { STREAK_GADGETS, SHOP_GADGETS, type Gadget } from '@/data/wardrobe';
import type { Mood, Reaction } from '@/types/task';

interface MascotBannerProps {
  mood: Mood;
  streak: number;
  unfinishedStreak: number;
  total: number;
  completed: number;
  active: number;
  reaction: Reaction;
  coins: number;
  owned: string[];
  equipped: string[];
  /** Non-null while a coin reward is animating (bump `id` to replay). */
  coinFx: { id: number; amount: number } | null;
  onToggleEquip: (id: string) => void;
  onOpenShop: () => void;
}

const SAD = new Set<Mood>(['sad', 'very-sad']);

const MOOD_INFO: Record<
  Mood,
  { title: string; message: string; accent: string; pip: string; pipActive: string }
> = {
  ecstatic: {
    title: 'Legend mode',
    message: 'Absolutely unstoppable! A true champion today. 🏆',
    accent: 'text-amber-600 dark:text-amber-400',
    pip: 'bg-amber-200 dark:bg-amber-500/30',
    pipActive: 'bg-amber-400 dark:bg-amber-400',
  },
  'very-happy': {
    title: 'On fire',
    message: 'Your streak keeps blazing — beautiful work! 🔥',
    accent: 'text-orange-500 dark:text-orange-400',
    pip: 'bg-orange-200 dark:bg-orange-500/30',
    pipActive: 'bg-orange-400 dark:bg-orange-400',
  },
  happy: {
    title: 'Streaking',
    message: 'Five days strong — the momentum is real!',
    accent: 'text-violet-600 dark:text-violet-300',
    pip: 'bg-violet-200 dark:bg-violet-500/30',
    pipActive: 'bg-violet-500 dark:bg-violet-400',
  },
  neutral: {
    title: 'Ready when you are',
    message: 'Add a task or pick a suggestion — Zico will walk the line with you.',
    accent: 'text-slate-600 dark:text-slate-300',
    pip: 'bg-slate-200 dark:bg-slate-700',
    pipActive: 'bg-violet-400 dark:bg-violet-400',
  },
  sad: {
    title: 'Rough patch',
    message: "Tough days happen — win Zico's smile back with one small task.",
    accent: 'text-rose-500 dark:text-rose-400',
    pip: 'bg-rose-100 dark:bg-rose-500/20',
    pipActive: 'bg-rose-400 dark:bg-rose-400',
  },
  'very-sad': {
    title: 'Time to rally',
    message: "Zico is rooting for you. Finish just one task today and watch the spark return.",
    accent: 'text-rose-600 dark:text-rose-400',
    pip: 'bg-rose-100 dark:bg-rose-500/20',
    pipActive: 'bg-rose-500 dark:bg-rose-400',
  },
};

export default function MascotBanner({
  mood,
  streak,
  unfinishedStreak,
  total,
  completed,
  active,
  reaction,
  coins,
  owned,
  equipped,
  coinFx,
  onToggleEquip,
  onOpenShop,
}: MascotBannerProps) {
  const info = MOOD_INFO[mood];
  const sad = SAD.has(mood);
  const allDone = total > 0 && completed === total;

  const pct = total > 0 ? completed / total : 0;
  const excitement = total > 0 ? Math.min(3, Math.round(pct * 3)) : 0;

  const level = Math.floor(streak / 5) + 1;
  const levelProgress = streak % 5;
  const sadDays = Math.min(unfinishedStreak, 5);

  const pips = Array.from({ length: 5 }, (_, i) => {
    const activePip = sad ? i < sadDays : i < levelProgress;
    return (
      <span
        key={i}
        aria-hidden="true"
        className={cn(
          'h-1.5 w-1.5 rounded-full transition-colors duration-500',
          activePip ? info.pipActive : info.pip
        )}
      />
    );
  });

  const caption = sad
    ? `${unfinishedStreak} unfinished day${unfinishedStreak === 1 ? '' : 's'}`
    : streak === 0
      ? 'Finish a task to start your streak!'
      : `Level ${level} · ${5 - levelProgress} day${5 - levelProgress === 1 ? '' : 's'} to the next`;

  /** Items shown in the strip: all streak gear + owned shop items. */
  const stripItems: Gadget[] = [
    ...STREAK_GADGETS,
    ...SHOP_GADGETS.filter((g) => owned.includes(g.id)),
  ];

  return (
    <section
      aria-label="Mascot status"
      className="animate-fade-in relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:border-slate-700/70 dark:bg-slate-800/60"
    >
      {allDone && (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 via-transparent to-emerald-400/10"
        />
      )}

      <div className="relative">
        {/* Title + daily counts */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className={cn('flex items-center gap-1.5 text-sm font-extrabold', info.accent)}>
              {info.title}
              {allDone && <span className="animate-celebrate text-base">🎉</span>}
            </h2>
            <p className="mt-0.5 text-xs font-medium leading-relaxed text-slate-500 dark:text-slate-400">
              {allDone ? 'Every task complete — what a day!' : info.message}
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-1">
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
              ✓ {completed} done
            </span>
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-[10px] font-extrabold',
                active > 0
                  ? 'bg-rose-50 text-rose-500 dark:bg-rose-500/15 dark:text-rose-400'
                  : 'bg-slate-100 text-slate-400 dark:bg-slate-700/60 dark:text-slate-500'
              )}
            >
              ⏳ {active} left
            </span>
            <button
              onClick={onOpenShop}
              title="Open the wardrobe & shop"
              className="animate-pop rounded-full border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-2 py-0.5 text-[10px] font-extrabold text-amber-600 transition-transform hover:scale-105 dark:border-amber-500/30 dark:from-amber-500/10 dark:to-orange-500/10 dark:text-amber-400"
            >
              🪙 {coins}
            </button>
          </div>
        </div>

        {/* Walking track */}
        <div className="relative mt-4 h-16">
          {/* Floating coin reward */}
          {coinFx && (
            <span
              key={coinFx.id}
              className="animate-coin-pop pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2 text-sm font-extrabold text-amber-500 dark:text-amber-400"
              aria-hidden="true"
            >
              +{coinFx.amount} 🪙
            </span>
          )}

          {/* Track */}
          <div className="absolute inset-x-2 bottom-0 h-2 rounded-full bg-slate-100 dark:bg-slate-700/70">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-400 via-indigo-500 to-fuchsia-500 transition-[width] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{ width: `${pct * 100}%` }}
            />
          </div>

          {/* Finish flag */}
          <span
            className="absolute bottom-0 right-1.5 text-lg leading-none"
            aria-hidden="true"
            title="Finish line"
          >
            🚩
          </span>

          {/* Mascot walks along the track */}
          <div
            className="absolute bottom-0.5 transition-[left] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              left: `clamp(30px, ${pct * 100}%, calc(100% - 34px))`,
              transform: 'translateX(-50%)',
            }}
          >
            <Mascot
              mood={mood}
              excitement={excitement}
              missedToday={active}
              walking={total > 0}
              reaction={reaction}
              equipped={equipped}
              size={62}
            />
          </div>
        </div>

        {/* Streak / unfinished progress */}
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="flex gap-1" role="img" aria-label={caption}>
            {pips}
          </span>
          <span className="truncate text-[10px] font-bold text-slate-400 dark:text-slate-500">
            {caption}
          </span>
        </div>

        {/* Gadget wardrobe — click a chip to equip / unequip */}
        <div className="mt-2 flex items-center gap-2 border-t border-slate-100 pt-2 dark:border-slate-700/50">
          <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-300 dark:text-slate-600">
            Gear
          </span>
          <div className="flex flex-1 flex-wrap items-center gap-1.5">
            {stripItems.map((g) => {
              const isStreakItem = g.kind === 'streak';
              const isOwned = isStreakItem ? streak >= (g.level ?? 0) : owned.includes(g.id);
              const isWorn = isOwned && equipped.includes(g.id);
              const title = isOwned
                ? `${g.name} — click to ${isWorn ? 'unequip' : 'equip'}`
                : isStreakItem
                  ? `${g.name} · unlock at a ${g.level}-day streak`
                  : `${g.name} · buy it in the shop with coins`;
              return (
                <button
                  key={g.id}
                  onClick={() => onToggleEquip(g.id)}
                  title={title}
                  aria-label={title}
                  className={cn(
                    'relative rounded-full px-1.5 pb-1 pt-0.5 text-sm leading-none transition-all duration-300',
                    isWorn
                      ? 'bg-amber-50 shadow-sm ring-1 ring-amber-200 dark:bg-amber-500/10 dark:ring-amber-500/30'
                      : isOwned
                        ? 'hover:bg-slate-50 dark:hover:bg-slate-700/40'
                        : 'cursor-not-allowed opacity-25 grayscale'
                  )}
                >
                  {g.icon}
                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full transition-opacity',
                      isWorn ? 'bg-amber-400 opacity-100' : 'opacity-0'
                    )}
                  />
                </button>
              );
            })}

            {/* Open the shop */}
            <button
              onClick={onOpenShop}
              title="Browse the coin shop"
              className="ml-auto flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-2.5 py-1 text-[10px] font-extrabold text-white shadow-sm transition-transform hover:scale-105"
            >
              🛒 Shop
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
