'use strict';
// Study plans (content/plan.js): data shape, topic ordering from the diagnostic, task keys, "today" and progress.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadKit } = require('./helpers/load.js');
const KIT = loadKit();

const P = () => KIT.ui.plan;
const LECTURE = ['l01', 'l02', 'l03a', 'l03b', 'l04'];
const KEYS = ['1', '2', '3'];
const tasksOf = (key, diag) => P().resolve(key, diag).flatMap((d) => d.tasks);

/* ---------- order() ---------- */

test('order(): lecture order when there is no diagnostic result', () => {
  assert.deepEqual(KIT.TOPIC_IDS, LECTURE);
  assert.deepEqual(P().order(null), LECTURE);
  assert.deepEqual(P().order(undefined), LECTURE);
  assert.deepEqual(P().order({}), LECTURE);
  assert.notEqual(P().order(null), KIT.TOPIC_IDS, 'must return a copy, not the shared array');
});

test('order(): weakest first from the saved result, then untested topics in lecture order', () => {
  const saved = { ts: 1, perTopic: {}, order: ['l03a', 'l02'] };
  assert.deepEqual(P().order(saved), ['l03a', 'l02', 'l01', 'l03b', 'l04']);
  assert.deepEqual(P().order({ order: ['l04', 'l03b', 'l03a', 'l02', 'l01'] }), ['l04', 'l03b', 'l03a', 'l02', 'l01']);
});

test('order(): ignores unknown and repeated ids and tolerates malformed saved data', () => {
  assert.deepEqual(P().order({ order: ['l04', 'zzz', 'l04', 'l01'] }), ['l04', 'l01', 'l02', 'l03a', 'l03b']);
  assert.deepEqual(P().order({ order: 'l04' }), LECTURE);
  assert.deepEqual(P().order('junk'), LECTURE);
  assert.deepEqual(P().order(42), LECTURE);
});

/* ---------- data ---------- */

test('plans exist for 1, 2 and 3 days, each day titled with a non-empty checklist', () => {
  const plans = KIT.data.plans;
  assert.deepEqual(Object.keys(plans).sort(), KEYS);
  for (const k of KEYS) {
    assert.equal(plans[k].length, Number(k), `plan ${k} must have ${k} day(s)`);
    plans[k].forEach((d, i) => {
      assert.equal(d.day, i + 1);
      assert.ok(typeof d.title === 'string' && d.title.length > 0, `plan ${k} day ${i + 1} needs a title`);
      assert.ok(Array.isArray(d.tasks) && d.tasks.length >= 3, `plan ${k} day ${i + 1} needs tasks`);
    });
  }
});

test('task ids are unique within a plan; every task is a topic slot or has text and a route', () => {
  for (const k of KEYS) {
    const all = KIT.data.plans[k].flatMap((d) => d.tasks);
    const ids = all.map((t) => t.id);
    assert.equal(new Set(ids).size, ids.length, `plan ${k}: duplicate task id`);
    for (const t of all) {
      assert.ok(typeof t.id === 'string' && t.id, 'task id');
      if (t.rank !== undefined) {
        assert.ok(Number.isInteger(t.rank) && t.rank >= 0 && t.rank < LECTURE.length, `${t.id}: rank`);
        assert.ok(['intuition', 'notes', 'skim', 'examples', 'quick', 'again', 'fix'].includes(t.step), `${t.id}: step`);
      } else {
        assert.ok(typeof t.text === 'string' && t.text, `${t.id}: text`);
        assert.match(t.route, /^#\//, `${t.id}: route`);
      }
    }
  }
});

test('every plan follows the study arc: diagnostic, weakest topics, cheat sheet, Mock A (120 min), key, recall drill', () => {
  for (const k of KEYS) {
    const tasks = tasksOf(k, null);
    const at = (route) => tasks.findIndex((t) => t.route === route);
    const firstTopic = tasks.findIndex((t) => t.topic);
    assert.equal(at('#/diag'), 0, `plan ${k}: the diagnostic comes first`);
    assert.ok(firstTopic > at('#/diag'), `plan ${k}: topics after the diagnostic`);
    assert.ok(at('#/cheatsheet') > firstTopic, `plan ${k}: cheat sheet after the first topic work`);
    assert.ok(at('#/print/exam/A') > at('#/cheatsheet'), `plan ${k}: Mock A after the cheat sheet`);
    assert.ok(at('#/print/exam/A/key') > at('#/print/exam/A'), `plan ${k}: key after Mock A`);
    assert.ok(at('#/print/recall') > at('#/print/exam/A/key'), `plan ${k}: recall drill after the key`);
    const mock = tasks[at('#/print/exam/A')];
    assert.match(mock.text, /120 min/, `plan ${k}: Mock A is timed at 120 minutes`);
    assert.match(mock.text, /paper/i, `plan ${k}: Mock A is taken on paper`);
  }
});

test('only the 3-day plan adds Mock B and a spaced second pass', () => {
  const has = (k, route) => tasksOf(k, null).some((t) => t.route === route);
  assert.equal(has('3', '#/print/exam/B'), true);
  assert.equal(has('3', '#/print/exam/B/key'), true);
  assert.equal(tasksOf('3', null).some((t) => /second pass/i.test(t.text)), true);
  for (const k of ['1', '2']) {
    assert.equal(has(k, '#/print/exam/B'), false, `plan ${k} must not include Mock B`);
    assert.equal(tasksOf(k, null).some((t) => /second pass/i.test(t.text)), false);
  }
});

/* ---------- resolve() ---------- */

test('resolve(): topic slots follow the diagnostic order, each topic as intuition, notes, examples, quick check', () => {
  const diag = { order: ['l03a', 'l04', 'l02'] };
  const topicTasks = tasksOf('3', diag).filter((t) => t.topic);
  assert.equal(topicTasks[0].topic, 'l03a', 'the weakest topic comes first');
  assert.deepEqual(topicTasks.slice(0, 4).map((t) => t.step), ['intuition', 'notes', 'examples', 'quick']);
  assert.ok(topicTasks.slice(0, 4).every((t) => t.topic === 'l03a' && t.route === '#/topic/l03a'));
  const secondTopic = topicTasks.find((t) => t.topic !== 'l03a');
  assert.equal(secondTopic.topic, 'l04', 'then the second weakest');
});

test('resolve(): without a diagnostic the slots run in lecture order', () => {
  const topicTasks = tasksOf('2', null).filter((t) => t.topic);
  assert.equal(topicTasks[0].topic, 'l01');
  assert.equal(topicTasks[0].route, '#/topic/l01');
});

test('resolve(): task keys are unique, carry the plan, and change when a slot gets a different topic', () => {
  for (const k of KEYS) {
    const keys = tasksOf(k, null).map((t) => t.key);
    assert.equal(new Set(keys).size, keys.length, `plan ${k}: duplicate keys`);
    assert.ok(keys.every((x) => x.startsWith(k + ':')), `plan ${k}: keys start with the plan`);
  }
  const a = tasksOf('3', { order: ['l02'] }).find((t) => t.topic && t.step === 'notes');
  const b = tasksOf('3', { order: ['l04'] }).find((t) => t.topic && t.step === 'notes');
  assert.notEqual(a.key, b.key);
  assert.equal(tasksOf('3', { order: ['l02'] }).find((t) => t.topic && t.step === 'notes').key, a.key, 'stable for the same ranking');
});

test('resolve(): text is complete (no template placeholders, undefined or NaN) and every task has a route and minutes', () => {
  for (const k of KEYS) {
    for (const t of tasksOf(k, { order: ['l04', 'l01'] })) {
      assert.doesNotMatch(`${t.text} ${t.hint}`, /[{}]|undefined|NaN|\[object/, `${t.key}: ${t.text}`);
      assert.match(t.route, /^#\//);
      assert.ok(Number.isFinite(t.min) && t.min > 0, `${t.key}: minutes`);
    }
  }
});

test('resolve(): rank slots always name a registered topic id, even for a partial diagnostic result', () => {
  for (const t of tasksOf('3', { order: ['l03b'] }).filter((x) => x.topic)) assert.ok(LECTURE.includes(t.topic));
});

test('resolve(): Mock B tasks report whether the exam has been assembled', () => {
  const b = tasksOf('3', null).filter((t) => t.exam === 'B');
  assert.ok(b.length >= 1);
  for (const t of b) assert.equal(t.ready, P().examReady('B'));
});

test('resolve(): unknown plan keys give no days', () => {
  assert.deepEqual(P().resolve('9', null), []);
  assert.deepEqual(P().resolve(undefined, null), []);
});

/* ---------- examReady / dayIndex / progress ---------- */

test('examReady(): true once an exam has at least one item', () => {
  KIT.exam({ id: 'T-EMPTY', kind: 'form', status: 'draft', title: 't', sections: [{ id: 's', type: 'mcq', title: 't', items: [] }] });
  KIT.exam({ id: 'T-FULL', kind: 'form', status: 'draft', title: 't', sections: [
    { id: 's', type: 'mcq', title: 't', items: [] }, { id: 'g', type: 'gen', title: 'g', items: [{ gen: 'l04.rates', params: {}, pts: 5 }] }] });
  assert.equal(P().examReady('T-EMPTY'), false);
  assert.equal(P().examReady('T-FULL'), true);
  assert.equal(P().examReady('no-such-exam'), false);
});

test('dayIndex(): day 1 on the start date, one more per calendar day, clamped to the plan length', () => {
  const start = new Date(2026, 9, 6, 22, 30).getTime();            // late evening, local time
  const at = (d, hr) => new Date(2026, 9, 6 + d, hr, 0).getTime();
  assert.equal(P().dayIndex(start, at(0, 23), 3), 1);
  assert.equal(P().dayIndex(start, at(1, 0), 3), 2, 'just after midnight is the next day');
  assert.equal(P().dayIndex(start, at(2, 9), 3), 3);
  assert.equal(P().dayIndex(start, at(9, 9), 3), 3, 'clamped to the last day');
  assert.equal(P().dayIndex(start, at(-1, 9), 3), 1, 'a clock that went back stays on day 1');
  assert.equal(P().dayIndex(start, at(1, 9), 1), 1);
  assert.equal(P().dayIndex(undefined, at(1, 9), 3), 1, 'no stored start');
  assert.equal(P().dayIndex('junk', at(1, 9), 3), 1);
});

test('progress(): counts finished tasks overall and per day, ignoring stale keys', () => {
  const days = P().resolve('2', null);
  const done = {};
  done[days[0].tasks[0].key] = true;
  done[days[1].tasks[0].key] = true;
  done[days[1].tasks[1].key] = false;
  done['2:old-task:l99'] = true;
  const p = P().progress(days, done);
  assert.equal(p.done, 2);
  assert.equal(p.total, days[0].tasks.length + days[1].tasks.length);
  assert.deepEqual(p.days.map((d) => d.done), [1, 1]);
  assert.deepEqual(p.days.map((d) => d.total), days.map((d) => d.tasks.length));
  assert.deepEqual(P().progress(days, null).days.map((d) => d.done), [0, 0]);
});

test('every plan includes the drawing drills before Mock A (the exam leans on line encodings)', () => {
  for (const k of KEYS) {
    const tasks = tasksOf(k, null);
    const at = (route) => tasks.findIndex((t) => t.route === route);
    assert.ok(at('#/print/drills') > 0, `plan ${k}: drawing drills`);
    assert.ok(at('#/print/drills') < at('#/print/exam/A'), `plan ${k}: drills before Mock A`);
  }
});

test('the 2- and 3-day plans add essay practice (draw and/or explain) after marking Mock A', () => {
  for (const k of ['2', '3']) {
    const tasks = tasksOf(k, null);
    const at = (route) => tasks.findIndex((t) => t.route === route);
    assert.ok(at('#/print/essays') > at('#/print/exam/A/key'), `plan ${k}: essay practice after the Mock A key`);
  }
});
