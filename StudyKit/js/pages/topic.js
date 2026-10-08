/* Topic page renderer (#/topic/<id>). Owner: Lead.
   Renders KIT.topic definitions section by section. Interactive by default; in static mode (print/selftest/?static=1)
   every answer and solution is shown and nothing animates. Also exposes KIT.ui.renderSection for print documents. */
(function () {
  'use strict';
  var h = KIT.h;

  function refChip(ref) { return ref ? h('span', { class: 'chip ref', title: 'Slide reference' }, ref) : null; }
  function beyondBadge(on) { return on ? h('span', { class: 'badge beyond', title: 'From the textbook, not on the slides' }, 'Beyond slides') : null; }
  function frag(html) { return KIT.html(html); }
  function isStatic() { return !!KIT.env.static; }

  /* ---------- answers & problems (shared with print docs) ---------- */
  /** One title column and bit width for all grids of a problem, so stacked waveforms share bit columns.
      With colWidth (px) the bit width grows until the longest bit string fills the column. */
  function gridLayout(inputs, colWidth) {
    var grids = (inputs || []).filter(function (inp) { return inp.kind === 'grid'; });
    if (!grids.length) return null;
    var titleW = Math.min(150, Math.max.apply(null, grids.map(function (inp) { return 10 + String(inp.label || '').length * 6.4; })));
    var nBits = Math.max.apply(null, grids.map(function (inp) { return String(inp.grid.bits || '').length || 1; }));
    return { titleWidth: titleW, bitWidth: colWidth ? Math.max(28, Math.min(64, Math.floor((colWidth - titleW - 56) / nBits))) : 34 };
  }
  KIT.ui.gridLayout = gridLayout;

  function answerNode(inp, lay) {
    if (inp.kind === 'sketch') {
      return h('div', { class: 'sketch-answer' }, KIT.ui.sketch.figure({ axes: inp.axes, height: inp.height }, inp.model),
        inp.rubric ? h('ul', { class: 'small sketch-rubric' }, inp.rubric.map(function (r) { return h('li', null, r.point); })) : null);
    }
    if (inp.kind === 'grid') {
      var g = inp.grid;
      return KIT.svg.wave(g.answer, { cellsPerBit: g.cellsPerBit, bits: g.bits, levelSet: g.levelSet || g.levels, init: g.init ? g.init.level : undefined, title: inp.label || '',
        titleWidth: lay ? lay.titleWidth : undefined, bitWidth: lay ? lay.bitWidth : undefined, stubSpace: !!lay });
    }
    return h('span', null, KIT.grade.display(inp));
  }
  KIT.ui.answerNode = answerNode;

  /** Worked solution block for a built problem: steps, final answers, optional key element. */
  function solutionBlock(p, opts) {
    opts = opts || {};
    var box = h('div', { class: 'solution' });
    var ol = h('ol', { class: 'steps' });
    (p.steps || []).forEach(function (s) { ol.appendChild(h('li', null, frag(s))); });
    box.appendChild(ol);
    if (p.key) { try { box.appendChild(h('div', { class: 'key-box' }, p.key({ static: isStatic() }))); } catch (e) { KIT.report(e, 'key:' + p.gen); } }
    var ans = h('div', { class: 'answers' }), lay = gridLayout(p.inputs);
    (p.inputs || []).forEach(function (inp) {
      if (inp.kind === 'grid') { if (!p.keyShowsAnswer) box.appendChild(h('div', { class: 'key-box ans-grid' }, answerNode(inp, lay))); return; }
      if (inp.kind === 'sketch') { box.appendChild(h('div', { class: 'key-box' }, inp.label ? h('div', { class: 'a-label' }, inp.label) : null, answerNode(inp))); return; }
      ans.appendChild(h('span', null, inp.label ? h('span', { class: 'a-label' }, inp.label + ' = ') : null, answerNode(inp)));
    });
    if (ans.childNodes.length) box.appendChild(ans);
    return box;
  }
  KIT.ui.solutionBlock = solutionBlock;

  /* ---------- section renderers ---------- */
  function predictBlock(p, vizHandle) {
    var wrap = h('div', { class: 'predict' }, h('div', { class: 'predict-q' }, h('strong', null, 'Predict: '), frag(p.q)));
    var fb = h('div', { class: 'predict-fb' });
    if (isStatic()) {
      fb.appendChild(h('div', { class: 'fb ok' }, 'Answer: ', frag(p.choices[p.answer])));
      fb.appendChild(h('div', null, frag(p.explain)));
      wrap.appendChild(fb);
      return wrap;
    }
    fb.hidden = true;
    var buttons = [];
    var row = h('div', { class: 'choices' });
    p.choices.forEach(function (c, i) {
      var b = h('button', { class: 'btn choice', type: 'button' }, frag(c));
      b.addEventListener('click', function () {
        buttons.forEach(function (x, j) { x.classList.toggle('right', j === p.answer); x.classList.toggle('wrong', j === i && i !== p.answer); });
        KIT.clear(fb);
        fb.appendChild(h('div', { class: 'fb ' + (i === p.answer ? 'ok' : 'bad') }, i === p.answer ? '✓ Yes.' : '✗ Not quite — it\'s the highlighted one.'));
        fb.appendChild(h('div', null, frag(p.explain)));
        fb.hidden = false;
        if (vizHandle && typeof vizHandle.set === 'function' && p.set) vizHandle.set(p.set);
      });
      buttons.push(b);
      row.appendChild(b);
    });
    wrap.appendChild(row);
    wrap.appendChild(fb);
    return wrap;
  }

  var R = {};
  R.intuition = function (s) {
    var box = h('section', { class: 'callout intuition', id: 'sec-intuition' }, h('div', { class: 'callout-label' }, '💡 Intuition first'));
    if (s.title) box.appendChild(h('h3', { style: { marginTop: '4px' } }, s.title));
    var handle = null;
    if (s.viz && KIT.viz.has(s.viz)) {
      var stage = h('div', { class: 'viz-stage' });
      box.appendChild(stage);
      handle = KIT.viz.mount(s.viz, stage, { static: isStatic(), params: s.params || {} });
    } else if (s.fig && KIT.fig.has(s.fig)) {
      var fs = h('div', { class: 'viz-stage' });
      box.appendChild(fs);
      KIT.fig.render(s.fig, fs, s.figData || {});
    }
    if (s.analogy) box.appendChild(h('div', { class: 'analogy', 'data-linkable': '' }, frag(s.analogy)));
    (s.predict || []).forEach(function (p) { box.appendChild(predictBlock(p, handle)); });
    return box;
  };
  R.notes = function (s) {
    return h('section', { class: 'notes', id: 'sec-' + s.id },
      h('h2', null, s.title, refChip(s.ref), beyondBadge(s.beyond)),
      h('div', { class: 'prose', 'data-linkable': '' }, frag(s.html)));
  };
  /** A formula card: the color-coded equation, a legend in the same colors, when to use it and a slide example. */
  function formulaCard(f) {
    if (!f.tex) {
      return h('div', { class: 'formula-card' },
        h('div', { class: 'name' }, f.name, refChip(f.ref), beyondBadge(f.beyond)),
        h('div', { class: 'f' }, frag(f.html)),
        f.where ? h('div', { class: 'where' }, frag(f.where)) : null,
        f.note ? h('div', { class: 'note' }, frag(f.note)) : null);
    }
    var legend = (f.vars || []).length ? h('ul', { class: 'legend' }, f.vars.map(function (v) {
      var sym = v.role ? '$\\c{' + v.role + '}{' + v.tex + '}$' : '$' + v.tex + '$';
      return h('li', null, h('span', { class: 'sym' }, frag(sym)), h('span', { class: 'means' }, v.means, v.unit ? h('span', { class: 'unit' }, ' (' + v.unit + ')') : null));
    })) : null;
    return KIT.ui.anim.connect(h('div', { class: 'formula-card typeset' },
      h('div', { class: 'name' }, f.name, refChip(f.ref), beyondBadge(f.beyond)),
      h('div', { class: 'f' }, frag('$$' + f.tex + '$$')),
      legend,
      h('div', { class: 'use' }, h('b', null, 'Use it: '), frag(f.use)),
      h('div', { class: 'ex' }, h('b', null, 'Slide example: '), frag(f.example)),
      f.note ? h('div', { class: 'note' }, frag(f.note)) : null));
  }
  KIT.ui.formulaCard = formulaCard;
  R.formulas = function (s) {
    var grid = h('div', { class: 'formula-grid' });
    s.ids.forEach(function (id) { var f = KIT.getFormula(id); if (f) grid.appendChild(formulaCard(f)); });
    return h('section', { class: 'formulas', id: 'sec-formulas-' + String(s.ids[0]).split('.').join('-') }, s.title ? h('h3', null, s.title) : h('h3', null, 'Formulas'), grid);
  };
  R.example = function (s) {
    var box = h('section', { class: 'callout example' },
      h('div', { class: 'callout-label' }, '✎ Worked example'),
      h('h3', { style: { marginTop: '2px' } }, s.title, refChip(s.ref), beyondBadge(s.beyond)));
    if (!s.gen) { box.appendChild(h('div', { class: 'prose' }, frag(s.html))); return box; }
    var p;
    try { p = KIT.gen.build(s.gen, s.params); }
    catch (e) { KIT.report(e, 'example:' + s.gen); box.appendChild(h('div', { class: 'fb bad' }, 'Example failed to build: ' + e.message)); return box; }
    var key = KIT.ui.anim.colorKey(p.colors);
    if (key) box.appendChild(key);
    box.appendChild(h('div', { class: 'prompt' }, frag(p.prompt)));
    // The animation of the solution sits between the question and the steps; revealing step k moves it to that step's frame.
    var anim = KIT.ui.anim.forProblem(p);
    if (anim) box.appendChild(anim.el);
    KIT.ui.anim.connect(box);
    var sol = solutionBlock(p);
    if (s.slideAnswer) sol.appendChild(h('div', { class: 'slide-answer' }, 'Slide\'s answer: ', frag(s.slideAnswer)));
    if (isStatic()) { box.appendChild(sol); return box; }
    // Faded worked example: reveal one step at a time, then everything.
    var items = sol.querySelectorAll('ol.steps > li');
    var shown = 0;
    for (var i = 0; i < items.length; i++) items[i].hidden = true;
    var rest = [];
    for (var c = 1; c < sol.childNodes.length; c++) rest.push(sol.childNodes[c]);
    rest.forEach(function (n) { n.hidden = true; });
    var next = h('button', { class: 'btn', type: 'button' }, 'Reveal next step');
    var all = h('button', { class: 'btn ghost', type: 'button' }, 'Show full solution');
    function update() {
      for (var i = 0; i < items.length; i++) items[i].hidden = i >= shown;
      var done = shown >= items.length;
      rest.forEach(function (n) { n.hidden = !done; });
      next.hidden = done; all.hidden = done;
      if (anim) { if (done) anim.finish(); else if (shown > 0) anim.toStep(shown - 1); }
    }
    next.addEventListener('click', function () { shown++; update(); });
    all.addEventListener('click', function () { shown = items.length; update(); });
    box.appendChild(sol);
    box.appendChild(h('div', { class: 'btn-row no-print' }, next, all));
    return box;
  };
  R.practice = function (s) {
    var box = h('section', { class: 'practice' }, h('h2', null, 'Practice'));
    if (KIT.ui.practice && typeof KIT.ui.practice.embed === 'function' && !isStatic()) {
      box.appendChild(KIT.ui.practice.embed(s.gens));
      return box;
    }
    var ul = h('ul');
    s.gens.forEach(function (id) {
      var g = KIT.gen.get(id);
      if (!g) return;
      ul.appendChild(h('li', null, KIT.pages.has('practice') ? h('a', { href: '#/practice?gen=' + encodeURIComponent(id) }, g.title) : g.title));
    });
    box.appendChild(ul);
    if (!KIT.pages.has('practice')) box.appendChild(h('p', { class: 'muted small' }, 'Interactive practice with fresh numbers arrives in Phase 2. For now, redo the worked examples above without looking.'));
    return box;
  };
  R.quick = function (s, t) {
    var box = h('section', { class: 'quick' }, h('h2', null, 'Quick check'));
    var items = KIT.bank.query({ topic: t.id, pool: 'none' }).filter(function (q) { return q.type !== 'essay'; }).slice(0, s.n);
    if (KIT.ui.quiz && typeof KIT.ui.quiz.renderSet === 'function') {
      box.appendChild(KIT.ui.quiz.renderSet(items, { static: isStatic(), source: 'quick:' + t.id }));
      // Essay practice: general-pool essays only (the mock exams keep their own), answered by drawing and/or explaining.
      var essays = KIT.bank.query({ topic: t.id, pool: 'none' }).filter(function (q) { return q.type === 'essay'; });
      if (!essays.length) return box;
      var es = h('section', { class: 'essay-practice' }, h('h2', null, 'Essay practice — draw and/or explain'),
        isStatic() ? null : h('p', { class: 'muted small' }, 'Answer with a drawing, an explanation or both, then reveal the rubric and the model answer to self-grade. These essays never appear on the mock exams.'),
        KIT.ui.quiz.renderSet(essays, { static: isStatic(), source: 'essay:' + t.id }));
      return h('div', null, box, es);
    }
    var ol = h('ol');
    items.forEach(function (q) {
      ol.appendChild(h('li', null, frag(q.q), q.choices ? h('ol', { type: 'A' }, q.choices.map(function (c) { return h('li', null, frag(c)); })) : null));
    });
    box.appendChild(ol);
    return box;
  };
  R.traps = function (s) {
    return h('section', { class: 'callout trap' }, h('div', { class: 'callout-label' }, '⚠ Common traps'),
      h('ul', { 'data-linkable': '' }, s.items.map(function (it) {
        return h('li', null, h('b', null, frag(it.trap)), ' → ', frag(it.fix), it.ref ? refChip(it.ref) : null);
      })));
  };
  R.mnemonics = function (s) {
    return h('section', { class: 'callout key' }, h('div', { class: 'callout-label' }, '🧠 Mnemonics & memory hooks'),
      h('ul', { 'data-linkable': '' }, s.items.map(function (m) { return h('li', null, frag(m)); })));
  };
  R.recall = function (s) {
    return h('section', { class: 'recall' }, h('h2', null, 'Blank-page recall'),
      h('p', { class: 'muted small' }, 'Close the notes. Answer each prompt from memory on paper, then check against the sections above.'),
      h('ol', { class: 'recall-list' }, s.prompts.map(function (p) { return h('li', null, frag(p)); })));
  };
  KIT.ui.renderSection = function (s, t) { var f = R[s.kind]; return f ? f(s, t) : null; };

  function slideErrorsBlock(t) {
    if (!t.slideErrors || !t.slideErrors.length) return null;
    var tbl = h('table', { class: 'tbl compact' },
      h('thead', null, h('tr', null, h('th', null, 'Slide'), h('th', null, 'Slide says'), h('th', null, 'Correct / intended'))),
      h('tbody', null, t.slideErrors.map(function (e) {
        return h('tr', null, h('td', { class: 'mono' }, e.ref), h('td', null, frag(e.says)), h('td', null, frag(e.correct)));
      })));
    return h('section', { class: 'callout slide-error', id: 'sec-slide-errors' },
      h('div', { class: 'callout-label' }, '⚠ Slide errors & contradictions'),
      h('p', { class: 'small' }, 'On the exam, the answer that follows the slide\'s intent is the safe one — but know the correct version.'),
      h('div', { class: 'table-wrap' }, tbl));
  }

  function glossaryBlock(t) {
    if (!t.glossary || !t.glossary.length) return null;
    var dl = h('dl', { class: 'glossary' });
    t.glossary.forEach(function (g) {
      dl.appendChild(h('dt', null, g.term));
      dl.appendChild(h('dd', null, frag(g.def), g.ref ? refChip(g.ref) : null));
    });
    return h('section', { class: 'glossary-sec', id: 'sec-glossary' }, h('h2', null, 'Glossary'), dl);
  }

  function header(t, extra) {
    extra = extra || {};
    var meta = KIT.META[t.id];
    var range = meta.range ? ' · slides ' + meta.range[0] + '–' + meta.range[1] : ' · ' + meta.pages + ' slides';
    var progress = KIT.store.get('progress.topics', {});
    var read = !!(progress[t.id] && progress[t.id].read);
    var readBtn = h('button', { class: 'btn', type: 'button' }, read ? '✓ Marked as read' : 'Mark as read');
    readBtn.addEventListener('click', function () {
      var pr = KIT.store.get('progress.topics', {});
      pr[t.id] = pr[t.id] || {};
      pr[t.id].read = !pr[t.id].read;
      KIT.store.set('progress.topics', pr);
      readBtn.textContent = pr[t.id].read ? '✓ Marked as read' : 'Mark as read';
    });
    var toc = h('ul', { class: 'toc no-print' });
    function tocLink(target, label) { return h('li', null, h('a', { href: '#/topic/' + t.id + '?keepScroll=1', 'data-target': target, onclick: jump }, label)); }
    if (extra.toc) extra.toc.forEach(function (x) { toc.appendChild(tocLink(x[0], x[1])); });
    else t.sections.forEach(function (s) { if (s.kind === 'notes') toc.appendChild(tocLink('sec-' + s.id, s.title)); });
    if (t.slideErrors && t.slideErrors.length) toc.appendChild(tocLink('sec-slide-errors', '⚠ Slide errors'));
    return h('header', { class: 'topic-head' },
      h('div', { class: 'deck-line' }, ('Lecture ' + meta.deck.slice(1) + (t.id === 'l03a' ? ' · part 1' : t.id === 'l03b' ? ' · part 2' : '')) + range),
      h('h1', null, t.title),
      h('p', { class: 'blurb' }, t.blurb),
      (t.highYield && t.highYield.length) ? h('p', null, t.highYield.map(function (x) { return h('span', { class: 'badge hy', style: { marginRight: '6px' } }, '★ ' + x); })) : null,
      h('div', { class: 'topic-actions no-print' }, h('a', { class: 'btn', href: meta.file, target: '_blank' }, '📄 Open the slides'), readBtn, extra.switchEl || null),
      toc);
  }
  function jump(ev) {
    ev.preventDefault();
    var id = ev.currentTarget.getAttribute('data-target');
    var el = document.getElementById(id);
    if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function glanceAsk(t) {
    return h('div', { class: 'grid2', style: { margin: '16px 0' } },
      h('div', { class: 'card glance' }, h('div', { class: 'callout-label' }, 'At a glance'),
        h('ul', null, t.glance.map(function (g) { return h('li', null, frag(g)); }))),
      h('div', { class: 'card ask' }, h('div', { class: 'callout-label' }, 'What they\'ll ask'),
        h('ul', null, t.ask.map(function (a) { return h('li', null, frag(a)); }))));
  }

  /* ---------- slide-by-slide view (content/walk/*.js, AUTHORING §3.7) ---------- */
  var VIEW_KEY = 'ui.topicView';
  function spanOf(n) { return Array.isArray(n) ? n : [n, n]; }
  function slideLabel(s) { return s[0] === s[1] ? 'Slide ' + s[0] : 'Slides ' + s[0] + '–' + s[1]; }
  function slideRef(t, s) { var d = KIT.META[t.id].deck; return s[0] === s[1] ? d + ' p' + s[0] : d + ' pp' + s[0] + '-' + s[1]; }
  function block(cls, label, html) {
    return h('div', { class: 'blk ' + cls },
      h('div', { class: 'blk-label' }, label),
      h('div', { class: 'prose', 'data-linkable': '' }, frag(html)));
  }
  function slideCard(t, it) {
    var s = spanOf(it.n), attrs = { id: 'slide-' + s[0], 'data-slides': s[0] + '-' + s[1] };
    if (it.kind === 'admin') {
      attrs.class = 'slide-card admin';
      return h('div', attrs, h('span', { class: 'slide-no' }, slideLabel(s)), h('b', null, it.title), h('span', { class: 'admin-says' }, frag(it.says)));
    }
    attrs.class = 'slide-card';
    var card = h('article', attrs,
      h('header', { class: 'slide-head' }, h('span', { class: 'slide-no' }, slideLabel(s)), h('h3', null, it.title),
        refChip(slideRef(t, s) + (it.ref ? '; ' + it.ref : ''))),
      block('says', 'The slide says', it.says),
      block('means', 'What it means', it.means),
      block('why', 'Why it matters', it.why));
    if (it.tip) card.appendChild(h('div', { class: 'callout key' }, h('div', { class: 'callout-label' }, '💡 Tip'), h('div', { 'data-linkable': '' }, frag(it.tip))));
    if (it.error) {
      card.appendChild(h('div', { class: 'callout slide-error' }, h('div', { class: 'callout-label' }, '⚠ Slide error'),
        h('div', { class: 'says-correct' }, h('b', null, 'Slide says'), h('span', null, frag(it.error.says)), h('b', null, 'Correct'), h('span', null, frag(it.error.correct)))));
    }
    if (it.beyond) card.appendChild(h('div', { class: 'callout beyond' }, h('div', { class: 'callout-label' }, 'Beyond the slides ', beyondBadge(true)), h('div', { 'data-linkable': '' }, frag(it.beyond))));
    if (it.example) card.appendChild(R.example(Object.assign({ kind: 'example', ref: slideRef(t, s) }, it.example)));
    return card;
  }
  function gapCard(t, a, b, onView) {
    var btn = onView ? h('button', { class: 'btn small', type: 'button' }, 'Show the summary notes') : null;
    if (btn) btn.addEventListener('click', function () { onView('summary'); });
    return h('div', { class: 'slide-card gap', id: 'slide-' + a, 'data-slides': a + '-' + b },
      h('span', { class: 'slide-no' }, slideLabel([a, b])),
      h('p', null, 'The slide-by-slide walkthrough of these slides is still being written. The summary notes cover them now.'), btn);
  }
  /** The deck's slides in order: walkthrough parts, with a placeholder for any slides no walk file covers yet. */
  function renderSlides(t, opts) {
    var out = { nodes: [], toc: [] }, r = KIT.topicRange(t.id), at = r[0];
    function gap(a, b) { out.nodes.push(gapCard(t, a, b, opts.onView)); out.toc.push(['slide-' + a, slideLabel([a, b]) + ' — being written']); }
    KIT.walks(t.id).forEach(function (w) {
      if (w.range[0] > at) gap(at, w.range[0] - 1);
      w.parts.forEach(function (p, i) {
        var pid = 'part-' + w.id + '-' + (i + 1);
        var sec = h('section', { class: 'walk-part', id: pid },
          h('h2', { class: 'part-title' }, p.title, h('span', { class: 'part-range' }, slideLabel(p.slides))));
        p.items.forEach(function (it) { sec.appendChild(slideCard(t, it)); });
        sec.appendChild(h('div', { class: 'callout together' }, h('div', { class: 'callout-label' }, '★ Putting it together'),
          h('div', { class: 'prose', 'data-linkable': '' }, frag(p.together))));
        out.nodes.push(sec);
        out.toc.push([pid, p.title + ' (' + slideLabel(p.slides).toLowerCase() + ')']);
      });
      // A file written only part of the way: the rest of its slides show as "being written".
      var last = w.parts.length ? w.parts[w.parts.length - 1].slides[1] : w.range[0] - 1;
      if (last < w.range[1]) gap(last + 1, w.range[1]);
      at = w.range[1] + 1;
    });
    if (at <= r[1]) gap(at, r[1]);
    var faq = [];
    KIT.walks(t.id).forEach(function (w) { faq = faq.concat(w.faq); });
    if (faq.length) {
      out.nodes.push(h('section', { class: 'faq', id: 'sec-faq' }, h('h2', null, 'FAQ — questions worth being able to answer'),
        faq.map(function (f) {
          return h('details', { class: 'faq-item' }, h('summary', null, frag(f.q)), h('div', { class: 'prose', 'data-linkable': '' }, frag(f.a), refChip(f.ref)));
        })));
      out.toc.push(['sec-faq', 'FAQ']);
    }
    return out;
  }
  function viewSwitch(view, onView) {
    var box = h('div', { class: 'view-switch', role: 'group', 'aria-label': 'How to read this lecture' });
    [['slides', 'Slide by slide'], ['summary', 'Summary']].forEach(function (v) {
      var b = h('button', { type: 'button', 'aria-pressed': String(v[0] === view) }, v[1]);
      b.addEventListener('click', function () { if (v[0] !== view) onView(v[0]); });
      box.appendChild(b);
    });
    return box;
  }

  /** Full topic body (no page chrome) — reused by the printable reviewer.
      opts.view: 'summary' (default; the printed reviewer) or 'slides' (the walkthrough); opts.onView(view) adds the view switch. */
  KIT.ui.renderTopic = function (t, opts) {
    opts = opts || {};
    var view = opts.view === 'slides' ? 'slides' : 'summary';
    var wrap = h('article', { class: 'topic view-' + view, id: 'topic-' + t.id });
    var switchEl = opts.onView ? viewSwitch(view, opts.onView) : null;
    if (view === 'slides') {
      var sl = renderSlides(t, opts);
      wrap.appendChild(header(t, { switchEl: switchEl, toc: sl.toc }));
      wrap.appendChild(glanceAsk(t));
      // Intuition first (analogy, predict, visual), then every slide; practice and review after the last slide.
      t.sections.forEach(function (s) { if (s.kind === 'intuition') wrap.appendChild(KIT.ui.renderSection(s, t)); });
      sl.nodes.forEach(function (n) { wrap.appendChild(n); });
      var review = t.sections.filter(function (s) { return ['formulas', 'practice', 'quick', 'traps', 'mnemonics', 'recall'].indexOf(s.kind) >= 0; });
      if (review.length) {
        wrap.appendChild(h('h2', { class: 'review-head', id: 'sec-review' }, 'Practice & review'));
        review.forEach(function (s) { var node = KIT.ui.renderSection(s, t); if (node) wrap.appendChild(node); });
      }
    } else {
      wrap.appendChild(header(t, { switchEl: switchEl }));
      wrap.appendChild(glanceAsk(t));
      t.sections.forEach(function (s) {
        if (opts.skipKinds && opts.skipKinds.indexOf(s.kind) >= 0) return;
        var node = KIT.ui.renderSection(s, t);
        if (node) wrap.appendChild(node);
      });
    }
    var se = slideErrorsBlock(t); if (se) wrap.appendChild(se);
    var gl = glossaryBlock(t); if (gl) wrap.appendChild(gl);
    KIT.fig.hydrate(wrap);
    return wrap;
  };

  KIT.page('topic', function (main, route) {
    var id = route.path[1];
    var t = KIT.getTopic(id);
    var meta = KIT.META[id];
    if (!meta) { main.appendChild(h('h1', null, 'Unknown topic')); main.appendChild(h('a', { href: '#/home' }, '← Home')); return; }
    if (!t) {
      main.appendChild(h('div', { class: 'topic-head' }, h('div', { class: 'deck-line' }, KIT.ui.deckLabel(id)), h('h1', null, meta.title)));
      main.appendChild(h('div', { class: 'callout' }, h('div', { class: 'callout-label' }, 'Being written'),
        'This topic\'s reviewer is still being written. Meanwhile, open the slides: ', h('a', { href: meta.file, target: '_blank' }, meta.file.split('/').pop())));
      return;
    }
    // View: ?view= wins, then the last choice (remembered), then the slide-by-slide walkthrough.
    var holder = h('div');
    main.appendChild(holder);
    var q = route.query || {};
    // Terms & FAQ panel in the shell's right-hand slot (absent when the page is rendered without the shell).
    var aside = main.parentNode && main.parentNode.querySelector ? main.parentNode.querySelector('.kit-aside') : null;
    var panel = aside && KIT.ui.terms ? KIT.ui.terms.panel(aside, t, q) : null;
    function draw(view) {
      KIT.viz.destroyAll();
      KIT.clear(holder);
      holder.appendChild(KIT.ui.renderTopic(t, { view: view, onView: function (v) { KIT.store.set(VIEW_KEY, v); draw(v); } }));
      if (panel) panel.link(holder);
    }
    draw(q.view === 'summary' || q.view === 'slides' ? q.view : KIT.store.get(VIEW_KEY, 'slides'));
    // #/topic/l03a?slide=23 → the card that holds slide 23; ?at=sec-faq → any section by id (after the router's scroll-to-top).
    if (q.slide || q.at) {
      setTimeout(function () {
        var target = q.at ? document.getElementById(q.at) : null, n = +q.slide, cards = holder.querySelectorAll('[data-slides]');
        for (var c = 0; !target && c < cards.length; c++) {
          var ab = cards[c].getAttribute('data-slides').split('-').map(Number);
          if (n >= ab[0] && n <= ab[1]) target = cards[c];
        }
        if (target && target.scrollIntoView) target.scrollIntoView({ block: 'start' });
      }, 0);
    }
    var i = KIT.TOPIC_IDS.indexOf(id);
    var prev = KIT.TOPIC_IDS[i - 1], next = KIT.TOPIC_IDS[i + 1];
    main.appendChild(h('nav', { class: 'pager no-print' },
      prev ? h('a', { class: 'btn', href: '#/topic/' + prev }, '← ' + KIT.ui.deckLabel(prev)) : h('span'),
      next ? h('a', { class: 'btn', href: '#/topic/' + next }, KIT.ui.deckLabel(next) + ' →') : h('span')));
  });
})();
