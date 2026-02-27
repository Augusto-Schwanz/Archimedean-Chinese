/**
 * i18n.js
 * UI string translations for English (en) and Simplified Chinese (zh).
 * Access via: I18N.t('key') — returns string for current language.
 */

const I18N = (() => {

  const STRINGS = {

    // ── App-wide ──────────────────────────────────────────────────────────
    appName:        { en: 'Archimedean Chinese', zh: '阿基米德中文' },
    toggleLangBtn:  { en: '中文',                 zh: 'English' },

    // ── Welcome screen ────────────────────────────────────────────────────
    welcomeTitle:   { en: 'Welcome to Archimedean Chinese',
                      zh: '欢迎使用阿基米德中文' },
    welcomeBody:    {
      en: 'An adaptive flashcard system for learning Mandarin. Cards are scheduled using a hybrid of Anki\'s SM-2 algorithm and Bayesian Knowledge Tracing, so the app learns your strengths and weaknesses over time and focuses where you need it most.',
      zh: '一款自适应中文学习卡片系统。本应用结合了Anki的SM-2算法与贝叶斯知识追踪技术，根据你的掌握情况智能安排复习，帮助你高效提升薄弱环节。',
    },
    hideWelcome:    { en: "Don't show this again",  zh: '不再显示' },
    getStarted:     { en: 'Get Started',            zh: '开始学习' },

    // ── Profile screen ────────────────────────────────────────────────────
    selectProfile:  { en: 'Select Profile',         zh: '选择用户' },
    newProfile:     { en: '+ New Profile',          zh: '+ 新建用户' },
    createProfile:  { en: 'Create Profile',         zh: '创建用户' },
    yourName:       { en: 'Your name',              zh: '你的名字' },
    create:         { en: 'Create',                 zh: '创建' },
    cancel:         { en: 'Cancel',                 zh: '取消' },
    deleteProfile:  { en: 'Delete',                 zh: '删除' },
    confirmDelete:  { en: 'Delete this profile? All progress will be lost.',
                      zh: '确定删除该用户吗？所有进度将丢失。' },
    noProfiles:     { en: 'No profiles yet. Create one to get started.',
                      zh: '还没有用户，创建一个开始吧。' },

    // ── Home screen ───────────────────────────────────────────────────────
    hello:          { en: 'Hello',                  zh: '你好' },
    switchUser:     { en: 'Switch User',            zh: '切换用户' },
    availableDecks: { en: 'Available Decks',        zh: '可用卡片组' },
    studyNow:       { en: 'Study Now',              zh: '开始学习' },
    viewProgress:   { en: 'Progress',               zh: '学习进度' },
    cardsdue:       { en: 'cards due',              zh: '张待复习' },
    overallMastery: { en: 'Overall Mastery',        zh: '总体掌握度' },
    deckName:       { en: 'HSK 1 Vocabulary',       zh: 'HSK一级词汇' },
    deckDesc:       { en: '150 words · Meaning & Pinyin', zh: '150词 · 释义与拼音' },

    // ── Study screen ──────────────────────────────────────────────────────
    studySession:   { en: 'Study Session',          zh: '学习' },
    exitSession:    { en: 'Exit',                   zh: '退出' },
    cardMeaning:    { en: 'What does this mean?',   zh: '这是什么意思？' },
    cardPinyin:     { en: 'How is this pronounced? (pinyin)', zh: '这怎么拼读？（拼音）' },
    typeAnswer:     { en: 'Type your answer…',      zh: '输入答案…' },
    submitAnswer:   { en: 'Check',                  zh: '确认' },
    nextCard:       { en: 'Next  ›',                zh: '下一张 ›' },
    correct:        { en: '✓ Correct',              zh: '✓ 正确' },
    incorrect:      { en: '✗ Incorrect',            zh: '✗ 不正确' },
    correctAnswer:  { en: 'Correct answer:',        zh: '正确答案：' },
    yourAnswer:     { en: 'Your answer:',           zh: '你的答案：' },
    overrideBtn:    { en: 'Override (mark correct)', zh: '覆盖（标记为正确）' },
    overrideTitle:  { en: 'Why should this be marked correct?', zh: '为什么标记为正确？' },
    overrideReasons: {
      en: ['Typo / spelling', 'Equivalent answer', 'Misclicked Submit', 'Other'],
      zh: ['拼写错误',        '等效答案',           '误点提交',          '其他'],
    },
    sessionDone:    { en: 'Session Complete!',       zh: '本轮完成！' },
    sessionStats:   { en: 'You reviewed {n} cards with {pct}% accuracy.',
                      zh: '共复习 {n} 张卡片，正确率 {pct}%。' },
    backHome:       { en: '← Back to Home',         zh: '← 返回主页' },
    noCards:        { en: 'No cards due right now. Check back later!',
                      zh: '暂无待复习卡片，稍后再来吧！' },
    pressEnter:     { en: 'Press Enter to continue', zh: '按 Enter 继续' },

    // ── Progress screen ───────────────────────────────────────────────────
    progressTitle:  { en: 'Learning Progress',      zh: '学习进度' },
    back:           { en: '← Back',                 zh: '← 返回' },
    masteryPct:     { en: '{pct}% mastered',        zh: '已掌握 {pct}%' },
    cardsSeenOf:    { en: '{seen} / {total} cards seen', zh: '已见 {seen} / {total} 张' },
    byCategory:     { en: 'By Category',            zh: '分类详情' },
    meaning:        { en: 'Meaning',                zh: '释义' },
    pinyin:         { en: 'Pinyin',                 zh: '拼音' },

    // ── Category labels ───────────────────────────────────────────────────
    cat_pronoun:      { en: 'Pronouns',        zh: '代词' },
    cat_numeral:      { en: 'Numerals',        zh: '数词' },
    cat_measure_word: { en: 'Measure Words',   zh: '量词' },
    cat_adverb:       { en: 'Adverbs',         zh: '副词' },
    cat_conjunction:  { en: 'Conjunctions',    zh: '连词' },
    cat_preposition:  { en: 'Prepositions',    zh: '介词' },
    cat_particle:     { en: 'Particles',       zh: '助词' },
    cat_interjection: { en: 'Interjections',   zh: '感叹词' },
    cat_noun:         { en: 'Nouns',           zh: '名词' },
    cat_verb:         { en: 'Verbs',           zh: '动词' },
    cat_adjective:    { en: 'Adjectives',      zh: '形容词' },
    cat_expression:   { en: 'Expressions',     zh: '常用表达' },
    cat_phrase:       { en: 'Phrases',         zh: '短语' },
  };

  let _lang = 'en';

  function setLang(lang) {
    _lang = (lang === 'zh') ? 'zh' : 'en';
  }

  function getLang() { return _lang; }

  /**
   * Get a translated string by key. Supports {placeholder} substitution.
   * @param {string} key
   * @param {object} [vars] – e.g. { n: 10, pct: 80 }
   */
  function t(key, vars) {
    const entry = STRINGS[key];
    if (!entry) return `[${key}]`;
    let str = entry[_lang] ?? entry['en'] ?? `[${key}]`;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replaceAll(`{${k}}`, v);
      }
    }
    return str;
  }

  /**
   * Get override reasons array for current language.
   */
  function overrideReasons() {
    return STRINGS.overrideReasons[_lang] ?? STRINGS.overrideReasons['en'];
  }

  /**
   * Get category label.
   */
  function catLabel(category) {
    return t(`cat_${category}`);
  }

  return { setLang, getLang, t, overrideReasons, catLabel };

})();
