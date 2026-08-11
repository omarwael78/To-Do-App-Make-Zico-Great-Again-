import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/utils/cn';
import Mascot from './Mascot';
import {
  STREAK_GADGETS,
  SHOP_GADGETS,
  RARITY_META,
  type Gadget,
  type GadgetCategory,
} from '@/data/wardrobe';
import {
  MASCOTS,
  getMascotProgress,
  isMascotUnlocked,
  unlockLabel,
} from '@/data/mascots';

interface MascotMetrics {
  tasks: number;
  streak: number;
  perfectDays: number;
  coins: number;
}

interface WardrobeModalProps {
  open: boolean;
  onClose: () => void;
  coins: number;
  owned: string[];
  equipped: string[];
  streak: number;
  mascot: string;
  mascotMetrics: MascotMetrics;
  /** Returns true when the purchase succeeded. */
  onBuy: (id: string) => boolean;
  onToggle: (id: string) => void;
  onWearAll: (wear: boolean) => void;
  onSelectMascot: (id: string) => void;
}

const CATEGORY_LABEL: Record<GadgetCategory, string> = {
  accessory: '🧥 Accessories',
  weapon: '⚔️ Weapons',
  pet: '🐾 Pets',
  effect: '✨ Effects',
};

function isOwned(g: Gadget, streak: number, owned: string[]): boolean {
  return g.kind === 'streak' ? streak >= (g.level ?? 0) : owned.includes(g.id);
}

function ItemRow({
  gadget,
  coins,
  owned,
  equipped,
  streak,
  onBuy,
  onToggle,
}: {
  gadget: Gadget;
  coins: number;
  owned: string[];
  equipped: string[];
  streak: number;
  onBuy: (id: string) => boolean;
  onToggle: (id: string) => void;
}) {
  const isStreakItem = gadget.kind === 'streak';
  const isMine = isOwned(gadget, streak, owned);
  const isWorn = isMine && equipped.includes(gadget.id);
  const rarity = gadget.rarity ? RARITY_META[gadget.rarity] : null;

  return (
    <li
      className={cn(
        'flex items-center gap-3 rounded-xl border bg-white/70 p-3 transition-colors hover:border-violet-300 dark:bg-slate-800/50 dark:hover:border-violet-500/50',
        rarity ? rarity.border : 'border-slate-100 dark:border-slate-700/60'
      )}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-xl dark:bg-slate-700/50">
        {gadget.icon}
      </span>

      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-1.5 text-sm font-extrabold text-slate-700 dark:text-slate-200">
          {gadget.name}
          {rarity && (
            <span
              className={cn(
                'rounded-full px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wide',
                rarity.badge
              )}
            >
              {rarity.label}
            </span>
          )}
          {isWorn && (
            <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
              wearing
            </span>
          )}
        </p>
        <p className="text-[11px] font-medium leading-snug text-slate-400 dark:text-slate-500">
          {gadget.description}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        {!isMine && isStreakItem && (
          <>
            <span className="text-[10px] font-extrabold text-amber-500 dark:text-amber-400">
              🔥 {gadget.level}-day streak
            </span>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
              {streak === 0
                ? 'start a streak to chase it'
                : `unlocks in ${(gadget.level ?? 0) - streak} day${(gadget.level ?? 0) - streak === 1 ? '' : 's'}`}
            </span>
          </>
        )}

        {!isMine && !isStreakItem && (
          <button
            onClick={() => onBuy(gadget.id)}
            disabled={coins < (gadget.price ?? 0)}
            title={
              coins < (gadget.price ?? 0)
                ? 'Not enough coins — complete more tasks!'
                : `Buy for ${gadget.price} coins`
            }
            className="flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-3 py-1 text-[11px] font-extrabold text-white shadow-sm transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 dark:disabled:from-slate-600 dark:disabled:to-slate-600 dark:disabled:text-slate-400"
          >
            🪙 {gadget.price}
          </button>
        )}

        {isMine && (
          <button
            onClick={() => onToggle(gadget.id)}
            className={cn(
              'rounded-full px-3 py-1 text-[11px] font-extrabold transition-colors',
              isWorn
                ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-400 dark:hover:bg-emerald-500/25'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-700/60 dark:text-slate-300 dark:hover:bg-slate-600/60'
            )}
          >
            {isWorn ? 'Equipped' : 'Equip'}
          </button>
        )}
      </div>
    </li>
  );
}

export default function WardrobeModal({
  open,
  onClose,
  coins,
  owned,
  equipped,
  streak,
  mascot,
  mascotMetrics,
  onBuy,
  onToggle,
  onWearAll,
  onSelectMascot,
}: WardrobeModalProps) {
  const [tab, setTab] = useState<'streak' | 'shop' | 'mascots'>('streak');

  // Accessibility while open: lock body scroll, move focus in, trap Tab
  // inside the dialog, restore focus (and scrolling) when it closes.
  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    const focusables = () =>
      Array.from(
        dialog?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) ?? []
      ).filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null);

    const first = focusables()[0];
    if (dialog && !dialog.contains(document.activeElement)) {
      (first ?? dialog).focus();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const items = focusables();
      if (items.length === 0) return;
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      const active = document.activeElement as HTMLElement | null;
      const isInside = dialog?.contains(active);
      if (e.shiftKey) {
        if (!isInside || active === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else if (!isInside || active === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  const ownedSet = useMemo(() => new Set(owned), [owned]);

  const allOwnedWorn = useMemo(() => {
    const ownedIds = [
      ...STREAK_GADGETS.filter((g) => streak >= (g.level ?? 0)).map((g) => g.id),
      ...owned,
    ];
    return (
      ownedIds.length > 0 && ownedIds.every((id) => equipped.includes(id))
    );
  }, [owned, equipped, streak]);

  if (!open) return null;

  const shopSections: GadgetCategory[] = ['accessory', 'weapon', 'pet', 'effect'];

  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Wardrobe and shop"
    >
      <div
        ref={dialogRef}
        className="animate-fade-in-scale flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl dark:bg-slate-900 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-700/60">
          <h2 className="text-sm font-extrabold text-slate-800 dark:text-white">
            Zico's Wardrobe 🧥
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onWearAll(!allOwnedWorn)}
              title={allOwnedWorn ? 'Take all owned items off' : 'Equip everything you own'}
              className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-extrabold text-slate-500 transition-colors hover:bg-slate-200 dark:bg-slate-700/60 dark:text-slate-300 dark:hover:bg-slate-600/60"
            >
              {allOwnedWorn ? 'Take all off' : 'Wear all'}
            </button>
            <span
              key={coins}
              className="animate-pop flex items-center gap-1 rounded-full border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-2.5 py-1 text-[11px] font-extrabold text-amber-600 dark:border-amber-500/30 dark:from-amber-500/10 dark:to-orange-500/10 dark:text-amber-400"
            >
              🪙 {coins}
            </span>
            <button
              onClick={onClose}
              aria-label="Close wardrobe"
              className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Live preview */}
        <div className="flex items-center justify-center gap-4 border-b border-slate-100 bg-gradient-to-br from-violet-50 via-white to-amber-50 py-3 dark:border-slate-700/60 dark:from-slate-800/80 dark:via-slate-900 dark:to-amber-950/20">
          <Mascot mood="happy" excitement={2} equipped={equipped} skin={mascot} size={104} />
          <div className="max-w-[180px]">
            <p className="text-xs font-extrabold text-slate-700 dark:text-slate-200">
              Dressing room 👔
            </p>
            <p className="mt-0.5 text-[11px] font-medium leading-snug text-slate-400 dark:text-slate-500">
              Every change below shows up on your mascot instantly.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-slate-100 px-5 pt-3 dark:border-slate-700/60">
          {(
            [
              { id: 'streak', label: '⭐ Streak gear' },
              { id: 'shop', label: '🛒 Shop' },
              { id: 'mascots', label: '🎭 Mascots' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'rounded-t-lg px-3 py-2 text-xs font-extrabold transition-colors',
                tab === t.id
                  ? 'border-b-2 border-violet-500 text-violet-600 dark:text-violet-400'
                  : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Item list */}
        <div className="max-h-[46vh] flex-1 overflow-y-auto p-5">
          {tab === 'mascots' ? (
            <div className="grid grid-cols-2 gap-3">
              {MASCOTS.map((m) => {
                const unlocked = isMascotUnlocked(m, mascotMetrics);
                const progress = getMascotProgress(m, mascotMetrics);
                const isCurrent = m.id === mascot;
                return (
                  <div
                    key={m.id}
                    className={cn(
                      'flex flex-col items-center rounded-2xl border p-4 text-center transition-colors',
                      isCurrent
                        ? 'border-violet-400 bg-violet-50 dark:border-violet-500/60 dark:bg-violet-500/10'
                        : 'border-slate-100 bg-white/70 dark:border-slate-700/60 dark:bg-slate-800/50'
                    )}
                  >
                    <div className={cn('relative', !unlocked && 'opacity-70 grayscale')}>
                      <Mascot mood="happy" excitement={1} equipped={equipped} skin={m.id} size={72} />
                      {!unlocked && (
                        <span
                          aria-hidden="true"
                          className="absolute inset-0 flex items-center justify-center text-2xl drop-shadow"
                        >
                          🔒
                        </span>
                      )}
                    </div>
                    <p className="mt-2 flex flex-wrap items-center justify-center gap-1 text-sm font-extrabold text-slate-700 dark:text-slate-200">
                      <span aria-hidden="true">{m.emoji}</span>
                      {m.name}
                      {isCurrent && (
                        <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wide text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                          active
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 min-h-[2rem] text-[10px] font-medium leading-snug text-slate-400 dark:text-slate-500">
                      {m.tagline}
                    </p>
                    {unlocked ? (
                      <button
                        onClick={() => onSelectMascot(m.id)}
                        disabled={isCurrent}
                        className={cn(
                          'mt-3 rounded-full px-3 py-1 text-[11px] font-extrabold transition-transform',
                          isCurrent
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400'
                            : 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-sm hover:scale-105'
                        )}
                      >
                        {isCurrent ? 'Playing as' : 'Select'}
                      </button>
                    ) : (
                      <div className="mt-3 w-full">
                        <div className="flex items-center justify-between gap-1 text-[9px] font-extrabold text-slate-400 dark:text-slate-500">
                          <span className="truncate">{unlockLabel(m.unlock)}</span>
                          <span className="shrink-0">{Math.round(progress * 100)}%</span>
                        </div>
                        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-500 transition-all duration-500"
                            style={{ width: `${progress * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : tab === 'streak' ? (
            <ul className="space-y-2">
              {STREAK_GADGETS.map((g) => (
                <ItemRow
                  key={g.id}
                  gadget={g}
                  coins={coins}
                  owned={owned}
                  equipped={equipped}
                  streak={streak}
                  onBuy={onBuy}
                  onToggle={onToggle}
                />
              ))}
            </ul>
          ) : (
            <div className="space-y-4">
              {shopSections.map((cat) => {
                const items = SHOP_GADGETS.filter((g) => g.category === cat);
                const ownedCount = items.filter((g) => ownedSet.has(g.id)).length;
                return (
                  <section key={cat}>
                    <h3 className="mb-2 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      <span>{CATEGORY_LABEL[cat]}</span>
                      <span className="font-bold normal-case">
                        {ownedCount}/{items.length} owned
                      </span>
                    </h3>
                    <ul className="space-y-2">
                      {items.map((g) => (
                        <ItemRow
                          key={g.id}
                          gadget={g}
                          coins={coins}
                          owned={owned}
                          equipped={equipped}
                          streak={streak}
                          onBuy={onBuy}
                          onToggle={onToggle}
                        />
                      ))}
                    </ul>
                  </section>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <p className="border-t border-slate-100 px-5 py-3 text-center text-[10px] font-medium text-slate-400 dark:border-slate-700/60 dark:text-slate-500">
          Complete tasks to earn 🪙 coins — 1 per task, plus bonuses for a perfect day. Streak gear unlocks at 5-day milestones.
        </p>
      </div>
    </div>
  );
}
