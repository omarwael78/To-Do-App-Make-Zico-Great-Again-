import { cn } from '@/utils/cn';
import { Toast } from '@/hooks/useToasts';

interface ToastStackProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

const ICONS: Record<Toast['kind'], React.ReactNode> = {
  success: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  info: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  ),
  error: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M15 9l-6 6M9 9l6 6" />
    </svg>
  ),
};

const TONES: Record<Toast['kind'], string> = {
  success: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/15 dark:text-emerald-400',
  info: 'text-violet-500 bg-violet-50 dark:bg-violet-500/15 dark:text-violet-400',
  error: 'text-rose-500 bg-rose-50 dark:bg-rose-500/15 dark:text-rose-400',
};

export default function ToastStack({ toasts, onDismiss }: ToastStackProps) {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex flex-col items-center gap-2 px-4"
      role="status"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="animate-toast-in pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 shadow-xl shadow-slate-900/10 backdrop-blur-md dark:border-slate-700/70 dark:bg-slate-800/90 dark:shadow-black/40"
        >
          <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-full', TONES[toast.kind])}>
            {ICONS[toast.kind]}
          </span>

          <p className="flex-1 truncate text-sm font-semibold text-slate-700 dark:text-slate-100">
            {toast.message}
          </p>

          {toast.action && (
            <button
              onClick={() => {
                toast.action?.onClick();
                onDismiss(toast.id);
              }}
              className="shrink-0 rounded-lg bg-violet-100 px-2.5 py-1 text-xs font-bold text-violet-600 transition-colors hover:bg-violet-200 dark:bg-violet-500/20 dark:text-violet-300 dark:hover:bg-violet-500/30"
            >
              {toast.action.label}
            </button>
          )}

          <button
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss notification"
            className="shrink-0 rounded-lg p-1 text-slate-300 transition-colors hover:text-slate-500 dark:text-slate-500 dark:hover:text-slate-300"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
