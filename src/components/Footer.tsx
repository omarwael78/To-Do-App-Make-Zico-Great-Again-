import { useRef } from 'react';
import { cn } from '@/utils/cn';

interface FooterProps {
  onReset: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  unlockAll: boolean;
  onToggleUnlockAll: () => void;
}

export default function Footer({ onReset, onExport, onImport, unlockAll, onToggleUnlockAll }: FooterProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onImport(file);
    e.target.value = '';
  };

  return (
    <footer className="mt-14 space-y-4 pb-4 text-center">
      {/* Auto-save indicator */}
      <p className="flex flex-wrap items-center justify-center gap-1.5 text-[11px] font-medium text-slate-400 dark:text-slate-500">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
        </span>
        Auto-saved · defaults from
        <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[10px] text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          src/data/taskflow.json
        </code>
      </p>

      {/* Backup & reset actions */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <button
          onClick={onToggleUnlockAll}
          title="Testing only — unlocks every mascot, owns and wears all gear, tops up coins"
          className={cn(
            'rounded-full border px-3 py-1 text-[11px] font-extrabold transition-transform hover:scale-105',
            unlockAll
              ? 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-400'
              : 'border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-600 dark:border-amber-500/30 dark:from-amber-500/10 dark:to-orange-500/10 dark:text-amber-400'
          )}
        >
          {unlockAll ? '🔒 Relock (test off)' : '🧪 Unlock all (test)'}
        </button>

        <button
          onClick={onExport}
          className="flex items-center gap-1 text-[11px] font-bold text-slate-400 transition-colors hover:text-violet-500 dark:text-slate-500 dark:hover:text-violet-400"
        >
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export backup
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1 text-[11px] font-bold text-slate-400 transition-colors hover:text-violet-500 dark:text-slate-500 dark:hover:text-violet-400"
        >
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Import backup
        </button>

        <button
          onClick={onReset}
          className="text-[11px] font-semibold text-slate-300 transition-colors hover:text-rose-400 dark:text-slate-600 dark:hover:text-rose-400"
        >
          Reset to project defaults
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        onChange={handleFile}
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* Divider */}
      <div className="mx-auto h-px w-24 bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-700" />

      {/* Copyright */}
      <div className="space-y-1">
        <p className="text-xs font-bold tracking-tight text-slate-500 dark:text-slate-400">
          Make Zico{' '}
          <span className="bg-gradient-to-r from-violet-500 to-indigo-500 bg-clip-text text-transparent">
            Great Again
          </span>{' '}
          · © 2026{' '}
          <span className="bg-gradient-to-r from-violet-500 to-indigo-500 bg-clip-text text-transparent">
            Eng. Omar Wael
          </span>
        </p>
        <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-slate-300 dark:text-slate-600">
          All rights reserved
        </p>
      </div>
    </footer>
  );
}
