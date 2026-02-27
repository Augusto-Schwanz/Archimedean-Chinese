// ============================================================
// js/core/grader.js — Answer Grading Utilities
//
// Handles two card types:
//   "meaning" — user types English; accepted if it matches
//               any definition in the comma-separated list.
//   "pinyin"  — user types pinyin in tone-mark OR numbered
//               format; spacing is ignored.
//
// Returns { correct: bool, normalized: string }
// ============================================================
window.AC = window.AC || {};

window.AC.Grader = (() => {

  // Tone-marked vowel → base vowel + tone number
  const TONE_MAP = {
    'ā':'a1','á':'a2','ǎ':'a3','à':'a4',
    'ē':'e1','é':'e2','ě':'e3','è':'e4',
    'ī':'i1','í':'i2','ǐ':'i3','ì':'i4',
    'ō':'o1','ó':'o2','ǒ':'o3','ò':'o4',
    'ū':'u1','ú':'u2','ǔ':'u3','ù':'u4',
    'ǖ':'v1','ǘ':'v2','ǚ':'v3','ǜ':'v4',
    'ü':'u',  // toneless ü → u (simplified)
    'Ā':'a1','Á':'a2','Ǎ':'a3','À':'a4',
    'Ē':'e1','É':'e2','Ě':'e3','È':'e4',
    'Ī':'i1','Í':'i2','Ǐ':'i3','Ì':'i4',
    'Ō':'o1','Ó':'o2','Ǒ':'o3','Ò':'o4',
    'Ū':'u1','Ú':'u2','Ǔ':'u3','Ù':'u4',
  };

  /**
   * Normalize pinyin to lowercase numbered format with no spaces.
   * Accepts both tone-mark input (wǒ) and numbered input (wo3).
   * Example: "Wǒ men" → "wo3men"
   */
  function normalizePinyin(str) {
    let s = str.trim();
    // Replace tone-marked vowels
    for (const [mark, replacement] of Object.entries(TONE_MAP)) {
      s = s.split(mark).join(replacement);
    }
    // Lowercase and remove all whitespace and apostrophes
    s = s.toLowerCase().replace(/[\s''']+/g, '');
    return s;
  }

  /**
   * Grade a meaning (English) answer.
   * Splits the stored english field by comma and checks each alternative.
   */
  function gradeMeaning(userAnswer, word) {
    const answer = userAnswer.trim().toLowerCase();
    if (!answer) return { correct: false };

    const definitions = word.english
      .split(',')
      .map(d => d.trim().toLowerCase()
        // Strip parenthetical notes like "(measure word for...)"
        .replace(/\(.*?\)/g, '')
        .trim()
      )
      .filter(d => d.length > 0);

    const correct = definitions.some(def => {
      // Exact match
      if (answer === def) return true;
      // Allow answer to be one of multiple slash-separated options
      const slashParts = def.split('/').map(p => p.trim());
      if (slashParts.includes(answer)) return true;
      return false;
    });

    return { correct, definitions };
  }

  /**
   * Grade a pinyin answer.
   */
  function gradePinyin(userAnswer, word) {
    const userNorm    = normalizePinyin(userAnswer);
    const correctNorm = normalizePinyin(word.pinyin);
    const correct = userNorm === correctNorm && userNorm.length > 0;
    return { correct, normalized: correctNorm };
  }

  /**
   * Grade a card response.
   * @param {string} userAnswer
   * @param {object} card — { type: 'meaning'|'pinyin', word }
   * @returns {{ correct: boolean, hint: string }}
   */
  function grade(userAnswer, card) {
    if (card.type === 'meaning') {
      const result = gradeMeaning(userAnswer, card.word);
      return {
        correct: result.correct,
        hint: card.word.english
      };
    } else {
      const result = gradePinyin(userAnswer, card.word);
      return {
        correct: result.correct,
        hint: card.word.pinyin
      };
    }
  }

  return { grade, normalizePinyin };
})();
