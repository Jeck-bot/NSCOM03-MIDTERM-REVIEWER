/* Home page. Owner: Lead in Phase 0; extended by UI in Phase 1: study plan with a daily checklist,
   "Your weak spots" from the diagnostic, and quick links to the printable PDFs.
   Store keys: 'plan.days' (1|2|3), 'plan.start' (ms), 'plan.done' ({ taskKey: true }), 'diag.result' (from #/diag). */
(function () {
  'use strict';
  var h = KIT.h;
  var K_DAYS = 'plan.days', K_START = 'plan.start', K_DONE = 'plan.done';
  var BLURB = {
    1: 'One long day: diagnose, learn the weakest topics fully and skim the rest, then Mock A on paper.',
    2: 'Day 1 learns every topic, weakest first. Day 2 is Mock A, the key, fix-ups and the recall drill.',
    3: 'Learn the weakest topics, finish the rest and sit Mock A, then review it, do a spaced second pass and sit Mock B.'
  };

  function diagResult() {
    var r = KIT.store.get(KIT.ui.diag.KEY, null);
    return r && typeof r === 'object' && r.perTopic && Array.isArray(r.order) && r.order.length ? r : null;
  }
  function doneMap() {
    var d = KIT.store.get(K_DONE, {});
    return d && typeof d === 'object' && !Array.isArray(d) ? d : {};
  }
  function timeLeft(min) { return min >= 90 ? (Math.round(min / 6) / 10) + ' h' : min + ' min'; }

  /* ---------- study plan ---------- */
  function planCard(diag) {
    var card = h('section', { class: 'card plan-card' }, h('h2', null, 'Your study plan'));
    var body = h('div');
    card.appendChild(body);
    var picked = null;                                  // day tab chosen by the student; null = today

    function days() { return Number(KIT.store.get(K_DAYS, 0)) || 0; }
    function choose(n) {
      if (days() !== n || !KIT.store.get(K_START, null)) KIT.store.set(K_START, Date.now());
      KIT.store.set(K_DAYS, n);
      picked = null;
      draw();
    }

    function chooser(current) {
      var row = h('div', { class: 'plan-pick', role: 'group', 'aria-label': 'Days until the exam' }, h('span', { class: 'plan-pick-label' }, 'Days until the exam:'));
      [1, 2, 3].forEach(function (n) {
        var b = h('button', { class: 'btn', type: 'button', 'aria-pressed': current === n ? 'true' : 'false' }, n + (n === 1 ? ' day' : ' days'));
        b.addEventListener('click', function () { choose(n); });
        row.appendChild(b);
      });
      return row;
    }

    function draw() {
      KIT.clear(body);
      var n = days();
      body.appendChild(chooser(n));
      if (!n) {
        body.appendChild(h('p', { class: 'muted plan-prompt' }, 'Pick how many days you have and today’s checklist appears here. Every plan runs: diagnostic, then the weakest topics first ' +
          '(intuition, notes, worked examples, quick check), the cheat sheet, the drawing drills, Mock A on paper (timed, 120 minutes), the answer key and the recall drill.'));
        return;
      }
      var plan = KIT.ui.plan.resolve(String(n), diag);
      var done = doneMap();
      var today = KIT.ui.plan.dayIndex(KIT.store.get(K_START, null), Date.now(), plan.length);
      var sel = picked || today;
      body.appendChild(h('p', { class: 'small muted' }, BLURB[n] + (diag ? ' Topics follow your diagnostic, weakest first.'
        : ' Take the diagnostic so the topics are ordered weakest first; until then they run in lecture order.')));

      var summary = h('div', { class: 'plan-summary', role: 'status', 'aria-live': 'polite' });
      var tabEls = [];
      if (plan.length > 1) {
        var tabs = h('div', { class: 'plan-tabs', role: 'group', 'aria-label': 'Plan days' });
        plan.forEach(function (d, i) {
          var t = h('button', { class: 'plan-tab', type: 'button', 'aria-pressed': d.day === sel ? 'true' : 'false' });
          t.addEventListener('click', function () { picked = d.day; draw(); });
          tabEls.push(t);
          tabs.appendChild(t);
        });
        body.appendChild(tabs);
      }
      var day = plan[sel - 1];
      body.appendChild(h('h3', { class: 'plan-day-title' }, day.title, sel === today ? h('span', { class: 'chip today' }, 'today') : null));
      body.appendChild(summary);

      function refresh() {
        var p = KIT.ui.plan.progress(plan, done);
        var left = day.tasks.reduce(function (a, t) { return a + (done[t.key] === true ? 0 : t.min); }, 0);
        summary.textContent = p.days[sel - 1].done + ' of ' + p.days[sel - 1].total + ' done' + (left ? ' · about ' + timeLeft(left) + ' left' : ' · day complete') +
          (plan.length > 1 ? ' · whole plan ' + p.done + ' of ' + p.total : '');
        tabEls.forEach(function (t, i) {
          t.textContent = 'Day ' + (i + 1) + (i + 1 === today ? ' · today' : '') + ' · ' + p.days[i].done + '/' + p.days[i].total;
        });
      }

      var list = h('ul', { class: 'plan-list' });
      day.tasks.forEach(function (t) {
        var cb = h('input', { type: 'checkbox' });
        cb.checked = done[t.key] === true;
        var li = h('li', { class: 'plan-task' + (cb.checked ? ' done' : '') });
        cb.addEventListener('change', function () {
          done = doneMap();
          if (cb.checked) done[t.key] = true; else delete done[t.key];
          KIT.store.set(K_DONE, done);
          li.classList.toggle('done', cb.checked);
          refresh();
        });
        li.appendChild(h('label', { class: 'plan-main' }, cb,
          h('span', { class: 'plan-body' },
            h('span', { class: 'plan-txt' }, t.text, t.exam && !t.ready ? h('span', { class: 'badge pending' }, 'being built') : null),
            t.hint ? h('span', { class: 'plan-hint' }, t.hint) : null)));
        li.appendChild(h('span', { class: 'plan-min' }, '~' + t.min + ' min'));
        li.appendChild(h('a', { class: 'btn ghost plan-open', href: t.route }, 'Open →'));
        list.appendChild(li);
      });
      body.appendChild(list);
      refresh();
    }
    draw();
    return card;
  }

  /* ---------- weak spots ---------- */
  function weakCard(diag) {
    var card = h('section', { class: 'card weak-card' }, h('h2', null, 'Your weak spots'));
    if (!diag) {
      var ex = KIT.exams.get('diag');
      card.appendChild(h('p', { class: 'muted' }, 'You have not taken the diagnostic yet. It ranks the five topics weakest-first, and the study plan then puts the weakest ones first.'));
      card.appendChild(h('a', { class: 'btn primary', href: '#/diag' }, 'Take the ' + (ex ? ex.minutes + '-minute ' : '') + 'diagnostic'));
      return card;
    }
    card.appendChild(KIT.ui.diag.rankList(diag));
    card.appendChild(h('p', { class: 'small muted' }, 'Taken ' + new Date(diag.ts).toLocaleDateString() + '. ',
      h('a', { href: '#/diag?retake=1' }, 'Retake'), ' · ', h('a', { href: '#/diag' }, 'see the full results')));
    return card;
  }

  /* ---------- printable documents ---------- */
  function pdfCard() {
    var card = h('section', { class: 'card pdf-card' }, h('h2', null, 'Printable PDFs'));
    card.appendChild(h('p', { class: 'muted small' }, 'The PDFs are in the StudyKit/pdf folder. Print on Letter / short bond. “Print view” opens the same document here; press Ctrl+P to print or save it.'));
    card.appendChild(h('ul', { class: 'pdf-list' }, KIT.print.docs().map(function (d) {
      return h('li', { class: 'pdf-row' },
        h('span', { class: 'pdf-name' }, d.title, d.ready ? null : h('span', { class: 'badge pending' }, 'being built')),
        h('a', { class: 'btn', href: 'pdf/' + d.file, target: '_blank' }, 'PDF'),
        h('a', { class: 'btn ghost', href: '#/' + d.route }, 'Print view'));
    })));
    return card;
  }

  KIT.page('home', function (main) {
    var diag = diagResult();
    var ex = KIT.exams.get('diag');
    var first = KIT.ui.plan.order(diag)[0];
    main.appendChild(h('div', { class: 'hero' },
      h('h1', null, 'NSCOM03 Midterm Study Kit'),
      h('p', { class: 'sub' }, 'Everything from Modules 1–4 (the midterm coverage) — rebuilt for studying: ' +
        'intuition first, then the notes, then practice until it sticks.'),
      h('div', { class: 'btn-row' },
        h('a', { class: 'btn primary', href: '#/diag' }, (diag ? '① Retake the ' : '① Take the ') + (ex ? ex.minutes + '-minute ' : '') + 'diagnostic'),
        h('a', { class: 'btn', href: '#/cheatsheet' }, 'Open the cheat sheet'),
        h('a', { class: 'btn', href: '#/topic/' + first }, diag ? 'Start with ' + KIT.ui.deckLabel(first) + ' (weakest) →' : 'Start with L01 →'))));

    // What the teacher said about the exam: shapes the mocks, the drills and the study plan.
    main.appendChild(h('div', { class: 'callout key exam-focus' }, h('div', { class: 'callout-label' }, 'Exam focus'),
      h('p', null, h('b', null, 'No calculator'), ' and only one or two problem-solving items — so spend most of your time on the concepts (MCQ and identification), ',
        h('b', null, 'line encodings'), ' (drawing them by hand) and ', h('b', null, 'essays'), ', which you may answer with a drawing, an explanation, or both.'),
      h('p', { class: 'small' }, 'Train it: ', h('a', { href: '#/print/drills' }, 'drawing drills'), ' (line codes, scrambling, decoding) · ',
        h('a', { href: '#/practice?gen=l03a.draw' }, 'draw line codes online'), ' · ', h('a', { href: '#/practice?gen=l04.sketch' }, 'draw ASK / FSK / PSK'), ' · ',
        h('a', { href: '#/practice?gen=l02.sketch' }, 'draw sine waves'), ' · ', h('a', { href: '#/exam' }, 'mock exams'), ' (shaped like the real exam).')));
    main.appendChild(planCard(diag));
    main.appendChild(h('div', { class: 'grid2 home-pair' }, weakCard(diag), pdfCard()));

    main.appendChild(h('h2', null, 'How to use this kit'));
    main.appendChild(h('ol', { class: 'steps-howto' },
      h('li', null, h('b', null, 'Diagnose.'), ' The diagnostic ranks your weakest topics.'),
      h('li', null, h('b', null, 'Build intuition.'), ' Each topic opens with a visual and a "predict" question.'),
      h('li', null, h('b', null, 'Read the notes.'), ' Slide refs on every fact; slide errors are flagged.'),
      h('li', null, h('b', null, 'Practice.'), ' Worked examples, then fresh problems with full solutions.'),
      h('li', null, h('b', null, 'Simulate.'), ' Take a mock exam on paper, timed, then review the key.'),
      h('li', null, h('b', null, 'Review spaced.'), ' Flashcards and the recall drill on the last day.')));

    main.appendChild(h('h2', null, 'Topics'));
    var grid = h('div', { class: 'grid3' });
    var progress = KIT.store.get('progress.topics', {});
    KIT.TOPIC_IDS.forEach(function (id) {
      var t = KIT.getTopic(id), meta = KIT.META[id];
      var read = progress[id] && progress[id].read;
      grid.appendChild(h('a', { class: 'card topic-card' + (t ? '' : ' pending-card'), href: '#/topic/' + id },
        h('div', { class: 'deck' }, KIT.ui.deckLabel(id) + (t ? '' : ' · being written')),
        h('div', { class: 'ttl' }, t ? t.title : meta.title),
        t ? h('div', { class: 'bl' }, t.blurb) : null,
        h('div', { class: 'meter', title: read ? 'Marked as read' : 'Not yet marked as read' }, h('span', { style: { width: read ? '100%' : '0%' } }))));
    });
    main.appendChild(grid);
  });
})();
