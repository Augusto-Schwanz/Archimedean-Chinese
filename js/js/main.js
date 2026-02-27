// ============================================================
// js/main.js — Welcome / Profile Selection Page Controller
// ============================================================
(function () {
  const DB      = window.AC.DB;
  const i18n    = window.AC.i18n;
  const Sched   = window.AC.Scheduler;
  const deck    = window.AC.DECKS.hsk1;

  let selectedUserId = null;

  // ── Init ──────────────────────────────────────────────────

  function init() {
    // Restore language from last active user
    const lastId = DB.getCurrentUserId();
    if (lastId) {
      const user = DB.getUser(lastId);
      if (user) i18n.setLang(user.lang || 'en');
    }
    i18n.applyToPage();
    bindEvents();
    renderProfiles();
    maybeShowWelcome();
  }

  // ── Language toggle ───────────────────────────────────────

  function bindEvents() {
    // Language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.dataset.lang;
        i18n.setLang(lang);
        i18n.applyToPage();
        // Update button states
        document.querySelectorAll('.lang-btn').forEach(b =>
          b.classList.toggle('active', b.dataset.lang === lang)
        );
        // Persist language to selected user
        if (selectedUserId) DB.updateUser(selectedUserId, { lang });
      });
    });

    // Create profile
    document.getElementById('createProfileBtn').addEventListener('click', createProfile);
    document.getElementById('newProfileName').addEventListener('keydown', e => {
      if (e.key === 'Enter') createProfile();
    });

    // Start button
    document.getElementById('startBtn').addEventListener('click', () => {
      if (selectedUserId) {
        DB.setCurrentUser(selectedUserId);
        window.location.href = 'progress.html';
      }
    });

    // Welcome modal
    document.getElementById('welcomeContinue').addEventListener('click', closeWelcome);
  }

  // ── Welcome modal ─────────────────────────────────────────

  function maybeShowWelcome() {
    const userId = DB.getCurrentUserId();
    if (!userId) return;
    const user = DB.getUser(userId);
    if (user && user.showWelcome !== false) {
      document.getElementById('welcomeModal').classList.remove('hidden');
    }
  }

  function closeWelcome() {
    const modal = document.getElementById('welcomeModal');
    modal.classList.add('hidden');
    if (document.getElementById('dontShowAgain').checked && selectedUserId) {
      DB.updateUser(selectedUserId, { showWelcome: false });
    }
  }

  // ── Profile rendering ─────────────────────────────────────

  function renderProfiles() {
    const users   = DB.getUsers();
    const list    = document.getElementById('profileList');
    const noMsg   = document.getElementById('noProfilesMsg');
    const startBtn = document.getElementById('startBtn');

    list.innerHTML = '';

    if (users.length === 0) {
      noMsg.classList.remove('hidden');
      startBtn.disabled = true;
      selectedUserId = null;
      return;
    }
    noMsg.classList.add('hidden');

    for (const user of users) {
      const stats   = Sched.sessionStats(user.id, deck, DB);
      const mastery = DB.getOverallMastery(user.id, deck);
      const pct     = Math.round(mastery * 100);

      const item    = document.createElement('div');
      item.className = 'profile-item animate-in';
      item.dataset.userId = user.id;

      const dueLabel = stats.dueCount > 0
        ? `${stats.dueCount} due · ${stats.newCount} new`
        : `${stats.newCount} new`;

      item.innerHTML = `
        <div class="profile-item__info">
          <div class="profile-item__name">${escHtml(user.name)}</div>
          <div class="profile-item__meta">${pct}% mastery · ${dueLabel}</div>
        </div>
        <div class="profile-item__actions">
          <button class="btn btn--danger delete-btn" data-uid="${user.id}"
                  data-i18n="deleteProfile">${i18n.t('deleteProfile')}</button>
        </div>
      `;

      item.addEventListener('click', (e) => {
        if (e.target.closest('.delete-btn')) return;
        selectProfile(user.id);
      });

      item.querySelector('.delete-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(i18n.t('confirmDelete'))) {
          DB.deleteUser(user.id);
          if (selectedUserId === user.id) {
            selectedUserId = null;
            startBtn.disabled = true;
          }
          renderProfiles();
        }
      });

      list.appendChild(item);
    }

    // Auto-select last active user
    const lastId = DB.getCurrentUserId();
    const toSelect = lastId && DB.getUser(lastId) ? lastId : users[0].id;
    selectProfile(toSelect, false);
  }

  function selectProfile(userId, persist = true) {
    selectedUserId = userId;
    if (persist) DB.setCurrentUser(userId);

    // Highlight selected
    document.querySelectorAll('.profile-item').forEach(el => {
      el.classList.toggle('active', el.dataset.userId === userId);
    });

    document.getElementById('startBtn').disabled = false;

    // Sync language to this profile's preference
    const user = DB.getUser(userId);
    if (user) {
      i18n.setLang(user.lang || 'en');
      i18n.applyToPage();
      document.querySelectorAll('.lang-btn').forEach(b =>
        b.classList.toggle('active', b.dataset.lang === i18n.getLang())
      );
    }
  }

  // ── Profile creation ──────────────────────────────────────

  function createProfile() {
    const input = document.getElementById('newProfileName');
    const name  = input.value.trim();
    if (!name) return;

    const user = DB.createUser(name, i18n.getLang());
    input.value = '';
    renderProfiles();
    selectProfile(user.id);

    // Show welcome for new user
    document.getElementById('welcomeModal').classList.remove('hidden');
    document.getElementById('dontShowAgain').checked = false;
  }

  // ── Utility ───────────────────────────────────────────────

  function escHtml(str) {
    return str.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  document.addEventListener('DOMContentLoaded', init);
})();
