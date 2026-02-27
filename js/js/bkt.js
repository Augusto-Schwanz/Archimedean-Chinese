/**
 * bkt.js
 * Bayesian Knowledge Tracing (BKT) algorithm.
 *
 * Each knowledge component is identified by a key: "category:cardType"
 * (e.g. "pronoun:meaning", "verb:pinyin").
 *
 * Per-component parameters stored per user:
 *   pL  – current probability of mastery (updated after every response)
 *   pT  – probability of learning on each exposure (transition)
 *   pS  – slip probability (knows it, answers wrong)
 *   pG  – guess probability (doesn't know it, answers correctly)
 */

const BKT = (() => {

  /** Default parameters for a brand-new knowledge component */
  const DEFAULTS = {
    pL: 0.10,   // low prior: user is a beginner
    pT: 0.12,   // moderate learning rate
    pS: 0.10,   // 10% chance of slip
    pG: 0.20,   // 20% chance of lucky guess
  };

  /**
   * Return a fresh BKT state object for all components in the deck.
   * Called when a new user profile is created.
   */
  function initialState() {
    const state = {};
    BKT_COMPONENTS.forEach(key => {
      state[key] = { ...DEFAULTS };
    });
    return state;
  }

  /**
   * Update the mastery estimate for one component after an observation.
   * @param {object} comp  – component state { pL, pT, pS, pG }
   * @param {boolean} correct – whether the user answered correctly
   * @returns {object} updated component state (new object, does not mutate)
   */
  function update(comp, correct) {
    const { pL, pT, pS, pG } = comp;

    // Step 1: update P(L) given the observation (Bayes rule)
    let pLgiven;
    if (correct) {
      // P(L | correct) = P(correct | L)*P(L) / P(correct)
      //                = (1-pS)*pL / [(1-pS)*pL + pG*(1-pL)]
      pLgiven = ((1 - pS) * pL) / ((1 - pS) * pL + pG * (1 - pL));
    } else {
      // P(L | incorrect) = pS*pL / [pS*pL + (1-pG)*(1-pL)]
      pLgiven = (pS * pL) / (pS * pL + (1 - pG) * (1 - pL));
    }

    // Step 2: propagate through learning transition
    // P(L_{n+1}) = P(L|obs) + (1 - P(L|obs)) * pT
    const pLnext = pLgiven + (1 - pLgiven) * pT;

    return { ...comp, pL: Math.min(0.99, pLnext) };
  }

  /**
   * Get the current mastery probability for a component.
   * Returns 0 if the component doesn't exist yet in the state.
   */
  function getMastery(state, componentKey) {
    return state[componentKey] ? state[componentKey].pL : DEFAULTS.pL;
  }

  /**
   * Compute aggregate mastery for a set of component keys.
   * Returns the average pL across all matching components.
   */
  function aggregateMastery(state, componentKeys) {
    if (!componentKeys.length) return 0;
    const total = componentKeys.reduce((sum, key) => {
      return sum + getMastery(state, key);
    }, 0);
    return total / componentKeys.length;
  }

  /**
   * Get overall mastery across ALL components (0–1).
   */
  function overallMastery(state) {
    return aggregateMastery(state, BKT_COMPONENTS);
  }

  /**
   * Get mastery by primary category (averaged across meaning + pinyin).
   * Returns an array of { category, mastery } sorted by mastery ascending.
   */
  function masteryByCategory(state) {
    return CATEGORIES.map(cat => {
      const keys = BKT_COMPONENTS.filter(k => k.startsWith(cat + ':'));
      return { category: cat, mastery: aggregateMastery(state, keys) };
    }).sort((a, b) => a.mastery - b.mastery);
  }

  /**
   * Get mastery broken down by card type for a given category.
   */
  function masteryByCardType(state, category) {
    return ['meaning', 'pinyin'].map(type => {
      const key = `${category}:${type}`;
      return { cardType: type, mastery: getMastery(state, key) };
    });
  }

  return { initialState, update, getMastery, aggregateMastery, overallMastery, masteryByCategory, masteryByCardType };

})();
