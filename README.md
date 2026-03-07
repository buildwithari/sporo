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
1. Open a unit — Claude generates 5-6 micro-lessons (cached after first load)
2. Step 1: a plain-English summary of what you're building
3. Each lesson: one concept, one tiny coding task, instant AI feedback
4. Each correct step → XP + auto-advance animation
5. Final step: the real LeetCode problem statement + full editor to put it all together
6. Pass all test cases → the seed is **planted** 🌱

### Spaced Repetition (watering schedule)
Once a problem is solved, it gets scheduled for review. When recall day comes:
- **Solve it cold** → passes → interval grows (1 → 3 → 7 → 14 → 30 → 60 days) 🌿
- **Get stuck** → drop back into lessons → re-learn the piece you forgot 🪴
- **Overdue recalls** appear in red on the roadmap and get prioritized in your daily plan

### Concept Pages
Click any milestone banner to open its concept guide — a pre-written article explaining the topic from first principles. An AI assistant sidebar is always available to answer follow-up questions.

### Daily Garden Plan
Tell the app how much time you have (15 / 30 / 45 / 60 min). It builds your to-do list:

```
🔁 Recall — Contains Duplicate  (overdue — water now!)
🔁 Recall — Two Sum             (due today)
🌱 Continue — Valid Anagram     (step 3 of 6)
⭐ New     — Group Anagrams     (when you're ready)
```

Open the app. Follow the list. Close it. Done.

### Forest & Shop
Spend your XP on plants — 19 plants across 4 rarities (Common → Legendary). Every plant you buy lives in your personal forest. It's pointless and motivating at the same time.

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
| Solve a full problem (first time) | +50 |
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
│   │   ├── LessonStep/       # Lesson flow + individual step cards
│   │   ├── Milestone/        # Concept article page + AI chat sidebar
│   │   ├── DailyPlan/        # Time-budgeted study plan
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

*Built for one person. Just to get hired. Then never touch a LeetCode problem again.*
