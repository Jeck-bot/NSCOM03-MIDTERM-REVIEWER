/* Browser self-test (#/selftest). Owner: Lead. Runs synchronously in static mode and writes
   <pre id="selftest">SELFTEST DONE pass=N fail=M …</pre>, which tools/selftest.sh greps for. */
(function () {
  'use strict';
  var h = KIT.h;

  KIT.page('selftest', function (main) {
    var results = [];
    function rec(ok, name, detail) { results.push({ ok: !!ok, name: name, detail: detail || '' }); }
    // Off-screen but laid out (display:none would give zero-size geometry).
    var box = h('div', { 'aria-hidden': 'true', style: { position: 'absolute', left: '-12000px', top: '0', width: '900px' } });
    document.body.appendChild(box);
    function errSince(n) { return KIT.errors.slice(n).map(function (e) { return e.where + ': ' + e.message; }).join(' | '); }

    rec(KIT.errors.length === 0, 'boot: no script or runtime errors', errSince(0));

    // 1. Routes render without throwing, without garbage text, without new errors.
    var routes = [['home'], ['cram'], ['lab'], ['cheatsheet'], ['diag'], ['practice'], ['flash'], ['exam']];
    KIT.TOPIC_IDS.forEach(function (id) { routes.push(['topic', id]); });
    KIT.viz.ids().forEach(function (id) { routes.push(['viz', id]); });
    routes.forEach(function (path) {
      var name = 'route #/' + path.join('/');
      if (!KIT.pages.has(path[0])) { rec(true, name + ' (not built yet)'); return; }
      var el = h('div'); box.appendChild(el);
      var n0 = KIT.errors.length;
      try {
        KIT.pages.get(path[0])(el, { path: path, query: { static: '1' } });
        var txt = el.textContent || '';
        var bad = KIT.schema.garbage(txt), rawTex = /\$|\\[A-Za-z]{2,}/.exec(txt);   // math that was not converted
        rec(!bad && !rawTex && KIT.errors.length === n0 && txt.trim().length > 0, name,
          bad ? 'page text contains undefined/NaN/[object/TODO' : rawTex ? 'raw TeX left in the page: ' + rawTex[0]
            : errSince(n0) || (txt.trim() ? '' : 'empty page'));
      } catch (e) { rec(false, name, e.message); }
      KIT.viz.destroyAll();
      box.removeChild(el);
    });

    // 2. Print documents carry their end-of-document sentinel.
    if (KIT.pages.has('print') && KIT.print && typeof KIT.print.docs === 'function') {
      KIT.print.docs().forEach(function (d) {
        var el = h('div'); box.appendChild(el);
        var n0 = KIT.errors.length;
        try {
          KIT.pages.get('print')(el, { path: d.route.split('/'), query: { static: '1' } });
          var txt = el.textContent || '';
          var hasSentinel = txt.indexOf('END OF DOCUMENT: ' + d.id) >= 0;
          rec(hasSentinel && !KIT.schema.garbage(txt) && KIT.errors.length === n0, 'print ' + d.id,
            !hasSentinel ? 'missing sentinel' : KIT.schema.garbage(txt) ? 'contains undefined/NaN/[object/TODO' : errSince(n0));
          // Nothing may be wider than the page: Chrome would shrink the whole PDF to fit (an unbreakable quick key once did).
          var docBox = el.querySelector('.doc');
          if (docBox) rec(docBox.scrollWidth <= docBox.clientWidth + 1, 'print ' + d.id + ': no content wider than the page',
            docBox.scrollWidth + 'px of content in a ' + docBox.clientWidth + 'px page');
          // Exam papers: each question body must get the text column, not a narrow grid track
          // (a missing no-lead class once set every problem one word per line).
          var qs = Array.prototype.slice.call(el.querySelectorAll('.ex-q'));
          if (qs.length) {
            var narrow = qs.filter(function (q) {
              var b = q.querySelector('.ex-body');
              return !b || b.getBoundingClientRect().width < 0.6 * q.getBoundingClientRect().width;
            });
            rec(!narrow.length, 'print ' + d.id + ': question bodies span the text column',
              narrow.length ? narrow.length + ' of ' + qs.length + ' narrow; first: ' + narrow[0].textContent.slice(0, 50) : '');
          }
          // Blank drawing grids: stacked grids share bit columns; Manchester-type grids get half-bit guides;
          // a stated prior level is drawn as a stub.
          var gens = Array.prototype.slice.call(el.querySelectorAll('.ex-gen, .kq-gen')).filter(function (g) { return g.querySelector('.ex-grid svg, .ans-grid svg'); });
          if (gens.length) {
            var gridIssues = [];
            gens.forEach(function (g) {
              var svgs = Array.prototype.slice.call(g.querySelectorAll('.ex-grid svg, .ans-grid svg'));
              var xs = svgs.map(function (sv) {
                var v = Array.prototype.filter.call(sv.querySelectorAll('line.grid'), function (ln) { return ln.getAttribute('x1') === ln.getAttribute('x2'); });
                return Math.min.apply(null, v.map(function (ln) { return ln.getBoundingClientRect().left; }));
              });
              if (Math.max.apply(null, xs) - Math.min.apply(null, xs) > 1) gridIssues.push(g.querySelector('.ex-n, .q-num').textContent + ' columns misaligned (' + xs.map(Math.round).join(', ') + ')');
              svgs.forEach(function (sv) {
                if (sv.getAttribute('data-cpb') === '2' && !sv.querySelector('line.sub')) gridIssues.push(g.querySelector('.ex-n, .q-num').textContent + ' no half-bit guides');
                if (sv.hasAttribute('data-init') && !sv.querySelector('.stub-cue')) gridIssues.push(g.querySelector('.ex-n, .q-num').textContent + ' prior level not shown');
              });
            });
            rec(!gridIssues.length, 'print ' + d.id + ': drawing grids aligned with guides', gridIssues.join('; '));
          }
        } catch (e) { rec(false, 'print ' + d.id, e.message); }
        box.removeChild(el);
      });
    }

    // 3. Every visual mounts in static mode, draws something visible, and destroys cleanly.
    KIT.viz.all().forEach(function (v) {
      var el = h('div', { style: { width: '900px' } }); box.appendChild(el);
      try {
        var hnd = KIT.viz.mount(v.id, el, { static: true, width: 900 }) || {};
        var g = el.querySelector('svg, canvas');
        var w = g ? g.getBoundingClientRect().width : 0;
        rec(w > 0, 'viz ' + v.id, w > 0 ? '' : 'no visible <svg>/<canvas>');
        if (typeof hnd.destroy === 'function') hnd.destroy();
      } catch (e) { rec(false, 'viz ' + v.id, e.message); }
      box.removeChild(el);
    });

    // 4. Problems: generators (5 seeds + samples), worked examples, exam slots.
    function checkProblem(name, build) {
      try {
        var p = build();
        var v = KIT.schema.problem(p, name);
        if (v.length) { rec(false, name, v.slice(0, 3).join(' | ')); return; }
        for (var i = 0; i < p.inputs.length; i++) {
          var inp = p.inputs[i];
          if (!KIT.grade.check(inp, KIT.grade.answerOf(inp)).ok) { rec(false, name, 'input ' + i + ' rejects its own answer'); return; }
          if (inp.kind === 'grid' && inp.grid.answer.length > 1) {
            var a = inp.grid.answer.slice(), j = 1, lv = inp.grid.levels;
            var alt = lv.filter(function (x) { return x !== a[j] && x !== -a[j]; })[0];
            if (alt === undefined) alt = lv.filter(function (x) { return x !== a[j]; })[0];
            a[j] = alt;
            var r = KIT.grade.check(inp, a);
            if (r.ok && !r.inverted) { rec(false, name, 'grid accepted a flipped cell'); return; }
            if (!r.ok && r.firstWrongCell !== j) { rec(false, name, 'grid reported cell ' + r.firstWrongCell + ', expected ' + j); return; }
          }
        }
        if (p.key) {
          var k = p.key({ static: true });
          if (!(k && k.nodeType === 1)) { rec(false, name, 'key() must return an Element'); return; }
        }
        var el = h('div'); box.appendChild(el);
        el.appendChild(KIT.ui.solutionBlock ? KIT.ui.solutionBlock(p) : h('div'));
        if (KIT.schema.garbage(el.textContent)) { rec(false, name, 'rendered solution contains undefined/NaN'); box.removeChild(el); return; }
        box.removeChild(el);
        rec(true, name);
      } catch (e) { rec(false, name, e.message); }
    }
    KIT.gen.all().forEach(function (g) {
      if (typeof g.params === 'function') for (var s = 1; s <= 5; s++) (function (seed) { checkProblem('gen ' + g.id + ' seed ' + seed, function () { return KIT.gen.random(g.id, seed); }); })(s);
      (g.samples || []).forEach(function (p, i) { checkProblem('gen ' + g.id + ' sample ' + i, function () { return KIT.gen.build(g.id, p); }); });
    });
    KIT.topics().forEach(function (t) {
      (t.sections || []).forEach(function (s, i) {
        if (s.kind === 'example' && s.gen) checkProblem('example ' + t.id + '[' + i + '] ' + s.gen, function () { return KIT.gen.build(s.gen, s.params); });
      });
    });
    KIT.exams.all().forEach(function (x) {
      x.sections.forEach(function (s) {
        if (s.type !== 'gen') return;
        s.items.forEach(function (it, i) { checkProblem('exam ' + x.id + '/' + s.id + '[' + i + '] ' + it.gen, function () { return KIT.gen.build(it.gen, it.params); }); });
      });
    });

    // 5. Online exam runner end to end, driven like a student: start, answer every objective item correctly
    //    through the widgets, submit; the score must equal the objective maximum (essays are self-graded later).
    function answerItems(x) {
      var out = [];
      x.sections.forEach(function (s) {
        s.items.forEach(function (it) {
          if (s.type === 'gen') {
            var ins = KIT.gen.build(it.gen, it.params).inputs;
            out.push({ inputs: ins, pts: it.pts, self: ins.every(function (inp) { return inp.kind === 'sketch'; }) });   // drawings are self-graded
          }
          else { var q = KIT.bank.get(it); if (q) out.push({ q: q, pts: s.each }); }
        });
      });
      return out;
    }
    function fillWidget(wrap, inp) {
      var row = wrap.querySelector('.in-row'), ans = KIT.grade.answerOf(inp);
      if (inp.kind === 'grid') row._grid.set(ans);
      else if (inp.kind === 'choice') row.querySelectorAll('.btn.choice')[ans].click();
      else if (inp.kind === 'tf') row.querySelectorAll('.btn.choice')[ans ? 0 : 1].click();
      else row.querySelector('input').value = String(ans);
    }
    function runExam(name, route, x) {
      var el = h('div'); box.appendChild(el);
      var n0 = KIT.errors.length, wasStatic = KIT.env.static, origConfirm = window.confirm;
      try {
        KIT.env.static = false;
        window.confirm = function () { return true; };
        KIT.pages.get('exam')(el, route);
        var btn = function (txt) { return Array.prototype.filter.call(el.querySelectorAll('button'), function (b) { return b.textContent === txt; })[0]; };
        btn('Start the exam').click();
        var boxes = el.querySelectorAll('.exam-item'), items = answerItems(x), objective = 0;
        if (boxes.length !== items.length) throw new Error(boxes.length + ' items shown, expected ' + items.length);
        items.forEach(function (it, i) {
          if ((it.q && it.q.type === 'essay') || it.self) return;
          var wraps = boxes[i].querySelectorAll('.in-wrap'), q = it.q;
          objective += it.pts;
          if (it.inputs) it.inputs.forEach(function (inp, k) { fillWidget(wraps[k], inp); });
          else fillWidget(wraps[0], q.type === 'mcq' ? { kind: 'choice', answer: q.answer } : q.type === 'tf' ? { kind: 'tf', answer: q.answer }
            : q.type === 'num' ? { kind: 'num', answer: q.num.value } : { kind: 'text', answer: q.answer, accept: [] });
        });
        btn('Submit the exam').click();
        var head = el.querySelector('.exam-result h2');
        var notRight = Array.prototype.filter.call(boxes, function (b) { return b.classList.contains('wrong') || b.classList.contains('partial'); });
        rec(head && head.textContent.indexOf('Score: ' + KIT.fmt.num(objective, 4) + ' / ') === 0 && !notRight.length && KIT.errors.length === n0, name,
          head ? head.textContent + (notRight.length ? '; not marked right: ' + notRight[0].textContent.slice(0, 60) : '') + ' ' + errSince(n0) : 'no result card');
      } catch (e) { rec(false, name, e.message); }
      KIT.env.static = wasStatic;
      window.confirm = origConfirm;
      box.removeChild(el);
    }
    ['A', 'B'].forEach(function (id) {
      var x = KIT.exams.get(id);
      if (x) runExam('exam runner ' + id + ': all-correct answers get full objective marks', { path: ['exam', id], query: {} }, x);
    });
    if (KIT.ui.randomExam) runExam('exam runner random/half: all-correct answers get full objective marks',
      { path: ['exam', 'random'], query: { size: 'half', seed: '3' } }, KIT.ui.randomExam(3, 'half'));

    // 6. Flashcards: a click flips the card with a 0.1 s rotation; the next card starts face up.
    (function () {
      var el = h('div'); box.appendChild(el);
      var wasStatic = KIT.env.static;
      try {
        KIT.env.static = false;
        KIT.pages.get('flash')(el, { path: ['flash'], query: {} });
        var inner = el.querySelector('.flash-inner');
        var cs = inner ? getComputedStyle(inner) : null;
        var timing = cs ? cs.transitionProperty + ' ' + cs.transitionDuration : 'no card';
        timing += window.matchMedia('(prefers-reduced-motion: reduce)').matches ? ' [reduced motion]' : '';
        el.querySelector('.flashcard').click();
        var flippedNow = inner && inner.classList.contains('is-flipped');
        var good = Array.prototype.filter.call(el.querySelectorAll('button'), function (b) { return /Got it/.test(b.textContent); })[0];
        var enabled = good && !good.disabled;
        good.click();
        var next = el.querySelector('.flash-inner');
        rec(/transform/.test(timing) && /(^|\s)0\.1s/.test(timing) && flippedNow && enabled && next && next !== inner && !next.classList.contains('is-flipped'),
          'flashcards: 0.1 s flip, then the next card face up', timing + (flippedNow ? '' : '; did not flip') + (enabled ? '' : '; answer buttons stayed disabled'));
      } catch (e) { rec(false, 'flashcards: 0.1 s flip, then the next card face up', e.message); }
      KIT.env.static = wasStatic;
      box.removeChild(el);
    })();

    // 7. Sketch pad: pointer strokes draw, undo removes, the model overlays on axes, a locked pad ignores input.
    (function () {
      var name = 'sketch pad: draw, undo, model overlay, lock';
      try {
        var pad = KIT.ui.sketch.create({ axes: { x: [0, 1], y: [-1, 1] } });
        var holder = h('div', { style: { width: '640px' } }, pad.el); box.appendChild(holder);
        var svg = pad.el.querySelector('svg'), r = svg.getBoundingClientRect();
        function fire(type, fx, fy) {
          svg.dispatchEvent(new PointerEvent(type, { clientX: r.left + fx * r.width, clientY: r.top + fy * r.height, pointerId: 7, button: 0, bubbles: true }));
        }
        fire('pointerdown', 0.2, 0.5); fire('pointermove', 0.4, 0.3); fire('pointermove', 0.6, 0.7); fire('pointerup', 0.6, 0.7);
        var drew = pad.value().length === 1 && pad.value()[0].length === 3 && svg.querySelectorAll('.ink').length === 1;
        pad.undo();
        var undone = pad.isEmpty() && !svg.querySelector('.ink');
        pad.showModel({ series: [{ kind: 'fn', fn: function (t) { return Math.sin(2 * Math.PI * t); } }] });
        var model = !!svg.querySelector('.sk-model-trace');
        pad.lock(true); fire('pointerdown', 0.5, 0.5); fire('pointerup', 0.5, 0.5);
        var locked = pad.isEmpty();
        rec(drew && undone && model && locked, name, [drew ? '' : 'no stroke', undone ? '' : 'undo failed', model ? '' : 'no model', locked ? '' : 'lock failed'].filter(Boolean).join('; '));
        box.removeChild(holder);
      } catch (e) { rec(false, name, e.message); }
    })();

    // 8. Math: $…$ becomes real MathML, and a fraction lays out stacked (numerator above the denominator).
    (function () {
      var name = 'math: $…$ renders as MathML with a stacked fraction';
      try {
        var holder = h('div', { style: { width: '600px', fontSize: '16px' } });
        holder.appendChild(KIT.html('<p>$$\\frac{S}{N}$$ and $x_1^2$</p>'));
        box.appendChild(holder);
        var maths = holder.querySelectorAll('math');
        var ns = maths.length === 2 && maths[0].namespaceURI === 'http://www.w3.org/1998/Math/MathML';
        var fr = holder.querySelector('mfrac'), num = fr && fr.children[0], den = fr && fr.children[1];
        var stacked = !!(num && den) && num.getBoundingClientRect().bottom <= den.getBoundingClientRect().top + 1;
        var leftover = /\$|\\frac/.test(holder.textContent);
        rec(ns && stacked && !leftover, name, [ns ? '' : 'not MathML', stacked ? '' : 'fraction not stacked', leftover ? 'raw TeX left' : ''].filter(Boolean).join('; '));
        box.removeChild(holder);
      } catch (e) { rec(false, name, e.message); }
    })();

    // 11. Terms & FAQ panel: terms are linked in reading content only; hover and ?term= fill the definition card.
    KIT.TOPIC_IDS.forEach(function (id) {
      var name = 'terms panel: ' + id, n0 = KIT.errors.length;
      try {
        var mainEl = h('main', { class: 'kit-main' }), asideEl = h('aside', { class: 'kit-aside', hidden: 'hidden' });
        var layout = h('div', { class: 'kit-layout' }, mainEl, asideEl); box.appendChild(layout);
        var first = KIT.ui.terms.index().filter(function (e) { return e.topic === id; })[0];
        KIT.pages.get('topic')(mainEl, { path: ['topic', id], query: { static: '1', view: 'slides', term: first ? first.term : '' } });
        var bad = [], terms = mainEl.querySelectorAll('.term');
        if (asideEl.hidden) bad.push('panel not shown');
        if (!terms.length) bad.push('no terms linked');
        var card = asideEl.querySelector('.tp-card');
        if (first && (!card || card.textContent.indexOf(first.term) < 0)) bad.push('?term= did not open "' + (first && first.term) + '"');
        var inQuestion = mainEl.querySelectorAll('.q .term, .problem-card .term, .callout.example .term, .predict .term, math .term');
        if (inQuestion.length) bad.push(inQuestion.length + ' term links inside questions or examples');
        if (terms.length) {
          var t = terms[terms.length - 1], want = t.textContent;
          t.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
          var e = KIT.ui.terms.index().filter(function (x) { return x.id === t.getAttribute('data-term'); })[0];
          if (!e || card.textContent.indexOf(e.term) < 0) bad.push('hovering "' + want + '" did not show its definition');
        }
        rec(!bad.length && KIT.errors.length === n0, name + ' (' + terms.length + ' links)', bad.join('; ') || errSince(n0));
        KIT.viz.destroyAll();
        box.removeChild(layout);
      } catch (err) { rec(false, name, err.message); }
    });

    // 10. Both views of every topic: the slide view shows every slide of the deck exactly once (cards or "being written").
    KIT.topics().forEach(function (t) {
      ['slides', 'summary'].forEach(function (view) {
        var name = 'topic ' + t.id + ': ' + view + ' view', n0 = KIT.errors.length;
        try {
          var el = KIT.ui.renderTopic(t, { view: view }); box.appendChild(el);
          var txt = el.textContent || '', bad = [];
          if (KIT.schema.garbage(txt)) bad.push('garbage text');
          if (/\$|\\[A-Za-z]{2,}/.test(txt)) bad.push('raw TeX');
          if (view === 'slides') {
            var r = KIT.topicRange(t.id), seen = {}, cards = el.querySelectorAll('[data-slides]');
            for (var c = 0; c < cards.length; c++) {
              var ab = cards[c].getAttribute('data-slides').split('-').map(Number);
              for (var k = ab[0]; k <= ab[1]; k++) seen[k] = (seen[k] || 0) + 1;
            }
            for (var s = r[0]; s <= r[1]; s++) if (seen[s] !== 1) bad.push('slide ' + s + ' shown ' + (seen[s] || 0) + '×');
            name += ' (' + el.querySelectorAll('.slide-card:not(.gap)').length + ' slide cards)';
          }
          rec(!bad.length && KIT.errors.length === n0, name, bad.slice(0, 5).join('; ') || errSince(n0));
          KIT.viz.destroyAll();
          box.removeChild(el);
        } catch (err) { rec(false, name, err.message); }
      });
    });

    // 9. Worked-example animations: every frame of every animated example draws something, without errors.
    (function () {
      var list = [];
      KIT.topics().forEach(function (t) {
        (t.sections || []).forEach(function (s) { if (s.kind === 'example' && s.gen && KIT.anim.has(s.gen)) list.push([t.id + ': ' + s.title, s.gen, s.params]); });
      });
      KIT.walks().forEach(function (w) {
        w.parts.forEach(function (p) {
          p.items.forEach(function (it) { var x = it.example; if (x && x.gen && KIT.anim.has(x.gen)) list.push(['walk ' + w.id + ' slide ' + it.n + ': ' + x.title, x.gen, x.params]); });
        });
      });
      list.forEach(function (e) {
        var name = 'animation ' + e[0], n0 = KIT.errors.length;
        try {
          var prob = KIT.gen.build(e[1], e[2]), frames = KIT.anim.frames(e[1], e[2], prob), bad = [];
          var holder = h('div', { style: { width: '860px' } }); box.appendChild(holder);
          frames.forEach(function (f, i) {
            KIT.clear(holder);
            var node = f.render();
            if (!node) { bad.push('frame ' + (i + 1) + ' is empty'); return; }
            holder.appendChild(node);
            if (!holder.querySelector('svg, math, table')) bad.push('frame ' + (i + 1) + ' draws nothing');
          });
          box.removeChild(holder);
          rec(!bad.length && KIT.errors.length === n0, name + ' (' + frames.length + ' frames)', bad.join('; ') || errSince(n0));
        } catch (err) { rec(false, name, err.message); }
      });
    })();

    document.body.removeChild(box);
    var pass = results.filter(function (r) { return r.ok; }).length;
    var fail = results.length - pass;
    var lines = ['SELFTEST DONE pass=' + pass + ' fail=' + fail]
      .concat(results.filter(function (r) { return !r.ok; }).map(function (r) { return 'FAIL ' + r.name + (r.detail ? ' — ' + r.detail : ''); }))
      .concat(results.filter(function (r) { return r.ok; }).map(function (r) { return 'ok   ' + r.name; }));
    main.appendChild(h('h1', null, 'Self-test'));
    main.appendChild(h('pre', { id: 'selftest' }, lines.join('\n')));
  });
})();
