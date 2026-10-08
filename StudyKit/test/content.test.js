'use strict';
// Validates every registered topic, formula, and bank item, and checks worked examples against slide values.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadKit } = require('./helpers/load.js');
const KIT = loadKit();

test('topics are schema-valid', () => {
  const errs = KIT.topics().flatMap((t) => KIT.schema.topic(t));
  assert.deepEqual(errs, []);
});

test('formulas are schema-valid', () => {
  const errs = KIT.formulas().flatMap((f) => KIT.schema.formula(f));
  assert.deepEqual(errs, []);
});

test('bank items are schema-valid', () => {
  const errs = KIT.bank.all().flatMap((q) => KIT.schema.question(q));
  assert.deepEqual(errs, []);
});

test('worked examples build, validate, self-grade, and match the slide value', () => {
  const errs = [];
  for (const t of KIT.topics()) {
    (t.sections || []).forEach((s, i) => {
      if (s.kind !== 'example' || !s.gen) return;
      const where = `${t.id} example ${i} (${s.title})`;
      let p;
      try { p = KIT.gen.build(s.gen, s.params); } catch (e) { errs.push(`${where}: build threw ${e.message}`); return; }
      errs.push(...KIT.schema.problem(p, where));
      (p.inputs || []).forEach((inp, j) => {
        try { if (!KIT.grade.check(inp, KIT.grade.answerOf(inp)).ok) errs.push(`${where}: input ${j} fails its own answer`); }
        catch (e) { errs.push(`${where}: input ${j} check threw ${e.message}`); }
      });
      if (s.slideValue !== undefined) {
        const inp = s.input ? p.inputs.find((x) => x.id === s.input) : p.inputs.find((x) => x.kind === 'num');
        if (!inp) { errs.push(`${where}: no numeric input to compare with slideValue`); return; }
        const tol = s.slideTol !== undefined ? s.slideTol : 0.01;
        const rel = Math.abs(inp.answer - s.slideValue) / Math.max(Math.abs(s.slideValue), 1e-30);
        if (rel > tol) errs.push(`${where}: computed ${inp.answer} vs slide ${s.slideValue} (rel diff ${rel.toFixed(4)} > ${tol})`);
      }
    });
  }
  assert.deepEqual(errs, []);
});

test('quick-check sections have enough general (non-exam) bank items', () => {
  const errs = [];
  for (const t of KIT.topics()) {
    for (const s of (t.sections || []).filter((x) => x.kind === 'quick')) {
      const have = KIT.bank.query({ topic: t.id, pool: 'none' }).filter((q) => q.type !== 'essay').length;
      if (have < s.n) errs.push(`${t.id}: quick n=${s.n} but only ${have} general items`);
    }
  }
  assert.deepEqual(errs, []);
});

test('every bank item belongs to a registered or planned topic', () => {
  for (const q of KIT.bank.all()) assert.ok(KIT.TOPIC_IDS.includes(q.topic), q.id);
});
