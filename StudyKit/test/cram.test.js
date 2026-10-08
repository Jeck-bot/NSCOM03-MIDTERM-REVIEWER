'use strict';
// content/cram.js — the Cram tab: the most important concepts first, the computational parts at the bottom (AUTHORING §3.10).
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadKit } = require('./helpers/load.js');
const KIT = loadKit();

test('schema.cram(): rejects an empty or partial cram sheet', () => {
  assert.match(KIT.schema.cram(null).join('\n'), /not registered/);
  const partial = { intro: '<p>x</p>', top: [], lectures: [{ topic: 'l02', big: '<p>b</p>', ideas: [] }], compute: [] };
  const errs = KIT.schema.cram(partial).join('\n');
  assert.match(errs, /top\[\] needs 8–20/);
  assert.match(errs, /l01 is missing/);
  assert.match(errs, /needs at least 4 ideas/);
  assert.match(errs, /compute\[\] required/);
});

const c = KIT.getCram();
test('the cram sheet: every lecture, concepts first, valid math, refs and formulas', { todo: c ? false : 'not written yet' }, () => {
  assert.ok(c, 'content/cram.js has not registered KIT.cram({...})');
  assert.deepEqual(KIT.schema.cram(c), []);
  const order = c.lectures.map((l) => l.topic);
  assert.deepEqual(order, KIT.TOPIC_IDS, 'lectures in lecture order');
  const formulas = new Set();
  c.compute.forEach((g) => g.recipes.forEach((r) => (r.formulas || []).forEach((id) => formulas.add(id))));
  const sheet = KIT.formulas({ sheet: true }).map((f) => f.id).filter((id) => !formulas.has(id));
  assert.deepEqual(sheet, [], 'every cheat-sheet formula appears in a recipe');
});
