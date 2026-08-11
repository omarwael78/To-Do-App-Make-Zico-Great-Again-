import { cn } from '@/utils/cn';
import { Theme } from '@/types/task';

interface ThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
}

/**
 * An animated sliding pill toggle that morphs a sun (light) into a
 * moon (dark) with twinkling stars and color-shifting background.
 */
export default function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const isDark = theme === 'dark';

  return (
    <button
      onClick={onToggle}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'relative h-10 w-[5.25rem] overflow-hidden rounded-full border transition-colors duration-500',
        isDark
          ? 'border-indigo-400/30 bg-gradient-to-r from-indigo-900 to-slate-900'
          : 'border-amber-300/40 bg-gradient-to-r from-sky-300 to-amber-200'
      )}
    >
      {/* Twinkling stars (visible in dark mode) */}
      <span
        className={cn(
          'absolute left-2 top-1.5 h-1 w-1 rounded-full bg-white transition-opacity duration-500',
          isDark ? 'animate-twinkle opacity-100' : 'opacity-0'
        )}
        style={{ animationDelay: '0.3s' }}
      />
      <span
        className={cn(
          'absolute left-7 top-3 h-0.5 w-0.5 rounded-full bg-white transition-opacity duration-500',
          isDark ? 'animate-twinkle opacity-100' : 'opacity-0'
        )}
        style={{ animationDelay: '1.1s' }}
      />
      <span
        className={cn(
          'absolute left-4 top-5 h-1 w-1 rounded-full bg-white transition-opacity duration-500',
          isDark ? 'animate-twinkle opacity-100' : 'opacity-0'
        )}
        style={{ animationDelay: '0.7s' }}
      />

      {/* Sliding knob */}
      <span
        className={cn(
          'absolute top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full shadow-lg transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
          isDark
            ? 'left-[2.45rem] bg-gradient-to-br from-slate-100 to-slate-300'
            : 'left-1 bg-gradient-to-br from-yellow-300 to-amber-400'
        )}
      >
        {/* Sun icon */}
        <svg
          className={cn(
            'absolute h-4 w-4 text-amber-700 transition-all duration-300',
            isDark ? 'scale-0 -rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100'
          )}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
        {/* Moon icon */}
        <svg
          className={cn(
            'absolute h-4 w-4 text-slate-800 transition-all duration-300',
            isDark ? 'scale-100 rotate-0 opacity-100' : 'scale-0 rotate-90 opacity-0'
          )}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </span>
    </button>
  );
}
