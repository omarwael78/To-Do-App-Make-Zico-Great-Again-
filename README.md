# Make Zico Great Again — Daily To-Do List

> **A modern, animated daily task manager where **Zico**, your little mascot, walks the progress
> track with you — he celebrates your achievements, feels your missed tasks, and levels up with
> a wardrobe of gadgets every 5 days of streak.**

Built with **React 19 + TypeScript + Vite + Tailwind CSS v4**, this app is fully client-side:
no accounts, no backend, no tracking — your data lives in your own browser.

---

## ✨ Features

### Tasks
- Add tasks with instant feedback (duplicate detection included)
- Toggle done with animated checkmarks; completed tasks sink to the bottom
- Inline edit — double-click any task (or use the edit button)
- Delete with **Undo** via toast notification
- **Clear completed** — now with an Undo action so nothing is lost by accident
- Mark all done / mark all pending in one tap
- Live character counter and `/` shortcut to focus the input

### Daily cycle
- Your list **archives itself at midnight** — yesterday moves to History, today starts fresh
- **"End day"** button archives manually any time
- **Suggested tasks** learned from your habits, ranked by:
  - 🟡 **Carried over** — unfinished yesterday (with an "Add all unfinished" shortcut)
  - 🔢 **Frequency** — how many days you've used each task (`3×` badge)
  - 📌 **Routine** — pinned items from the project's `dailyRoutine` list
- Tap a suggestion to add it; hover to remove it from your library

### Insights
- Animated **progress ring** + progress bar for today
- 🔥 **Streak counter** for consecutive productive days
- 🏆 **Best-streak record** — the longest productive run is tracked for good
  (History stats, banner chip), and beating it triggers a celebration toast
- **History view** with per-day completion rings, ✅ done / ❌ missed breakdown
- 14-day **completion trend chart** and lifetime stats (days tracked, tasks done, avg rate)

### Mascot — Zico 🤖
- A cute animated blob character that walks a **progress track** through your day —
  the more tasks you complete, the further Zico walks toward the 🚩 finish line
- **New look** — glossy gradient body with a soft outline, belly patch, nub arms,
  and a face that reacts to everything; gear (hats, capes, pets…) sits right on him
- **Expressive face** — Zico never fakes it:
  - **Idle**: with an empty list he cycles through neutral, **bored** ("...")
    and **sleepy** ("z z z") faces instead of forcing a smile
  - **Wow** 😮 wide eyes + open mouth when a task is completed
  - **Laugh** 😆 squinting happy eyes + big smile on level-up
  - **Meh** 🙄 flat half-lidded look when a task is un-checked
  - **Pout** and extra tears when many tasks stay pending
  - **Tongue out** 😛 + star eyes the moment everything is done
- **Reacts to achieved tasks**: jumps with a celebration ring every time you check
  something off, gets star-sparkle eyes and rising hearts as you near 100%
- **Reacts to missed tasks**: worried brows, sweat drops and tears flow faster the
  more tasks stay pending
- **Happier with every 5-day streak milestone** — smile, sparkles, and confetti 🎉
- **Sadder with each past day tasks were left unfinished** — droopy eyes, tears and
  a worried wiggle
- **One-shot reactions**: a greeting wave on load, a jump on each completion, a
  deflating sigh when a task is un-checked, and a full spin on level-up
- Completing *everything* today triggers a **full-screen confetti rain**
- **Streak milestone toasts** celebrate every 5th day (5, 10, 15…)
- Character mood drives motivational messages tailored to how your day is going
- **Sound effects** 🔔 — synthesized WebAudio (no files): task-complete pop, coin
  ding, level-up fanfare, perfect-day arpeggio, shop chimes and a friendly buzz
  when something is locked. Mute anytime with the 🔊/🔇 header toggle (remembered).
- **New-record badge** — a 🏆 chip in the banner shows your all-time best streak,
  and turns amber with a "new best!" flair the day you break it
- **Mini Zico in the empty state** — when the list is empty, Zico himself
  (wearing your gear) floats there, matching the filter: neutral for "all",
  happy for "all caught up", sad for "nothing completed yet"
- **Header logo** — the app logo is a live mini version of your active mascot

### 🎭 Mascot characters
Zico isn't alone! The **Mascots tab** of the wardrobe lets you play as other
squishy blobs — each with its own palette and native accessory (cat ears,
horns, dino spikes, antenna). All gear works on every character. They unlock
through real effort, and a toast celebrates the moment one becomes available:

| Character | Look | Unlock |
|---|---|---|
| **Zico** 💜 | Violet blob | Available from the start |
| **Luna** 🌸 | Pink with cat ears | Complete **100 tasks** |
| **Blaze** 🔥 | Orange devil with horns | Reach a **14-day** best streak |
| **Sprout** 🌱 | Green dino with back spikes | Earn **10 perfect days** |
| **Zap** ⚡ | Yellow ball with antenna | Save up **250 coins** |

Locked characters show their progress bar in the modal; unlocked ones can be
selected anytime, and the whole app (header, banner, track, empty state,
dressing room) follows your pick.

### Zico's gadget wardrobe 🎁
Zico's **wardrobe** has two kinds of gear — streak items unlocked by staying
productive, and shop items bought with **🪙 coins**. Open it anytime with the
coin chip or the 🛒 Shop button in the banner. Wearing is fully up to you:
**every item can be equipped or unequipped** once you own it.

#### ⭐ Streak gear (unlocked every 5 streak days)

| Streak | Gadget | Icon |
|---|---|---|
| **5 days** | Black glasses 🕶 | Cool shades with a shine |
| **10 days** | Gold chain ⛓ | Gold links + star medallion |
| **15 days** | Hero cape 🦸 | Flowing red cape with gold trim |
| **20 days** | Golden halo ✨ | Floating ring of light |
| **25 days** | Royal crown 👑 | Grand gold crown — the exclusive 25-day piece |
| **30 days** | Rainbow trail 🌈 | Shimmering rainbow arcs left in his wake |

Streak gear is **auto-worn** the moment it unlocks (with a spin + toast), and is
removed automatically only if your streak ever slips below its tier.

#### 🎁 Daily chest
A free **daily chest** (5–15 🪙) waits in the banner every day — open it once,
then it shows "Opened" until tomorrow.

#### 🪙 Coin shop (earn 1 coin per completed task)

| Price | Item | Icon | Rarity |
|---|---|---|---|
| 10 | Ninja headband | 🥷 | Common |
| 15 | Street cap | 🧢 | Common |
| 20 | Knight shield | 🛡 | Common |
| 25 | Hero sword | ⚔ | Common |
| 25 | Turtle pet | 🐢 | Rare |
| 30 | Archer bow | 🏹 | Rare |
| 30 | Cat pet | 🐈 | Rare |
| 30 | Dog pet | 🐶 | Rare |
| 35 | Top hat | 🎩 | Epic |
| 35 | Magic wand | 🪄 | Rare |
| 35 | Fairy wings | 🦋 | Epic |
| 40 | Owl pet | 🦉 | Epic |
| 40 | Sea trident | 🔱 | Epic |
| 45 | Fox pet | 🦊 | Epic |
| 45 | Lightning aura | ⚡ | Legendary |
| 25 | Bubble aura | 🫧 | Rare |
| 30 | Flower petals | 🌸 | Rare |
| 35 | Music notes | 🎵 | Epic |
| 40 | Ice shards | ❄️ | Epic |
| 50 | Fire flames | 🔥 | Legendary |
| 60 | Mini dragon | 🐲 | Legendary |

Shop items are grouped by **category** (accessories / weapons / pets / effects)
with **rarity** badges, and the modal doubles as a **dressing room** — a live
preview of Zico updates with every change. A **"Wear all"** shortcut equips (or
strips) everything you own in one tap. The five **effects** (bubbles, petals,
notes, ice, fire) animate live around Zico — even in the banner and dressing room.

#### 🪙 Bonus coins
- **Perfect day** — completing all tasks pays a **+5** bonus (with the confetti rain)
- **End day** — capping a 100% day gives **+5**, a 50%+ day **+2**
- **Milestones** — saving up 50 / 100 / 200 / 500 coins earns a fanfare toast

Purchased items are equipped immediately, and pets sit beside Zico, weapons are
held at his side, and hats cover the crown. A `+N 🪙` popup floats up over the
track every time you complete tasks.

### Experience
- Animated **Today / History** view switcher with sliding highlight
- **All / Active / Done** filters with a spring-animated indicator and live counts
- **Dark / light theme** toggle — animated sun ↔ moon with twinkling stars; remembers your choice
  and follows your system preference by default
- Toast notifications for every action
- **Accessible wardrobe modal** — opening it locks page scroll, focuses the
  dialog, traps Tab inside it, and restores focus + scroll on close (Esc works too)
- Live tab title showing pending count: `(3) Make Zico Great Again`
- Full **`prefers-reduced-motion`** support, semantic HTML, ARIA roles, and visible focus rings
- Custom favicon, adaptive browser theme color, and social (OG/Twitter) meta tags

### Backup
- **Export backup** — download your full dataset (tasks, history, suggestions) as a JSON file
- **Import backup** — restore from a previously exported file (validated on import)
- **Reset to project defaults** — reload from `src/data/taskflow.json`

---

## 🚀 Getting started

```bash
npm install       # install dependencies
npm run dev       # start the dev server
```

### Build & verify

```bash
npm run build      # production build into dist/
npm run preview    # preview the production build
npm run typecheck  # TypeScript strict type checking
```

The build is configured with `vite-plugin-singlefile`, so `dist/index.html` is a single
self-contained file you can open anywhere or host on any static server.

---

## 🧠 How the daily cycle works

1. **Add tasks** during the day — every task you add is remembered in your suggestion library.
2. **Open the app the next day** — yesterday is automatically archived into **History**
   and today starts clean.
3. **Suggestions appear** as tappable chips, ranked by carry-over, frequency, and routine.
4. **History view** shows each past day with a completion ring, done/missed tasks,
   a 14-day trend chart, and lifetime stats.

Hit **"End day"** any time to archive manually.

---

## 💾 Where your data lives

| Layer | Location | Purpose |
|---|---|---|
| **Project defaults** | `src/data/taskflow.json` | Ships with the repo — routine suggestions, starter tasks and any pre-loaded history |
| **Live daily data** | Browser `localStorage` (auto-synced) | Your actual tasks, history and learned suggestions — saved instantly, synced across tabs |
| **Wardrobe & coins** | Browser `localStorage` (`taskflow-coins`, `taskflow-wardrobe-*`) | Coin balance, purchased items and what Zico is wearing right now |

Data is stored under `taskflow-*` keys in your browser. Because it's browser-local, use
**Export backup** to keep a copy, or to move your data to another device (import it there).

### Customizing `src/data/taskflow.json`

```jsonc
{
  "version": 2,
  "dailyRoutine": [ "Plan the day", "Deep work block (90 min)" ],  // always suggested
  "starterTasks": [ "Set today's top 3 priorities" ],              // first launch only
  "history": []                                                    // optional past days
}
```

After editing, hit **"Reset to project defaults"** in the footer to reload from the file.

---

## ⌨️ Keyboard shortcuts

| Key | Action |
|---|---|
| `/` | Focus the task input (from anywhere) |
| `Enter` | Save the new task / confirm an edit |
| `Esc` | Cancel editing, blur the input, or close the wardrobe modal |

---

## 🗂 Project structure

```
src/
├── data/
│   ├── taskflow.json        # project data file (your defaults)
│   ├── wardrobe.ts          # gadget catalog: streak gear + coin shop items
│   └── mascots.ts           # mascot roster: palettes, accessories, unlock rules
├── types/task.ts             # shared TypeScript types
├── hooks/
│   ├── useLocalStorage.ts    # persisted state + cross-tab sync
│   ├── useTheme.ts           # dark/light mode
│   ├── useToasts.ts          # toast notifications
│   ├── useTaskData.ts        # tasks, history, suggestions, streak, daily rollover, backup
│   ├── useWardrobe.ts        # coins, owned & equipped items, shop purchases, mascot
│   └── useSounds.ts          # WebAudio sound effects + mute preference
├── utils/
│   ├── cn.ts                 # Tailwind class merging
│   └── date.ts               # date helpers (formatting, rollover, greeting)
├── components/
│   ├── Header.tsx            ThemeToggle.tsx    ViewSwitcher.tsx
│   ├── Mascot.tsx            MascotBanner.tsx   CelebrationConfetti.tsx
│   ├── WardrobeModal.tsx     DayOverview.tsx    ProgressRing.tsx
│   ├── AddTaskForm.tsx       FilterTabs.tsx     TaskList.tsx
│   ├── TaskItem.tsx          EmptyState.tsx     HistoryView.tsx
│   └── ToastStack.tsx        Footer.tsx
└── App.tsx                   # composition root
```

---

## 🛠 Tech stack

- **React 19** — UI with hooks (`useState`, `useCallback`, `useMemo`, custom hooks)
- **TypeScript** — strict mode, fully typed domain models
- **Vite 7** — fast dev server + single-file production build
- **Tailwind CSS v4** — utility styling, custom keyframe animations, class-based dark mode

---

## 📄 License

© 2026 **Eng. Omar Wael** — All rights reserved.
