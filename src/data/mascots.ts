/**
 * Mascot roster — every character is a squishy blob in the same style as
 * Zico, with its own color palette and a small native accessory.
 *
 * Characters beyond Zico are locked behind real effort: completed tasks,
 * long streaks, perfect days and saved coins. Unlocked ones can be worn
 * in the wardrobe modal (Mascots tab) and the whole app follows.
 */

export type MascotUnlock =
  | { type: 'tasks'; goal: number }
  | { type: 'streak'; goal: number }
  | { type: 'perfect-days'; goal: number }
  | { type: 'coins'; goal: number };

export type MascotAccessory = 'none' | 'cat-ears' | 'horns' | 'dino' | 'antenna';

export interface MascotDef {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  palette: {
    from: string;
    to: string;
    outline: string;
    feet: string;
    belly: string;
    blush: string;
  };
  accessory: MascotAccessory;
  /** Null = available from the start. */
  unlock: MascotUnlock | null;
}

export const MASCOTS: MascotDef[] = [
  {
    id: 'zico',
    name: 'Zico',
    emoji: '💜',
    tagline: 'The original squishy blob.',
    palette: {
      from: '#a78bfa',
      to: '#6366f1',
      outline: '#312e81',
      feet: '#4338ca',
      belly: '#ffffff',
      blush: '#f9a8d4',
    },
    accessory: 'none',
    unlock: null,
  },
  {
    id: 'luna',
    name: 'Luna',
    emoji: '🌸',
    tagline: 'A pink dreamer with cat ears.',
    palette: {
      from: '#f9a8d4',
      to: '#ec4899',
      outline: '#831843',
      feet: '#db2777',
      belly: '#fdf2f8',
      blush: '#f9a8d4',
    },
    accessory: 'cat-ears',
    unlock: { type: 'tasks', goal: 100 },
  },
  {
    id: 'blaze',
    name: 'Blaze',
    emoji: '🔥',
    tagline: 'Hot-headed little devil.',
    palette: {
      from: '#fdba74',
      to: '#ea580c',
      outline: '#7c2d12',
      feet: '#c2410c',
      belly: '#fff7ed',
      blush: '#fdba74',
    },
    accessory: 'horns',
    unlock: { type: 'streak', goal: 14 },
  },
  {
    id: 'sprout',
    name: 'Sprout',
    emoji: '🌱',
    tagline: 'A sprouty dino with spiky back.',
    palette: {
      from: '#86efac',
      to: '#22c55e',
      outline: '#14532d',
      feet: '#16a34a',
      belly: '#f0fdf4',
      blush: '#86efac',
    },
    accessory: 'dino',
    unlock: { type: 'perfect-days', goal: 10 },
  },
  {
    id: 'zap',
    name: 'Zap',
    emoji: '⚡',
    tagline: 'A jittery energy ball with antenna.',
    palette: {
      from: '#fde047',
      to: '#f59e0b',
      outline: '#78350f',
      feet: '#d97706',
      belly: '#fffbeb',
      blush: '#fde047',
    },
    accessory: 'antenna',
    unlock: { type: 'coins', goal: 250 },
  },
];

export const getMascot = (id: string): MascotDef =>
  MASCOTS.find((m) => m.id === id) ?? MASCOTS[0];

/** Current progress toward a character's unlock (0-1). */
export const getMascotProgress = (
  mascot: MascotDef,
  metrics: { tasks: number; streak: number; perfectDays: number; coins: number }
): number => {
  if (!mascot.unlock) return 1;
  const u = mascot.unlock;
  const value =
    u.type === 'tasks'
      ? metrics.tasks
      : u.type === 'streak'
        ? metrics.streak
        : u.type === 'perfect-days'
          ? metrics.perfectDays
          : metrics.coins;
  return Math.min(1, value / u.goal);
};

export const isMascotUnlocked = (
  mascot: MascotDef,
  metrics: { tasks: number; streak: number; perfectDays: number; coins: number }
): boolean => getMascotProgress(mascot, metrics) >= 1;

/** Human-readable unlock condition, e.g. "Complete 100 tasks". */
export const unlockLabel = (unlock: MascotUnlock | null): string => {
  if (!unlock) return 'Available now';
  switch (unlock.type) {
    case 'tasks':
      return `Complete ${unlock.goal} tasks`;
    case 'streak':
      return `Reach a ${unlock.goal}-day best streak`;
    case 'perfect-days':
      return `Earn ${unlock.goal} perfect days`;
    case 'coins':
      return `Save up ${unlock.goal} coins`;
  }
};
