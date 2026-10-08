/* Mock exams (#/exam, #/exam/<id>, #/exam/<id>?paper=1). Owner: Lead (Phase 2).
   Online mode: timed, auto-grades MCQ / Identification / Solving (partial credit per input), self-graded essays via rubric.
   Paper mode: enter the marks from the printed exam. Attempts are saved in KIT.store 'exam.attempts'. */
(function () {
  'use strict';
  var h = KIT.h;
  var LETTERS = 'ABCDE';

  function attempts() { return KIT.store.get('exam.attempts', []); }
  function saveAttempt(a) { var all = attempts(); all.unshift(a); if (all.length > 40) all.length = 40; KIT.store.set('exam.attempts', all); }
  function ready(x) { return x && x.status === 'final' && x.sections.some(function (s) { return s.items.length; }); }
  function fmtPts(x) { return KIT.fmt.num(Math.round(x * 2) / 2, 4); }

  function listPage(main) {
    main.appendChild(h('h1', null, 'Mock exams'));
    main.appendChild(h('p', { class: 'muted' }, 'Coverage: Modules 1–4, no calculator. Each form is 100 points in 120 minutes, shaped like the real exam: MCQ, Identification, drawing (line encodings and waves), ' +
      'one or two solving problems, and essays you can answer by drawing and/or explaining. Best practice: print it, take it timed on paper, then check the answer key; ' +
      'or take it online — objective parts grade instantly, drawings and essays are self-graded with the rubric.'));
    KIT.exams.all().filter(function (x) { return x.kind === 'form'; }).forEach(function (x) {
      var ok = ready(x);
      var best = attempts().filter(function (a) { return a.exam === x.id; })[0];
      main.appendChild(h('div', { class: 'card exam-card' },
        h('h2', { style: { marginTop: '0' } }, x.title, ' ', ok ? null : h('span', { class: 'badge pending' }, 'being assembled')),
        h('p', { class: 'muted small' }, x.points + ' points · ' + x.minutes + ' minutes · ' + x.sections.map(function (s) { return s.title.replace(/^Part [IV]+ — /, ''); }).join(' · ')),
        ok ? h('div', { class: 'btn-row' },
          h('a', { class: 'btn primary', href: '#/exam/' + x.id }, '⏱ Take online (timed)'),
          h('a', { class: 'btn', href: '#/print/exam/' + x.id, target: '_blank' }, '🖨 Paper version'),
          h('a', { class: 'btn', href: '#/print/exam/' + x.id + '/key', target: '_blank' }, '🔑 Answer key'),
          h('a', { class: 'btn ghost', href: '#/exam/' + x.id + '?paper=1' }, 'Enter paper scores')) : h('p', { class: 'small' }, 'This form is still being assembled.'),
        best ? h('p', { class: 'small' }, 'Last attempt: ' + fmtPts(best.score) + ' / ' + best.max + ' (' + new Date(best.ts).toLocaleString() + (best.mode === 'paper' ? ', paper' : '') + ')') : null));
    });
    var seed = 1 + Math.floor(Date.now() / 1000) % 99991;
    main.appendChild(h('div', { class: 'card exam-card' },
      h('h2', { style: { marginTop: '0' } }, '🎲 Random practice exam'),
      h('p', { class: 'muted small' }, 'Fresh every time: MCQ, Identification, drawing (line codes, scrambling, waves) and one or two solving problems, from the general bank and the generators ' +
        '(never from Forms A/B, so those stay unseen). Pick a size:'),
      h('div', { class: 'btn-row' },
        h('a', { class: 'btn primary', href: '#/exam/random?size=quick&seed=' + seed }, 'Quick (≈25 min)'),
        h('a', { class: 'btn', href: '#/exam/random?size=half&seed=' + seed }, 'Half (≈60 min)'),
        h('a', { class: 'btn', href: '#/exam/random?size=full&seed=' + seed }, 'Full (≈100 min)'))));
    main.appendChild(h('div', { class: 'callout key' }, h('div', { class: 'callout-label' }, 'Also'),
      'Take the ', h('a', { href: '#/diag' }, 'diagnostic'), ' first to find weak topics, and drill them in ', h('a', { href: '#/practice?mode=mixed' }, 'practice'), '.'));
  }

  /** A seeded random exam from general (non-pool) items + generators. size: quick | half | full. */
  function randomExam(seed, size) {
    var rng = KIT.rng('random-exam-' + seed + '-' + size);
    var scale = { quick: 0.34, half: 0.5, full: 1 }[size] || 0.5;
    var base = { mcq: { l01: 5, l02: 8, l03a: 8, l03b: 4, l04: 5 }, id: { l01: 4, l02: 5, l03a: 5, l03b: 3, l04: 3 } };
    function pickBank(type) {
      var out = [];
      Object.keys(base[type]).forEach(function (t) {
        var want = Math.max(1, Math.round(base[type][t] * scale));
        var avail = rng.shuffle(KIT.bank.query({ topic: t, type: type, pool: 'none' }).map(function (q) { return q.id; }));
        out = out.concat(avail.slice(0, want));
      });
      return rng.shuffle(out);
    }
    // Shaped like the real exam: a drawing part (line encodings, waves) and only one or two solving problems.
    var DRAW = ['l03a.draw', 'l03a.scramble', 'l02.sketch', 'l04.sketch', 'l03b.sketch'];
    var nDraw = size === 'full' ? 4 : 2, nSolve = size === 'quick' ? 1 : 2;
    function slot(id) { var g = KIT.gen.get(id); return g && typeof g.params === 'function' ? { gen: id, params: g.params(rng), pts: 5, topic: g.topic } : null; }
    var draws = rng.shuffle(DRAW.slice()).slice(0, nDraw).map(slot).filter(Boolean);
    var solvable = KIT.gen.all().filter(function (g) { return typeof g.params === 'function' && DRAW.indexOf(g.id) < 0; }).map(function (g) { return g.id; });
    var solves = rng.shuffle(solvable).slice(0, nSolve).map(slot).filter(Boolean);
    var mcq = pickBank('mcq'), ids = pickBank('id');
    return {
      id: 'random', kind: 'form', status: 'final', title: 'Random practice exam (' + size + ', #' + seed + ')',
      minutes: size === 'quick' ? 25 : size === 'half' ? 60 : 100, points: mcq.length + ids.length + (draws.length + solves.length) * 5,
      instructions: 'Practice exam from the general bank and the generators. No calculator. Draw on the grids and axes; use the slide conventions.',
      sections: [
        { id: 'mcq', type: 'mcq', title: 'Part I — Multiple choice', each: 1, items: mcq },
        { id: 'id', type: 'id', title: 'Part II — Identification', each: 1, items: ids },
        { id: 'draw', type: 'gen', title: 'Part III — Draw: line encodings and waves', slots: draws.length, pts: 5, items: draws },
        { id: 'ps', type: 'gen', title: 'Part IV — Problem solving (no calculator)', slots: solves.length, pts: 5, items: solves }
      ]
    };
  }
  KIT.ui.randomExam = randomExam;

  /** Items of an exam, flattened: {section, kind:'bank'|'gen', q | prob, pts, topic, idx} */
  function flatten(x) {
    var out = [];
    x.sections.forEach(function (s) {
      s.items.forEach(function (it, i) {
        if (s.type === 'gen') {
          var prob = KIT.gen.build(it.gen, it.params);
          out.push({ section: s, kind: 'gen', prob: prob, pts: it.pts, topic: it.topic, idx: i });
        } else {
          var q = KIT.bank.get(it);
          if (q) out.push({ section: s, kind: 'bank', q: q, pts: s.each, topic: q.topic, idx: i });
        }
      });
    });
    return out;
  }

  function paperPage(main, x) {
    main.appendChild(h('h1', null, x.title + ' — enter paper scores'));
    main.appendChild(h('p', { class: 'muted' }, 'Grade your paper with the answer key, then enter each part\'s score.'));
    var fields = x.sections.map(function (s) {
      var max = s.type === 'gen' ? s.slots * s.pts : Object.keys(s.quota).reduce(function (a, k) { return a + s.quota[k]; }, 0) * s.each;
      var inp = h('input', { class: 'inp', type: 'number', min: '0', max: String(max), step: '0.5', value: '0', style: { width: '90px' } });
      return { s: s, max: max, inp: inp };
    });
    var tbl = h('table', { class: 'tbl' }, h('tbody', null, fields.map(function (f) {
      return h('tr', null, h('td', null, f.s.title), h('td', null, f.inp, ' / ' + f.max));
    })));
    main.appendChild(tbl);
    var msg = h('p', { class: 'fb' });
    var save = h('button', { class: 'btn primary', type: 'button' }, 'Save my score');
    save.addEventListener('click', function () {
      var total = 0, max = 0;
      fields.forEach(function (f) { var v = Math.max(0, Math.min(f.max, Number(f.inp.value) || 0)); total += v; max += f.max; });
      saveAttempt({ exam: x.id, ts: Date.now(), score: total, max: max, mode: 'paper' });
      msg.className = 'fb ok';
      msg.textContent = 'Saved: ' + fmtPts(total) + ' / ' + max + '. Review the key for anything you missed.';
    });
    main.appendChild(h('div', { class: 'btn-row' }, save, h('a', { class: 'btn', href: '#/print/exam/' + x.id + '/key', target: '_blank' }, '🔑 Answer key')));
    main.appendChild(msg);
  }

  function runPage(main, x, q) {
    if (!ready(x)) {
      main.appendChild(h('h1', null, x.title));
      main.appendChild(h('div', { class: 'callout' }, h('div', { class: 'callout-label' }, 'Being assembled'), 'This form is not ready yet. Try the diagnostic or practice meanwhile.'));
      return;
    }
    if (q.paper) return paperPage(main, x);
    var items = flatten(x);
    main.appendChild(h('h1', null, x.title));
    if (KIT.env.static) {
      main.appendChild(h('p', null, items.length + ' items · ' + x.points + ' points.'));
      return;
    }
    var start = h('div', { class: 'card' });
    var minutes = h('input', { class: 'inp', type: 'number', min: '10', max: '240', value: String(x.minutes), style: { width: '80px' } });
    var go = h('button', { class: 'btn primary', type: 'button' }, 'Start the exam');
    start.appendChild(h('p', null, KIT.html(x.instructions || '')));
    start.appendChild(h('p', null, 'Time limit: ', minutes, ' minutes. Answers are graded when you submit (or when time runs out).'));
    start.appendChild(go);
    main.appendChild(start);
    go.addEventListener('click', function () { main.removeChild(start); begin(Number(minutes.value) || x.minutes); });

    function begin(mins) {
      var deadline = Date.now() + mins * 60000;
      var timerEl = h('div', { class: 'exam-timer' });
      var submitTop = h('button', { class: 'btn primary', type: 'button' }, 'Submit');
      main.appendChild(h('div', { class: 'exam-bar' }, timerEl, submitTop));
      var form = h('div', { class: 'exam-form' });
      main.appendChild(form);
      var widgets = [];
      var curSection = null, n = 0;
      items.forEach(function (it) {
        if (it.section !== curSection) {
          curSection = it.section;
          form.appendChild(h('h2', null, it.section.title));
        }
        n++;
        var box = h('div', { class: 'card exam-item' }, h('div', { class: 'small muted' }, n + '. (' + it.pts + ' pt' + (it.pts > 1 ? 's' : '') + ')'));
        var w;
        if (it.kind === 'gen') {
          box.appendChild(h('div', { class: 'prompt' }, KIT.html(it.prob.prompt)));
          var ws = it.prob.inputs.map(function (inp) { var iw = KIT.ui.practice.inputWidget(inp); box.appendChild(iw.el); return iw; });
          w = { it: it, ws: ws };
        } else {
          var qq = it.q;
          box.appendChild(h('div', { class: 'prompt' }, KIT.html(qq.q)));
          if (qq.type === 'mcq' || qq.type === 'multi') {
            var inpC = { kind: 'choice', choices: qq.choices.map(function (c, i) { return LETTERS[i] + '. ' + c; }), answer: qq.answer };
            var cw = KIT.ui.practice.inputWidget(inpC);
            box.appendChild(cw.el);
            w = { it: it, single: cw, inp: inpC };
          } else if (qq.type === 'essay') {
            var ta = h('textarea', { class: 'inp essay-box', rows: '7', placeholder: 'Explain here — and/or draw below…' });
            var epad = KIT.ui.sketch.create({ label: 'Drawing for your essay answer' });
            box.appendChild(ta);
            box.appendChild(epad.el);
            w = { it: it, essay: ta, pad: epad };
          } else {
            var inpT = qq.type === 'num' ? { kind: 'num', answer: qq.num.value, unit: qq.num.unit, tol: qq.num.tol, rel: qq.num.rel }
              : qq.type === 'tf' ? { kind: 'tf', answer: qq.answer } : { kind: 'text', answer: qq.answer, accept: qq.accept || [] };
            var tw = KIT.ui.practice.inputWidget(inpT);
            box.appendChild(tw.el);
            w = { it: it, single: tw, inp: inpT };
          }
        }
        w.box = box;
        widgets.push(w);
        form.appendChild(box);
      });
      var submitBottom = h('button', { class: 'btn primary', type: 'button' }, 'Submit the exam');
      form.appendChild(h('div', { class: 'btn-row' }, submitBottom));

      var done = false;
      function tick() {
        var left = Math.max(0, deadline - Date.now());
        var m = Math.floor(left / 60000), s = Math.floor((left % 60000) / 1000);
        timerEl.textContent = '⏱ ' + m + ':' + (s < 10 ? '0' : '') + s + ' left';
        timerEl.classList.toggle('warn', left < 10 * 60000);
        if (left <= 0 && !done) submit(true);
      }
      var timer = setInterval(tick, 1000);
      tick();
      function stop() { clearInterval(timer); window.removeEventListener('hashchange', stop); }
      window.addEventListener('hashchange', stop);

      function submit(timeUp) {
        if (done) return;
        done = true; stop();
        submitTop.disabled = submitBottom.disabled = true;
        var bySection = {}, byTopic = {}, objective = 0, max = 0, essays = [];
        widgets.forEach(function (w) {
          var it = w.it, got = 0;
          var sec = it.section.id;
          bySection[sec] = bySection[sec] || { title: it.section.title, got: 0, max: 0 };
          byTopic[it.topic] = byTopic[it.topic] || { got: 0, max: 0 };
          bySection[sec].max += it.pts; byTopic[it.topic].max += it.pts; max += it.pts;
          if (w.essay) { essays.push(w); return; }
          if (w.ws && it.prob.inputs.every(function (inp) { return inp.kind === 'sketch'; })) { essays.push(w); return; }   // drawings: self-graded
          if (w.ws) {
            var okN = 0;
            it.prob.inputs.forEach(function (inp, i) { var r = KIT.grade.check(inp, w.ws[i].get()); w.ws[i].mark(r); if (r.ok) okN++; });
            got = Math.round(it.pts * okN / it.prob.inputs.length * 2) / 2;
            w.box.appendChild(h('details', { class: 'exam-sol' }, h('summary', null, 'Worked solution'), KIT.ui.solutionBlock(it.prob)));
          } else {
            var res = KIT.grade.check(w.inp, w.single.get());
            w.single.mark(res);
            if (res.ok) got = it.pts;
            else w.single.reveal();
            w.box.appendChild(h('div', { class: 'small exam-explain' }, KIT.html(it.q.explain || ''), it.q.fix ? h('div', null, 'Corrected: ', KIT.html(it.q.fix)) : null,
              h('span', { class: 'chip ref' }, it.q.ref)));
          }
          bySection[sec].got += got; byTopic[it.topic].got += got; objective += got;
          w.box.classList.add(got === it.pts ? 'right' : got > 0 ? 'partial' : 'wrong');
        });
        var essayScore = 0;          // everything self-graded: essays and drawings
        var result = h('div', { class: 'card exam-result' });
        function drawResult() {
          KIT.clear(result);
          var total = objective + essayScore;
          result.appendChild(h('h2', { style: { marginTop: '0' } }, (timeUp ? '⏱ Time is up — ' : '') + 'Score: ' + fmtPts(total) + ' / ' + max));
          result.appendChild(h('table', { class: 'tbl compact' }, h('thead', null, h('tr', null, h('th', null, 'Part'), h('th', { class: 'num' }, 'Score'))),
            h('tbody', null, Object.keys(bySection).map(function (k) {
              var b = bySection[k];
              var g = b.got;
              return h('tr', null, h('td', null, b.title), h('td', { class: 'num' }, fmtPts(g) + ' / ' + b.max));
            }))));
          var tops = Object.keys(byTopic).map(function (t) { return { t: t, pct: byTopic[t].max ? byTopic[t].got / byTopic[t].max : 0 }; })
            .sort(function (a, b) { return a.pct - b.pct; });
          result.appendChild(h('p', { class: 'small' }, 'By topic (weakest first; self-graded points count once ticked): ', tops.map(function (o) {
            return h('a', { class: 'chip', href: '#/topic/' + o.t, style: { marginRight: '6px' } }, KIT.ui.deckLabel(o.t) + ' ' + Math.round(o.pct * 100) + '%');
          })));
          if (essays.length) result.appendChild(h('p', { class: 'small muted' }, 'Essays and drawings: tick the rubric points you covered (below) to add them to your score.'));
        }
        essays.forEach(function (w) {
          var sec = w.it.section.id, isDraw = !w.essay;
          var rubric = isDraw ? [].concat.apply([], w.it.prob.inputs.map(function (inp) { return inp.rubric || []; })) : (w.it.q.rubric || []);
          var rpts = rubric.reduce(function (a, r) { return a + r.pts; }, 0), scale = rpts ? w.it.pts / rpts : 1;   // rubric scaled to the item
          var rub = h('div', { class: 'rubric' }, h('div', { class: 'callout-label' }, 'Self-grade with the rubric'));
          rubric.forEach(function (r) {
            var cb = h('input', { type: 'checkbox' }), pts = Math.round(r.pts * scale * 2) / 2;
            cb.addEventListener('change', function () {
              var d = cb.checked ? pts : -pts;
              essayScore += d; bySection[sec].got += d; byTopic[w.it.topic].got += d;
              drawResult();
            });
            rub.appendChild(h('label', { class: 'rubric-row' }, cb, ' ', r.point, h('span', { class: 'muted' }, ' (' + pts + ')')));
          });
          w.box.appendChild(rub);
          if (isDraw) {
            w.ws.forEach(function (iw) { iw.showModel(); iw.lock(true); });
            w.box.appendChild(h('p', { class: 'small muted' }, 'The model is overlaid on your drawing in orange.'));
            w.box.appendChild(h('details', { class: 'exam-sol' }, h('summary', null, 'Worked solution'), KIT.ui.solutionBlock(w.it.prob)));
          } else {
            var model = h('details', { class: 'exam-sol', open: true }, h('summary', null, 'Model answer'), KIT.html(w.it.q.model));
            KIT.fig.hydrate(model);
            w.box.appendChild(model);
            w.essay.readOnly = true;
            if (w.pad) w.pad.lock(true);
          }
        });
        drawResult();
        main.insertBefore(result, main.children[1] || null);
        saveAttempt({ exam: x.id, ts: Date.now(), score: objective, max: max, mode: 'online', byTopic: byTopic, note: essays.length ? 'essays and drawings self-graded separately' : '' });
        window.scrollTo(0, 0);
      }
      submitTop.addEventListener('click', function () { if (confirm('Submit the exam now?')) submit(false); });
      submitBottom.addEventListener('click', function () { if (confirm('Submit the exam now?')) submit(false); });
    }
  }

  KIT.page('exam', function (main, route) {
    var id = route.path[1];
    if (!id) return listPage(main);
    var qq = route.query || {};
    var x = id === 'random' ? randomExam(Number(qq.seed) || 1, qq.size || 'half') : KIT.exams.get(id);
    if (!x) { main.appendChild(h('h1', null, 'Unknown exam')); main.appendChild(h('a', { class: 'btn', href: '#/exam' }, '← Mock exams')); return; }
    runPage(main, x, route.query || {});
  });
})();
