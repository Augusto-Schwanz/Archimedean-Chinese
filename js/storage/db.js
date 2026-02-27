// ============================================================
// js/storage/db.js — localStorage Persistence Layer
//
// All user data is stored in localStorage under namespaced keys.
// Key schema:
//   ac_users                     → [{id, name, lang, showWelcome}]
//   ac_current_user              → userId string
//   ac_cards_{userId}            → { cardId: SM2State }
//   ac_bkt_{userId}              → { componentKey: BKTComponent }
//   ac_reviews_{userId}          → [ReviewEvent, ...]
//
// For a production app, migrate to IndexedDB for larger datasets.
// ============================================================
window.AC = window.AC || {};

window.AC.DB = (() => {

  // ── Internal helpers ─────────────────────────────────────

  function load(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  function save(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('AC.DB: localStorage write failed', e);
    }
  }

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  // ── User Management ──────────────────────────────────────

  function getUsers() {
    return load('ac_users') || [];
  }

  function saveUsers(users) {
    save('ac_users', users);
  }

  function createUser(name, lang = 'en') {
    const users = getUsers();
    const user = {
      id:          generateId(),
      name:        name.trim(),
      lang:        lang,
      showWelcome: true,
      createdAt:   Date.now()
    };
    users.push(user);
    saveUsers(users);
    return user;
  }

  function getUser(userId) {
    return getUsers().find(u => u.id === userId) || null;
  }

  function updateUser(userId, changes) {
    const users = getUsers().map(u =>
      u.id === userId ? { ...u, ...changes } : u
    );
    saveUsers(users);
  }

  function deleteUser(userId) {
    const users = getUsers().filter(u => u.id !== userId);
    saveUsers(users);
    // Clean up user data
    localStorage.removeItem(`ac_cards_${userId}`);
    localStorage.removeItem(`ac_bkt_${userId}`);
    localStorage.removeItem(`ac_reviews_${userId}`);
    if (getCurrentUserId() === userId) {
      localStorage.removeItem('ac_current_user');
    }
  }

  // ── Session / Current User ───────────────────────────────

  function getCurrentUserId() {
    return localStorage.getItem('ac_current_user') || null;
  }

  function setCurrentUser(userId) {
    if (userId) {
      localStorage.setItem('ac_current_user', userId);
    } else {
      localStorage.removeItem('ac_current_user');
    }
  }

  // ── SM-2 Card States ─────────────────────────────────────

  function getCardStates(userId) {
    return load(`ac_cards_${userId}`) || {};
  }

  function getCardState(userId, cardId) {
    const states = getCardStates(userId);
    return states[cardId] || null;
  }

  function setCardState(userId, cardId, state) {
    const states = getCardStates(userId);
    states[cardId] = state;
    save(`ac_cards_${userId}`, states);
  }

  // ── BKT Component States ─────────────────────────────────

  function getBKTStates(userId) {
    return load(`ac_bkt_${userId}`) || {};
  }

  function getBKTComponent(userId, key) {
    const states = getBKTStates(userId);
    return states[key] || null;
  }

  function setBKTComponent(userId, key, comp) {
    const states = getBKTStates(userId);
    states[key] = comp;
    save(`ac_bkt_${userId}`, states);
  }

  // ── Review Log ───────────────────────────────────────────

  function logReview(userId, event) {
    const reviews = load(`ac_reviews_${userId}`) || [];
    reviews.push(event);
    // Keep last 2000 reviews to avoid unbounded growth
    if (reviews.length > 2000) reviews.splice(0, reviews.length - 2000);
    save(`ac_reviews_${userId}`, reviews);
  }

  function getReviews(userId) {
    return load(`ac_reviews_${userId}`) || [];
  }

  // ── Progress Aggregation ─────────────────────────────────

  /**
   * Compute per-category mastery summary for progress display.
   * Returns an array of { pos, cardType, p_known, label, count }
   */
  function getMasterySummary(userId, deck) {
    const bktStates = getBKTStates(userId);
    const categories = {};

    for (const word of deck.words) {
      for (const cardType of ['meaning', 'pinyin']) {
        const key = `${word.pos}__${cardType}`;
        if (!categories[key]) {
          categories[key] = {
            pos:      word.pos,
            cardType,
            p_known:  bktStates[key]
              ? bktStates[key].p_known
              : window.AC.BKT.DEFAULTS.p_known,
            count: 0
          };
        }
        categories[key].count++;
      }
    }

    return Object.values(categories).map(c => ({
      ...c,
      label: window.AC.BKT.masteryLabel(c.p_known)
    }));
  }

  /**
   * Overall mastery: average p_known across all BKT components.
   */
  function getOverallMastery(userId, deck) {
    const summary = getMasterySummary(userId, deck);
    if (summary.length === 0) return 0;
    const total = summary.reduce((sum, c) => sum + c.p_known, 0);
    return total / summary.length;
  }

  return {
    // Users
    getUsers, createUser, getUser, updateUser, deleteUser,
    // Session
    getCurrentUserId, setCurrentUser,
    // SM-2
    getCardStates, getCardState, setCardState,
    // BKT
    getBKTStates, getBKTComponent, setBKTComponent,
    // Reviews
    logReview, getReviews,
    // Progress
    getMasterySummary, getOverallMastery
  };
})();
