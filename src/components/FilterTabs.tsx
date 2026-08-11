import { cn } from '@/utils/cn';
import { FilterType } from '@/types/task';

interface FilterTabsProps {
  current: FilterType;
  onChange: (filter: FilterType) => void;
  counts: { all: number; active: number; completed: number };
}

const TABS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Done' },
];

export default function FilterTabs({ current, onChange, counts }: FilterTabsProps) {
  const index = TABS.findIndex((t) => t.key === current);

  return (
    <div
      role="tablist"
      aria-label="Filter tasks"
      className="relative flex rounded-xl border border-slate-200/70 bg-slate-100/80 p-1 backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-800/70"
    >
      {/* Sliding indicator */}
      <span
        aria-hidden="true"
        className="absolute inset-y-1 w-[calc((100%-0.5rem)/3)] rounded-lg bg-white shadow-sm transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] dark:bg-slate-700"
        style={{ transform: `translateX(calc(${index} * 100%))`, left: '0.25rem' }}
      />

      {TABS.map(({ key, label }) => {
        const active = current === key;
        return (
          <button
            key={key}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(key)}
            className={cn(
              'relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[11px] font-extrabold uppercase tracking-wider transition-colors duration-300',
              active
                ? 'text-violet-600 dark:text-violet-300'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            )}
          >
            {label}
            <span
              className={cn(
                'inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full px-1 text-[10px] font-extrabold transition-colors duration-300',
                active
                  ? 'bg-violet-100 text-violet-600 dark:bg-violet-500/25 dark:text-violet-300'
                  : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
              )}
            >
              {counts[key]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
