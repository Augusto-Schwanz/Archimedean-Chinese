// ============================================================
// js/core/sm2.js — SM-2 Spaced Repetition Algorithm
//
// Based on the SuperMemo SM-2 algorithm by Piotr Wozniak.
// Each card state tracks: interval, easeFactor, repetitions, dueDate.
//
// Grade scale (passed in from grading logic):
//   5 — perfect response
//   4 — correct after hesitation
//   3 — correct with difficulty (used for overrides)
//   0 — incorrect
// ============================================================
window.AC = window.AC || {};

window.AC.SM2 = (() => {

  const DEFAULT_EASE   = 2.5;   // Starting ease factor
  const MIN_EASE       = 1.3;   // Floor for ease factor
  const INITIAL_INTERVAL_1 = 1; // Days after first correct
  const INITIAL_INTERVAL_2 = 6; // Days after second correct

  /**
   * Returns a fresh SM-2 card state for a brand-new card.
   */
  function newCardState() {
    return {
      interval:    0,
      easeFactor:  DEFAULT_EASE,
      repetitions: 0,
      dueDate:     todayStr(),   // Due immediately (new card)
      lapses:      0
    };
  }

  /**
   * Update a card's SM-2 state after a review.
   * @param {object} state  — current card state
   * @param {number} grade  — 0, 3, 4, or 5
   * @returns {object}      — updated card state (does not mutate input)
   */
  function review(state, grade) {
    const s = { ...state };

    if (grade >= 3) {
      // Correct response
      if (s.repetitions === 0) {
        s.interval = INITIAL_INTERVAL_1;
      } else if (s.repetitions === 1) {
        s.interval = INITIAL_INTERVAL_2;
      } else {
        s.interval = Math.round(s.interval * s.easeFactor);
      }
      s.repetitions += 1;
      // Update ease factor
      s.easeFactor = Math.max(
        MIN_EASE,
        s.easeFactor + 0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)
      );
    } else {
      // Incorrect — reset repetitions, short interval
      s.repetitions = 0;
      s.interval    = 1;
      s.lapses      = (s.lapses || 0) + 1;
      // Slightly reduce ease on lapse
      s.easeFactor = Math.max(MIN_EASE, s.easeFactor - 0.2);
    }

    s.dueDate = addDays(todayStr(), s.interval);
    return s;
  }

  /**
   * Returns true if a card is due today or overdue.
   */
  function isDue(state) {
    return state.dueDate <= todayStr();
  }

  /**
   * Returns true if a card has never been reviewed (new card).
   */
  function isNew(state) {
    return state.repetitions === 0 && state.dueDate === todayStr();
  }

  // ── Date helpers ──────────────────────────────────────────

  function todayStr() {
    return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
  }

  function addDays(dateStr, days) {
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }

  return { newCardState, review, isDue, isNew, todayStr };
})();
