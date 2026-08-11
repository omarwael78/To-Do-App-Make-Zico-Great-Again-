import { useState, useCallback, useRef, useEffect } from 'react';

export type ToastKind = 'success' | 'info' | 'error';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface Toast {
  id: string;
  message: string;
  kind: ToastKind;
  action?: ToastAction;
}

const DURATION = 4200;

export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, number>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const notify = useCallback(
    (message: string, kind: ToastKind = 'success', action?: ToastAction) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev.slice(-2), { id, message, kind, action }]);
      const timer = window.setTimeout(() => dismiss(id), DURATION);
      timers.current.set(id, timer);
      return id;
    },
    [dismiss]
  );

  // Clean up any pending timers on unmount.
  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach((t) => window.clearTimeout(t));
      map.clear();
    };
  }, []);

  return { toasts, notify, dismiss };
}
