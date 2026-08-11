import ThemeToggle from './ThemeToggle';
import { Theme } from '@/types/task';
import { getGreeting } from '@/utils/date';

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
  streak: number;
  coins: number;
  muted: boolean;
  onToggleSound: () => void;
}

export default function Header({
  theme,
  onToggleTheme,
  streak,
  coins,
  muted,
  onToggleSound,
}: HeaderProps) {
  const dayLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="mb-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {/* Logo */}
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-2xl bg-violet-500 opacity-40 blur-lg" aria-hidden="true" />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-indigo-500 to-indigo-600 shadow-lg shadow-violet-500/40">
              <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 11 12 14 22 4" />
                <path d="M21 12v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </div>
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-xl font-extrabold leading-tight tracking-tight sm:text-2xl">
              <span className="animate-gradient-pan bg-gradient-to-r from-violet-500 via-fuchsia-500 to-amber-500 bg-clip-text text-transparent">
                Make Zico Great Again
              </span>
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-extrabold text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
                👋 {getGreeting()}
              </span>
              <span aria-hidden="true" className="text-[10px] font-bold text-slate-300 dark:text-slate-600">
                •
              </span>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                {dayLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={onToggleSound}
              title={muted ? 'Unmute sounds' : 'Mute sounds'}
              aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white/70 text-sm shadow-sm transition-colors hover:border-violet-300 dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-violet-500/50"
            >
              {muted ? '🔇' : '🔊'}
            </button>
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          </div>
          <div className="flex items-center gap-1.5">
            {streak > 0 && (
              <span
                title={`${streak} consecutive productive day${streak === 1 ? '' : 's'}`}
                className="animate-fade-in-scale flex items-center gap-1 rounded-full border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-2.5 py-1 text-[11px] font-extrabold text-amber-600 shadow-sm dark:border-amber-500/30 dark:from-amber-500/10 dark:to-orange-500/10 dark:text-amber-400"
              >
                <span className="animate-flame">🔥</span>
                {streak} day{streak === 1 ? '' : 's'}
              </span>
            )}
            <span
              key={coins}
              title="Coins — earn 1 per completed task"
              className="animate-pop flex items-center gap-1 rounded-full border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-2.5 py-1 text-[11px] font-extrabold text-amber-600 shadow-sm dark:border-amber-500/30 dark:from-amber-500/10 dark:to-orange-500/10 dark:text-amber-400"
            >
              🪙 {coins}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
