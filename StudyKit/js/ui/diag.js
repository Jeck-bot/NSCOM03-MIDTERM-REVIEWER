/* Diagnostic quiz (#/diag). Owner: UI.
   KIT.ui.diag.score(items, responses) is PURE: responses = { [itemId]: { answer, sure } }.
   correct + sure = 1, correct + unsure = 0.5, wrong or blank = 0; essays are excluded; topics ranked weakest-first.
   The page saves { ts, perTopic, order } under KIT.store key 'diag.result'. */
(function () {
  'use strict';
  var h = KIT.h;
  var hasOwn = Object.prototype.hasOwnProperty;
  var KEY = 'diag.result';
  var LETTERS = 'ABCDEFGH';

  function topicRank(id) { var i = KIT.TOPIC_IDS.indexOf(id); return i < 0 ? 99 : i; }

  /* ================= pure logic ================= */

  function isCorrect(q, answer) {
    try { return KIT.grade.question(q, answer) === true; }
    catch (e) { KIT.report(e, 'diag.score:' + (q && q.id)); return false; }
  }

  /** → { perTopic: { [topic]: { score, max, pct } }, order: [topic ids, weakest first] }  (pct is 0–100). */
  function score(items, responses) {
    var acc = {};
    (items || []).forEach(function (q) {
      if (!q || q.type === 'essay') return;
      var a = acc[q.topic] || (acc[q.topic] = { score: 0, max: 0 });
      var r = responses && hasOwn.call(responses, q.id) && responses[q.id] ? responses[q.id] : {};
      a.max += 1;
      if (isCorrect(q, r.answer)) a.score += r.sure === false ? 0.5 : 1;
    });
    var perTopic = {};
    Object.keys(acc).forEach(function (t) {
      perTopic[t] = { score: acc[t].score, max: acc[t].max, pct: acc[t].score / acc[t].max * 100 };
    });
    var order = Object.keys(perTopic).sort(function (a, b) {
      return (perTopic[a].pct - perTopic[b].pct) || (topicRank(a) - topicRank(b)) || (a < b ? -1 : a > b ? 1 : 0);
    });
    return { perTopic: perTopic, order: order };
  }

  /** Non-essay items grouped in lecture order; with a quota, keep the first quota[topic] items of each topic. */
  function byQuota(items, quota) {
    var pool = (items || []).filter(function (q) { return q && q.type !== 'essay'; })
      .map(function (q, i) { return { q: q, i: i }; })
      .sort(function (a, b) { return (topicRank(a.q.topic) - topicRank(b.q.topic)) || (a.i - b.i); })
      .map(function (x) { return x.q; });
    if (!quota) return pool;
    var used = {};
    return pool.filter(function (q) {
      used[q.topic] = (used[q.topic] || 0) + 1;
      return used[q.topic] <= (hasOwn.call(quota, q.topic) ? quota[q.topic] : 0);
    });
  }

  /** The diagnostic's questions: the assembled exam items when present, else the pool:'diag' bank items by quota. */
  function items() {
    var ex = KIT.exams.get('diag');
    var sec = ex && ex.sections && ex.sections[0];
    var listed = sec && Array.isArray(sec.items)
      ? sec.items.map(function (id) { return KIT.bank.get(id); }).filter(function (q) { return q && q.type !== 'essay'; })
      : [];
    if (listed.length) return listed;
    return byQuota(KIT.bank.query({ pool: 'diag' }), sec && sec.quota);
  }

  /** Weak below 50%, shaky below 80%, solid from 80% — every verdict carries an icon and a word. */
  function verdict(pct) {
    if (pct < 50) return { key: 'weak', label: '⚠ Weak spot' };
    if (pct < 80) return { key: 'shaky', label: '◐ Shaky' };
    return { key: 'solid', label: '✓ Solid' };
  }

  /** Plain-text version of what the student answered, for the review list. */
  function describeResponse(q, resp) {
    var none = '(no answer)';
    switch (q.type) {
      case 'mcq': return typeof resp === 'number' ? LETTERS.charAt(resp) : none;
      case 'multi': return Array.isArray(resp) && resp.length ? resp.slice().sort().map(function (i) { return LETTERS.charAt(i); }).join(', ') : none;
      case 'tf': return resp === true ? 'True' : resp === false ? 'False' : none;
      default: return resp === undefined || resp === null || !String(resp).trim() ? none : String(resp).trim();
    }
  }

  /* ================= page ================= */

  function fmtScore(n) { return String(Math.round(n * 10) / 10); }
  function topicTitle(id) { var t = KIT.getTopic(id), m = KIT.META[id]; return (t && t.title) || (m && m.title) || id; }

  function sureToggle(q, sure) {
    var name = 'sure-' + q.id;
    var yes = h('input', { type: 'radio', name: name, value: 'sure', checked: true });
    var no = h('input', { type: 'radio', name: name, value: 'unsure' });
    yes.addEventListener('change', function () { sure[q.id] = true; });
    no.addEventListener('change', function () { sure[q.id] = false; });
    return h('div', { class: 'sure', role: 'radiogroup', 'aria-label': 'How sure are you of this answer?' },
      h('span', { class: 'sure-label' }, 'How sure are you?'),
      h('label', { class: 'sure-opt' }, yes, 'Sure'),
      h('label', { class: 'sure-opt' }, no, 'Unsure'));
  }

  function rankRow(i, id, r) {
    var v = verdict(r.pct);
    return h('li', { class: 'rank-row ' + v.key },
      h('span', { class: 'rank-no', 'aria-label': 'Rank ' + (i + 1) }, String(i + 1)),
      h('div', { class: 'rank-main' },
        h('a', { class: 'rank-name', href: '#/topic/' + id }, h('span', { class: 'deck' }, KIT.ui.deckLabel(id)), ' ' + topicTitle(id)),
        h('div', { class: 'meter lg', role: 'img', 'aria-label': Math.round(r.pct) + ' percent' }, h('span', { style: { width: Math.max(2, Math.round(r.pct)) + '%' } }))),
      h('div', { class: 'rank-score' }, h('b', null, Math.round(r.pct) + '%'), h('span', { class: 'small muted' }, fmtScore(r.score) + ' / ' + r.max)),
      h('span', { class: 'verdict ' + v.key }, v.label));
  }

  /** The ranked topic list (weakest first, with meters and links) — shared by the results view and the Home page. */
  function rankList(saved) {
    var shown = (saved.order || []).filter(function (t) { return saved.perTopic && saved.perTopic[t]; });
    return h('ol', { class: 'rank-list' }, shown.map(function (t, i) { return rankRow(i, t, saved.perTopic[t]); }));
  }

  function reviewList(its, responses) {
    var wrong = 0;
    var rows = its.map(function (q, i) {
      var r = responses[q.id] || {};
      var ok = isCorrect(q, r.answer);
      if (!ok) wrong++;
      var status = ok ? (r.sure === false ? '✓ Correct, but you marked it unsure (half credit)' : '✓ Correct')
        : '✗ Not correct';
      return h('div', { class: 'diag-review-item' },
        h('div', { class: 'diag-review-status ' + (ok ? 'ok' : 'bad') }, status,
          ok ? null : h('span', null, ' — you answered: ', h('code', null, describeResponse(q, r.answer)))),
        KIT.ui.quiz.render(q, { static: true, index: i + 1 }));
    });
    return h('details', { class: 'diag-review' }, h('summary', null, 'Review every answer (' + wrong + ' not correct)'), rows);
  }

  function showResults(wrap, saved, review, restart) {
    KIT.clear(wrap);
    var ids = Object.keys(saved.perTopic || {});
    var total = ids.reduce(function (a, t) { return { s: a.s + saved.perTopic[t].score, m: a.m + saved.perTopic[t].max }; }, { s: 0, m: 0 });
    var order = KIT.ui.plan.order(saved);
    wrap.appendChild(h('h1', null, 'Your diagnostic results'));
    wrap.appendChild(h('p', { class: 'muted' }, 'Taken ' + new Date(saved.ts).toLocaleString() + '. Overall ' + fmtScore(total.s) + ' / ' + total.m +
      (total.m ? ' (' + Math.round(total.s / total.m * 100) + '%)' : '') + '. A correct answer marked “unsure” counts half — a lucky guess is still a weak spot.'));
    wrap.appendChild(h('h2', null, 'Weakest topic first'));
    wrap.appendChild(rankList(saved));
    var untested = KIT.TOPIC_IDS.filter(function (t) { return !saved.perTopic[t]; });
    if (untested.length) wrap.appendChild(h('p', { class: 'small muted' }, 'Not covered by this diagnostic: ' + untested.map(function (t) { return KIT.ui.deckLabel(t); }).join(', ') + ' — they follow in lecture order.'));
    wrap.appendChild(h('h2', null, 'Recommended study order'));
    var seq = h('ol', { class: 'study-order' }, order.map(function (t, i) {
      return h('li', null, h('a', { href: '#/topic/' + t }, KIT.ui.deckLabel(t) + ' · ' + topicTitle(t)), i === 0 ? h('span', { class: 'chip' }, 'start here') : null);
    }));
    wrap.appendChild(seq);
    wrap.appendChild(h('p', { class: 'small muted' }, 'For each topic: intuition, then the notes, then the worked examples, then the quick check. The study plan on Home follows this order.'));
    wrap.appendChild(h('div', { class: 'btn-row' },
      h('a', { class: 'btn primary', href: '#/home' }, 'See my study plan'),
      h('a', { class: 'btn', href: '#/topic/' + order[0] }, 'Start with ' + KIT.ui.deckLabel(order[0])),
      h('button', { class: 'btn ghost', type: 'button', onclick: restart }, 'Retake the diagnostic')));
    if (review) wrap.appendChild(reviewList(review.items, review.responses));
  }

  function showQuiz(wrap, ex, its, finished) {
    KIT.clear(wrap);
    var ctls = {}, sure = {};
    wrap.appendChild(h('h1', null, ex.title));
    if (ex.instructions) wrap.appendChild(h('p', { class: 'muted' }, ex.instructions));
    wrap.appendChild(h('p', { class: 'diag-meta' }, its.length + ' questions · about ' + ex.minutes + ' minutes · from memory, no notes. Nothing is graded until you press Finish.'));
    var count = h('span', { class: 'diag-count', role: 'status', 'aria-live': 'polite' });
    function update() {
      var n = its.filter(function (q) { return !ctls[q.id].isBlank(); }).length;
      count.textContent = n + ' of ' + its.length + ' answered';
    }
    its.forEach(function (q, i) {
      sure[q.id] = true;
      ctls[q.id] = KIT.ui.quiz.control(q, { onChange: update });
      wrap.appendChild(h('div', { class: 'q diag-q', 'data-id': q.id },
        h('div', { class: 'q-head' }, h('span', { class: 'q-num' }, (i + 1) + '.'), h('span', { class: 'q-type' }, { mcq: 'Multiple choice', multi: 'Select all that apply', tf: 'True or false', id: 'Identification', num: 'Solve' }[q.type] || q.type)),
        h('div', { class: 'q-text' }, KIT.html(q.q)),
        ctls[q.id].el,
        sureToggle(q, sure)));
    });
    var finish = h('button', { class: 'btn primary', type: 'button' }, 'Finish and rank my topics');
    finish.addEventListener('click', function () {
      var responses = {};
      its.forEach(function (q) { responses[q.id] = { answer: ctls[q.id].get(), sure: sure[q.id] }; });
      var res = score(its, responses);
      finished({ ts: Date.now(), perTopic: res.perTopic, order: res.order }, { items: its, responses: responses });
    });
    wrap.appendChild(h('div', { class: 'diag-bar' }, count, finish));
    update();
  }

  KIT.page('diag', function (main, route) {
    var ex = KIT.exams.get('diag') || { title: 'Diagnostic — find your weak spots', minutes: 15, instructions: '' };
    var its = items();
    var wrap = h('div', { class: 'diag' });
    main.appendChild(wrap);

    function start() {
      showQuiz(wrap, ex, its, function (saved, review) {
        KIT.store.set(KEY, saved);
        showResults(wrap, saved, review, start);
        if (window.scrollTo) window.scrollTo(0, 0);
      });
      if (window.scrollTo) window.scrollTo(0, 0);
    }

    if (!its.length) {
      wrap.appendChild(h('h1', null, ex.title));
      wrap.appendChild(h('div', { class: 'callout' }, h('div', { class: 'callout-label' }, 'Being written'),
        'The diagnostic questions are still being assembled. Meanwhile, start with the topics in lecture order from the sidebar.'));
      return;
    }
    if (KIT.env.static) {
      wrap.appendChild(h('h1', null, ex.title));
      wrap.appendChild(h('p', { class: 'muted' }, 'Static view: the answers are shown. ' + (ex.instructions || '')));
      wrap.appendChild(KIT.ui.quiz.renderSet(its, { static: true, source: 'diag' }));
      return;
    }
    var saved = KIT.store.get(KEY, null);
    var valid = saved && typeof saved === 'object' && saved.perTopic && Array.isArray(saved.order) && saved.order.length;
    if (valid && !route.query.retake) showResults(wrap, saved, null, start);
    else start();
  });

  KIT.ui.diag = { score: score, byQuota: byQuota, items: items, verdict: verdict, describeResponse: describeResponse, rankList: rankList, KEY: KEY };
})();
