# 🌱 Sporo

> *Every algorithm starts as a spore. You just need to water it.*

A personal DSA learning app built around one idea: **hard problems aren't hard — they're just too big.** DSA Garden breaks every problem into 1-2 line micro-lessons, waters them with spaced repetition, and watches them bloom.

No more staring at a blank editor. No more guilt-spiraling over Neetcode 150. Just open the app, tend your garden, and close it feeling good.

---

## 🌿 The Philosophy

Most DSA apps throw you at a problem and wait. DSA Garden does the opposite — it walks you through each problem like a garden path, one stepping stone at a time.

**Milestones** are topics (Arrays, Trees, Graphs...)
**Units** are problems (Two Sum, Valid Anagram...)
**Lessons** are the micro-steps inside each problem — one logical idea, 1-2 lines of code, completable in ~5 minutes

Claude breaks each problem into lessons at the start of a unit. You never have to figure out where to begin. You just write the next line.

---

## 🌸 How It Works

### Learning a new problem
1. Open a unit — Claude generates 5-6 micro-lessons for it
2. Each lesson: one concept, one tiny coding task, instant feedback
3. Each correct step → XP + satisfying animation
4. Final step: combine everything into the full solution
5. Run against real test cases — if it passes, the seed is **planted** 🌱

### Spaced Repetition (watering schedule)
Once a problem is solved, it gets scheduled for review. When recall day comes:
- **Solve it cold** → passes → interval grows (3 → 7 → 14 → 30 days) 🌿
- **Get stuck** → drop back into lessons → re-learn the piece you forgot → solve again 🪴
- **Overdue recalls get priority** — the app always tells you what to water today

### Daily Garden Plan
Tell the app how much time you have (15 min? 45 min?). It builds your to-do list:

```
🔁 Recall — Contains Duplicate  (overdue — water now!)
🔁 Recall — Two Sum             (due today)
🌱 Continue — Valid Anagram     (step 3 of 6)
⭐ New     — Group Anagrams     (when you're ready)
```

Open the app. Follow the list. Close it. Done.

---

## 🗺️ Roadmap

Following the **Neetcode 150** curriculum, structured as a garden path:

- 🗂️ **Arrays & Hashing** ← start here
- 👆 **Two Pointers**
- 🪟 **Sliding Window**
- 📚 **Stack**
- 🔍 **Binary Search**
- 🔗 **Linked List**
- 🌳 **Trees**
- 🔄 **Tries**
- 💎 **Heap / Priority Queue**
- 🔙 **Backtracking**
- 📊 **Graphs**
- 🧭 **Advanced Graphs**
- 📐 **1D Dynamic Programming**
- 🏗️ **2D Dynamic Programming**
- 🤸 **Greedy**
- 🕳️ **Intervals**
- 📐 **Math & Geometry**
- 🧮 **Bit Manipulation**

---

## 🛠️ Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React + Vite | Fast, simple local dev |
| Styling | Tailwind CSS | Utility-first, quick iterations |
| Code Editor | CodeMirror | Lightweight, embeddable |
| Code Execution | Judge0 (self-hosted) or Claude API | Run Java solutions against test cases |
| AI Lessons | Anthropic Claude API | Generates micro-lessons + feedback |
| Storage | localStorage | Personal use, no backend needed |
| Language | Java | Because that's what you know |

---

## 🌱 Getting Started

```bash
# Clone the repo
git clone https://github.com/yourusername/dsa-garden.git
cd dsa-garden

# Install dependencies
npm install

# Add your Anthropic API key
cp .env.example .env
# Edit .env and add: VITE_ANTHROPIC_API_KEY=your_key_here

# Start the app
npm run dev
```

Open `http://localhost:5173` and start planting.

---

## 🎮 XP & Progression

| Action | XP |
|---|---|
| Complete a micro-lesson | +10 🌱 |
| Solve a full problem (first time) | +50 🌸 |
| Successful recall (no hints) | +30 💧 |
| Successful recall (with hints) | +15 💧 |
| Daily streak bonus | +20 ⚡ |

Streaks, mastery bars per topic, and a garden that visually grows as you progress.

---

## 💡 Design Principles

- **One thing on screen at a time** — never overwhelming
- **Every session has a clear end** — you always know when you're done for the day
- **Failure is cheap** — wrong answer = gentle hint, not shame
- **Wins are loud** — correct answers get celebrated way more than they deserve
- **You never decide what to study** — the app decides, you just show up

---

## 📁 Project Structure (planned)

```
dsa-garden/
├── src/
│   ├── components/
│   │   ├── Roadmap/          # Garden path home screen
│   │   ├── LessonStep/       # Duolingo-style lesson card
│   │   ├── CodeEditor/       # CodeMirror wrapper
│   │   ├── DailyPlan/        # Today's to-do list
│   │   └── Celebration/      # XP animations, confetti
│   ├── data/
│   │   └── neetcode150.js    # Problem definitions + test cases
│   ├── lib/
│   │   ├── srs.js            # Spaced repetition algorithm
│   │   ├── claude.js         # Lesson generation + hint API
│   │   └── progress.js       # XP, streaks, localStorage
│   └── App.jsx
├── .env.example
├── package.json
└── README.md
```

---

*Built for one person. Just to get hired. Then never touch a leetcode problem again.*
