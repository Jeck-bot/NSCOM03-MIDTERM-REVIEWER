'use strict';
// Quiz logic that does not need a DOM: what counts as an attempt, how results are persisted in 'quiz.results'.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadKit } = require('./helpers/load.js');
const KIT = loadKit();

const Q = () => KIT.ui.quiz;
const mcq = { id: 'l04.q1', topic: 'l04', type: 'mcq', choices: ['a', 'b', 'c'], answer: 1 };
const multi = { id: 'l04.q2', topic: 'l04', type: 'multi', choices: ['a', 'b', 'c', 'd'], answer: [0, 2] };
const tf = { id: 'l04.q3', topic: 'l04', type: 'tf', answer: false, fix: 'The corrected statement.' };
const idq = { id: 'l04.q4', topic: 'l04', type: 'id', answer: 'On-off keying', accept: ['OOK'] };
const num = { id: 'l04.q5', topic: 'l04', type: 'num', num: { value: 4e6, tol: 0.01, rel: true, unit: 'Hz' } };
const essay = { id: 'l04.e1', topic: 'l04', type: 'essay', rubric: [{ pts: 5, point: 'x' }], model: 'm' };

test('gradeItem: multiple choice and true/false', () => {
  assert.deepEqual(Q().gradeItem(mcq, 1), { ok: true, blank: false, msg: 'Correct.' });
  assert.equal(Q().gradeItem(mcq, 0).ok, false);
  assert.equal(Q().gradeItem(tf, false).ok, true);
  assert.equal(Q().gradeItem(tf, 'false').ok, true);
  assert.equal(Q().gradeItem(tf, true).ok, false);
});

test('gradeItem: choosing nothing is blank, not wrong', () => {
  for (const r of [undefined, null, '', NaN]) assert.equal(Q().gradeItem(mcq, r).blank, true, String(r));
  assert.equal(Q().gradeItem(tf, null).blank, true);
  assert.equal(Q().gradeItem(multi, []).blank, true);
  assert.equal(Q().gradeItem(multi, undefined).blank, true);
  assert.equal(Q().gradeItem(idq, '   ').blank, true);
  assert.equal(Q().gradeItem(num, '').blank, true);
});

test('gradeItem: select-all is order-insensitive and all-or-nothing', () => {
  assert.equal(Q().gradeItem(multi, [2, 0]).ok, true);
  assert.equal(Q().gradeItem(multi, [0]).ok, false);
  assert.equal(Q().gradeItem(multi, [0, 1, 2]).ok, false);
});

test('gradeItem: identification ignores case, spaces and punctuation and accepts synonyms', () => {
  assert.equal(Q().gradeItem(idq, ' on off keying ').ok, true);
  assert.equal(Q().gradeItem(idq, 'ook').ok, true);
  assert.equal(Q().gradeItem(idq, 'amplitude shift keying').ok, false);
});

test('gradeItem: numeric answers take SI prefixes and report unit and rounding problems', () => {
  assert.equal(Q().gradeItem(num, '4 MHz').ok, true);
  assert.equal(Q().gradeItem(num, '4000000').ok, true);
  assert.equal(Q().gradeItem(num, '4e6').ok, true);
  const wrongUnit = Q().gradeItem(num, '4 bps');
  assert.equal(wrongUnit.ok, false);
  assert.equal(wrongUnit.blank, false);
  assert.match(wrongUnit.msg, /unit/i);
  const close = Q().gradeItem(num, '4.1 MHz');
  assert.equal(close.ok, false);
  assert.match(close.msg, /close/i);
  const junk = Q().gradeItem(num, 'four megahertz');
  assert.equal(junk.blank, true, 'text that is not a number is not an attempt');
  assert.match(junk.msg, /number/i);
});

test('gradeItem: essays are self-graded, so ok is null', () => {
  assert.deepEqual(Q().gradeItem(essay, 'my answer'), { ok: null, blank: false, msg: '' });
});

test('record(): saves { ok, n, ts } under quiz.results and counts attempts per item', () => {
  KIT.store._use(null);
  assert.deepEqual(Q().results(), {});
  assert.deepEqual(Q().record('l04.q1', false, 1000), { ok: false, n: 1, ts: 1000 });
  assert.deepEqual(Q().record('l04.q1', true, 2000), { ok: true, n: 2, ts: 2000 });
  assert.deepEqual(Q().record('l04.q2', true, 3000), { ok: true, n: 1, ts: 3000 });
  assert.deepEqual(KIT.store.get('quiz.results'), { 'l04.q1': { ok: true, n: 2, ts: 2000 }, 'l04.q2': { ok: true, n: 1, ts: 3000 } });
  assert.deepEqual(Q().results(), KIT.store.get('quiz.results'));
});

test('record(): defaults the timestamp to now and recovers from corrupt stored data', () => {
  KIT.store._use(null);
  KIT.store.set('quiz.results', 'not an object');
  const before = Date.now();
  const r = Q().record('l04.q9', true);
  assert.equal(r.n, 1);
  assert.ok(r.ts >= before && r.ts <= Date.now());
  KIT.store.set('quiz.results', ['wrong', 'shape']);
  assert.equal(Q().record('l04.q9', false).n, 1);
});

test('render and renderSet exist (the contract topic.js relies on)', () => {
  assert.equal(typeof Q().render, 'function');
  assert.equal(typeof Q().renderSet, 'function');
  assert.equal(typeof Q().control, 'function');
});
