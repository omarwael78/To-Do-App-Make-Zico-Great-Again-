export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export interface HistoryTask {
  text: string;
  completed: boolean;
}

/** A snapshot of one day's tasks, archived when the day rolls over. */
export interface DaySnapshot {
  date: string; // YYYY-MM-DD
  tasks: HistoryTask[];
}

/**
 * A remembered task. Every task you add today becomes a suggestion
 * for the following days, ranked by how often you use it.
 */
export interface Suggestion {
  text: string;
  useCount: number;
  completedCount: number;
  lastUsed: string | null; // YYYY-MM-DD
  pinned: boolean; // comes from the project's dailyRoutine list
  carriedOver: boolean; // was left unfinished on the previous day
}

/** Shape of the bundled project data file (src/data/taskflow.json). */
export interface ProjectData {
  version: number;
  dailyRoutine: string[];
  starterTasks: string[];
  history: DaySnapshot[];
}

export type FilterType = 'all' | 'active' | 'completed';
export type Theme = 'light' | 'dark';
export type ViewType = 'today' | 'history';

/**
 * Emotional state of the mascot, derived from the productive streak
 * (happier every 5-day milestone) and consecutive days with unfinished
 * tasks (sadder). Ranges from very-sad to ecstatic.
 */
export type Mood =
  | 'very-sad'
  | 'sad'
  | 'neutral'
  | 'happy'
  | 'very-happy'
  | 'ecstatic';

/** One-shot mascot animations replayed when `id` changes. */
export type ReactionType = 'none' | 'celebrate' | 'sigh' | 'levelup';

/**
 * Which face to flash for a reaction. Progress faces fire when a task is
 * completed; deprogress faces when one is un-checked.
 */
export type FaceVariant =
  | 'wow'
  | 'excited'
  | 'wink'
  | 'laugh'
  | 'tongue'
  | 'meh'
  | 'pout'
  | 'ugh'
  | 'sigh';

export interface Reaction {
  id: number;
  type: ReactionType;
  variant?: FaceVariant;
}
