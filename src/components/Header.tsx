import ThemeToggle from './ThemeToggle';
import { Theme } from '@/types/task';
import { getGreeting } from '@/utils/date';

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
  streak: number;
  coins: number;
}

export default function Header({ theme, onToggleTheme, streak, coins }: HeaderProps) {
  const dayLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="mb-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-violet-500 opacity-40 blur-lg" aria-hidden="true" />
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-indigo-500 to-indigo-600 shadow-lg shadow-violet-500/40">
              <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 11 12 14 22 4" />
                <path d="M21 12v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </div>
          </div>

          <div>
            <h1 className="text-xl font-extrabold leading-tight tracking-tight text-slate-800 dark:text-white sm:text-2xl">
              Make Zico{' '}
              <span className="animate-gradient-pan bg-gradient-to-r from-violet-500 via-indigo-500 to-fuchsia-500 bg-clip-text text-transparent">
                Great Again
              </span>
            </h1>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
              {getGreeting()} · {dayLabel}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
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
