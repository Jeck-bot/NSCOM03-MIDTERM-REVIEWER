/* NSCOM03 Midterm Study Kit — core namespace and registries.
   Must be the FIRST script. Every other file is an IIFE that only touches KIT. */
(function (root) {
  'use strict';
  if (root.KIT) return;

  var hasOwn = Object.prototype.hasOwnProperty;

  var KIT = {
    version: '1.0.0',
    build: 'r1',
    env: { static: false, node: typeof root.document === 'undefined' },
    errors: [],
    calc: {},   // pure calculation modules attach here: KIT.calc.signals = {...}
    ui: {},     // UI components: KIT.ui.quiz, KIT.ui.shell, ...
    print: {},  // print-document renderers
    draw: {},   // DOM drawing helpers used by figures, visuals and answer keys (defined in js/viz/*.js)
    data: {}    // shared static data tables, if any
  };

  /* ---------- error capture ---------- */
  KIT.report = function (err, where) {
    var msg = err && err.message ? err.message : String(err);
    KIT.errors.push({ where: where || '', message: msg, stack: err && err.stack ? String(err.stack) : '' });
  };
  if (typeof root.addEventListener === 'function') {
    // Capture phase so failed <script src> loads (which don't bubble) are recorded too.
    root.addEventListener('error', function (ev) {
      var t = ev && ev.target;
      if (t && t !== root && t.tagName === 'SCRIPT') {
        KIT.report(new Error('Failed to load script: ' + (t.getAttribute('src') || '?')), 'load');
      } else {
        KIT.report(ev && ev.error ? ev.error : new Error(ev && ev.message ? ev.message : 'Unknown error'),
          ev && ev.filename ? ev.filename + ':' + ev.lineno : 'runtime');
      }
    }, true);
    root.addEventListener('unhandledrejection', function (ev) { KIT.report(ev && ev.reason, 'promise'); });
  }

  /* ---------- generic registry ---------- */
  function makeRegistry(kind) {
    var items = {}, order = [];
    return {
      add: function (id, def) {
        if (!id || typeof id !== 'string') { KIT.report(new Error(kind + ': missing or non-string id'), kind); return null; }
        if (hasOwn.call(items, id)) { KIT.report(new Error(kind + ': duplicate id "' + id + '"'), kind); return null; }
        items[id] = def; order.push(id);
        return def;
      },
      get: function (id) { return hasOwn.call(items, id) ? items[id] : null; },
      has: function (id) { return hasOwn.call(items, id); },
      ids: function () { return order.slice(); },
      all: function () { return order.map(function (id) { return items[id]; }); }
    };
  }
  KIT._makeRegistry = makeRegistry;

  /* ---------- topic metadata (decks, page counts) ---------- */
  var RES = '../Resources/';
  KIT.META = {
    l01: { deck: 'L01', lecture: 1, pages: 18, title: 'Review of the Physical & Data Link Layers',
      file: RES + 'NSCOM03-01 Review of Physical and Data Link Layer.pdf' },
    l02: { deck: 'L02', lecture: 2, pages: 39, title: 'Signals, Bandwidth, Noise & Data-Rate Limits',
      file: RES + 'NSCOM03-02 Physical Communication Layer.pdf' },
    l03a: { deck: 'L03', lecture: 3, pages: 96, range: [1, 61], title: 'Digital Transmission I: Line Coding, Block Coding & Scrambling',
      file: RES + 'NSCOM03-03 Physical Communication Layer - Digital Transmission.pdf' },
    l03b: { deck: 'L03', lecture: 3, pages: 96, range: [62, 96], title: 'Digital Transmission II: PCM, Delta Modulation & Transmission Modes',
      file: RES + 'NSCOM03-03 Physical Communication Layer - Digital Transmission.pdf' },
    l04: { deck: 'L04', lecture: 4, pages: 31, title: 'Digital-to-Analog: ASK, FSK, PSK & QAM',
      file: RES + 'NSCOM03-04 Physical Communication Layer - Digital to Analog Transmission.pdf' }
  };
  // Midterm coverage: Modules 1–4 only (L01–L04). L03 is split into two topic pages.
  KIT.TOPIC_IDS = ['l01', 'l02', 'l03a', 'l03b', 'l04'];
  KIT.DECK_PAGES = { L01: 18, L02: 39, L03: 96, L04: 31 };

  /* ---------- topics ---------- */
  var topics = makeRegistry('topic');
  KIT.topic = function (def) {
    if (!def || typeof def !== 'object') { KIT.report(new Error('KIT.topic: definition must be an object'), 'topic'); return null; }
    return topics.add(def.id, def);
  };
  KIT.getTopic = topics.get;
  KIT.hasTopic = topics.has;
  /** Registered topics in lecture order (unknown ids last). */
  KIT.topics = function () {
    var known = KIT.TOPIC_IDS.filter(topics.has).map(topics.get);
    var extra = topics.ids().filter(function (id) { return KIT.TOPIC_IDS.indexOf(id) < 0; }).map(topics.get);
    return known.concat(extra);
  };

  /** A topic's slides in its deck, [first, last] (l03a and l03b split L03). */
  KIT.topicRange = function (topic) {
    var m = KIT.META[topic];
    return m ? (m.range ? m.range.slice() : [1, m.pages]) : null;
  };

  /* ---------- slide-by-slide walkthroughs (content/walk/*.js, docs/AUTHORING.md §3.7) ---------- */
  var walks = makeRegistry('walk');
  KIT.walk = function (def) { return walks.add(def && def.id, def); };
  KIT.getWalk = walks.get;
  /** Walkthrough files — all, or one topic's — in lecture and slide order. */
  KIT.walks = function (topic) {
    var rank = function (w) { var i = KIT.TOPIC_IDS.indexOf(w.topic); return i < 0 ? 99 : i; };
    var first = function (w) { return Array.isArray(w.range) ? w.range[0] : 0; };
    return walks.all().filter(function (w) { return !topic || w.topic === topic; })
      .sort(function (a, b) { return (rank(a) - rank(b)) || (first(a) - first(b)); });
  };

  /* ---------- cram sheet (content/cram.js, AUTHORING §3.10): one per kit ---------- */
  var cramDef = null;
  KIT.cram = function (def) {
    if (cramDef) { KIT.report(new Error('KIT.cram: registered twice'), 'cram'); return null; }
    cramDef = def;
    return def;
  };
  KIT.getCram = function () { return cramDef; };

  /* ---------- formulas ---------- */
  var formulas = makeRegistry('formula');
  KIT.formula = function (def) { return formulas.add(def && def.id, def); };
  KIT.getFormula = formulas.get;
  KIT.formulas = function (q) {
    q = q || {};
    var rank = function (f) { var i = KIT.TOPIC_IDS.indexOf(f.topic); return i < 0 ? 99 : i; };
    return formulas.all()
      .filter(function (f) {
        return (!q.topic || f.topic === q.topic) && (q.sheet === undefined || !!f.sheet === !!q.sheet);
      })
      .map(function (f, i) { return { f: f, i: i }; })
      .sort(function (a, b) { return (rank(a.f) - rank(b.f)) || (a.i - b.i); })
      .map(function (x) { return x.f; });
  };

  /* ---------- question bank ---------- */
  var bank = makeRegistry('question');
  KIT.bank = {
    add: function (items) {
      (Array.isArray(items) ? items : [items]).forEach(function (it) { bank.add(it && it.id, it); });
    },
    get: bank.get, has: bank.has, ids: bank.ids, all: bank.all,
    /** q: {topic, type, pool ('none' = items without a pool), exclude: array of ids} */
    query: function (q) {
      q = q || {};
      var ex = {};
      (q.exclude || []).forEach(function (id) { ex[id] = true; });
      return bank.all().filter(function (it) {
        if (ex[it.id]) return false;
        if (q.topic && it.topic !== q.topic) return false;
        if (q.type && it.type !== q.type) return false;
        if (q.pool === 'none' && it.pool) return false;
        if (q.pool && q.pool !== 'none' && it.pool !== q.pool) return false;
        return true;
      });
    }
  };

  /* ---------- generators ---------- */
  var gens = makeRegistry('generator');
  KIT.gen = {
    register: function (id, def) { if (def && typeof def === 'object') def.id = id; return gens.add(id, def); },
    get: gens.get, has: gens.has, ids: gens.ids, all: gens.all,
    list: function (q) { q = q || {}; return gens.all().filter(function (g) { return !q.topic || g.topic === q.topic; }); },
    /** Build a problem from explicit params (used by worked examples and fixed exam slots). */
    build: function (id, params) {
      var g = gens.get(id);
      if (!g) throw new Error('Unknown generator: ' + id);
      var p = g.build(params || {});
      if (p && typeof p === 'object') { p.gen = id; p.params = params || {}; }
      return p;
    },
    /** Seeded random instance. Requires def.params(rng). */
    random: function (id, seed) {
      var g = gens.get(id);
      if (!g) throw new Error('Unknown generator: ' + id);
      if (typeof g.params !== 'function') throw new Error('Generator ' + id + ' has no params(rng) yet');
      var p = g.params(KIT.rng(seed));
      var prob = KIT.gen.build(id, p);
      prob.seed = seed;
      return prob;
    }
  };

  /* ---------- worked-example animations (js/anim/*.js; player in js/ui/anim.js) ---------- */
  var anims = makeRegistry('anim');
  KIT.anim = {
    /** frames(params, problem) → [{ caption: 'html', render: function () { return Element; }, step?: index of the solution step }].
        Pure until render() is called: no DOM access while building the list. */
    register: function (genId, frames) { return anims.add(genId, frames); },
    has: anims.has, ids: anims.ids,
    frames: function (genId, params, problem) { var f = anims.get(genId); return f ? f(params || {}, problem) : null; },
    /** Equation flow: frames that write a solution line by line (color-coded $…$ math), each frame above an optional
        diagram. lines: [{ tex|html, caption, step?, figure?: function () { return Element; } }] — a line's figure stays
        until a later line brings its own. The newest line fades in; earlier lines stay, so the whole chain is visible. */
    eqFrames: function (lines) {
      return lines.map(function (ln, k) {
        var fig = null;
        for (var j = k; j >= 0 && !fig; j--) fig = lines[j].figure || null;
        return {
          caption: ln.caption, step: ln.step,
          render: function () {
            var h = KIT.h, box = h('div', { class: 'anim-eq' });
            if (fig) box.appendChild(h('div', { class: 'anim-eq-fig' }, fig()));
            var list = h('ol', { class: 'anim-eq-lines' });
            for (var i = 0; i <= k; i++) {
              var l = lines[i];
              if (!l.tex && !l.html) continue;
              list.appendChild(h('li', { class: i === k ? 'anim-new now' : '' }, KIT.html(l.html || '$' + l.tex + '$')));
            }
            box.appendChild(list);
            return box;
          }
        };
      });
    }
  };

  /* ---------- visualizations ---------- */
  var vizzes = makeRegistry('viz');
  var activeViz = [];
  KIT.viz = {
    register: function (id, def) { if (def && typeof def === 'object') def.id = id; return vizzes.add(id, def); },
    get: vizzes.get, has: vizzes.has, ids: vizzes.ids, all: vizzes.all,
    list: function (q) { q = q || {}; return vizzes.all().filter(function (v) { return !q.topic || v.topic === q.topic; }); },
    mount: function (id, el, opts) {
      var v = vizzes.get(id);
      if (!v) throw new Error('Unknown viz: ' + id);
      opts = opts || {};
      if (opts.static === undefined) opts.static = KIT.env.static;
      var h = v.mount(el, opts) || {};
      activeViz.push(h);
      return h;
    },
    destroyAll: function () {
      while (activeViz.length) {
        var h = activeViz.pop();
        try { if (h && typeof h.destroy === 'function') h.destroy(); } catch (e) { KIT.report(e, 'viz.destroy'); }
      }
    }
  };

  /* ---------- static figures (rendered from <figure data-fig="name" data-…>) ---------- */
  var figs = makeRegistry('figure');
  KIT.fig = {
    register: function (id, render) { return figs.add(id, render); },
    has: figs.has, ids: figs.ids,
    render: function (id, el, data) {
      var f = figs.get(id);
      if (!f) throw new Error('Unknown figure: ' + id);
      return f(el, data || {});
    },
    /** Render every [data-fig] placeholder inside rootEl. */
    hydrate: function (rootEl) {
      if (!rootEl || typeof rootEl.querySelectorAll !== 'function') return;
      var nodes = rootEl.querySelectorAll('[data-fig]');
      for (var i = 0; i < nodes.length; i++) {
        var el = nodes[i];
        if (el.getAttribute('data-hydrated')) continue;
        el.setAttribute('data-hydrated', '1');
        var name = el.getAttribute('data-fig');
        var data = {};
        for (var k in el.dataset) if (hasOwn.call(el.dataset, k)) data[k] = el.dataset[k];
        try { KIT.fig.render(name, el, data); }
        catch (e) {
          KIT.report(e, 'fig:' + name);
          el.appendChild(root.document.createTextNode('[figure "' + name + '" failed: ' + e.message + ']'));
        }
      }
    }
  };

  /* ---------- exams ---------- */
  var exams = makeRegistry('exam');
  KIT.exam = function (def) { return exams.add(def && def.id, def); };
  KIT.exams = { get: exams.get, has: exams.has, ids: exams.ids, all: exams.all };

  /* ---------- pages (hash routes) ---------- */
  var pages = makeRegistry('page');
  KIT.page = function (name, render) { return pages.add(name, render); };
  KIT.pages = { get: pages.get, has: pages.has, ids: pages.ids };

  root.KIT = KIT;
})(typeof window !== 'undefined' ? window : globalThis);
