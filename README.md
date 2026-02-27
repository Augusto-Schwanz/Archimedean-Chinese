# Archimedean Chinese

An adaptive Mandarin Chinese flashcard application for English-speaking learners. Combines Anki-style spaced repetition (SM-2) with Bayesian Knowledge Tracing (BKT) to build a personalised model of each user's strengths and weaknesses.

---

## Quick Start

No installation required. Open `index.html` in any modern browser and you're ready to study.

For local development with a proper server (recommended):

```bash
# Python 3
python3 -m http.server 8080
# Then open: http://localhost:8080
```

---

## Hosting on GitHub Pages

1. Push this repository to GitHub
2. Go to **Settings → Pages**
3. Set source to the `main` branch, `/ (root)`
4. Your app will be live at `https://<your-username>.github.io/<repo-name>`

No build step, no dependencies, no server required.

---

## Software Requirements

| Requirement | Notes |
|---|---|
| Modern browser | Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ |
| Python 3 (optional) | Only needed to run a local dev server |
| Internet connection | For loading Google Fonts (UI still works offline without them) |

No Node.js, no npm, no Python packages.

---

## Project Structure

```
archimedean-chinese/
│
├── index.html          # Welcome screen + user profile management
├── progress.html       # Deck overview + category mastery dashboard
├── study.html          # Active flashcard study session
│
├── css/
│   └── style.css       # All styles — dark navy theme, FangSong Chinese font
│
├── js/
│   ├── data/
│   │   └── hsk1.js     # HSK 1 deck — 150 words, categorised
│   │                     Generated from HSK_1_Master_List.csv
│   │
│   ├── core/
│   │   ├── sm2.js      # SM-2 spaced repetition scheduling algorithm
│   │   ├── bkt.js      # Bayesian Knowledge Tracing model
│   │   ├── grader.js   # Answer grading (meaning + pinyin normalisation)
│   │   └── scheduler.js # Combined SM-2 + BKT card selection logic
│   │
│   ├── storage/
│   │   └── db.js       # localStorage persistence layer (all user data)
│   │
│   ├── ui/
│   │   └── i18n.js     # English / Simplified Chinese UI translations
│   │
│   ├── main.js         # index.html controller
│   ├── progress.js     # progress.html controller
│   └── study.js        # study.html controller
│
└── README.md
```

**Design principle:** the deck data, algorithms, persistence, and UI are each isolated in their own layer. You can swap out any one layer (e.g. replace localStorage with IndexedDB, or upgrade BKT to Deep Knowledge Tracing) without touching the others.

---

## How the Algorithms Work

### SM-2 (Spaced Repetition)

Each flashcard tracks an *interval* (days until next review), *ease factor* (how quickly intervals grow), and *repetition count*. After a correct response the interval grows exponentially; after an incorrect response it resets to 1 day. This ensures well-known cards are reviewed infrequently while weak cards stay in heavy rotation.

### BKT (Bayesian Knowledge Tracing)

BKT models the probability that a user has *mastered* a knowledge component — in this app, a component is a part-of-speech category (e.g. `noun`, `verb`) combined with card type (`meaning` or `pinyin`). After each response the model updates using Bayes' rule, accounting for the possibility of lucky guesses and careless mistakes.

Parameters per component:
- **p_known** — current estimated mastery probability
- **p_learn** — probability of learning the component after one exposure
- **p_guess** — probability of correct answer despite not knowing
- **p_slip** — probability of incorrect answer despite knowing

### Combined Scheduler

```
Session starts
  → BKT ranks categories by weakness (lowest p_known first)
  → SM-2 finds cards due for review within those categories
  → Due cards in weak categories are surfaced first
  → If no due cards in a weak category, surface new (unseen) cards
  → After response: SM-2 updates interval; BKT updates p_known
```

---

## Flashcard Types

Each of the 150 HSK 1 words generates **two cards**:

| Type | Prompt | Expected Answer |
|---|---|---|
| **Meaning** | Chinese character | English definition (any accepted variant) |
| **Pinyin** | Chinese character | Pinyin romanisation (tone marks or numbers, spacing ignored) |

### Pinyin Grading

Both formats are accepted and normalised before comparison:
- Tone marks: `wǒ`, `nǐhǎo`
- Numbered: `wo3`, `ni3hao3`
- Spacing: `wo3 men` = `wo3men`

### Override System

If the automatic grader marks an answer incorrect but the user believes it was valid, they can click **Mark as Correct** and select a reason (mis-typed, equivalent translation, alternate romanisation, other). This records a corrective positive signal to both SM-2 and BKT.

---

## User Profiles

- Multiple profiles are supported with no password required
- Each profile stores its own SM-2 card states, BKT model weights, and review history
- Language preference (EN / 中文) is stored per profile and restored automatically on login
- All data lives in browser localStorage — clearing localStorage resets all progress
- For a production deployment, migrate `js/storage/db.js` to IndexedDB or a backend database

---

## Extending the App

### Adding a new deck

1. Create `js/data/hsk2.js` following the same structure as `hsk1.js`
2. Add the deck to `window.AC.DECKS` with a unique `id`
3. Add a deck selector to `progress.html` (currently assumes one deck)

### Adding new card types

New card types (e.g. character → audio, translation) can be added by:
1. Extending `buildCards()` in `scheduler.js`
2. Adding a grading branch in `grader.js`
3. Updating the study session UI in `study.html` / `study.js`

### Upgrading the ML model

The BKT model in `js/core/bkt.js` can be replaced with a more sophisticated model (e.g. Deep Knowledge Tracing) by preserving the same interface:
- `newComponent()` → initial state
- `update(component, correct)` → updated state
- `selectionPriority(component)` → priority score for scheduling

No other files need to change.

---

## Data Storage Schema

All data is stored in `localStorage` under these keys:

| Key | Contents |
|---|---|
| `ac_users` | Array of user objects `{id, name, lang, showWelcome}` |
| `ac_current_user` | ID of the currently active user |
| `ac_cards_{userId}` | Object mapping cardId → SM-2 state |
| `ac_bkt_{userId}` | Object mapping componentKey → BKT component |
| `ac_reviews_{userId}` | Array of review events (capped at 2000) |

---

## Known Limitations (MVP)

- **Cold start**: The BKT model has no data for new users; initial card selection is essentially random within SM-2 constraints. This resolves quickly after the first ~20 cards.
- **localStorage only**: Data does not sync across devices or browsers. Clearing browser data resets all progress.
- **Single deck**: Only HSK 1 vocabulary is available. HSK 2–6 decks can be added following the existing structure.
- **No audio**: Pronunciation audio is not included. A future version could integrate text-to-speech.
- **Session limit**: Sessions are capped at 40 cards to prevent fatigue. Adjustable in `study.js`.

---

## Licence

MIT — free to use, modify, and distribute.
