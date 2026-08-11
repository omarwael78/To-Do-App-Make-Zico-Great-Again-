import { cn } from '@/utils/cn';
import { ViewType } from '@/types/task';

interface ViewSwitcherProps {
  current: ViewType;
  onChange: (view: ViewType) => void;
  historyCount: number;
}

const VIEWS: { key: ViewType; label: string; icon: React.ReactNode }[] = [
  {
    key: 'today',
    label: 'Today',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    key: 'history',
    label: 'History',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v5h5" />
        <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
        <path d="M12 7v5l4 2" />
      </svg>
    ),
  },
];

export default function ViewSwitcher({ current, onChange, historyCount }: ViewSwitcherProps) {
  return (
    <div
      role="tablist"
      aria-label="Views"
      className="relative flex rounded-2xl border border-slate-200/80 bg-white/80 p-1 shadow-sm backdrop-blur-sm dark:border-slate-700/70 dark:bg-slate-800/70"
    >
      {/* Sliding highlight */}
      <span
        aria-hidden="true"
        className={cn(
          'absolute inset-y-1 w-[calc(50%-0.25rem)] rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 shadow-lg shadow-violet-500/30 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
          current === 'today' ? 'left-1' : 'left-[calc(50%+0.25rem)]'
        )}
      />
      {VIEWS.map(({ key, label, icon }) => {
        const active = current === key;
        return (
          <button
            key={key}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(key)}
            className={cn(
              'relative z-10 flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-colors duration-300',
              active
                ? 'text-white'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            )}
          >
            {icon}
            {label}
            {key === 'history' && historyCount > 0 && (
              <span
                className={cn(
                  'rounded-full px-1.5 text-[10px] font-extrabold transition-colors duration-300',
                  active
                    ? 'bg-white/25 text-white'
                    : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                )}
              >
                {historyCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
