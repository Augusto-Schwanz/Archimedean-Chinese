/**
 * grader.js
 * Automatic answer grading for meaning and pinyin cards.
 *
 * Meaning cards: accept any one of the comma-separated English alternatives.
 * Pinyin cards:  accept both tone-mark form (wǒ) and number form (wo3);
 *                spacing between syllables is ignored.
 */

const Grader = (() => {

  // ── Pinyin tone-mark → base + number ─────────────────────────────────────

  const TONE_MAP = {
    'ā':'a1','á':'a2','ǎ':'a3','à':'a4',
    'ē':'e1','é':'e2','ě':'e3','è':'e4',
    'ī':'i1','í':'i2','ǐ':'i3','ì':'i4',
    'ō':'o1','ó':'o2','ǒ':'o3','ò':'o4',
    'ū':'u1','ú':'u2','ǔ':'u3','ù':'u4',
    'ǖ':'v1','ǘ':'v2','ǚ':'v3','ǜ':'v4',
    'ü':'v',                               // unmarked ü → v (common input)
    'Ā':'a1','Á':'a2','Ǎ':'a3','À':'a4',
    'Ē':'e1','É':'e2','Ě':'e3','È':'e4',
    'Ī':'i1','Í':'i2','Ǐ':'i3','Ì':'i4',
    'Ō':'o1','Ó':'o2','Ǒ':'o3','Ò':'o4',
    'Ū':'u1','Ú':'u2','Ǔ':'u3','Ù':'u4',
    'Ǖ':'v1','Ǘ':'v2','Ǚ':'v3','Ǜ':'v4',
  };

  /**
   * Normalise a pinyin string to a canonical form for comparison.
   * Canonical: lowercase, no spaces, no apostrophes, tone marks → base+number.
   * Users may enter either form; both normalise to the same result.
   */
  function normalisePinyin(str) {
    let s = str.toLowerCase().trim();
    // Replace each tone-marked character
    for (const [marked, norm] of Object.entries(TONE_MAP)) {
      s = s.split(marked).join(norm);
    }
    // Remove spaces and apostrophes
    s = s.replace(/[\s']/g, '');
    return s;
  }

  /**
   * Parse an English definition string into a set of accepted alternatives.
   * Handles comma-separated values and strips parenthetical clarifiers.
   *
   * Examples:
   *   "I, me"                         → {"i", "me", "i, me"}
   *   "to be, am, is, are"            → {"to be", "am", "is", "are", ...}
   *   "measure word for general obj." → {"measure word for general obj."}
   */
  function parseAlternatives(english) {
    const accepted = new Set();

    // Add the full string (normalised) as a valid answer
    accepted.add(normaliseMeaning(english));

    // Strip anything in parentheses, then split by ", "
    const stripped = english.replace(/\([^)]*\)/g, '').trim().replace(/,\s*$/, '');
    if (stripped) {
      stripped.split(/,\s+/).forEach(alt => {
        const n = normaliseMeaning(alt.trim());
        if (n) accepted.add(n);
      });
    }

    // Also split the original (with parens) by ", " to catch cases like
    // "please, to invite" where both halves are standalone answers
    english.split(/,\s+/).forEach(alt => {
      const n = normaliseMeaning(alt.trim());
      if (n) accepted.add(n);
    });

    return accepted;
  }

  /** Normalise an English answer for comparison: lowercase, trim, collapse spaces. */
  function normaliseMeaning(str) {
    return str.toLowerCase().trim().replace(/\s+/g, ' ');
  }

  // ── Public grading functions ──────────────────────────────────────────────

  /**
   * Grade a meaning card.
   * @param {string} userAnswer  – raw text typed by user
   * @param {string} english     – card's English field
   * @returns {boolean}
   */
  function gradeMeaning(userAnswer, english) {
    if (!userAnswer || !userAnswer.trim()) return false;
    const accepted = parseAlternatives(english);
    const norm = normaliseMeaning(userAnswer.trim());
    return accepted.has(norm);
  }

  /**
   * Grade a pinyin card.
   * @param {string} userAnswer – raw text typed by user
   * @param {string} pinyin     – card's correct pinyin
   * @returns {boolean}
   */
  function gradePinyin(userAnswer, pinyin) {
    if (!userAnswer || !userAnswer.trim()) return false;
    return normalisePinyin(userAnswer) === normalisePinyin(pinyin);
  }

  /**
   * Grade any card type.
   * @param {string} userAnswer
   * @param {object} card  – full card object from DECK
   * @returns {boolean}
   */
  function grade(userAnswer, card) {
    if (card.cardType === 'meaning') return gradeMeaning(userAnswer, card.english);
    if (card.cardType === 'pinyin')  return gradePinyin(userAnswer, card.pinyin);
    return false;
  }

  return { grade, gradeMeaning, gradePinyin, normalisePinyin };

})();
