import { useState } from 'react';
import { cn } from '@/utils/cn';
import { Suggestion } from '@/types/task';

interface SuggestedTasksProps {
  suggestions: Suggestion[];
  onAdd: (text: string) => void;
  onRemove: (text: string) => void;
}

const VISIBLE_LIMIT = 8;

export default function SuggestedTasks({ suggestions, onAdd, onRemove }: SuggestedTasksProps) {
  const [expanded, setExpanded] = useState(false);

  if (suggestions.length === 0) return null;

  const carriedOver = suggestions.filter((s) => s.carriedOver);
  const visible = expanded ? suggestions : suggestions.slice(0, VISIBLE_LIMIT);
  const hiddenCount = suggestions.length - visible.length;

  return (
    <section
      aria-label="Suggested tasks"
      className="animate-fade-in rounded-2xl border border-slate-200/80 bg-white/70 p-4 shadow-sm backdrop-blur-sm dark:border-slate-700/70 dark:bg-slate-800/50"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <svg className="h-3.5 w-3.5 text-violet-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.5l1.9 5.9H20l-4.95 3.6 1.9 5.9L12 14.3l-4.95 3.6 1.9-5.9L4 8.4h6.1z" />
          </svg>
          Suggested for today
        </h2>

        {carriedOver.length > 0 && (
          <button
            onClick={() => carriedOver.forEach((s) => onAdd(s.text))}
            className="shrink-0 rounded-lg bg-amber-50 px-2 py-1 text-[10px] font-extrabold text-amber-600 transition-colors hover:bg-amber-100 dark:bg-amber-500/15 dark:text-amber-400 dark:hover:bg-amber-500/25"
          >
            + Add {carriedOver.length} unfinished
          </button>
        )}
      </div>

      <ul className="flex flex-wrap gap-2">
        {visible.map((s, index) => {
          const rate =
            s.useCount > 0 ? Math.round((s.completedCount / s.useCount) * 100) : 0;
          return (
            <li
              key={s.text}
              style={{ animationDelay: `${Math.min(index, 12) * 30}ms` }}
              className="animate-fade-in-scale group/chip relative"
            >
              <button
                onClick={() => onAdd(s.text)}
                title={
                  s.carriedOver
                    ? 'Left unfinished — tap to carry it over'
                    : `Used on ${s.useCount} day${s.useCount === 1 ? '' : 's'} · ${rate}% completion`
                }
                className={cn(
                  'flex items-center gap-1.5 rounded-full border py-1.5 pl-2.5 pr-3 text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95',
                  s.carriedOver
                    ? 'border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 dark:border-amber-500/40 dark:from-amber-500/10 dark:to-orange-500/10 dark:text-amber-300'
                    : s.pinned
                      ? 'border-violet-200 bg-violet-50/70 text-violet-600 hover:border-violet-300 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:text-violet-600 dark:border-slate-600 dark:bg-slate-700/60 dark:text-slate-300 dark:hover:border-violet-500 dark:hover:text-violet-300'
                )}
              >
                {s.carriedOver ? (
                  <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                  </svg>
                ) : s.pinned ? (
                  <svg className="h-3 w-3 shrink-0 opacity-70" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 3v6l2 3v2h-5v7h-2v-7H6v-2l2-3V3z" />
                  </svg>
                ) : (
                  <svg className="h-3 w-3 shrink-0 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                )}

                <span className="max-w-[12rem] truncate">{s.text}</span>

                {s.useCount > 1 && (
                  <span className="rounded-full bg-black/5 px-1.5 text-[9px] font-extrabold dark:bg-white/10">
                    {s.useCount}×
                  </span>
                )}
              </button>

              <button
                onClick={() => onRemove(s.text)}
                aria-label={`Remove "${s.text}" from suggestions`}
                className="absolute -right-1 -top-1 flex h-4 w-4 scale-0 items-center justify-center rounded-full bg-slate-400 text-white opacity-0 shadow transition-all duration-150 hover:bg-rose-500 group-hover/chip:scale-100 group-hover/chip:opacity-100 group-focus-within/chip:scale-100 group-focus-within/chip:opacity-100 dark:bg-slate-500"
              >
                <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </li>
          );
        })}
      </ul>

      {(hiddenCount > 0 || expanded) && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 text-[11px] font-bold text-slate-400 transition-colors hover:text-violet-500 dark:text-slate-500 dark:hover:text-violet-400"
        >
          {expanded ? '− Show fewer' : `+ Show ${hiddenCount} more`}
        </button>
      )}
    </section>
  );
}
