/**
 * sm2.js
 * Anki's SM-2 spaced repetition algorithm.
 *
 * Per-card state stored per user:
 *   interval    – days until next review (0 = due today or new)
 *   repetitions – number of successful reviews in a row
 *   ef          – ease factor (starts at 2.5, min 1.3)
 *   dueDate     – ISO date string (YYYY-MM-DD) of next review
 */

const SM2 = (() => {

  const INITIAL_EF = 2.5;
  const MIN_EF     = 1.3;

  /** Return a fresh card state for a card never seen before. */
  function newCardState() {
    return {
      interval:    0,
      repetitions: 0,
      ef:          INITIAL_EF,
      dueDate:     today(),   // new cards are always "due"
    };
  }

  /**
   * Update a card's SM-2 state after a response.
   * @param {object}  state    – current card state
   * @param {boolean} correct  – whether the answer was correct
   * @returns {object} new card state (does not mutate original)
   */
  function update(state, correct) {
    let { interval, repetitions, ef } = state;

    // Map correct/incorrect to SM-2 quality grade:
    //   correct → 4 (good response with hesitation)
    //   incorrect → 1 (incorrect, but remembered after seeing answer)
    const q = correct ? 4 : 1;

    if (q >= 3) {
      // Correct response
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * ef);
      }
      repetitions += 1;
    } else {
      // Incorrect: reset
      repetitions = 0;
      interval = 1;
    }

    // Update ease factor
    ef = ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    ef = Math.max(MIN_EF, ef);

    const dueDate = addDays(today(), interval);
    return { interval, repetitions, ef, dueDate };
  }

  /**
   * Determine whether a card is due for review.
   * New cards (dueDate === today or earlier) are always due.
   */
  function isDue(state) {
    return state.dueDate <= today();
  }

  /**
   * How many days overdue is a card? Negative = not yet due.
   */
  function daysOverdue(state) {
    return daysBetween(state.dueDate, today());
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  function today() {
    return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  }

  function addDays(dateStr, n) {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  }

  function daysBetween(dateA, dateB) {
    const msPerDay = 86400000;
    return Math.round((new Date(dateB) - new Date(dateA)) / msPerDay);
  }

  return { newCardState, update, isDue, daysOverdue, today };

})();
