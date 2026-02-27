// ============================================================
// js/ui/i18n.js — Internationalisation (English / Simplified Chinese)
//
// Usage:
//   AC.i18n.t('key')          → translated string
//   AC.i18n.setLang('zh')     → switch language
//   AC.i18n.getLang()         → current language code
//   AC.i18n.applyToPage()     → update all [data-i18n] elements
// ============================================================
window.AC = window.AC || {};

window.AC.i18n = (() => {

  let _lang = 'en';

  const STRINGS = {
    // ── App name & nav ─────────────────────────────────────
    appName:              { en: 'Archimedean Chinese', zh: '阿基米德中文' },
    tagline:              { en: 'Adaptive Mandarin flashcards', zh: '自适应普通话闪卡' },

    // ── Welcome page ───────────────────────────────────────
    welcomeTitle:         { en: 'Welcome to Archimedean Chinese', zh: '欢迎来到阿基米德中文' },
    welcomeBody:          {
      en: 'An adaptive flashcard system for learning Mandarin Chinese. Powered by Bayesian Knowledge Tracing and spaced repetition, the app learns your strengths and weaknesses and personalises every study session.',
      zh: '一个自适应普通话学习闪卡系统。基于贝叶斯知识追踪与间隔重复算法，本应用会分析您的强弱项，为每次学习量身定制。'
    },
    dontShowAgain:        { en: "Don't show this again", zh: '不再显示' },
    continueBtn:          { en: 'Continue', zh: '继续' },

    // ── User management ────────────────────────────────────
    selectProfile:        { en: 'Select Profile', zh: '选择学习档案' },
    newProfile:           { en: 'New Profile', zh: '新建档案' },
    createProfile:        { en: 'Create Profile', zh: '创建档案' },
    enterName:            { en: 'Enter your name', zh: '请输入姓名' },
    noProfiles:           { en: 'No profiles yet. Create one to get started.', zh: '暂无档案，请新建一个开始学习。' },
    deleteProfile:        { en: 'Delete', zh: '删除' },
    confirmDelete:        { en: 'Delete this profile? All progress will be lost.', zh: '确定删除该档案？所有进度将丢失。' },
    startStudying:        { en: 'Start Studying', zh: '开始学习' },
    lastStudied:          { en: 'Last studied', zh: '上次学习' },
    never:                { en: 'Never', zh: '从未' },

    // ── Deck / Progress page ───────────────────────────────
    myProgress:           { en: 'My Progress', zh: '我的进度' },
    deck:                 { en: 'Deck', zh: '卡组' },
    overallMastery:       { en: 'Overall Mastery', zh: '总体掌握程度' },
    dueToday:             { en: 'Due Today', zh: '今日待复习' },
    newCards:             { en: 'New Cards', zh: '新卡片' },
    beginSession:         { en: 'Begin Session', zh: '开始学习' },
    categoryBreakdown:    { en: 'Category Breakdown', zh: '分类详情' },
    meaningCards:         { en: 'Meaning', zh: '词义' },
    pinyinCards:          { en: 'Pinyin', zh: '拼音' },
    masteryPct:           { en: 'mastery', zh: '掌握' },
    backToProfiles:       { en: 'Switch Profile', zh: '切换档案' },
    cards:                { en: 'cards', zh: '张' },
    nothingDue:           { en: 'Nothing due — you\'re all caught up!', zh: '暂无待复习内容，全部完成！' },

    // ── Study session ──────────────────────────────────────
    typeAnswer:           { en: 'Type your answer…', zh: '请输入答案…' },
    submit:               { en: 'Submit', zh: '提交' },
    next:                 { en: 'Next  [Space]', zh: '下一张  [空格]' },
    correct:              { en: 'Correct!', zh: '正确！' },
    incorrect:            { en: 'Incorrect', zh: '错误' },
    correctAnswer:        { en: 'Correct answer:', zh: '正确答案：' },
    yourAnswer:           { en: 'Your answer:', zh: '您的答案：' },
    overrideBtn:          { en: 'Mark as Correct', zh: '标记为正确' },
    overrideTitle:        { en: 'Why should this be marked correct?', zh: '为何标记为正确？' },
    overrideReasons:      {
      en: ['Mis-typed', 'Equivalent translation', 'Alternate romanisation', 'Other'],
      zh: ['输入错误', '等义翻译', '其他拼写方式', '其他']
    },
    cancelOverride:       { en: 'Cancel', zh: '取消' },
    confirmOverride:      { en: 'Confirm', zh: '确认' },
    cardTypeMeaning:      { en: 'Meaning', zh: '词义' },
    cardTypePinyin:       { en: 'Pinyin', zh: '拼音' },
    sessionComplete:      { en: 'Session Complete!', zh: '本次学习完成！' },
    sessionCompleteBody:  { en: 'All cards reviewed for now. Check back later for more.', zh: '所有卡片已复习完毕，请稍后再来。' },
    reviewed:             { en: 'Reviewed', zh: '已复习' },
    accuracy:             { en: 'Accuracy', zh: '正确率' },
    endSession:           { en: 'End Session', zh: '结束学习' },
    hskLabel:             { en: 'HSK', zh: 'HSK' },
    posLabel:             { en: 'Part of speech:', zh: '词性：' },

    // ── Mastery labels ─────────────────────────────────────
    mastered:             { en: 'Mastered', zh: '已掌握' },
    strong:               { en: 'Strong', zh: '较强' },
    learning:             { en: 'Learning', zh: '学习中' },
    weak:                 { en: 'Weak', zh: '较弱' },
    new:                  { en: 'New', zh: '未学' },

    // ── Language toggle ────────────────────────────────────
    langEN:               { en: 'EN', zh: 'EN' },
    langZH:               { en: '中文', zh: '中文' },

    // ── Generic ────────────────────────────────────────────
    cancel:               { en: 'Cancel', zh: '取消' },
    confirm:              { en: 'Confirm', zh: '确认' },
    back:                 { en: 'Back', zh: '返回' },
    loading:              { en: 'Loading…', zh: '加载中…' },
  };

  function t(key) {
    const entry = STRINGS[key];
    if (!entry) { console.warn(`i18n: missing key "${key}"`); return key; }
    return entry[_lang] || entry['en'] || key;
  }

  function setLang(lang) {
    _lang = (lang === 'zh') ? 'zh' : 'en';
  }

  function getLang() { return _lang; }

  /** Update all elements with data-i18n="key" attribute */
  function applyToPage() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = t(key);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      el.placeholder = t(key);
    });
    // Toggle font class on body
    document.body.classList.toggle('lang-zh', _lang === 'zh');
    document.documentElement.lang = _lang;
  }

  return { t, setLang, getLang, applyToPage, STRINGS };
})();
