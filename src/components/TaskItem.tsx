import { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils/cn';
import { Task } from '@/types/task';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (task: Task) => void;
  onUpdate: (id: string, text: string) => void;
}

function timeLabel(timestamp: number): string {
  const mins = Math.floor((Date.now() - timestamp) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function TaskItem({ task, onToggle, onDelete, onUpdate }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [isLeaving, setIsLeaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) inputRef.current?.select();
  }, [isEditing]);

  const startEdit = () => {
    setEditText(task.text);
    setIsEditing(true);
  };

  const save = () => {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== task.text) onUpdate(task.id, trimmed);
    setIsEditing(false);
  };

  const cancel = () => {
    setEditText(task.text);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') save();
    if (e.key === 'Escape') cancel();
  };

  const handleDelete = () => {
    setIsLeaving(true);
    window.setTimeout(() => onDelete(task), 260);
  };

  return (
    <div
      className={cn(
        'group relative flex items-center gap-3 overflow-hidden rounded-2xl border bg-white px-4 py-3.5 shadow-sm transition-all duration-300 dark:bg-slate-800/70',
        isLeaving && 'animate-slide-out-left',
        task.completed
          ? 'border-slate-100 bg-slate-50/70 dark:border-slate-700/50 dark:bg-slate-800/40'
          : 'border-slate-200/80 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-500/5 dark:border-slate-700/60 dark:hover:border-violet-500/40'
      )}
    >
      {/* Left accent bar */}
      <span
        aria-hidden="true"
        className={cn(
          'absolute inset-y-0 left-0 w-1 rounded-r bg-gradient-to-b transition-opacity duration-300',
          task.completed
            ? 'from-emerald-400 to-emerald-500 opacity-60'
            : 'from-violet-400 to-indigo-500 opacity-0 group-hover:opacity-100'
        )}
      />

      {/* Checkbox */}
      <button
        onClick={() => onToggle(task.id)}
        aria-label={task.completed ? 'Mark as pending' : 'Mark as completed'}
        aria-pressed={task.completed}
        className={cn(
          'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 active:scale-90',
          task.completed
            ? 'animate-pop border-transparent bg-gradient-to-br from-violet-500 to-indigo-500 shadow-md shadow-violet-500/30'
            : 'border-slate-300 hover:scale-110 hover:border-violet-400 dark:border-slate-600 dark:hover:border-violet-400'
        )}
      >
        {task.completed && (
          <svg className="h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
            <polyline className="draw-check" points="20 6 9 17 4 12" />
          </svg>
        )}
      </button>

      {/* Text / editor */}
      <div className="min-w-0 flex-1">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editText}
            maxLength={120}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            aria-label="Edit task text"
            className="w-full rounded-lg border border-violet-300 bg-violet-50/60 px-3 py-1.5 text-sm font-semibold text-slate-700 outline-none ring-2 ring-violet-100 dark:border-violet-500/50 dark:bg-violet-500/10 dark:text-slate-100 dark:ring-violet-500/20"
          />
        ) : (
          <button
            onDoubleClick={startEdit}
            onClick={() => onToggle(task.id)}
            className="block w-full text-left"
            title="Click to toggle · double-click to edit"
          >
            <span
              className={cn(
                'block truncate text-sm font-semibold transition-all duration-300',
                task.completed
                  ? 'text-slate-400 line-through decoration-slate-300 decoration-2 dark:text-slate-500 dark:decoration-slate-600'
                  : 'text-slate-700 dark:text-slate-100'
              )}
            >
              {task.text}
            </span>
            <span className="mt-0.5 block text-[10px] font-medium text-slate-300 dark:text-slate-600">
              {timeLabel(task.createdAt)}
            </span>
          </button>
        )}
      </div>

      {/* Actions */}
      <div
        className={cn(
          'flex shrink-0 items-center gap-1 transition-all duration-200',
          isEditing
            ? 'opacity-100'
            : 'opacity-100 sm:translate-x-1 sm:opacity-0 sm:group-hover:translate-x-0 sm:group-hover:opacity-100 sm:group-focus-within:translate-x-0 sm:group-focus-within:opacity-100'
        )}
      >
        {isEditing ? (
          <>
            <button
              onClick={save}
              aria-label="Save task"
              className="rounded-lg bg-violet-500 p-2 text-white transition-colors hover:bg-violet-600"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </button>
            <button
              onClick={cancel}
              aria-label="Cancel editing"
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={startEdit}
              aria-label={`Edit task: ${task.text}`}
              className="rounded-lg p-2 text-slate-400 transition-all hover:scale-110 hover:bg-violet-50 hover:text-violet-500 dark:hover:bg-violet-500/10 dark:hover:text-violet-400"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button
              onClick={handleDelete}
              aria-label={`Delete task: ${task.text}`}
              className="rounded-lg p-2 text-slate-400 transition-all hover:scale-110 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
