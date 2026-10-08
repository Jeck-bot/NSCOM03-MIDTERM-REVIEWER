/* Quiz components. Owner: UI.
   KIT.ui.quiz = { render(item, opts), renderSet(items, opts), control(item, opts), gradeItem(item, resp), record(id, ok), results() }.
   Interactive types: mcq, multi, tf, id (text), num (text + unit hint), essay (rubric self-grade).
   Static mode (opts.static or KIT.env.static): the correct answer and the explanation, no inputs.
   Everything the student types is rendered with textContent only; authored HTML goes through KIT.html. */
(function () {
  'use strict';
  var h = KIT.h;
  var hasOwn = Object.prototype.hasOwnProperty;
  var RESULTS_KEY = 'quiz.results';
  var LETTERS = 'ABCDEFGH';
  var TYPE_LABEL = { mcq: 'Multiple choice', multi: 'Select all that apply', tf: 'True or false', id: 'Identification', num: 'Solve', essay: 'Essay' };
  var uid = 0;

  /* ================= pure: grading adapter and persistence ================= */

  function blankChoice(r) { return r === undefined || r === null || r === '' || (typeof r === 'number' && r !== r); }

  /** → { ok: true|false|null (essays), blank, msg }. A blank or unparseable response is not an attempt. */
  function gradeItem(q, resp) {
    var G = KIT.grade;
    if (q.type === 'essay') return { ok: null, blank: false, msg: '' };
    if (q.type === 'multi' && (!Array.isArray(resp) || !resp.length)) return { ok: false, blank: true, msg: 'Select at least one answer.' };
    if (q.type === 'mcq' && blankChoice(resp)) return { ok: false, blank: true, msg: 'Choose an answer first.' };
    if (q.type === 'tf' && !(resp === true || resp === false || resp === 'true' || resp === 'false')) return { ok: false, blank: true, msg: 'Choose true or false.' };
    if (q.type === 'id' && !G.normalizeText(resp)) return { ok: false, blank: true, msg: 'Type an answer first.' };
    var detail = null;
    if (q.type === 'num') {
      if (!q.num) return { ok: false, blank: false, msg: 'This question has no numeric answer defined.' };
      var inp = { kind: 'num', answer: q.num.value, tol: q.num.tol, rel: q.num.rel, unit: q.num.unit, accept: q.num.accept };
      if (!G.parseQuantity(resp, q.num.unit).ok) return { ok: false, blank: true, msg: G.check(inp, resp).msg };
      detail = G.check(inp, resp);
    } else if (q.type === 'id') {
      detail = G.check({ kind: 'text', answer: q.answer, accept: q.accept || [] }, resp);
    }
    var ok = G.question(q, resp) === true;
    return { ok: ok, blank: false, msg: detail ? detail.msg : (ok ? 'Correct.' : 'Not quite.') };
  }

  /** Saved results: { [itemId]: { ok, n, ts } } — ok is the latest attempt, n the number of graded attempts. */
  function results() {
    var r = KIT.store.get(RESULTS_KEY, {});
    return r && typeof r === 'object' && !Array.isArray(r) ? r : {};
  }
  function record(id, ok, ts) {
    var all = results();
    var prev = hasOwn.call(all, id) && all[id] && typeof all[id] === 'object' ? all[id] : null;
    var entry = { ok: !!ok, n: (prev && prev.n > 0 ? prev.n : 0) + 1, ts: ts === undefined ? Date.now() : ts };
    all[id] = entry;
    KIT.store.set(RESULTS_KEY, all);
    return entry;
  }

  /* ================= answer text (shared by feedback and static mode) ================= */

  function chip(ref) { return ref ? h('span', { class: 'chip ref', title: 'Slide reference' }, ref) : null; }

  function answerNode(q) {
    switch (q.type) {
      case 'mcq': return h('span', null, LETTERS.charAt(q.answer) + '. ', KIT.html(q.choices[q.answer]));
      case 'multi': return h('span', null, q.answer.map(function (i, k) {
        return h('span', null, k ? '; ' : '', LETTERS.charAt(i) + '. ', KIT.html(q.choices[i]));
      }));
      case 'tf': return h('span', null, q.answer ? 'True' : 'False');
      case 'id': return h('span', null, q.answer, q.accept && q.accept.length ? h('span', { class: 'muted' }, ' (also accepted: ' + q.accept.join(', ') + ')') : null);
      case 'num': return h('span', null, q.num ? KIT.fmt.si(q.num.value, q.num.unit || '', 4) : '');
      default: return null;
    }
  }

  function explainBlock(q) {
    var box = h('div', { class: 'q-explain' });
    if (q.explain) box.appendChild(h('div', null, h('b', null, 'Why: '), KIT.html(q.explain)));
    if (q.type === 'tf' && q.answer === false && q.fix) box.appendChild(h('div', { class: 'q-fix' }, h('b', null, 'Corrected statement: '), KIT.html(q.fix)));
    if (q.ref) box.appendChild(h('div', { class: 'q-ref' }, chip(q.ref)));
    return box;
  }

  function rubricList(q) {
    return h('ul', { class: 'q-rubric-list' }, (q.rubric || []).map(function (r) {
      return h('li', null, h('span', { class: 'pts' }, r.pts + (r.pts === 1 ? ' pt' : ' pts')), ' ', r.point);
    }));
  }

  /* ================= controls: one per question type ================= */

  function choiceControl(q, opts) {
    var multi = q.type === 'multi', tf = q.type === 'tf';
    var name = 'q' + (++uid);
    var labels = tf ? ['True', 'False'] : q.choices;
    var rows = [], inputs = [];
    var wrap = h('div', { class: 'q-opts' + (tf ? ' tf' : ''), role: multi ? 'group' : 'radiogroup' });
    labels.forEach(function (c, i) {
      var inp = h('input', { type: multi ? 'checkbox' : 'radio', name: name, value: String(i) });
      var mark = h('span', { class: 'opt-mark' });
      var row = h('label', { class: 'opt' }, inp, tf ? null : h('span', { class: 'opt-key' }, LETTERS.charAt(i)),
        h('span', { class: 'opt-text' }, tf ? c : KIT.html(c)), mark);
      inp.addEventListener('change', function () { if (opts.onChange) opts.onChange(); });
      inputs.push(inp); rows.push({ row: row, mark: mark });
      wrap.appendChild(row);
    });
    function chosen() {
      var out = [];
      inputs.forEach(function (inp, i) { if (inp.checked) out.push(i); });
      return out;
    }
    return {
      el: wrap,
      get: function () {
        var c = chosen();
        if (multi) return c;
        if (!c.length) return null;
        return tf ? c[0] === 0 : c[0];
      },
      isBlank: function () { return !chosen().length; },
      lock: function (on) { inputs.forEach(function (inp) { inp.disabled = !!on; }); },
      mark: function () {
        var right = multi ? q.answer : tf ? [q.answer ? 0 : 1] : [q.answer];
        var picked = chosen();
        rows.forEach(function (r, i) {
          var isRight = right.indexOf(i) >= 0, isPicked = picked.indexOf(i) >= 0;
          r.row.classList.toggle('right', isRight);
          r.row.classList.toggle('wrong', isPicked && !isRight);
          r.mark.textContent = isRight ? (isPicked ? '✓ Correct' : (multi ? '✓ Missed' : '✓ Correct answer')) : (isPicked ? '✗ Your answer' : '');
        });
      },
      reset: function () {
        inputs.forEach(function (inp) { inp.checked = false; inp.disabled = false; });
        rows.forEach(function (r) { r.row.classList.remove('right', 'wrong'); r.mark.textContent = ''; });
      },
      focus: function () { if (inputs[0]) inputs[0].focus(); }
    };
  }

  function textControl(q, opts) {
    var isNum = q.type === 'num';
    var inp = h('input', { class: 'inp' + (isNum ? ' mono' : ''), type: 'text', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false',
      maxlength: '160', 'aria-label': isNum ? 'Your numeric answer' : 'Your answer', placeholder: isNum ? 'e.g. ' + KIT.grade.example((q.num && q.num.unit) || '') : 'Type the term' });
    inp.addEventListener('input', function () { if (opts.onChange) opts.onChange(); });
    inp.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter') { ev.preventDefault(); if (opts.onEnter) opts.onEnter(); }
    });
    var wrap = h('div', { class: 'q-input' }, inp);
    if (isNum) {
      var unit = q.num && q.num.unit;
      wrap.appendChild(h('span', { class: 'q-unit' }, unit ? 'answer in ' + unit : 'plain number'));
      wrap.appendChild(h('span', { class: 'q-hint' }, KIT.grade.prefixable(unit) ? 'k, M, µ prefixes and e-notation are fine' : 'e-notation is fine'));
    }
    return {
      el: wrap,
      get: function () { return inp.value; },
      isBlank: function () { return !inp.value.trim(); },
      lock: function (on) { inp.readOnly = !!on; },
      mark: function (ok) { inp.classList.toggle('ok', ok === true); inp.classList.toggle('bad', ok === false); },
      reset: function () { inp.value = ''; inp.readOnly = false; inp.classList.remove('ok', 'bad'); },
      focus: function () { inp.focus(); }
    };
  }

  function essayControl(q, opts) {
    var ta = h('textarea', { class: 'inp q-essay-input', rows: '6', maxlength: '4000', 'aria-label': 'Your essay answer (not saved)', placeholder: 'Explain here and/or draw below, then reveal the rubric and model answer to self-grade.' });
    ta.addEventListener('input', function () { if (opts.onChange) opts.onChange(); });
    // Essays may be answered with a drawing, an explanation, or both.
    var pad = KIT.ui.sketch ? KIT.ui.sketch.create({ label: 'Drawing for your essay answer' }) : null;
    if (pad) pad.onChange = function () { if (opts.onChange) opts.onChange(); };
    return {
      el: h('div', { class: 'q-input' }, ta, pad ? pad.el : null),
      get: function () { return ta.value; },
      isBlank: function () { return !ta.value.trim() && (!pad || pad.isEmpty()); },
      lock: function (on) { ta.readOnly = !!on; if (pad) pad.lock(on); },
      mark: function () {},
      reset: function () { ta.value = ''; ta.readOnly = false; if (pad) { pad.clear(); pad.lock(false); } },
      focus: function () { ta.focus(); }
    };
  }

  /** The input part of a question: { el, get(), isBlank(), lock(on), mark(ok), reset(), focus() }. Also used by the diagnostic. */
  function control(q, opts) {
    opts = opts || {};
    if (q.type === 'mcq' || q.type === 'multi' || q.type === 'tf') return choiceControl(q, opts);
    if (q.type === 'id' || q.type === 'num') return textControl(q, opts);
    return essayControl(q, opts);
  }

  /* ================= static question (answer + explanation, no inputs) ================= */

  function staticBody(q) {
    var box = h('div', { class: 'q-static' });
    if (q.type === 'essay') {
      box.appendChild(h('div', { class: 'q-rubric' }, h('div', { class: 'q-sub' }, 'Rubric'), rubricList(q)));
      var mb = h('div', { class: 'q-model' }, h('div', { class: 'q-sub' }, 'Model answer'), KIT.html(q.model || ''));
      KIT.fig.hydrate(mb);
      box.appendChild(mb);
      if (q.ref) box.appendChild(h('div', { class: 'q-ref' }, chip(q.ref)));
      return box;
    }
    if (q.choices && (q.type === 'mcq' || q.type === 'multi')) {
      var right = q.type === 'multi' ? q.answer : [q.answer];
      box.appendChild(h('ol', { class: 'q-choices', type: 'A' }, q.choices.map(function (c, i) {
        var isRight = right.indexOf(i) >= 0;
        return h('li', { class: isRight ? 'right' : null }, KIT.html(c), isRight ? h('span', { class: 'opt-mark' }, ' ✓ correct') : null);
      })));
    }
    box.appendChild(h('div', { class: 'q-answer' }, h('b', null, 'Answer: '), answerNode(q)));
    box.appendChild(explainBlock(q));
    return box;
  }

  /* ================= interactive question ================= */

  function build(q, opts) {
    opts = opts || {};
    var isStatic = opts.static !== undefined ? !!opts.static : !!KIT.env.static;
    var root = h('div', { class: 'q q-' + q.type + (isStatic ? ' static' : ''), 'data-id': q.id });
    var head = h('div', { class: 'q-head' },
      opts.index !== undefined ? h('span', { class: 'q-num' }, opts.index + '.') : null,
      h('span', { class: 'q-type' }, TYPE_LABEL[q.type] || q.type));
    root.appendChild(head);
    root.appendChild(h('div', { class: 'q-text' }, KIT.html(q.q)));
    if (isStatic) { root.appendChild(staticBody(q)); return { el: root, reset: function () {}, state: function () { return null; } }; }

    var state = null;                    // null = not graded yet, true/false = last graded attempt, 'self' = essay revealed
    var fb = h('div', { class: 'q-fb', role: 'status', 'aria-live': 'polite' });
    var actions = h('div', { class: 'q-actions' });
    var ctl, checkBtn, retryBtn;

    function showHint(msg) {
      KIT.clear(fb);
      fb.appendChild(h('div', { class: 'fb hint' }, msg));
      ctl.focus();
    }
    function onCheck() {
      if (state !== null) return;
      var resp = ctl.get();
      var g = gradeItem(q, resp);
      if (g.blank) { showHint(g.msg); return; }
      state = g.ok;
      record(q.id, g.ok);
      ctl.lock(true); ctl.mark(g.ok);
      KIT.clear(fb);
      var extra = !g.ok && g.msg && g.msg !== 'Not quite.' ? ' ' + g.msg : '';
      fb.appendChild(h('div', { class: 'fb ' + (g.ok ? 'ok' : 'bad') },
        h('span', { class: 'fb-icon', 'aria-hidden': 'true' }, g.ok ? '✓' : '✗'), g.ok ? ' Correct.' : ' Not quite.' + extra));
      if ((q.type === 'id' || q.type === 'num') && !g.ok) {
        fb.appendChild(h('div', { class: 'q-yours' }, 'You typed: ', h('code', null, String(resp))));
      }
      fb.appendChild(h('div', { class: 'q-answer' }, h('b', null, 'Answer: '), answerNode(q)));
      fb.appendChild(explainBlock(q));
      checkBtn.hidden = true; retryBtn.hidden = false;
      retryBtn.focus();
      if (opts.onResult) opts.onResult(q, g.ok);
    }
    function reset() {
      state = null;
      ctl.reset();
      KIT.clear(fb);
      checkBtn.hidden = false; retryBtn.hidden = true;
      if (opts.onResult) opts.onResult(q, null);
    }

    if (q.type === 'essay') {
      ctl = control(q, {});
      var reveal = h('button', { class: 'btn primary', type: 'button' }, 'Reveal rubric and model answer');
      reveal.addEventListener('click', function () {
        if (state !== null) return;
        state = 'self';
        reveal.hidden = true;
        showRubric(q, fb);
        if (opts.onResult) opts.onResult(q, null);
      });
      actions.appendChild(reveal);
      root.appendChild(ctl.el); root.appendChild(actions); root.appendChild(fb);
      return { el: root, state: function () { return state; }, reset: function () { state = null; ctl.reset(); KIT.clear(fb); reveal.hidden = false; } };
    }

    ctl = control(q, { onEnter: onCheck });
    checkBtn = h('button', { class: 'btn primary', type: 'button' }, 'Check');
    retryBtn = h('button', { class: 'btn', type: 'button', hidden: true }, 'Try again');
    checkBtn.addEventListener('click', onCheck);
    retryBtn.addEventListener('click', function () { reset(); ctl.focus(); });
    actions.appendChild(checkBtn); actions.appendChild(retryBtn);
    root.appendChild(ctl.el); root.appendChild(actions); root.appendChild(fb);
    return { el: root, state: function () { return state; }, reset: reset };
  }

  /** Essay self-grading: tick each rubric point you covered; the model answer is shown underneath. */
  function showRubric(q, into) {
    KIT.clear(into);
    var total = (q.rubric || []).reduce(function (s, r) { return s + (r.pts || 0); }, 0);
    var score = h('div', { class: 'q-rubric-total', role: 'status' });
    var boxes = [];
    function update() {
      var got = 0;
      boxes.forEach(function (b, i) { if (b.checked) got += q.rubric[i].pts || 0; });
      score.textContent = 'Self-grade: ' + got + ' / ' + total;
    }
    var list = h('ul', { class: 'q-rubric-list check' }, (q.rubric || []).map(function (r) {
      var cb = h('input', { type: 'checkbox' });
      cb.addEventListener('change', update);
      boxes.push(cb);
      return h('li', null, h('label', null, cb, h('span', { class: 'pts' }, r.pts + (r.pts === 1 ? ' pt' : ' pts')), ' ', r.point));
    }));
    into.appendChild(h('div', { class: 'q-rubric' }, h('div', { class: 'q-sub' }, 'Tick every point your answer covered'), list, score));
    var modelBox = h('div', { class: 'q-model' }, h('div', { class: 'q-sub' }, 'Model answer'), KIT.html(q.model || ''));
    KIT.fig.hydrate(modelBox);
    into.appendChild(modelBox);
    if (q.ref) into.appendChild(h('div', { class: 'q-ref' }, chip(q.ref)));
    update();
  }

  /* ================= public API ================= */

  function render(q, opts) { return build(q, opts).el; }

  /** A numbered list of questions. Interactive sets keep a running tally; static sets just list answers. */
  function renderSet(items, opts) {
    opts = opts || {};
    var isStatic = opts.static !== undefined ? !!opts.static : !!KIT.env.static;
    var wrap = h('div', { class: 'quiz-set', 'data-source': opts.source || null });
    if (!items || !items.length) {
      wrap.appendChild(h('p', { class: 'muted' }, 'No questions are available here yet.'));
      return wrap;
    }
    var graded = items.filter(function (q) { return q.type !== 'essay'; }).length;
    var tally = {};                         // id -> true | false for the current attempt
    var summary = h('div', { class: 'quiz-summary', role: 'status', 'aria-live': 'polite' });
    var built = [];
    function update() {
      var done = 0, right = 0;
      Object.keys(tally).forEach(function (id) { done++; if (tally[id]) right++; });
      if (!graded) { summary.textContent = ''; return; }
      summary.textContent = done === 0 ? graded + ' question' + (graded === 1 ? '' : 's') + ' — answer, then press Check.'
        : done < graded ? 'Checked ' + done + ' of ' + graded + ' · ' + right + ' correct so far'
        : 'Finished: ' + right + ' of ' + graded + ' correct' + (right === graded ? ' — solid.' : ' — re-read the notes behind the ones you missed.');
    }
    if (!isStatic) wrap.appendChild(summary);
    items.forEach(function (q, i) {
      var b = build(q, {
        static: isStatic, index: i + 1,
        onResult: function (item, ok) { if (ok === null) delete tally[item.id]; else tally[item.id] = ok; update(); if (opts.onResult) opts.onResult(item, ok); }
      });
      built.push(b);
      wrap.appendChild(b.el);
    });
    if (!isStatic && graded) {
      var again = h('button', { class: 'btn ghost', type: 'button' }, 'Reset this set');
      again.addEventListener('click', function () { built.forEach(function (b) { b.reset(); }); tally = {}; update(); });
      wrap.appendChild(h('div', { class: 'btn-row' }, again));
    }
    update();
    return wrap;
  }

  KIT.ui.quiz = { render: render, renderSet: renderSet, control: control, gradeItem: gradeItem, record: record, results: results };
})();
