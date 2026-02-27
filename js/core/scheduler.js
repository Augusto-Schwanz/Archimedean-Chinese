// ============================================================
// js/core/scheduler.js — SM-2 + BKT Combined Card Scheduler
//
// Flow:
//   1. BKT identifies which categories the user is weakest in.
//   2. SM-2 determines which individual cards within those
//      categories are due for review.
//   3. If due cards exist in weak categories, surface those first.
//   4. If no due cards exist in a weak category, surface NEW
//      (unseen) cards from that category instead.
//   5. Fall back to any due/new cards from other categories.
//
// Depends on: window.AC.SM2, window.AC.BKT, window.AC.DB
// ============================================================
window.AC = window.AC || {};

window.AC.Scheduler = (() => {

  /**
   * Get the BKT component key for a given word and card type.
   * Groups by part-of-speech for BKT tracking.
   */
  function componentKey(word, cardType) {
    return `${word.pos}__${cardType}`;
  }

  /**
   * Build the full list of card objects for a deck.
   * Each word generates two cards: 'meaning' and 'pinyin'.
   */
  function buildCards(deck) {
    const cards = [];
    for (const word of deck.words) {
      cards.push({ id: `${word.id}_meaning`, wordId: word.id, type: 'meaning', word });
      cards.push({ id: `${word.id}_pinyin`,  wordId: word.id, type: 'pinyin',  word });
    }
    return cards;
  }

  /**
   * Select the next card for a user to review.
   *
   * @param {string} userId
   * @param {object} deck     — deck data from hsk1.js
   * @param {object} db       — window.AC.DB instance
   * @returns {object|null}   — card object, or null if nothing to study
   */
  function nextCard(userId, deck, db) {
    const cards      = buildCards(deck);
    const today      = window.AC.SM2.todayStr();

    // Partition cards into due, new, and future
    const due    = [];
    const newCards = [];

    for (const card of cards) {
      const state = db.getCardState(userId, card.id);
      if (!state) {
        // Never seen
        newCards.push(card);
      } else if (window.AC.SM2.isDue(state)) {
        due.push(card);
      }
      // else: scheduled for future — skip for now
    }

    if (due.length === 0 && newCards.length === 0) return null;

    // Get BKT states to rank categories by weakness
    const bktStates = db.getBKTStates(userId);

    // Score each candidate card by BKT priority of its category
    function cardPriority(card) {
      const key  = componentKey(card.word, card.type);
      const comp = bktStates[key] || window.AC.BKT.newComponent();
      return window.AC.BKT.selectionPriority(comp);
    }

    // Prefer due cards; sort by BKT priority (highest first)
    if (due.length > 0) {
      due.sort((a, b) => cardPriority(b) - cardPriority(a));
      return due[0];
    }

    // No due cards — pick new card from weakest category
    newCards.sort((a, b) => cardPriority(b) - cardPriority(a));
    return newCards[0];
  }

  /**
   * Process a completed review for a card.
   * Updates both SM-2 (card state) and BKT (category state).
   *
   * @param {string}  userId
   * @param {object}  card    — card object
   * @param {boolean} correct — whether the user got it right
   * @param {object}  db      — window.AC.DB instance
   */
  function recordReview(userId, card, correct, db) {
    const grade = correct ? 5 : 0;

    // Update SM-2
    const prevState = db.getCardState(userId, card.id) || window.AC.SM2.newCardState();
    const newState  = window.AC.SM2.review(prevState, grade);
    db.setCardState(userId, card.id, newState);

    // Update BKT
    const key      = componentKey(card.word, card.type);
    const bktStates = db.getBKTStates(userId);
    const prevComp  = bktStates[key] || window.AC.BKT.newComponent();
    const newComp   = window.AC.BKT.update(prevComp, correct);
    db.setBKTComponent(userId, key, newComp);

    // Log the review event
    db.logReview(userId, {
      cardId:    card.id,
      wordId:    card.wordId,
      cardType:  card.type,
      pos:       card.word.pos,
      correct,
      timestamp: Date.now()
    });
  }

  /**
   * Count cards due today and new cards for a user.
   */
  function sessionStats(userId, deck, db) {
    const cards = buildCards(deck);
    let dueCount = 0, newCount = 0;
    for (const card of cards) {
      const state = db.getCardState(userId, card.id);
      if (!state) newCount++;
      else if (window.AC.SM2.isDue(state)) dueCount++;
    }
    return { dueCount, newCount, total: cards.length };
  }

  return { nextCard, recordReview, sessionStats, componentKey, buildCards };
})();
