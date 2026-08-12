/**
 * Zico's Friends — the mascot roster.
 *
 * Every character is a squishy blob in the same style as Zico, but each has
 * its own palette, headdress and (for many) a different body shape, so
 * friends really do look different from each other.
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
  | { type: 'best-day'; goal: number }
  | { type: 'tracked'; goal: number };

/**
 * Silhouette of the body. Every shape shares the same "dressing window"
 * (head top around y 4-22, sides near x 6-94, feet at y 93) so all of
 * Zico's gear — hats, crown, cape, pets — fits every friend, and every
 * expression, reaction and animation works on every shape.
 */
export type MascotShape =
  | 'blob'
  | 'tall'
  | 'gumdrop'
  | 'block'
  | 'heart'
  | 'egg'
  | 'human';

export type MascotAccessory =
  | 'none'
  | 'cat-ears'
  | 'ram-horns'
  | 'croc'
  | 'antenna'
  | 'dog-ears'
  | 'beak'
  | 'mane'
  | 'sun-rays'
  | 'moon-disc'
  | 'atef'
  | 'plume'
  | 'star'
  | 'spikes'
  | 'hair-fluff'
  | 'hair-swept'
  | 'hair-royal';

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
    id: '7oda',
    name: '7oda',
    emoji: '🧿',
    tagline: 'Lucky charm — watches over your days.',
    palette: {
      from: '#f472b6',
      to: '#ec4899',
      outline: '#7f1d1a',
      feet: '#991b1b',
      belly: '#fecaca',
      blush: '#fda4af',
    },
    accessory: 'hair-fluff',
    shape: 'blob',
    unlock: { type: 'streak', goal: 15 },
  },
  {
    id: 'mora',
    name: 'mora',
    emoji: '🌿',
    tagline: 'Nature spirit — grows with every streak.',
    palette: {
      from: '#22c55e',
      to: '#16a34a',
      outline: '#052e16',
      feet: '#047857',
      belly: '#d1fae5',
      blush: '#a3e635',
    },
    accessory: 'mane',
    shape: 'blob',
    unlock: { type: 'coins', goal: 100 },
  },
  {
    id: 'bastet',
    name: 'Zizi',
    emoji: '🌸',
    tagline: 'Pink, sweet, and dangerously cute.',
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
    name: 'Chiko',
    emoji: '🐏',
    tagline: 'Tough ram vibes, golden horns.',
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
    name: 'Tito',
    emoji: '🐊',
    tagline: "Croc-smile energy — don't poke him.",
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
    name: 'Mido',
    emoji: '🌩️',
    tagline: 'A jittery ball of pure electricity.',
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
    name: 'Bondok',
    emoji: '🐺',
    tagline: 'Tall, dark, loyal — a proper guard dog.',
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
    name: 'Kimo',
    emoji: '🦅',
    tagline: "Sharp eyes, sharper beak — the sky's his.",
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
    name: 'Semsem',
    emoji: '🦁',
    tagline: 'Small, wide and mighty — cuddle at your own risk.',
    palette: {
      from: '#fcd34d',
      to: '#ea580c',
      outline: '#7c2d12',
      feet: '#c2410c',
      belly: '#fff7ed',
      blush: '#fcd34d',
    },
    accessory: 'mane',
    shape: 'block',
    unlock: { type: 'coins', goal: 500 },
  },
  {
    id: 'ra',
    name: 'Body',
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
    shape: 'blob',
    unlock: { type: 'tasks', goal: 300 },
  },
  {
    id: 'isis',
    name: 'Tota',
    emoji: '🌙',
    tagline: 'A heart of pure magic — soft but fierce.',
    palette: {
      from: '#5eead4',
      to: '#0d9488',
      outline: '#134e4a',
      feet: '#0f766e',
      belly: '#f0fdfa',
      blush: '#5eead4',
    },
    accessory: 'moon-disc',
    shape: 'heart',
    unlock: { type: 'perfect-days', goal: 20 },
  },
  {
    id: 'ptah',
    name: 'Simo',
    emoji: '🛠️',
    tagline: 'Solid as a block of stone, built to last.',
    palette: {
      from: '#94a3b8',
      to: '#475569',
      outline: '#1e293b',
      feet: '#334155',
      belly: '#f1f5f9',
      blush: '#94a3b8',
    },
    accessory: 'atef',
    shape: 'block',
    unlock: { type: 'coins', goal: 750 },
  },
  {
    id: 'neith',
    name: 'Fifi',
    emoji: '🎯',
    tagline: 'Sharp, patient, unmissable — the huntress.',
    palette: {
      from: '#67e8f9',
      to: '#0891b2',
      outline: '#164e63',
      feet: '#0e7490',
      belly: '#ecfeff',
      blush: '#67e8f9',
    },
    accessory: 'plume',
    shape: 'gumdrop',
    unlock: { type: 'best-day', goal: 40 },
  },
  {
    id: 'zizo',
    name: 'Zizo',
    emoji: '⭐',
    tagline: 'The star of the party — always shining.',
    palette: {
      from: '#f0abfc',
      to: '#c026d3',
      outline: '#701a75',
      feet: '#a21caf',
      belly: '#fdf4ff',
      blush: '#f0abfc',
    },
    accessory: 'star',
    shape: 'blob',
    unlock: { type: 'tracked', goal: 30 },
  },
  {
    id: 'joe',
    name: 'Joe',
    emoji: '🕶️',
    tagline: "Cool hair, cool vibes — the smoothest friend.",
    palette: {
      from: '#818cf8',
      to: '#4338ca',
      outline: '#312e81',
      feet: '#3730a3',
      belly: '#eef2ff',
      blush: '#818cf8',
    },
    accessory: 'spikes',
    shape: 'egg',
    unlock: { type: 'streak', goal: 30 },
  },
  {
    id: 'faramawey',
    name: 'Faramawey',
    emoji: '🧔',
    tagline: 'The wise elder — calm, kind, gloriously hirsute.',
    palette: {
      from: '#d9a066',
      to: '#8b5e3c',
      outline: '#4a2f1a',
      feet: '#6b4423',
      belly: '#fdf6ec',
      blush: '#d9a066',
    },
    accessory: 'hair-fluff',
    shape: 'human',
    unlock: { type: 'tasks', goal: 150 },
  },
  {
    id: 'omar-ezzat',
    name: 'Omar Ezzat',
    emoji: '👔',
    tagline: 'The sharp professional — every day a clean win.',
    palette: {
      from: '#60a5fa',
      to: '#1e40af',
      outline: '#172554',
      feet: '#1e3a8a',
      belly: '#eff6ff',
      blush: '#93c5fd',
    },
    accessory: 'hair-swept',
    shape: 'human',
    unlock: { type: 'streak', goal: 20 },
  },
  {
    id: 'omar-wael',
    name: 'Omar Wael',
    emoji: '👑',
    tagline: 'The creator himself. Finish 1000 tasks to earn his crown.',
    palette: {
      from: '#fbbf24',
      to: '#7c3aed',
      outline: '#4c1d95',
      feet: '#6d28d9',
      belly: '#fef3c7',
      blush: '#fbbf24',
    },
    accessory: 'hair-royal',
    shape: 'human',
    unlock: { type: 'tasks', goal: 1000 },
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
  tracked: number;
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
            : u.type === 'best-day'
              ? metrics.bestDay
              : metrics.tracked;
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
    case 'tracked':
      return `Track ${unlock.goal} days`;
  }
};
