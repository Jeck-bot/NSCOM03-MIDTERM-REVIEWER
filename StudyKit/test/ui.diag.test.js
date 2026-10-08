'use strict';
// Diagnostic scoring is pure: correct + sure = 1, correct + unsure = 0.5, wrong or blank = 0, essays are excluded,
// and topics are ranked weakest-first. Item selection follows the per-topic quota in exams/diag.js.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadKit } = require('./helpers/load.js');
const KIT = loadKit();

const D = () => KIT.ui.diag;
const mcq = (id, topic, answer) => ({ id, topic, type: 'mcq', choices: ['a', 'b', 'c', 'd'], answer });
const essay = (id, topic) => ({ id, topic, type: 'essay', rubric: [{ pts: 5, point: 'x' }], model: 'm' });

test('correct + sure = 1, correct + unsure = 0.5, wrong or blank = 0', () => {
  const items = [mcq('l02.q1', 'l02', 1), mcq('l02.q2', 'l02', 2), mcq('l02.q3', 'l02', 0), mcq('l02.q4', 'l02', 3)];
  const res = D().score(items, {
    'l02.q1': { answer: 1, sure: true },   // correct + sure   -> 1
    'l02.q2': { answer: 2, sure: false },  // correct + unsure -> 0.5
    'l02.q3': { answer: 3, sure: true }    // wrong            -> 0
    // l02.q4 left blank                   -> 0
  });
  assert.deepEqual(res.perTopic.l02, { score: 1.5, max: 4, pct: 37.5 });
});

test('a wrong answer scores 0 whether or not the student was sure', () => {
  const items = [mcq('l02.q1', 'l02', 1), mcq('l02.q2', 'l02', 1)];
  const res = D().score(items, { 'l02.q1': { answer: 0, sure: true }, 'l02.q2': { answer: 0, sure: false } });
  assert.equal(res.perTopic.l02.score, 0);
});

test('a missing sure flag counts as sure; only sure:false halves the credit', () => {
  const items = [mcq('l02.q1', 'l02', 1), mcq('l02.q2', 'l02', 1)];
  const res = D().score(items, { 'l02.q1': { answer: 1 }, 'l02.q2': { answer: 1, sure: false } });
  assert.equal(res.perTopic.l02.score, 1.5);
});

test('essays are excluded from score and max, and an essay-only topic is not ranked', () => {
  const items = [mcq('l04.q1', 'l04', 0), essay('l04.e1', 'l04'), essay('l01.e1', 'l01')];
  const res = D().score(items, { 'l04.q1': { answer: 0, sure: true }, 'l04.e1': { answer: 'my essay', sure: true } });
  assert.deepEqual(res.perTopic.l04, { score: 1, max: 1, pct: 100 });
  assert.equal('l01' in res.perTopic, false);
  assert.deepEqual(res.order, ['l04']);
});

test('ranking is weakest-first; ties keep lecture order', () => {
  const items = [
    mcq('l01.q1', 'l01', 0), mcq('l01.q2', 'l01', 0),   // 1 of 2 -> 50%
    mcq('l02.q1', 'l02', 0), mcq('l02.q2', 'l02', 0),   // 1 of 2 -> 50% (ties with l01)
    mcq('l03a.q1', 'l03a', 0),                           // 0 of 1 -> 0%
    mcq('l04.q1', 'l04', 0)                              // 1 of 1 -> 100%
  ];
  const res = D().score(items, {
    'l01.q1': { answer: 0, sure: true }, 'l02.q1': { answer: 0, sure: true },
    'l03a.q1': { answer: 3, sure: true }, 'l04.q1': { answer: 0, sure: true }
  });
  assert.deepEqual(res.order, ['l03a', 'l01', 'l02', 'l04']);
  assert.equal(res.perTopic.l03a.pct, 0);
  assert.equal(res.perTopic.l04.pct, 100);
});

test('unsure answers pull a topic down the ranking', () => {
  const items = [mcq('l01.q1', 'l01', 0), mcq('l02.q1', 'l02', 0)];
  const res = D().score(items, { 'l01.q1': { answer: 0, sure: true }, 'l02.q1': { answer: 0, sure: false } });
  assert.deepEqual(res.order, ['l02', 'l01']);
});

test('grades every item type through KIT.grade', () => {
  const items = [
    { id: 'l03a.q1', topic: 'l03a', type: 'id', answer: 'Alternate mark inversion', accept: ['AMI'] },
    { id: 'l04.q1', topic: 'l04', type: 'num', num: { value: 4e6, tol: 0.01, rel: true, unit: 'Hz' } },
    { id: 'l04.q2', topic: 'l04', type: 'multi', choices: ['a', 'b', 'c', 'd'], answer: [0, 2] },
    { id: 'l04.q3', topic: 'l04', type: 'tf', answer: false, fix: 'x' }
  ];
  const res = D().score(items, {
    'l03a.q1': { answer: ' ami ', sure: true },            // synonym, case and spaces ignored
    'l04.q1': { answer: '4 MHz', sure: true },              // SI prefix + unit
    'l04.q2': { answer: [2, 0], sure: true },               // order does not matter
    'l04.q3': { answer: false, sure: true }
  });
  assert.deepEqual(res.perTopic.l03a, { score: 1, max: 1, pct: 100 });
  assert.deepEqual(res.perTopic.l04, { score: 3, max: 3, pct: 100 });
});

test('missing, null or empty input gives an empty or all-zero result and never throws', () => {
  assert.deepEqual(D().score([], {}), { perTopic: {}, order: [] });
  assert.deepEqual(D().score(undefined, undefined), { perTopic: {}, order: [] });
  const res = D().score([mcq('l02.q1', 'l02', 1)], null);
  assert.deepEqual(res.perTopic.l02, { score: 0, max: 1, pct: 0 });
});

test('a malformed item counts as wrong instead of throwing', () => {
  const items = [{ id: 'l02.q9', topic: 'l02', type: 'num' }, mcq('l02.q1', 'l02', 1)];
  const res = D().score(items, { 'l02.q9': { answer: '5', sure: true }, 'l02.q1': { answer: 1, sure: true } });
  assert.deepEqual(res.perTopic.l02, { score: 1, max: 2, pct: 50 });
});

test('byQuota keeps the first N items per topic, in lecture order, and drops essays', () => {
  const pool = [
    mcq('l04.q1', 'l04', 0), mcq('l02.q1', 'l02', 0), mcq('l02.q2', 'l02', 0), mcq('l02.q3', 'l02', 0),
    essay('l02.e1', 'l02'), mcq('l01.q1', 'l01', 0), mcq('l04.q2', 'l04', 0)
  ];
  const out = D().byQuota(pool, { l01: 1, l02: 2, l04: 1 });
  assert.deepEqual(out.map((q) => q.id), ['l01.q1', 'l02.q1', 'l02.q2', 'l04.q1']);
});

test('byQuota without a quota keeps every non-essay item, and a short topic just yields what it has', () => {
  const pool = [mcq('l02.q1', 'l02', 0), essay('l02.e1', 'l02'), mcq('l04.q1', 'l04', 0)];
  assert.deepEqual(D().byQuota(pool, null).map((q) => q.id), ['l02.q1', 'l04.q1']);
  assert.deepEqual(D().byQuota(pool, { l02: 5, l04: 2 }).map((q) => q.id), ['l02.q1', 'l04.q1']);
});

test('verdict(): weak below 50%, shaky below 80%, solid from 80% — each with an icon and a word, never colour alone', () => {
  const v = D().verdict;
  assert.equal(v(0).key, 'weak');
  assert.equal(v(49.9).key, 'weak');
  assert.equal(v(50).key, 'shaky');
  assert.equal(v(79.9).key, 'shaky');
  assert.equal(v(80).key, 'solid');
  assert.equal(v(100).key, 'solid');
  for (const p of [0, 60, 100]) assert.match(v(p).label, /^[⚠◐✓] \S/);
});

test('describeResponse(): shows what the student answered in plain text', () => {
  const d = D().describeResponse;
  const choices = ['one', 'two', 'three'];
  assert.equal(d({ type: 'mcq', choices }, 1), 'B');
  assert.equal(d({ type: 'multi', choices }, [2, 0]), 'A, C');
  assert.equal(d({ type: 'tf' }, true), 'True');
  assert.equal(d({ type: 'tf' }, false), 'False');
  assert.equal(d({ type: 'id' }, ' AMI '), 'AMI');
  assert.equal(d({ type: 'num' }, '4 MHz'), '4 MHz');
  for (const t of ['mcq', 'multi', 'tf', 'id', 'num']) assert.equal(d({ type: t, choices }, undefined), '(no answer)', t);
  assert.equal(d({ type: 'multi', choices }, []), '(no answer)');
});

test('items() follows the quota in exams/diag.js and never includes essays', () => {
  const quota = KIT.exams.get('diag').sections[0].quota;
  const items = D().items();
  assert.ok(Array.isArray(items));
  const per = {};
  for (const q of items) {
    assert.notEqual(q.type, 'essay', q.id);
    per[q.topic] = (per[q.topic] || 0) + 1;
  }
  for (const [t, n] of Object.entries(per)) assert.ok(n <= quota[t], `${t}: ${n} items, quota ${quota[t]}`);
});
