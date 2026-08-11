import { FilterType, Mood } from '@/types/task';
import Mascot from '@/components/Mascot';

interface EmptyStateProps {
  filter: FilterType;
  mood: Mood;
  equipped: string[];
  onShowAll: () => void;
}

const MESSAGES: Record<FilterType, { title: string; subtitle: string }> = {
  all: {
    title: 'Your day is a blank canvas',
    subtitle: 'Add a task above, or tap one of the suggestions to get started.',
  },
  active: {
    title: 'All caught up!',
    subtitle: "Nothing pending — you've cleared everything on your list.",
  },
  completed: {
    title: 'Nothing completed yet',
    subtitle: 'Tick something off and it will appear here.',
  },
};

const FILTER_MOOD: Record<FilterType, Mood> = {
  all: 'neutral',
  active: 'happy',
  completed: 'sad',
};

export default function EmptyState({
  filter,
  mood,
  equipped,
  onShowAll,
}: EmptyStateProps) {
  const { title, subtitle } = MESSAGES[filter];
  const faceMood = filter === 'all' ? mood : FILTER_MOOD[filter];

  return (
    <div className="animate-fade-in flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/40 py-12 text-center dark:border-slate-700 dark:bg-slate-800/30">
      <div className="animate-float mb-3" aria-hidden="true">
        <Mascot mood={faceMood} excitement={0} equipped={equipped} size={64} />
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
