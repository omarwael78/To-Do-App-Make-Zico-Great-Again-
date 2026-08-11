import { FilterType } from '@/types/task';

interface EmptyStateProps {
  filter: FilterType;
  onShowAll: () => void;
}

const MESSAGES: Record<FilterType, { icon: string; title: string; subtitle: string }> = {
  all: {
    icon: '📝',
    title: 'Your day is a blank canvas',
    subtitle: 'Add a task above, or tap one of the suggestions to get started.',
  },
  active: {
    icon: '🎉',
    title: 'All caught up!',
    subtitle: "Nothing pending — you've cleared everything on your list.",
  },
  completed: {
    icon: '🚀',
    title: 'Nothing completed yet',
    subtitle: 'Tick something off and it will appear here.',
  },
};

export default function EmptyState({ filter, onShowAll }: EmptyStateProps) {
  const { icon, title, subtitle } = MESSAGES[filter];

  return (
    <div className="animate-fade-in flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/40 py-12 text-center dark:border-slate-700 dark:bg-slate-800/30">
      <div className="animate-float mb-4 text-5xl" aria-hidden="true">
        {icon}
      </div>
      <h3 className="mb-1 text-base font-extrabold text-slate-600 dark:text-slate-300">
        {title}
      </h3>
      <p className="max-w-[16rem] text-xs font-medium leading-relaxed text-slate-400 dark:text-slate-500">
        {subtitle}
      </p>

      {filter !== 'all' && (
        <button
          onClick={onShowAll}
          className="mt-4 rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-600 transition-colors hover:bg-violet-100 dark:bg-violet-500/15 dark:text-violet-300 dark:hover:bg-violet-500/25"
        >
          View all tasks
        </button>
      )}
    </div>
  );
}
