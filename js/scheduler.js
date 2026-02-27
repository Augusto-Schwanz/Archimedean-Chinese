/**
 * scheduler.js
 * Combines BKT and SM-2 to build an ordered study queue.
 *
 * Strategy:
 *  1. Separate cards into: due (SM-2 says review today) and new (never seen).
 *  2. Within each group, sort by BKT mastery of their component (ascending)
 *     so weaker categories are prioritised.
 *  3. Queue = due cards + new cards (up to NEW_CARDS_PER_SESSION).
 *  4. A small shuffle within same-priority tier prevents monotony.
 */

const Scheduler = (() => {

  const NEW_CARDS_PER_SESSION    = 20;  // max new cards introduced per session
  const MAX_SESSION_SIZE         = 60;  // hard cap on total cards per session

  /**
   * Build and return the session queue for a user.
   *
   * @param {object} sm2State  – { [cardId]: SM2CardState }
   * @param {object} bktState  – { [componentKey]: BKTComponentState }
   * @returns {string[]} ordered array of card IDs
   */
  function buildQueue(sm2State, bktState) {
    const due   = [];
    const newCards = [];

    DECK.forEach(card => {
      const cardState = sm2State[card.id];
      if (!cardState || SM2.isDue(cardState)) {
        if (!cardState) {
          newCards.push(card);
        } else {
          due.push(card);
        }
      }
    });

    // Score each card by its component's mastery (lower = higher priority)
    const score = (card) => BKT.getMastery(bktState, `${card.category}:${card.cardType}`);

    // Sort both groups by mastery ascending (weakest first)
    due.sort((a, b) => score(a) - score(b));
    newCards.sort((a, b) => score(a) - score(b));

    // Shuffle within same mastery tier (±0.05 bucket) to reduce predictability
    const tieredShuffle = (arr) => {
      const result = [];
      let i = 0;
      while (i < arr.length) {
        const tierScore = score(arr[i]);
        let j = i;
        while (j < arr.length && Math.abs(score(arr[j]) - tierScore) < 0.05) j++;
        const tier = arr.slice(i, j);
        shuffleInPlace(tier);
        result.push(...tier);
        i = j;
      }
      return result;
    };

    const orderedDue  = tieredShuffle(due);
    const orderedNew  = tieredShuffle(newCards).slice(0, NEW_CARDS_PER_SESSION);

    // Interleave new cards periodically to avoid review fatigue
    const queue = interleave(orderedDue, orderedNew, 4); // 1 new per 4 reviews
    return queue.slice(0, MAX_SESSION_SIZE).map(c => c.id);
  }

  /**
   * Interleave two arrays: insert one item from `b` every `stride` items from `a`.
   */
  function interleave(a, b, stride) {
    const result = [];
    let ai = 0, bi = 0;
    while (ai < a.length || bi < b.length) {
      for (let s = 0; s < stride && ai < a.length; s++, ai++) result.push(a[ai]);
      if (bi < b.length) result.push(b[bi++]);
    }
    return result;
  }

  function shuffleInPlace(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  /**
   * Count how many cards are currently due for a user (for dashboard display).
   */
  function countDue(sm2State) {
    return DECK.filter(card => {
      const s = sm2State[card.id];
      return !s || SM2.isDue(s);
    }).length;
  }

  return { buildQueue, countDue };

})();
