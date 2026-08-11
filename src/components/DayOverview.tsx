import ProgressRing from './ProgressRing';

interface DayOverviewProps {
  total: number;
  completed: number;
  onToggleAll: () => void;
}

function message(percent: number, total: number): string {
  if (total === 0) return 'Add a task or pick a suggestion to begin.';
  if (percent === 100) return 'Every task done — brilliant work! 🎉';
  if (percent >= 75) return 'Almost there, keep the momentum going!';
  if (percent >= 40) return "Solid progress — you're over a third in.";
  if (percent > 0) return 'Good start. One task at a time.';
  return "Nothing done yet — pick the easiest one first.";
}

export default function DayOverview({ total, completed, onToggleAll }: DayOverviewProps) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const allDone = total > 0 && completed === total;

  return (
    <section
      aria-label="Today's overview"
      className="animate-fade-in relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:border-slate-700/70 dark:bg-slate-800/60"
    >
      {allDone && (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 via-transparent to-emerald-400/10"
        />
      )}

      <div className="relative flex items-center gap-4">
        <ProgressRing percent={percent} size={56} stroke={5} labelClassName="text-xs" />

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold text-slate-800 dark:text-white">
              {completed}
            </span>
            <span className="text-sm font-bold text-slate-400 dark:text-slate-500">
              / {total} completed
            </span>
            {allDone && <span className="animate-celebrate ml-1 text-lg">🎉</span>}
          </div>
          <p className="mt-0.5 truncate text-xs font-medium text-slate-500 dark:text-slate-400">
            {message(percent, total)}
          </p>
        </div>

        {total > 0 && (
          <button
            onClick={onToggleAll}
            title={allDone ? 'Mark all as pending' : 'Mark all as completed'}
            aria-label={allDone ? 'Mark all as pending' : 'Mark all as completed'}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-300 hover:text-violet-500 hover:shadow-md dark:border-slate-600 dark:bg-slate-700/60 dark:text-slate-400 dark:hover:border-violet-500 dark:hover:text-violet-300"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              {allDone ? (
                <>
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </>
              ) : (
                <>
                  <polyline points="9 11 12 14 22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </>
              )}
            </svg>
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="relative mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700/70">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-400 via-indigo-500 to-violet-500 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ width: `${percent}%` }}
        />
      </div>
    </section>
  );
}
