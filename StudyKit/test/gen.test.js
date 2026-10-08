'use strict';
// Every generator with params(rng): 200 seeds → valid, deterministic, self-grading, and wrong answers are rejected.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadKit } = require('./helpers/load.js');
const KIT = loadKit();

const SEEDS = 200;

function perturb(inp) {
  switch (inp.kind) {
    case 'num': {
      const tol = inp.tol ?? 0.01;
      if (inp.rel === false) return String(inp.answer + 10 * tol + 1);
      if (inp.answer === 0) return '1';
      return String(inp.answer * (1 + Math.max(0.1, 5 * tol)));
    }
    case 'bits': return (inp.answer[0] === '0' ? '1' : '0') + inp.answer.slice(1);
    case 'text': return 'zz-not-the-answer';
    case 'choice': return Array.isArray(inp.answer) ? [] : (inp.answer + 1) % inp.choices.length;
    case 'tf': return !inp.answer;
    case 'vector': return inp.answer.map((v, i) => (i === 0 ? v + 1 : v)).join(' ');
    case 'grid': {
      const a = inp.grid.answer.slice();
      const lv = inp.grid.levels;
      a[0] = lv.find((v) => v !== a[0] && (!inp.grid.acceptInverse || v !== -inp.grid.answer[0]) ) ?? lv.find((v) => v !== a[0]);
      return a;
    }
    default: return null;
  }
}

const withParams = KIT.gen.all().filter((g) => typeof g.params === 'function');

test('generators: valid, deterministic, self-grading over many seeds', () => {
  const errs = [];
  for (const g of withParams) {
    for (let seed = 1; seed <= SEEDS && errs.length < 40; seed++) {
      let p, q;
      try { p = KIT.gen.random(g.id, seed); q = KIT.gen.random(g.id, seed); }
      catch (e) { errs.push(`${g.id} seed ${seed}: threw ${e.message}`); continue; }
      const v = KIT.schema.problem(p, `${g.id} seed ${seed}`);
      if (v.length) { errs.push(...v); continue; }
      if (JSON.stringify(p.inputs) !== JSON.stringify(q.inputs) || p.prompt !== q.prompt) errs.push(`${g.id} seed ${seed}: not deterministic`);
      p.inputs.forEach((inp, j) => {
        if (!KIT.grade.check(inp, KIT.grade.answerOf(inp)).ok) errs.push(`${g.id} seed ${seed} input ${j}: own answer rejected`);
        const wrong = perturb(inp);
        if (wrong !== null && KIT.grade.check(inp, wrong).ok) errs.push(`${g.id} seed ${seed} input ${j}: a wrong answer (${JSON.stringify(wrong)}) was accepted`);
      });
    }
  }
  assert.deepEqual(errs, []);
});

test('generator ids are topic-prefixed and topics are known', () => {
  for (const g of KIT.gen.all()) {
    assert.match(g.id, /^(l01|l02|l03a|l03b|l04)\.[a-z0-9-]+$/, g.id);
    assert.equal(g.id.split('.')[0], g.topic, `${g.id}: topic must match the id prefix`);
    assert.equal(typeof g.build, 'function', `${g.id}: build(params) is required`);
    assert.ok(typeof g.title === 'string' && g.title.length > 0, `${g.id}: title is required`);
  }
});
