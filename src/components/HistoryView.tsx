import { useState } from 'react';
import { cn } from '@/utils/cn';
import ProgressRing, { ringColor } from './ProgressRing';
import { DaySnapshot } from '@/types/task';
import { formatDateLabel, formatShortDate } from '@/utils/date';

interface HistoryViewProps {
  history: DaySnapshot[];
  stats: {
    daysTracked: number;
    doneAllTime: number;
    totalAllTime: number;
    avgRate: number;
    streak: number;
  };
  onClearHistory: () => void;
}

function StatCard({
  value,
  label,
  accent,
  index,
}: {
  value: string | number;
  label: string;
  accent: string;
  index: number;
}) {
  return (
    <div
      style={{ animationDelay: `${index * 60}ms` }}
      className="animate-fade-in-scale flex flex-col items-center rounded-2xl border border-slate-200/80 bg-white/80 px-2 py-3.5 shadow-sm backdrop-blur-sm dark:border-slate-700/70 dark:bg-slate-800/60"
    >
      <span className={cn('text-xl font-extrabold', accent)}>{value}</span>
      <span className="mt-0.5 text-center text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        {label}
      </span>
    </div>
  );
}

/** Small bar chart of completion rate over the most recent days. */
function MiniChart({ history }: { history: DaySnapshot[] }) {
  const recent = history.slice(0, 14).reverse();
  if (recent.length < 2) return null;

  return (
    <div className="animate-fade-in rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:border-slate-700/70 dark:bg-slate-800/60">
      <h3 className="mb-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Completion trend
      </h3>
      <div className="flex h-20 items-end justify-between gap-1">
        {recent.map((day, i) => {
          const done = day.tasks.filter((t) => t.completed).length;
          const percent = day.tasks.length
            ? Math.round((done / day.tasks.length) * 100)
            : 0;
          return (
            <div key={`${day.date}-${i}`} className="group/bar flex flex-1 flex-col items-center gap-1">
              <div className="relative flex h-16 w-full items-end justify-center">
                <div
                  title={`${formatShortDate(day.date)} — ${percent}%`}
                  className="w-full max-w-[1.35rem] rounded-t-md transition-all duration-500 ease-out group-hover/bar:opacity-80"
                  style={{
                    height: `${Math.max(percent, 4)}%`,
                    backgroundColor: ringColor(percent),
                    animationDelay: `${i * 40}ms`,
                  }}
                />
              </div>
              <span className="text-[8px] font-bold text-slate-300 dark:text-slate-600">
                {formatShortDate(day.date).split(' ')[1]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function HistoryView({ history, stats, onClearHistory }: HistoryViewProps) {
  const [openDays, setOpenDays] = useState<Set<string>>(
    () => new Set(history.slice(0, 2).map((d) => d.date))
  );

  const toggleDay = (date: string) =>
    setOpenDays((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });

  if (history.length === 0) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/40 py-16 text-center dark:border-slate-700 dark:bg-slate-800/30">
        <div className="animate-float mb-4 text-5xl" aria-hidden="true">📅</div>
        <h3 className="mb-1 text-base font-extrabold text-slate-600 dark:text-slate-300">
          No history yet
        </h3>
        <p className="max-w-[18rem] text-xs font-medium leading-relaxed text-slate-400 dark:text-slate-500">
          Your daily snapshots will appear here. The list refreshes automatically
          each new day, keeping a record of what you finished.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-view-fade space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        <StatCard index={0} value={stats.daysTracked} label="Days" accent="text-violet-500" />
        <StatCard index={1} value={stats.doneAllTime} label="Done" accent="text-emerald-500" />
        <StatCard index={2} value={`${stats.avgRate}%`} label="Avg rate" accent="text-indigo-500" />
        <StatCard index={3} value={`🔥${stats.streak}`} label="Streak" accent="text-amber-500" />
      </div>

      <MiniChart history={history} />

      {/* Timeline */}
      <div className="space-y-2.5">
        {history.map((day, index) => {
          const completed = day.tasks.filter((t) => t.completed);
          const pending = day.tasks.filter((t) => !t.completed);
          const percent = day.tasks.length
            ? Math.round((completed.length / day.tasks.length) * 100)
            : 0;
          const isOpen = openDays.has(day.date);

          return (
            <div
              key={`${day.date}-${index}`}
              style={{ animationDelay: `${Math.min(index, 10) * 60}ms` }}
              className="animate-slide-in-right overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 shadow-sm backdrop-blur-sm transition-shadow duration-200 hover:shadow-md dark:border-slate-700/70 dark:bg-slate-800/60"
            >
              <button
                onClick={() => toggleDay(day.date)}
                aria-expanded={isOpen}
                className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-700/30"
              >
                <ProgressRing percent={percent} size={46} stroke={4} />

                <div className="min-w-0 flex-1">
                  <h4 className="truncate font-extrabold text-slate-700 dark:text-slate-100">
                    {formatDateLabel(day.date)}
                  </h4>
                  <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                    {completed.length} of {day.tasks.length} completed
                    {pending.length > 0 && ` · ${pending.length} missed`}
                  </p>
                </div>

                <svg
                  className={cn(
                    'h-4 w-4 shrink-0 text-slate-300 transition-transform duration-300 dark:text-slate-600',
                    isOpen && 'rotate-180'
                  )}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {isOpen && (
                <ul className="animate-fade-in space-y-1.5 border-t border-slate-100 px-4 py-3 dark:border-slate-700/50">
                  {completed.map((task, i) => (
                    <li key={`d-${i}`} className="flex items-start gap-2 text-xs">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20">
                        <svg className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                      <span className="font-medium text-slate-400 line-through decoration-slate-300 dark:text-slate-500 dark:decoration-slate-600">
                        {task.text}
                      </span>
                    </li>
                  ))}
                  {pending.map((task, i) => (
                    <li key={`p-${i}`} className="flex items-start gap-2 text-xs">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-500/20">
                        <svg className="h-2.5 w-2.5 text-rose-500 dark:text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </span>
                      <span className="font-semibold text-slate-600 dark:text-slate-300">
                        {task.text}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={onClearHistory}
        className="mx-auto block text-[11px] font-bold text-slate-300 transition-colors hover:text-rose-400 dark:text-slate-600 dark:hover:text-rose-400"
      >
        Clear all history
      </button>
    </div>
  );
}
