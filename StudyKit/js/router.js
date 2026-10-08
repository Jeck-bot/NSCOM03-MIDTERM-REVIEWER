/* Hash router: #/<page>/<arg>…?<query>. Print and selftest routes render without the app shell, in static mode. */
(function () {
  'use strict';
  var rootEl = null, current = null;

  function parse(hash) {
    var h = String(hash || '').replace(/^#\/?/, '');
    var qi = h.indexOf('?');
    var pathStr = qi >= 0 ? h.slice(0, qi) : h;
    var query = {};
    if (qi >= 0) {
      h.slice(qi + 1).split('&').forEach(function (kv) {
        if (!kv) return;
        var i = kv.indexOf('=');
        var k = decodeURIComponent(i >= 0 ? kv.slice(0, i) : kv);
        query[k] = i >= 0 ? decodeURIComponent(kv.slice(i + 1)) : '1';
      });
    }
    var path = pathStr.split('/').filter(Boolean).map(function (s) { return decodeURIComponent(s); });
    if (!path.length) path = ['home'];
    return { path: path, query: query };
  }

  function comingSoon(main, route) {
    main.appendChild(KIT.h('h1', null, 'Coming soon'));
    main.appendChild(KIT.h('p', { class: 'muted' }, 'The "' + route.path[0] + '" section is still being built. Everything that is ready is linked from Home.'));
    main.appendChild(KIT.h('a', { class: 'btn', href: '#/home' }, '← Home'));
  }

  function render() {
    var route = parse(root.location.hash);
    current = route;
    KIT.viz.destroyAll();
    var name = route.path[0];
    var isPrint = name === 'print';
    KIT.env.static = isPrint || name === 'selftest' || route.query.static === '1';
    var doc = root.document;
    // ?theme=light|dark previews a theme without saving it (used for screenshots).
    if (route.query.theme === 'light' || route.query.theme === 'dark') doc.documentElement.setAttribute('data-theme', route.query.theme);
    else if (KIT.ui.applyTheme) KIT.ui.applyTheme();
    doc.body.classList.toggle('print-route', isPrint);
    doc.body.classList.toggle('static', KIT.env.static);
    KIT.clear(rootEl);
    var main = isPrint ? rootEl : (KIT.ui.shell ? KIT.ui.shell(rootEl, route) : rootEl);
    var page = KIT.pages.get(name);
    try {
      if (page) page(main, route); else comingSoon(main, route);
    } catch (e) {
      KIT.report(e, 'page:' + name);
      main.appendChild(KIT.h('div', { class: 'callout error' },
        KIT.h('div', { class: 'callout-label' }, '⚠ Render error'), 'This page failed to render: ' + e.message));
    }
    if (!isPrint && !route.query.keepScroll && root.scrollTo) root.scrollTo(0, 0);
  }

  var root = typeof window !== 'undefined' ? window : globalThis;
  KIT.router = {
    parse: parse,
    render: render,
    current: function () { return current; },
    start: function (el) {
      rootEl = el;
      root.addEventListener('hashchange', render);
      render();
    }
  };
})();
