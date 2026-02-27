// ============================================================
// js/core/bkt.js — Bayesian Knowledge Tracing (BKT)
//
// BKT models a learner's latent knowledge state for each
// knowledge component (category). For this app, a knowledge
// component corresponds to a part-of-speech category (e.g.
// "noun", "verb") and card type (meaning vs pinyin).
//
// Parameters per component (defaults tuned conservatively):
//   p_known  — P(mastered): prior probability the user already knows it
//   p_learn  — P(learning): probability of transitioning to known after seeing
//   p_guess  — P(correct | not known): lucky guess probability
//   p_slip   — P(incorrect | known): careless mistake probability
//
// Update rule applied after each card response.
// ============================================================
window.AC = window.AC || {};

window.AC.BKT = (() => {

  // Default BKT parameters (conservative priors for new learners)
  const DEFAULTS = {
    p_known: 0.1,   // Assume learner starts knowing ~10%
    p_learn: 0.2,   // 20% chance of learning after each exposure
    p_guess: 0.15,  // 15% chance of guessing correctly
    p_slip:  0.1    // 10% chance of slipping on a known item
  };

  /**
   * Return a fresh BKT component state for a new user/category.
   */
  function newComponent(overrides = {}) {
    return { ...DEFAULTS, ...overrides };
  }

  /**
   * Update the BKT component state given an observed response.
   * @param {object} comp    — current component state {p_known, p_learn, p_guess, p_slip}
   * @param {boolean} correct — whether the user answered correctly
   * @returns {object}        — updated component (does not mutate input)
   */
  function update(comp, correct) {
    const c = { ...comp };

    // Step 1: Update p_known given evidence (Bayes)
    let p_correct_given_known    = 1 - c.p_slip;
    let p_correct_given_unknown  = c.p_guess;

    let p_evidence;
    if (correct) {
      p_evidence = p_correct_given_known * c.p_known
                 + p_correct_given_unknown * (1 - c.p_known);
    } else {
      p_evidence = c.p_slip * c.p_known
                 + (1 - c.p_guess) * (1 - c.p_known);
    }

    // Posterior: P(known | evidence)
    let p_known_given_evidence;
    if (correct) {
      p_known_given_evidence = (p_correct_given_known * c.p_known) / p_evidence;
    } else {
      p_known_given_evidence = (c.p_slip * c.p_known) / p_evidence;
    }

    // Step 2: Apply learning transition
    // P(known_new) = P(known|evidence) + P(not known|evidence) * p_learn
    c.p_known = p_known_given_evidence
              + (1 - p_known_given_evidence) * c.p_learn;

    // Clamp to [0, 1]
    c.p_known = Math.min(1, Math.max(0, c.p_known));

    return c;
  }

  /**
   * Returns the mastery level label for a given p_known.
   * Used for UI display.
   */
  function masteryLabel(p_known) {
    if (p_known >= 0.95) return 'mastered';
    if (p_known >= 0.75) return 'strong';
    if (p_known >= 0.50) return 'learning';
    if (p_known >= 0.25) return 'weak';
    return 'new';
  }

  /**
   * Compute a weighted priority score for card selection.
   * Lower p_known → higher priority.
   */
  function selectionPriority(comp) {
    return 1 - comp.p_known;
  }

  return { newComponent, update, masteryLabel, selectionPriority, DEFAULTS };
})();
