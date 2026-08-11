/**
 * Zico's Friends — the mascot roster.
 *
 * Every character is a squishy blob in the same style as Zico, but each has
 * its own palette, a native accessory and (for some) a different body shape,
 * so friends really do look different from each other.
 *
 * Friends are locked behind real effort — each one has a challenge to earn:
 * completed tasks, long streaks, perfect days, saved coins, even a single
 * monster day. Unlocked friends can be selected in the wardrobe modal and
 * the whole app follows your pick.
 */

export type MascotUnlock =
  | { type: 'tasks'; goal: number }
  | { type: 'streak'; goal: number }
  | { type: 'perfect-days'; goal: number }
  | { type: 'coins'; goal: number }
  | { type: 'best-day'; goal: number };

/** Silhouette of the body: subtle but visible differences between friends. */
export type MascotShape = 'blob' | 'tall' | 'wide' | 'round';

export type MascotAccessory =
  | 'none'
  | 'cat-ears'
  | 'ram-horns'
  | 'croc'
  | 'antenna'
  | 'dog-ears'
  | 'beak'
  | 'mane'
  | 'sun-rays';

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
  shape: MascotShape;
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
    shape: 'blob',
    unlock: null,
  },
  {
    id: 'bastet',
    name: 'Bastet',
    emoji: '🌸',
    tagline: 'The cat goddess — pink and purrfect.',
    palette: {
      from: '#f9a8d4',
      to: '#ec4899',
      outline: '#831843',
      feet: '#db2777',
      belly: '#fdf2f8',
      blush: '#f9a8d4',
    },
    accessory: 'cat-ears',
    shape: 'blob',
    unlock: { type: 'tasks', goal: 100 },
  },
  {
    id: 'khnum',
    name: 'Khnum',
    emoji: '🐏',
    tagline: 'The ram-headed potter of the Nile.',
    palette: {
      from: '#fcd34d',
      to: '#b45309',
      outline: '#78350f',
      feet: '#92400e',
      belly: '#fffbeb',
      blush: '#fcd34d',
    },
    accessory: 'ram-horns',
    shape: 'blob',
    unlock: { type: 'streak', goal: 14 },
  },
  {
    id: 'sobek',
    name: 'Sobek',
    emoji: '🐊',
    tagline: 'Crocodile of the waters — fearsome friend.',
    palette: {
      from: '#86efac',
      to: '#22c55e',
      outline: '#14532d',
      feet: '#16a34a',
      belly: '#f0fdf4',
      blush: '#86efac',
    },
    accessory: 'croc',
    shape: 'blob',
    unlock: { type: 'perfect-days', goal: 10 },
  },
  {
    id: 'seth',
    name: 'Seth',
    emoji: '🌩️',
    tagline: 'Storm god — a jittery ball of energy.',
    palette: {
      from: '#fde047',
      to: '#f59e0b',
      outline: '#78350f',
      feet: '#d97706',
      belly: '#fffbeb',
      blush: '#fde047',
    },
    accessory: 'antenna',
    shape: 'blob',
    unlock: { type: 'coins', goal: 250 },
  },
  {
    id: 'anubis',
    name: 'Anubis',
    emoji: '🐺',
    tagline: 'Jackal-headed guardian — tall and loyal.',
    palette: {
      from: '#94a3b8',
      to: '#334155',
      outline: '#0f172a',
      feet: '#1e293b',
      belly: '#cbd5e1',
      blush: '#64748b',
    },
    accessory: 'dog-ears',
    shape: 'tall',
    unlock: { type: 'best-day', goal: 30 },
  },
  {
    id: 'horus',
    name: 'Horus',
    emoji: '🦅',
    tagline: 'Falcon of the sky — sharp eyes, sharper beak.',
    palette: {
      from: '#7dd3fc',
      to: '#2563eb',
      outline: '#1e3a8a',
      feet: '#1d4ed8',
      belly: '#eff6ff',
      blush: '#93c5fd',
    },
    accessory: 'beak',
    shape: 'blob',
    unlock: { type: 'streak', goal: 25 },
  },
  {
    id: 'bes',
    name: 'Bes',
    emoji: '🦁',
    tagline: 'The lion dwarf — small, wide and mighty.',
    palette: {
      from: '#fcd34d',
      to: '#ea580c',
      outline: '#7c2d12',
      feet: '#c2410c',
      belly: '#fff7ed',
      blush: '#fcd34d',
    },
    accessory: 'mane',
    shape: 'wide',
    unlock: { type: 'coins', goal: 500 },
  },
  {
    id: 'ra',
    name: 'Ra',
    emoji: '☀️',
    tagline: 'The sun himself — round and radiant.',
    palette: {
      from: '#fb923c',
      to: '#ef4444',
      outline: '#7f1d1d',
      feet: '#dc2626',
      belly: '#fef2f2',
      blush: '#fdba74',
    },
    accessory: 'sun-rays',
    shape: 'round',
    unlock: { type: 'tasks', goal: 300 },
  },
];

export const getMascot = (id: string): MascotDef =>
  MASCOTS.find((m) => m.id === id) ?? MASCOTS[0];

export interface MascotMetrics {
  tasks: number;
  streak: number;
  perfectDays: number;
  coins: number;
  bestDay: number;
}

/** Current progress toward a friend's unlock (0-1). */
export const getMascotProgress = (mascot: MascotDef, metrics: MascotMetrics): number => {
  if (!mascot.unlock) return 1;
  const u = mascot.unlock;
  const value =
    u.type === 'tasks'
      ? metrics.tasks
      : u.type === 'streak'
        ? metrics.streak
        : u.type === 'perfect-days'
          ? metrics.perfectDays
          : u.type === 'coins'
            ? metrics.coins
            : metrics.bestDay;
  return Math.min(1, value / u.goal);
};

export const isMascotUnlocked = (
  mascot: MascotDef,
  metrics: MascotMetrics
): boolean => getMascotProgress(mascot, metrics) >= 1;

/** Human-readable unlock challenge, e.g. "Complete 100 tasks". */
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
    case 'best-day':
      return `Complete ${unlock.goal} tasks in one day`;
  }
};
