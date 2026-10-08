/* Study plans for 1, 2 or 3 days left. Owner: UI.
   KIT.data.plans = { '1': [day], '2': [day, day], '3': [day, day, day] }; a day is { day, title, tasks }.
   A task is either fixed ({ id, text, route, min, hint, exam? }) or a topic slot ({ id, rank, step }): rank 0 is the
   WEAKEST topic from the diagnostic (lecture order when there is no result), so each topic is studied
   intuition -> notes -> worked examples -> quick check, weakest first.
   KIT.ui.plan holds the pure helpers the Home page uses: order, resolve, dayIndex, progress, examReady. */
(function () {
  'use strict';
  var hasOwn = Object.prototype.hasOwnProperty;

  /* ---------- per-topic steps ---------- */
  var STEP = {
    intuition: { text: 'Intuition — {topic}', min: 10, hint: 'Open the visual and answer the predict questions before you read.' },
    notes: { text: 'Notes — {topic}', min: 30, hint: 'Read every section; the slide refs, traps and slide errors are what the exam punishes.' },
    skim: { text: 'Skim the notes — {topic}', min: 15, hint: 'Headings, formulas and traps only.' },
    examples: { text: 'Worked examples — {topic}', min: 20, hint: 'Cover each solution, solve it yourself, then compare.' },
    quick: { text: 'Quick check — {topic}', min: 10, hint: 'Aim for 7 of 8; re-read the notes for anything you missed.' },
    again: { text: 'Second pass — {topic}', min: 25, hint: 'Redo the worked examples cold, then retake the quick check.' },
    fix: { text: 'Fix-up — {topic}', min: 20, hint: 'Re-read the traps and slide errors, then retake the quick check.' }
  };
  var FULL = ['intuition', 'notes', 'examples', 'quick'];
  var SKIM = ['skim', 'quick'];

  function slot(rank, steps) {
    return steps.map(function (s) { return { id: 'r' + rank + '.' + s, rank: rank, step: s }; });
  }
  function fixed(id, text, route, min, hint, exam) {
    var t = { id: id, text: text, route: route, min: min, hint: hint };
    if (exam) t.exam = exam;
    return t;
  }
  function join() { return Array.prototype.concat.apply([], arguments); }

  /* ---------- shared fixed tasks ---------- */
  function diag() {
    return fixed('diag', 'Take the diagnostic — it ranks the five topics, weakest first', '#/diag', 15,
      'Answer quickly and mark each answer sure or unsure. The ranking sets the order of everything below.');
  }
  function cheat(id, text, hint) { return fixed(id, text, '#/cheatsheet', id === 'cheat' ? 15 : 10, hint); }
  function drills() {
    return fixed('drills', 'Drawing drills on paper — line codes, scrambling, decoding', '#/print/drills', 40,
      'The exam leans on drawing: draw each bit stream by hand, then check the key at the back.');
  }
  function essays() {
    return fixed('essays', 'Essay practice on paper — draw and/or explain, then mark with the models', '#/print/essays', 40,
      'Essays may be answered with a drawing, an explanation or both: do two or three, then tick the rubric points you covered.');
  }
  function mockA() {
    return fixed('mockA', 'Mock Exam A on paper — timed, 120 min', '#/print/exam/A', 120,
      'Print it, set a 120-minute timer: no notes, no calculator, pen only. Draw on the grids and axes; answer essays by drawing and/or explaining.', 'A');
  }
  function keyA() {
    return fixed('keyA', 'Mark Mock A with the answer key', '#/print/exam/A/key', 30,
      'List every miss with its topic; the worked steps show where the method broke.');
  }
  function mockB() {
    return fixed('mockB', 'Mock Exam B on paper — timed, 120 min', '#/print/exam/B', 120,
      'A fresh form with the same blueprint and different numbers. Same rules as Mock A.', 'B');
  }
  function keyB() {
    return fixed('keyB', 'Mark Mock B with the answer key', '#/print/exam/B/key', 30,
      'Compare with Mock A: a mistake you made twice is the one to fix tonight.');
  }
  function recall() {
    return fixed('recall', 'Recall drill — fill the blanks from memory', '#/print/recall', 20,
      'The cheat sheet with its key terms blanked out; check yourself on the last page.');
  }

  /* ---------- plans ---------- */
  var plans = {
    '1': [
      { day: 1, title: 'Crash course — one day to the exam', tasks: join(
        [diag()], slot(0, FULL), slot(1, FULL), slot(2, SKIM), slot(3, SKIM), slot(4, SKIM),
        [cheat('cheat', 'Read the cheat sheet once, then print it', 'Formula cards with real, color-coded equations and the key facts of Modules 1–4, one lecture per page. Print it so you can mark it up.'),
          drills(), mockA(), keyA(), recall(),
          cheat('cheat2', 'Last look at the cheat sheet', 'Then stop. Sleep is worth more than one more hour of cramming.')]) }
    ],
    '2': [
      { day: 1, title: 'Day 1 — diagnose, then learn every topic (weakest first)', tasks: join(
        [diag()], slot(0, FULL), slot(1, FULL), slot(2, FULL), slot(3, SKIM), slot(4, SKIM)) },
      { day: 2, title: 'Day 2 — simulate the exam, then fix what broke', tasks: join(
        [cheat('cheat', 'Read the cheat sheet once, then print it', 'Formula cards with real, color-coded equations and the key facts of Modules 1–4, one lecture per page. Print it so you can mark it up.'),
          drills(), mockA(), keyA(), essays()],
        slot(0, ['fix']), slot(1, ['fix']),
        [recall(), cheat('cheat2', 'Last look at the cheat sheet', 'Then stop. Sleep is worth more than one more hour of cramming.')]) }
    ],
    '3': [
      { day: 1, title: 'Day 1 — diagnose, then the weakest topics', tasks: join(
        [diag()], slot(0, FULL), slot(1, FULL), slot(2, ['intuition', 'notes'])) },
      { day: 2, title: 'Day 2 — finish the topics, then Mock A', tasks: join(
        slot(2, ['examples', 'quick']), slot(3, FULL), slot(4, FULL),
        [cheat('cheat', 'Read the cheat sheet once, then print it', 'Formula cards with real, color-coded equations and the key facts of Modules 1–4, one lecture per page. Print it so you can mark it up.'),
          drills(), mockA()]) },
      { day: 3, title: 'Day 3 — review, second pass, Mock B', tasks: join(
        [keyA(), essays()], slot(0, ['again']), slot(1, ['again']), slot(2, ['again']),
        [mockB(), keyB(), recall(),
          cheat('cheat2', 'Last look at the cheat sheet', 'Then stop. Sleep is worth more than one more hour of cramming.')]) }
    ]
  };
  KIT.data.plans = plans;

  /* ---------- pure helpers ---------- */
  function topicLabel(id) {
    var t = KIT.getTopic(id), meta = KIT.META[id];
    var title = (t && t.title) || (meta && meta.title) || id;
    return (KIT.ui.deckLabel ? KIT.ui.deckLabel(id) : id) + ' · ' + title;
  }

  /** Topic ids weakest-first from a saved diagnostic result ({ order: [...] }); untested or unknown topics follow in lecture order. */
  function order(diagResult) {
    var out = [];
    var saved = diagResult && Array.isArray(diagResult.order) ? diagResult.order : [];
    saved.forEach(function (id) { if (KIT.TOPIC_IDS.indexOf(id) >= 0 && out.indexOf(id) < 0) out.push(id); });
    KIT.TOPIC_IDS.forEach(function (id) { if (out.indexOf(id) < 0) out.push(id); });
    return out;
  }

  /** True once the exam has at least one assembled item (draft forms are "being built"). */
  function examReady(id) {
    var x = KIT.exams.get(id);
    return !!(x && (x.sections || []).some(function (s) { return s.items && s.items.length > 0; }));
  }

  function resolveTask(planKey, t, topics) {
    var topic = t.rank !== undefined ? (topics[t.rank] || null) : null;
    var out = { id: t.id, key: planKey + ':' + t.id + (topic ? ':' + topic : ''), topic: topic, step: t.step || null, exam: t.exam || null };
    if (topic) {
      var st = STEP[t.step];
      out.text = st.text.replace('{topic}', function () { return topicLabel(topic); });
      out.hint = st.hint;
      out.route = '#/topic/' + topic;
      out.min = t.min || st.min;
    } else {
      out.text = t.text; out.hint = t.hint || ''; out.route = t.route; out.min = t.min;
    }
    out.ready = t.exam ? examReady(t.exam) : true;
    return out;
  }

  /** A plan with its topic slots filled in from the diagnostic: [{ day, title, tasks:[{ key, text, hint, route, min, topic, step, exam, ready }] }]. */
  function resolve(planKey, diagResult) {
    var plan = hasOwn.call(plans, planKey) ? plans[planKey] : null;
    if (!plan) return [];
    var topics = order(diagResult);
    return plan.map(function (d) {
      return { day: d.day, title: d.title, tasks: d.tasks.map(function (t) { return resolveTask(String(planKey), t, topics); }) };
    });
  }

  /** Which plan day is "today": day 1 on the start date, +1 per calendar day, clamped to 1..n. Pure given its arguments. */
  function dayIndex(startTs, nowTs, n) {
    var now = nowTs === undefined ? Date.now() : nowTs;
    if (typeof startTs !== 'number' || typeof now !== 'number' || !isFinite(startTs) || !isFinite(now) || !(n >= 1)) return 1;
    var a = new Date(startTs); a.setHours(0, 0, 0, 0);
    var b = new Date(now); b.setHours(0, 0, 0, 0);
    var days = Math.round((b.getTime() - a.getTime()) / 86400000);
    return Math.max(1, Math.min(n, days + 1));
  }

  /** Finished-task counts for resolved days: { done, total, days: [{ done, total }] }. */
  function progress(days, done) {
    var map = done && typeof done === 'object' ? done : {};
    var total = 0, count = 0;
    var per = days.map(function (d) {
      var c = d.tasks.filter(function (t) { return map[t.key] === true; }).length;
      total += d.tasks.length; count += c;
      return { done: c, total: d.tasks.length };
    });
    return { done: count, total: total, days: per };
  }

  KIT.ui.plan = { order: order, resolve: resolve, dayIndex: dayIndex, progress: progress, examReady: examReady };
})();
