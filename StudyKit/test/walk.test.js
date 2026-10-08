'use strict';
// content/walk/*.js — slide-by-slide walkthroughs (contract: docs/AUTHORING.md §3.7).
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadKit } = require('./helpers/load.js');
const KIT = loadKit();

// Every walkthrough file, the topic it belongs to and the deck slides it must cover.
const FILES = {
  'l01': ['l01', 1, 18],
  'l02-1': ['l02', 1, 19], 'l02-2': ['l02', 20, 39],
  'l03a-1': ['l03a', 1, 31], 'l03a-2': ['l03a', 32, 61],
  'l03b': ['l03b', 62, 96],
  'l04': ['l04', 1, 31]
};

const P = (s) => '<p>' + s + '</p>';
function fixture(over) {
  const w = {
    id: 'l04-9', topic: 'l04', range: [1, 3],
    parts: [{
      title: 'Opening', slides: [1, 3],
      items: [
        { n: 1, kind: 'admin', title: 'Title slide', says: 'Lecture 4 title slide.' },
        { n: [2, 3], title: 'ASK', says: P('Amplitude shift keying.'), means: P('$A_1 \\ne A_0$ carries the bit.'), why: P('First of three keyings.') }
      ],
      together: P('One carrier, one changed property.')
    }],
    terms: [{ term: 'Carrier test term', def: 'A test definition.', ref: 'L04 p2' }],
    keyTerms: ['Carrier test term'],
    faq: [1, 2, 3, 4].map((i) => ({ q: 'Question ' + i + '?', a: P('Answer ' + i + '.'), ref: 'L04 p' + i }))
  };
  return Object.assign(w, over || {});
}
const errs = (w) => KIT.schema.walk(w).join('\n');

test('schema.walk(): a well-formed walkthrough passes', () => {
  assert.deepEqual(KIT.schema.walk(fixture()), []);
});

test('schema.walk(): every slide exactly once, in order, inside contiguous parts', () => {
  const gap = fixture();
  gap.parts[0].items = [gap.parts[0].items[0], Object.assign({}, gap.parts[0].items[1], { n: 3 })];
  assert.match(errs(gap), /expected slide 2 next/);
  const overlap = fixture();
  overlap.parts[0].items = [Object.assign({}, overlap.parts[0].items[1], { n: [1, 2] }), Object.assign({}, overlap.parts[0].items[1], { n: 2 })];
  assert.match(errs(overlap), /expected slide 3 next/);
  const short = fixture({ range: [1, 4] });
  assert.match(errs(short), /range ends at 4/);
  const outside = fixture({ range: [30, 32] });
  assert.match(errs(outside), /outside l04/);
  const split = fixture();
  split.parts = [Object.assign({}, split.parts[0], { slides: [1, 1], items: [split.parts[0].items[0]] }),
    Object.assign({}, split.parts[0], { slides: [3, 3], items: [Object.assign({}, split.parts[0].items[1], { n: 3 })] })];
  assert.match(errs(split), /starts at slide 3, expected 2/);
});

test('schema.walk(): content slides need says, means and why; admin slides only says', () => {
  const noWhy = fixture();
  delete noWhy.parts[0].items[1].why;
  assert.match(errs(noWhy), /\.why: missing/);
  const busyAdmin = fixture();
  busyAdmin.parts[0].items[0].means = P('x');
  assert.match(errs(busyAdmin), /admin slides only have a title and says/);
  const noRecap = fixture();
  delete noRecap.parts[0].together;
  assert.match(errs(noRecap), /together: missing/);
});

test('schema.walk(): math, figures, examples, terms and FAQ are checked', () => {
  const badMath = fixture();
  badMath.parts[0].items[1].means = P('$\\frac{1}$');
  assert.match(errs(badMath), /math: missing denominator/);
  const badFig = fixture();
  badFig.parts[0].items[1].means = '<figure data-fig="l04.nope"></figure>';
  assert.match(errs(badFig), /unknown figure "l04\.nope"/);
  const badGen = fixture();
  badGen.parts[0].items[1].example = { title: 'X', gen: 'l04.nope', params: {} };
  assert.match(errs(badGen), /unknown generator "l04\.nope"/);
  const dupTerm = fixture();
  dupTerm.terms.push({ term: 'carrier TEST term', def: 'Again.', ref: 'L04 p3' });
  assert.match(errs(dupTerm), /duplicate term/);
  const badRef = fixture();
  badRef.faq[0].ref = 'L04 p99';
  assert.match(errs(badRef), /outside L04/);
  const fewFaq = fixture({ faq: [] });
  assert.match(errs(fewFaq), /faq\[\] needs 4–10 entries/);
});

function words(html) {
  return String(html || '').replace(/\$\$?[^$]*\$\$?/g, ' x ').replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;
}
function inputOf(p, name) {
  const nums = (p.inputs || []).filter((i) => i.kind === 'num');
  return name ? (p.inputs || []).find((i) => i.id === name) : nums[0];
}

Object.keys(FILES).forEach((id) => {
  const w = KIT.getWalk(id);
  test('walk ' + id + ': valid, covers its slides, examples build, deep enough', { todo: w ? false : 'not written yet' }, () => {
    assert.ok(w, 'content/walk/' + id + '.js has not registered KIT.walk({ id: "' + id + '" })');
    const [topic, a, b] = FILES[id];
    assert.equal(w.topic, topic);
    assert.deepEqual(w.range, [a, b]);
    assert.deepEqual(KIT.schema.walk(w), []);
    const content = [];
    w.parts.forEach((p) => p.items.forEach((it) => {
      if (it.kind !== 'admin') content.push(it);
      if (it.example && it.example.gen) {
        const x = it.example;
        const prob = KIT.gen.build(x.gen, x.params);
        assert.ok(prob && prob.prompt, 'example ' + x.gen + ' built nothing');
        if (x.slideValue !== undefined) {
          const inp = inputOf(prob, x.input);
          assert.ok(inp, 'example ' + x.title + ': no numeric input to compare slideValue with');
          const tol = x.slideTol === undefined ? 0.01 : x.slideTol;
          assert.ok(Math.abs(inp.answer - x.slideValue) <= tol * Math.max(1, Math.abs(x.slideValue)),
            'example ' + x.title + ': generator gives ' + inp.answer + ', slide says ' + x.slideValue);
        }
      }
    }));
    // Depth: "break everything down" — on average at least 100 words per content slide.
    const avg = content.reduce((s, it) => s + words(it.says) + words(it.means) + words(it.why), 0) / Math.max(1, content.length);
    assert.ok(avg >= 100, 'average ' + Math.round(avg) + ' words per content slide (need ≥ 100)');
    // Panel-sized definitions.
    w.terms.forEach((t) => assert.ok(words(t.def) <= 60, 'term "' + t.term + '": definition has ' + words(t.def) + ' words (≤ 60 fit the panel)'));
  });
});

test('walk terms are unique across all glossaries and walkthroughs; ★ key terms resolve', () => {
  // A walk term must be new: not a glossary term (any topic) and not defined by another walk file.
  const glossary = new Map(), walkNames = new Map(), clash = [];
  KIT.topics().forEach((t) => (t.glossary || []).forEach((g) => {
    [g.term].concat(g.alt || []).forEach((x) => glossary.set(x.toLowerCase(), t.id + ' glossary'));
  }));
  KIT.walks().forEach((w) => w.terms.forEach((g) => {
    [g.term].concat(g.alt || []).forEach((x) => {
      const k = x.toLowerCase();
      if (glossary.has(k)) clash.push('"' + x + '" (walk ' + w.id + ') is already in the ' + glossary.get(k));
      else if (walkNames.has(k) && walkNames.get(k) !== w.id) clash.push('"' + x + '" is defined in walks ' + w.id + ' and ' + walkNames.get(k));
      walkNames.set(k, w.id);
    });
  }));
  assert.deepEqual(clash, []);
  const known = new Set();
  KIT.topics().forEach((t) => (t.glossary || []).forEach((g) => { known.add(g.term.toLowerCase()); (g.alt || []).forEach((x) => known.add(x.toLowerCase())); }));
  KIT.walks().forEach((w) => w.terms.forEach((g) => { known.add(g.term.toLowerCase()); (g.alt || []).forEach((x) => known.add(x.toLowerCase())); }));
  const unknown = [];
  KIT.walks().forEach((w) => w.keyTerms.forEach((k) => { if (!known.has(k.toLowerCase())) unknown.push(w.id + ': "' + k + '"'); }));
  assert.deepEqual(unknown, [], 'keyTerms must name a glossary or walk term (or one of its alt names)');
});

const missing = Object.keys(FILES).filter((id) => !KIT.getWalk(id));
test('every topic is covered slide by slide, with no overlaps', { todo: missing.length ? 'not written yet: ' + missing.join(', ') : false }, () => {
  assert.deepEqual(missing, []);
  KIT.TOPIC_IDS.forEach((topic) => {
    const r = KIT.topicRange(topic);
    let next = r[0];
    KIT.walks(topic).forEach((w) => { assert.equal(w.range[0], next, topic + ': walk ' + w.id + ' should start at slide ' + next); next = w.range[1] + 1; });
    assert.equal(next, r[1] + 1, topic + ': walkthroughs end at slide ' + (next - 1) + ', topic ends at ' + r[1]);
  });
});
