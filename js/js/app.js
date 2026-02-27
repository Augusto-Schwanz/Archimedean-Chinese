/**
 * app.js
 * Main application controller.
 * Manages screen transitions, user interactions, and wires together
 * the data, algorithm, and UI layers.
 */

const App = (() => {

  // ── State ─────────────────────────────────────────────────────────────────

  let session = null;   // active study session object

  // ── Initialisation ────────────────────────────────────────────────────────

  function init() {
    bindGlobalEvents();
    const user = DB.getCurrentUser();
    if (user) {
      I18N.setLang(user.lang);
    }
    renderAll();

    // Decide which screen to show first
    if (!user) {
      showScreen('profile');
    } else if (!user.hideWelcome) {
      showScreen('welcome');
    } else {
      showScreen('home');
    }
  }

  // ── Screen management ─────────────────────────────────────────────────────

  function showScreen(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    const el = document.getElementById(`screen-${name}`);
    if (el) el.classList.remove('hidden');
    // Re-render the newly shown screen
    switch (name) {
      case 'welcome':  renderWelcome();  break;
      case 'profile':  renderProfile();  break;
      case 'home':     renderHome();     break;
      case 'progress': renderProgress(); break;
      case 'study':    renderStudyStart(); break;
    }
  }

  // ── Global render (applied to all screens) ────────────────────────────────

  function renderAll() {
    renderLangToggle();
    // Update any persistent elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = I18N.t(el.dataset.i18n);
    });
  }

  function renderLangToggle() {
    const btn = document.getElementById('lang-toggle-btn');
    if (btn) btn.textContent = I18N.t('toggleLangBtn');
  }

  // ── Welcome screen ────────────────────────────────────────────────────────

  function renderWelcome() {
    document.getElementById('welcome-title').textContent = I18N.t('welcomeTitle');
    document.getElementById('welcome-body').textContent  = I18N.t('welcomeBody');
    document.getElementById('welcome-hide-label').textContent = I18N.t('hideWelcome');
    document.getElementById('welcome-start-btn').textContent  = I18N.t('getStarted');
  }

  // ── Profile screen ────────────────────────────────────────────────────────

  function renderProfile() {
    document.getElementById('profile-title').textContent = I18N.t('selectProfile');
    document.getElementById('new-profile-btn').textContent = I18N.t('newProfile');
    const users = DB.getUsers();
    const list  = document.getElementById('profile-list');
    list.innerHTML = '';

    if (users.length === 0) {
      list.innerHTML = `<p class="muted">${I18N.t('noProfiles')}</p>`;
      return;
    }

    users.forEach(user => {
      const item = document.createElement('div');
      item.className = 'profile-item';
      item.innerHTML = `
        <button class="profile-select-btn" data-id="${user.id}">
          <span class="profile-avatar">${user.name.charAt(0).toUpperCase()}</span>
          <span class="profile-name">${escHtml(user.name)}</span>
        </button>
        <button class="profile-delete-btn icon-btn" data-id="${user.id}" title="${I18N.t('deleteProfile')}">✕</button>
      `;
      list.appendChild(item);
    });
  }

  // ── Home screen ───────────────────────────────────────────────────────────

  function renderHome() {
    const user = DB.getCurrentUser();
    if (!user) { showScreen('profile'); return; }

    const sm2  = DB.getSM2State(user.id);
    const bkt  = DB.getBKTState(user.id);
    const due  = Scheduler.countDue(sm2);
    const mastery = Math.round(BKT.overallMastery(bkt) * 100);
    const seen = DB.seenCardCount(user.id);

    document.getElementById('home-hello').textContent =
      `${I18N.t('hello')}, ${user.name}`;
    document.getElementById('home-switch-btn').textContent = I18N.t('switchUser');
    document.getElementById('deck-name').textContent       = I18N.t('deckName');
    document.getElementById('deck-desc').textContent       = I18N.t('deckDesc');
    document.getElementById('deck-due').textContent        = `${due} ${I18N.t('cardsdue')}`;
    document.getElementById('study-btn').textContent       = I18N.t('studyNow');
    document.getElementById('progress-btn').textContent    = I18N.t('viewProgress');
    document.getElementById('home-mastery-pct').textContent =
      I18N.t('masteryPct', { pct: mastery });
    document.getElementById('home-seen').textContent =
      I18N.t('cardsSeenOf', { seen, total: DECK.length });
    document.getElementById('home-mastery-fill').style.width = mastery + '%';
  }

  // ── Progress screen ───────────────────────────────────────────────────────

  function renderProgress() {
    const user = DB.getCurrentUser();
    if (!user) { showScreen('profile'); return; }

    const bkt     = DB.getBKTState(user.id);
    const sm2     = DB.getSM2State(user.id);
    const overall = Math.round(BKT.overallMastery(bkt) * 100);
    const seen    = DB.seenCardCount(user.id);

    document.getElementById('progress-title').textContent   = I18N.t('progressTitle');
    document.getElementById('progress-back-btn').textContent = I18N.t('back');
    document.getElementById('progress-overall-pct').textContent =
      I18N.t('masteryPct', { pct: overall });
    document.getElementById('progress-overall-fill').style.width = overall + '%';
    document.getElementById('progress-seen').textContent =
      I18N.t('cardsSeenOf', { seen, total: DECK.length });
    document.getElementById('progress-cat-title').textContent = I18N.t('byCategory');

    // Category breakdown
    const catList = document.getElementById('progress-cat-list');
    catList.innerHTML = '';
    const catData = BKT.masteryByCategory(bkt);

    catData.forEach(({ category, mastery }) => {
      const pct = Math.round(mastery * 100);
      const breakdown = BKT.masteryByCardType(bkt, category);
      const mPct = Math.round(breakdown.find(b => b.cardType === 'meaning').mastery * 100);
      const pPct = Math.round(breakdown.find(b => b.cardType === 'pinyin').mastery * 100);
      const wordCount = [...new Set(DECK.filter(c => c.category === category).map(c => c.wordIndex))].length;

      const item = document.createElement('div');
      item.className = 'progress-cat-item';
      item.innerHTML = `
        <div class="progress-cat-header" role="button" tabindex="0">
          <span class="progress-cat-name">${I18N.catLabel(category)}</span>
          <span class="progress-cat-count">${wordCount} words</span>
          <span class="progress-cat-pct">${pct}%</span>
          <span class="progress-cat-chevron">▾</span>
        </div>
        <div class="progress-cat-bar-wrap">
          <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
        </div>
        <div class="progress-cat-detail hidden">
          <div class="progress-subbar">
            <span>${I18N.t('meaning')}</span>
            <div class="progress-bar-bg sm"><div class="progress-bar-fill" style="width:${mPct}%"></div></div>
            <span>${mPct}%</span>
          </div>
          <div class="progress-subbar">
            <span>${I18N.t('pinyin')}</span>
            <div class="progress-bar-bg sm"><div class="progress-bar-fill accent2" style="width:${pPct}%"></div></div>
            <span>${pPct}%</span>
          </div>
        </div>
      `;
      catList.appendChild(item);
    });
  }

  // ── Study session ─────────────────────────────────────────────────────────

  function renderStudyStart() {
    const user = DB.getCurrentUser();
    if (!user) { showScreen('profile'); return; }

    const sm2  = DB.getSM2State(user.id);
    const bkt  = DB.getBKTState(user.id);
    const queue = Scheduler.buildQueue(sm2, bkt);

    if (queue.length === 0) {
      showNoCards();
      return;
    }

    session = {
      userId:   user.id,
      queue,
      index:    0,
      correct:  0,
      total:    0,
    };

    document.getElementById('study-exit-btn').textContent = I18N.t('exitSession');
    showCard();
  }

  function showCard() {
    if (!session || session.index >= session.queue.length) {
      showSessionDone();
      return;
    }

    const cardId = session.queue[session.index];
    const card   = DECK.find(c => c.id === cardId);

    document.getElementById('study-progress').textContent =
      `${session.index + 1} / ${session.queue.length}`;
    document.getElementById('study-progress-fill').style.width =
      Math.round((session.index / session.queue.length) * 100) + '%';

    document.getElementById('study-chinese').textContent = card.chinese;
    document.getElementById('study-pinyin-hint').textContent =
      card.cardType === 'meaning' ? card.pinyin : '';
    document.getElementById('study-prompt').textContent =
      card.cardType === 'meaning' ? I18N.t('cardMeaning') : I18N.t('cardPinyin');

    // Reset answer area
    const input = document.getElementById('study-input');
    input.value = '';
    input.placeholder = I18N.t('typeAnswer');
    input.disabled = false;

    document.getElementById('study-submit-btn').textContent = I18N.t('submitAnswer');
    document.getElementById('study-submit-btn').disabled = false;
    document.getElementById('study-result').classList.add('hidden');
    document.getElementById('study-next-btn').classList.add('hidden');
    document.getElementById('study-override-btn').classList.add('hidden');

    input.focus();
  }

  function submitAnswer() {
    if (!session) return;
    const input  = document.getElementById('study-input');
    const answer = input.value.trim();
    if (!answer) return;

    const cardId = session.queue[session.index];
    const card   = DECK.find(c => c.id === cardId);
    const correct = Grader.grade(answer, card);

    input.disabled = true;
    document.getElementById('study-submit-btn').disabled = true;

    showResult(card, answer, correct);
    persistResponse(card, correct);
  }

  function showResult(card, userAnswer, correct) {
    session.total++;
    if (correct) session.correct++;

    const resultEl  = document.getElementById('study-result');
    const labelEl   = document.getElementById('study-result-label');
    const correctEl = document.getElementById('study-correct-answer');
    const yourEl    = document.getElementById('study-your-answer');

    resultEl.classList.remove('hidden', 'result-correct', 'result-incorrect');
    resultEl.classList.add(correct ? 'result-correct' : 'result-incorrect');

    labelEl.textContent = I18N.t(correct ? 'correct' : 'incorrect');

    // Always show the correct answer and their answer
    const correctDisplay = card.cardType === 'meaning' ? card.english : card.pinyin;
    correctEl.innerHTML = `<span class="result-label">${I18N.t('correctAnswer')}</span> ${escHtml(correctDisplay)}`;
    yourEl.innerHTML    = `<span class="result-label">${I18N.t('yourAnswer')}</span> ${escHtml(userAnswer)}`;

    // Show override button only on wrong answers
    const overrideBtn = document.getElementById('study-override-btn');
    if (!correct) {
      overrideBtn.textContent = I18N.t('overrideBtn');
      overrideBtn.classList.remove('hidden');
      overrideBtn.dataset.cardId = card.id;
    } else {
      overrideBtn.classList.add('hidden');
    }

    document.getElementById('study-next-btn').textContent = I18N.t('nextCard');
    document.getElementById('study-next-btn').classList.remove('hidden');
    document.getElementById('study-next-btn').focus();
  }

  function persistResponse(card, correct) {
    DB.recordResponse(session.userId, card, correct);
  }

  function overrideWrong(cardId) {
    // Show reason picker modal
    const reasons = I18N.overrideReasons();
    const modal   = document.getElementById('override-modal');
    const list    = document.getElementById('override-reason-list');
    document.getElementById('override-title').textContent = I18N.t('overrideTitle');
    list.innerHTML = '';
    reasons.forEach((reason, i) => {
      const btn = document.createElement('button');
      btn.className = 'override-reason-btn';
      btn.textContent = reason;
      btn.onclick = () => {
        modal.classList.add('hidden');
        applyOverride(cardId);
      };
      list.appendChild(btn);
    });
    document.getElementById('override-cancel-btn').textContent = I18N.t('cancel');
    modal.classList.remove('hidden');
  }

  function applyOverride(cardId) {
    // Re-record as correct: update SM-2 and BKT as if they answered correctly
    const card = DECK.find(c => c.id === cardId);
    DB.recordResponse(session.userId, card, true);
    // Visually flip the result indicator
    const resultEl = document.getElementById('study-result');
    resultEl.classList.remove('result-incorrect');
    resultEl.classList.add('result-correct');
    document.getElementById('study-result-label').textContent = I18N.t('correct');
    document.getElementById('study-override-btn').classList.add('hidden');
    // Update session tally
    session.correct++;
  }

  function nextCard() {
    session.index++;
    showCard();
  }

  function showSessionDone() {
    const pct = session.total > 0
      ? Math.round((session.correct / session.total) * 100) : 0;

    document.getElementById('study-done').classList.remove('hidden');
    document.getElementById('study-card-area').classList.add('hidden');
    document.getElementById('session-done-title').textContent = I18N.t('sessionDone');
    document.getElementById('session-done-stats').textContent =
      I18N.t('sessionStats', { n: session.total, pct });
    document.getElementById('session-back-btn').textContent = I18N.t('backHome');
    session = null;
  }

  function showNoCards() {
    document.getElementById('study-no-cards').classList.remove('hidden');
    document.getElementById('study-card-area').classList.add('hidden');
    document.getElementById('study-done').classList.add('hidden');
    document.getElementById('no-cards-msg').textContent = I18N.t('noCards');
    document.getElementById('session-back-btn2').textContent = I18N.t('backHome');
  }

  // ── Event binding ─────────────────────────────────────────────────────────

  function bindGlobalEvents() {

    // Language toggle
    document.getElementById('lang-toggle-btn').addEventListener('click', () => {
      const user = DB.getCurrentUser();
      const newLang = I18N.getLang() === 'en' ? 'zh' : 'en';
      I18N.setLang(newLang);
      if (user) {
        DB.updateUser({ ...user, lang: newLang });
      }
      renderAll();
      // Re-render current screen
      const visible = document.querySelector('.screen:not(.hidden)');
      if (visible) {
        const name = visible.id.replace('screen-', '');
        showScreen(name);
      }
    });

    // Welcome screen
    document.getElementById('welcome-start-btn').addEventListener('click', () => {
      const hide = document.getElementById('welcome-hide-cb').checked;
      const user = DB.getCurrentUser();
      if (user && hide) {
        DB.updateUser({ ...user, hideWelcome: true });
      }
      showScreen('home');
    });

    // Profile screen – create new
    document.getElementById('new-profile-btn').addEventListener('click', () => {
      document.getElementById('profile-create-form').classList.toggle('hidden');
      document.getElementById('profile-name-input').focus();
    });

    document.getElementById('profile-create-btn').addEventListener('click', createProfile);
    document.getElementById('profile-name-input').addEventListener('keydown', e => {
      if (e.key === 'Enter') createProfile();
    });

    document.getElementById('profile-cancel-btn').addEventListener('click', () => {
      document.getElementById('profile-create-form').classList.add('hidden');
    });

    // Profile list – delegation
    document.getElementById('profile-list').addEventListener('click', e => {
      const selBtn = e.target.closest('.profile-select-btn');
      const delBtn = e.target.closest('.profile-delete-btn');
      if (selBtn) {
        selectProfile(selBtn.dataset.id);
      } else if (delBtn) {
        const id = delBtn.dataset.id;
        if (confirm(I18N.t('confirmDelete'))) {
          DB.deleteUser(id);
          renderProfile();
        }
      }
    });

    // Home screen
    document.getElementById('home-switch-btn').addEventListener('click', () => {
      showScreen('profile');
    });
    document.getElementById('study-btn').addEventListener('click', () => {
      showScreen('study');
    });
    document.getElementById('progress-btn').addEventListener('click', () => {
      showScreen('progress');
    });

    // Progress screen
    document.getElementById('progress-back-btn').addEventListener('click', () => {
      showScreen('home');
    });

    // Progress category accordion – delegation
    document.getElementById('progress-cat-list').addEventListener('click', e => {
      const header = e.target.closest('.progress-cat-header');
      if (header) {
        const detail = header.closest('.progress-cat-item').querySelector('.progress-cat-detail');
        const chevron = header.querySelector('.progress-cat-chevron');
        detail.classList.toggle('hidden');
        chevron.textContent = detail.classList.contains('hidden') ? '▾' : '▴';
      }
    });

    // Study screen
    document.getElementById('study-exit-btn').addEventListener('click', () => {
      session = null;
      document.getElementById('study-done').classList.add('hidden');
      document.getElementById('study-no-cards').classList.add('hidden');
      document.getElementById('study-card-area').classList.remove('hidden');
      showScreen('home');
    });

    document.getElementById('study-submit-btn').addEventListener('click', submitAnswer);

    document.getElementById('study-input').addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const nextBtn = document.getElementById('study-next-btn');
        if (!nextBtn.classList.contains('hidden')) {
          nextCard();
        } else {
          submitAnswer();
        }
      }
    });

    document.getElementById('study-next-btn').addEventListener('click', nextCard);
    document.getElementById('session-back-btn').addEventListener('click', () => {
      document.getElementById('study-done').classList.add('hidden');
      document.getElementById('study-card-area').classList.remove('hidden');
      showScreen('home');
    });
    document.getElementById('session-back-btn2').addEventListener('click', () => {
      document.getElementById('study-no-cards').classList.add('hidden');
      document.getElementById('study-card-area').classList.remove('hidden');
      showScreen('home');
    });

    document.getElementById('study-override-btn').addEventListener('click', e => {
      overrideWrong(e.target.dataset.cardId);
    });

    document.getElementById('override-cancel-btn').addEventListener('click', () => {
      document.getElementById('override-modal').classList.add('hidden');
    });

    // Keyboard shortcut: Space to advance in study session
    document.addEventListener('keydown', e => {
      if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
        const nextBtn = document.getElementById('study-next-btn');
        if (nextBtn && !nextBtn.classList.contains('hidden') &&
            !document.getElementById('screen-study').classList.contains('hidden')) {
          e.preventDefault();
          nextCard();
        }
      }
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  function createProfile() {
    const input = document.getElementById('profile-name-input');
    const name  = input.value.trim();
    if (!name) { input.focus(); return; }
    const user = DB.createUser(name);
    DB.setCurrentUserId(user.id);
    I18N.setLang(user.lang);
    input.value = '';
    document.getElementById('profile-create-form').classList.add('hidden');
    if (!user.hideWelcome) {
      showScreen('welcome');
    } else {
      showScreen('home');
    }
  }

  function selectProfile(id) {
    DB.setCurrentUserId(id);
    const user = DB.getUserById(id);
    if (user) {
      I18N.setLang(user.lang);
      renderAll();
    }
    if (!user.hideWelcome) {
      showScreen('welcome');
    } else {
      showScreen('home');
    }
  }

  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  return { init };

})();

// Boot the app once the DOM is ready
document.addEventListener('DOMContentLoaded', App.init);
