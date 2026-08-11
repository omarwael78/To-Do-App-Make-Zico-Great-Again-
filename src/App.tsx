import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Header from '@/components/Header';
import MascotBanner from '@/components/MascotBanner';
import CelebrationConfetti from '@/components/CelebrationConfetti';
import DayOverview from '@/components/DayOverview';
import AddTaskForm from '@/components/AddTaskForm';
import SuggestedTasks from '@/components/SuggestedTasks';
import FilterTabs from '@/components/FilterTabs';
import TaskList from '@/components/TaskList';
import ViewSwitcher from '@/components/ViewSwitcher';
import HistoryView from '@/components/HistoryView';
import ToastStack from '@/components/ToastStack';
import Footer from '@/components/Footer';
import WardrobeModal from '@/components/WardrobeModal';
import { useTaskData } from '@/hooks/useTaskData';
import { useTheme } from '@/hooks/useTheme';
import { useToasts } from '@/hooks/useToasts';
import { useWardrobe } from '@/hooks/useWardrobe';
import { useSounds } from '@/hooks/useSounds';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { MASCOTS, getMascot, isMascotUnlocked } from '@/data/mascots';
import { STREAK_GADGETS, gadgetById } from '@/data/wardrobe';
import { getDateString } from '@/utils/date';
import { FilterType, ViewType, Task, Mood, Reaction } from '@/types/task';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { toasts, notify, dismiss } = useToasts();
  const {
    tasks,
    history,
    suggestions,
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
  } = useTaskData();

  const wardrobe = useWardrobe(streak);
  const sounds = useSounds();

  const [filter, setFilter] = useState<FilterType>('all');
  const [view, setView] = useState<ViewType>('today');
  const [wardrobeOpen, setWardrobeOpen] = useState(false);

  /** Floating "+N 🪙" animation id (bump to replay). */
  const [coinFx, setCoinFx] = useState<{ id: number; amount: number } | null>(null);

  /* ---------- daily free chest ---------- */
  const [chestDate, setChestDate] = useLocalStorage<string>('taskflow-chest-date', '');
  const chestAvailable = chestDate !== getDateString();

  const handleOpenChest = useCallback(() => {
    if (chestDate === getDateString()) return;
    const reward = 5 + Math.floor(Math.random() * 11); // 5-15 coins
    wardrobe.addCoins(reward);
    setCoinFx({ id: Date.now(), amount: reward });
    setChestDate(getDateString());
    sounds.playChest();
    notify(`Daily chest opened! +${reward} 🪙`, 'success');
  }, [chestDate, wardrobe.addCoins, setChestDate, sounds, notify]);

  /* ---------- derived ---------- */
  const counts = useMemo(
    () => ({
      all: tasks.length,
      active: tasks.filter((t) => !t.completed).length,
      completed: tasks.filter((t) => t.completed).length,
    }),
    [tasks]
  );

  const filteredTasks = useMemo(
    () =>
      tasks.filter((task) => {
        if (filter === 'active') return !task.completed;
        if (filter === 'completed') return task.completed;
        return true;
      }),
    [tasks, filter]
  );

  /** Effort metrics used to unlock mascot characters. */
  const mascotMetrics = useMemo(
    () => ({
      tasks: stats.doneAllTime,
      streak: stats.bestStreak,
      perfectDays: stats.perfectDays,
      coins: wardrobe.coins,
    }),
    [stats.doneAllTime, stats.bestStreak, stats.perfectDays, wardrobe.coins]
  );

  /* ---------- mascot mood & reactions ---------- */
  const allDone = counts.all > 0 && counts.completed === counts.all;
  const todayPct = counts.all > 0 ? counts.completed / counts.all : 0;

  const mood = useMemo<Mood>(() => {
    // +1 happiness per 5-day streak milestone (capped at 3)
    const happyLevel = Math.min(3, Math.floor(streak / 5));
    // -1 per consecutive *past* day with unfinished tasks (capped at 3)
    const sadLevel = Math.min(3, unfinishedStreak);
    // today's performance: 0 -> 0, started -> +1, most done -> +2, all done -> +3
    const boost = todayPct === 0 ? 0 : todayPct < 1 / 3 ? 1 : todayPct < 1 ? 2 : 3;
    // falling behind today (3+ pending, barely started) adds a little worry
    const penalty = counts.active >= 3 && todayPct < 1 / 3 ? -1 : 0;

    // No activity at all today — streak alone shouldn't make him ecstatic
    const noActivity = counts.all === 0 && counts.completed === 0;

    const score = Math.max(
      -3,
      Math.min(noActivity ? 2 : 3, happyLevel - sadLevel + boost + penalty)
    );

    if (score >= 3) return 'ecstatic';
    if (score === 2) return 'very-happy';
    if (score === 1) return 'happy';
    if (score === 0) return 'neutral';
    if (score === -1) return 'sad';
    return 'very-sad';
  }, [streak, unfinishedStreak, counts, todayPct]);

  // One-shot mascot animations: jump when a task is completed, sigh when un-checked
  const [reaction, setReaction] = useState<Reaction>({ id: 0, type: 'none' });
  const prevCompleted = useRef(counts.completed);
  useEffect(() => {
    const diff = counts.completed - prevCompleted.current;
    prevCompleted.current = counts.completed;
    if (diff > 0) setReaction({ id: Date.now(), type: 'celebrate' });
    else if (diff < 0) setReaction({ id: Date.now(), type: 'sigh' });
  }, [counts.completed]);

  // Full-screen confetti the moment everything is done + a "perfect day" bonus
  const [showConfetti, setShowConfetti] = useState(false);
  const prevAllDone = useRef(allDone);
  useEffect(() => {
    if (allDone && !prevAllDone.current) {
      setShowConfetti(true);
      wardrobe.addCoins(5);
      setCoinFx({ id: Date.now(), amount: 5 });
      sounds.playPerfect();
      notify('Perfect day — bonus +5 🪙!', 'success');
    }
    prevAllDone.current = allDone;
  }, [allDone, wardrobe.addCoins, sounds, notify]);

  useEffect(() => {
    if (!showConfetti) return;
    const t = window.setTimeout(() => setShowConfetti(false), 4200);
    return () => window.clearTimeout(t);
  }, [showConfetti]);

  // Celebrate streak milestones: every 5 days Zico levels up and
  // unlocks a wardrobe gadget
  const prevStreak = useRef(streak);
  useEffect(() => {
    const prev = prevStreak.current;
    prevStreak.current = streak;
    if (streak <= prev || streak === 0 || streak % 5 !== 0) return;

    setReaction({ id: Date.now(), type: 'levelup' });
    sounds.playLevelUp();
    const gadget = STREAK_GADGETS.find((g) => g.level === streak);
    notify(
      gadget
        ? `🔥 ${streak}-day streak — Zico unlocked ${gadget.name}!`
        : `🔥 ${streak}-day streak — Zico leveled up!`,
      'success'
    );
  }, [streak, sounds, notify]);

  // Celebrate beating the all-time best streak (level-up multiples are
  // already celebrated above, so they are skipped here).
  const prevBestStreak = useRef<number | null>(null);
  useEffect(() => {
    if (prevBestStreak.current === null) {
      prevBestStreak.current = stats.bestStreak;
      return;
    }
    if (streak > stats.bestStreak && streak % 5 !== 0) {
      setReaction({ id: Date.now(), type: 'levelup' });
      sounds.playPerfect();
      notify(`🏆 New record — ${streak}-day streak!`, 'success');
    }
  }, [streak, stats.bestStreak, sounds, notify]);

  // Celebrate coin milestones — 50 / 100 / 200 / 500 saved up
  const COIN_MILESTONES = [50, 100, 200, 500];
  const prevCoins = useRef(wardrobe.coins);
  useEffect(() => {
    const prev = prevCoins.current;
    prevCoins.current = wardrobe.coins;
    if (wardrobe.coins <= prev) return;
    const crossed = COIN_MILESTONES.find(
      (m) => prev < m && wardrobe.coins >= m
    );
    if (crossed) {
      sounds.playLevelUp();
      notify(`🪙 ${crossed} coins saved — Zico is impressed!`, 'success');
    }
  }, [wardrobe.coins, sounds, notify]);

  // Cheer the moment a new mascot character becomes unlocked
  const unlockedMascotsRef = useRef<Set<string> | null>(null);
  useEffect(() => {
    const unlockedNow = new Set(
      MASCOTS.filter((m) => isMascotUnlocked(m, mascotMetrics)).map((m) => m.id)
    );
    if (unlockedMascotsRef.current === null) {
      unlockedMascotsRef.current = unlockedNow;
      return;
    }
    for (const m of MASCOTS) {
      if (m.unlock && unlockedNow.has(m.id) && !unlockedMascotsRef.current.has(m.id)) {
        sounds.playLevelUp();
        notify(`🎉 New mascot unlocked — ${m.emoji} ${m.name}!`, 'success');
        unlockedMascotsRef.current.add(m.id);
      }
    }
  }, [mascotMetrics, sounds, notify]);

  /* ---------- handlers with feedback ---------- */
  /** Completing a task earns 1 coin — Zico's shop currency. */
  const handleToggleTask = useCallback(
    (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (task && !task.completed) {
        wardrobe.addCoins(1);
        setCoinFx({ id: Date.now(), amount: 1 });
        sounds.playComplete();
        sounds.playCoin();
      }
      toggleTask(id);
    },
    [tasks, toggleTask, wardrobe.addCoins, sounds]
  );

  /** "Mark all done" pays out a coin for every pending task. */
  const handleToggleAll = useCallback(() => {
    const allDone = counts.all > 0 && counts.completed === counts.all;
    const amount = allDone ? 0 : counts.active;
    if (amount > 0) {
      wardrobe.addCoins(amount);
      setCoinFx({ id: Date.now(), amount });
      sounds.playComplete();
      sounds.playCoin();
    }
    toggleAll();
  }, [counts, toggleAll, wardrobe.addCoins, sounds]);

  /** Equip/unequip from the gear strip — explains the lock if refused. */
  const handleToggleEquip = useCallback(
    (id: string) => {
      const res = wardrobe.toggleEquip(id);
      if (res.ok) {
        sounds.playToggle();
        return;
      }
      sounds.playLocked();
      const gadget = gadgetById(id);
      if (!gadget) return;
      if (res.reason === 'streak') {
        notify(`Locked — ${gadget.name} needs a ${gadget.level}-day streak`, 'info');
      } else {
        notify(`${gadget.name} isn't yours yet — buy it with coins in the Shop`, 'info');
      }
    },
    [wardrobe.toggleEquip, sounds, notify]
  );

  /** Switch the active mascot — locked characters can't be selected. */
  const handleSelectMascot = useCallback(
    (id: string) => {
      if (id === wardrobe.mascot) return;
      const def = getMascot(id);
      if (!isMascotUnlocked(def, mascotMetrics)) {
        sounds.playLocked();
        notify(`${def.name} is still locked — keep going!`, 'info');
        return;
      }
      wardrobe.setMascot(id);
      sounds.playLevelUp();
      notify(`Now playing as ${def.emoji} ${def.name}!`, 'success');
    },
    [wardrobe.mascot, wardrobe.setMascot, mascotMetrics, sounds, notify]
  );

  /** Buy from the shop — toasts the outcome. */
  const handleBuy = useCallback(
    (id: string): boolean => {
      const gadget = gadgetById(id);
      const ok = wardrobe.buyItem(id);
      if (ok && gadget) {
        sounds.playBuy();
        notify(`Purchased ${gadget.name} — ${gadget.icon}`, 'success');
      } else if (!ok && gadget) {
        sounds.playLocked();
        notify('Not enough coins — finish more tasks to earn 🪙', 'error');
      }
      return ok;
    },
    [wardrobe.buyItem, sounds, notify]
  );

  const handleAdd = useCallback(
    (text: string) => {
      const added = addTask(text);
      if (added) notify('Task added', 'success');
      else notify('That task is already on your list', 'info');
    },
    [addTask, notify]
  );

  const handleDelete = useCallback(
    (task: Task) => {
      deleteTask(task.id);
      notify('Task deleted', 'info', {
        label: 'Undo',
        onClick: () => restoreTask(task),
      });
    },
    [deleteTask, restoreTask, notify]
  );

  const handleClearCompleted = useCallback(() => {
    const removed = counts.completed;
    clearCompleted();
    notify(`Cleared ${removed} completed task${removed === 1 ? '' : 's'}`, 'success', {
      label: 'Undo',
      onClick: restoreCleared,
    });
  }, [clearCompleted, restoreCleared, counts.completed, notify]);

  const handleEndDay = useCallback(() => {
    const done = counts.completed;
    const total = counts.all;
    const pct = total > 0 ? done / total : 0;
    const bonus = pct >= 1 ? 5 : pct >= 0.5 ? 2 : 0;
    if (bonus > 0) {
      wardrobe.addCoins(bonus);
      setCoinFx({ id: Date.now(), amount: bonus });
      sounds.playCoin();
    }
    endDay();
    setFilter('all');
    setView('history');
    notify(
      bonus > 0
        ? `Day saved — ${done}/${total} completed · bonus +${bonus} 🪙`
        : `Day saved — ${done}/${total} completed`,
      'success'
    );
  }, [endDay, counts, wardrobe.addCoins, sounds, notify]);

  const handleClearHistory = useCallback(() => {
    if (window.confirm('Delete all saved history? This cannot be undone.')) {
      clearHistory();
      notify('History cleared', 'info');
    }
  }, [clearHistory, notify]);

  const handleReset = useCallback(() => {
    if (
      window.confirm(
        'Reset tasks, history, suggestions, coins and wardrobe back to the values in src/data/taskflow.json?'
      )
    ) {
      resetToProjectDefaults();
      wardrobe.resetWardrobe();
      setView('today');
      setFilter('all');
      notify('Restored project defaults', 'success');
    }
  }, [resetToProjectDefaults, wardrobe.resetWardrobe, notify]);

  const handleRemoveSuggestion = useCallback(
    (text: string) => {
      removeSuggestion(text);
      notify('Suggestion removed', 'info');
    },
    [removeSuggestion, notify]
  );

  /* ---------- backup ---------- */

  const handleExport = useCallback(() => {
    const blob = new Blob([exportData()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taskflow-backup-${getDateString()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    notify('Backup downloaded', 'success');
  }, [exportData, notify]);

  const handleImportFile = useCallback(
    async (file: File) => {
      try {
        const text = await file.text();
        if (importData(text)) {
          setView('today');
          setFilter('all');
          notify('Backup restored', 'success');
        } else {
          notify('That file is not a valid TaskFlow backup', 'error');
        }
      } catch {
        notify('Could not read that file', 'error');
      }
    },
    [importData, notify]
  );

  /* ---------- live tab title ---------- */

  useEffect(() => {
    document.title =
      counts.active > 0
        ? `(${counts.active}) Make Zico Great Again`
        : 'Make Zico Great Again';
  }, [counts.active]);

  /* ---------- keyboard shortcuts ---------- */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable;

      if (e.key === '/' && !typing) {
        e.preventDefault();
        setView('today');
        document.getElementById('task-input')?.focus();
      }
      if (e.key === 'Escape' && typing) {
        (target as HTMLElement).blur();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-violet-50/40 px-4 py-8 transition-colors duration-500 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950/40 sm:py-12">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="animate-float absolute -left-24 top-0 h-72 w-72 rounded-full bg-violet-300/30 blur-3xl dark:bg-violet-600/20" />
        <div className="animate-float-alt absolute -right-24 top-1/4 h-80 w-80 rounded-full bg-indigo-300/30 blur-3xl dark:bg-indigo-600/20" />
        <div
          className="animate-float absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl dark:bg-fuchsia-600/10"
          style={{ animationDelay: '5s' }}
        />
      </div>

      <div className="relative mx-auto max-w-lg">
        <Header
          theme={theme}
          onToggleTheme={toggleTheme}
          streak={streak}
          coins={wardrobe.coins}
          muted={sounds.muted}
          onToggleSound={() => sounds.setMuted(!sounds.muted)}
          mascot={wardrobe.mascot}
        />

        <ViewSwitcher current={view} onChange={setView} historyCount={history.length} />

        <main className="mt-4">
          {view === 'today' ? (
            <div key="today" className="animate-view-fade space-y-4">
              <MascotBanner
                mood={mood}
                streak={streak}
                bestStreak={stats.bestStreak}
                unfinishedStreak={unfinishedStreak}
                total={counts.all}
                completed={counts.completed}
                active={counts.active}
                reaction={reaction}
                coins={wardrobe.coins}
                owned={wardrobe.owned}
                equipped={wardrobe.equipped}
                skin={wardrobe.mascot}
                coinFx={coinFx}
                chestAvailable={chestAvailable}
                onOpenChest={handleOpenChest}
                onToggleEquip={handleToggleEquip}
                onOpenShop={() => setWardrobeOpen(true)}
              />

              <DayOverview
                total={counts.all}
                completed={counts.completed}
                onToggleAll={handleToggleAll}
              />

              <AddTaskForm onAdd={handleAdd} />

              <SuggestedTasks
                suggestions={suggestions}
                onAdd={handleAdd}
                onRemove={handleRemoveSuggestion}
              />

              <FilterTabs current={filter} onChange={setFilter} counts={counts} />

              {/* Action row */}
              <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                  {filteredTasks.length} shown
                  {filter !== 'all' && ` · ${filter}`}
                </p>
                <div className="flex gap-3">
                  {counts.completed > 0 && (
                    <button
                      onClick={handleClearCompleted}
                      className="text-[11px] font-bold text-rose-400 transition-colors hover:text-rose-500"
                    >
                      Clear completed
                    </button>
                  )}
                  {counts.all > 0 && (
                    <button
                      onClick={handleEndDay}
                      title="Save today into history and start a fresh list"
                      className="flex items-center gap-1 text-[11px] font-bold text-violet-500 transition-colors hover:text-violet-600 dark:text-violet-400 dark:hover:text-violet-300"
                    >
                      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="23 4 23 10 17 10" />
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                      </svg>
                      End day
                    </button>
                  )}
                </div>
              </div>

              <TaskList
                tasks={filteredTasks}
                onToggle={handleToggleTask}
                onDelete={handleDelete}
                onUpdate={updateTask}
                filter={filter}
                mood={mood}
                equipped={wardrobe.equipped}
                skin={wardrobe.mascot}
                onShowAll={() => setFilter('all')}
              />
            </div>
          ) : (
            <HistoryView
              key="history"
              history={history}
              stats={stats}
              onClearHistory={handleClearHistory}
            />
          )}
        </main>

        <Footer onReset={handleReset} onExport={handleExport} onImport={handleImportFile} />
      </div>

      {showConfetti && <CelebrationConfetti />}
      <WardrobeModal
        open={wardrobeOpen}
        onClose={() => setWardrobeOpen(false)}
        coins={wardrobe.coins}
        owned={wardrobe.owned}
        equipped={wardrobe.equipped}
        streak={streak}
        mascot={wardrobe.mascot}
        mascotMetrics={mascotMetrics}
        onBuy={handleBuy}
        onToggle={handleToggleEquip}
        onWearAll={(wear) => wardrobe.setAllOwned(wear)}
        onSelectMascot={handleSelectMascot}
      />
      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
