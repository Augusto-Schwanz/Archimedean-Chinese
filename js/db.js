/**
 * db.js
 * Thin localStorage wrapper.
 * All persistent state lives here; the rest of the app treats this as a DB.
 *
 * Key schema:
 *   ac_users              → User[]
 *   ac_currentUser        → userId (string) | null
 *   ac_sm2_{userId}       → { [cardId]: SM2CardState }
 *   ac_bkt_{userId}       → { [componentKey]: BKTComponentState }
 *   ac_history_{userId}   → ResponseRecord[]
 */

const DB = (() => {

  // ── Internal helpers ──────────────────────────────────────────────────────

  function get(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  function set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('DB write error:', e);
    }
  }

  // ── Users ─────────────────────────────────────────────────────────────────

  function getUsers() {
    return get('ac_users') || [];
  }

  function saveUsers(users) {
    set('ac_users', users);
  }

  /**
   * Create a new user profile. Initialises fresh SM-2 and BKT states.
   * @param {string} name
   * @returns {object} the new user object
   */
  function createUser(name) {
    const users = getUsers();
    const id = 'u_' + Date.now();
    const user = {
      id,
      name:        name.trim(),
      lang:        'en',          // default UI language
      hideWelcome: false,
      createdAt:   new Date().toISOString(),
    };
    users.push(user);
    saveUsers(users);

    // Initialise empty SM-2 state (cards will get state on first encounter)
    set(`ac_sm2_${id}`, {});

    // Initialise BKT state with priors for all components
    set(`ac_bkt_${id}`, BKT.initialState());

    // Empty response history
    set(`ac_history_${id}`, []);

    return user;
  }

  function getUserById(id) {
    return getUsers().find(u => u.id === id) || null;
  }

  function updateUser(updatedUser) {
    const users = getUsers().map(u => u.id === updatedUser.id ? updatedUser : u);
    saveUsers(users);
  }

  function deleteUser(id) {
    saveUsers(getUsers().filter(u => u.id !== id));
    localStorage.removeItem(`ac_sm2_${id}`);
    localStorage.removeItem(`ac_bkt_${id}`);
    localStorage.removeItem(`ac_history_${id}`);
    if (getCurrentUserId() === id) setCurrentUserId(null);
  }

  // ── Current user ──────────────────────────────────────────────────────────

  function getCurrentUserId() {
    return get('ac_currentUser');
  }

  function setCurrentUserId(id) {
    set('ac_currentUser', id);
  }

  function getCurrentUser() {
    const id = getCurrentUserId();
    return id ? getUserById(id) : null;
  }

  // ── SM-2 state ────────────────────────────────────────────────────────────

  function getSM2State(userId) {
    return get(`ac_sm2_${userId}`) || {};
  }

  function saveSM2State(userId, state) {
    set(`ac_sm2_${userId}`, state);
  }

  /**
   * Update the SM-2 state for a single card and persist immediately.
   */
  function updateCardSM2(userId, cardId, correct) {
    const state = getSM2State(userId);
    const current = state[cardId] || SM2.newCardState();
    state[cardId] = SM2.update(current, correct);
    saveSM2State(userId, state);
    return state[cardId];
  }

  // ── BKT state ─────────────────────────────────────────────────────────────

  function getBKTState(userId) {
    return get(`ac_bkt_${userId}`) || BKT.initialState();
  }

  function saveBKTState(userId, state) {
    set(`ac_bkt_${userId}`, state);
  }

  /**
   * Update the BKT state for a component key and persist.
   */
  function updateComponentBKT(userId, componentKey, correct) {
    const state = getBKTState(userId);
    if (!state[componentKey]) {
      // In case a new component key appears (shouldn't normally happen)
      state[componentKey] = { pL: 0.10, pT: 0.12, pS: 0.10, pG: 0.20 };
    }
    state[componentKey] = BKT.update(state[componentKey], correct);
    saveBKTState(userId, state);
    return state[componentKey];
  }

  // ── Response history ──────────────────────────────────────────────────────

  function getHistory(userId) {
    return get(`ac_history_${userId}`) || [];
  }

  function appendHistory(userId, record) {
    const history = getHistory(userId);
    history.push(record);
    // Keep only the most recent 2000 records to avoid unbounded growth
    if (history.length > 2000) history.splice(0, history.length - 2000);
    set(`ac_history_${userId}`, history);
  }

  /**
   * Record a user's response to a card.
   * Updates both SM-2 and BKT states atomically.
   * @param {string}  userId
   * @param {object}  card    – full card object
   * @param {boolean} correct
   */
  function recordResponse(userId, card, correct) {
    updateCardSM2(userId, card.id, correct);
    updateComponentBKT(userId, `${card.category}:${card.cardType}`, correct);
    appendHistory(userId, {
      cardId:    card.id,
      correct,
      timestamp: new Date().toISOString(),
    });
  }

  // ── Convenience stats ─────────────────────────────────────────────────────

  /**
   * Count how many unique cards have been seen at least once by a user.
   */
  function seenCardCount(userId) {
    const sm2 = getSM2State(userId);
    return Object.keys(sm2).length;
  }

  return {
    getUsers, createUser, getUserById, updateUser, deleteUser,
    getCurrentUserId, setCurrentUserId, getCurrentUser,
    getSM2State, saveSM2State, updateCardSM2,
    getBKTState, saveBKTState, updateComponentBKT,
    getHistory, recordResponse,
    seenCardCount,
  };

})();
