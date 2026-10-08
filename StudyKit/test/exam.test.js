'use strict';
// Exam blueprints and assembled forms. Drafts must add up; finals must also resolve, grade, and stay balanced.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadKit } = require('./helpers/load.js');
const KIT = loadKit();

const sum = (o) => Object.values(o || {}).reduce((a, b) => a + b, 0);
const exams = KIT.exams.all();
const finals = exams.filter((x) => x.status === 'final');

function planned(x) {
  let pts = 0, items = 0;
  for (const s of x.sections) {
    if (s.type === 'gen') { pts += s.slots * s.pts; items += s.slots; }
    else { const n = sum(s.quota); pts += n * s.each; items += n; }
  }
  return { pts, items };
}

test('exam definitions are structurally valid', () => {
  assert.ok(exams.length >= 3, 'expected Form A, Form B, and the diagnostic');
  assert.deepEqual(exams.flatMap((x) => KIT.schema.exam(x)), []);
});

test('blueprints add up: forms are 100 points, the diagnostic is 20 items', () => {
  for (const x of exams) {
    const p = planned(x);
    assert.equal(p.pts, x.points, `${x.id}: blueprint gives ${p.pts} points, declared ${x.points}`);
    if (x.kind === 'form') assert.equal(x.points, 100, `${x.id} must be 100 points`);
    if (x.kind === 'diag') assert.equal(p.items, 20, 'diagnostic must have 20 items');
  }
});

test('final exams: items match quotas, resolve, belong to the right pool, and build', () => {
  const errs = [];
  for (const x of finals) {
    const pool = x.kind === 'diag' ? 'diag' : x.id;
    let total = 0;
    for (const s of x.sections) {
      if (s.type === 'gen') {
        if (s.items.length !== s.slots) errs.push(`${x.id}/${s.id}: ${s.items.length} items, expected ${s.slots}`);
        s.items.forEach((it, i) => {
          const w = `${x.id}/${s.id}[${i}]`;
          if (it.pts !== s.pts) errs.push(`${w}: pts ${it.pts}, expected ${s.pts}`);
          if (!KIT.TOPIC_IDS.includes(it.topic)) errs.push(`${w}: topic required`);
          if (!KIT.gen.has(it.gen)) { errs.push(`${w}: unknown generator ${it.gen}`); return; }
          try {
            const p = KIT.gen.build(it.gen, it.params);
            errs.push(...KIT.schema.problem(p, w));
            p.inputs.forEach((inp, j) => { if (!KIT.grade.check(inp, KIT.grade.answerOf(inp)).ok) errs.push(`${w}: input ${j} fails its own key`); });
          } catch (e) { errs.push(`${w}: build threw ${e.message}`); }
          total += it.pts;
        });
        continue;
      }
      const want = sum(s.quota);
      if (s.items.length !== want) errs.push(`${x.id}/${s.id}: ${s.items.length} items, quota ${want}`);
      const byTopic = {};
      s.items.forEach((id) => {
        const q = KIT.bank.get(id);
        if (!q) { errs.push(`${x.id}/${s.id}: unknown bank id ${id}`); return; }
        byTopic[q.topic] = (byTopic[q.topic] || 0) + 1;
        if (q.pool !== pool) errs.push(`${x.id}/${s.id}: ${id} has pool ${q.pool}, expected ${pool}`);
        if (s.type === 'mixed') { if (q.type === 'essay') errs.push(`${x.id}: ${id} is an essay in a mixed section`); }
        else if (q.type !== s.type) errs.push(`${x.id}/${s.id}: ${id} is ${q.type}, expected ${s.type}`);
        total += s.each;
      });
      for (const [t, n] of Object.entries(s.quota)) if ((byTopic[t] || 0) !== n) errs.push(`${x.id}/${s.id}: ${t} has ${byTopic[t] || 0}, quota ${n}`);
    }
    if (total !== x.points) errs.push(`${x.id}: assembled ${total} points, expected ${x.points}`);
  }
  assert.deepEqual(errs, []);
});

test('no bank item or generator slot appears in two exams', () => {
  const seen = new Map();
  const errs = [];
  for (const x of exams) for (const s of x.sections) for (const it of s.items) {
    const key = typeof it === 'string' ? it : `${it.gen}:${JSON.stringify(it.params)}`;
    if (seen.has(key)) errs.push(`${key} is in ${seen.get(key)} and ${x.id}`);
    else seen.set(key, x.id);
  }
  assert.deepEqual(errs, []);
});

test('final forms: MCQ answer letters balanced, true/false 40–60% true', () => {
  for (const x of finals.filter((f) => f.kind === 'form')) {
    const mcq = x.sections.filter((s) => s.type === 'mcq').flatMap((s) => s.items).map((id) => KIT.bank.get(id));
    const counts = {};
    mcq.forEach((q) => { counts[q.answer] = (counts[q.answer] || 0) + 1; });
    for (const [k, n] of Object.entries(counts)) assert.ok(n <= Math.ceil(0.4 * mcq.length), `${x.id}: answer ${'ABCDE'[k]} used ${n}/${mcq.length}`);
    const tf = x.sections.filter((s) => s.type === 'tf').flatMap((s) => s.items).map((id) => KIT.bank.get(id));
    if (tf.length) {
      const t = tf.filter((q) => q.answer === true).length / tf.length;
      assert.ok(t >= 0.4 && t <= 0.6, `${x.id}: ${Math.round(t * 100)}% of true/false items are true`);
    }
  }
});

/* An identification answer must not be readable elsewhere on the same paper (a stem, a choice, a problem prompt
   or an answer-line label). Terms already in the item's own prompt are ignored; long single words also match by
   stem (distortion → "distorted"). Weak hits, where the term appears but nothing defines it, are listed with a reason. */
const WEAK_HITS = {
  'A:l01.q008': 'layer names appear only as labels and choices; nothing on the paper says which layer turns frames into signals',
  'A:l01.q025': '“cell” elsewhere is a cell of the drawing grid, not the wireless coverage unit'
};
test('final exams: no identification answer is given away by another item on the same paper', () => {
  const plain = (s) => String(s || '').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').toLowerCase();
  const stems = (term) => {
    const t = plain(term).trim();
    const out = [t];
    if (!/\s/.test(t) && t.length >= 8) out.push(t.replace(/(ions|ion|ing|ed|s)$/, ''));
    return out.filter((s) => s.length >= 4);
  };
  const errs = [];
  for (const x of finals) {
    const items = [];
    x.sections.forEach((s) => s.items.forEach((it, i) => {
      const where = `${s.id} ${i + 1}`;
      if (s.type === 'gen') {
        const p = KIT.gen.build(it.gen, it.params);
        items.push({ where, id: it.gen, text: plain(p.prompt + ' ' + p.inputs.map((n) => n.label || '').join(' ')) });
      } else {
        const q = KIT.bank.get(it);
        items.push({ where, id: q.id, q, text: plain(q.q + ' ' + (q.choices || []).join(' | ')) });
      }
    }));
    for (const it of items.filter((n) => n.q && n.q.type === 'id')) {
      if (WEAK_HITS[x.id + ':' + it.id]) continue;
      const terms = [it.q.answer].concat(it.q.accept || []).flatMap(stems).filter((t) => !it.text.includes(t));
      for (const other of items) {
        const hit = other !== it && terms.find((t) => other.text.includes(t));
        if (hit) errs.push(`${x.id}: ${it.id} (“${it.q.answer}”) is readable in ${other.where} ${other.id} (“${hit}”)`);
      }
    }
  }
  assert.deepEqual(errs, []);
});
