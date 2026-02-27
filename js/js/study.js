// ============================================================
// js/study.js — Study Session Page Controller
//
// Flow per card:
//   1. Scheduler picks next card
//   2. Show card face (Chinese char) + card type badge
//   3. User types answer → Submit (Enter or button)
//   4. Grader evaluates answer
//   5. Show result panel (correct/incorrect + correct answer)
//   6. If incorrect: show Override button
//   7. User presses Next (Space/Enter) → record review → next card
//   8. When no cards remain: show session complete screen
// ============================================================
(function () {
  const DB      = window.AC.DB;
  const i18n    = window.AC.i18n;
  const Sched   = window.AC.Scheduler;
  const Grader  = window.AC.Grader;
  const deck    = window.AC.DECKS.hsk1;

  // ── Session state ─────────────────────────────────────────
  let userId       = null;
  let currentCard  = null;
  let lastGrade    = null;       // { correct: bool, hint: string }
  let phase        = 'input';   // 'input' | 'result'
  let sessionCount = 0;
  let sessionCorrect = 0;
  // Cap session at N cards to avoid marathon sessions
  const SESSION_LIMIT = 40;
  let sessionDone  = 0;

  // ── Init ──────────────────────────────────────────────────

  function init() {
    userId = DB.getCurrentUserId();
    if (!userId || !DB.getUser(userId)) {
      window.location.href = 'index.html';
      return;
    }

    const user = DB.getUser(userId);
    i18n.setLang(user.lang || 'en');
    i18n.applyToPage();
    bindLangToggle();
    bindEvents();
    populateOverrideReasons();
    advance();
  }

  // ── Language toggle ───────────────────────────────────────

  function bindLangToggle() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.dataset.lang;
        i18n.setLang(lang);
        i18n.applyToPage();
        document.querySelectorAll('.lang-btn').forEach(b =>
          b.classList.toggle('active', b.dataset.lang === lang)
        );
        DB.updateUser(userId, { lang });
        // Re-render prompt text for current card
        if (currentCard) renderCardFace(currentCard);
        populateOverrideReasons();
      });
    });
    document.querySelectorAll('.lang-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.lang === i18n.getLang())
    );
  }

  // ── Event binding ─────────────────────────────────────────

  function bindEvents() {
    document.getElementById('submitBtn').addEventListener('click', handleSubmit);

    document.getElementById('answerInput').addEventListener('keydown', e => {
      if (e.key === 'Enter') handleSubmit();
    });

    document.getElementById('nextBtn').addEventListener('click', handleNext);

    document.getElementById('overrideBtn').addEventListener('click', showOverrideArea);
    document.getElementById('confirmOverrideBtn').addEventListener('click', confirmOverride);
    document.getElementById('cancelOverrideBtn').addEventListener('click', hideOverrideArea);

    // Space bar advances to next card when in result phase
    document.addEventListener('keydown', e => {
      if (e.key === ' ' && phase === 'result' && !overrideAreaVisible()) {
        e.preventDefault();
        handleNext();
      }
    });
  }

  function populateOverrideReasons() {
    const sel     = document.getElementById('overrideReason');
    const reasons = i18n.t('overrideReasons');
    sel.innerHTML = reasons.map(r => `<option>${escHtml(r)}</option>`).join('');
  }

  // ── Card rendering ────────────────────────────────────────

  function advance() {
    if (sessionDone >= SESSION_LIMIT) {
      showComplete();
      return;
    }

    currentCard = Sched.nextCard(userId, deck, DB);

    if (!currentCard) {
      showComplete();
      return;
    }

    phase = 'input';
    renderCardFace(currentCard);
    showInputPhase();
  }

  function renderCardFace(card) {
    const word = card.word;

    // Character
    document.getElementById('cardChar').textContent = word.chinese;

    // Meta line: HSK level · part of speech
    document.getElementById('cardMeta').textContent =
      `HSK ${word.hsk} · ${word.pos}`;

    // Type badge
    const badge = document.getElementById('cardTypeBadge');
    badge.textContent = card.type === 'meaning'
      ? i18n.t('cardTypeMeaning')
      : i18n.t('cardTypePinyin');

    // Prompt instruction
    const prompt = document.getElementById('cardPrompt');
    if (card.type === 'meaning') {
      prompt.textContent = i18n.getLang() === 'zh'
        ? '请输入英文翻译'
        : 'Type the English meaning';
    } else {
      prompt.textContent = i18n.getLang() === 'zh'
        ? '请输入拼音（声调数字或拼音符号均可）'
        : 'Type the pinyin (tone marks or numbers accepted)';
    }
  }

  function showInputPhase() {
    document.getElementById('answerArea').classList.remove('hidden');
    document.getElementById('resultPanel').classList.add('hidden');
    document.getElementById('overrideArea').classList.add('hidden');

    const input = document.getElementById('answerInput');
    input.value = '';
    input.disabled = false;
    input.focus();

    document.getElementById('submitBtn').disabled = false;
    updateProgressBar();
  }

  // ── Submit & grading ──────────────────────────────────────

  function handleSubmit() {
    if (phase !== 'input') return;
    const answer = document.getElementById('answerInput').value;

    lastGrade = Grader.grade(answer, currentCard);
    phase = 'result';

    showResultPhase(answer, lastGrade);
    // Record now; override will undo if needed
    Sched.recordReview(userId, currentCard, lastGrade.correct, DB);
    sessionCount++;
    if (lastGrade.correct) sessionCorrect++;
    sessionDone++;
  }

  function showResultPhase(userAnswer, gradeResult) {
    document.getElementById('answerArea').classList.add('hidden');
    document.getElementById('answerInput').disabled = true;

    const panel = document.getElementById('resultPanel');
    panel.classList.remove('hidden', 'correct', 'incorrect');
    panel.classList.add(gradeResult.correct ? 'correct' : 'incorrect');

    document.getElementById('resultVerdict').textContent = gradeResult.correct
      ? i18n.t('correct')
      : i18n.t('incorrect');

    document.getElementById('yourAnswerText').textContent   = userAnswer || '—';
    document.getElementById('correctAnswerText').textContent = gradeResult.hint;

    // Override only available on incorrect
    const overrideBtn = document.getElementById('overrideBtn');
    overrideBtn.classList.toggle('hidden', gradeResult.correct);

    document.getElementById('nextBtn').focus();
    updateProgressBar();
  }

  // ── Override ──────────────────────────────────────────────

  function showOverrideArea() {
    document.getElementById('overrideArea').classList.remove('hidden');
    document.getElementById('overrideBtn').classList.add('hidden');
  }

  function hideOverrideArea() {
    document.getElementById('overrideArea').classList.add('hidden');
    document.getElementById('overrideBtn').classList.remove('hidden');
  }

  function overrideAreaVisible() {
    return !document.getElementById('overrideArea').classList.contains('hidden');
  }

  function confirmOverride() {
    // Reverse the incorrect record: re-record as correct
    // BKT and SM-2 states need to be rolled back then re-applied
    // Simplification: record an additional correct review to counteract
    Sched.recordReview(userId, currentCard, true, DB);
    if (!lastGrade.correct) {
      sessionCorrect++;
      lastGrade.correct = true;
    }

    // Update panel to show correct
    const panel = document.getElementById('resultPanel');
    panel.classList.remove('incorrect');
    panel.classList.add('correct');
    document.getElementById('resultVerdict').textContent = i18n.t('correct');
    document.getElementById('overrideBtn').classList.add('hidden');
    document.getElementById('overrideArea').classList.add('hidden');
    document.getElementById('nextBtn').focus();
  }

  // ── Next card ─────────────────────────────────────────────

  function handleNext() {
    if (phase !== 'result') return;
    advance();
  }

  // ── Progress bar ──────────────────────────────────────────

  function updateProgressBar() {
    const pct = Math.min(100, Math.round((sessionDone / SESSION_LIMIT) * 100));
    document.getElementById('sessionProgressBar').style.width = pct + '%';
    document.getElementById('sessionCount').textContent =
      `${sessionDone} / ${Math.min(SESSION_LIMIT, sessionDone + (Sched.sessionStats(userId, deck, DB).dueCount + Sched.sessionStats(userId, deck, DB).newCount))}`;
  }

  // ── Session complete ──────────────────────────────────────

  function showComplete() {
    document.getElementById('cardView').classList.add('hidden');
    const completeView = document.getElementById('completeView');
    completeView.classList.remove('hidden');

    const accuracy = sessionCount > 0
      ? Math.round((sessionCorrect / sessionCount) * 100)
      : 0;

    document.getElementById('completeReviewed').textContent = sessionCount;
    document.getElementById('completeAccuracy').textContent = accuracy + '%';
  }

  // ── Utility ───────────────────────────────────────────────

  function escHtml(str) {
    return String(str).replace(/[&<>"']/g, c =>
      ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  document.addEventListener('DOMContentLoaded', init);
})();
