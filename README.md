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
- **History view** with per-day completion rings, ✅ done / ❌ missed breakdown
- 14-day **completion trend chart** and lifetime stats (days tracked, tasks done, avg rate)

### Mascot — Zico 🤖
- A cute animated blob character that walks a **progress track** through your day —
  the more tasks you complete, the further Zico walks toward the 🚩 finish line
- **Reacts to achieved tasks**: jumps with a celebration ring every time you check
  something off, gets star-sparkle eyes and rising hearts as you near 100%
- **Reacts to missed tasks**: worried brows, sweat drops and tears flow faster the
  more tasks stay pending
- **Happier with every 5-day streak milestone** — smile, sparkles, and a crown with confetti 🎉
- **Sadder with each past day tasks were left unfinished** — droopy eyes, tears and
  a worried wiggle
- **One-shot reactions**: a greeting wave on load, a jump on each completion, a
  deflating sigh when a task is un-checked, and a full spin on level-up
- Completing *everything* today triggers a **full-screen confetti rain**
- **Streak milestone toasts** celebrate every 5th day (5, 10, 15…)
- Character mood drives motivational messages tailored to how your day is going

### Zico's gadget wardrobe 🎁
Zico unlocks a new piece of gear every **5 days of streak** — each one appears on
his model and lights up in the **Gear** gallery in the banner:

| Streak | Gadget | Icon |
|---|---|---|
| **5 days** | Black glasses 🕶 | Cool shades with a shine |
| **10 days** | Gold chain ⛓ | Gold links + star medallion |
| **15 days** | Hero cape 🦸 | Flowing red cape that waves |
| **20 days** | Golden halo ✨ | Floating ring of light |
| **25 days** | Royal crown 👑 | Grand gold crown with gems |

Locked gadgets stay greyed out with a tooltip showing how many days remain until
the unlock. Level-up triggers a spin animation and a celebratory toast.

### Experience
- Animated **Today / History** view switcher with sliding highlight
- **All / Active / Done** filters with a spring-animated indicator and live counts
- **Dark / light theme** toggle — animated sun ↔ moon with twinkling stars; remembers your choice
  and follows your system preference by default
- Toast notifications for every action
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
| `Esc` | Cancel editing or blur the input |

---

## 🗂 Project structure

```
src/
├── data/taskflow.json        # project data file (your defaults)
├── types/task.ts             # shared TypeScript types
├── hooks/
│   ├── useLocalStorage.ts    # persisted state + cross-tab sync
│   ├── useTheme.ts           # dark/light mode
│   ├── useToasts.ts          # toast notifications
│   └── useTaskData.ts        # tasks, history, suggestions, streak, daily rollover, backup
├── utils/
│   ├── cn.ts                 # Tailwind class merging
│   └── date.ts               # date helpers (formatting, rollover, greeting)
├── components/
│   ├── Header.tsx            ThemeToggle.tsx    ViewSwitcher.tsx
│   ├── Mascot.tsx            MascotBanner.tsx   CelebrationConfetti.tsx
│   ├── DayOverview.tsx       ProgressRing.tsx   AddTaskForm.tsx
│   ├── FilterTabs.tsx        TaskList.tsx       TaskItem.tsx
│   ├── EmptyState.tsx        HistoryView.tsx
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
