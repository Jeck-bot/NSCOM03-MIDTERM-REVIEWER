'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadKit } = require('./helpers/load.js');
const KIT = loadKit();
const G = KIT.grade;

const close = (a, b) => Math.abs(a - b) <= 1e-12 * Math.max(1, Math.abs(b));

test('parseNumber: plain, grouped, scientific, fractions, percent', () => {
  const cases = [
    ['2,500,000', undefined, 2.5e6], ['34 860', undefined, 34860], ['2.5e6', undefined, 2.5e6], ['-3.01', undefined, -3.01],
    ['−3.01', undefined, -3.01], ['3×10^8', undefined, 3e8], ['3 x 10⁸', undefined, 3e8], ['2.4 × 10^-8', undefined, 2.4e-8],
    ['1/2', undefined, 0.5], ['18.4%', undefined, 0.184], ['.5', undefined, 0.5], ['  42  ', undefined, 42]
  ];
  for (const [s, u, v] of cases) assert.ok(close(G.parseNumber(s, u), v), `${s} → ${G.parseNumber(s, u)} (want ${v})`);
});

test('parseNumber: SI prefixes and units', () => {
  const cases = [
    ['2.5M', 'bps', 2.5e6], ['2.5 Mbps', 'bps', 2.5e6], ['64 kbps', 'bps', 64000], ['64 Kbps', 'bps', 64000],
    ['64 mbps', 'bps', 64e6], // lowercase m on a rate unit means mega (milli-bps never occurs)
    ['5 ms', 's', 0.005], ['20 µs', 's', 2e-5], ['20 us', 's', 2e-5], ['50 msec', 's', 0.05],
    ['0.75 µm', 'm', 7.5e-7], ['750 nm', 'm', 7.5e-7], ['12,000 km', 'm', 1.2e7], ['500 m', 'm', 500],
    ['40 dB', 'dB', 40], ['40 db', 'dB', 40], ['-3 dB', 'dB', -3], ['6 MHz', 'Hz', 6e6], ['6mhz', 'Hz', 6e6],
    ['500 kbaud', 'baud', 5e5], ['500 kBd', 'baud', 5e5], ['10 mW', 'W', 0.01], ['1 µW', 'W', 1e-6],
    ['8000 samples/s', 'sps', 8000], ['400 ksps', 'sps', 4e5], ['100 frames/s', 'frames/s', 100], ['32 bits', 'bits', 32]
  ];
  for (const [s, u, v] of cases) assert.ok(close(G.parseNumber(s, u), v), `${s} [${u}] → ${G.parseNumber(s, u)} (want ${v})`);
});

test('parseNumber: garbage and unit mismatches give NaN', () => {
  for (const [s, u] of [['abc', 'bps'], ['', 'bps'], ['12 kHz', 'bps'], ['3 apples', undefined], ['1.2.3', undefined], ['5 kB', 'bps']]) {
    assert.ok(Number.isNaN(G.parseNumber(s, u)), `${s} [${u}] should be NaN, got ${G.parseNumber(s, u)}`);
  }
  const q = G.parseQuantity('12 kHz', 'bps');
  assert.equal(q.ok, true); assert.equal(q.mismatch, true);
});

test('check num: relative tolerance, unit message, near-miss hint', () => {
  const inp = { kind: 'num', answer: 34881, unit: 'bps', tol: 0.01, rel: true };
  assert.equal(G.check(inp, '34.86 kbps').ok, true, 'slide-rounded value within 1%');
  assert.equal(G.check(inp, '34881').ok, true);
  assert.equal(G.check(inp, '30 kbps').ok, false);
  assert.match(G.check(inp, '34.86 kHz').msg, /unit/i);
  assert.match(G.check(inp, 'hello').msg, /number/i);
  assert.match(G.check(inp, '33.9 kbps').msg, /close/i, 'within 10× tolerance gets a near-miss hint');
  const abs = { kind: 'num', answer: -3, unit: 'dB', tol: 0.05, rel: false };
  assert.equal(G.check(abs, '-3.01 dB').ok, true);
  assert.equal(G.check(abs, '-3.2').ok, false);
  const zero = { kind: 'num', answer: 0, unit: '' };
  assert.equal(G.check(zero, '0').ok, true);
  assert.equal(G.check(zero, '0.1').ok, false);
});

test('check bits, text, choice, tf, vector', () => {
  assert.equal(G.check({ kind: 'bits', answer: '10110' }, '1 0110').ok, true);
  assert.equal(G.check({ kind: 'bits', answer: '10110' }, '10111').ok, false);
  assert.match(G.check({ kind: 'bits', answer: '10110' }, '0110').msg, /5 bits/);
  const id = { kind: 'text', accept: ['CSMA/CD', 'carrier sense multiple access with collision detection'] };
  assert.equal(G.check(id, 'csma cd').ok, true);
  assert.equal(G.check(id, 'CSMA-CD').ok, true);
  assert.equal(G.check(id, 'Carrier Sense Multiple Access with Collision Detection.').ok, true);
  assert.equal(G.check(id, 'csma/ca').ok, false);
  assert.equal(G.check({ kind: 'choice', answer: 2 }, 2).ok, true);
  assert.equal(G.check({ kind: 'choice', answer: 2 }, 1).ok, false);
  assert.equal(G.check({ kind: 'choice', answer: [0, 2] }, [2, 0]).ok, true, 'multi-select ignores order');
  assert.equal(G.check({ kind: 'choice', answer: [0, 2] }, [0]).ok, false);
  assert.equal(G.check({ kind: 'tf', answer: false }, false).ok, true);
  assert.equal(G.check({ kind: 'tf', answer: false }, true).ok, false);
  const vec = { kind: 'vector', answer: [-1, -1, -3, 1] };
  assert.equal(G.check(vec, '−1 −1 −3 +1').ok, true);
  assert.equal(G.check(vec, '[-1, -1, -3, 1]').ok, true);
  assert.equal(G.check(vec, '-1 -1 -3').ok, false);
});

test('check grid: exact, alternates, inverted convention, first wrong bit', () => {
  const grid = { bits: '0100', cellsPerBit: 2, levels: [1, -1], answer: [1, -1, -1, 1, 1, -1, 1, -1], acceptInverse: true };
  const inp = { kind: 'grid', grid };
  assert.equal(G.check(inp, grid.answer.slice()).ok, true);
  const inv = G.check(inp, grid.answer.map((v) => -v));
  assert.equal(inv.ok, true); assert.equal(inv.inverted, true); assert.match(inv.msg, /convention/i);
  const wrong = grid.answer.slice(); wrong[5] = 1;
  const r = G.check(inp, wrong);
  assert.equal(r.ok, false); assert.equal(r.firstWrongCell, 5); assert.equal(r.bitIndex, 2);
  assert.match(r.msg, /bit 3/);
  const unset = grid.answer.slice(); unset[0] = null;
  assert.equal(G.check(inp, unset).ok, false);
  const strict = { kind: 'grid', grid: Object.assign({}, grid, { acceptInverse: false }) };
  assert.equal(G.check(strict, grid.answer.map((v) => -v)).ok, false);
  const tbq = { kind: 'grid', grid: { bits: '0011', cellsPerBit: 0.5, levels: [3, 1, -1, -3], answer: [1, -3] } };
  const r2 = G.check(tbq, [1, 3]);
  assert.equal(r2.bitIndex, 2, '2B1Q cell 1 covers bits 2–3');
  const alt = { kind: 'grid', grid: { bits: '01', cellsPerBit: 1, levels: [1, -1], answer: [1, -1], alts: [[-1, 1]] } };
  assert.equal(G.check(alt, [-1, 1]).ok, true);
});

test('answerOf + display round-trip for every kind', () => {
  const inputs = [
    { kind: 'num', answer: 34881.4, unit: 'bps' }, { kind: 'bits', answer: '10110' }, { kind: 'text', accept: ['Manchester'] },
    { kind: 'choice', answer: 1, choices: ['a', 'b'] }, { kind: 'tf', answer: true }, { kind: 'vector', answer: [-1, 0, 2] },
    { kind: 'grid', grid: { bits: '01', cellsPerBit: 1, levels: [1, -1], answer: [1, -1] } }
  ];
  for (const inp of inputs) {
    assert.equal(G.check(inp, G.answerOf(inp)).ok, true, inp.kind + ' self-check');
    assert.equal(typeof G.display(inp), 'string');
  }
  assert.equal(G.display({ kind: 'num', answer: 34881.4, unit: 'bps', sig: 4 }), '34.88 kbps');
  assert.equal(G.display({ kind: 'vector', answer: [-1, 0, 2] }), '[−1, 0, +2]');
});

test('question(): grades bank items by type', () => {
  assert.equal(G.question({ type: 'mcq', answer: 2 }, 2), true);
  assert.equal(G.question({ type: 'multi', answer: [1, 3] }, [3, 1]), true);
  assert.equal(G.question({ type: 'tf', answer: true }, false), false);
  assert.equal(G.question({ type: 'id', answer: 'Baseline wandering', accept: ['baseline wander'] }, 'baseline-wander'), true);
  assert.equal(G.question({ type: 'num', num: { value: 6000, tol: 0, rel: false, unit: 'bps' } }, '6 kbps'), true);
  assert.equal(G.question({ type: 'essay' }, 'anything'), null, 'essays are self-graded');
});

test('example(): unit-appropriate sample answers for placeholders and messages', () => {
  assert.equal(G.example('Hz'), '12.5 kHz');
  assert.equal(G.example('bps'), '12.5 kbps');
  assert.equal(G.example('dB'), '12.5 dB', 'no SI prefix on decibels');
  assert.equal(G.example('°'), '45°');
  assert.equal(G.example('%'), '12.5 %');
  assert.equal(G.example(''), '12.5');
  assert.equal(G.example(undefined), '12.5');
  assert.equal(G.prefixable('Hz'), true);
  assert.equal(G.prefixable('dB'), false);
  assert.equal(G.prefixable(''), false);
  for (const [u, v] of [['Hz', 12500], ['bps', 12500], ['s', 12500], ['W', 12500], ['dB', 12.5], ['°', 45]]) {
    const r = G.parseQuantity(G.example(u), u);
    assert.ok(r.ok && !r.mismatch, 'the example parses for ' + u);
    assert.ok(close(r.value, v), u + ': ' + r.value);
  }
});

test('text answers: “Term (ABBR)” and “ABBR (Term)” are accepted, hedged answers are not', () => {
  const rz = { kind: 'text', answer: 'RZ', accept: ['return to zero'] };
  assert.equal(G.check(rz, 'Return to zero (RZ)').ok, true);
  assert.equal(G.check(rz, 'RZ (return-to-zero)').ok, true);
  assert.equal(G.check(rz, 'NRZ (non-return to zero)').ok, false, 'neither part is accepted');
  const db = { kind: 'text', answer: 'Decibel', accept: ['dB'] };
  assert.equal(G.check(db, 'deciBel (db)').ok, true, 'the slide-20 spelling');
  assert.equal(G.check(db, 'dB (decibel)').ok, true);
  const dm = { kind: 'text', answer: 'Differential Manchester', accept: [] };
  assert.equal(G.check(dm, 'Manchester (differential Manchester)').ok, false, 'a long wrong term is not rescued by a bracketed right one');
  assert.equal(G.check(dm, 'Differential Manchester (biphase)').ok, true);
});

test('text answers ignore a plural s (the slides write “Wireless Networks”, “decibels”)', () => {
  assert.equal(G.check({ kind: 'text', answer: 'Wireless network', accept: ['wireless'] }, 'Wireless Networks').ok, true);
  assert.equal(G.check({ kind: 'text', answer: 'Decibel', accept: ['dB'] }, 'decibels').ok, true);
  assert.equal(G.check({ kind: 'text', answer: 'Asynchronous transmission' }, 'asynchronous transmissions').ok, true);
  assert.equal(G.check({ kind: 'text', answer: 'Asynchronous transmission' }, 'synchronous transmission').ok, false);
});

test('sketch inputs are self-checked: pending until the student marks the drawing', () => {
  const sk = { kind: 'sketch', axes: { x: [0, 1], y: [-1, 1] }, model: { series: [{ kind: 'fn', fn: Math.sin }] }, rubric: [{ pts: 1, point: 'shape' }] };
  assert.equal(G.answerOf(sk), 'self', 'the "own answer" of a sketch is a self-check');
  assert.equal(G.check(sk, 'self').ok, true);
  const pending = G.check(sk, { strokes: [], self: null });
  assert.equal(pending.ok, false);
  assert.equal(pending.pending, true);
  assert.equal(pending.self, true);
  assert.equal(G.check(sk, { strokes: [[{ x: 1, y: 1 }]], self: true }).ok, true);
  assert.equal(G.check(sk, { strokes: [[{ x: 1, y: 1 }]], self: false }).ok, false);
  assert.match(G.display(sk), /model/i);
});

test('schema: a sketch input needs axes, a model series and a rubric', () => {
  const S = KIT.schema;
  const good = { kind: 'sketch', axes: { x: [0, 1], y: [-1, 1] }, model: { series: [{ kind: 'fn', fn: Math.sin }] }, rubric: [{ pts: 2, point: 'shape' }] };
  assert.deepEqual(S.input(good, 'in'), []);
  assert.ok(S.input({ kind: 'sketch', axes: { x: [0, 1], y: [-1, 1] }, rubric: good.rubric }, 'in').length, 'no model');
  assert.ok(S.input({ kind: 'sketch', axes: { x: [0, 1], y: [-1, 1] }, model: good.model }, 'in').length, 'no rubric');
  assert.ok(S.input({ kind: 'sketch', axes: { x: [1, 0], y: [-1, 1] }, model: good.model, rubric: good.rubric }, 'in').length, 'bad axis range');
});
