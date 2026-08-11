import { useEffect, useCallback, useMemo, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { getDateString, daysBetween } from '@/utils/date';
import projectData from '@/data/taskflow.json';
import { Task, DaySnapshot, Suggestion, ProjectData, HistoryTask } from '@/types/task';

const TASKS_KEY = 'taskflow-tasks';
const HISTORY_KEY = 'taskflow-history';
const SUGGESTIONS_KEY = 'taskflow-suggestions';
const DATE_KEY = 'taskflow-current-date';
const SEEDED_KEY = 'taskflow-seeded-version';

const data = projectData as ProjectData;
const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/* ---------- factories ---------- */

function makeTask(text: string): Task {
  return { id: crypto.randomUUID(), text, completed: false, createdAt: Date.now() };
}

function routineSuggestions(): Suggestion[] {
  return data.dailyRoutine.map((text) => ({
    text,
    useCount: 0,
    completedCount: 0,
    lastUsed: null,
    pinned: true,
    carriedOver: false,
  }));
}

function initialTasks(): Task[] {
  if (localStorage.getItem(SEEDED_KEY)) return [];
  return data.starterTasks.map(makeTask);
}

function sortHistory(list: DaySnapshot[]): DaySnapshot[] {
  return [...list].sort((a, b) => b.date.localeCompare(a.date));
}

/** Merge two task lists for the same day, preferring "completed". */
function mergeDayTasks(a: HistoryTask[], b: HistoryTask[]): HistoryTask[] {
  const merged = [...a];
  for (const task of b) {
    const i = merged.findIndex((m) => same(m.text, task.text));
    if (i === -1) merged.push(task);
    else merged[i] = { ...merged[i], completed: merged[i].completed || task.completed };
  }
  return merged;
}

/* ---------- hook ---------- */

export function useTaskData() {
  const [tasks, setTasks] = useLocalStorage<Task[]>(TASKS_KEY, initialTasks);
  const [history, setHistory] = useLocalStorage<DaySnapshot[]>(
    HISTORY_KEY,
    () => sortHistory(data.history ?? [])
  );
  const [suggestions, setSuggestions] = useLocalStorage<Suggestion[]>(
    SUGGESTIONS_KEY,
    routineSuggestions
  );
  const [lastDate, setLastDate] = useLocalStorage<string>(DATE_KEY, getDateString);

  /**
   * Mirror of the latest tasks, kept in sync every render so callbacks can
   * read the current list synchronously (avoids side effects inside
   * state updaters, which React may defer or invoke more than once).
   */
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;

  /** Tasks removed by the last "Clear completed" — powers the Undo action. */
  const lastClearedRef = useRef<Task[]>([]);

  /** Archive a day into history and fold its tasks back into suggestions. */
  const archive = useCallback(
    (dateStr: string, dayTasks: Task[]) => {
      if (dayTasks.length === 0) return;
      const snapshot: HistoryTask[] = dayTasks.map((t) => ({
        text: t.text,
        completed: t.completed,
      }));

      setHistory((prev) => {
        const i = prev.findIndex((d) => d.date === dateStr);
        if (i === -1) return sortHistory([{ date: dateStr, tasks: snapshot }, ...prev]);
        const next = [...prev];
        next[i] = { date: dateStr, tasks: mergeDayTasks(prev[i].tasks, snapshot) };
        return sortHistory(next);
      });

      setSuggestions((prev) => {
        const next = prev.map((s) => ({ ...s, carriedOver: false }));
        for (const task of dayTasks) {
          const i = next.findIndex((s) => same(s.text, task.text));
          if (i === -1) {
            next.push({
              text: task.text,
              useCount: 1,
              completedCount: task.completed ? 1 : 0,
              lastUsed: dateStr,
              pinned: false,
              carriedOver: !task.completed,
            });
          } else {
            next[i] = {
              ...next[i],
              useCount: next[i].useCount + 1,
              completedCount: next[i].completedCount + (task.completed ? 1 : 0),
              lastUsed: dateStr,
              carriedOver: !task.completed,
            };
          }
        }
        return next;
      });
    },
    [setHistory, setSuggestions]
  );

  /**
   * Daily refresh — runs once per mount. If the stored day isn't today, the
   * previous day is archived and today starts clean. The ref guard keeps this
   * correct under React StrictMode's double-invoked effects.
   */
  const rolledOver = useRef(false);
  useEffect(() => {
    if (rolledOver.current) return;
    rolledOver.current = true;

    if (!localStorage.getItem(SEEDED_KEY)) {
      localStorage.setItem(SEEDED_KEY, String(data.version));
    }

    const today = getDateString();
    if (lastDate === today) return;

    archive(lastDate, tasks);
    setTasks([]);
    setLastDate(today);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- CRUD ---------- */

  /** Adds a task. Returns false when it is a duplicate of an existing one. */
  const addTask = useCallback(
    (text: string): boolean => {
      const trimmed = text.trim();
      if (!trimmed) return false;
      if (tasksRef.current.some((t) => same(t.text, trimmed))) return false;

      setTasks((prev) => [makeTask(trimmed), ...prev]);

      setSuggestions((prev) => {
        const i = prev.findIndex((s) => same(s.text, trimmed));
        if (i === -1) {
          return [
            ...prev,
            {
              text: trimmed,
              useCount: 1,
              completedCount: 0,
              lastUsed: getDateString(),
              pinned: false,
              carriedOver: false,
            },
          ];
        }
        const next = [...prev];
        next[i] = { ...next[i], lastUsed: getDateString(), carriedOver: false };
        return next;
      });

      return true;
    },
    [setTasks, setSuggestions]
  );

  const toggleTask = useCallback(
    (id: string) =>
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
      ),
    [setTasks]
  );

  const deleteTask = useCallback(
    (id: string) => setTasks((prev) => prev.filter((t) => t.id !== id)),
    [setTasks]
  );

  /** Re-insert a deleted task (powers the toast's Undo action). */
  const restoreTask = useCallback(
    (task: Task) =>
      setTasks((prev) =>
        prev.some((t) => t.id === task.id) ? prev : [task, ...prev]
      ),
    [setTasks]
  );

  const updateTask = useCallback(
    (id: string, text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, text: trimmed } : t)));
    },
    [setTasks]
  );

  const clearCompleted = useCallback(() => {
    lastClearedRef.current = tasksRef.current.filter((t) => t.completed);
    setTasks((prev) => prev.filter((t) => !t.completed));
  }, [setTasks]);

  /** Restore the tasks removed by the last "Clear completed". */
  const restoreCleared = useCallback(() => {
    const toRestore = lastClearedRef.current;
    if (toRestore.length === 0) return;
    lastClearedRef.current = [];
    setTasks((prev) => {
      const existing = new Set(prev.map((t) => t.id));
      return [...toRestore.filter((t) => !existing.has(t.id)), ...prev];
    });
  }, [setTasks]);

  const toggleAll = useCallback(
    () =>
      setTasks((prev) => {
        const allDone = prev.length > 0 && prev.every((t) => t.completed);
        return prev.map((t) => ({ ...t, completed: !allDone }));
      }),
    [setTasks]
  );

  /** Manually end the day: archive now, start fresh. */
  const endDay = useCallback(() => {
    const today = getDateString();
    archive(today, tasks);
    setTasks([]);
    setLastDate(today);
  }, [archive, tasks, setTasks, setLastDate]);

  const removeSuggestion = useCallback(
    (text: string) => setSuggestions((prev) => prev.filter((s) => !same(s.text, text))),
    [setSuggestions]
  );

  const clearHistory = useCallback(() => setHistory([]), [setHistory]);

  const resetToProjectDefaults = useCallback(() => {
    setTasks(data.starterTasks.map(makeTask));
    setHistory(sortHistory(data.history ?? []));
    setSuggestions(routineSuggestions());
    setLastDate(getDateString());
  }, [setTasks, setHistory, setSuggestions, setLastDate]);

  /* ---------- backup ---------- */

  /** Serialize the full live dataset into a downloadable JSON string. */
  const exportData = useCallback(
    () =>
      JSON.stringify(
        {
          app: 'taskflow',
          version: data.version,
          exportedAt: new Date().toISOString(),
          tasks,
          history,
          suggestions,
          lastDate,
        },
        null,
        2
      ),
    [tasks, history, suggestions, lastDate]
  );

  /** Replace the live dataset from a backup string. Returns false on bad input. */
  const importData = useCallback(
    (raw: string): boolean => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        return false;
      }

      const record = parsed as {
        app?: unknown;
        tasks?: unknown;
        history?: unknown;
        suggestions?: unknown;
        lastDate?: unknown;
      };
      if (
        record.app !== 'taskflow' ||
        !Array.isArray(record.tasks) ||
        !Array.isArray(record.history) ||
        !Array.isArray(record.suggestions)
      ) {
        return false;
      }

      const safeTasks: Task[] = record.tasks
        .filter(
          (t): t is Task =>
            typeof t === 'object' &&
            t !== null &&
            typeof (t as Task).text === 'string' &&
            typeof (t as Task).completed === 'boolean'
        )
        .map((t) => ({
          id: typeof t.id === 'string' ? t.id : crypto.randomUUID(),
          text: t.text,
          completed: t.completed,
          createdAt: typeof t.createdAt === 'number' ? t.createdAt : Date.now(),
        }));

      const safeHistory: DaySnapshot[] = record.history
        .filter(
          (d): d is DaySnapshot =>
            typeof d === 'object' &&
            d !== null &&
            typeof (d as DaySnapshot).date === 'string' &&
            Array.isArray((d as DaySnapshot).tasks)
        )
        .map((d) => ({
          date: d.date,
          tasks: d.tasks.filter(
            (t): t is HistoryTask =>
              typeof t === 'object' &&
              t !== null &&
              typeof (t as HistoryTask).text === 'string' &&
              typeof (t as HistoryTask).completed === 'boolean'
          ),
        }));

      const safeSuggestions: Suggestion[] = record.suggestions
        .filter(
          (s): s is Suggestion =>
            typeof s === 'object' &&
            s !== null &&
            typeof (s as Suggestion).text === 'string'
        )
        .map((s) => ({
          text: s.text,
          useCount: typeof s.useCount === 'number' ? s.useCount : 0,
          completedCount: typeof s.completedCount === 'number' ? s.completedCount : 0,
          lastUsed: typeof s.lastUsed === 'string' ? s.lastUsed : null,
          pinned: Boolean(s.pinned),
          carriedOver: Boolean(s.carriedOver),
        }));

      setTasks(safeTasks);
      setHistory(sortHistory(safeHistory));
      setSuggestions(safeSuggestions);
      setLastDate(typeof record.lastDate === 'string' ? record.lastDate : getDateString());
      return true;
    },
    [setTasks, setHistory, setSuggestions, setLastDate]
  );

  /* ---------- derived ---------- */

  /** Active tasks first, completed sink to the bottom (stable order). */
  const orderedTasks = useMemo(
    () => [...tasks].sort((a, b) => Number(a.completed) - Number(b.completed)),
    [tasks]
  );

  const rankedSuggestions = useMemo(() => {
    const onListToday = new Set(tasks.map((t) => t.text.trim().toLowerCase()));
    return suggestions
      .filter((s) => !onListToday.has(s.text.trim().toLowerCase()))
      .sort((a, b) => {
        if (a.carriedOver !== b.carriedOver) return a.carriedOver ? -1 : 1;
        if (b.useCount !== a.useCount) return b.useCount - a.useCount;
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return a.text.localeCompare(b.text);
      });
  }, [suggestions, tasks]);

  /** Consecutive days (ending today or yesterday) with at least one task done. */
  const streak = useMemo(() => {
    const productive = new Set(
      history.filter((d) => d.tasks.some((t) => t.completed)).map((d) => d.date)
    );
    const today = getDateString();
    if (tasks.some((t) => t.completed)) productive.add(today);

    let count = 0;
    let cursor = productive.has(today) ? 0 : 1;
    // Allow the streak to still count if today hasn't been started yet.
    while (count < 3650) {
      const day = daysBetween(today, cursor);
      if (!productive.has(day)) break;
      count += 1;
      cursor += 1;
    }
    return count;
  }, [history, tasks]);

  /** Consecutive *past* days (ending yesterday) with at least one task left undone. */
  const unfinishedStreak = useMemo(() => {
    const unproductive = new Set(
      history.filter((d) => d.tasks.some((t) => !t.completed)).map((d) => d.date)
    );
    const today = getDateString();
    let count = 0;
    let cursor = 1;
    while (count < 3650) {
      const day = daysBetween(today, cursor);
      if (!unproductive.has(day)) break;
      count += 1;
      cursor += 1;
    }
    return count;
  }, [history]);

  const stats = useMemo(() => {
    const allHistoryTasks = history.flatMap((d) => d.tasks);
    const doneAllTime =
      allHistoryTasks.filter((t) => t.completed).length +
      tasks.filter((t) => t.completed).length;
    const totalAllTime = allHistoryTasks.length + tasks.length;
    return {
      daysTracked: history.length,
      doneAllTime,
      totalAllTime,
      avgRate: totalAllTime ? Math.round((doneAllTime / totalAllTime) * 100) : 0,
      streak,
    };
  }, [history, tasks, streak]);

  return {
    tasks: orderedTasks,
    history,
    suggestions: rankedSuggestions,
    stats,
    streak,
    unfinishedStreak,
    addTask,
    toggleTask,
    deleteTask,
    restoreTask,
    updateTask,
    clearCompleted,
    restoreCleared,
    toggleAll,
    endDay,
    removeSuggestion,
    clearHistory,
    resetToProjectDefaults,
    exportData,
    importData,
  };
}
