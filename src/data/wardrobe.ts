/**
 * Zico's wardrobe catalog. Every item is either:
 *  - `streak` gear: unlocked by reaching a streak milestone (auto-worn
 *    the moment it unlocks, and only while the streak stays high enough)
 *  - `coin` gear: bought in the shop with coins earned by completing tasks
 */
export type GadgetKind = 'streak' | 'coin';
export type GadgetCategory = 'accessory' | 'weapon' | 'pet' | 'effect';
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Gadget {
  id: string;
  name: string;
  icon: string;
  kind: GadgetKind;
  /** Streak days required to wear it (streak gear only). */
  level?: number;
  /** Coin price in the shop (coin gear only). */
  price?: number;
  /** Shop grouping (coin gear only). */
  category?: GadgetCategory;
  /** Shop tier (coin gear only). */
  rarity?: Rarity;
  description: string;
}

export const RARITY_META: Record<
  Rarity,
  { label: string; badge: string; border: string }
> = {
  common: {
    label: 'Common',
    badge: 'bg-slate-100 text-slate-500 dark:bg-slate-700/60 dark:text-slate-400',
    border: 'border-slate-200 dark:border-slate-700',
  },
  rare: {
    label: 'Rare',
    badge: 'bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400',
    border: 'border-sky-200 dark:border-sky-500/30',
  },
  epic: {
    label: 'Epic',
    badge: 'bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400',
    border: 'border-violet-200 dark:border-violet-500/30',
  },
  legendary: {
    label: 'Legendary',
    badge: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-500/30',
  },
};

export const STREAK_GADGETS: Gadget[] = [
  {
    id: 'glasses',
    name: 'Black glasses',
    icon: '🕶️',
    kind: 'streak',
    level: 5,
    description: 'The classic cool look.',
  },
  {
    id: 'chain',
    name: 'Gold chain',
    icon: '⛓️',
    kind: 'streak',
    level: 10,
    description: 'Pure bling for a blazing streak.',
  },
  {
    id: 'cape',
    name: 'Hero cape',
    icon: '🦸',
    kind: 'streak',
    level: 15,
    description: 'Flaunts it at 15 days strong.',
  },
  {
    id: 'halo',
    name: 'Golden halo',
    icon: '✨',
    kind: 'streak',
    level: 20,
    description: 'Angelic shine after 20 days.',
  },
  {
    id: 'crown',
    name: 'Royal crown',
    icon: '👑',
    kind: 'streak',
    level: 25,
    description: 'The exclusive 25-day masterpiece.',
  },
  {
    id: 'rainbow',
    name: 'Rainbow trail',
    icon: '🌈',
    kind: 'streak',
    level: 30,
    description: 'Leaves a shimmering trail of pure joy.',
  },
];

export const SHOP_GADGETS: Gadget[] = [
  {
    id: 'headband',
    name: 'Ninja headband',
    icon: '🥷',
    kind: 'coin',
    price: 10,
    category: 'accessory',
    rarity: 'common',
    description: 'Mysterious ninja flair.',
  },
  {
    id: 'cap',
    name: 'Street cap',
    icon: '🧢',
    kind: 'coin',
    price: 15,
    category: 'accessory',
    rarity: 'common',
    description: 'Everyday swagger.',
  },
  {
    id: 'shield',
    name: 'Knight shield',
    icon: '🛡️',
    kind: 'coin',
    price: 20,
    category: 'weapon',
    rarity: 'common',
    description: 'Blocks every excuse.',
  },
  {
    id: 'sword',
    name: 'Hero sword',
    icon: '⚔️',
    kind: 'coin',
    price: 25,
    category: 'weapon',
    rarity: 'common',
    description: 'Slays the to-do list.',
  },
  {
    id: 'turtle',
    name: 'Turtle pet',
    icon: '🐢',
    kind: 'coin',
    price: 25,
    category: 'pet',
    rarity: 'rare',
    description: 'Slow, but always wins.',
  },
  {
    id: 'bow',
    name: 'Archer bow',
    icon: '🏹',
    kind: 'coin',
    price: 30,
    category: 'weapon',
    rarity: 'rare',
    description: 'Bullseye on every goal.',
  },
  {
    id: 'cat',
    name: 'Cat pet',
    icon: '🐈',
    kind: 'coin',
    price: 30,
    category: 'pet',
    rarity: 'rare',
    description: 'Purrs when you finish.',
  },
  {
    id: 'dog',
    name: 'Dog pet',
    icon: '🐶',
    kind: 'coin',
    price: 30,
    category: 'pet',
    rarity: 'rare',
    description: 'Your loyal streak buddy.',
  },
  {
    id: 'hat',
    name: 'Top hat',
    icon: '🎩',
    kind: 'coin',
    price: 35,
    category: 'accessory',
    rarity: 'epic',
    description: 'Classy gentleman energy.',
  },
  {
    id: 'wand',
    name: 'Magic wand',
    icon: '🪄',
    kind: 'coin',
    price: 35,
    category: 'weapon',
    rarity: 'rare',
    description: 'Poof — tasks done.',
  },
  {
    id: 'wings',
    name: 'Fairy wings',
    icon: '🦋',
    kind: 'coin',
    price: 35,
    category: 'accessory',
    rarity: 'epic',
    description: 'Flutters with every win.',
  },
  {
    id: 'owl',
    name: 'Owl pet',
    icon: '🦉',
    kind: 'coin',
    price: 40,
    category: 'pet',
    rarity: 'epic',
    description: 'Wisdom with every win.',
  },
  {
    id: 'trident',
    name: 'Sea trident',
    icon: '🔱',
    kind: 'coin',
    price: 40,
    category: 'weapon',
    rarity: 'epic',
    description: 'Ruler of the to-do seas.',
  },
  {
    id: 'fox',
    name: 'Fox pet',
    icon: '🦊',
    kind: 'coin',
    price: 45,
    category: 'pet',
    rarity: 'epic',
    description: 'Cunning and quick.',
  },
  {
    id: 'aura',
    name: 'Lightning aura',
    icon: '⚡',
    kind: 'coin',
    price: 45,
    category: 'effect',
    rarity: 'legendary',
    description: 'Crackling energy — legendary.',
  },
  {
    id: 'dragon',
    name: 'Mini dragon',
    icon: '🐲',
    kind: 'coin',
    price: 60,
    category: 'pet',
    rarity: 'legendary',
    description: 'Your tiny fireproof buddy.',
  },
];

export const WARDROBE: Gadget[] = [...STREAK_GADGETS, ...SHOP_GADGETS];

export function gadgetById(id: string): Gadget | undefined {
  return WARDROBE.find((g) => g.id === id);
}
