'use strict';
// Print documents (js/print/docs.js): the pure parts. DOM layout is checked by tools/pdf.sh and the browser selftest.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadKit } = require('./helpers/load.js');
const KIT = loadKit();

const P = () => KIT.print;
const count = (s, re) => (s.match(re) || []).length;

/* ---------- document list ---------- */

test('docs(): the printable documents, their routes, titles and PDF names', () => {
  const d = P().docs();
  assert.deepEqual(d.map((x) => [x.id, x.route]), [
    ['cheatsheet', 'print/cheatsheet'], ['recall', 'print/recall'], ['reviewer', 'print/reviewer'],
    ['exam-A', 'print/exam/A'], ['exam-A-key', 'print/exam/A/key'], ['exam-B', 'print/exam/B'], ['exam-B-key', 'print/exam/B/key'],
    ['drills', 'print/drills'], ['essays', 'print/essays']
  ]);
  for (const x of d) {
    assert.ok(typeof x.title === 'string' && x.title.length > 3, x.id + ' title');
    assert.match(x.file, /^\d\d-[A-Za-z-]+\.pdf$/, x.id + ' file');
    assert.equal(typeof x.ready, 'boolean', x.id + ' ready');
  }
  assert.equal(new Set(d.map((x) => x.file)).size, d.length, 'PDF names are unique');
});

/* ---------- recall blanks ---------- */

test('blankKeys(): each <em class="k"> becomes a numbered fixed-width blank and its text is collected as the answer', () => {
  const r = P().blankKeys('S = <em class="k">N/r</em>; L = <em class="k">2<sup>r</sup></em>', 1);
  assert.deepEqual(r.answers, ['N/r', '2<sup>r</sup>']);
  assert.equal(r.next, 3);
  assert.doesNotMatch(r.html, /<em/);
  assert.equal(count(r.html, /________/g), 2, 'two blanks of eight underscores');
  assert.equal(count(r.html, /\(1\)/g), 1);
  assert.equal(count(r.html, /\(2\)/g), 1);
  assert.match(r.html, /^S = .*; L = /, 'text around the keys stays visible');
});

test('blankKeys(): numbering continues from the start value; the default start is 1', () => {
  const a = P().blankKeys('x <em class="k">a</em> y <em class="k">b</em>', 7);
  assert.equal(a.next, 9);
  assert.match(a.html, /\(7\)[\s\S]*\(8\)/);
  assert.match(P().blankKeys('<em class="k">a</em>').html, /\(1\)/);
});

test('blankKeys(): leaves html without key marks untouched', () => {
  const html = '<ul><li>plain <em>emphasis</em> and <b>bold</b></li></ul>';
  assert.deepEqual(P().blankKeys(html, 5), { html, answers: [], next: 5 });
  assert.deepEqual(P().blankKeys('', 3), { html: '', answers: [], next: 3 });
  assert.deepEqual(P().blankKeys(undefined, 3), { html: '', answers: [], next: 3 });
});

test('blankKeys(): matches the k class exactly (single quotes and extra classes are fine, key/kk are not)', () => {
  assert.equal(P().blankKeys("<em class='k'>a</em>", 1).answers.length, 1);
  assert.equal(P().blankKeys('<em class="hi k">a</em>', 1).answers.length, 1);
  assert.equal(P().blankKeys('<em class="key">a</em><em class="kk">b</em>', 1).answers.length, 0);
});

test('blankKeys(): keeps nested inline markup in the answer and handles several lines', () => {
  const r = P().blankKeys('<li>B = <em class="k">(1+d) × S<sub>0</sub>\n + 2Δf</em></li>\n<li>C = <em class="k">B·log<sub>2</sub>(1+SNR)</em></li>', 1);
  assert.deepEqual(r.answers, ['(1+d) × S<sub>0</sub>\n + 2Δf', 'B·log<sub>2</sub>(1+SNR)']);
  assert.equal(r.next, 3);
});

/* ---------- exam point summary ---------- */

test('examSummary(): each part is worth its blueprint points (quota or slots), however many items are assembled so far', () => {
  const exam = {
    id: 'X', kind: 'form', status: 'draft', title: 'T', points: 100,
    sections: [
      { id: 'mcq', type: 'mcq', title: 'Part I', each: 1, quota: { l01: 1, l02: 1 }, items: ['a', 'b'] },
      { id: 'ps', type: 'gen', title: 'Part II', slots: 3, pts: 5, items: [{ gen: 'g', params: {}, pts: 5 }, { gen: 'g', params: {}, pts: 5 }] },
      { id: 'essay', type: 'essay', title: 'Part III', each: 5, quota: { l02: 1, l03a: 1 }, items: [] }
    ]
  };
  const s = P().examSummary(exam);
  assert.deepEqual(s.parts.map((p) => [p.id, p.count, p.planned, p.pts, p.complete]), [
    ['mcq', 2, 2, 2, true], ['ps', 2, 3, 15, false], ['essay', 0, 2, 10, false]]);
  assert.equal(s.total, 27);
  assert.equal(s.assembled, false, 'a part that is not complete means the exam is not assembled');
  assert.equal(s.anyItems, true);
});

test('examSummary(): a complete exam, items beyond the blueprint, and the real forms', () => {
  const full = P().examSummary({ id: 'F', sections: [{ id: 'a', type: 'id', title: 'A', each: 2, quota: { l01: 2 }, items: ['x', 'y'] }] });
  assert.equal(full.assembled, true);
  assert.equal(full.total, 4);
  const over = P().examSummary({ id: 'F', sections: [{ id: 'a', type: 'id', title: 'A', each: 2, quota: { l01: 1 }, items: ['x', 'y', 'z'] }] });
  assert.equal(over.total, 6, 'every printed item is worth its points');
  const noBlueprint = P().examSummary({ id: 'F', sections: [{ id: 'a', type: 'tf', title: 'A', each: 1, items: ['x', 'y'] }] });
  assert.deepEqual([noBlueprint.parts[0].planned, noBlueprint.total, noBlueprint.assembled], [2, 2, true]);
  for (const id of ['A', 'B']) {
    const real = P().examSummary(KIT.exams.get(id));
    assert.equal(real.total, 100, `the Form ${id} blueprint adds up to 100 points`);
    assert.equal(real.anyItems, real.parts.some((p) => p.count > 0));
  }
});

/* ---------- cheat sheet data ---------- */

test('cheatData(): per lecture in order — formula cards (typeset equation, legend, use, slide example), then fact panels', () => {
  const d = P().cheatData();
  assert.deepEqual(d.topics.map((t) => t.id), KIT.TOPIC_IDS);
  for (const t of d.topics) {
    const topic = KIT.getTopic(t.id);
    const sheet = KIT.formulas({ topic: t.id, sheet: true });
    assert.deepEqual(t.formulas.map((f) => f.id), sheet.map((f) => f.id), t.id + ' formulas');
    for (const f of t.formulas) {
      assert.ok(f.tex && f.vars.length && f.use && f.example, f.id + ': a real equation with its legend, use and example');
      assert.deepEqual(KIT.math.check('$$' + f.tex + '$$'), [], f.id);
    }
    assert.deepEqual(t.panels.map((p) => p.title), topic ? (topic.cheat || []).map((c) => c.title) : [], t.id + ' panels');
    assert.equal(t.pending, !topic && sheet.length === 0, t.id + ' pending');
  }
});

test('cheatData(): the global panels are symbol clashes, mental-math tips (no calculator) and unit traps, with balanced html and key marks', () => {
  const g = P().cheatData().globals;
  assert.deepEqual(g.map((p) => p.title), ['Symbol clashes', 'Mental-math tips (no calculator)', 'Unit traps']);
  for (const p of g) {
    assert.deepEqual(KIT.schema.checkHtml(p.html, p.title), []);
    assert.ok(count(p.html, /<em class="k">/g) >= 2, p.title + ' needs key marks for the recall drill');
  }
  const all = g.map((p) => p.html).join(' ');
  for (const needle of ['Shannon', 'case factor', 'speed of light', 'doublings', '2¹⁰', '10^(dB/10)', '3 dB', '10 dB', '1000', '× 8', 'µs', 'ms']) {
    assert.ok(all.includes(needle), 'missing: ' + needle);
  }
});

test('cheatData({ blank: true }): each equation is blanked (its answer is the equation); the name and legend stay, the example is hidden', () => {
  const blanked = P().cheatData({ blank: true });
  const plain = P().cheatData();
  blanked.topics.forEach((t, i) => t.formulas.forEach((f, j) => {
    const orig = plain.topics[i].formulas[j];
    assert.ok(Number.isInteger(f.blank), f.id + ' has a blank number');
    assert.equal(f.tex, null, f.id + ': equation hidden');
    assert.equal(f.example, '', f.id + ': the example would show the equation');
    assert.equal(f.name, orig.name);
    assert.deepEqual(f.vars, orig.vars, f.id + ': the legend stays');
    assert.equal(blanked.answers[f.blank - 1], '$$' + orig.tex + '$$', f.id + ': the answer is the equation');
  }));
  for (const t of plain.topics) for (const f of t.formulas) assert.equal(f.blank, undefined, f.id);
});

test('cheatData({ blank: true }): blanks are numbered 1..n in reading order and every answer is listed', () => {
  const d = P().cheatData({ blank: true });
  const nums = [];
  const panelNums = (html) => [...html.matchAll(/\((\d+)\)<\/b>________/g)].map((m) => Number(m[1]));
  for (const t of d.topics) {
    for (const f of t.formulas) nums.push(f.blank);
    for (const p of t.panels) nums.push(...panelNums(p.html));
  }
  for (const p of d.globals) nums.push(...panelNums(p.html));
  assert.ok(nums.length > 5, 'there should be blanks to fill');
  assert.deepEqual(nums, nums.map((_, i) => i + 1), 'numbers run 1..n in reading order');
  assert.equal(d.answers.length, nums.length);
  assert.ok(d.answers.every((a) => typeof a === 'string' && a.trim().length > 0));
  assert.deepEqual(P().cheatData().answers, [], 'the plain cheat sheet has no answers list');
});

/* ---------- drawing drills ---------- */

test('drills: every worksheet item builds a valid problem that accepts its own answers; parts cover draw, scramble, decode and waves', () => {
  const parts = P().drills;
  assert.ok(Array.isArray(parts) && parts.length === 4, 'four parts');
  assert.deepEqual(parts.slice(0, 3).map((p) => [...new Set(p.items.map((it) => it.gen))]), [['l03a.draw'], ['l03a.scramble'], ['l03a.decode']]);
  assert.deepEqual([...new Set(parts[3].items.map((it) => it.gen))].sort(), ['l02.sketch', 'l03b.sketch', 'l04.sketch'], 'part D draws the waves');
  const schemes = new Set(parts[0].items.flatMap((it) => it.params.schemes));
  for (const s of ['nrzl', 'nrzi', 'rz', 'manchester', 'dmanchester', 'ami', '2b1q', 'mlt3']) assert.ok(schemes.has(s), 'draws ' + s);
  for (const part of parts) for (const it of part.items) {
    const p = KIT.gen.build(it.gen, it.params);
    assert.deepEqual(KIT.schema.problem(p, it.gen), [], it.gen + ' ' + JSON.stringify(it.params));
    for (const inp of p.inputs) assert.ok(KIT.grade.check(inp, KIT.grade.answerOf(inp)).ok, it.gen + ' accepts its own answer');
  }
  const scr = parts[1].items.map((it) => KIT.gen.build(it.gen, it.params));
  assert.ok(scr.every((p) => /B8ZS|HDB3/.test(p.prompt)), 'scrambling prompts name the code');
});

test('essay practice set: general-pool essays only (the mocks keep theirs), at least one per topic', () => {
  const list = P().practiceEssays();
  assert.ok(list.length >= 5, 'at least five essays');
  for (const q of list) {
    assert.equal(q.type, 'essay', q.id);
    assert.ok(!q.pool || q.pool === 'none', q.id + ' must not come from a mock or the diagnostic');
  }
  for (const t of KIT.TOPIC_IDS) assert.ok(list.some((q) => q.topic === t), 'an essay for ' + t);
});
