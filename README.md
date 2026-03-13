# 🌱 Sporo

> *Every algorithm starts as a spore. You just need to water it.*

A personal DSA learning app built around one idea: **hard problems aren't hard — they're just too big.** Sporo breaks every problem into 1-2 line micro-lessons, waters them with spaced repetition, and watches them bloom.

No more staring at a blank editor. No more guilt-spiraling over Neetcode 150. Just open the app, tend your garden, and close it feeling good.

---

## 🌿 The Philosophy

Most DSA apps throw you at a problem and wait. Sporo does the opposite — it walks you through each problem like a garden path, one stepping stone at a time.

**Milestones** are topics (Arrays, Trees, Graphs...)
**Units** are problems (Two Sum, Valid Anagram...)
**Lessons** are the micro-steps inside each problem — one logical idea, 1-2 lines of code, completable in ~5 minutes

Claude breaks each problem into lessons the first time you open a unit. You never have to figure out where to begin. You just write the next line.

---

## 🌸 How It Works

### Learning a new problem
Each problem is split into two parts:

**Part 1 — Brute Force 🔨**
1. Open a unit — Claude generates 3-4 micro-lessons for the brute-force approach (cached after first load)
2. An intro card explains the strategy in plain English before any coding
3. Each lesson: one concept, one tiny coding task, instant AI feedback
4. Function signature shown as a read-only reference — you only write the logic
5. Each correct step → XP + auto-advance animation
6. Final step: full-screen editor to put the brute force together
7. Pass → the seed is **planted** 🌱, advance to Part 2

**Part 2 — Optimize 🚀**
1. Another 3-4 micro-lessons, each teaching one small change that improves the solution
2. Your accepted brute-force is shown as a collapsible reference panel while you write fresh optimal code
3. Final step: full-screen editor for the complete optimal solution
4. Pass → XP awarded, problem fully **planted** 🌱

### Spaced Repetition (watering schedule)
Once a problem is solved, it gets scheduled for review. When recall day comes:
- **Solve it cold** → passes → interval grows (1 → 3 → 7 → 14 → 30 → 60 days) 🌿
- **Get stuck** → hit "I'm stuck" → drops back into the optimization lessons → re-learn the piece you forgot 🪴
- **Overdue recalls** appear in red on the roadmap and get prioritized in your daily plan

### Concept Pages
Click any milestone banner to open its concept guide — a pre-written article explaining the topic from first principles. An AI assistant sidebar is always available to answer follow-up questions.

### Daily Task Widget
A persistent widget in the top-right corner of the home screen shows your top 3 tasks for the day — no setup needed:

```
🔁 Contains Duplicate  (overdue)
🔁 Two Sum             (due today)
🌱 Valid Anagram       (new)
```

- Click any task to jump straight into it
- Completed tasks get a strikethrough in place
- More than 3 tasks? A **Done** tab holds the completed ones while fresh tasks slide in

### Daily Garden Plan
Tell the app how much time you have (15 / 30 / 45 / 60 min). It builds a fuller to-do list with time estimates.

Open the app. Follow the list. Close it. Done.

### Forest & Shop
Spend your XP on plants — 19 plants across 4 rarities (Common → Legendary). Every plant you buy lives in your personal forest.

---

## 🗺️ Roadmap

Following the **Neetcode 150** curriculum, structured as a garden path:

- 🗂️ **Arrays & Hashing** ← start here (fully implemented)
- 👆 **Two Pointers**
- 🪟 **Sliding Window**
- 📚 **Stack**
- 🔍 **Binary Search**
- 🔗 **Linked List**
- 🌳 **Trees**
- 📊 **Graphs**
- 📐 **Dynamic Programming**
- ...and 9 more milestones

---

## 🛠️ Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React + Vite |
| Styling | Tailwind CSS v3 |
| Code Editor | CodeMirror (`@uiw/react-codemirror`) |
| AI Lessons | Anthropic Claude API (`claude-sonnet-4-6`) |
| Storage | localStorage (no backend) |
| Language | Java |

---

## 🌱 Getting Started

```bash
git clone https://github.com/yourusername/sporo.git
cd sporo

npm install

# Add your Anthropic API key
echo "VITE_ANTHROPIC_API_KEY=your_key_here" > .env

npm run dev
```

Open `http://localhost:5173` and start planting.

---

## 🎮 XP & Progression

| Action | XP |
|---|---|
| Complete a micro-lesson step | +10 |
| Solve brute force (first time) | +20 |
| Solve optimal solution (first time) | +50 |
| Successful recall (no hints) | +30 |
| Successful recall (with hints) | +15 |

XP persists in localStorage. Spend it in the Forest shop on plants ranging from 10 XP (Sprout) to 800 XP (Weeping Willow).

---

## 📁 Project Structure

```
sporo/
├── src/
│   ├── components/
│   │   ├── Roadmap/          # Duolingo-style winding path home screen
│   │   ├── LessonStep/       # Two-part lesson flow + individual step cards
│   │   ├── Milestone/        # Concept article page + AI chat sidebar
│   │   ├── DailyPlan/        # Time-budgeted study plan
│   │   ├── DailyTask/        # Fixed top-right daily task widget
│   │   ├── Forest/           # Plant shop + forest display
│   │   └── Celebration/      # XP overlay on lesson complete
│   ├── data/
│   │   ├── neetcode150.js    # All 18 milestones + problem definitions
│   │   ├── milestoneGuides.js # Pre-written concept articles
│   │   └── plants.js         # Plant catalog for the forest shop
│   ├── lib/
│   │   ├── srs.js            # Spaced repetition (SM-2 inspired)
│   │   ├── claude.js         # Lesson generation, code eval, chat
│   │   ├── lessonCache.js    # Separate localStorage cache for lessons
│   │   └── progress.js       # XP, streaks, unit state, forest
│   └── App.jsx
├── .env
├── package.json
└── README.md
```

---
