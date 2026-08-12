import { useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { STREAK_GADGETS, WARDROBE, type Gadget } from '@/data/wardrobe';

const COINS_KEY = 'taskflow-coins';
const OWNED_KEY = 'taskflow-wardrobe-owned';
const EQUIPPED_KEY = 'taskflow-wardrobe-equipped';
const MASCOT_KEY = 'taskflow-mascot';

export interface ToggleResult {
  ok: boolean;
  /** Why the toggle was refused: gear locked behind a streak / not purchased. */
  reason?: 'streak' | 'shop';
}

/**
 * Zico's wardrobe + coin economy.
 *
 * - `coins`: earned by completing tasks (1 per task), spent in the shop.
 * - `owned`: coin-gear ids that have been purchased.
 * - `equipped`: ids currently worn. Streak gear is auto-equipped the moment
 *   it unlocks and auto-removed if the streak ever drops below its tier.
 */
export function useWardrobe(streak: number) {
  const [coins, setCoins] = useLocalStorage<number>(COINS_KEY, 0);
  const [owned, setOwned] = useLocalStorage<string[]>(OWNED_KEY, []);
  const [equipped, setEquipped] = useLocalStorage<string[]>(
    EQUIPPED_KEY,
    // First run: wear everything the streak has unlocked so far.
    () => STREAK_GADGETS.filter((g) => streak >= (g.level ?? 0)).map((g) => g.id)
  );
  const [mascot, setMascot] = useLocalStorage<string>(MASCOT_KEY, 'zico');

  // Keep streak gear in sync with the streak.
  useEffect(() => {
    setEquipped((prev) => {
      const next = new Set(prev);
      let changed = false;
      for (const g of STREAK_GADGETS) {
        const level = g.level ?? 0;
        if (streak >= level && !next.has(g.id)) {
          next.add(g.id);
          changed = true;
        } else if (streak < level && next.has(g.id)) {
          next.delete(g.id);
          changed = true;
        }
      }
      return changed ? [...next] : prev;
    });
  }, [streak, setEquipped]);

  const isOwned = useCallback(
    (g: Gadget): boolean =>
      g.kind === 'streak' ? streak >= (g.level ?? 0) : owned.includes(g.id),
    [streak, owned]
  );

  const isEquipped = useCallback((id: string): boolean => equipped.includes(id), [equipped]);

  const addCoins = useCallback(
    (amount: number) => {
      setCoins((prev) => prev + amount);
    },
    [setCoins]
  );

  /** Buy a coin item: spend coins, own it, and wear it right away. */
  const buyItem = useCallback(
    (id: string): boolean => {
      const g = WARDROBE.find((x) => x.id === id);
      if (!g || g.kind !== 'coin' || g.price === undefined) return false;
      if (owned.includes(id) || coins < g.price) return false;
      setCoins(coins - g.price);
      setOwned((prev) => [...prev, id]);
      setEquipped((prev) => (prev.includes(id) ? prev : [...prev, id]));
      return true;
    },
    [coins, owned, setCoins, setOwned, setEquipped]
  );

  /** Put an item on / take it off — refused unless the item is owned. */
  const toggleEquip = useCallback(
    (id: string): ToggleResult => {
      const g = WARDROBE.find((x) => x.id === id);
      if (!g) return { ok: false };
      if (!isOwned(g)) return { ok: false, reason: g.kind === 'coin' ? 'shop' : 'streak' };
      setEquipped((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
      return { ok: true };
    },
    [isOwned, setEquipped]
  );

  /** Equip everything owned, or strip all owned items (streak + shop). */
  const setAllOwned = useCallback(
    (wear: boolean) => {
      setEquipped((prev) => {
        const ownedIds = new Set([
          ...STREAK_GADGETS.filter((g) => streak >= (g.level ?? 0)).map((g) => g.id),
          ...owned,
        ]);
        if (wear) return [...ownedIds];
        return prev.filter((id) => !ownedIds.has(id));
      });
    },
    [streak, owned, setEquipped]
  );

  /** Fresh start: no coins, nothing purchased, only the streak gear worn. */
  const resetWardrobe = useCallback(() => {
    setCoins(0);
    setOwned([]);
    setEquipped(STREAK_GADGETS.filter((g) => streak >= (g.level ?? 0)).map((g) => g.id));
  }, [streak, setCoins, setOwned, setEquipped]);

  return {
    coins,
    owned,
    equipped,
    mascot,
    setMascot,
    isOwned,
    isEquipped,
    addCoins,
    buyItem,
    toggleEquip,
    setAllOwned,
    resetWardrobe,
  };
}
