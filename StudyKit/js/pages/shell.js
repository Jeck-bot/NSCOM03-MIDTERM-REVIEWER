/* App shell: header nav, topic sidebar, theme toggle. Owner: Lead. */
(function () {
  'use strict';
  var h = KIT.h;
  var NAV = [
    ['home', 'Home'], ['cram', 'Cram'], ['cheatsheet', 'Cheat sheet'], ['diag', 'Diagnostic'], ['practice', 'Practice'],
    ['lab', 'Visual lab'], ['flash', 'Flashcards'], ['exam', 'Mock exams']
  ];

  function applyTheme(mode) {
    var de = document.documentElement;
    if (mode === 'light' || mode === 'dark') de.setAttribute('data-theme', mode);
    else de.removeAttribute('data-theme');
  }
  function themeLabel(mode) { return mode === 'dark' ? '☾ Dark' : mode === 'light' ? '☀ Light' : '◐ Auto'; }
  KIT.ui.applyTheme = function () { applyTheme(KIT.store.get('theme', 'auto')); };

  function themeButton() {
    var btn = h('button', { class: 'btn ghost', type: 'button', title: 'Switch theme (auto / light / dark)' }, themeLabel(KIT.store.get('theme', 'auto')));
    btn.addEventListener('click', function () {
      var next = { auto: 'light', light: 'dark', dark: 'auto' }[KIT.store.get('theme', 'auto')] || 'auto';
      KIT.store.set('theme', next);
      applyTheme(next);
      btn.textContent = themeLabel(next);
    });
    return btn;
  }

  /** Short label used in the sidebar and cards: L01, L02, L03a, L03b, L04. */
  KIT.ui.deckLabel = function (id) {
    var m = KIT.META[id];
    if (!m) return id;
    if (id === 'l03a') return 'L03a';
    if (id === 'l03b') return 'L03b';
    return m.deck;
  };

  KIT.ui.shell = function (rootEl, route) {
    var page = route.path[0];
    var progress = KIT.store.get('progress.topics', {});
    var header = h('header', { class: 'kit-header no-print' },
      h('a', { class: 'brand', href: '#/home' }, h('span', { class: 'logo' }, 'N3'), 'NSCOM03 Midterm Kit'),
      h('nav', { class: 'kit-nav', 'aria-label': 'Main' }, NAV.map(function (n) {
        return h('a', { href: '#/' + n[0], class: page === n[0] ? 'active' : null }, n[1]);
      })),
      h('div', { class: 'spacer' }),
      themeButton());
    var side = h('aside', { class: 'kit-side no-print', 'aria-label': 'Topics' },
      h('div', { class: 'side-title' }, 'Topics'),
      h('ol', { class: 'side-topics' }, KIT.TOPIC_IDS.map(function (id) {
        var t = KIT.getTopic(id);
        var active = page === 'topic' && route.path[1] === id;
        var done = progress[id] && progress[id].read;
        return h('li', { class: (active ? 'active ' : '') + (t ? '' : 'pending') },
          h('a', { href: '#/topic/' + id, 'aria-current': active ? 'page' : null },
            h('span', { class: 'deck' }, KIT.ui.deckLabel(id)),
            h('span', { class: 'ttl' }, t ? t.title : KIT.META[id].title),
            done ? h('span', { class: 'done', title: 'Marked as read' }, '✓') : h('span')));
      })));
    var main = h('main', { class: 'kit-main', id: 'main' });
    // Right-hand panel slot: empty and hidden unless the page fills it (topic pages: Terms & FAQ, js/ui/terms.js).
    var aside = h('aside', { class: 'kit-aside no-print', 'aria-label': 'Terms and FAQ', hidden: 'hidden' });
    rootEl.appendChild(header);
    rootEl.appendChild(h('div', { class: 'kit-layout' }, side, main, aside));
    rootEl.appendChild(h('footer', { class: 'kit-footer no-print' },
      'NSCOM03 Midterm Study Kit · build ' + KIT.build + ' · works offline · progress is saved in this browser only'));
    return main;
  };
})();
