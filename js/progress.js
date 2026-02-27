// ============================================================
// js/progress.js — Progress Dashboard Page Controller
// ============================================================
(function () {
  const DB    = window.AC.DB;
  const i18n  = window.AC.i18n;
  const Sched = window.AC.Scheduler;
  const BKT   = window.AC.BKT;
  const deck  = window.AC.DECKS.hsk1;

  function init() {
    // Redirect if no user
    const userId = DB.getCurrentUserId();
    if (!userId || !DB.getUser(userId)) {
      window.location.href = 'index.html';
      return;
    }

    const user = DB.getUser(userId);
    i18n.setLang(user.lang || 'en');
    i18n.applyToPage();
    bindLangToggle(userId);
    render(userId, user);
  }

  function bindLangToggle(userId) {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.dataset.lang;
        i18n.setLang(lang);
        i18n.applyToPage();
        document.querySelectorAll('.lang-btn').forEach(b =>
          b.classList.toggle('active', b.dataset.lang === lang)
        );
        DB.updateUser(userId, { lang });
        renderCategories(userId);
      });
    });
    // Set initial active state
    document.querySelectorAll('.lang-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.lang === i18n.getLang())
    );
  }

  function render(userId, user) {
    // Deck name
    document.getElementById('deckName').textContent =
      i18n.getLang() === 'zh' ? deck.nameCN : deck.name;

    // Greeting
    document.getElementById('userGreeting').textContent = user.name;

    // Session stats
    const stats = Sched.sessionStats(userId, deck, DB);
    document.getElementById('statDue').textContent   = stats.dueCount;
    document.getElementById('statNew').textContent   = stats.newCount;
    document.getElementById('statTotal').textContent = stats.total;

    // Nothing due message
    if (stats.dueCount === 0 && stats.newCount === 0) {
      document.getElementById('nothingDueMsg').classList.remove('hidden');
    }

    // Overall mastery ring
    const mastery = DB.getOverallMastery(userId, deck);
    const pct     = Math.round(mastery * 100);
    document.getElementById('masteryPct').textContent = pct + '%';

    // Update the conic-gradient ring
    const ring = document.getElementById('masteryRing');
    ring.style.background =
      `conic-gradient(var(--accent) ${pct}%, var(--bg-surface) ${pct}%)`;

    // Mastery detail text
    const label = BKT.masteryLabel(mastery);
    document.getElementById('masteryDetail').textContent =
      `${i18n.t(label)} · ${stats.total} ${i18n.t('cards')}`;

    // Category breakdown
    renderCategories(userId);
  }

  function renderCategories(userId) {
    const summary = DB.getMasterySummary(userId, deck);
    const list    = document.getElementById('categoryList');
    list.innerHTML = '';

    // Group by part of speech
    const groups = {};
    for (const item of summary) {
      if (!groups[item.pos]) groups[item.pos] = [];
      groups[item.pos].push(item);
    }

    // Sort groups by average mastery (weakest first)
    const sortedGroups = Object.entries(groups).sort(([, a], [, b]) => {
      const avgA = a.reduce((s, x) => s + x.p_known, 0) / a.length;
      const avgB = b.reduce((s, x) => s + x.p_known, 0) / b.length;
      return avgA - avgB;
    });

    for (const [pos, items] of sortedGroups) {
      const avgPct = Math.round(
        items.reduce((s, x) => s + x.p_known, 0) / items.length * 100
      );
      const fillColor = masteryColor(avgPct);

      const group = document.createElement('div');
      group.className = 'category-group';

      group.innerHTML = `
        <div class="category-group__header" role="button" tabindex="0">
          <span class="category-group__name">${escHtml(pos)}</span>
          <span class="category-group__pct">${avgPct}%</span>
          <span class="category-group__chevron">▾</span>
        </div>
        <div class="category-group__body">
          ${items.map(item => `
            <div class="subcat-row">
              <span class="subcat-row__label">
                ${item.cardType === 'meaning' ? i18n.t('meaningCards') : i18n.t('pinyinCards')}
              </span>
              <div class="subcat-row__bar">
                <div class="progress-bar">
                  <div class="progress-bar__fill" style="width:${Math.round(item.p_known*100)}%;background:${masteryColor(Math.round(item.p_known*100))}"></div>
                </div>
              </div>
              <span class="subcat-row__pct">${Math.round(item.p_known*100)}%</span>
            </div>
          `).join('')}
        </div>
      `;

      // Progress bar on header
      const headerBar = document.createElement('div');
      headerBar.style.cssText = `
        position:absolute;bottom:0;left:0;height:2px;
        width:${avgPct}%;background:${fillColor};
        border-radius:0 0 0 6px;transition:width 0.4s ease;
      `;
      const header = group.querySelector('.category-group__header');
      header.style.position = 'relative';
      header.appendChild(headerBar);

      // Toggle body
      const body = group.querySelector('.category-group__body');
      header.addEventListener('click', () => {
        header.classList.toggle('open');
        body.classList.toggle('open');
      });
      header.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          header.click();
        }
      });

      list.appendChild(group);
    }
  }

  function masteryColor(pct) {
    if (pct >= 90) return 'var(--success)';
    if (pct >= 60) return 'var(--accent)';
    if (pct >= 30) return 'var(--warning)';
    return 'var(--error)';
  }

  function escHtml(str) {
    return String(str).replace(/[&<>"']/g, c =>
      ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  document.addEventListener('DOMContentLoaded', init);
})();
