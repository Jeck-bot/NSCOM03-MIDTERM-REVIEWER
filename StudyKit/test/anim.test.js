'use strict';
// js/anim/*.js — animations of worked examples (contract: docs/AUTHORING.md §3.9). Rendering is checked in the browser selftest.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadKit } = require('./helpers/load.js');
const KIT = loadKit();

const SEEDS = 25;

/** Every generator a worked example uses: topic pages (kind 'example') and walkthrough cards (item.example). */
function exampleGens() {
  const out = new Map();
  KIT.topics().forEach((t) => (t.sections || []).forEach((s) => { if (s.kind === 'example' && s.gen) out.set(s.gen, t.id + ': ' + s.title); }));
  KIT.walks().forEach((w) => w.parts.forEach((p) => p.items.forEach((it) => {
    if (it.example && it.example.gen && !out.has(it.example.gen)) out.set(it.example.gen, 'walk ' + w.id + ' slide ' + it.n);
  })));
  return out;
}

function checkFrames(id, p) {
  const prob = KIT.gen.build(id, p);
  const frames = KIT.anim.frames(id, p, prob);
  const where = id + ' ' + JSON.stringify(p).slice(0, 80);
  assert.ok(Array.isArray(frames) && frames.length >= 2, where + ': needs at least 2 frames');
  let lastStep = -1;
  frames.forEach((f, i) => {
    const w = where + ' frame ' + i;
    assert.equal(typeof f.render, 'function', w + ': render() missing');
    assert.ok(typeof f.caption === 'string' && f.caption.trim(), w + ': caption missing');
    assert.deepEqual(KIT.schema.checkHtml(f.caption, w + '.caption'), []);
    assert.ok(!KIT.schema.garbage(f.caption), w + ': caption contains undefined/NaN');
    if (f.step !== undefined) {
      assert.ok(Number.isInteger(f.step) && f.step >= 0 && f.step < prob.steps.length, w + ': step ' + f.step + ' is not a solution step index');
      assert.ok(f.step >= lastStep, w + ': steps must not go backwards');
      lastStep = f.step;
    }
  });
}

test('KIT.anim registry: frames() returns null for a generator without an animation', () => {
  assert.equal(typeof KIT.anim.register, 'function');
  assert.equal(KIT.anim.frames('no.such.gen', {}, {}), null);
});

KIT.anim.ids().forEach((id) => {
  test('animation ' + id + ': frames for every sample and ' + SEEDS + ' seeds', () => {
    const g = KIT.gen.get(id);
    assert.ok(g, 'animation registered for unknown generator ' + id);
    (g.samples || []).forEach((p) => checkFrames(id, p));
    if (typeof g.params === 'function') for (let s = 1; s <= SEEDS; s++) checkFrames(id, g.params(KIT.rng(s)));
  });
});

const missing = [...exampleGens().entries()].filter(([gen]) => !KIT.anim.has(gen)).map(([gen, where]) => gen + ' (' + where + ')');
test('every worked example is animated', { todo: missing.length ? 'not animated yet: ' + missing.join('; ') : false }, () => {
  assert.deepEqual(missing, []);
});
