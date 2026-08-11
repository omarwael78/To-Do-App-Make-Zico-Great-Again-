import { useState } from 'react';
import { cn } from '@/utils/cn';

interface AddTaskFormProps {
  onAdd: (text: string) => void;
}

const MAX_LENGTH = 120;

export default function AddTaskForm({ onAdd }: AddTaskFormProps) {
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);

  const hasText = text.trim().length > 0;
  const nearLimit = text.length > MAX_LENGTH - 25;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasText) return;
    onAdd(text.trim());
    setText('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2.5">
      <label htmlFor="task-input" className="sr-only">
        Add a new task
      </label>

      <div
        className={cn(
          'relative flex flex-1 items-center rounded-2xl border bg-white shadow-sm transition-all duration-300 dark:bg-slate-800/80',
          focused
            ? 'border-violet-400 ring-4 ring-violet-100 dark:border-violet-500 dark:ring-violet-500/20'
            : 'border-slate-200 dark:border-slate-700'
        )}
      >
        <svg
          className={cn(
            'pointer-events-none absolute left-4 h-4 w-4 transition-colors duration-300',
            focused ? 'text-violet-500' : 'text-slate-300 dark:text-slate-600'
          )}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>

        <input
          id="task-input"
          type="text"
          value={text}
          maxLength={MAX_LENGTH}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="What needs to be done today?"
          autoComplete="off"
          className="w-full bg-transparent py-3.5 pl-11 pr-16 text-sm font-semibold text-slate-700 outline-none placeholder:font-medium placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
        />

        {/* Keyboard hint / character counter */}
        <span className="pointer-events-none absolute right-3.5 text-[10px] font-bold">
          {hasText ? (
            <span className={nearLimit ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600'}>
              {text.length}/{MAX_LENGTH}
            </span>
          ) : (
            <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-sans text-slate-400 dark:border-slate-600 dark:bg-slate-700/70 dark:text-slate-500">
              /
            </kbd>
          )}
        </span>
      </div>

      <button
        type="submit"
        disabled={!hasText}
        aria-label="Add task"
        className={cn(
          'shine relative flex items-center gap-1.5 overflow-hidden rounded-2xl px-4 text-sm font-bold text-white transition-all duration-300 sm:px-5',
          hasText
            ? 'bg-gradient-to-r from-violet-500 to-indigo-500 shadow-lg shadow-violet-500/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-500/40 active:translate-y-0 active:scale-95'
            : 'cursor-not-allowed bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-500'
        )}
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <span className="hidden sm:inline">Add</span>
      </button>
    </form>
  );
}
