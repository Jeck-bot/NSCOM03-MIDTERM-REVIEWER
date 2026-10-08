/* Practice hub (#/practice) and embeddable problem cards. Owner: Lead (Phase 2).
   #/practice?gen=l04.band&seed=12 · ?topic=l02 · ?mode=mixed · ?mode=mistakes */
(function () {
  'use strict';
  var h = KIT.h;

  function newSeed() { return 1 + Math.floor((Date.now() % 1e9) / 7) % 99991; }
  function stats() { return KIT.store.get('practice.stats', {}); }
  function record(genId, seed, ok, firstTry) {
    var s = stats();
    s[genId] = s[genId] || { tried: 0, right: 0 };
    s[genId].tried++; if (ok) s[genId].right++;
    KIT.store.set('practice.stats', s);
    var m = KIT.store.get('practice.mistakes', []);
    var key = genId + '#' + seed;
    var idx = m.map(function (x) { return x.gen + '#' + x.seed; }).indexOf(key);
    if (!ok && firstTry && idx < 0) { m.unshift({ gen: genId, seed: seed }); if (m.length > 60) m.length = 60; }
    if (ok && idx >= 0) m.splice(idx, 1);
    KIT.store.set('practice.mistakes', m);
  }

  /** Render one input; returns {el, get(), mark(res), reveal(), showModel(), lock(on)}. wopts.onSelf(ok): a drawing was self-marked. */
  function inputWidget(inp, wopts) {
    wopts = wopts || {};
    var fb = h('div', { class: 'in-fb small' });
    var label = inp.label ? h('span', { class: 'in-label' }, inp.label) : null;
    var unitHint = inp.unit ? h('span', { class: 'unit-hint' }, inp.unit === 'sps' ? 'samples/s' : inp.unit) : null;
    var get, box, field;
    switch (inp.kind) {
      case 'num': case 'bits': case 'text': case 'vector':
        field = h('input', { class: 'inp' + (inp.kind === 'bits' || inp.kind === 'vector' ? ' mono' : ''), maxlength: '80', autocomplete: 'off', spellcheck: 'false',
          placeholder: inp.kind === 'num' ? (inp.unit ? 'e.g. ' + KIT.grade.example(inp.unit) : 'number') : inp.kind === 'bits' ? '0 and 1' : inp.kind === 'vector' ? 'e.g. −1 −1 −3 +1' : 'answer' });
        get = function () { return field.value; };
        box = h('label', { class: 'in-row' }, label, field, unitHint);
        break;
      case 'choice': {
        var multi = Array.isArray(inp.answer), chosen = multi ? [] : null, btns = [];
        var row = h('div', { class: 'choices' });
        inp.choices.forEach(function (c, i) {
          var b = h('button', { class: 'btn choice', type: 'button' }, KIT.html(String(c)));
          b.addEventListener('click', function () {
            if (multi) { var k = chosen.indexOf(i); if (k >= 0) chosen.splice(k, 1); else chosen.push(i); }
            else chosen = i;
            btns.forEach(function (x, j) { x.classList.toggle('picked', multi ? chosen.indexOf(j) >= 0 : chosen === j); });
          });
          btns.push(b); row.appendChild(b);
        });
        get = function () { return multi ? chosen.slice() : chosen; };
        box = h('div', { class: 'in-row col' }, label, row);
        break;
      }
      case 'tf': {
        var val = null, bt = h('button', { class: 'btn choice', type: 'button' }, 'True'), bf = h('button', { class: 'btn choice', type: 'button' }, 'False');
        bt.addEventListener('click', function () { val = true; bt.classList.add('picked'); bf.classList.remove('picked'); });
        bf.addEventListener('click', function () { val = false; bf.classList.add('picked'); bt.classList.remove('picked'); });
        get = function () { return val; };
        box = h('div', { class: 'in-row' }, label, bt, bf);
        break;
      }
      case 'sketch': {
        var pad = KIT.ui.sketch.create({ axes: inp.axes, height: inp.height, label: inp.label });
        var selfOk = null;
        pad.onChange = function () { if (selfOk !== null) { selfOk = null; pad.hideModel(); } };   // redrawn: check again
        get = function () { return { strokes: pad.value(), self: selfOk }; };
        box = h('div', { class: 'in-row col' }, label, pad.el);
        box._sketch = { pad: pad, set: function (v) { selfOk = v; } };
        break;
      }
      case 'grid': {
        var g = KIT.ui.grid.create(inp.grid);
        get = function () { return g.value(); };
        box = h('div', { class: 'in-row col' }, label, g.el);
        box._grid = g;
        break;
      }
      default:
        get = function () { return null; };
        box = h('div', null, 'Unsupported input');
    }
    var el = h('div', { class: 'in-wrap' }, box, fb);
    function rubricList() { return h('ul', { class: 'small sketch-rubric' }, (inp.rubric || []).map(function (r) { return h('li', null, r.point); })); }
    function selfCheck(res) {        // the model is on the pad; the student decides
      var sk = box._sketch;
      sk.pad.showModel(inp.model);
      fb.className = 'in-fb small';
      fb.appendChild(h('div', null, res.msg));
      fb.appendChild(rubricList());
      var yes = h('button', { class: 'btn small', type: 'button' }, '✓ Mine matches'), no = h('button', { class: 'btn small', type: 'button' }, '✗ Not yet');
      function pick(ok) {
        sk.set(ok);
        yes.disabled = no.disabled = true;
        fb.className = 'in-fb small ' + (ok ? 'ok' : 'bad');
        fb.appendChild(h('div', null, ok ? '✓ Self-checked: matches the model.' : '✗ Noted — redraw it (Clear), then check again.'));
        if (wopts.onSelf) wopts.onSelf(ok);
      }
      yes.addEventListener('click', function () { pick(true); });
      no.addEventListener('click', function () { pick(false); });
      fb.appendChild(h('div', { class: 'sketch-check' }, yes, no));
    }
    return {
      el: el, get: get,
      showModel: function () { if (box._sketch) box._sketch.pad.showModel(inp.model); },
      lock: function (on) { if (box._sketch) box._sketch.pad.lock(on); },
      mark: function (res) {
        KIT.clear(fb);
        if (box._sketch && res.self) {
          if (res.pending) { box._sketch.set(null); selfCheck(res); return; }
          box._sketch.pad.showModel(inp.model);
        }
        fb.className = 'in-fb small ' + (res.ok ? 'ok' : 'bad');
        fb.appendChild(document.createTextNode((res.ok ? '✓ ' : '✗ ') + res.msg));
        if (box._grid) box._grid.mark(res);
      },
      reveal: function () {
        KIT.clear(fb);
        if (box._sketch) { box._sketch.pad.showModel(inp.model); fb.className = 'in-fb small'; fb.appendChild(h('div', null, 'The model drawing is overlaid in orange.')); fb.appendChild(rubricList()); return; }
        fb.className = 'in-fb small';
        fb.appendChild(document.createTextNode('Answer: '));
        fb.appendChild(KIT.ui.answerNode(inp));
      }
    };
  }

  /** A full problem card for generator genId at seed. opts: {onNext(seed), compact} */
  function card(genId, seed, opts) {
    opts = opts || {};
    var g = KIT.gen.get(genId);
    var box = h('div', { class: 'card problem-card' });
    if (!g) { box.appendChild(h('p', null, 'Unknown problem type.')); return box; }
    var p;
    try { p = KIT.gen.random(genId, seed); }
    catch (e) { KIT.report(e, 'practice:' + genId); box.appendChild(h('p', { class: 'fb bad' }, 'Could not build this problem: ' + e.message)); return box; }
    box.appendChild(h('div', { class: 'pc-head' },
      h('span', { class: 'chip' }, KIT.ui.deckLabel ? KIT.ui.deckLabel(g.topic) : g.topic), ' ',
      h('b', null, g.title), ' ', g.ref ? h('span', { class: 'chip ref' }, g.ref) : null,
      h('span', { class: 'muted small seed' }, ' · problem #' + seed)));
    box.appendChild(h('div', { class: 'prompt' }, KIT.html(p.prompt)));
    var widgets = p.inputs.map(function (inp) { return inputWidget(inp, { onSelf: function () { evaluate(false); } }); });
    widgets.forEach(function (w) { box.appendChild(w.el); });
    var hintBox = h('ol', { class: 'hints small' });
    var sol = KIT.ui.solutionBlock(p);
    var stepsEls = sol.querySelectorAll('ol.steps > li');
    var shown = 0, attempts = 0;
    function hideSolution() {
      for (var i = 0; i < stepsEls.length; i++) stepsEls[i].hidden = true;
      for (var c = 1; c < sol.childNodes.length; c++) sol.childNodes[c].hidden = true;
    }
    hideSolution();
    function showSteps(k) {
      shown = Math.min(k, stepsEls.length);
      for (var i = 0; i < stepsEls.length; i++) stepsEls[i].hidden = i >= shown;
      var done = shown >= stepsEls.length;
      for (var c = 1; c < sol.childNodes.length; c++) sol.childNodes[c].hidden = !done;
    }
    var check = h('button', { class: 'btn primary', type: 'button' }, 'Check');
    var hint = h('button', { class: 'btn', type: 'button' }, 'Hint');
    var stepBtn = h('button', { class: 'btn', type: 'button' }, 'Next step');
    var solBtn = h('button', { class: 'btn ghost', type: 'button' }, 'Show solution');
    var next = h('button', { class: 'btn', type: 'button' }, 'New problem →');
    var verdict = h('div', { class: 'verdict' });
    var hintsUsed = 0;
    // markAll: mark every input (the Check button); otherwise a drawing was just self-marked — re-score without resetting it.
    function evaluate(markAll) {
      var allOk = true, pending = false;
      p.inputs.forEach(function (inp, i) {
        var res = KIT.grade.check(inp, widgets[i].get());
        if (markAll || inp.kind !== 'sketch') widgets[i].mark(res);
        if (res.pending) pending = true;
        else if (!res.ok) allOk = false;
      });
      KIT.clear(verdict);
      if (pending) {
        verdict.className = 'verdict';
        verdict.appendChild(document.createTextNode('Compare your drawing with the orange model wave, then mark it.'));
        return;
      }
      verdict.className = 'verdict ' + (allOk ? 'ok' : 'bad');
      verdict.appendChild(document.createTextNode(allOk ? '✓ All correct' + (hintsUsed || shown ? ' (with help — try a fresh one)' : '') + '.' :
        '✗ Not yet — fix the marked answers, take a hint, or reveal a step.'));
      record(genId, seed, allOk, attempts === 1);
    }
    check.addEventListener('click', function () { attempts++; evaluate(true); });
    hint.addEventListener('click', function () {
      var hs = p.hints || [];
      if (hintsUsed < hs.length) { hintBox.appendChild(h('li', null, KIT.html(hs[hintsUsed]))); hintsUsed++; }
      else if (shown < stepsEls.length) showSteps(shown + 1);
      if (hintsUsed >= hs.length) hint.textContent = 'Hint (next step)';
    });
    stepBtn.addEventListener('click', function () { showSteps(shown + 1); });
    solBtn.addEventListener('click', function () { showSteps(stepsEls.length); widgets.forEach(function (w) { w.reveal(); }); });
    next.addEventListener('click', function () { if (opts.onNext) opts.onNext(seed + 1); });
    box.appendChild(h('div', { class: 'btn-row' }, check, hint, stepBtn, solBtn, next));
    box.appendChild(verdict);
    box.appendChild(hintBox);
    box.appendChild(sol);
    return box;
  }

  /** Embedded practice for a topic page: pick a problem type, get a fresh problem. */
  function embed(gens) {
    var wrap = h('div', { class: 'practice-embed' });
    var list = gens.filter(function (id) { var g = KIT.gen.get(id); return g && typeof g.params === 'function'; });
    if (!list.length) { wrap.appendChild(h('p', { class: 'muted' }, 'No practice generators yet.')); return wrap; }
    var cur = list[0], seed = newSeed();
    var sel = h('select', { class: 'inp', 'aria-label': 'Problem type' }, list.map(function (id) { return h('option', { value: id }, KIT.gen.get(id).title); }));
    var slot = h('div');
    function render() { KIT.clear(slot); slot.appendChild(card(cur, seed, { onNext: function (s) { seed = s; render(); } })); }
    sel.addEventListener('change', function () { cur = sel.value; seed = newSeed(); render(); });
    wrap.appendChild(h('div', { class: 'btn-row' }, h('label', null, 'Problem type ', sel),
      KIT.pages.has('practice') ? h('a', { class: 'btn ghost', href: '#/practice?topic=' + encodeURIComponent(KIT.gen.get(cur).topic) }, 'Open the practice hub →') : null));
    wrap.appendChild(slot);
    render();
    return wrap;
  }

  KIT.ui.practice = { card: card, embed: embed, inputWidget: inputWidget };

  KIT.page('practice', function (main, route) {
    var q = route.query || {};
    var all = KIT.gen.all().filter(function (g) { return typeof g.params === 'function'; });
    main.appendChild(h('h1', null, 'Practice'));
    main.appendChild(h('p', { class: 'muted' }, 'Fresh numbers every time, with hints, a step-by-step solution, and a mistakes queue. ' +
      'Try it first; reveal one step only when stuck.'));
    var mode = q.mode || (q.gen ? 'single' : 'mixed');
    var topic = q.topic || 'all';
    var st = stats();
    var mistakes = KIT.store.get('practice.mistakes', []);

    // filter row
    var topicSel = h('select', { class: 'inp', 'aria-label': 'Topic' }, [h('option', { value: 'all' }, 'All topics')].concat(
      KIT.TOPIC_IDS.filter(function (t) { return all.some(function (g) { return g.topic === t; }); }).map(function (t) {
        return h('option', { value: t, selected: t === topic }, KIT.ui.deckLabel(t));
      })));
    topicSel.addEventListener('change', function () { location.hash = '#/practice?topic=' + topicSel.value + '&mode=' + (mode === 'mistakes' ? 'mixed' : mode); });
    var modeRow = h('div', { class: 'btn-row' },
      h('label', null, 'Topic ', topicSel),
      h('a', { class: 'btn' + (mode === 'mixed' ? ' primary' : ''), href: '#/practice?mode=mixed&topic=' + topic }, '🔀 Mixed (interleaved)'),
      h('a', { class: 'btn' + (mode === 'mistakes' ? ' primary' : ''), href: '#/practice?mode=mistakes' }, '↺ My mistakes (' + mistakes.length + ')'));
    main.appendChild(modeRow);

    var pool = all.filter(function (g) { return topic === 'all' || g.topic === topic; });
    var chips = h('div', { class: 'gen-chips' });
    pool.forEach(function (g) {
      var s = st[g.id];
      chips.appendChild(h('a', { class: 'chip gen-chip' + (q.gen === g.id ? ' active' : ''), href: '#/practice?gen=' + encodeURIComponent(g.id) + '&topic=' + topic },
        g.title, s ? h('span', { class: 'muted' }, ' · ' + s.right + '/' + s.tried) : null));
    });
    main.appendChild(chips);

    var slot = h('div', { class: 'practice-slot' });
    main.appendChild(slot);
    var seed = q.seed ? Number(q.seed) : newSeed();
    var rng = KIT.rng(seed);
    function show(genId, s) {
      KIT.clear(slot);
      slot.appendChild(card(genId, s, { onNext: function (ns) { pickNext(ns); } }));
    }
    function pickNext(ns) {
      if (mode === 'single' && q.gen) return show(q.gen, ns);
      if (mode === 'mistakes') {
        var m = KIT.store.get('practice.mistakes', []);
        if (!m.length) { KIT.clear(slot); slot.appendChild(h('div', { class: 'callout good' }, h('div', { class: 'callout-label' }, '✓ Queue empty'), 'No saved mistakes — try mixed practice.')); return; }
        var it = m[ns % m.length];
        return show(it.gen, it.seed);
      }
      var g = pool.length ? pool[Math.floor(rng.next() * pool.length)] : null;
      if (!g) { KIT.clear(slot); slot.appendChild(h('p', null, 'No problems for this topic yet.')); return; }
      show(g.id, ns);
    }
    pickNext(seed);
  });
})();
